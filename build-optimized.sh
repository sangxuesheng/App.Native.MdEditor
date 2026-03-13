#!/bin/bash
# 一体化优化构建脚本 - 自动处理所有优化步骤

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   fpk 优化构建 - 自动化流程           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"

# 设置环境变量
export PATH=/var/apps/nodejs_v22/target/bin:$PATH
export NODE_ENV=production

PROJECT_ROOT="/vol4/1000/开发文件夹/mac"
cd "$PROJECT_ROOT"

# ============================================
# 步骤 1: 检查并配置镜像源（首次自动配置）
# ============================================
echo -e "\n${YELLOW}[1/7] 检查 npm 镜像源配置...${NC}"
CURRENT_REGISTRY=$(npm config get registry)
if [[ "$CURRENT_REGISTRY" != *"npmmirror"* ]]; then
    echo "  配置国内镜像源..."
    npm config set registry https://registry.npmmirror.com
    npm config set better_sqlite3_binary_host https://npmmirror.com/mirrors/better-sqlite3/
    npm config set prefer-offline true
    npm config set audit false
    npm config set fund false
    echo -e "${GREEN}✓ 镜像源配置完成${NC}"
else
    echo -e "${GREEN}✓ 镜像源已配置${NC}"
fi

# ============================================
# 步骤 2: 构建前端
# ============================================
echo -e "\n${YELLOW}[2/7] 构建前端...${NC}"
cd "$PROJECT_ROOT/app/ui/frontend"

# 检查前端依赖是否需要安装
if [ ! -d "node_modules" ]; then
    echo "  首次构建，安装前端依赖..."
    npm install
fi

npm run build
BUILD_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
echo -e "${GREEN}✓ 前端构建完成，产物: ${BUILD_SIZE}${NC}"

# ============================================
# 步骤 3: 临时备份前端 node_modules（避免打包）
# ============================================
echo -e "\n${YELLOW}[3/7] 临时移除前端 node_modules...${NC}"
if [ -d "node_modules" ]; then
    FRONTEND_SIZE=$(du -sh node_modules 2>/dev/null | cut -f1)
    echo "  移动 node_modules 到临时目录（${FRONTEND_SIZE}）"
    mv node_modules /tmp/frontend_node_modules_backup_$$
    echo -e "${GREEN}✓ 前端依赖已临时移除（不会打包）${NC}"
fi

# ============================================
# 步骤 4: 优化后端依赖（仅生产环境）
# ============================================
echo -e "\n${YELLOW}[4/7] 优化后端依赖...${NC}"
cd "$PROJECT_ROOT/app/server"

if [ -d "node_modules" ]; then
    BEFORE_SIZE=$(du -sh node_modules 2>/dev/null | cut -f1)
    echo "  当前后端依赖: ${BEFORE_SIZE}"
    
    # 备份 package-lock.json
    if [ -f "package-lock.json" ]; then
        cp package-lock.json /tmp/server_package_lock_backup_$$
    fi
    
    # 重新安装仅生产依赖
    rm -rf node_modules
    npm install --production --prefer-offline --no-audit --no-fund
    
    AFTER_SIZE=$(du -sh node_modules 2>/dev/null | cut -f1)
    echo -e "${GREEN}✓ 后端依赖优化: ${BEFORE_SIZE} → ${AFTER_SIZE}${NC}"
else
    echo "  安装后端生产依赖..."
    npm install --production --prefer-offline --no-audit --no-fund
    AFTER_SIZE=$(du -sh node_modules 2>/dev/null | cut -f1)
    echo -e "${GREEN}✓ 后端依赖安装完成: ${AFTER_SIZE}${NC}"
fi

# ============================================
# 步骤 5: 打包 fpk
# ============================================
echo -e "\n${YELLOW}[5/7] 打包 fpk...${NC}"
cd "$PROJECT_ROOT"

# 显示打包内容统计
echo "  统计打包内容..."
DIST_SIZE=$(du -sh app/ui/frontend/dist 2>/dev/null | cut -f1 || echo "N/A")
SERVER_SIZE=$(du -sh app/server/node_modules 2>/dev/null | cut -f1 || echo "N/A")
echo "  - 前端构建产物: ${DIST_SIZE}"
echo "  - 后端生产依赖: ${SERVER_SIZE}"

fnpack build

if [ -f "App.Native.MdEditor2.fpk" ]; then
    FPK_SIZE=$(ls -lh App.Native.MdEditor2.fpk | awk '{print $5}')
    echo -e "${GREEN}✓ fpk 打包完成: ${FPK_SIZE}${NC}"
else
    echo -e "${RED}✗ fpk 打包失败${NC}"
    # 恢复前端 node_modules
    if [ -d "/tmp/frontend_node_modules_backup_$$" ]; then
        mv /tmp/frontend_node_modules_backup_$$ "$PROJECT_ROOT/app/ui/frontend/node_modules"
    fi
    exit 1
fi

# ============================================
# 步骤 6: 恢复前端 node_modules
# ============================================
echo -e "\n${YELLOW}[6/7] 恢复前端开发环境...${NC}"
if [ -d "/tmp/frontend_node_modules_backup_$$" ]; then
    mv /tmp/frontend_node_modules_backup_$$ "$PROJECT_ROOT/app/ui/frontend/node_modules"
    echo -e "${GREEN}✓ 前端 node_modules 已恢复${NC}"
fi

# 恢复后端完整依赖（包含开发依赖）
cd "$PROJECT_ROOT/app/server"
if [ -f "/tmp/server_package_lock_backup_$$" ]; then
    mv /tmp/server_package_lock_backup_$$ package-lock.json
fi
echo "  恢复后端完整依赖（包含开发依赖）..."
npm install --prefer-offline --no-audit --no-fund
echo -e "${GREEN}✓ 后端开发环境已恢复${NC}"

# ============================================
# 步骤 7: 安装并启动应用
# ============================================
echo -e "\n${YELLOW}[7/7] 安装并启动应用...${NC}"
cd "$PROJECT_ROOT"

# 停止旧应用
appcenter-cli stop App.Native.MdEditor2 2>/dev/null || true
sleep 1

# 安装新版本
echo "  安装 fpk..."
appcenter-cli install-fpk App.Native.MdEditor2.fpk

# 启动应用
echo "  启动应用..."
sleep 2
appcenter-cli start App.Native.MdEditor2
sleep 3

# 健康检查
if curl -s http://localhost:18080/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 应用启动成功！${NC}"
else
    echo -e "${YELLOW}⚠ 应用可能需要更多时间启动...${NC}"
fi

# ============================================
# 显示优化结果
# ============================================
echo -e "\n${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          构建部署完成                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo -e "${GREEN}fpk 包大小: ${FPK_SIZE}${NC}"
echo -e "${GREEN}访问地址: http://192.168.2.2:18080/${NC}"
echo ""
echo -e "${YELLOW}优化说明：${NC}"
echo "• 前端 node_modules 未打包（节省 ~312MB）"
echo "• 后端仅打包生产依赖（节省 ~75MB）"
echo "• 使用国内镜像源（下载速度提升 5-10倍）"
echo "• 预计安装时间: 30-50秒（原 2-3分钟）"
