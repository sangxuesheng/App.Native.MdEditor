# 🔧 多图床支持 - 实际集成执行指南

## 📋 目录

1. [后端集成](#后端集成)
2. [前端集成](#前端集成)
3. [构建部署](#构建部署)
4. [验证测试](#验证测试)
5. [故障排查](#故障排查)

---

## 后端集成

### 位置 1: 导入部分 (server.js 第 20 行附近)

**查找**: 其他 require 语句的位置

**添加以下代码**:
```javascript
const { ImageBedManager } = require('./imagebed');
const { handleImagebedApi } = require('./imagebedApi');
```

**示例**:
```javascript
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
// ... 其他 require ...
const historyManager = require('./historyManager');
const imageConverter = require('./imageConverter');
const { getDb } = require('./db');

// 👇 添加这两行
const { ImageBedManager } = require('./imagebed');
const { handleImagebedApi } = require('./imagebedApi');
```

---

### 位置 2: 初始化部分 (server.js 第 800 行附近)

**查找**: `const server = http.createServer(...)` 之前

**添加以下代码**:
```javascript
// 初始化图床管理器
const imagebedManager = new ImageBedManager(getDb());
imagebedManager.initialize().catch(err => {
  console.error('Failed to initialize ImageBedManager:', err);
});
```

**示例**:
```javascript
// ... 其他初始化代码 ...

// 👇 添加这段代码
// 初始化图床管理器
const imagebedManager = new ImageBedManager(getDb());
imagebedManager.initialize().catch(err => {
  console.error('Failed to initialize ImageBedManager:', err);
});

const server = http.createServer(async (req, res) => {
  // ... 服务器代码 ...
});
```

---

### 位置 3: multipart 解析函数 (server.js 第 850 行附近)

**查找**: 在 `http.createServer` 回调函数内部，其他辅助函数之后

**添加以下代码**:
```javascript
// multipart 表单解析函数
function readMultipartBody(req, boundary) {
  return new Promise((resolve, reject) => {
    const busboy = require('busboy');
    const bb = busboy({ 
      headers: { 
        'content-type': `multipart/form-data; boundary=${boundary}` 
      } 
    });
    const files = [];
    const fields = {};
    
    bb.on('file', (name, file, info) => {
      const chunks = [];
      file.on('data', chunk => chunks.push(chunk));
      file.on('end', () => {
        files.push({ 
          name, 
          buffer: Buffer.concat(chunks), 
          info 
        });
      });
    });
    
    bb.on('field', (name, val) => { 
      fields[name] = val; 
    });
    
    bb.on('finish', () => resolve({ files, fields }));
    bb.on('error', reject);
    
    req.pipe(bb);
  });
}
```

---

### 位置 4: API 路由处理 (server.js 第 1200 行附近)

**查找**: 在 `http.createServer` 回调函数内部，其他路由处理之后

**添加以下代码**:
```javascript
// 图床 API 路由
if (pathname.startsWith('/api/imagebed') || pathname.startsWith('/api/image')) {
  await handleImagebedApi(
    req, 
    res, 
    pathname, 
    parsedUrl.query, 
    imagebedManager, 
    readMultipartBody
  );
  return;
}
```

**示例**:
```javascript
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  
  // ... 其他路由处理 ...
  
  // 文件 API
  if (pathname === '/api/file/read') {
    // ... 处理代码 ...
    return;
  }
  
  // 👇 添加这段代码
  // 图床 API 路由
  if (pathname.startsWith('/api/imagebed') || pathname.startsWith('/api/image')) {
    await handleImagebedApi(
      req, 
      res, 
      pathname, 
      parsedUrl.query, 
      imagebedManager, 
      readMultipartBody
    );
    return;
  }
  
  // ... 其他路由处理 ...
});
```

---

### 后端集成验证

```bash
# 1. 检查导入
grep "ImageBedManager" app/server/server.js
# 应该看到: const { ImageBedManager } = require('./imagebed');

# 2. 检查初始化
grep "imagebedManager = new ImageBedManager" app/server/server.js
# 应该看到: const imagebedManager = new ImageBedManager(getDb());

# 3. 检查路由
grep "handleImagebedApi" app/server/server.js
# 应该看到: await handleImagebedApi(...)

# 4. 安装依赖
cd app/server
npm install

# 5. 重启服务
appcenter-cli stop App.Native.MdEditor2
sleep 2
appcenter-cli start App.Native.MdEditor2

# 6. 测试 API
curl http://localhost:18080/api/imagebed/list
# 预期: { "ok": true, "configs": [...] }
```

---

## 前端集成

### 位置 1: 导入部分 (ImageManagerDialog.jsx 第 10 行附近)

**查找**: 其他 import 语句的位置

**添加以下代码**:
```javascript
import ImagebedSettingsPanel from './ImagebedSettingsPanel'
```

**示例**:
```javascript
import React, { useState, useRef, useCallback, useEffect } from 'react'
import { X, Upload, Link as LinkIcon, Image as ImageIcon, Settings, ... } from 'lucide-react'
import './ImageManagerDialog.css'
import { compressImage } from '../utils/imageCompressor'
import ImagePreviewDialog from './ImagePreviewDialog'
import ElasticSlider from './ElasticSlider'
import AnimatedSelect from './AnimatedSelect'
// 👇 添加这行
import ImagebedSettingsPanel from './ImagebedSettingsPanel'
```

---

### 位置 2: 标签页按钮 (ImageManagerDialog.jsx 第 150 行附近)

**查找**: 其他标签页按钮的位置（如 upload, link, library 等）

**添加以下代码**:
```javascript
<button
  className={`tab-button ${activeTab === 'imagebed' ? 'active' : ''}`}
  onClick={() => setActiveTab('imagebed')}
>
  <Settings size={18} />
  <span>图床设置</span>
</button>
```

**示例**:
```javascript
<div className="tabs">
  <button
    className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
    onClick={() => setActiveTab('upload')}
  >
    <Upload size={18} />
    <span>上传</span>
  </button>
  
  <button
    className={`tab-button ${activeTab === 'link' ? 'active' : ''}`}
    onClick={() => setActiveTab('link')}
  >
    <LinkIcon size={18} />
    <span>链接</span>
  </button>
  
  {/* ... 其他标签页按钮 ... */}
  
  {/* 👇 添加这个按钮 */}
  <button
    className={`tab-button ${activeTab === 'imagebed' ? 'active' : ''}`}
    onClick={() => setActiveTab('imagebed')}
  >
    <Settings size={18} />
    <span>图床设置</span>
  </button>
</div>
```

---

### 位置 3: 标签页内容 (ImageManagerDialog.jsx 第 300 行附近)

**查找**: 其他标签页内容的位置（如 upload, link, library 等）

**添加以下代码**:
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

**示例**:
```javascript
<div className="tab-content">
  {activeTab === 'upload' && (
    <div className="upload-tab">
      {/* 上传内容 */}
    </div>
  )}
  
  {activeTab === 'link' && (
    <div className="link-tab">
      {/* 链接内容 */}
    </div>
  )}
  
  {/* ... 其他标签页内容 ... */}
  
  {/* 👇 添加这个标签页 */}
  {activeTab === 'imagebed' && (
    <div className="imagebed-tab">
      <ImagebedSettingsPanel
        onNotify={onNotify}
        theme={theme}
      />
    </div>
  )}
</div>
```

---

### 前端集成验证

```bash
# 1. 检查导入
grep "ImagebedSettingsPanel" app/ui/frontend/src/components/ImageManagerDialog.jsx
# 应该看到: import ImagebedSettingsPanel from './ImagebedSettingsPanel'

# 2. 检查标签页按钮
grep "imagebed" app/ui/frontend/src/components/ImageManagerDialog.jsx | grep "tab-button"
# 应该看到相关代码

# 3. 检查标签页内容
grep "activeTab === 'imagebed'" app/ui/frontend/src/components/ImageManagerDialog.jsx
# 应该看到相关代码

# 4. 构建前端
cd app/ui/frontend
npm run build
# 应该看到: ✓ built in X.XXs

# 5. 检查构建产物
ls -la dist/
# 应该看到 index.html 等文件
```

---

## 构建部署

### 步骤 1: 构建前端

```bash
cd /vol4/1000/开发文件夹/mac/app/ui/frontend

# 清理旧构建
rm -rf dist/

# 构建
npm run build

# 验证
ls -la dist/index.html
```

### 步骤 2: 部署应用

```bash
cd /vol4/1000/开发文件夹/mac

# 使用快速部署脚本
bash build-and-deploy.sh --local

# 或者手动部署
appcenter-cli install-local
appcenter-cli stop App.Native.MdEditor2
sleep 2
appcenter-cli start App.Native.MdEditor2
```

### 步骤 3: 验证部署

```bash
# 检查服务状态
appcenter-cli list | grep App.Native.MdEditor2

# 测试健康检查
curl http://localhost:18080/health

# 测试 API
curl http://localhost:18080/api/imagebed/list
```

---

## 验证测试

### 后端 API 测试

```bash
# 1. 获取图床列表
curl http://localhost:18080/api/imagebed/list
# 预期: { "ok": true, "configs": [...] }

# 2. 添加本地图床（测试）
curl -X POST http://localhost:18080/api/imagebed/add \
  -H "Content-Type: application/json" \
  -d '{
    "name": "本地存储",
    "type": "local",
    "config": {}
  }'
# 预期: { "ok": true, "id": 1 }

# 3. 获取指定图床
curl http://localhost:18080/api/imagebed/1
# 预期: { "ok": true, "config": {...} }

# 4. 设置默认图床
curl -X PUT http://localhost:18080/api/imagebed/1/default
# 预期: { "ok": true }

# 5. 上传图片
curl -X POST http://localhost:18080/api/image/upload \
  -F "images=@test.jpg"
# 预期: { "ok": true, "images": [...] }

# 6. 获取图片列表
curl http://localhost:18080/api/image/list
# 预期: { "ok": true, "images": [...] }
```

### 前端功能测试

1. **访问应用**
   ```
   http://192.168.2.2:18080/
   ```

2. **打开图片管理对话框**
   - 点击编辑器中的图片按钮
   - 或使用快捷键

3. **切换到图床设置标签页**
   - 应该看到"图床设置"标签页
   - 点击切换到该标签页

4. **测试添加图床**
   - 点击"添加新图床"按钮
   - 选择 GitHub 类型
   - 填写配置信息
   - 点击"测试连接"
   - 点击"保存"

5. **测试设置默认图床**
   - 在图床列表中找到刚添加的图床
   - 点击"设置为默认"按钮
   - 验证图床标记为默认

6. **测试上传图片**
   - 切换到"上传"标签页
   - 上传图片
   - 验证图片上传成功

---

## 故障排查

### 问题 1: API 返回 404

**症状**: 访问 `/api/imagebed/list` 返回 404

**原因**: 路由未正确添加

**解决**:
1. 检查 server.js 中是否添加了路由处理
2. 检查路由处理代码是否在正确的位置
3. 重启服务

```bash
# 检查路由
grep "handleImagebedApi" app/server/server.js

# 重启服务
appcenter-cli stop App.Native.MdEditor2
sleep 2
appcenter-cli start App.Native.MdEditor2
```

### 问题 2: 上传失败

**症状**: 上传图片时返回错误

**原因**: busboy 未安装或 multipart 解析错误

**解决**:
1. 检查 busboy 是否安装
2. 检查 multipart 解析函数是否正确
3. 查看服务器日志

```bash
# 检查依赖
cd app/server
npm list busboy

# 安装依赖
npm install busboy

# 查看日志
tail -f /var/log/app.native.mdeditor2/error.log
```

### 问题 3: 前端组件不显示

**症状**: 图床设置标签页不显示

**原因**: 组件未正确导入或标签页未添加

**解决**:
1. 检查导入语句
2. 检查标签页按钮和内容
3. 重新构建前端

```bash
# 检查导入
grep "ImagebedSettingsPanel" app/ui/frontend/src/components/ImageManagerDialog.jsx

# 重新构建
cd app/ui/frontend
npm run build

# 重新部署
cd /vol4/1000/开发文件夹/mac
bash build-and-deploy.sh --local
```

### 问题 4: 样式错误

**症状**: 组件显示但样式不正确

**原因**: CSS 文件未正确加载

**解决**:
1. 检查 CSS 文件是否存在
2. 检查 CSS 导入语句
3. 清理浏览器缓存

```bash
# 检查 CSS 文件
ls -la app/ui/frontend/src/components/ImagebedSettingsPanel.css

# 清理缓存并重新加载
# 在浏览器中按 Ctrl+Shift+Delete (Windows) 或 Cmd+Shift+Delete (Mac)
```

### 问题 5: 数据库错误

**症状**: API 返回数据库错误

**原因**: 数据库初始化失败

**解决**:
1. 检查数据库文件权限
2. 检查数据库初始化代码
3. 查看服务器日志

```bash
# 检查数据库文件
ls -la app/server/data/

# 查看日志
tail -f /var/log/app.native.mdeditor2/error.log

# 重启服务
appcenter-cli stop App.Native.MdEditor2
sleep 2
appcenter-cli start App.Native.MdEditor2
```

---

## ✅ 完成检查清单

集成完成后，验证以下项目：

- [ ] 后端导入正确
- [ ] 后端初始化正确
- [ ] multipart 函数添加正确
- [ ] API 路由添加正确
- [ ] 依赖安装完成
- [ ] 前端导入正确
- [ ] 标签页按钮添加正确
- [ ] 标签页内容添加正确
- [ ] 前端构建成功
- [ ] 应用部署成功
- [ ] API 测试通过
- [ ] 前端功能测试通过
- [ ] 没有控制台错误
- [ ] 没有网络错误

---

**集成完成后，项目完成度将达到 100%！** 🎉
