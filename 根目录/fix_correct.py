# 读取文件
with open('app/server/server.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 修复第548行
# 问题：replace(/\\/g, '/') - 只有一个反斜杠，语法错误
# 正确：replace(/\\\\/g, '/') - 两个反斜杠，匹配反斜杠字符
if len(lines) > 547:
    lines[547] = "            const urlPath = baseUrl + '/' + relPath.replace(/\\\\\\\\/g, '/');\n"

# 写回文件
with open('app/server/server.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("修复完成！")
