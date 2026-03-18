#!/bin/bash
# 测试 GitHub 图床 - 修复版本（使用环境变量 Token）

OWNER="tingwen-img"
REPO="img0"
BRANCH="main"

echo "🔍 测试修复后的 GitHub 图床功能..."
echo ""

# 验证 token
echo "1️⃣  验证 Token..."
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ 错误：未设置 GITHUB_TOKEN 环境变量"
    echo "请设置环境变量：export GITHUB_TOKEN=your_token_here"
    exit 1
fi

TOKEN="$GITHUB_TOKEN"
USER_INFO=$(curl -s -H "Authorization: token $TOKEN" https://api.github.com/user)

if [ $# -ne 1 ]; then
    echo "用法：$0 图片文件"
    exit 1
fi

FILE="$1"

# 检查 token 是否有效
if echo "$USER_INFO" | grep -q "message"; then
    echo "❌ Token 验证失败：$(echo "$USER_INFO" | jq -r '.message')"
    echo "请检查您的 GITHUB_TOKEN 是否正确"
    exit 1
fi

echo "✅ Token 验证成功！"
echo "👤 已登录用户：$(echo "$USER_INFO" | jq -r '.login')"
echo ""

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

# 上传到 GitHub（直接在根目录）
RESPONSE=$(curl -s -X PUT \
"https://api.github.com/repos/$OWNER/$REPO/contents/$NEW_NAME" \
-H "Authorization: token $TOKEN" \
-H "Content-Type: application/json" \
-d "{\"message\":\"upload $NEW_NAME\",\"content\":\"$CONTENT\",\"branch\":\"$BRANCH\"}")

echo ""
echo "📋 API 响应："
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"

# 检查是否成功
if echo "$RESPONSE" | grep -q '"sha"'; then
    echo ""
    echo "✅ 上传成功！"
    echo ""
    echo "🔗 CDN 链接（jsDelivr）："
    echo "https://cdn.jsdelivr.net/gh/$OWNER/$REPO/$NEW_NAME"
    echo ""
    echo "🔗 GitHub 原始链接："
    echo "https://raw.githubusercontent.com/$OWNER/$REPO/$BRANCH/$NEW_NAME"
    echo ""
    echo "🔗 GitHub 页面链接："
    echo "https://github.com/$OWNER/$REPO/blob/$BRANCH/$NEW_NAME"
else
    echo ""
    echo "❌ 上传失败！"
    exit 1
fi
