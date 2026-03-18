#!/bin/bash

OWNER="tingwen-img"
REPO="img0"
TOKEN="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"

echo "🔍 检查 $REPO 仓库结构..."
echo ""

# 获取仓库根目录内容
echo "1️⃣  仓库根目录内容:"
curl -s -H "Authorization: token $TOKEN" \
"https://api.github.com/repos/$OWNER/$REPO/contents/" | python3 << 'PYTHON'
import sys, json
try:
    data = json.load(sys.stdin)
    if isinstance(data, list):
        if len(data) == 0:
            print("   (空仓库)")
        else:
            for item in data:
                print(f"   - {item['name']} ({item['type']})")
    else:
        print(f"   错误: {data.get('message', 'Unknown')}")
except Exception as e:
    print(f"   解析失败: {e}")
PYTHON
echo ""

# 尝试获取 img 目录
echo "2️⃣  检查 img/ 目录:"
curl -s -H "Authorization: token $TOKEN" \
"https://api.github.com/repos/$OWNER/$REPO/contents/img" | python3 << 'PYTHON'
import sys, json
try:
    data = json.load(sys.stdin)
    if isinstance(data, list):
        if len(data) == 0:
            print("   img/ 目录存在但为空")
        else:
            print(f"   img/ 目录存在，包含 {len(data)} 个文件:")
            for item in data[:5]:  # 只显示前5个
                print(f"   - {item['name']}")
            if len(data) > 5:
                print(f"   ... 还有 {len(data)-5} 个文件")
    else:
        print(f"   img/ 目录不存在或错误: {data.get('message', 'Unknown')}")
except Exception as e:
    print(f"   解析失败: {e}")
PYTHON
echo ""

# 尝试直接上传到根目录
echo "3️⃣  尝试上传到根目录..."
TEST_FILE="test_root_$$.txt"
echo "test content" > "$TEST_FILE"
CONTENT=$(base64 -w 0 "$TEST_FILE")
TS=$(date +%Y%m%d_%H%M%S)
NEW_NAME="test_${TS}_$RANDOM.txt"

RESPONSE=$(curl -s -X POST \
"https://api.github.com/repos/$OWNER/$REPO/contents/$NEW_NAME" \
-H "Authorization: token $TOKEN" \
-H "Content-Type: application/json" \
-d "{\"message\":\"test upload\",\"content\":\"$CONTENT\"}")

if echo "$RESPONSE" | grep -q '"content"'; then
    echo "   ✅ 上传到根目录成功！"
    echo "   文件: $NEW_NAME"
else
    echo "   ❌ 上传到根目录失败"
    echo "$RESPONSE" | python3 -c "import sys, json; d=json.load(sys.stdin); print(f'   错误: {d.get(\"message\")}')" 2>/dev/null
fi

rm -f "$TEST_FILE"
