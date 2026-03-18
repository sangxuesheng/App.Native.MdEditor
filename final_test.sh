#!/bin/bash

OWNER="tingwen-img"
REPO="img0"
TOKEN="${GITHUB_TOKEN}"

echo "📋 获取仓库根目录内容..."
echo ""

# 获取根目录内容
CONTENTS=$(curl -s -H "Authorization: token $TOKEN" \
"https://api.github.com/repos/$OWNER/$REPO/contents/")

echo "$CONTENTS" | python3 << 'PYTHON'
import sys, json
data = json.load(sys.stdin)
if isinstance(data, list):
    print(f"✅ 仓库根目录包含 {len(data)} 项:")
    for item in data:
        print(f"   - {item['name']} ({item['type']})")
else:
    print(f"❌ 错误: {data}")
PYTHON
echo ""

# 现在尝试上传到根目录
echo "📤 测试上传到根目录..."
TEST_FILE="test_$$.txt"
echo "GitHub imagebed test - $(date)" > "$TEST_FILE"
CONTENT=$(base64 -w 0 "$TEST_FILE")
TS=$(date +%Y%m%d_%H%M%S)
NEW_NAME="test_${TS}_$RANDOM.txt"

RESPONSE=$(curl -s -X POST \
"https://api.github.com/repos/$OWNER/$REPO/contents/$NEW_NAME" \
-H "Authorization: token $TOKEN" \
-H "Content-Type: application/json" \
-d "{\"message\":\"test upload $NEW_NAME\",\"content\":\"$CONTENT\"}")

echo "API 响应:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
echo ""

if echo "$RESPONSE" | grep -q '"content"'; then
    echo "✅ 上传成功！"
    echo ""
    echo "📍 文件信息:"
    echo "$RESPONSE" | python3 << 'PYTHON'
import sys, json
data = json.load(sys.stdin)
print(f"   文件名: {data['content']['name']}")
print(f"   路径: {data['content']['path']}")
print(f"   GitHub URL: {data['content']['html_url']}")
print(f"   Raw URL: {data['content']['download_url']}")
PYTHON
    echo ""
    echo "🔗 CDN 链接:"
    echo "   https://cdn.jsdelivr.net/gh/$OWNER/$REPO/$NEW_NAME"
else
    echo "❌ 上传失败"
    echo "$RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(f'错误: {d.get(\"message\")}')" 2>/dev/null
fi

rm -f "$TEST_FILE"
