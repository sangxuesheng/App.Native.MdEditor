# 🚀 多图床支持 - 集成执行清单

## 📊 当前状态

**完成度**: 75% (Phase 1-3 完成)  
**待集成**: 后端 + 前端  
**预计时间**: 1-2 小时

---

## ✅ 已完成的准备工作

- ✅ 后端适配器代码 (10 个文件)
- ✅ 前端 UI 组件 (4 个文件)
- ✅ API 路由设计
- ✅ 数据库设计
- ✅ 详细文档

---

## 🔧 集成步骤

### 步骤 1: 后端集成 (30 分钟)

#### 1.1 检查图床模块文件
```bash
ls -la app/server/imagebed/
# 应该看到: ImageBedAdapter.js, LocalAdapter.js, GitHubAdapter.js 等
```

#### 1.2 集成到 server.js
参考 `IMAGEBED_SERVER_PATCH.js` 或 `IMAGEBED_PHASE2_GUIDE.md`

**需要添加的代码位置**:
1. 导入部分 (文件顶部)
2. 初始化部分 (createServer 之前)
3. multipart 解析函数
4. API 路由处理 (在现有路由中添加)

#### 1.3 安装依赖
```bash
cd app/server
npm install busboy qiniu ali-oss cos-nodejs-sdk-v5 @octokit/rest sharp
```

#### 1.4 验证后端
```bash
# 重启服务
appcenter-cli stop App.Native.MdEditor2
sleep 2
appcenter-cli start App.Native.MdEditor2

# 测试 API
curl http://localhost:18080/api/imagebed/list
# 预期: 返回 { ok: true, configs: [...] }
```

---

### 步骤 2: 前端集成 (30 分钟)

#### 2.1 检查前端组件文件
```bash
ls -la app/ui/frontend/src/components/ImagebedSettingsPanel.*
ls -la app/ui/frontend/src/components/AddImagebedDialog.*
# 应该看到 4 个文件 (.jsx 和 .css)
```

#### 2.2 集成到 ImageManagerDialog.jsx

**需要添加**:
1. 导入组件
2. 添加 'imagebed' 标签页按钮
3. 添加标签页内容

参考 `IMAGEBED_PHASE3_COMPLETION.md` 中的集成代码

#### 2.3 构建前端
```bash
cd app/ui/frontend
npm run build
```

#### 2.4 部署应用
```bash
cd /vol4/1000/开发文件夹/mac
bash build-and-deploy.sh --local
```

---

### 步骤 3: 功能验证 (30 分钟)

#### 3.1 访问应用
```
http://192.168.2.2:18080/
```

#### 3.2 测试流程
1. 打开图片管理对话框
2. 切换到"图床设置"标签页
3. 点击"添加新图床"
4. 选择 GitHub 类型
5. 填写配置信息
6. 点击"测试连接"
7. 保存配置
8. 设置为默认图床
9. 上传图片测试

---

## 📋 详细集成代码

### 后端集成 (server.js)

**位置 1: 导入部分 (第 20 行附近)**
```javascript
const { ImageBedManager } = require('./imagebed');
const { handleImagebedApi } = require('./imagebedApi');
```

**位置 2: 初始化 (第 800 行附近，createServer 之前)**
```javascript
// 初始化图床管理器
const imagebedManager = new ImageBedManager(getDb());
imagebedManager.initialize().catch(err => {
  console.error('Failed to initialize ImageBedManager:', err);
});
```

**位置 3: multipart 解析函数 (第 850 行附近)**
```javascript
function readMultipartBody(req, boundary) {
  return new Promise((resolve, reject) => {
    const busboy = require('busboy');
    const bb = busboy({ headers: { 'content-type': `multipart/form-data; boundary=${boundary}` } });
    const files = [];
    const fields = {};
    
    bb.on('file', (name, file, info) => {
      const chunks = [];
      file.on('data', chunk => chunks.push(chunk));
      file.on('end', () => {
        files.push({ name, buffer: Buffer.concat(chunks), info });
      });
    });
    
    bb.on('field', (name, val) => { fields[name] = val; });
    bb.on('finish', () => resolve({ files, fields }));
    bb.on('error', reject);
    req.pipe(bb);
  });
}
```

**位置 4: API 路由 (第 1200 行附近，在现有路由中添加)**
```javascript
// 图床 API 路由
if (pathname.startsWith('/api/imagebed') || pathname.startsWith('/api/image')) {
  await handleImagebedApi(req, res, pathname, parsedUrl.query, imagebedManager, readMultipartBody);
  return;
}
```

### 前端集成 (ImageManagerDialog.jsx)

**位置 1: 导入 (第 10 行附近)**
```javascript
import ImagebedSettingsPanel from './ImagebedSettingsPanel'
```

**位置 2: 标签页按钮 (在现有标签页按钮后添加)**
```javascript
<button
  className={`tab-button ${activeTab === 'imagebed' ? 'active' : ''}`}
  onClick={() => setActiveTab('imagebed')}
>
  <Settings size={18} />
  <span>图床设置</span>
</button>
```

**位置 3: 标签页内容 (在现有标签页内容后添加)**
```javascript
{activeTab === 'imagebed' && (
  <div className="imagebed-tab">
    <ImagebedSettingsPanel
      onNotify={onNotify}
      theme={theme}
    />
  </div>
)}
```

---

## 🧪 快速测试命令

### 后端 API 测试
```bash
# 1. 获取图床列表
curl http://localhost:18080/api/imagebed/list

# 2. 添加本地图床（测试）
curl -X POST http://localhost:18080/api/imagebed/add \
  -H "Content-Type: application/json" \
  -d '{"name":"本地存储","type":"local","config":{}}'

# 3. 测试上传
curl -X POST http://localhost:18080/api/image/upload \
  -F "images=@test.jpg"
```

---

## ⚠️ 常见问题

### 问题 1: API 返回 404
**原因**: 路由未正确添加  
**解决**: 检查 server.js 中的路由处理代码

### 问题 2: 上传失败
**原因**: busboy 未安装或 multipart 解析错误  
**解决**: 运行 `npm install busboy`

### 问题 3: 前端组件不显示
**原因**: 组件未正确导入或标签页未添加  
**解决**: 检查 ImageManagerDialog.jsx 中的导入和标签页代码

### 问题 4: 样式错误
**原因**: CSS 文件未正确加载  
**解决**: 检查 CSS 文件路径和导入

---

## 📊 完成标准

- [ ] 后端 API 正常响应
- [ ] 前端组件正常显示
- [ ] 可以添加图床配置
- [ ] 可以测试连接
- [ ] 可以设置默认图床
- [ ] 可以删除图床
- [ ] 可以上传图片
- [ ] 没有控制台错误

---

## 🎯 下一步行动

1. **立即执行**: 后端集成 (参考 IMAGEBED_SERVER_PATCH.js)
2. **然后执行**: 前端集成 (参考上面的代码)
3. **最后执行**: 构建部署测试

**预计总时间**: 1-2 小时

---

**状态**: 准备就绪 🚀  
**最后更新**: 2024年
