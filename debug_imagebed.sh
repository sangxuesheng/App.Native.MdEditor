#!/bin/bash

OWNER="tingwen-img"
TOKEN="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"
REPO="img0"

echo "🔍 调试信息："
echo ""

# 1. 测试 Token 有效性
echo "1️⃣ 测试 Token 有效性..."
RESPONSE=$(curl -s -H "Authorization: token $TOKEN" https://api.github.com/user)
if echo "$RESPONSE" | grep -q '"login"'; then
    LOGIN=$(echo "$RESPONSE" | grep -o '"login":"[^"]*' | cut -d'"' -f4)
    echo "✅ Token 有效，当前用户：$LOGIN"
else
    echo "❌ Token 无效或过期"
    echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
fi

echo ""

# 2. 检查仓库是否存在
echo "2️⃣ 检查仓库 $OWNER/$REPO 是否存在..."
REPO_RESPONSE=$(curl -s -H "Authorization: token $TOKEN" https://api.github.com/repos/$OWNER/$REPO)
if echo "$REPO_RESPONSE" | grep -q '"id"'; then
    echo "✅ 仓库存在"
    echo "$REPO_RESPONSE" | jq '{name, full_name, private, permissions}' 2>/dev/null
else
    echo "❌ 仓库不存在或无权限访问"
    echo "$REPO_RESPONSE" | jq . 2>/dev/null || echo "$REPO_RESPONSE"
fi

echo ""

# 3. 检查 img/ 目录是否存在
echo "3️⃣ 检查 img/ 目录..."
DIR_RESPONSE=$(curl -s -H "Authorization: token $TOKEN" https://api.github.com/repos/$OWNER/$REPO/contents/img/)
if echo "$DIR_RESPONSE" | grep -q '"type"'; then
    echo "✅ img/ 目录存在"
    echo "$DIR_RESPONSE" | jq '.[0:3]' 2>/dev/null
else
    echo "⚠️  img/ 目录可能不存在或为空"
    echo "$DIR_RESPONSE" | jq . 2>/dev/null || echo "$DIR_RESPONSE"
fi

