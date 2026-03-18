#!/bin/bash

OWNER="tingwen-img"
TOKEN="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"

echo "🔍 检查 GitHub 账户信息..."
echo ""

# 检查 token 有效性
echo "1️⃣  验证 Token..."
RESPONSE=$(curl -s -H "Authorization: token $TOKEN" https://api.github.com/user)
if echo "$RESPONSE" | grep -q '"login"'; then
    LOGIN=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin).get('login', 'Unknown'))" 2>/dev/null)
    echo "✅ Token 有效，登录用户: $LOGIN"
else
    echo "❌ Token 无效或过期"
    echo "$RESPONSE"
fi
echo ""

# 列出所有仓库
echo "2️⃣  列出 $OWNER 的所有仓库..."
REPOS=$(curl -s -H "Authorization: token $TOKEN" "https://api.github.com/users/$OWNER/repos?per_page=100")
echo "$REPOS" | python3 << 'PYTHON'
import sys, json
try:
    data = json.load(sys.stdin)
    if isinstance(data, list):
        if len(data) == 0:
            print("❌ 没有找到仓库")
        else:
            print(f"✅ 找到 {len(data)} 个仓库:")
            for repo in data:
                print(f"   - {repo['name']}")
    else:
        print("❌ 错误:", data.get('message', 'Unknown error'))
except:
    print("❌ 解析失败")
PYTHON
echo ""

# 检查 img0 仓库
echo "3️⃣  检查 img0 仓库..."
REPO_INFO=$(curl -s -H "Authorization: token $TOKEN" "https://api.github.com/repos/$OWNER/img0")
if echo "$REPO_INFO" | grep -q '"id"'; then
    echo "✅ img0 仓库存在"
    echo "$REPO_INFO" | python3 -c "import sys, json; d=json.load(sys.stdin); print(f'   URL: {d.get(\"html_url\")}'); print(f'   Private: {d.get(\"private\")}'); print(f'   Default branch: {d.get(\"default_branch\")}')" 2>/dev/null
else
    echo "❌ img0 仓库不存在或无法访问"
    echo "$REPO_INFO" | python3 -c "import sys, json; d=json.load(sys.stdin); print(f'   错误: {d.get(\"message\")}')" 2>/dev/null
fi
