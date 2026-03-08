# Markdown编辑器 - 历史版本功能开发计划（最终版）

## 📋 项目概述

为飞牛NAS Markdown编辑器实现**基于文件系统存储**的历史版本功能，**替代现有的草稿自动保存功能**。

**存储方案：** 飞牛NAS共享目录（shares/history）
**UI展示：** FileTree组件的"历史"标签页（类似截图的列表UI）
**设计风格：** 简洁列表，不使用emoji表情
**替代功能：** 去掉草稿自动保存（draftManager.js + useAutoSave.js），统一使用历史版本

**保存触发机制（重要！）：**
- **自动保存**：通过 setInterval 定时器（30秒），检测内容有修改则自动创建历史版本快照
- **手动保存**：监听快捷键 Ctrl+S，立即创建历史版本快照，更新页面显示的版本号/保存状态
- **注意**：直接保存快照到历史目录，不需要等待"保存文件到服务器"操作

---

## 🎯 核心设计

### 1. 存储结构（飞牛NAS）

**配置文件：** `config/resource`
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

**目录结构：**
```
/var/apps/App.Native.MdEditor2/shares/history/
├── file_hash_abc123/              # 文件路径哈希
│   ├── versions.json              # 版本索引
│   ├── v001_20250306_143022.md    # 版本快照
│   ├── v002_20250306_150315.md
│   └── v003_20250306_153045.md
└── file_hash_def456/
    ├── versions.json
    └── v001_20250306_160000.md
```

**环境变量访问（重要！禁止硬编码）：**
```javascript
// ✅ 正确方式：使用环境变量
const sharePaths = (process.env.TRIM_DATA_SHARE_PATHS || '').split(':')
// TRIM_DATA_SHARE_PATHS 格式：/vol4/@appshare/mdeditor/images:/vol4/@appshare/mdeditor/history
const historyPath = sharePaths.find(p => p.includes('/history')) || path.join(__dirname, '../shares/history')

// ✅ 或使用相对路径（推荐）
const historyPath = path.join(__dirname, '../shares/history')

// ❌ 错误方式：硬编码绝对路径
// const historyPath = '/vol4/@appshare/mdeditor/history'  // 禁止！
```

### 2. 版本索引文件（versions.json）

```json
{
  "filePath": "/vol4/documents/test.md",
  "currentVersion": 3,
  "versions": [
    {
      "versionNumber": 3,
      "fileName": "v003_20250306_153045.md",
      "timestamp": 1709712645000,
      "size": 2048,
      "lines": 45,
      "label": "完成初稿",
      "autoSaved": false
    }
  ]
}
```

### 3. UI设计（FileTree历史标签页）

```
┌─────────────────────────────┐
│ 文件 │ 大纲 │ [历史]        │ ← 标签页
├─────────────────────────────┤
│ 版本 3                      │
│ 1天前  -17                  │
│ 从版本1恢复                 │
├─────────────────────────────┤
│ 版本 2                      │
│ 1天前  -17                  │
├─────────────────────────────┤
│ 版本 1  [最新]              │
│ 8分钟前                     │
└─────────────────────────────┘
```

---

## 📅 开发阶段

### 阶段一：配置和后端API（4小时）

#### 任务 1.1：配置共享目录
**文件：** `config/resource`
```json
添加 mdeditor/history 共享配置
```

#### 任务 1.2：创建后端历史管理模块
**文件：** `app/server/historyManager.js`（新建）

**核心函数：**
```javascript
// 获取历史存储目录（使用环境变量，不硬编码）
function getHistoryDir() {
  // 方法1：从环境变量解析（生产环境）
  const sharePaths = (process.env.TRIM_DATA_SHARE_PATHS || '').split(':')
  const historyPath = sharePaths.find(p => p.includes('/history'))
  
  // 方法2：使用相对路径（开发环境 fallback）
  return historyPath || path.join(__dirname, '../shares/history')
}

// 生成文件路径哈希（作为目录名）
function getFileHash(filePath) {
  return crypto.createHash('md5').update(filePath).digest('hex').substring(0, 16)
}

// 保存版本快照
async function saveVersion(filePath, content, label = '', autoSaved = true)

// 获取版本列表
async function getVersionList(filePath)

// 获取版本内容
async function getVersionContent(filePath, versionNumber)

// 删除版本
async function deleteVersion(filePath, versionNumber)

// 恢复版本
async function restoreVersion(filePath, versionNumber)
```

#### 任务 1.3：添加API路由
**文件：** `app/server/server.js`

**新增API：**
```javascript
POST /api/file/history/save
GET  /api/file/history/list?path=xxx
GET  /api/file/history/version?path=xxx&version=1
POST /api/file/history/delete
POST /api/file/history/restore
```

---

### 阶段二：前端适配器（2小时）

#### 任务 2.1：创建前端历史管理器
**文件：** `src/utils/fileHistoryManagerV2.js`（新建）

```javascript
// 保存版本
export async function saveFileHistory(filePath, content, label, autoSaved)

// 获取版本列表
export async function getFileHistory(filePath)

// 获取版本内容
export async function getVersionContent(filePath, versionNumber)

// 删除版本
export async function deleteVersion(filePath, versionNumber)

// 恢复版本
export async function restoreVersion(filePath, versionNumber)

// 格式化时间显示
export function formatHistoryTime(timestamp)
```

---

### 阶段三：UI组件开发（4小时）

#### 任务 3.1：创建历史版本列表组件
**文件：** `src/components/HistoryPanel.jsx`（新建）

**UI结构：**
```jsx
<div className="history-panel">
  {loading ? (
    <div className="history-loading">加载中...</div>
  ) : versions.length === 0 ? (
    <div className="history-empty">暂无历史版本</div>
  ) : (
    <div className="history-list">
      {versions.map(v => (
        <div 
          key={v.versionNumber}
          className={`history-item ${v.versionNumber === currentVersion ? 'current' : ''}`}
          onClick={() => onVersionClick(v)}
        >
          <div className="history-header">
            <span className="version-number">版本 {v.versionNumber}</span>
            {v.label && <span className="version-label">{v.label}</span>}
          </div>
          <div className="history-meta">
            <span className="history-time">{formatHistoryTime(v.timestamp)}</span>
            <span className="history-size">{v.lines}行</span>
          </div>
          {v.versionNumber === currentVersion && (
            <span className="current-badge">最新</span>
          )}
        </div>
      ))}
    </div>
  )}
</div>
```

**样式文件：** `src/components/HistoryPanel.css`（新建）

```css
.history-panel {
  height: 100%;
  overflow-y: auto;
}

.history-list {
  padding: 8px;
}

.history-item {
  padding: 12px;
  margin-bottom: 8px;
  background: var(--bg-secondary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.history-item:hover {
  background: var(--bg-hover);
}

.history-item.current {
  border: 2px solid var(--primary-color);
}

.history-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.version-number {
  font-weight: 600;
  color: var(--text-primary);
}

.version-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.history-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: var(--text-secondary);
}

.current-badge {
  display: inline-block;
  padding: 2px 8px;
  background: var(--primary-color);
  color: white;
  border-radius: 4px;
  font-size: 11px;
  margin-top: 4px;
}

.history-empty {
  padding: 40px 20px;
  text-align: center;
  color: var(--text-secondary);
}
```

#### 任务 3.2：集成到FileTree组件
**文件：** `src/components/FileTree.jsx`

**修改点：**
```jsx
// 1. 导入HistoryPanel
import HistoryPanel from './HistoryPanel'

// 2. 替换"历史功能开发中..."
{activeTab === 'history' && (
  <HistoryPanel 
    currentPath={currentPath}
    onVersionSelect={handleVersionSelect}
    onVersionRestore={handleVersionRestore}
  />
)}

// 3. 添加处理函数
const handleVersionSelect = (version) => {
  // 显示版本预览对话框
}

const handleVersionRestore = async (version) => {
  if (confirm(`确定恢复到版本 ${version.versionNumber}？`)) {
    const result = await restoreVersion(currentPath, version.versionNumber)
    if (result) {
      // 刷新编辑器内容
      onFileSelect(currentPath)
    }
  }
}
```

---

### 阶段四：版本预览对话框（3小时）

#### 任务 4.1：创建版本预览组件
**文件：** `src/components/VersionPreviewDialog.jsx`（新建）

**功能：**
- 显示版本内容预览
- 显示版本元数据（时间、大小、行数）
- 提供恢复、删除、对比按钮
- Markdown渲染预览

**UI结构：**
```jsx
<div className="dialog-overlay">
  <div className="dialog-content version-preview-dialog">
    <div className="dialog-header">
      <h2>版本 {version.versionNumber} 预览</h2>
      <button onClick={onClose}>×</button>
    </div>
    
    <div className="version-info">
      <span>{formatHistoryTime(version.timestamp)}</span>
      <span>{version.lines} 行</span>
      <span>{formatFileSize(version.size)}</span>
    </div>
    
    <div className="version-content">
      <div className="preview-tabs">
        <button onClick={() => setViewMode('source')}>源码</button>
        <button onClick={() => setViewMode('preview')}>预览</button>
      </div>
      
      {viewMode === 'source' ? (
        <pre className="source-view">{content}</pre>
      ) : (
        <div className="markdown-preview" 
             dangerouslySetInnerHTML={{ __html: renderedHtml }} />
      )}
    </div>
    
    <div className="dialog-footer">
      <button onClick={onDelete}>删除</button>
      <button onClick={onCompare}>对比</button>
      <button onClick={onRestore}>恢复此版本</button>
    </div>
  </div>
</div>
```

---

### 阶段五：自动保存集成（2小时）

#### 任务 5.1：替代草稿自动保存功能
**目标：** 去掉 draftManager.js 和 useAutoSave.js，使用历史版本替代

**修改文件：** `src/App.jsx`

**核心逻辑：**
```javascript
import { saveFileHistory } from './utils/fileHistoryManagerV2'

// 状态管理
const [lastSavedContent, setLastSavedContent] = useState('')
const [currentVersion, setCurrentVersion] = useState(0)
const [isSaving, setIsSaving] = useState(false)

// 检查内容是否有变化
const hasChanges = () => {
  return content.trim() !== lastSavedContent.trim()
}

// 保存历史版本快照
const saveSnapshot = async (isManual = false) => {
  if (!currentPath || !hasChanges() || isSaving) return
  
  setIsSaving(true)
  try {
    const result = await saveFileHistory(currentPath, content, '', !isManual)
    
    if (result.ok) {
      setLastSavedContent(content)
      setCurrentVersion(result.versionNumber)
      console.log(`版本 ${result.versionNumber} 已保存`)
    }
  } catch (error) {
    console.error('保存历史版本失败:', error)
  } finally {
    setIsSaving(false)
  }
}

// 自动保存（定时器 - 30秒）
useEffect(() => {
  if (!currentPath) return
  
  const timer = setInterval(() => {
    if (hasChanges()) {
      saveSnapshot(false) // 自动保存
    }
  }, 30000) // 30秒
  
  return () => clearInterval(timer)
}, [currentPath, content])

// 手动保存（Ctrl+S）
useEffect(() => {
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      saveSnapshot(true) // 手动保存
    }
  }
  
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [currentPath, content])

// 显示保存状态
<div className="save-indicator">
  {isSaving ? (
    <span>保存中...</span>
  ) : currentVersion > 0 ? (
    <span>✓ 版本 {currentVersion} 已保存</span>
  ) : (
    <span>未保存</span>
  )}
</div>
```

**删除文件：**
- `src/utils/draftManager.js` - 删除
- `src/hooks/useAutoSave.js` - 删除
- `src/components/DraftRecoveryDialog.jsx` - 删除（如果有）

**关键点：**
1. 不需要"保存文件到服务器"操作
2. 直接保存快照到 shares/history
3. 自动保存和手动保存都创建历史版本
4. 显示当前版本号和保存状态

---

### 阶段六：版本对比功能（3小时）

#### 任务 6.1：安装依赖
```bash
npm install diff-match-patch
```

#### 任务 6.2：创建对比工具
**文件：** `src/utils/diffUtils.js`（新建）

```javascript
import DiffMatchPatch from 'diff-match-patch'

export function calculateDiff(oldText, newText) {
  const dmp = new DiffMatchPatch()
  const diffs = dmp.diff_main(oldText, newText)
  dmp.diff_cleanupSemantic(diffs)
  
  return {
    diffs,
    added: diffs.filter(d => d[0] === 1).length,
    removed: diffs.filter(d => d[0] === -1).length
  }
}

export function renderDiffHtml(diffs) {
  return diffs.map(([type, text]) => {
    if (type === 1) return `<ins>${escapeHtml(text)}</ins>`
    if (type === -1) return `<del>${escapeHtml(text)}</del>`
    return escapeHtml(text)
  }).join('')
}
```

#### 任务 6.3：创建对比视图组件
**文件：** `src/components/VersionDiffDialog.jsx`（新建）

---

## 📊 开发进度表

| 阶段 | 任务 | 预计工时 | 优先级 | 状态 |
|------|------|----------|--------|------|
| 一 | 1.1 配置共享目录 | 0.5h | 高 | ⬜ 待开始 |
| 一 | 1.2 后端历史管理模块 | 2h | 高 | ⬜ 待开始 |
| 一 | 1.3 添加API路由 | 1.5h | 高 | ⬜ 待开始 |
| 二 | 2.1 前端历史管理器 | 2h | 高 | ⬜ 待开始 |
| 三 | 3.1 历史版本列表组件 | 2h | 高 | ⬜ 待开始 |
| 三 | 3.2 集成到FileTree | 2h | 高 | ⬜ 待开始 |
| 四 | 4.1 版本预览对话框 | 3h | 中 | ⬜ 待开始 |
| 五 | 5.1 替代草稿自动保存 | 2h | 高 | ⬜ 待开始 |
| 五 | 5.2 删除旧的草稿功能 | 0.5h | 高 | ⬜ 待开始 |
| 六 | 6.1-6.3 版本对比功能 | 3h | 中 | ⬜ 待开始 |

**总计：** 约 18.5 小时（2-3 个工作日）

---

## 🧪 测试计划

### 1. 后端测试
```bash
# 测试保存版本
curl -X POST http://localhost:18080/api/file/history/save \
  -H "Content-Type: application/json" \
  -d '{"filePath":"/vol4/test.md","content":"# Test","label":"测试"}'

# 测试获取版本列表
curl http://localhost:18080/api/file/history/list?path=/vol4/test.md
```

### 2. 前端测试
- [ ] 创建文档，编辑并保存多次
- [ ] 切换到"历史"标签页，查看版本列表
- [ ] 点击版本，查看预览
- [ ] 恢复到旧版本
- [ ] 删除版本
- [ ] 测试自动保存（30秒）创建版本
- [ ] 测试手动保存（Ctrl+S）创建版本
- [ ] 测试版本对比功能
- [ ] 验证草稿功能已完全移除

---

## 📁 文件清单

### 新建文件
```
config/resource                           # 修改：添加history共享
app/server/historyManager.js              # 后端历史管理
src/utils/fileHistoryManagerV2.js         # 前端API适配器
src/utils/diffUtils.js                    # 差异计算
src/components/HistoryPanel.jsx           # 历史列表组件
src/components/HistoryPanel.css           # 历史列表样式
src/components/VersionPreviewDialog.jsx   # 版本预览对话框
src/components/VersionPreviewDialog.css   # 预览对话框样式
src/components/VersionDiffDialog.jsx      # 版本对比对话框
src/components/VersionDiffDialog.css      # 对比对话框样式
```

### 修改文件
```
app/server/server.js                      # 添加API路由
src/components/FileTree.jsx               # 集成HistoryPanel
src/App.jsx                               # 替代草稿自动保存
```

### 删除文件（去掉草稿功能）
```
src/utils/draftManager.js                 # 删除：草稿管理器
src/hooks/useAutoSave.js                  # 删除：自动保存Hook
src/components/DraftRecoveryDialog.jsx    # 删除：草稿恢复对话框
src/components/DraftRecoveryDialog.css    # 删除：对话框样式
```

---

## 🚀 快速开始

### 第一步：修改配置
```bash
# 编辑 config/resource，添加 mdeditor/history 共享
```

### 第二步：安装依赖
```bash
cd app/ui/frontend
npm install diff-match-patch
```

### 第三步：创建后端模块
按照任务1.2创建 `historyManager.js`

### 第四步：创建前端组件
按照任务3.1创建 `HistoryPanel.jsx`

### 第五步：测试验证
运行应用，测试历史版本功能

---

## 💡 技术要点

### 1. 文件路径哈希
```javascript
// 使用MD5哈希避免路径中的特殊字符
const crypto = require('crypto')
const hash = crypto.createHash('md5').update(filePath).digest('hex').substring(0, 16)
```

### 2. 获取共享目录路径（重要！）
```javascript
// ✅ 正确方式：使用环境变量
function getHistoryDir() {
  // 优先使用环境变量（生产环境）
  const sharePaths = (process.env.TRIM_DATA_SHARE_PATHS || '').split(':')
  const historyPath = sharePaths.find(p => p.includes('/history'))
  
  // Fallback：使用相对路径（开发环境）
  return historyPath || path.join(__dirname, '../shares/history')
}

// ❌ 错误方式：硬编码
// const historyDir = '/vol4/@appshare/mdeditor/history'  // 禁止！
```

### 3. 版本号生成
```javascript
// 自动递增版本号
const currentVersion = versions.length > 0 ? Math.max(...versions.map(v => v.versionNumber)) : 0
const newVersion = currentVersion + 1
```

### 4. 版本保留策略
```javascript
// 无限制保留所有版本（不自动删除）
// 用户可以手动删除不需要的版本
// 所有版本都会永久保存在 shares/history 目录中
```

---

## 📝 注意事项

1. **路径安全**：所有文件操作必须验证路径合法性
2. **禁止硬编码**：必须使用 `process.env.TRIM_DATA_SHARE_PATHS` 或相对路径访问共享目录
3. **文件隔离**：⭐ 每个文件的历史版本独立存储，使用文件路径哈希隔离，防止跨文件访问
4. **权限验证**：后端API必须验证用户只能访问授权目录内的文件历史
5. **环境变量说明**：
   - `TRIM_DATA_SHARE_PATHS`：共享路径列表，多个路径用冒号分隔
   - 示例：`/vol4/@appshare/mdeditor/images:/vol4/@appshare/mdeditor/history`
6. **删除确认**：
   - 单个版本删除：直接删除
   - 删除所有版本：使用自定义确认对话框（不使用系统弹窗）
7. **版本预览**：使用窗口（Dialog）方式预览版本内容
8. **性能优化**：版本列表使用虚拟滚动（如果版本很多）
9. **错误处理**：网络请求失败时提供友好提示
10. **用户体验**：所有操作提供加载状态
11. **数据备份**：定期备份 shares/history 目录
12. **移除草稿功能**：
    - 删除 `draftManager.js`、`useAutoSave.js`
    - 删除 `DraftRecoveryDialog.jsx`
    - 从 `App.jsx` 中移除相关引用
    - 清理 localStorage 中的草稿数据（可选）

---

**文档版本：** 4.0.0（最终版 - 移除草稿功能）  
**创建时间：** 2025-03-06  
**更新时间：** 2025-03-06  
**适用场景：** 飞牛NAS Markdown编辑器  
**存储方式：** 共享目录（shares/history）  
**UI位置：** FileTree历史标签页  
**重要提醒：** 
- 禁止硬编码路径，必须使用环境变量或相对路径
- 已移除草稿自动保存功能，统一使用历史版本
