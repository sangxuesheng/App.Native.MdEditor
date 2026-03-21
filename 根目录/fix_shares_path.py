import re

# 读取server.js
with open('app/server/server.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 修复路径：使用 /var/apps/[appname]/shares 而不是相对路径
# 1. 图片列表API
content = content.replace(
    "const imagesBaseDir = path.join(__dirname, '../../shares/mdeditor/images');",
    "const imagesBaseDir = '/var/apps/App.Native.MdEditor2/shares/mdeditor/images';"
)

# 2. 图片删除API
content = content.replace(
    "const imagePath = path.join(__dirname, '../../shares', imageUrl);",
    "const imagePath = path.join('/var/apps/App.Native.MdEditor2/shares', imageUrl);"
)

# 3. 图片上传API
content = content.replace(
    "const imagesDir = path.join(__dirname, '../../shares/mdeditor/images', year.toString(), month, day);",
    "const imagesDir = path.join('/var/apps/App.Native.MdEditor2/shares/mdeditor/images', year.toString(), month, day);"
)

# 4. 图片静态服务
content = content.replace(
    "const imagePath = path.join(__dirname, '../../shares', parsed.pathname);",
    "const imagePath = path.join('/var/apps/App.Native.MdEditor2/shares', parsed.pathname);"
)

# 写回文件
with open('app/server/server.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ 路径已修复为绝对路径")
