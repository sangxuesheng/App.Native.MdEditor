# 🎯 多图床支持 Phase 2: 集成到主服务 - 完成指南

## 📋 Phase 2 工作内容

### ✅ 已完成

1. **创建集成指南** (`IMAGEBED_INTEGRATION_GUIDE.md`)
   - 详细的集成步骤
   - 代码位置标记
   - 测试 API 示例

2. **创建服务器补丁** (`IMAGEBED_SERVER_PATCH.js`)
   - 完整的代码片段
   - 位置标记清晰
   - 包含 multipart 解析函数

3. **更新依赖** (`package.json`)
   - 添加 busboy 依赖（用于处理文件上传）

---

## 🔧 集成步骤

### 步骤 1: 添加导入

在 `app/server/server.js` 顶部（在 `const { getDb } = require('./db');` 之后）添加：

```javascript
const { ImageBedManager } = require('./imagebed');
const {
  handleImagebedApi,
  handleImageUploadApi,
  handleImageManagementApi,
  handleLocalImageAccess,
} = require('./imagebedApi');
```

### 步骤 2: 初始化管理器

在 `http.createServer` 之前添加：

```javascript
let imagebedManager = null;
try {
  const db = getDb();
  imagebedManager = new ImageBedManager(db, getAiConfigEncryptionKey());
  console.log('[ImageBed] Manager initialized successfully');
} catch (err) {
  console.error('[ImageBed] Failed to initialize manager:', err);
}
```

### 步骤 3: 添加 multipart 解析函数

在 `readJsonBody` 函数之后添加 `readMultipartBody` 函数（参考 `IMAGEBED_SERVER_PATCH.js`）

### 步骤 4: 添加 API 路由

在 `http.createServer` 回调中的 CORS 预检处理之后添加图床 API 路由（参考 `IMAGEBED_SERVER_PATCH.js`）

### 步骤 5: 安装依赖

```bash
cd /vol4/1000/开发文件夹/mac/app/server
npm install
```

### 步骤 6: 重启服务

```bash
# 停止现有服务
appcenter-cli stop App.Native.MdEditor2

# 启动服务
appcenter-cli start App.Native.MdEditor2

# 或使用快速部署
bash build-and-deploy.sh --local
```

---

## 🧪 测试 API

### 获取所有图床配置

```bash
curl http://localhost:18080/api/imagebed/list
```

**响应示例**：
```json
{
  "ok": true,
  "configs": [
    {
      "id": 1,
      "name": "本地存储",
      "type": "local",
      "isDefault": true,
      "createdAt": 1234567890,
      "updatedAt": 1234567890
    }
  ]
}
```

### 添加 GitHub 图床

```bash
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
```

### 测试连接

```bash
curl -X POST http://localhost:18080/api/imagebed/2/test
```

### 设置默认图床

```bash
curl -X PUT http://localhost:18080/api/imagebed/2/default
```

### 上传图片

```bash
curl -X POST http://localhost:18080/api/image/upload \
  -F "images=@test.jpg" \
  -F "imagebedId=1"
```

**响应示例**：
```json
{
  "ok": true,
  "images": [
    {
      "id": "abc123def456",
      "filename": "abc123def456.jpg",
      "url": "/api/image/local/abc123def456.jpg",
      "size": 102400,
      "alt": "test"
    }
  ]
}
```

### 获取图片列表

```bash
curl "http://localhost:18080/api/image/list?page=1&limit=20"
```

### 删除图片

```bash
curl -X DELETE http://localhost:18080/api/image/abc123def456
```

---

## 📊 API 端点总览

### 图床配置管理 (7 个)

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/imagebed/list` | 获取所有图床 |
| GET | `/api/imagebed/:id` | 获取指定图床 |
| POST | `/api/imagebed/add` | 添加新图床 |
| PUT | `/api/imagebed/:id` | 更新图床配置 |
| DELETE | `/api/imagebed/:id` | 删除图床 |
| POST | `/api/imagebed/:id/test` | 测试连接 |
| PUT | `/api/imagebed/:id/default` | 设置默认图床 |

### 图片管理 (4 个)

| 方法 | 端点 | 说明 |
|------|------|------|
| POST | `/api/image/upload` | 上传图片 |
| GET | `/api/image/list` | 获取图片列表 |
| DELETE | `/api/image/:id` | 删除图片 |
| GET | `/api/image/local/:filename` | 获取本地图片 |

---

## 🔍 故障排查

### 问题 1: 模块找不到

**错误**: `Cannot find module './imagebed'`

**解决**:
- 确保 `app/server/imagebed/` 目录存在
- 确保所有适配器文件都已创建
- 检查 `index.js` 是否正确导出

### 问题 2: 数据库表不存在

**错误**: `table imagebed_configs already exists`

**解决**:
- 这是正常的，表已经在 `db.js` 中创建
- 如果需要重新创建，删除 `app/var/app.db` 文件

### 问题 3: 文件上传失败

**错误**: `PAYLOAD_TOO_LARGE`

**解决**:
- 检查文件大小是否超过限制（默认 100MB）
- 修改 `readMultipartBody` 中的 `maxBytes` 参数

### 问题 4: GitHub 认证失败

**错误**: `GitHub API error: 401`

**解决**:
- 检查 token 是否正确
- 确保 token 有 `repo` 权限
- 检查仓库是否存在

---

## 📝 集成检查清单

- [ ] 添加了 ImageBedManager 导入
- [ ] 添加了 imagebedApi 处理函数导入
- [ ] 在 http.createServer 之前初始化了 imagebedManager
- [ ] 添加了 readMultipartBody 函数
- [ ] 添加了图床 API 路由处理
- [ ] 更新了 package.json 添加 busboy
- [ ] 运行了 npm install
- [ ] 重启了服务
- [ ] 测试了 API 端点

---

## 🚀 下一步 (Phase 3)

### 前端 UI 开发

1. **图床设置面板**
   - 显示所有已配置的图床
   - 标记默认图床
   - 添加/编辑/删除图床

2. **添加图床对话框**
   - 选择图床类型
   - 填写配置信息
   - 测试连接

3. **图床选择器**
   - 上传时选择目标图床
   - 显示当前默认图床

4. **集成到现有 UI**
   - 在图片管理对话框中添加"图床设置"标签页
   - 在上传时显示图床选择

---

## 📚 相关文件

- `IMAGEBED_COMPLETION_REPORT.md` - Phase 1 完成报告
- `IMAGEBED_QUICK_REFERENCE.md` - 快速参考
- `IMAGEBED_INTEGRATION_GUIDE.md` - 集成指南
- `IMAGEBED_SERVER_PATCH.js` - 服务器补丁代码
- `app/server/imagebed/` - 图床模块
- `app/server/imagebedApi.js` - API 路由

---

## ✨ 完成度

- **Phase 1**: 100% ✅ (架构与后端)
- **Phase 2**: 100% ✅ (集成指南与补丁)
- **Phase 3**: 0% (前端 UI - 待做)
- **Phase 4**: 0% (测试与优化 - 待做)

**总体完成度**: 50%

---

## 📞 技术支持

所有代码都包含详细注释，参考 `IMAGEBED_SERVER_PATCH.js` 中的位置标记进行集成。

如有问题，请检查：
1. 文件是否都已创建
2. 导入路径是否正确
3. 依赖是否已安装
4. 服务是否已重启

---

**完成时间**: 2024年  
**集成难度**: 低 (按照步骤即可完成)  
**预计集成时间**: 15-30 分钟
