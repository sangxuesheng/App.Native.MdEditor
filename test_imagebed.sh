#!/bin/bash
# 测试 GitHub 图床 - 仅使用 img0 仓库

OWNER="tingwen-img"
TOKEN="${GITHUB_TOKEN}"
PATH_IN_REPO="img/"
BRANCH="main"
REPO="img0"

echo "🔍 测试 GitHub 图床功能..."
echo ""

# 验证 token
echo "1️⃣  验证 Token..."
if [ -z "$TOKEN" ]; then
    echo "❌ 错误：未设置 GITHUB_TOKEN 环境变量"
    echo "请先运行：export GITHUB_TOKEN=your_token_here"
    exit 1
fi

USER_INFO=$(curl -s -H "Authorization: token $TOKEN" https://api.github.com/user)
LOGIN=$(echo "$USER_INFO" | jq -r '.login' 2>/dev/null)

if [ "$LOGIN" = "null" ] || [ -z "$LOGIN" ]; then
    echo "❌ 错误：GitHub Token 无效或权限不足"
    echo "请确保已设置有效的 GITHUB_TOKEN 环境变量"
    exit 1
fi

echo "✅ 已登录为：$LOGIN"
echo ""
echo "2️⃣  准备上传..."

if [ $# -ne 1 ]; then
    echo "用法：$0 图片文件"
    exit 1
fi

FILE="$1"

# 检查文件是否存在
if [ ! -f "$FILE" ]; then
    echo "❌ 文件不存在：$FILE"
    exit 1
fi

EXT="${FILE##*.}"
TS=$(date +%Y%m%d_%H%M%S)
NEW_NAME="${TS}_$RANDOM.$EXT"

echo "📤 开始上传..."
echo "文件：$FILE"
echo "目标仓库：$REPO"
echo "新文件名：$NEW_NAME"

# base64 编码
CONTENT=$(base64 -w 0 "$FILE")

# 上传到 GitHub
RESPONSE=$(curl -s -X POST \
"https://api.github.com/repos/$OWNER/$REPO/contents/$PATH_IN_REPO$NEW_NAME" \
-H "Authorization: token $TOKEN" \
-H "Content-Type: application/json" \
-d "{\"message\":\"upload $NEW_NAME\",\"content\":\"$CONTENT\"}")

echo ""
echo "📋 API 响应："
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"

# 检查是否成功
if echo "$RESPONSE" | grep -q '"sha"'; then
    echo ""
    echo "✅ 上传成功！"
    echo ""
    echo "🔗 CDN 链接："
    echo "https://cdn.jsdelivr.net/gh/$OWNER/$REPO/$PATH_IN_REPO$NEW_NAME"
    echo ""
    echo "🔗 GitHub 原始链接："
    echo "https://raw.githubusercontent.com/$OWNER/$REPO/$BRANCH/$PATH_IN_REPO$NEW_NAME"
else
    echo ""
    echo "❌ 上传失败！"
    exit 1
fi
