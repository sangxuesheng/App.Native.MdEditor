#!/bin/bash

TOKEN="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"
OWNER="tingwen-img"
REPO="img0"

echo "🔍 详细调试..."
echo ""

# 测试基本连接
echo "1️⃣  测试 GitHub API 连接..."
curl -v -H "Authorization: token $TOKEN" \
"https://api.github.com/repos/$OWNER/$REPO" 2>&1 | head -30
