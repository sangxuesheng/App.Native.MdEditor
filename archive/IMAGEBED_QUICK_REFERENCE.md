# 多图床支持快速参考

## 🎯 已完成的工作

### Phase 1: 架构与后端实现 ✅ 完成

**创建的文件**：
```
app/server/imagebed/
├── ImageBedAdapter.js          # 基类 (100 行)
├── LocalAdapter.js             # 本地存储 (227 行)
├── GitHubAdapter.js            # GitHub (220 行)
├── QiniuAdapter.js             # 七牛云 (215 行)
├── AliyunOSSAdapter.js         # 阿里云 (190 行)
├── TencentCOSAdapter.js        # 腾讯云 (229 行)
├── CustomAdapter.js            # 自定义 (191 行)
├── ImageBedManager.js          # 管理器 (426 行)
└── index.js                    # 导出

app/server/
├── imagebedApi.js              # API 路由 (272 行)
├── db.js                       # 数据库 (已更新)
└── package.json                # 依赖 (已更新)
```

**总代码量**: ~1,870 行

---

## 📦 支持的图床

| 图床 | 类型 | 特点 | 配置项 |
|------|------|------|--------|
| 本地存储 | `local` | 无需配置，开箱即用 | basePath |
| GitHub | `github` | 免费无限，版本控制 | owner, repo, token, branch, path |
| 七牛云 | `qiniu` | 国内快速，免费额度 | accessKey, secretKey, bucket, domain, zone |
| 阿里云 OSS | `aliyun` | 国内主流，功能完整 | region, accessKeyId, accessKeySecret, bucket, domain |
| 腾讯云 COS | `tencent` | 腾讯生态，多区域 | secretId, secretKey, bucket, region, domain |
| 自定义 | `custom` | 灵活配置，任何 API | uploadUrl, deleteUrl, listUrl, headers |

---

## 🔌 API 端点

### 图床配置管理
```
GET    /api/imagebed/list              # 获取所有图床
GET    /api/imagebed/:id               # 获取指定图床
POST   /api/imagebed/add               # 添加新图床
PUT    /api/imagebed/:id               # 更新图床配置
DELETE /api/imagebed/:id               # 删除图床
POST   /api/imagebed/:id/test          # 测试连接
PUT    /api/imagebed/:id/default       # 设置默认图床
```

### 图片管理
```
POST   /api/image/upload               # 上传图片
GET    /api/image/list                 # 获取图片列表
DELETE /api/image/:id                  # 删除图片
GET    /api/image/local/:filename      # 获取本地图片
```

---

## 🚀 快速开始

### 1. 安装依赖
```bash
cd /vol4/1000/开发文件夹/mac/app/server
npm install
```

### 2. 在 server.js 中集成（待做）
```javascript
const { ImageBedManager } = require('./imagebed');
const { getDb } = require('./db');

// 初始化
const db = getDb();
const encryptionKey = getAiConfigEncryptionKey(); // 使用现有的加密密钥
const imagebedManager = new ImageBedManager(db, encryptionKey);

// 在路由处理中使用
if (handleImagebedApi(req, res, pathname, query, body, imagebedManager, sendJson)) {
  return;
}
```

### 3. 前端集成（Phase 2）
- 在图片管理对话框中添加"图床设置"标签页
- 实现图床配置 UI
- 实现上传时选择图床

---

## 💾 数据库表

### imagebed_configs
```sql
CREATE TABLE imagebed_configs (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE,
  type TEXT,
  is_default INTEGER,
  config_json TEXT,  -- 加密存储
  created_at INTEGER,
  updated_at INTEGER
);
```

### imagebed_images
```sql
CREATE TABLE imagebed_images (
  id TEXT PRIMARY KEY,
  filename TEXT,
  original_name TEXT,
  size INTEGER,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  imagebed_id INTEGER,
  imagebed_type TEXT,
  imagebed_url TEXT,
  local_path TEXT,
  description TEXT,
  tags TEXT,
  created_at INTEGER,
  updated_at INTEGER
);
```

---

## 🔐 安全特性

1. **配置加密** - 使用 AES-GCM 加密敏感信息（API Key）
2. **路径验证** - 本地存储防止路径遍历攻击
3. **文件类型验证** - 只允许图片格式
4. **访问控制** - 支持权限验证

---

## 📊 架构图

```
┌─────────────────────────────────────────┐
│         前端 (React)                     │
│  图片管理对话框 → 图床设置面板           │
└────────────────┬────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────┐
│      后端 API (imagebedApi.js)           │
│  /api/imagebed/* /api/image/*            │
└────────────────┬────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────┐
│    ImageBedManager (管理器)              │
│  - 配置管理                              │
│  - 适配器缓存                            │
│  - 图片元数据                            │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┬────────┬────────┬────────┐
        ↓                 ↓        ↓        ↓        ↓
    ┌────────┐      ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
    │ Local  │      │GitHub  │ │ Qiniu  │ │Aliyun  │ │Tencent │
    │Adapter │      │Adapter │ │Adapter │ │Adapter │ │Adapter │
    └────────┘      └────────┘ └────────┘ └────────┘ └────────┘
        │                │         │         │         │
        ↓                ↓         ↓         ↓         ↓
    本地文件系统    GitHub API  七牛云API  阿里云API  腾讯云API
```

---

## 🎓 使用示例

### 添加图床
```javascript
// 添加 GitHub 图床
const id = imagebedManager.addConfig('My GitHub', 'github', {
  owner: 'username',
  repo: 'images',
  branch: 'main',
  token: 'github_pat_xxx',
  path: 'images/'
});

// 添加七牛云图床
const id = imagebedManager.addConfig('Qiniu', 'qiniu', {
  accessKey: 'xxx',
  secretKey: 'xxx',
  bucket: 'my-bucket',
  domain: 'https://cdn.example.com',
  zone: 'Zone_CN_East'
});
```

### 上传图片
```javascript
// 上传到默认图床
const result = await imagebedManager.uploadImage(fileBuffer, {
  filename: 'test.jpg',
  mimeType: 'image/jpeg'
});

// 上传到指定图床
const result = await imagebedManager.uploadImage(fileBuffer, {
  filename: 'test.jpg',
  mimeType: 'image/jpeg',
  imagebedId: 2  // 指定图床 ID
});
```

### 获取图片列表
```javascript
const list = imagebedManager.getImageList({
  page: 1,
  limit: 20,
  imagebedId: 2  // 可选，指定图床
});
```

### 删除图片
```javascript
await imagebedManager.deleteImage(imageId);
```

---

## ⚙️ 配置示例

### GitHub
```json
{
  "owner": "username",
  "repo": "images",
  "branch": "main",
  "token": "github_pat_11XXXXX",
  "path": "images/"
}
```

### 七牛云
```json
{
  "accessKey": "xxx",
  "secretKey": "xxx",
  "bucket": "my-bucket",
  "domain": "https://cdn.example.com",
  "zone": "Zone_CN_East"
}
```

### 阿里云 OSS
```json
{
  "region": "oss-cn-hangzhou",
  "accessKeyId": "xxx",
  "accessKeySecret": "xxx",
  "bucket": "my-bucket",
  "domain": "https://my-bucket.oss-cn-hangzhou.aliyuncs.com"
}
```

### 腾讯云 COS
```json
{
  "secretId": "xxx",
  "secretKey": "xxx",
  "bucket": "my-bucket-1234567890",
  "region": "ap-beijing",
  "domain": "https://my-bucket-1234567890.cos.ap-beijing.myqcloud.com"
}
```

### 自定义图床
```json
{
  "uploadUrl": "https://api.example.com/upload",
  "deleteUrl": "https://api.example.com/delete",
  "listUrl": "https://api.example.com/list",
  "headers": {
    "Authorization": "Bearer token"
  },
  "uploadFieldName": "file",
  "responseUrlPath": "data.url"
}
```

---

## 📋 下一步

### Phase 2: 集成到主服务
- [ ] 在 server.js 中初始化 ImageBedManager
- [ ] 集成 imagebedApi 路由
- [ ] 实现多部分表单解析

### Phase 3: 前端 UI
- [ ] 图床设置面板
- [ ] 添加图床对话框
- [ ] 图床选择器
- [ ] 集成到图片管理

### Phase 4: 测试与优化
- [ ] 功能测试
- [ ] 错误处理
- [ ] 性能优化
- [ ] 文档完善

---

## 📞 技术支持

所有适配器都遵循统一的接口规范，可以轻松扩展新的图床服务。

关键方法：
- `upload(fileBuffer, options)` - 上传图片
- `delete(url)` - 删除图片
- `list(options)` - 获取列表
- `testConnection()` - 测试连接
- `validateConfig(config)` - 验证配置

---

**完成时间**: 2024年
**总工作量**: ~1,870 行代码
**支持图床**: 6 种 (本地 + 5 个云服务)
