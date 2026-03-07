#!/usr/bin/env node

/**
 * App.Native.MdEditor 后端服务（CommonJS 版本）
 * - 提供健康检查接口
 * - 文件读写 API
 * - 静态文件服务（前端构建产物）
 */

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const historyManager = require('./historyManager');

const PORT = process.env.PORT || process.env.TRIM_SERVICE_PORT || 18080;
const STATIC_DIR = path.join(__dirname, '../ui/frontend/dist');

// 授权目录解析
function getAllowedRoots() {
  const roots = [];
  const accessible = process.env.TRIM_DATA_ACCESSIBLE_PATHS || '';
  if (accessible) {
    accessible.split(':').forEach(p => {
      if (p) roots.push(p);
    });
  }
  ['TRIM_PKGVAR', 'TRIM_PKGETC'].forEach(k => {
    if (process.env[k]) roots.push(process.env[k]);
  });
  return roots;
}

function isUnderRoot(target, root) {
  const rel = path.relative(root, target);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

function resolveSafePath(requestedPath) {
  if (!requestedPath || typeof requestedPath !== 'string') {
    throw new Error('INVALID_PATH');
  }
  if (!requestedPath.startsWith('/')) {
    throw new Error('PATH_MUST_BE_ABSOLUTE');
  }
  const normalized = path.normalize(requestedPath);
  const roots = getAllowedRoots();
  if (!roots.length) {
    throw new Error('NO_ALLOWED_ROOTS');
  }
  for (const root of roots) {
    if (isUnderRoot(normalized, root)) {
      return normalized;
    }
  }
  throw new Error('PATH_NOT_ALLOWED');
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);

  // 健康检查
  if (parsed.pathname === '/health') {
    sendJson(res, 200, { ok: true, app: 'App.Native.MdEditor' });
    return;
  }

  // 获取系统主题：GET /api/system/theme
  if (parsed.pathname === '/api/system/theme' && req.method === 'GET') {
    // 飞牛NAS的主题设置存储在浏览器的 localStorage 中
    // 我们需要读取 Chrome/Chromium 的 localStorage 数据库
    // 路径通常是: ~/.config/chromium/Default/Local Storage/leveldb/
    // 或: ~/.config/google-chrome/Default/Local Storage/leveldb/
    
    const { exec } = require('child_process');
    
    // 尝试通过命令行工具读取 localStorage
    // 使用 sqlite3 或直接读取 LevelDB
    const command = `
      # 尝试从多个可能的位置读取
      for db in ~/.config/chromium/Default/Local\ Storage/leveldb/*.ldb ~/.config/google-chrome/Default/Local\ Storage/leveldb/*.ldb; do
        if [ -f "$db" ]; then
          strings "$db" | grep -o 'fnos-theme-mode.*[0-9]\\+' | head -1
        fi
      done
    `;
    
    exec(command, (error, stdout, stderr) => {
      let themeMode = '10'; // 默认浅色
      
      if (!error && stdout) {
        // 从输出中提取主题模式值
        const match = stdout.match(/fnos-theme-mode.*?(\d+)/);
        if (match && match[1]) {
          themeMode = match[1];
        }
      }
      
      sendJson(res, 200, { 
        ok: true, 
        themeMode: themeMode,
        source: stdout ? 'localStorage' : 'default'
      });
    });
    return;
  }

  // 文件读取：GET /api/file?path=/abs/path/to/file.md
  if (parsed.pathname === '/api/file' && req.method === 'GET') {
    const requestedPath = parsed.query.path;
    try {
      const safePath = resolveSafePath(requestedPath);
      fs.readFile(safePath, 'utf8', (err, content) => {
        if (err) {
          if (err.code === 'ENOENT') {
            sendJson(res, 404, { ok: false, code: 'NOT_FOUND', message: '文件不存在' });
          } else if (err.code === 'EACCES') {
            sendJson(res, 403, { ok: false, code: 'EACCES', message: '无权限读取文件' });
          } else {
            sendJson(res, 500, { ok: false, code: 'READ_ERROR', message: '读取文件失败' });
          }
          return;
        }
        sendJson(res, 200, { ok: true, path: safePath, content });
      });
    } catch (e) {
      const code = e && e.message;
      if (code === 'PATH_NOT_ALLOWED') {
        sendJson(res, 403, { ok: false, code, message: '目标路径不在授权目录内' });
      } else if (code === 'PATH_MUST_BE_ABSOLUTE') {
        sendJson(res, 400, { ok: false, code, message: '需要提供绝对路径' });
      } else {
        sendJson(res, 400, { ok: false, code: code || 'INVALID_PATH', message: '无效路径或未配置授权目录' });
      }
    }
    return;
  }

  // 文件列表：GET /api/files?path=/abs/path/to/dir
  if (parsed.pathname === '/api/files' && req.method === 'GET') {
    const requestedPath = parsed.query.path || '/';
    try {
      const safePath = requestedPath === '/' ? null : resolveSafePath(requestedPath);
      const roots = getAllowedRoots();
      
      // 如果请求根目录，返回所有授权根目录
      if (!safePath) {
        const rootDirs = roots.map(root => ({
          name: path.basename(root),
          path: root,
          type: 'directory',
          isRoot: true
        }));
        sendJson(res, 200, { ok: true, path: '/', items: rootDirs });
        return;
      }
      
      // 读取目录内容
      fs.readdir(safePath, { withFileTypes: true }, (err, entries) => {
        if (err) {
          if (err.code === 'ENOENT') {
            sendJson(res, 404, { ok: false, code: 'NOT_FOUND', message: '目录不存在' });
          } else if (err.code === 'EACCES') {
            sendJson(res, 403, { ok: false, code: 'EACCES', message: '无权限访问目录' });
          } else {
            sendJson(res, 500, { ok: false, code: 'READ_ERROR', message: '读取目录失败' });
          }
          return;
        }
        
        const items = entries
          .filter(entry => {
            if (entry.name.startsWith('.')) return false;
            if (entry.isFile() && !entry.name.endsWith('.md')) return false;
            return true;
          })
          .map(entry => ({
            name: entry.name,
            path: path.join(safePath, entry.name),
            type: entry.isDirectory() ? 'directory' : 'file',
            isRoot: false
          }))
          .sort((a, b) => {
            if (a.type !== b.type) {
              return a.type === 'directory' ? -1 : 1;
            }
            return a.name.localeCompare(b.name);
          });
        
        sendJson(res, 200, { ok: true, path: safePath, items });
      });
    } catch (e) {
      const code = e && e.message;
      if (code === 'PATH_NOT_ALLOWED') {
        sendJson(res, 403, { ok: false, code, message: '目标路径不在授权目录内' });
      } else if (code === 'PATH_MUST_BE_ABSOLUTE') {
        sendJson(res, 400, { ok: false, code, message: '需要提供绝对路径' });
      } else {
        sendJson(res, 400, { ok: false, code: code || 'INVALID_PATH', message: '无效路径或未配置授权目录' });
      }
    }
    return;
  }

  // 文件重命名：POST /api/file/rename
  if (parsed.pathname === '/api/file/rename' && req.method === 'POST') {
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
      const oldPath = body && body.oldPath;
      const newPath = body && body.newPath;
      try {
        const safeOldPath = resolveSafePath(oldPath);
        const safeNewPath = resolveSafePath(newPath);
        
        if (!fs.existsSync(safeOldPath)) {
          sendJson(res, 404, { ok: false, code: 'NOT_FOUND', message: '源文件不存在' });
          return;
        }
        
        if (fs.existsSync(safeNewPath)) {
          sendJson(res, 409, { ok: false, code: 'ALREADY_EXISTS', message: '目标文件已存在' });
          return;
        }
        
        fs.mkdir(path.dirname(safeNewPath), { recursive: true }, (mkErr) => {
          if (mkErr) {
            sendJson(res, 500, { ok: false, code: 'MKDIR_FAILED', message: '创建目录失败' });
            return;
          }
          
          fs.rename(safeOldPath, safeNewPath, (renameErr) => {
            if (renameErr) {
              if (renameErr.code === 'EACCES') {
                sendJson(res, 403, { ok: false, code: 'EACCES', message: '无权限重命名文件' });
              } else {
                sendJson(res, 500, { ok: false, code: 'RENAME_ERROR', message: '重命名失败' });
              }
              return;
            }
            sendJson(res, 200, { ok: true, oldPath: safeOldPath, newPath: safeNewPath });
          });
        });
      } catch (e) {
        const code = e && e.message;
        if (code === 'PATH_NOT_ALLOWED') {
          sendJson(res, 403, { ok: false, code, message: '目标路径不在授权目录内' });
        } else if (code === 'PATH_MUST_BE_ABSOLUTE') {
          sendJson(res, 400, { ok: false, code, message: '需要提供绝对路径' });
        } else {
          sendJson(res, 400, { ok: false, code: code || 'INVALID_PATH', message: '无效路径' });
        }
      }
    });
    return;
  }

  // 文件删除：POST /api/file/delete
  if (parsed.pathname === '/api/file/delete' && req.method === 'POST') {
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
      const requestedPath = body && body.path;
      try {
        const safePath = resolveSafePath(requestedPath);
        
        if (!fs.existsSync(safePath)) {
          sendJson(res, 404, { ok: false, code: 'NOT_FOUND', message: '文件不存在' });
          return;
        }
        
        const stats = fs.statSync(safePath);
        
        if (stats.isDirectory()) {
          fs.rm(safePath, { recursive: true, force: true }, (rmErr) => {
            if (rmErr) {
              if (rmErr.code === 'EACCES') {
                sendJson(res, 403, { ok: false, code: 'EACCES', message: '无权限删除目录' });
              } else {
                sendJson(res, 500, { ok: false, code: 'DELETE_ERROR', message: '删除目录失败' });
              }
              return;
            }
            sendJson(res, 200, { ok: true, path: safePath, type: 'directory' });
          });
        } else {
          fs.unlink(safePath, (unlinkErr) => {
            if (unlinkErr) {
              if (unlinkErr.code === 'EACCES') {
                sendJson(res, 403, { ok: false, code: 'EACCES', message: '无权限删除文件' });
              } else {
                sendJson(res, 500, { ok: false, code: 'DELETE_ERROR', message: '删除文件失败' });
              }
              return;
            }
            sendJson(res, 200, { ok: true, path: safePath, type: 'file' });
          });
        }
      } catch (e) {
        const code = e && e.message;
        if (code === 'PATH_NOT_ALLOWED') {
          sendJson(res, 403, { ok: false, code, message: '目标路径不在授权目录内' });
        } else if (code === 'PATH_MUST_BE_ABSOLUTE') {
          sendJson(res, 400, { ok: false, code, message: '需要提供绝对路径' });
        } else {
          sendJson(res, 400, { ok: false, code: code || 'INVALID_PATH', message: '无效路径' });
        }
      }
    });
    return;
  }

  // 复制文件/文件夹：POST /api/file/copy
  if (parsed.pathname === '/api/file/copy' && req.method === 'POST') {
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
      const sourcePath = body && body.sourcePath;
      const targetPath = body && body.targetPath;
      try {
        const safeSourcePath = resolveSafePath(sourcePath);
        const safeTargetPath = resolveSafePath(targetPath);
        
        if (!fs.existsSync(safeSourcePath)) {
          sendJson(res, 404, { ok: false, code: 'NOT_FOUND', message: '源文件不存在' });
          return;
        }
        
        if (fs.existsSync(safeTargetPath)) {
          sendJson(res, 409, { ok: false, code: 'ALREADY_EXISTS', message: '目标文件已存在' });
          return;
        }
        
        // 确保目标目录存在
        fs.mkdir(path.dirname(safeTargetPath), { recursive: true }, (mkErr) => {
          if (mkErr) {
            sendJson(res, 500, { ok: false, code: 'MKDIR_FAILED', message: '创建目录失败' });
            return;
          }
          
          // 复制文件或目录
          const stats = fs.statSync(safeSourcePath);
          if (stats.isDirectory()) {
            // 复制目录（递归）
            const copyDir = (src, dest) => {
              fs.mkdirSync(dest, { recursive: true });
              const entries = fs.readdirSync(src, { withFileTypes: true });
              for (const entry of entries) {
                const srcPath = path.join(src, entry.name);
                const destPath = path.join(dest, entry.name);
                if (entry.isDirectory()) {
                  copyDir(srcPath, destPath);
                } else {
                  fs.copyFileSync(srcPath, destPath);
                }
              }
            };
            
            try {
              copyDir(safeSourcePath, safeTargetPath);
              sendJson(res, 200, { ok: true, sourcePath: safeSourcePath, targetPath: safeTargetPath });
            } catch (copyErr) {
              sendJson(res, 500, { ok: false, code: 'COPY_ERROR', message: '复制失败' });
            }
          } else {
            // 复制文件
            fs.copyFile(safeSourcePath, safeTargetPath, (copyErr) => {
              if (copyErr) {
                if (copyErr.code === 'EACCES') {
                  sendJson(res, 403, { ok: false, code: 'EACCES', message: '无权限复制文件' });
                } else {
                  sendJson(res, 500, { ok: false, code: 'COPY_ERROR', message: '复制失败' });
                }
                return;
              }
              sendJson(res, 200, { ok: true, sourcePath: safeSourcePath, targetPath: safeTargetPath });
            });
          }
        });
      } catch (e) {
        const code = e && e.message;
        if (code === 'PATH_NOT_ALLOWED') {
          sendJson(res, 403, { ok: false, code, message: '目标路径不在授权目录内' });
        } else if (code === 'PATH_MUST_BE_ABSOLUTE') {
          sendJson(res, 400, { ok: false, code, message: '需要提供绝对路径' });
        } else {
          sendJson(res, 400, { ok: false, code: code || 'INVALID_PATH', message: '无效路径' });
        }
      }
    });
    return;
  }

  // 移动文件/文件夹：POST /api/file/move
  if (parsed.pathname === '/api/file/move' && req.method === 'POST') {
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
      const sourcePath = body && body.sourcePath;
      const targetPath = body && body.targetPath;
      try {
        const safeSourcePath = resolveSafePath(sourcePath);
        const safeTargetPath = resolveSafePath(targetPath);
        
        if (!fs.existsSync(safeSourcePath)) {
          sendJson(res, 404, { ok: false, code: 'NOT_FOUND', message: '源文件不存在' });
          return;
        }
        
        if (fs.existsSync(safeTargetPath)) {
          sendJson(res, 409, { ok: false, code: 'ALREADY_EXISTS', message: '目标文件已存在' });
          return;
        }
        
        // 确保目标目录存在
        fs.mkdir(path.dirname(safeTargetPath), { recursive: true }, (mkErr) => {
          if (mkErr) {
            sendJson(res, 500, { ok: false, code: 'MKDIR_FAILED', message: '创建目录失败' });
            return;
          }
          
          // 移动文件或目录
          fs.rename(safeSourcePath, safeTargetPath, (moveErr) => {
            if (moveErr) {
              if (moveErr.code === 'EACCES') {
                sendJson(res, 403, { ok: false, code: 'EACCES', message: '无权限移动文件' });
              } else {
                sendJson(res, 500, { ok: false, code: 'MOVE_ERROR', message: '移动失败' });
              }
              return;
            }
            sendJson(res, 200, { ok: true, sourcePath: safeSourcePath, targetPath: safeTargetPath });
          });
        });
      } catch (e) {
        const code = e && e.message;
        if (code === 'PATH_NOT_ALLOWED') {
          sendJson(res, 403, { ok: false, code, message: '目标路径不在授权目录内' });
        } else if (code === 'PATH_MUST_BE_ABSOLUTE') {
          sendJson(res, 400, { ok: false, code, message: '需要提供绝对路径' });
        } else {
          sendJson(res, 400, { ok: false, code: code || 'INVALID_PATH', message: '无效路径' });
        }
      }
    });
    return;
  }

  // 创建文件夹：POST /api/folder/create
  if (parsed.pathname === '/api/folder/create' && req.method === 'POST') {
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
      const requestedPath = body && body.path;
      try {
        const safePath = resolveSafePath(requestedPath);
        
        if (fs.existsSync(safePath)) {
          sendJson(res, 409, { ok: false, code: 'ALREADY_EXISTS', message: '文件夹已存在' });
          return;
        }
        
        fs.mkdir(safePath, { recursive: true }, (mkErr) => {
          if (mkErr) {
            if (mkErr.code === 'EACCES') {
              sendJson(res, 403, { ok: false, code: 'EACCES', message: '无权限创建文件夹' });
            } else {
              sendJson(res, 500, { ok: false, code: 'MKDIR_FAILED', message: '创建文件夹失败' });
            }
            return;
          }
          sendJson(res, 200, { ok: true, path: safePath });
        });
      } catch (e) {
        const code = e && e.message;
        if (code === 'PATH_NOT_ALLOWED') {
          sendJson(res, 403, { ok: false, code, message: '目标路径不在授权目录内' });
        } else if (code === 'PATH_MUST_BE_ABSOLUTE') {
          sendJson(res, 400, { ok: false, code, message: '需要提供绝对路径' });
        } else {
          sendJson(res, 400, { ok: false, code: code || 'INVALID_PATH', message: '无效路径' });
        }
      }
    });
    return;
  }

  // 文件保存：POST /api/file  // 图片列表：GET /api/image/list
  if (parsed.pathname === '/api/image/list' && req.method === 'GET') {
    try {
      // 使用共享目录存储图片
      const imagesBaseDir = '/var/apps/App.Native.MdEditor2/shares/images';
      
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
                  alt: entry.name.replace(/\.[^.]+$/, '')
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
        // 使用共享目录存储图片
        const imagePath = path.join('/var/apps/App.Native.MdEditor2/shares', imageUrl);
        
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



  // 图片上传：POST /api/image/upload
  if (parsed.pathname === '/api/image/upload' && req.method === 'POST') {
    const contentType = req.headers['content-type'] || '';
    
    if (!contentType.includes('multipart/form-data')) {
      sendJson(res, 400, { ok: false, code: 'INVALID_CONTENT_TYPE', message: '需要 multipart/form-data' });
      return;
    }
    
    // 简单的 multipart 解析（生产环境建议使用 multer 等库）
    const boundary = contentType.split('boundary=')[1];
    if (!boundary) {
      sendJson(res, 400, { ok: false, code: 'NO_BOUNDARY', message: '缺少 boundary' });
      return;
    }
    
    let rawData = Buffer.alloc(0);
    req.on('data', chunk => {
      rawData = Buffer.concat([rawData, chunk]);
      if (rawData.length > 10 * 1024 * 1024) { // 10MB 限制
        sendJson(res, 413, { ok: false, code: 'FILE_TOO_LARGE', message: '文件过大' });
        req.destroy();
      }
    });
    
    req.on('end', () => {
      try {
        // 使用 Buffer 处理，避免编码问题
        const boundaryBuffer = Buffer.from('--' + boundary);
        const parts = [];
        let start = 0;
        
        // 分割 multipart 数据
        while (true) {
          const boundaryIndex = rawData.indexOf(boundaryBuffer, start);
          if (boundaryIndex === -1) break;
          
          const nextBoundaryIndex = rawData.indexOf(boundaryBuffer, boundaryIndex + boundaryBuffer.length);
          if (nextBoundaryIndex === -1) break;
          
          parts.push(rawData.slice(boundaryIndex + boundaryBuffer.length, nextBoundaryIndex));
          start = nextBoundaryIndex;
        }
        
        const uploadedImages = [];
        
        // 创建图片存储目录
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        
        // 使用共享目录作为图片存储位置
        const imagesDir = path.join('/var/apps/App.Native.MdEditor2/shares/images', year.toString(), month, day);
        
        // 确保目录存在
        if (!fs.existsSync(imagesDir)) {
          fs.mkdirSync(imagesDir, { recursive: true });
        }
        
        for (const part of parts) {
          // 查找 Content-Disposition 头
          const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));
          if (headerEnd === -1) continue;
          
          const headerSection = part.slice(0, headerEnd).toString('utf8');
          
          console.log('Header section:', headerSection);
          
          if (!headerSection.includes('Content-Disposition')) continue;
          
          // 提取文件名 - 处理编码问题
          // 注意：headerSection 已经是 UTF-8 字符串，但文件名可能是 Latin-1 编码的
          const filenameMatch = headerSection.match(/filename="([^"]+)"|filename\*=UTF-8''([^;\r\n]+)/);
          if (!filenameMatch) continue;
          
          // 优先使用 RFC 5987 编码的文件名（filename*），否则使用普通文件名
          let originalFilename = filenameMatch[2] ? decodeURIComponent(filenameMatch[2]) : filenameMatch[1];
          
          console.log('=== 文件名解码开始 ===');
          console.log('原始匹配:', originalFilename);
          
          // 浏览器的 FormData 使用 Latin-1 编码发送文件名
          // 但是 headerSection.toString('utf8') 已经尝试用 UTF-8 解码了
          // 我们需要从原始 Buffer 中重新提取文件名
          try {
            // 在原始 Buffer 中查找 filename="
            const filenameStart = part.indexOf(Buffer.from('filename="'));
            if (filenameStart !== -1) {
              const nameStart = filenameStart + 10; // 'filename="' 的长度
              const nameEnd = part.indexOf(Buffer.from('"'), nameStart);
              
              if (nameEnd !== -1) {
                // 提取文件名的原始字节
                const filenameBytes = part.slice(nameStart, nameEnd);
                console.log('文件名字节:', filenameBytes.toString('hex'));
                
                // 用 UTF-8 解码
                originalFilename = filenameBytes.toString('utf8');
                console.log('UTF-8 解码后:', originalFilename);
              }
            }
          } catch (e) {
            console.error('文件名解码错误:', e);
          }
          
          console.log('最终文件名:', originalFilename);
          console.log('=== 文件名解码结束 ===');

          
          const ext = path.extname(originalFilename);
          
          // 验证文件类型
          if (!['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext.toLowerCase())) {
            continue;
          }
          
          // 生成唯一文件名 - 保留原始文件名（支持中文）
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(2, 8);
          const baseFilename = path.basename(originalFilename, ext);
          const safeFilename = `${timestamp}_${random}_${baseFilename}${ext}`;
          const filepath = path.join(imagesDir, safeFilename);
          
          // 提取文件内容
          const contentStart = headerEnd + 4; // \r\n\r\n 的长度
          const contentEnd = part.length - 2; // 去掉末尾的 \r\n
          
          if (contentStart >= part.length) continue;
          
          const fileContent = part.slice(contentStart, contentEnd);
          
          // 保存文件
          fs.writeFileSync(filepath, fileContent);
          
          // 生成相对 URL
          const relativeUrl = `/images/${year}/${month}/${day}/${encodeURIComponent(safeFilename)}`;
          
          uploadedImages.push({
            url: relativeUrl,
            filename: originalFilename,
            size: fileContent.length,
            alt: baseFilename
          });
          
          console.log('添加到上传列表:', {
            url: relativeUrl,
            filename: originalFilename,
            alt: baseFilename,
            filenameBytes: Buffer.from(originalFilename).toString('hex'),
            altBytes: Buffer.from(baseFilename).toString('hex')
          });
        }
        
        if (uploadedImages.length === 0) {
          sendJson(res, 400, { ok: false, code: 'NO_IMAGES', message: '没有有效的图片文件' });
          return;
        }
        
        console.log('准备返回 JSON，图片数量:', uploadedImages.length);
        console.log('JSON 字符串:', JSON.stringify({ ok: true, images: uploadedImages }));
        
        sendJson(res, 200, { ok: true, images: uploadedImages });
      } catch (err) {
        console.error('Image upload error:', err);
        sendJson(res, 500, { ok: false, code: 'UPLOAD_ERROR', message: '上传失败: ' + err.message });
      }
    });
    return;
  }

  if (parsed.pathname === '/api/file' && req.method === 'POST') {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk.toString('utf8');
      if (raw.length > 2 * 1024 * 1024) {
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
      const requestedPath = body && body.path;
      const content = typeof body.content === 'string' ? body.content : '';
      try {
        const safePath = resolveSafePath(requestedPath);
        fs.mkdir(path.dirname(safePath), { recursive: true }, (mkErr) => {
          if (mkErr) {
            sendJson(res, 500, { ok: false, code: 'MKDIR_FAILED', message: '创建目录失败' });
            return;
          }
          fs.writeFile(safePath, content, 'utf8', (wErr) => {
            if (wErr) {
              if (wErr.code === 'EACCES') {
                sendJson(res, 403, { ok: false, code: 'EACCES', message: '无权限写入文件' });
              } else {
                sendJson(res, 500, { ok: false, code: 'WRITE_ERROR', message: '写入文件失败' });
              }
              return;
            }
            sendJson(res, 200, { ok: true, path: safePath });
          });
        });
      } catch (e) {
        const code = e && e.message;
        if (code === 'PATH_NOT_ALLOWED') {
          sendJson(res, 403, { ok: false, code, message: '目标路径不在授权目录内' });
        } else if (code === 'PATH_MUST_BE_ABSOLUTE') {
          sendJson(res, 400, { ok: false, code, message: '需要提供绝对路径' });
        } else {
          sendJson(res, 400, { ok: false, code: code || 'INVALID_PATH', message: '无效路径或未配置授权目录' });
        }
      }
    });
    return;
  }

  // ==================== 历史版本 API ====================
  
  // 保存版本：POST /api/file/history/save
  if (parsed.pathname === '/api/file/history/save' && req.method === 'POST') {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk.toString('utf8');
      if (raw.length > 10 * 1024 * 1024) { // 限制10MB
        raw = '';
        sendJson(res, 413, { ok: false, code: 'PAYLOAD_TOO_LARGE', message: '内容过大' });
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        const { filePath, content, label, autoSaved } = JSON.parse(raw || '{}');
        
        // 验证文件路径
        try {
          resolveSafePath(filePath);
        } catch (error) {
          sendJson(res, 403, { ok: false, code: 'PATH_NOT_ALLOWED', message: '无权访问此文件' });
          return;
        }
        
        const result = historyManager.saveVersion(filePath, content, label || '', autoSaved !== false);
        sendJson(res, 200, result);
      } catch (error) {
        console.error('Save history error:', error);
        sendJson(res, 500, { ok: false, message: error.message });
      }
    });
    return;
  }

  // 获取版本列表：GET /api/file/history/list?path=xxx
  if (parsed.pathname === '/api/file/history/list' && req.method === 'GET') {
    try {
      const filePath = parsed.query.path;
      
      if (!filePath) {
        sendJson(res, 400, { ok: false, message: '缺少文件路径参数' });
        return;
      }
      
      // 验证文件路径
      try {
        resolveSafePath(filePath);
      } catch (error) {
        sendJson(res, 403, { ok: false, code: 'PATH_NOT_ALLOWED', message: '无权访问此文件' });
        return;
      }
      
      const versions = historyManager.getVersionList(filePath);
      sendJson(res, 200, { ok: true, versions });
    } catch (error) {
      console.error('Get version list error:', error);
      sendJson(res, 500, { ok: false, message: error.message });
    }
    return;
  }

  // 获取版本内容：GET /api/file/history/version?path=xxx&version=1
  if (parsed.pathname === '/api/file/history/version' && req.method === 'GET') {
    try {
      const filePath = parsed.query.path;
      const versionNumber = parseInt(parsed.query.version);
      
      if (!filePath || !versionNumber) {
        sendJson(res, 400, { ok: false, message: '缺少必要参数' });
        return;
      }
      
      // 验证文件路径
      try {
        resolveSafePath(filePath);
      } catch (error) {
        sendJson(res, 403, { ok: false, code: 'PATH_NOT_ALLOWED', message: '无权访问此文件' });
        return;
      }
      
      const version = historyManager.getVersionContent(filePath, versionNumber);
      
      if (version) {
        sendJson(res, 200, { ok: true, ...version });
      } else {
        sendJson(res, 404, { ok: false, message: '版本不存在' });
      }
    } catch (error) {
      console.error('Get version content error:', error);
      sendJson(res, 500, { ok: false, message: error.message });
    }
    return;
  }

  // 删除单个版本：POST /api/file/history/delete
  if (parsed.pathname === '/api/file/history/delete' && req.method === 'POST') {
    let raw = '';
    req.on('data', chunk => { raw += chunk.toString('utf8'); });
    req.on('end', () => {
      try {
        const { filePath, versionNumber } = JSON.parse(raw || '{}');
        
        if (!filePath || !versionNumber) {
          sendJson(res, 400, { ok: false, message: '缺少必要参数' });
          return;
        }
        
        // 验证文件路径
        try {
          resolveSafePath(filePath);
        } catch (error) {
          sendJson(res, 403, { ok: false, code: 'PATH_NOT_ALLOWED', message: '无权访问此文件' });
          return;
        }
        
        const result = historyManager.deleteVersion(filePath, versionNumber);
        sendJson(res, 200, result);
      } catch (error) {
        console.error('Delete version error:', error);
        sendJson(res, 500, { ok: false, message: error.message });
      }
    });
    return;
  }

  // 删除所有版本：POST /api/file/history/clear
  if (parsed.pathname === '/api/file/history/clear' && req.method === 'POST') {
    let raw = '';
    req.on('data', chunk => { raw += chunk.toString('utf8'); });
    req.on('end', () => {
      try {
        const { filePath } = JSON.parse(raw || '{}');
        
        if (!filePath) {
          sendJson(res, 400, { ok: false, message: '缺少文件路径参数' });
          return;
        }
        
        // 验证文件路径
        try {
          resolveSafePath(filePath);
        } catch (error) {
          sendJson(res, 403, { ok: false, code: 'PATH_NOT_ALLOWED', message: '无权访问此文件' });
          return;
        }
        
        const result = historyManager.clearAllVersions(filePath);
        sendJson(res, 200, result);
      } catch (error) {
        console.error('Clear all versions error:', error);
        sendJson(res, 500, { ok: false, message: error.message });
      }
    });
    return;
  }

  // ==================== 静态文件服务 ====================

  // 静态文件服务

  // 图片静态文件服务：/images/...
  if (parsed.pathname.startsWith('/images/')) {
    try {
      // 使用共享目录提供图片服务
      const imagePath = path.join('/var/apps/App.Native.MdEditor2/shares', parsed.pathname);
      
      if (fs.existsSync(imagePath) && fs.statSync(imagePath).isFile()) {
        const ext = path.extname(imagePath).toLowerCase();
        const mimeTypes = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.webp': 'image/webp',
          '.svg': 'image/svg+xml'
        };
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        
        fs.readFile(imagePath, (err, data) => {
          if (err) {
            res.writeHead(500);
            res.end('Internal Server Error');
            return;
          }
          res.writeHead(200, { 
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=31536000'
          });
          res.end(data);
        });
        return;
      }
    } catch (err) {
      console.error('Image serve error:', err);
    }
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  const staticPath = path.join(STATIC_DIR, parsed.pathname === '/' ? 'index.html' : parsed.pathname);
  
  if (fs.existsSync(staticPath) && fs.statSync(staticPath).isFile()) {
    const ext = path.extname(staticPath);
    const mimeTypes = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2'
    };
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    
    fs.readFile(staticPath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
    return;
  }

  // SPA 回退
  if (!parsed.pathname.startsWith('/api') && !parsed.pathname.startsWith('/health')) {
    const indexPath = path.join(STATIC_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
      fs.readFile(indexPath, 'utf8', (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Internal Server Error');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
      });
      return;
    }
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`App.Native.MdEditor backend listening on port ${PORT}`);
  console.log(`Static files: ${STATIC_DIR}`);
});
