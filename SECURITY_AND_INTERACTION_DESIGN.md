# 历史版本功能 - 安全与交互设计

## 🔒 文件隔离与安全

### 1. 文件路径哈希隔离

**目的：** 防止跨文件访问，确保每个文件的历史版本独立存储

```javascript
// 使用MD5哈希作为目录名，实现文件隔离
function getFileHash(filePath) {
  const crypto = require('crypto')
  return crypto.createHash('md5').update(filePath).digest('hex').substring(0, 16)
}

// 示例：
// /vol4/documents/file1.md → hash: a1b2c3d4e5f6g7h8
// /vol4/documents/file2.md → hash: i9j0k1l2m3n4o5p6

// 存储结构：
// shares/history/
//   ├── a1b2c3d4e5f6g7h8/  ← file1.md 的历史版本
//   │   ├── versions.json
//   │   └── v001_xxx.md
//   └── i9j0k1l2m3n4o5p6/  ← file2.md 的历史版本
//       ├── versions.json
//       └── v001_xxx.md
```

### 2. 后端权限验证

**文件：** `app/server/historyManager.js`

```javascript
const path = require('path')
const crypto = require('crypto')

// 验证文件路径是否在授权目录内
function validateFilePath(filePath) {
  // 使用现有的 resolveSafePath 函数验证
  try {
    resolveSafePath(filePath)
    return true
  } catch (error) {
    console.error('Invalid file path:', filePath, error)
    return false
  }
}

// 获取文件的版本目录（带验证）
function getFileVersionDir(filePath) {
  // 1. 验证文件路径
  if (!validateFilePath(filePath)) {
    throw new Error('PATH_NOT_ALLOWED')
  }
  
  // 2. 生成哈希
  const fileHash = crypto.createHash('md5').update(filePath).digest('hex').substring(0, 16)
  
  // 3. 返回版本目录
  const historyDir = getHistoryDir()
  return path.join(historyDir, fileHash)
}

// 保存版本（带验证）
async function saveVersion(filePath, content, label = '', autoSaved = true) {
  // 验证文件路径
  if (!validateFilePath(filePath)) {
    throw new Error('无权访问此文件')
  }
  
  const versionDir = getFileVersionDir(filePath)
  
  // ... 保存逻辑 ...
}

// 获取版本列表（带验证）
function getVersionList(filePath) {
  // 验证文件路径
  if (!validateFilePath(filePath)) {
    throw new Error('无权访问此文件')
  }
  
  const versionDir = getFileVersionDir(filePath)
  
  // ... 获取逻辑 ...
}
```

### 3. API路由安全验证

**文件：** `app/server/server.js`

```javascript
// 所有历史版本API都需要验证文件路径
if (parsed.pathname === '/api/file/history/save' && req.method === 'POST') {
  let raw = ''
  req.on('data', chunk => { raw += chunk.toString('utf8') })
  req.on('end', async () => {
    try {
      const { filePath, content, label, autoSaved } = JSON.parse(raw)
      
      // 验证文件路径（使用 resolveSafePath）
      try {
        resolveSafePath(filePath)
      } catch (error) {
        sendJson(res, 403, { ok: false, code: 'PATH_NOT_ALLOWED', message: '无权访问此文件' })
        return
      }
      
      const result = await historyManager.saveVersion(filePath, content, label, autoSaved)
      sendJson(res, 200, { ok: true, ...result })
    } catch (error) {
      sendJson(res, 500, { ok: false, message: error.message })
    }
  })
  return
}
```

---

## 🗑️ 删除功能设计

### 1. 单个版本删除

**后端API：** `POST /api/file/history/delete`

```javascript
// app/server/historyManager.js
function deleteVersion(filePath, versionNumber) {
  // 验证文件路径
  if (!validateFilePath(filePath)) {
    throw new Error('无权访问此文件')
  }
  
  const versionDir = getFileVersionDir(filePath)
  const indexPath = path.join(versionDir, 'versions.json')
  
  if (!fs.existsSync(indexPath)) {
    throw new Error('版本不存在')
  }
  
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'))
  const version = index.versions.find(v => v.versionNumber === versionNumber)
  
  if (!version) {
    throw new Error('版本不存在')
  }
  
  // 删除版本文件
  const versionFilePath = path.join(versionDir, version.fileName)
  if (fs.existsSync(versionFilePath)) {
    fs.unlinkSync(versionFilePath)
  }
  
  // 更新索引
  index.versions = index.versions.filter(v => v.versionNumber !== versionNumber)
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8')
  
  return { deleted: versionNumber }
}

// app/server/server.js
if (parsed.pathname === '/api/file/history/delete' && req.method === 'POST') {
  let raw = ''
  req.on('data', chunk => { raw += chunk.toString('utf8') })
  req.on('end', async () => {
    try {
      const { filePath, versionNumber } = JSON.parse(raw)
      
      // 验证文件路径
      try {
        resolveSafePath(filePath)
      } catch (error) {
        sendJson(res, 403, { ok: false, message: '无权访问此文件' })
        return
      }
      
      const result = historyManager.deleteVersion(filePath, versionNumber)
      sendJson(res, 200, { ok: true, ...result })
    } catch (error) {
      sendJson(res, 500, { ok: false, message: error.message })
    }
  })
  return
}
```

**前端调用：**

```javascript
// src/utils/fileHistoryManagerV2.js
export async function deleteVersion(filePath, versionNumber) {
  const response = await fetch('/api/file/history/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filePath, versionNumber })
  })
  return response.json()
}
```

### 2. 删除所有版本

**后端API：** `POST /api/file/history/clear`

```javascript
// app/server/historyManager.js
function clearAllVersions(filePath) {
  // 验证文件路径
  if (!validateFilePath(filePath)) {
    throw new Error('无权访问此文件')
  }
  
  const versionDir = getFileVersionDir(filePath)
  
  if (!fs.existsSync(versionDir)) {
    return { cleared: 0 }
  }
  
  // 读取索引
  const indexPath = path.join(versionDir, 'versions.json')
  let count = 0
  
  if (fs.existsSync(indexPath)) {
    const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'))
    count = index.versions.length
    
    // 删除所有版本文件
    index.versions.forEach(v => {
      const versionFilePath = path.join(versionDir, v.fileName)
      if (fs.existsSync(versionFilePath)) {
        fs.unlinkSync(versionFilePath)
      }
    })
  }
  
  // 删除整个目录
  fs.rmSync(versionDir, { recursive: true, force: true })
  
  return { cleared: count }
}

// app/server/server.js
if (parsed.pathname === '/api/file/history/clear' && req.method === 'POST') {
  let raw = ''
  req.on('data', chunk => { raw += chunk.toString('utf8') })
  req.on('end', async () => {
    try {
      const { filePath } = JSON.parse(raw)
      
      // 验证文件路径
      try {
        resolveSafePath(filePath)
      } catch (error) {
        sendJson(res, 403, { ok: false, message: '无权访问此文件' })
        return
      }
      
      const result = historyManager.clearAllVersions(filePath)
      sendJson(res, 200, { ok: true, ...result })
    } catch (error) {
      sendJson(res, 500, { ok: false, message: error.message })
    }
  })
  return
}
```

**前端调用：**

```javascript
// src/utils/fileHistoryManagerV2.js
export async function clearAllVersions(filePath) {
  const response = await fetch('/api/file/history/clear', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filePath })
  })
  return response.json()
}
```

---

## 🎨 UI交互设计

### 1. 自定义确认对话框（不使用系统弹窗）

**创建文件：** `src/components/ConfirmDialog.jsx`

```jsx
import React from 'react'
import './ConfirmDialog.css'

function ConfirmDialog({ 
  title, 
  message, 
  confirmText = '确定', 
  cancelText = '取消',
  onConfirm, 
  onCancel,
  theme 
}) {
  return (
    <div className={`dialog-overlay ${theme}`} onClick={onCancel}>
      <div className="dialog-content confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>{title}</h2>
        </div>
        
        <div className="dialog-body">
          <p className="confirm-message">{message}</p>
        </div>
        
        <div className="dialog-footer">
          <button className="btn-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="btn-danger" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
```

**样式文件：** `src/components/ConfirmDialog.css`

```css
.confirm-dialog {
  max-width: 400px;
}

.confirm-message {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary);
  margin: 0;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-danger:hover {
  background: #c82333;
}
```

### 2. 历史面板集成删除功能

**文件：** `src/components/HistoryPanel.jsx`

```jsx
import React, { useState, useEffect } from 'react'
import { getFileHistory, deleteVersion, clearAllVersions } from '../utils/fileHistoryManagerV2'
import { formatHistoryTime } from '../utils/fileHistoryManagerV2'
import ConfirmDialog from './ConfirmDialog'
import VersionPreviewDialog from './VersionPreviewDialog'
import './HistoryPanel.css'

function HistoryPanel({ currentPath, theme }) {
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [previewVersion, setPreviewVersion] = useState(null)

  // 加载版本列表
  useEffect(() => {
    if (currentPath) {
      loadVersions()
    }
  }, [currentPath])

  const loadVersions = async () => {
    setLoading(true)
    try {
      const list = await getFileHistory(currentPath)
      setVersions(list)
    } catch (error) {
      console.error('加载历史版本失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 删除单个版本
  const handleDeleteVersion = async (versionNumber) => {
    try {
      await deleteVersion(currentPath, versionNumber)
      await loadVersions() // 重新加载列表
    } catch (error) {
      console.error('删除版本失败:', error)
      alert('删除失败: ' + error.message)
    }
  }

  // 删除所有版本（显示确认对话框）
  const handleClearAll = () => {
    setShowClearConfirm(true)
  }

  // 确认删除所有版本
  const confirmClearAll = async () => {
    try {
      await clearAllVersions(currentPath)
      setVersions([])
      setShowClearConfirm(false)
    } catch (error) {
      console.error('清空历史版本失败:', error)
      alert('清空失败: ' + error.message)
    }
  }

  // 预览版本
  const handlePreviewVersion = (version) => {
    setPreviewVersion(version)
  }

  return (
    <div className="history-panel">
      {loading ? (
        <div className="history-loading">加载中...</div>
      ) : versions.length === 0 ? (
        <div className="history-empty">暂无历史版本</div>
      ) : (
        <>
          <div className="history-header">
            <span className="history-count">共 {versions.length} 个版本</span>
            <button className="btn-clear-all" onClick={handleClearAll}>
              清空所有
            </button>
          </div>
          
          <div className="history-list">
            {versions.map(v => (
              <div key={v.versionNumber} className="history-item">
                <div className="history-info">
                  <div className="version-number">版本 {v.versionNumber}</div>
                  <div className="version-time">{formatHistoryTime(v.timestamp)}</div>
                  {v.label && <div className="version-label">{v.label}</div>}
                  <div className="version-meta">
                    {v.lines} 行 · {v.autoSaved ? '自动保存' : '手动保存'}
                  </div>
                </div>
                
                <div className="history-actions">
                  <button 
                    className="btn-preview"
                    onClick={() => handlePreviewVersion(v)}
                  >
                    预览
                  </button>
                  <button 
                    className="btn-delete"
                    onClick={() => handleDeleteVersion(v.versionNumber)}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 删除所有版本确认对话框 */}
      {showClearConfirm && (
        <ConfirmDialog
          title="清空历史版本"
          message={`确定要删除 "${currentPath}" 的所有 ${versions.length} 个历史版本吗？此操作不可恢复。`}
          confirmText="确定删除"
          cancelText="取消"
          onConfirm={confirmClearAll}
          onCancel={() => setShowClearConfirm(false)}
          theme={theme}
        />
      )}

      {/* 版本预览对话框 */}
      {previewVersion && (
        <VersionPreviewDialog
          version={previewVersion}
          filePath={currentPath}
          onClose={() => setPreviewVersion(null)}
          theme={theme}
        />
      )}
    </div>
  )
}

export default HistoryPanel
```

### 3. 版本预览对话框（窗口方式）

**创建文件：** `src/components/VersionPreviewDialog.jsx`

```jsx
import React, { useState, useEffect } from 'react'
import { getVersionContent } from '../utils/fileHistoryManagerV2'
import { formatHistoryTime } from '../utils/fileHistoryManagerV2'
import ReactMarkdown from 'react-markdown'
import './VersionPreviewDialog.css'

function VersionPreviewDialog({ version, filePath, onClose, theme }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('source') // 'source' or 'preview'

  useEffect(() => {
    loadContent()
  }, [version])

  const loadContent = async () => {
    setLoading(true)
    try {
      const data = await getVersionContent(filePath, version.versionNumber)
      setContent(data.content)
    } catch (error) {
      console.error('加载版本内容失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`dialog-overlay ${theme}`} onClick={onClose}>
      <div className="dialog-content version-preview-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>版本 {version.versionNumber} 预览</h2>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>

        <div className="version-info-bar">
          <span>{formatHistoryTime(version.timestamp)}</span>
          <span>{version.lines} 行</span>
          <span>{version.autoSaved ? '自动保存' : '手动保存'}</span>
          {version.label && <span className="label-badge">{version.label}</span>}
        </div>

        <div className="preview-tabs">
          <button 
            className={viewMode === 'source' ? 'active' : ''}
            onClick={() => setViewMode('source')}
          >
            源码
          </button>
          <button 
            className={viewMode === 'preview' ? 'active' : ''}
            onClick={() => setViewMode('preview')}
          >
            预览
          </button>
        </div>

        <div className="dialog-body">
          {loading ? (
            <div className="loading">加载中...</div>
          ) : viewMode === 'source' ? (
            <pre className="source-view">{content}</pre>
          ) : (
            <div className="markdown-preview">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>

        <div className="dialog-footer">
          <button className="btn-secondary" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}

export default VersionPreviewDialog
```

---

## 📋 安全检查清单

- [ ] 文件路径使用哈希隔离，防止跨文件访问
- [ ] 所有API都验证文件路径（使用 resolveSafePath）
- [ ] 删除操作验证用户权限
- [ ] 删除所有版本使用自定义确认对话框
- [ ] 版本预览使用窗口（Dialog）方式
- [ ] 错误信息不泄露敏感路径信息
- [ ] 禁止硬编码路径，使用环境变量

---

## 🧪 测试场景

### 安全测试
1. 尝试访问其他用户的文件历史版本（应该被拒绝）
2. 尝试访问授权目录外的文件历史（应该被拒绝）
3. 验证文件路径哈希隔离是否有效

### 删除测试
1. 删除单个版本，验证文件和索引都被删除
2. 删除所有版本，验证确认对话框显示
3. 取消删除所有版本，验证数据未被删除
4. 确认删除所有版本，验证所有文件被删除

### 预览测试
1. 点击预览按钮，验证对话框打开
2. 切换源码/预览模式
3. 验证Markdown渲染正确
4. 关闭对话框

---

**文档版本：** 1.0.0  
**创建时间：** 2025-03-06  
**重点：** 文件隔离、权限验证、自定义确认对话框、窗口预览
