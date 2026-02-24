#!/bin/bash

# 构建脚本 - 添加新功能后的完整构建
# 功能：另存为、导出、设置

set -e

echo "=========================================="
echo "  Markdown 编辑器 - 完整构建"
echo "=========================================="
echo ""

# 设置 Node.js 环境
export PATH=/var/apps/nodejs_v22/target/bin:$PATH

# 进入前端目录
cd "$(dirname "$0")/app/ui/frontend"

echo "📦 安装依赖..."
npm install --legacy-peer-deps

echo ""
echo "🔨 构建前端..."
npm run build

echo ""
echo "✅ 构建完成！"
echo ""
echo "新增功能："
echo "  ✅ 另存为功能"
echo "  ✅ 导出功能 (HTML/Markdown/TXT)"
echo "  ✅ 设置对话框"
echo "  ✅ 主题切换优化"
echo ""
echo "下一步："
echo "  1. 使用 fnpack build 打包应用"
echo "  2. 使用 appcenter-cli 安装测试"
echo ""

