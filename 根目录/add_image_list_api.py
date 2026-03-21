import re

# 读取文件
with open('app/server/server.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 查找插入位置（在图片上传API之前）
pattern = r'(\s+// 图片上传：POST /api/image/upload)'

# 要插入的代码
new_code = '''  // 图片列表：GET /api/image/list
  if (parsed.pathname === '/api/image/list' && req.method === 'GET') {
    try {
      const roots = getAllowedRoots();
      if (!roots.length) {
        sendJson(res, 500, { ok: false, code: 'NO_STORAGE', message: '未配置存储目录' });
        return;
      }
      
      const imagesBaseDir = path.join(roots[0], 'images');
      
      if (!fs.existsSync(imagesBaseDir)) {
        sendJson(res, 200, { ok: true, images: [] });
        return;
      }
      
      const images = [];
      
      // 递归扫描图片目录
      function scanDirectory(dir, baseUrl = '/images') {
        try {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relPath = path.relative(imagesBaseDir, fullPath);
            const urlPath = baseUrl + '/' + relPath.replace(/\\\\/g, '/');
            
            if (entry.isDirectory()) {
              scanDirectory(fullPath, baseUrl);
            } else if (entry.isFile()) {
              const ext = path.extname(entry.name).toLowerCase();
              if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
                const stats = fs.statSync(fullPath);
                images.push({
                  url: urlPath,
                  filename: entry.name,
                  size: stats.size,
                  mtime: stats.mtime.toISOString(),
                  alt: entry.name.replace(/\\.[^.]+$/, '')
                });
              }
            }
          }
        } catch (err) {
          console.error('Error scanning directory:', dir, err);
        }
      }
      
      scanDirectory(imagesBaseDir);
      
      // 按修改时间倒序排列（最新的在前）
      images.sort((a, b) => new Date(b.mtime) - new Date(a.mtime));
      
      sendJson(res, 200, { ok: true, images });
    } catch (err) {
      console.error('Image list error:', err);
      sendJson(res, 500, { ok: false, code: 'LIST_ERROR', message: '获取图片列表失败' });
    }
    return;
  }

'''

# 替换
new_content = re.sub(pattern, new_code + r'\1', content)

# 写回文件
with open('app/server/server.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("图片列表API已添加")
