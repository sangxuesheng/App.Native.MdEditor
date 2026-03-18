#!/bin/bash

TOKEN="${GITHUB_TOKEN}"
OWNER="tingwen-img"
REPO="img0"

echo "🔍 详细调试..."
echo ""

# 测试基本连接
echo "1️⃣  测试 GitHub API 连接..."
curl -v -H "Authorization: token $TOKEN" \
"https://api.github.com/repos/$OWNER/$REPO" 2>&1 | head -30
