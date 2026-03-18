#!/bin/bash

TOKEN="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"
OWNER="tingwen-img"
REPO="img0"

echo "🔧 初始化仓库..."
echo ""

# 首先创建一个 README 文件来初始化仓库
echo "1️⃣  创建初始 README 文件..."
README_CONTENT=$(echo "# Image Bed Repository" | base64 -w 0)

RESPONSE=$(curl -s -X PUT \
-H "Authorization: token $TOKEN" \
-H "Content-Type: application/json" \
"https://api.github.com/repos/$OWNER/$REPO/contents/README.md" \
-d "{\"message\":\"Initialize repository\",\"content\":\"$README_CONTENT\",\"branch\":\"main\"}")

if echo "$RESPONSE" | grep -q '"content"'; then
    echo "✅ README 创建成功"
else
    echo "❌ README 创建失败"
    echo "$RESPONSE" | head -c 300
fi
echo ""

# 现在尝试创建 img 目录（通过创建一个文件）
echo "2️⃣  创建 img 目录..."
IMG_CONTENT=$(echo "placeholder" | base64 -w 0)

RESPONSE=$(curl -s -X PUT \
-H "Authorization: token $TOKEN" \
-H "Content-Type: application/json" \
"https://api.github.com/repos/$OWNER/$REPO/contents/img/.gitkeep" \
-d "{\"message\":\"Create img directory\",\"content\":\"$IMG_CONTENT\",\"branch\":\"main\"}")

if echo "$RESPONSE" | grep -q '"content"'; then
    echo "✅ img 目录创建成功"
else
    echo "❌ img 目录创建失败"
    echo "$RESPONSE" | head -c 300
fi
echo ""

# 现在测试上传
echo "3️⃣  测试上传图片..."
TEST_CONTENT=$(echo "test image content" | base64 -w 0)
TS=$(date +%Y%m%d_%H%M%S)
NEW_NAME="test_${TS}_$RANDOM.txt"

RESPONSE=$(curl -s -X PUT \
-H "Authorization: token $TOKEN" \
-H "Content-Type: application/json" \
"https://api.github.com/repos/$OWNER/$REPO/contents/img/$NEW_NAME" \
-d "{\"message\":\"Upload test image\",\"content\":\"$TEST_CONTENT\",\"branch\":\"main\"}")

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
PYTHON
    echo ""
    echo "🔗 CDN 链接:"
    echo "   https://cdn.jsdelivr.net/gh/$OWNER/$REPO/img/$NEW_NAME"
else
    echo "❌ 上传失败"
    echo "$RESPONSE" | head -c 300
fi
