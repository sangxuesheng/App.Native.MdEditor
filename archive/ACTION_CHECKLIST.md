# ✅ 多图床支持项目 - 行动清单

## 🎯 今天的任务 (1-2 小时)

### ✓ 第 1 步: 准备环境 (5 分钟)

```bash
cd /vol4/1000/开发文件夹/mac

# 运行自动集成脚本
bash integrate-imagebed.sh

# 预期输出:
# ✅ 所有文件检查完成
# ✅ 依赖安装完成
# ✅ 备份完成
```

**检查清单**:
- [ ] 脚本执行成功
- [ ] 看到"前置准备完成"消息
- [ ] 备份文件已创建

---

### ✓ 第 2 步: 后端集成 (30 分钟)

**打开文件**: `app/server/server.js`

**参考文档**: `INTEGRATION_GUIDE.md` 中的"后端集成"部分

**需要添加的 4 个位置**:

#### 位置 1: 导入部分 (第 20 行附近)
```javascript
const { ImageBedManager } = require('./imagebed');
const { handleImagebedApi } = require('./imagebedApi');
```

#### 位置 2: 初始化部分 (第 800 行附近)
```javascript
const imagebedManager = new ImageBedManager(getDb());
imagebedManager.initialize().catch(err => {
  console.error('Failed to initialize ImageBedManager:', err);
});
```

#### 位置 3: multipart 函数 (第 850 行附近)
```javascript
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

#### 位置 4: API 路由 (第 1200 行附近)
```javascript
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

**验证**:
```bash
# 检查导入
grep "ImageBedManager" app/server/server.js

# 检查初始化
grep "imagebedManager = new ImageBedManager" app/server/server.js

# 检查路由
grep "handleImagebedApi" app/server/server.js
```

**检查清单**:
- [ ] 4 个位置都已添加
- [ ] 没有语法错误
- [ ] 文件已保存

---

### ✓ 第 3 步: 前端集成 (30 分钟)

**打开文件**: `app/ui/frontend/src/components/ImageManagerDialog.jsx`

**参考文档**: `INTEGRATION_GUIDE.md` 中的"前端集成"部分

**需要添加的 3 个位置**:

#### 位置 1: 导入部分 (第 10 行附近)
```javascript
import ImagebedSettingsPanel from './ImagebedSettingsPanel'
```

#### 位置 2: 标签页按钮 (第 150 行附近)
```javascript
<button
  className={`tab-button ${activeTab === 'imagebed' ? 'active' : ''}`}
  onClick={() => setActiveTab('imagebed')}
>
  <Settings size={18} />
  <span>图床设置</span>
</button>
```

#### 位置 3: 标签页内容 (第 300 行附近)
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

**验证**:
```bash
# 检查导入
grep "ImagebedSettingsPanel" app/ui/frontend/src/components/ImageManagerDialog.jsx

# 检查标签页
grep "activeTab === 'imagebed'" app/ui/frontend/src/components/ImageManagerDialog.jsx
```

**检查清单**:
- [ ] 3 个位置都已添加
- [ ] 没有语法错误
- [ ] 文件已保存

---

### ✓ 第 4 步: 构建部署 (10 分钟)

```bash
# 构建前端
cd app/ui/frontend
npm run build

# 预期: ✓ built in X.XXs

# 返回项目目录
cd /vol4/1000/开发文件夹/mac

# 部署应用
bash build-and-deploy.sh --local

# 预期: 应用部署成功
```

**检查清单**:
- [ ] 前端构建成功
- [ ] 应用部署成功
- [ ] 没有错误信息

---

### ✓ 第 5 步: 验证测试 (15 分钟)

#### 测试后端 API
```bash
# 测试 1: 获取图床列表
curl http://localhost:18080/api/imagebed/list
# 预期: { "ok": true, "configs": [...] }

# 测试 2: 添加本地图床
curl -X POST http://localhost:18080/api/imagebed/add \
  -H "Content-Type: application/json" \
  -d '{"name":"本地存储","type":"local","config":{}}'
# 预期: { "ok": true, "id": 1 }

# 测试 3: 获取图床列表
curl http://localhost:18080/api/imagebed/list
# 预期: 应该看到刚添加的图床
```

#### 测试前端功能
1. 访问 `http://192.168.2.2:18080/`
2. 打开图片管理对话框
3. 切换到"图床设置"标签页
4. 验证看到图床列表
5. 点击"添加新图床"
6. 选择 GitHub 类型
7. 填写配置信息
8. 点击"测试连接"
9. 点击"保存"

**检查清单**:
- [ ] API 返回正确数据
- [ ] 前端组件正常显示
- [ ] 可以添加图床
- [ ] 没有控制台错误

---

## 🎯 明天的任务 (Phase 4 测试)

### 功能测试
- [ ] 测试所有 6 种图床
- [ ] 测试所有 13 个 API 端点
- [ ] 测试错误处理
- [ ] 测试边界情况

### 性能测试
- [ ] API 响应时间 < 100ms
- [ ] 组件加载时间 < 100ms
- [ ] 内存使用正常

### 安全测试
- [ ] 配置加密正常
- [ ] 敏感信息不泄露
- [ ] 访问控制正常

### 用户体验优化
- [ ] 错误提示改进
- [ ] 加载状态改进
- [ ] 交互反馈改进

---

## 📚 参考文档速查

| 需求 | 文档 | 位置 |
|------|------|------|
| 快速了解 | `README_IMAGEBED.md` | 项目根目录 |
| 集成步骤 | `INTEGRATION_GUIDE.md` | 项目根目录 ⭐ |
| 快速参考 | `QUICK_START.md` | 项目根目录 |
| API 文档 | `IMAGEBED_QUICK_REFERENCE.md` | 项目根目录 |
| 测试方法 | `IMAGEBED_PHASE4_TESTING_GUIDE.md` | 项目根目录 |
| 故障排查 | `INTEGRATION_GUIDE.md` (故障排查部分) | 项目根目录 |

---

## 🚨 常见问题速解

### 问题: API 返回 404
**解决**: 检查 server.js 中的路由处理代码是否正确添加

### 问题: 前端组件不显示
**解决**: 检查 ImageManagerDialog.jsx 中的导入和标签页代码

### 问题: 上传失败
**解决**: 检查 busboy 是否安装，运行 `npm install busboy`

### 问题: 样式错误
**解决**: 清理浏览器缓存，重新构建前端

### 问题: 数据库错误
**解决**: 检查数据库文件权限，重启服务

---

## ✅ 完成检查清单

### 集成完成后
- [ ] 后端导入正确
- [ ] 后端初始化正确
- [ ] multipart 函数添加正确
- [ ] API 路由添加正确
- [ ] 前端导入正确
- [ ] 标签页按钮添加正确
- [ ] 标签页内容添加正确
- [ ] 前端构建成功
- [ ] 应用部署成功

### 验证完成后
- [ ] API 测试通过
- [ ] 前端功能测试通过
- [ ] 没有控制台错误
- [ ] 没有网络错误
- [ ] 深色主题正常工作
- [ ] 响应式设计正常工作

---

## 📊 预计时间

| 任务 | 时间 | 状态 |
|------|------|------|
| 准备环境 | 5 分钟 | ⏳ 待做 |
| 后端集成 | 30 分钟 | ⏳ 待做 |
| 前端集成 | 30 分钟 | ⏳ 待做 |
| 构建部署 | 10 分钟 | ⏳ 待做 |
| 验证测试 | 15 分钟 | ⏳ 待做 |
| **总计** | **1.5 小时** | ⏳ 待做 |

---

## 🚀 立即开始

```bash
# 1. 进入项目目录
cd /vol4/1000/开发文件夹/mac

# 2. 运行集成脚本
bash integrate-imagebed.sh

# 3. 按照上面的步骤进行集成
# (编辑 server.js 和 ImageManagerDialog.jsx)

# 4. 构建部署
bash build-and-deploy.sh --local

# 5. 验证
curl http://localhost:18080/api/imagebed/list
```

---

## 💡 提示

- 集成前建议备份原文件 (脚本已自动备份)
- 每完成一个步骤就测试一次
- 遇到问题参考 `INTEGRATION_GUIDE.md` 中的故障排查部分
- 如果需要回滚，恢复备份文件即可

---

**预计完成时间**: 1.5 小时  
**难度**: 中等  
**风险**: 低

**现在就开始吧！** 🚀
