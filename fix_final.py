# 读取文件
with open('app/server/server.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 修复第548行 - 使用正确的JavaScript正则表达式
# JavaScript中: /\\\\/g 表示匹配反斜杠
if len(lines) > 547:
    lines[547] = "            const urlPath = baseUrl + '/' + relPath.replace(/\\\\\\\\/g, '/');\n"

# 写回文件
with open('app/server/server.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("修复完成！")
