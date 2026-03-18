#!/bin/bash

OWNER="tingwen-img"
TOKEN="${GITHUB_TOKEN}"

echo "🔍 调试 GitHub 图床配置..."
echo ""

# 测试 API 连接
echo "1️⃣  测试 GitHub API 连接..."
USER_INFO=$(curl -s -H "Authorization: token $TOKEN" https://api.github.com/user)
if echo "$USER_INFO" | grep -q '"login"'; then
    LOGIN=$(echo "$USER_INFO" | grep -o '"login":"[^"]*' | cut -d'"' -f4)
    echo "✅ GitHub API 连接成功，当前用户：$LOGIN"
else
    echo "❌ GitHub API 连接失败，Token 无效或过期"
    echo "$USER_INFO" | jq . 2>/dev/null || echo "$USER_INFO"
fi

echo ""

# 检查仓库是否存在
echo "2️⃣ 检查仓库 $OWNER/$REPO 是否存在..."
REPO_INFO=$(curl -s -H "Authorization: token $TOKEN" https://api.github.com/repos/$OWNER/$REPO)
if echo "$REPO_INFO" | grep -q '"id"'; then
    echo "✅ 仓库存在"
    echo "$REPO_INFO" | jq '{name, full_name, private, permissions}' 2>/dev/null
else
    echo "❌ 仓库不存在或无权限访问"
    echo "$REPO_INFO" | jq . 2>/dev/null || echo "$REPO_INFO"
fi

echo ""

# 检查 img/ 目录是否存在
echo "3️⃣ 检查 img/ 目录..."
DIR_INFO=$(curl -s -H "Authorization: token $TOKEN" https://api.github.com/repos/$OWNER/$REPO/contents/img/)
if echo "$DIR_INFO" | grep -q '"type"'; then
    echo "✅ img/ 目录存在"
    echo "$DIR_INFO" | jq '.[0:3]' 2>/dev/null
else
    echo "⚠️  img/ 目录可能不存在或为空"
    echo "$DIR_INFO" | jq . 2>/dev/null || echo "$DIR_INFO"
fi

