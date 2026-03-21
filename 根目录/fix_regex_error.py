import re

# 读取文件
with open('app/server/server.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 修复正则表达式错误
# 错误的: replace(/\\/g, '/')
# 正确的: replace(/\\\\/g, '/')
content = content.replace("replace(/\\\\/g, '/')", "replace(/\\\\\\\\/g, '/')")

# 写回文件
with open('app/server/server.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("正则表达式错误已修复")
