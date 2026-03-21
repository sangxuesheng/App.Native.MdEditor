import re

# 读取server.js
with open('app/server/server.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 修改图片列表API - 使用共享目录
old_list_code = '''      const roots = getAllowedRoots();
      if (!roots.length) {
        sendJson(res, 500, { ok: false, code: 'NO_STORAGE', message: '未配置存储目录' });
        return;
      }
      
      const imagesBaseDir = path.join(roots[0], 'images');'''

new_list_code = '''      // 使用共享目录存储图片
      const imagesBaseDir = path.join(__dirname, '../../shares/images');'''

content = content.replace(old_list_code, new_list_code)

# 2. 修改图片删除API - 使用共享目录
old_delete_code = '''        const roots = getAllowedRoots();
        if (!roots.length) {
          sendJson(res, 500, { ok: false, code: 'NO_STORAGE', message: '未配置存储目录' });
          return;
        }
        
        // 构建完整路径
        const imagePath = path.join(roots[0], imageUrl);'''

new_delete_code = '''        // 使用共享目录存储图片
        const imagePath = path.join(__dirname, '../../shares', imageUrl);'''

content = content.replace(old_delete_code, new_delete_code)

# 3. 修改图片上传API - 使用共享目录
old_upload_code = '''        // 使用第一个授权目录作为图片存储位置
        const roots = getAllowedRoots();
        if (!roots.length) {
          sendJson(res, 500, { ok: false, code: 'NO_STORAGE', message: '未配置存储目录' });
          return;
        }
        
        const imagesDir = path.join(roots[0], 'images', year.toString(), month, day);'''

new_upload_code = '''        // 使用共享目录作为图片存储位置
        const imagesDir = path.join(__dirname, '../../shares/images', year.toString(), month, day);'''

content = content.replace(old_upload_code, new_upload_code)

# 4. 修改图片静态服务 - 使用共享目录
old_serve_code = '''      const roots = getAllowedRoots();
      if (!roots.length) {
        res.writeHead(404);
        res.end('Not Found');
        return;
      }
      
      const imagePath = path.join(roots[0], parsed.pathname);'''

new_serve_code = '''      // 使用共享目录提供图片服务
      const imagePath = path.join(__dirname, '../../shares', parsed.pathname);'''

content = content.replace(old_serve_code, new_serve_code)

# 写回文件
with open('app/server/server.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ 图片路径已更新为共享目录")
