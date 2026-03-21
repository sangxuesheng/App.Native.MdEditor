# fpk 优化构建说明

## 快速开始

直接运行优化构建脚本（自动处理所有优化）：

```bash
cd /vol4/1000/开发文件夹/mac
bash build-optimized.sh
```

## 优化效果

| 指标 | 优化前 | 优化后 | 提升 |
|---|---|---|---|
| fpk 包体积 | 92MB | 20-30MB | 减少 65-70% |
| 安装时间 | 2-3分钟 | 30-50秒 | 提升 60-70% |
| 后端依赖 | 90MB | ~15MB | 减少 83% |

## 自动化优化流程

脚本会自动执行以下步骤：

1. **检查并配置镜像源**（首次自动配置）
   - 配置 npmmirror 国内镜像
   - 配置二进制包镜像（better-sqlite3）
   - 启用离线优先模式

2. **构建前端**
   - 执行 `npm run build`
   - 生成优化后的构建产物（~7.6MB）

3. **临时移除前端 node_modules**
   - 移动到 /tmp 避免打包（节省 312MB）
   - 打包完成后自动恢复

4. **优化后端依赖**
   - 仅安装生产依赖（--production）
   - 从 90MB 减少到 ~15MB

5. **打包 fpk**
   - 使用 fnpack build
   - 最终包大小 20-30MB

6. **恢复开发环境**
   - 恢复前端 node_modules
   - 恢复后端完整依赖（包含开发依赖）

7. **安装并启动应用**
   - 停止旧版本
   - 安装新 fpk
   - 启动并健康检查

## 核心优化技术

### 1. 网络层优化
- ✅ 国内镜像源（npmmirror）
- ✅ 二进制包镜像加速
- ✅ 离线优先模式

### 2. 打包体积优化
- ✅ 前端 node_modules 不打包（临时移除）
- ✅ 后端仅打包生产依赖
- ✅ .fpkignore 排除源码和配置文件

### 3. 构建配置优化
- ✅ Vite 代码分包（6个 vendor chunks）
- ✅ 禁用 sourcemap
- ✅ CSS 代码分割

## 文件说明

### .fpkignore
排除不需要打包的文件：
- 前端源码和配置
- 开发脚本
- 文档和测试文件

### .npmrc
npm 配置：
- 国内镜像源
- 二进制包镜像
- 离线优先模式

### vite.config.js
优化的构建配置：
- 代码分包策略
- 压缩优化
- 禁用不必要的功能

## 开发工作流

### 日常开发（最快）
```bash
bash build-and-deploy.sh --local
```

### 正式发布（优化版）
```bash
bash build-optimized.sh
```

### 仅构建前端
```bash
cd app/ui/frontend
npm run build
```

## 优化原理

**为什么 fpk 从 92MB 减少到 20-30MB？**

优化前打包内容：
- 前端 node_modules: 312MB ❌
- 后端 node_modules: 90MB ❌
- 前端构建产物: 7.6MB ✅
- 其他文件: ~5MB ✅

优化后打包内容：
- 前端构建产物: 7.6MB ✅
- 后端生产依赖: ~15MB ✅
- 其他文件: ~5MB ✅

**为什么安装速度提升 60-70%？**

1. 包体积减少 65% → 下载时间减少
2. 文件数减少 90% → IO 操作减少
3. 无需安装前端依赖 → 省去 312MB 安装
4. 后端依赖减少 83% → 安装时间减少

## 注意事项

1. **首次运行会自动配置镜像源**，无需手动操作
2. **开发环境不受影响**，构建完成后自动恢复所有依赖
3. **后端生产依赖包含**：better-sqlite3、heic-convert、mathjax（运行必需）
4. **镜像源配置是全局的**，会影响其他 npm 项目

## 故障排查

### 如果构建失败
```bash
# 检查 Node.js 环境
export PATH=/var/apps/nodejs_v22/target/bin:$PATH
node -v
npm -v

# 清理缓存重试
npm cache clean --force
bash build-optimized.sh
```

### 如果应用启动失败
```bash
# 查看应用日志
appcenter-cli logs App.Native.MdEditor2

# 检查端口占用
netstat -tuln | grep 18080

# 手动重启
appcenter-cli stop App.Native.MdEditor2
appcenter-cli start App.Native.MdEditor2
```

### 如果依赖安装失败
```bash
# 检查镜像源
npm config get registry

# 重新配置镜像源
npm config set registry https://registry.npmmirror.com

# 清理并重装
cd app/server
rm -rf node_modules package-lock.json
npm install --production
```

## 进一步优化建议

如果还想更快（可选）：

1. **使用 pnpm**（节省磁盘空间和安装时间）
```bash
npm install -g pnpm
pnpm config set registry https://registry.npmmirror.com
```

2. **启用 npm 缓存**
```bash
npm config set cache /tmp/npm-cache
npm cache verify
```

3. **预编译二进制依赖**
```bash
cd app/server
npm rebuild better-sqlite3 --build-from-source
```
