# 历史版本功能 - 快速实施指南

## 🎯 目标

**替代草稿自动保存功能，实现基于文件系统的历史版本管理**

---

## 📋 核心变更

### ❌ 移除功能
- 草稿自动保存（draftManager.js）
- 自动保存Hook（useAutoSave.js）
- 草稿恢复对话框（DraftRecoveryDialog.jsx）

### ✅ 新增功能
- 历史版本管理（文件系统存储）
- 版本列表展示（FileTree历史标签页）
- 版本预览和恢复
- 版本对比（Diff）

---

## 🚀 实施步骤

### 第一步：配置共享目录（5分钟）

**修改文件：** `config/resource`

```json
{
  "data-share": {
    "shares": [
      {
        "name": "mdeditor/images",
        "permission": { "rw": ["data"] }
      },
      {
        "name": "mdeditor/history",
        "permission": { "rw": ["data"] }
      }
    ]
  }
}
```

---

### 第二步：创建后端模块（2小时）

**创建文件：** `app/server/historyManager.js`

```javascript
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')

// 获取历史目录（使用环境变量，不硬编码）
function getHistoryDir() {
  const sharePaths = (process.env.TRIM_DATA_SHARE_PATHS || '').split(':')
  const historyPath = sharePaths.find(p => p.includes('/history'))
  return historyPath || path.join(__dirname, '../shares/history')
}

// 生成文件哈希
function getFileHash(filePath) {
  return crypto.createHash('md5').update(filePath).digest('hex').substring(0, 16)
}

// 保存版本
async function saveVersion(filePath, content, label = '', autoSaved = true) {
  const historyDir = getHistoryDir()
  const fileHash = getFileHash(filePath)
  const versionDir = path.join(historyDir, fileHash)
  
  // 创建目录
  if (!fs.existsSync(versionDir)) {
    fs.mkdirSync(versionDir, { recursive: true })
  }
  
  // 加载索引
  const indexPath = path.join(versionDir, 'versions.json')
  let index = { filePath, currentVersion: 0, versions: [] }
  
  if (fs.existsSync(indexPath)) {
    index = JSON.parse(fs.readFileSync(indexPath, 'utf8'))
  }
  
  // 生成版本号
  const versionNumber = index.currentVersion + 1
  const timestamp = Date.now()
  const fileName = `v${String(versionNumber).padStart(3, '0')}_${Date.now()}.md`
  
  // 保存版本文件
  fs.writeFileSync(path.join(versionDir, fileName), content, 'utf8')
  
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
  
  // 无限制保留所有版本（不自动删除）
  // 用户可以通过UI手动删除不需要的版本
  
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8')
  
  return { versionNumber, fileName }
}

// 获取版本列表
function getVersionList(filePath) {
  const historyDir = getHistoryDir()
  const fileHash = getFileHash(filePath)
  const indexPath = path.join(historyDir, fileHash, 'versions.json')
  
  if (!fs.existsSync(indexPath)) {
    return []
  }
  
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'))
  return index.versions || []
}

// 获取版本内容
function getVersionContent(filePath, versionNumber) {
  const historyDir = getHistoryDir()
  const fileHash = getFileHash(filePath)
  const versionDir = path.join(historyDir, fileHash)
  const indexPath = path.join(versionDir, 'versions.json')
  
  if (!fs.existsSync(indexPath)) {
    return null
  }
  
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'))
  const version = index.versions.find(v => v.versionNumber === versionNumber)
  
  if (!version) return null
  
  const contentPath = path.join(versionDir, version.fileName)
  const content = fs.readFileSync(contentPath, 'utf8')
  
  return { ...version, content }
}

module.exports = {
  saveVersion,
  getVersionList,
  getVersionContent
}
```

**修改文件：** `app/server/server.js`

```javascript
const historyManager = require('./historyManager')

// 添加API路由

// 保存版本
if (parsed.pathname === '/api/file/history/save' && req.method === 'POST') {
  let raw = ''
  req.on('data', chunk => { raw += chunk.toString('utf8') })
  req.on('end', async () => {
    try {
      const { filePath, content, label, autoSaved } = JSON.parse(raw)
      const result = await historyManager.saveVersion(filePath, content, label, autoSaved)
      sendJson(res, 200, { ok: true, ...result })
    } catch (error) {
      sendJson(res, 500, { ok: false, message: error.message })
    }
  })
  return
}

// 获取版本列表
if (parsed.pathname === '/api/file/history/list' && req.method === 'GET') {
  try {
    const filePath = parsed.query.path
    const versions = historyManager.getVersionList(filePath)
    sendJson(res, 200, { ok: true, versions })
  } catch (error) {
    sendJson(res, 500, { ok: false, message: error.message })
  }
  return
}

// 获取版本内容
if (parsed.pathname === '/api/file/history/version' && req.method === 'GET') {
  try {
    const filePath = parsed.query.path
    const versionNumber = parseInt(parsed.query.version)
    const version = historyManager.getVersionContent(filePath, versionNumber)
    
    if (version) {
      sendJson(res, 200, { ok: true, ...version })
    } else {
      sendJson(res, 404, { ok: false, message: '版本不存在' })
    }
  } catch (error) {
    sendJson(res, 500, { ok: false, message: error.message })
  }
  return
}
```

---

### 第三步：创建前端适配器（1小时）

**创建文件：** `src/utils/fileHistoryManagerV2.js`

```javascript
export async function saveFileHistory(filePath, content, label = '', autoSaved = true) {
  const response = await fetch('/api/file/history/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filePath, content, label, autoSaved })
  })
  return response.json()
}

export async function getFileHistory(filePath) {
  const response = await fetch(`/api/file/history/list?path=${encodeURIComponent(filePath)}`)
  const data = await response.json()
  return data.ok ? data.versions : []
}

export async function getVersionContent(filePath, versionNumber) {
  const response = await fetch(
    `/api/file/history/version?path=${encodeURIComponent(filePath)}&version=${versionNumber}`
  )
  return response.json()
}

export function formatHistoryTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  
  if (date.toDateString() === now.toDateString()) {
    return `今天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
  }
  
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 ${date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`
  }
  
  return date.toLocaleString('zh-CN', { 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}
```

---

### 第四步：修改 App.jsx（1小时）

**修改文件：** `src/App.jsx`

```javascript
// 1. 删除旧的导入
// import { saveDraft, clearDraft, getDraft } from './utils/draftManager'
// import { useAutoSave } from './hooks/useAutoSave'

// 2. 添加新的导入
import { saveFileHistory } from './utils/fileHistoryManagerV2'

// 3. 修改保存函数
const handleSave = async () => {
  if (!currentPath) {
    showToast('请先选择文件', 'warning')
    return
  }

  try {
    const response = await fetch('/api/file/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: currentPath, content })
    })
    
    if (response.ok) {
      // 创建历史版本
      await saveFileHistory(currentPath, content, '', false)
      showToast('保存成功', 'success')
      setHasUnsavedChanges(false)
    }
  } catch (error) {
    showToast('保存失败', 'error')
  }
}

// 4. 添加自动保存（30秒）
useEffect(() => {
  if (!autoSaveEnabled || !currentPath || !hasUnsavedChanges) return

  const timer = setTimeout(async () => {
    try {
      const response = await fetch('/api/file/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: currentPath, content })
      })
      
      if (response.ok) {
        await saveFileHistory(currentPath, content, '', true)
        setHasUnsavedChanges(false)
      }
    } catch (error) {
      console.warn('自动保存失败:', error)
    }
  }, 30000)

  return () => clearTimeout(timer)
}, [currentPath, content, autoSaveEnabled, hasUnsavedChanges])
```

---

### 第五步：删除旧文件（5分钟）

```bash
rm src/utils/draftManager.js
rm src/hooks/useAutoSave.js
rm src/components/DraftRecoveryDialog.jsx
rm src/components/DraftRecoveryDialog.css
```

---

## ✅ 验收标准

- [ ] 配置文件已添加 history 共享
- [ ] 后端API正常工作
- [ ] 手动保存（Ctrl+S）创建历史版本
- [ ] 自动保存（30秒）创建历史版本
- [ ] 历史标签页显示版本列表
- [ ] 可以查看版本内容
- [ ] 旧的草稿功能已完全移除

---

## 📚 相关文档

- 详细开发计划：`VERSION_HISTORY_FINAL_PLAN.md`
- 路径访问规范：`FNNAS_PATH_ACCESS_GUIDE.md`

---

**创建时间：** 2025-03-06  
**预计工时：** 4-5 小时（核心功能）
