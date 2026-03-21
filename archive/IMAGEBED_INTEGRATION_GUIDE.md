/**
 * Phase 2: 集成图床管理器到 server.js
 * 
 * 这个文件包含需要添加到 server.js 的代码片段
 * 按照标记的位置进行集成
 */

// ============================================================================
// 第 1 步：在 server.js 顶部添加导入（在其他 require 之后）
// ============================================================================

// 在这一行之后：
// const { getDb } = require('./db');

// 添加以下代码：
const { ImageBedManager } = require('./imagebed');

// ============================================================================
// 第 2 步：在 server.js 中初始化 ImageBedManager（在 http.createServer 之前）
// ============================================================================

// 在这一行之前：
// const server = http.createServer(async (req, res) => {

// 添加以下代码：

// 初始化图床管理器
let imagebedManager = null;
try {
  const db = getDb();
  imagebedManager = new ImageBedManager(db, getAiConfigEncryptionKey());
  console.log('[ImageBed] Manager initialized successfully');
} catch (err) {
  console.error('[ImageBed] Failed to initialize manager:', err);
}

// ============================================================================
// 第 3 步：在 server.js 中添加图床 API 路由处理
// ============================================================================

// 在 http.createServer 的回调函数中，在现有的 API 路由之后添加：
// （建议在 "图片列表：GET /api/image/list" 之前添加）

// 导入图床 API 处理函数
const {
  handleImagebedApi,
  handleImageUploadApi,
  handleImageManagementApi,
  handleLocalImageAccess,
} = require('./imagebedApi');

// 在路由处理中添加以下代码（在 CORS 预检之后，其他 API 之前）：

// 图床 API 路由
if (imagebedManager) {
  // 处理图床配置 API
  if (handleImagebedApi(req, res, parsed.pathname, parsed.query, body, imagebedManager, sendJson)) {
    return;
  }

  // 处理本地图片访问
  const localAdapter = imagebedManager.adapters.get(1); // 本地存储通常是 ID 1
  if (localAdapter && handleLocalImageAccess(req, res, parsed.pathname, localAdapter)) {
    return;
  }

  // 处理图片管理 API
  if (handleImageManagementApi(req, res, parsed.pathname, parsed.query, body, imagebedManager, sendJson)) {
    return;
  }
}

// ============================================================================
// 第 4 步：处理文件上传（multipart/form-data）
// ============================================================================

// 需要添加一个 multipart 表单解析函数
// 在 server.js 中添加以下辅助函数（在 readJsonBody 函数之后）：

function readMultipartBody(req, maxBytes = 100 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const busboy = require('busboy')({ headers: req.headers });
    const files = [];
    const fields = {};

    busboy.on('file', (fieldname, file, info) => {
      const chunks = [];
      let size = 0;

      file.on('data', (data) => {
        size += data.length;
        if (size > maxBytes) {
          file.destroy();
          reject(new Error('FILE_TOO_LARGE'));
        }
        chunks.push(data);
      });

      file.on('end', () => {
        files.push({
          fieldname,
          filename: info.filename,
          encoding: info.encoding,
          mimetype: info.mimeType,
          buffer: Buffer.concat(chunks),
        });
      });

      file.on('error', reject);
    });

    busboy.on('field', (fieldname, val) => {
      fields[fieldname] = val;
    });

    busboy.on('finish', () => {
      resolve({ files, fields });
    });

    busboy.on('error', reject);

    req.pipe(busboy);
  });
}

// ============================================================================
// 第 5 步：在 package.json 中添加 busboy 依赖
// ============================================================================

// 在 app/server/package.json 中的 dependencies 中添加：
// "busboy": "^1.6.0"

// ============================================================================
// 完整的集成流程
// ============================================================================

/*
1. 在 server.js 顶部添加导入：
   const { ImageBedManager } = require('./imagebed');

2. 在 http.createServer 之前初始化：
   let imagebedManager = null;
   try {
     const db = getDb();
     imagebedManager = new ImageBedManager(db, getAiConfigEncryptionKey());
   } catch (err) {
     console.error('[ImageBed] Failed to initialize manager:', err);
   }

3. 在 http.createServer 回调中添加路由处理：
   - 导入 imagebedApi 中的处理函数
   - 在 CORS 预检之后添加图床 API 路由
   - 处理本地图片访问
   - 处理图片管理 API

4. 添加 multipart 表单解析函数

5. 更新 package.json 添加 busboy 依赖

6. 运行 npm install 安装依赖

7. 重启服务
*/

// ============================================================================
// 测试 API
// ============================================================================

/*
# 获取所有图床配置
curl http://localhost:18080/api/imagebed/list

# 添加 GitHub 图床
curl -X POST http://localhost:18080/api/imagebed/add \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My GitHub",
    "type": "github",
    "config": {
      "owner": "username",
      "repo": "images",
      "branch": "main",
      "token": "github_pat_xxx",
      "path": "images/"
    }
  }'

# 测试连接
curl -X POST http://localhost:18080/api/imagebed/1/test

# 设置默认图床
curl -X PUT http://localhost:18080/api/imagebed/1/default

# 获取图片列表
curl http://localhost:18080/api/image/list

# 上传图片
curl -X POST http://localhost:18080/api/image/upload \
  -F "images=@test.jpg" \
  -F "imagebedId=1"
*/
