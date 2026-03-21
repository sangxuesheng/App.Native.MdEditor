# 读取server.js
with open('app/server/server.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 修复路径：shares/mdeditor/images -> shares/images
# 因为data-share的name是"mdeditor/images"，软链接会创建为shares/images
content = content.replace(
    "'/var/apps/App.Native.MdEditor2/shares/mdeditor/images'",
    "'/var/apps/App.Native.MdEditor2/shares/images'"
)

# 写回文件
with open('app/server/server.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ 路径已修复为 shares/images")
