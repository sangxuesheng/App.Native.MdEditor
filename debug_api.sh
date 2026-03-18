#!/bin/bash

OWNER="tingwen-img"
REPO="img0"
TOKEN="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"

echo "🔍 调试 API 响应..."
echo ""

# 检查仓库是否真的存在
echo "1️⃣  获取仓库信息 (原始响应):"
curl -s -i -H "Authorization: token $TOKEN" \
"https://api.github.com/repos/$OWNER/$REPO" | head -20
echo ""
echo ""

# 尝试获取根目录
echo "2️⃣  获取根目录内容 (原始响应):"
curl -s -i -H "Authorization: token $TOKEN" \
"https://api.github.com/repos/$OWNER/$REPO/contents/" | head -20
echo ""
echo ""

# 检查 token 权限
echo "3️⃣  检查 Token 权限:"
curl -s -H "Authorization: token $TOKEN" https://api.github.com/user/repos | python3 -c "import sys, json; d=json.load(sys.stdin); print(f'用户仓库数: {len(d) if isinstance(d, list) else \"Error\"}')" 2>/dev/null
