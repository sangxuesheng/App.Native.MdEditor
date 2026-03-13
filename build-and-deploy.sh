#!/bin/bash
# =============================================================================
#  Markdown 编辑器 - 一体化构建部署脚本
#  整合：前端构建 -> fnpack 打包 -> appcenter-cli 安装 -> 启动验证
#
#  用法：
#    bash build-and-deploy.sh            # 完整流程（构建+打包+安装+启动）
#    bash build-and-deploy.sh --build    # 仅构建前端
#    bash build-and-deploy.sh --pack     # 仅 fnpack 打包（跳过前端构建）
#    bash build-and-deploy.sh --install  # 仅安装已有的 fpk
#    bash build-and-deploy.sh --local    # install-local 开发快速模式
#    bash build-and-deploy.sh --restart  # 仅重启应用（不重新构建）
# =============================================================================

set -e

# ----------------------------------------------------------------------------
# 配置区 —— 按项目实际情况修改
# ----------------------------------------------------------------------------
APP_NAME="App.Native.MdEditor2"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/app/ui/frontend"
SERVICE_URL="http://localhost:18080/health"

# Node.js 路径（飞牛 NAS 环境）
export PATH=/var/apps/nodejs_v22/target/bin:$PATH
export PATH=/var/apps/python312/target/bin:$PATH

# ----------------------------------------------------------------------------
# 工具函数
# ----------------------------------------------------------------------------
log_step() { echo ""; echo "══════════════════════════════════════════"; echo "  $1"; echo "══════════════════════════════════════════"; }
log_ok()   { echo "✅ $1"; }
log_err()  { echo "❌ $1"; }
log_info() { echo "   $1"; }

check_node() {
    if ! command -v node &> /dev/null; then
        log_err "未找到 Node.js，请确认 PATH 设置"
        log_info "飞牛 NAS: export PATH=/var/apps/nodejs_v22/target/bin:\$PATH"
        exit 1
    fi
    log_ok "Node.js $(node --version)  npm $(npm --version)"
}

check_fnpack() {
    if ! command -v fnpack &> /dev/null; then
        log_err "未找到 fnpack，请先安装："
        log_info "chmod +x fnpack-1.2.1-linux-amd64"
        log_info "sudo mv fnpack-1.2.1-linux-amd64 /usr/local/bin/fnpack"
        exit 1
    fi
    log_ok "fnpack $(fnpack --version 2>/dev/null || echo '已就绪')"
}

check_appcenter() {
    if ! command -v appcenter-cli &> /dev/null; then
        log_err "未找到 appcenter-cli（仅飞牛 NAS 系统预装，本地环境无此工具）"
        exit 1
    fi
    log_ok "appcenter-cli 已就绪"
}

# ----------------------------------------------------------------------------
# 步骤 1：构建前端
# ----------------------------------------------------------------------------
do_build() {
    log_step "步骤 1 / 构建前端"
    check_node
    cd "$FRONTEND_DIR"
    if [ ! -d "node_modules" ]; then
        log_info "安装依赖..."
        npm install --legacy-peer-deps
    else
        log_info "依赖已存在，跳过 npm install"
    fi
    log_info "执行 npm run build ..."
    npm run build
    if [ -d "dist" ]; then
        log_ok "前端构建成功 → $FRONTEND_DIR/dist"
    else
        log_err "构建产物 dist/ 不存在，构建失败"
        exit 1
    fi
    cd "$SCRIPT_DIR"
}

# ----------------------------------------------------------------------------
# 步骤 2：fnpack 打包
# ----------------------------------------------------------------------------
do_pack() {
    log_step "步骤 2 / fnpack 打包"
    check_fnpack
    cd "$SCRIPT_DIR"
    # 校验必要文件（与 fnpack build 校验规则一致）
    for f in manifest config/privilege config/resource ICON.PNG ICON_256.PNG; do
        [ -e "$f" ] || { log_err "缺少必要文件: $f"; exit 1; }
    done
    for d in app cmd wizard; do
        [ -d "$d" ] || { log_err "缺少必要目录: $d/"; exit 1; }
    done
    fnpack build
    FPK_FILE=$(ls -t *.fpk 2>/dev/null | head -1)
    if [ -n "$FPK_FILE" ]; then
        log_ok "打包成功 → $FPK_FILE  ($(du -sh "$FPK_FILE" | cut -f1))"
    else
        log_err "未找到 .fpk 文件，打包可能失败"
        exit 1
    fi
}

# ----------------------------------------------------------------------------
# 步骤 3a：install-fpk 安装
# ----------------------------------------------------------------------------
do_install_fpk() {
    log_step "步骤 3 / appcenter-cli 安装 fpk"
    check_appcenter
    cd "$SCRIPT_DIR"
    FPK_FILE=$(ls -t *.fpk 2>/dev/null | head -1)
    if [ -z "$FPK_FILE" ]; then
        log_err "未找到 .fpk 文件，请先执行打包步骤"
        exit 1
    fi
    log_info "安装: $FPK_FILE"
    appcenter-cli install-fpk "$FPK_FILE"
    log_ok "安装完成"
}

# ----------------------------------------------------------------------------
# 步骤 3b：快速安装（fnpack build + install-fpk 静默模式）
# 说明：install-local 在重装已存在应用时会报 code 10234，
#       改用 fnpack build + install-fpk --env config.env 静默安装更可靠。
# ----------------------------------------------------------------------------
do_install_local() {
    log_step "步骤 3 / 快速安装（fnpack + install-fpk 静默模式）"
    check_fnpack
    check_appcenter
    cd "$SCRIPT_DIR"

    # 打包
    log_info "执行 fnpack build..."
    fnpack build
    FPK_FILE=$(ls -t *.fpk 2>/dev/null | head -1)
    if [ -z "$FPK_FILE" ]; then
        log_err "未找到 .fpk 文件，打包失败"
        return 1
    fi
    log_ok "打包成功 → $FPK_FILE  ($(du -sh "$FPK_FILE" | cut -f1))"

    # 静默安装：若存在 config.env 则使用静默模式，否则交互安装
    if [ -f "$SCRIPT_DIR/config.env" ]; then
        log_info "使用 config.env 静默安装..."
        appcenter-cli install-fpk "$FPK_FILE" --env "$SCRIPT_DIR/config.env"
    else
        log_info "未找到 config.env，使用交互模式安装..."
        appcenter-cli install-fpk "$FPK_FILE"
    fi

    log_ok "安装完成"
}

# ----------------------------------------------------------------------------
# 步骤 4：重启并验证
# ----------------------------------------------------------------------------
do_restart() {
    log_step "步骤 4 / 重启应用并验证"
    check_appcenter
    appcenter-cli stop  "$APP_NAME" 2>/dev/null && log_info "已停止 $APP_NAME" || log_info "应用未在运行，跳过停止"
    sleep 2
    appcenter-cli start "$APP_NAME"
    log_ok "已启动 $APP_NAME"
    log_info "等待服务就绪..."
    sleep 5
    if curl -sf "$SERVICE_URL" &>/dev/null; then
        log_ok "服务健康检查通过 → $SERVICE_URL"
    else
        log_info "⚠ 健康检查未响应，请手动验证: $SERVICE_URL"
    fi
}

# ----------------------------------------------------------------------------
# 参数解析 & 主流程
# ----------------------------------------------------------------------------
cd "$SCRIPT_DIR"

case "${1:-}" in
    --build)
        do_build
        ;;
    --pack)
        do_pack
        ;;
    --install)
        do_install_fpk
        do_restart
        ;;
    --local)
        do_build
        if do_install_local; then
            do_restart
        else
            log_err "install-local 失败，已停止后续重启步骤"
            exit 1
        fi
        ;;
    --restart)
        do_restart
        ;;
    "")
        # 默认：完整流程
        echo ""
        echo "╔══════════════════════════════════════════╗"
        echo "║  Markdown 编辑器  完整构建部署           ║"
        echo "║  $APP_NAME"
        echo "╚══════════════════════════════════════════╝"
        do_build
        do_pack
        
        # 优先尝试 install-local（开发快速模式），失败则回退到 install-fpk
        if do_install_local; then
            log_ok "使用 install-local 安装成功"
        else
            log_info "install-local 失败，回退到 install-fpk..."
            do_install_fpk
        fi
        
        do_restart
        echo ""
        echo "══════════════════════════════════════════"
        echo "  🎉 全部完成！"
        echo "  应用: $APP_NAME"
        FPK_FILE=$(ls -t *.fpk 2>/dev/null | head -1)
        [ -n "$FPK_FILE" ] && echo "  包文件: $FPK_FILE"
        echo "  访问: http://192.168.2.2:18080/"
        echo "══════════════════════════════════════════"
        ;;
    *)
        echo "用法: bash build-and-deploy.sh [选项]"
        echo ""
        echo "选项:"
        echo "  (无参数)   完整流程：构建前端 + fnpack 打包 + 安装 + 重启"
        echo "  --build    仅构建前端"
        echo "  --pack     仅 fnpack 打包（跳过前端构建）"
        echo "  --install  仅安装已有的 fpk + 重启"
        echo "  --local    构建前端 + install-local（开发快速模式）+ 重启"
        echo "  --restart  仅重启应用"
        echo ""
        echo "示例:"
        echo "  bash build-and-deploy.sh             # 正式发布"
        echo "  bash build-and-deploy.sh --local     # 开发调试（最快）"
        echo "  bash build-and-deploy.sh --restart   # 仅重启服务"
        exit 1
        ;;
esac
