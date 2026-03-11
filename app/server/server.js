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
const imageConverter = require('./imageConverter');

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
  // 始终挂载 shares/Folder 作为用户文档目录
  const sharesFolder = '/var/apps/App.Native.MdEditor2/shares/Folder';
  if (fs.existsSync(sharesFolder) && !roots.includes(sharesFolder)) {
    roots.push(sharesFolder);
  }
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

const server = http.createServer(async (req, res) => {
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

  // 图片转换器状态：GET /api/image/converter/status
  if (parsed.pathname === '/api/image/converter/status' && req.method === 'GET') {
    try {
      const status = await imageConverter.getConverterStatus();
      sendJson(res, 200, status);
    } catch (err) {
      console.error('Converter status error:', err);
      sendJson(res, 500, { ok: false, message: '获取转换器状态失败' });
    }
    return;
  }

  // 图片列表：GET /api/image/list
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



  // 数学公式渲染为 SVG：POST /api/math/svg
  if (parsed.pathname === '/api/math/svg' && req.method === 'POST') {
    let raw = '';
    req.on('data', chunk => {
      raw += chunk.toString('utf8');
      if (raw.length > 64 * 1024) {
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

      const latex = body && body.latex;
      const display = body && body.display === true;

      if (!latex || typeof latex !== 'string') {
        sendJson(res, 400, { ok: false, code: 'MISSING_LATEX', message: '缺少 latex 参数' });
        return;
      }

      try {
        const katex = require(path.join(__dirname, '../ui/frontend/node_modules/katex/dist/katex.min.js'));
        const rendered = katex.renderToString(latex, {
          throwOnError: false,
          displayMode: display,
          output: 'html'
        });

        if (!global._katexCss) {
          const cssPath = path.join(__dirname, '../ui/frontend/node_modules/katex/dist/katex.min.css');
          try { global._katexCss = fs.readFileSync(cssPath, 'utf8'); } catch(e) { global._katexCss = ''; }
        }

        const charCount = latex.length;
        const width = display ? Math.max(300, Math.min(800, charCount * 12 + 60)) : Math.max(60, Math.min(400, charCount * 10 + 20));
        const height = display ? 80 : 32;

        const svgContent = [
          '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"',
          ' width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">',
          '<defs><style>',
          global._katexCss,
          'body{margin:0;padding:0;background:transparent;}',
          '.katex{font-size:' + (display ? '1.3em' : '1em') + ';}',
          '.katex-display{margin:0;text-align:center;}',
          '</style></defs>',
          '<foreignObject width="100%" height="100%">',
          '<div xmlns="http://www.w3.org/1999/xhtml" style="display:' + (display ? 'flex' : 'inline-flex') + ';align-items:center;justify-content:center;width:' + width + 'px;height:' + height + 'px;overflow:visible;">',
          rendered,
          '</div></foreignObject></svg>'
        ].join('');

        const mathDir = '/tmp/md-editor-math';
        if (!fs.existsSync(mathDir)) fs.mkdirSync(mathDir, { recursive: true });

        const crypto = require('crypto');
        const hash = crypto.createHash('md5').update(latex + String(display)).digest('hex').substring(0, 12);
        const filename = 'math_' + hash + '.svg';
        const filepath = path.join(mathDir, filename);
        fs.writeFileSync(filepath, svgContent, 'utf8');

        // 同时返回 base64 编码的 SVG 内容，供前端内联使用
        const svgBase64 = Buffer.from(svgContent, 'utf8').toString('base64');
        sendJson(res, 200, { ok: true, url: '/math-svg/' + filename, width, height, svgBase64 });
      } catch (err) {
        console.error('Math SVG render error:', err);
        sendJson(res, 500, { ok: false, code: 'RENDER_ERROR', message: '渲染失败: ' + err.message });
      }
    });
    return;
  }

  // 数学公式 SVG 静态文件服务：/math-svg/...
  if (parsed.pathname.startsWith('/math-svg/')) {
    try {
      const filename = path.basename(parsed.pathname);
      if (!filename.endsWith('.svg') || filename.includes('..')) {
        res.writeHead(400); res.end('Bad Request'); return;
      }
      const filepath = path.join('/tmp/md-editor-math', filename);
      if (fs.existsSync(filepath)) {
        res.writeHead(200, { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' });
        res.end(fs.readFileSync(filepath));
        return;
      }
    } catch (err) {
      console.error('Math SVG serve error:', err);
    }
    res.writeHead(404); res.end('Not Found'); return;
  }

  // 图片 URL 抓取保存：POST /api/image/fetch-url
  if (parsed.pathname === '/api/image/fetch-url' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const { url, alt } = JSON.parse(body);
        if (!url) {
          sendJson(res, 400, { ok: false, message: '缺少 url 参数' });
          return;
        }

        // 下载远程图片
        const https = require('https');
        const http = require('http');
        const client = url.startsWith('https') ? https : http;

        const download = () => new Promise((resolve, reject) => {
          client.get(url, { timeout: 15000 }, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
              // 跟随重定向（最多一次）
              const redirectUrl = response.headers.location;
              const rc = redirectUrl.startsWith('https') ? https : http;
              rc.get(redirectUrl, { timeout: 15000 }, (r2) => {
                const chunks = [];
                r2.on('data', c => chunks.push(c));
                r2.on('end', () => resolve({ buffer: Buffer.concat(chunks), contentType: r2.headers['content-type'] || '' }));
                r2.on('error', reject);
              }).on('error', reject);
              return;
            }
            const chunks = [];
            response.on('data', c => chunks.push(c));
            response.on('end', () => resolve({ buffer: Buffer.concat(chunks), contentType: response.headers['content-type'] || '' }));
            response.on('error', reject);
          }).on('error', reject);
        });

        const { buffer, contentType } = await download();

        // 确定扩展名
        let ext = '.jpg';
        if (contentType.includes('png')) ext = '.png';
        else if (contentType.includes('gif')) ext = '.gif';
        else if (contentType.includes('webp')) ext = '.webp';
        else if (contentType.includes('svg')) ext = '.svg';
        else {
          // 从 URL 猜
          const urlExt = url.split('?')[0].split('.').pop().toLowerCase();
          if (['jpg','jpeg','png','gif','webp','svg'].includes(urlExt)) ext = '.' + (urlExt === 'jpeg' ? 'jpg' : urlExt);
        }

        // 存储路径
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const imagesDir = path.join('/var/apps/App.Native.MdEditor2/shares/images', year.toString(), month, day);
        if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

        const timestamp = Date.now();
        const random = Math.random().toString(36).slice(2, 8);
        const filename = `${timestamp}_${random}_fetched${ext}`;
        const filePath = path.join(imagesDir, filename);
        fs.writeFileSync(filePath, buffer);

        const imageUrl = `/shares/images/${year}/${month}/${day}/${filename}`;
        sendJson(res, 200, { ok: true, url: imageUrl, filename, size: buffer.length });
      } catch (e) {
        console.error('fetch-url 失败:', e);
        sendJson(res, 500, { ok: false, message: e.message });
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
    
    req.on('end', async () => {
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

          
          const ext = path.extname(originalFilename).toLowerCase();
          
          // 检查是否是 HEIC/HEIF 格式
          const isHEIC = ['.heic', '.heif'].includes(ext);
          
          // 验证文件类型
          if (!isHEIC && !['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
            continue;
          }
          
          // 生成唯一文件名 - 清理特殊字符
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(2, 8);
          const baseFilename = path.basename(originalFilename, ext);
          
          // 清理文件名：移除特殊字符，替换空格为下划线
          const cleanBaseFilename = baseFilename
            .replace(/[^\w\u4e00-\u9fa5.-]/g, '_')  // 保留字母、数字、中文、点和横线
            .replace(/_{2,}/g, '_')  // 多个下划线替换为一个
            .replace(/^_|_$/g, '');  // 移除首尾下划线
          
          // 提取文件内容
          const contentStart = headerEnd + 4; // \r\n\r\n 的长度
          const contentEnd = part.length - 2; // 去掉末尾的 \r\n
          
          if (contentStart >= part.length) continue;
          
          let fileContent = part.slice(contentStart, contentEnd);
          let finalExt = ext;
          let convertedFrom = null;
          
          // 如果是 HEIC/HEIF，转换为 JPEG
          if (isHEIC) {
            try {
              console.log(`检测到 HEIC/HEIF 文件: ${originalFilename}，开始转换...`);
              const convertResult = await imageConverter.convertImage(fileContent, originalFilename, {
                format: 'jpeg',
                quality: 85
              });
              
              fileContent = convertResult.buffer;
              finalExt = '.jpg';
              convertedFrom = 'HEIC';
              
              console.log(`HEIC 转换完成: ${convertResult.originalSize} -> ${convertResult.convertedSize} bytes`);
            } catch (convertErr) {
              console.error('HEIC 转换失败:', convertErr);
              // 转换失败，跳过此文件
              continue;
            }
          }
          
          const safeFilename = `${timestamp}_${random}_${cleanBaseFilename}${finalExt}`;
          const filepath = path.join(imagesDir, safeFilename);
          
          // 保存文件
          fs.writeFileSync(filepath, fileContent);
          
          // 生成相对 URL（不需要 encodeURIComponent，因为文件名已经清理过）
          const relativeUrl = `/images/${year}/${month}/${day}/${safeFilename}`;
          
          const imageInfo = {
            url: relativeUrl,
            filename: originalFilename,
            size: fileContent.length,
            alt: baseFilename
          };
          
          // 如果是转换的文件，添加标记
          if (convertedFrom) {
            imageInfo.convertedFrom = convertedFrom;
          }
          
          uploadedImages.push(imageInfo);
          
          console.log('添加到上传列表:', {
            url: relativeUrl,
            filename: originalFilename,
            cleanFilename: safeFilename,
            alt: baseFilename,
            convertedFrom: convertedFrom
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

  // 下载外部图片到本地：POST /api/download-image
  if (parsed.pathname === '/api/download-image' && req.method === 'POST') {
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
      const targetDir = body && body.targetDir;
      
      if (!imageUrl) {
        sendJson(res, 400, { ok: false, code: 'MISSING_URL', message: '缺少 url 参数' });
        return;
      }
      
      if (!targetDir) {
        sendJson(res, 400, { ok: false, code: 'MISSING_TARGET_DIR', message: '缺少 targetDir 参数' });
        return;
      }
      
      // 验证目标目录
      let safeTargetDir;
      try {
        safeTargetDir = resolveSafePath(targetDir);
      } catch (e) {
        const code = e && e.message;
        sendJson(res, 403, { ok: false, code: code || 'INVALID_PATH', message: '目标目录无效或不在授权范围内' });
        return;
      }
      
      // 验证 URL 格式
      let targetUrl;
      try {
        targetUrl = new URL(imageUrl);
        if (!['http:', 'https:'].includes(targetUrl.protocol)) {
          sendJson(res, 400, { ok: false, code: 'INVALID_PROTOCOL', message: '仅支持 http/https 协议' });
          return;
        }
      } catch (e) {
        sendJson(res, 400, { ok: false, code: 'INVALID_URL', message: '无效的 URL' });
        return;
      }
      
      // 生成本地文件名
      const urlPath = targetUrl.pathname;
      const ext = path.extname(urlPath) || '.png';
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      const fileName = `downloaded_${timestamp}_${random}${ext}`;
      const localPath = path.join(safeTargetDir, fileName);
      
      // 确保目标目录存在
      fs.mkdir(safeTargetDir, { recursive: true }, (mkErr) => {
        if (mkErr) {
          sendJson(res, 500, { ok: false, code: 'MKDIR_FAILED', message: '创建目录失败' });
          return;
        }
        
        // 下载图片
        const protocol = targetUrl.protocol === 'https:' ? require('https') : require('http');
        const file = fs.createWriteStream(localPath);
        
        const downloadReq = protocol.get(imageUrl, (downloadRes) => {
          if (downloadRes.statusCode !== 200) {
            fs.unlink(localPath, () => {});
            sendJson(res, downloadRes.statusCode, { 
              ok: false, 
              code: 'DOWNLOAD_ERROR', 
              message: `下载失败: ${downloadRes.statusCode}` 
            });
            return;
          }
          
          downloadRes.pipe(file);
          
          file.on('finish', () => {
            file.close(() => {
              sendJson(res, 200, { 
                ok: true, 
                originalUrl: imageUrl,
                localPath: localPath,
                fileName: fileName
              });
            });
          });
        });
        
        downloadReq.on('error', (err) => {
          fs.unlink(localPath, () => {});
          console.error('Download error:', err);
          sendJson(res, 500, { 
            ok: false, 
            code: 'DOWNLOAD_ERROR', 
            message: '下载失败: ' + err.message 
          });
        });
        
        file.on('error', (err) => {
          fs.unlink(localPath, () => {});
          console.error('File write error:', err);
          sendJson(res, 500, { 
            ok: false, 
            code: 'WRITE_ERROR', 
            message: '写入文件失败: ' + err.message 
          });
        });
        
        // 设置超时
        downloadReq.setTimeout(30000, () => {
          downloadReq.destroy();
          file.close(() => {
            fs.unlink(localPath, () => {});
          });
          sendJson(res, 504, { 
            ok: false, 
            code: 'TIMEOUT', 
            message: '下载超时' 
          });
        });
      });
    });
    return;
  }

  // 图片代理服务：GET /api/proxy-image?url=https://example.com/image.png
  if (parsed.pathname === '/api/proxy-image' && req.method === 'GET') {
    const imageUrl = parsed.query.url;
    
    if (!imageUrl) {
      sendJson(res, 400, { ok: false, code: 'MISSING_URL', message: '缺少 url 参数' });
      return;
    }
    
    // 验证 URL 格式
    let targetUrl;
    try {
      targetUrl = new URL(imageUrl);
      if (!['http:', 'https:'].includes(targetUrl.protocol)) {
        sendJson(res, 400, { ok: false, code: 'INVALID_PROTOCOL', message: '仅支持 http/https 协议' });
        return;
      }
    } catch (e) {
      sendJson(res, 400, { ok: false, code: 'INVALID_URL', message: '无效的 URL' });
      return;
    }
    
    // 使用 http/https 模块代理请求
    const protocol = targetUrl.protocol === 'https:' ? require('https') : require('http');
    
    const proxyReq = protocol.get(imageUrl, (proxyRes) => {
      // 检查响应状态
      if (proxyRes.statusCode !== 200) {
        sendJson(res, proxyRes.statusCode, { 
          ok: false, 
          code: 'PROXY_ERROR', 
          message: `代理请求失败: ${proxyRes.statusCode}` 
        });
        return;
      }
      
      // 转发响应头
      const contentType = proxyRes.headers['content-type'] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400'
      });
      
      // 转发响应体
      proxyRes.pipe(res);
    });
    
    proxyReq.on('error', (err) => {
      console.error('Proxy request error:', err);
      if (!res.headersSent) {
        sendJson(res, 500, { 
          ok: false, 
          code: 'PROXY_ERROR', 
          message: '代理请求失败: ' + err.message 
        });
      }
    });
    
    // 设置超时
    proxyReq.setTimeout(10000, () => {
      proxyReq.destroy();
      if (!res.headersSent) {
        sendJson(res, 504, { 
          ok: false, 
          code: 'TIMEOUT', 
          message: '代理请求超时' 
        });
      }
    });
    
    return;
  }

  // 静态文件服务

  // 图片静态文件服务：/images/...
  if (parsed.pathname.startsWith('/images/')) {
    try {
      // 解码 URL 路径以处理中文文件名
      const decodedPathname = decodeURIComponent(parsed.pathname);
      // 移除 /images 前缀，拼接到共享目录下
      const imagePath = path.join('/var/apps/App.Native.MdEditor2/shares/images', decodedPathname.substring('/images/'.length));
      
      console.log('Image request:', imagePath);
      
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
