# 读取server.js
with open('app/server/server.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 将所有的 shares/mdeditor/images 改为 shares/shares/mdeditor/images
content = content.replace(
    "'/var/apps/App.Native.MdEditor2/shares/mdeditor/images'",
    "'/var/apps/App.Native.MdEditor2/shares/shares/mdeditor/images'"
)

content = content.replace(
    "'/var/apps/App.Native.MdEditor2/shares'",
    "'/var/apps/App.Native.MdEditor2/shares/shares'"
)

# 写回文件
with open('app/server/server.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ 路径已更新为 shares/shares/mdeditor/images")
