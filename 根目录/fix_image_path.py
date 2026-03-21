# 读取server.js
with open('app/server/server.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 替换所有的 shares/images 为 shares/mdeditor/images
content = content.replace("shares/images", "shares/mdeditor/images")

# 写回文件
with open('app/server/server.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ 图片路径已更新为 shares/mdeditor/images")
