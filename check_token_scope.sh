#!/bin/bash

TOKEN="${GITHUB_TOKEN}"
OWNER="tingwen-img"

echo "🔍 检查 GitHub Token 权限范围..."
echo ""

# 验证 token 是否有效
echo "1️⃣  验证 Token 有效性..."
USER_INFO=$(curl -s -H "Authorization: token $TOKEN" https://api.github.com/user)
if echo "$USER_INFO" | grep -q '"message"'; then
    echo "❌ Token 无效: $(echo "$USER_INFO" | jq -r '.message')"
    exit 1
fi

echo "✅ Token 有效"
echo ""

# 获取 token 信息
echo "$USER_INFO" | python3 << 'PYTHON'
import sys, json
data = json.load(sys.stdin)
print(f"✅ 登录用户: {data.get('login')}")
print(f"   用户 ID: {data.get('id')}")
print(f"   公开仓库数: {data.get('public_repos')}")
print(f"   私有仓库数: {data.get('total_private_repos')}")
PYTHON
echo ""

# 检查 token 的 scopes
echo "Token Scopes (从响应头):"
curl -s -i -H "Authorization: token $TOKEN" https://api.github.com/user 2>&1 | grep -i "x-oauth-scopes"
echo ""

# 尝试列出用户的仓库
echo "用户的仓库列表:"
curl -s -H "Authorization: token $TOKEN" "https://api.github.com/user/repos?per_page=10" | python3 << 'PYTHON'
import sys, json
data = json.load(sys.stdin)
if isinstance(data, list):
    print(f"✅ 找到 {len(data)} 个仓库:")
    for repo in data:
        print(f"   - {repo['full_name']} (private: {repo['private']})")
else:
    print(f"❌ 错误: {data.get('message')}")
PYTHON
