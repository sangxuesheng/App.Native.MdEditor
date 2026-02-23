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
  // 如果 rel 为空字符串，说明 target 就是 root，也应该允许
  // 如果 rel 不以 .. 开头且不是绝对路径，说明 target 在 root 下
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
            // 过滤隐藏文件和特殊目录
            if (entry.name.startsWith('.')) return false;
            // 只显示目录和 .md 文件
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
            // 目录排在前面
            if (a.type !== b.type) {
              return a.type === 'directory' ? -1 : 1;
            }
            // 同类型按名称排序
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

  // 文件保存：POST /api/file  body: { path: "/abs/...", content: "..." }
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

  // 静态文件服务
  const staticPath = path.join(STATIC_DIR, parsed.pathname === '/' ? 'index.html' : parsed.pathname);
  
  // 检查是否为静态文件请求
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

  // SPA 回退：所有非 API 请求返回 index.html
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
