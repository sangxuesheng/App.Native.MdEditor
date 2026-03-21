import re

# 读取server.js
with open('app/server/server.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 在图片列表API之后添加删除API
delete_api = '''
  // 图片删除：DELETE /api/image/delete
  if (parsed.pathname === '/api/image/delete' && req.method === 'DELETE') {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk.toString('utf8');
      if (raw.length > 1024 * 1024) {
        raw = '';
        sendJson(res, 413, { ok: false, code: 'PAYLOAD_TOO_LARGE', message: '内容过大' });
        req.destroy();
      }
    });
    req.on('end', () => {
      let body;
      try {
        body = JSON.parse(raw || '{}');
      } catch {
        sendJson(res, 400, { ok: false, code: 'INVALID_JSON', message: '请求体不是合法 JSON' });
        return;
      }
      
      const imageUrl = body && body.url;
      if (!imageUrl || !imageUrl.startsWith('/images/')) {
        sendJson(res, 400, { ok: false, code: 'INVALID_URL', message: '无效的图片URL' });
        return;
      }
      
      try {
        const roots = getAllowedRoots();
        if (!roots.length) {
          sendJson(res, 500, { ok: false, code: 'NO_STORAGE', message: '未配置存储目录' });
          return;
        }
        
        // 构建完整路径
        const imagePath = path.join(roots[0], imageUrl);
        
        // 检查文件是否存在
        if (!fs.existsSync(imagePath)) {
          sendJson(res, 404, { ok: false, code: 'NOT_FOUND', message: '图片不存在' });
          return;
        }
        
        // 删除文件
        fs.unlink(imagePath, (err) => {
          if (err) {
            if (err.code === 'EACCES') {
              sendJson(res, 403, { ok: false, code: 'EACCES', message: '无权限删除图片' });
            } else {
              sendJson(res, 500, { ok: false, code: 'DELETE_ERROR', message: '删除图片失败' });
            }
            return;
          }
          sendJson(res, 200, { ok: true, url: imageUrl });
        });
      } catch (err) {
        console.error('Image delete error:', err);
        sendJson(res, 500, { ok: false, code: 'DELETE_ERROR', message: '删除失败' });
      }
    });
    return;
  }

'''

# 在图片上传API之前插入删除API
pattern = r'(\n\n  // 图片上传：POST /api/image/upload)'
content = re.sub(pattern, delete_api + r'\1', content)

# 写回文件
with open('app/server/server.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ 后端删除API已添加")
