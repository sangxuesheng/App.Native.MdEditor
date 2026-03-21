/**
 * server.js 集成补丁
 * 
 * 这个文件包含需要添加到 server.js 的代码
 * 请按照注释中的位置进行集成
 */

// ============================================================================
// 位置 1：在 server.js 顶部的 require 部分添加（在 const { getDb } = require('./db'); 之后）
// ============================================================================

const { ImageBedManager } = require('./imagebed');
const {
  handleImagebedApi,
  handleImageUploadApi,
  handleImageManagementApi,
  handleLocalImageAccess,
} = require('./imagebedApi');

// ============================================================================
// 位置 2：在 http.createServer 之前添加初始化代码
// ============================================================================

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
// 位置 3：在 http.createServer 回调中添加 multipart 解析函数
// ============================================================================

// 在 readJsonBody 函数之后添加以下函数：

function readMultipartBody(req, maxBytes = 100 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    try {
      const busboy = require('busboy')({ headers: req.headers });
      const files = [];
      const fields = {};
      let totalSize = 0;

      busboy.on('file', (fieldname, file, info) => {
        const chunks = [];

        file.on('data', (data) => {
          totalSize += data.length;
          if (totalSize > maxBytes) {
            file.destroy();
            busboy.destroy();
            reject(new Error('PAYLOAD_TOO_LARGE'));
            return;
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
            originalname: info.filename,
          });
        });

        file.on('error', (err) => {
          busboy.destroy();
          reject(err);
        });
      });

      busboy.on('field', (fieldname, val) => {
        fields[fieldname] = val;
      });

      busboy.on('finish', () => {
        resolve({ files, fields });
      });

      busboy.on('error', (err) => {
        reject(err);
      });

      req.pipe(busboy);
    } catch (err) {
      reject(err);
    }
  });
}

// ============================================================================
// 位置 4：在 http.createServer 回调中添加图床 API 路由
// ============================================================================

// 在 CORS 预检处理之后、其他 API 路由之前添加以下代码：

// 图床配置管理 API
if (imagebedManager && handleImagebedApi(req, res, parsed.pathname, parsed.query, body, imagebedManager, sendJson)) {
  return;
}

// 图片上传 API（需要处理 multipart/form-data）
if (imagebedManager && req.method === 'POST' && parsed.pathname === '/api/image/upload') {
  (async () => {
    try {
      const { files, fields } = await readMultipartBody(req);
      
      if (!files || files.length === 0) {
        sendJson(res, 400, { ok: false, error: 'No files uploaded' });
        return;
      }

      const imagebedId = fields.imagebedId ? parseInt(fields.imagebedId) : undefined;
      const uploadedImages = [];
      const errors = [];

      for (const file of files) {
        try {
          const result = await imagebedManager.uploadImage(file.buffer, {
            filename: file.originalname,
            mimeType: file.mimetype,
            imagebedId,
          });

          uploadedImages.push({
            id: result.id,
            filename: result.filename,
            url: result.url,
            size: result.size,
            alt: file.originalname.replace(/\.[^.]+$/, ''),
          });
        } catch (err) {
          console.error('[API] Error uploading file:', err);
          errors.push({
            filename: file.originalname,
            error: err.message,
          });
        }
      }

      if (uploadedImages.length === 0) {
        sendJson(res, 500, { ok: false, error: 'Failed to upload any files', errors });
        return;
      }

      sendJson(res, 200, { ok: true, images: uploadedImages, errors: errors.length > 0 ? errors : undefined });
    } catch (err) {
      console.error('[API] Error in upload handler:', err);
      if (err.message === 'PAYLOAD_TOO_LARGE') {
        sendJson(res, 413, { ok: false, error: 'File too large' });
      } else {
        sendJson(res, 500, { ok: false, error: err.message });
      }
    }
  })();
  return;
}

// 图片管理 API
if (imagebedManager && handleImageManagementApi(req, res, parsed.pathname, parsed.query, body, imagebedManager, sendJson)) {
  return;
}

// 本地图片访问
if (imagebedManager && parsed.pathname.startsWith('/api/image/local/')) {
  try {
    const defaultConfigId = imagebedManager.getDefaultConfig();
    if (defaultConfigId) {
      imagebedManager.getAdapter(defaultConfigId).then(adapter => {
        if (adapter && adapter.type === 'local' && handleLocalImageAccess(req, res, parsed.pathname, adapter)) {
          return;
        }
      }).catch(err => {
        console.error('[API] Error getting local adapter:', err);
      });
    }
  } catch (err) {
    console.error('[API] Error handling local image access:', err);
  }
}

// ============================================================================
// 位置 5：更新 package.json
// ============================================================================

// 在 app/server/package.json 的 dependencies 中添加：
// "busboy": "^1.6.0"

// 完整的 dependencies 应该包含：
/*
{
  "dependencies": {
    "better-sqlite3": "^11.7.0",
    "heic-convert": "^2.1.0",
    "mathjax": "^4.1.1",
    "pdf-parse": "^2.4.5",
    "tencentcloud-sdk-nodejs-hunyuan": "^4.1.188",
    "qiniu": "^7.12.0",
    "ali-oss": "^6.20.0",
    "cos-nodejs-sdk-v5": "^2.12.0",
    "@octokit/rest": "^19.0.0",
    "sharp": "^0.33.0",
    "busboy": "^1.6.0"
  }
}
*/

// ============================================================================
// 集成步骤总结
// ============================================================================

/*
1. 打开 /vol4/1000/开发文件夹/mac/app/server/server.js

2. 在顶部的 require 部分（const { getDb } = require('./db'); 之后）添加：
   const { ImageBedManager } = require('./imagebed');
   const {
     handleImagebedApi,
     handleImageUploadApi,
     handleImageManagementApi,
     handleLocalImageAccess,
   } = require('./imagebedApi');

3. 在 http.createServer 之前添加初始化代码：
   let imagebedManager = null;
   try {
     const db = getDb();
     imagebedManager = new ImageBedManager(db, getAiConfigEncryptionKey());
     console.log('[ImageBed] Manager initialized successfully');
   } catch (err) {
     console.error('[ImageBed] Failed to initialize manager:', err);
   }

4. 在 readJsonBody 函数之后添加 readMultipartBody 函数

5. 在 http.createServer 回调中的 CORS 预检处理之后添加图床 API 路由处理

6. 更新 package.json 添加 busboy 依赖

7. 运行命令：
   cd /vol4/1000/开发文件夹/mac/app/server
   npm install

8. 重启服务进行测试
*/
