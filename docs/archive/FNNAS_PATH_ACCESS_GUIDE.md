# 飞牛NAS路径访问规范 - 快速参考

## 🚨 重要原则

**禁止硬编码路径！** 必须使用环境变量或相对路径访问共享目录。

---

## 📋 环境变量列表

### 路径相关
```bash
TRIM_APPDEST              # 应用可执行文件目录（target）
TRIM_PKGETC               # 配置文件目录（etc）
TRIM_PKGVAR               # 动态数据目录（var）
TRIM_PKGTMP               # 临时文件目录（tmp）
TRIM_PKGHOME              # 用户数据目录（home）
TRIM_PKGMETA              # 元数据目录（meta）
TRIM_APPDEST_VOL          # 应用安装的存储空间路径
```

### 共享目录（重要！）
```bash
TRIM_DATA_SHARE_PATHS     # 数据共享路径列表，多个路径用冒号分隔
# 示例：/vol4/@appshare/mdeditor/images:/vol4/@appshare/mdeditor/history
```

### 网络和端口
```bash
TRIM_SERVICE_PORT         # 应用监听的端口号
```

---

## ✅ 正确的路径访问方式

### 方法1：使用环境变量（推荐 - 生产环境）

```javascript
// 获取共享目录路径
function getHistoryDir() {
  const sharePaths = (process.env.TRIM_DATA_SHARE_PATHS || '').split(':')
  const historyPath = sharePaths.find(p => p.includes('/history'))
  
  // Fallback 到相对路径
  return historyPath || path.join(__dirname, '../shares/history')
}

// 使用示例
const historyDir = getHistoryDir()
const versionFile = path.join(historyDir, 'file_hash_abc123', 'versions.json')
```

### 方法2：使用相对路径（推荐 - 开发环境）

```javascript
// 从应用根目录访问
const historyDir = path.join(__dirname, '../shares/history')

// 从 server.js 访问（假设在 app/server/server.js）
const historyDir = path.join(__dirname, '../shares/history')
```

### 方法3：解析环境变量（完整示例）

```javascript
const path = require('path')

function getSharePath(shareName) {
  // 1. 尝试从环境变量获取
  const sharePaths = (process.env.TRIM_DATA_SHARE_PATHS || '').split(':')
  const targetPath = sharePaths.find(p => p.includes(`/${shareName}`))
  
  if (targetPath) {
    return targetPath
  }
  
  // 2. Fallback：使用相对路径
  return path.join(__dirname, '../shares', shareName)
}

// 使用
const historyDir = getSharePath('history')
const imagesDir = getSharePath('images')
```

---

## ❌ 错误的路径访问方式

```javascript
// ❌ 硬编码绝对路径
const historyDir = '/vol4/@appshare/mdeditor/history'

// ❌ 硬编码卷号
const historyDir = '/vol4/1000/开发文件夹/mac/shares/history'

// ❌ 假设固定的卷号
const historyDir = `/vol${volumeNumber}/@appshare/mdeditor/history`
```

---

## 📦 配置共享目录

### config/resource
```json
{
  "data-share": {
    "shares": [
      {
        "name": "mdeditor/images",
        "permission": {
          "rw": ["data"]
        }
      },
      {
        "name": "mdeditor/history",
        "permission": {
          "rw": ["data"]
        }
      }
    ]
  }
}
```

### 目录结构
```
/var/apps/App.Native.MdEditor2/
├── shares/                              # 共享目录（符号链接）
│   ├── images -> /vol4/@appshare/mdeditor/images
│   └── history -> /vol4/@appshare/mdeditor/history
```

---

## 🔧 实际应用示例

### 示例1：历史版本管理器

```javascript
// app/server/historyManager.js
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

// 获取历史目录
function getHistoryDir() {
  // 优先使用环境变量
  const sharePaths = (process.env.TRIM_DATA_SHARE_PATHS || '').split(':')
  const historyPath = sharePaths.find(p => p.includes('/history'))
  
  // Fallback 到相对路径
  return historyPath || path.join(__dirname, '../shares/history')
}

// 获取文件的版本目录
function getFileVersionDir(filePath) {
  const historyDir = getHistoryDir()
  const fileHash = crypto.createHash('md5').update(filePath).digest('hex').substring(0, 16)
  return path.join(historyDir, fileHash)
}

// 保存版本
async function saveVersion(filePath, content, label = '', autoSaved = true) {
  const versionDir = getFileVersionDir(filePath)
  
  // 确保目录存在
  if (!fs.existsSync(versionDir)) {
    fs.mkdirSync(versionDir, { recursive: true })
  }
  
  // 加载或创建版本索引
  const indexPath = path.join(versionDir, 'versions.json')
  let index = { filePath, currentVersion: 0, versions: [] }
  
  if (fs.existsSync(indexPath)) {
    index = JSON.parse(fs.readFileSync(indexPath, 'utf8'))
  }
  
  // 生成新版本
  const versionNumber = index.currentVersion + 1
  const timestamp = Date.now()
  const fileName = `v${String(versionNumber).padStart(3, '0')}_${new Date(timestamp).toISOString().replace(/[:.]/g, '-').slice(0, -5)}.md`
  
  // 保存版本文件
  const versionFilePath = path.join(versionDir, fileName)
  fs.writeFileSync(versionFilePath, content, 'utf8')
  
  // 更新索引
  index.currentVersion = versionNumber
  index.versions.unshift({
    versionNumber,
    fileName,
    timestamp,
    size: Buffer.byteLength(content, 'utf8'),
    lines: content.split('\n').length,
    label,
    autoSaved
  })
  
  // 保留最近10个版本
  if (index.versions.length > 10) {
    const toDelete = index.versions.slice(10)
    toDelete.forEach(v => {
      const oldFile = path.join(versionDir, v.fileName)
      if (fs.existsSync(oldFile)) {
        fs.unlinkSync(oldFile)
      }
    })
    index.versions = index.versions.slice(0, 10)
  }
  
  // 保存索引
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8')
  
  return { versionNumber, fileName }
}

module.exports = {
  getHistoryDir,
  saveVersion
}
```

### 示例2：在 server.js 中使用

```javascript
// app/server/server.js
const historyManager = require('./historyManager')

// API: 保存版本
if (parsed.pathname === '/api/file/history/save' && req.method === 'POST') {
  let raw = ''
  req.on('data', chunk => { raw += chunk.toString('utf8') })
  req.on('end', async () => {
    try {
      const body = JSON.parse(raw)
      const { filePath, content, label, autoSaved } = body
      
      const result = await historyManager.saveVersion(filePath, content, label, autoSaved)
      
      sendJson(res, 200, { ok: true, ...result })
    } catch (error) {
      console.error('Save history error:', error)
      sendJson(res, 500, { ok: false, message: error.message })
    }
  })
  return
}
```

---

## 🧪 测试环境变量

### 在 cmd/main 脚本中
```bash
#!/bin/bash

# 打印环境变量（调试用）
echo "TRIM_DATA_SHARE_PATHS=${TRIM_DATA_SHARE_PATHS}" >> ${TRIM_PKGVAR}/debug.log

# 获取第一个共享路径
DATA_DIR="${TRIM_DATA_SHARE_PATHS%%:*}"
echo "First share path: ${DATA_DIR}" >> ${TRIM_PKGVAR}/debug.log

# 启动应用
export TRIM_DATA_SHARE_PATHS="${TRIM_DATA_SHARE_PATHS}"
node ${TRIM_APPDEST}/server/server.js
```

### 在 Node.js 中测试
```javascript
// 测试脚本
console.log('TRIM_DATA_SHARE_PATHS:', process.env.TRIM_DATA_SHARE_PATHS)

const sharePaths = (process.env.TRIM_DATA_SHARE_PATHS || '').split(':')
console.log('Parsed paths:', sharePaths)

const historyPath = sharePaths.find(p => p.includes('/history'))
console.log('History path:', historyPath)
```

---

## 📚 参考资料

- 飞牛NAS开发文档：环境变量章节
- `TRIM_DATA_SHARE_PATHS`：数据共享路径列表
- 配置文件：`config/resource` 中的 `data-share` 配置

---

**创建时间：** 2025-03-06  
**适用版本：** 飞牛NAS fnOS 0.9.27+  
**重要提醒：** 永远不要硬编码路径！
