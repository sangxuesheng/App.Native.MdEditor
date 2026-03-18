#!/bin/bash

TOKEN="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"

echo "🔐 检查 Token 权限范围..."
echo ""

# 获取 token 信息
curl -s -H "Authorization: token $TOKEN" https://api.github.com/user | python3 << 'PYTHON'
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
