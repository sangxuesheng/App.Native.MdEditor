# 读取文件
with open('app/server/server.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 修复第548行（索引547）
# 将 replace(/\\/g, '/') 改为 replace(/\\\\/g, '/')
if len(lines) > 547:
    old_line = lines[547]
    # 正确的写法应该是两个反斜杠
    new_line = old_line.replace("relPath.replace(/\\\\/g, '/')", "relPath.replace(/\\\\\\\\/g, '/')")
    lines[547] = new_line
    print(f"原始行: {old_line.strip()}")
    print(f"修复后: {new_line.strip()}")

# 写回文件
with open('app/server/server.js', 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("\n修复完成！")
