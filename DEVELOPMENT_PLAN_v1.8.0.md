# Markdown 编辑器 v1.8.0 开发计划

## 📅 开发信息
**版本号**: v1.8.0  
**开发日期**: 2026-02-25  
**版本类型**: 新功能 - 右键菜单和文件操作  
**预计时间**: 4-5 小时

## 🎯 开发目标

完善文件管理功能，添加右键菜单和常用文件操作，提升用户体验。

## 📋 功能清单

### 1. 文件树右键菜单 ⭐ 高优先级
**功能**: 在文件树中右键显示上下文菜单  
**菜单项**:
- 打开文件
- 添加到收藏夹 / 取消收藏
- 重命名
- 删除
- 复制路径
- 在文件树中显示

**预计工作量**: 2 小时

### 2. 文件重命名 ⭐ 高优先级
**功能**: 重命名文件或文件夹  
**实现**:
- 右键菜单选择"重命名"
- 弹出对话框输入新名称
- 调用后端 API 重命名
- 刷新文件树

**预计工作量**: 1 小时

### 3. 文件删除 ⭐ 高优先级
**功能**: 删除文件或文件夹  
**实现**:
- 右键菜单选择"删除"
- 确认对话框
- 调用后端 API 删除
- 刷新文件树

**预计工作量**: 0.5 小时

### 4. 文件夹操作 ⭐ 中优先级
**功能**: 新建文件夹  
**实现**:
- 右键菜单选择"新建文件夹"
- 弹出对话框输入名称
- 调用后端 API 创建
- 刷新文件树

**预计工作量**: 0.5 小时

### 5. 复制/移动文件 ⭐ 低优先级
**功能**: 复制或移动文件  
**实现**:
- 右键菜单选择"复制"/"移动"
- 选择目标位置
- 调用后端 API
- 刷新文件树

**预计工作量**: 1 小时

## 🔧 技术实现

### 1. ContextMenu 组件

```jsx
// ContextMenu.jsx
import React, { useEffect } from 'react'

function ContextMenu({ 
  x, 
  y, 
  items, 
  onClose,
  theme 
}) {
  useEffect(() => {
    const handleClick = () => onClose()
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [onClose])

  return (
    <div 
      className={`context-menu ${theme}`}
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, index) => (
        item.divider ? (
          <div key={index} className="context-menu-divider" />
        ) : (
          <div
            key={index}
            className={`context-menu-item ${item.disabled ? 'disabled' : ''}`}
            onClick={() => {
              if (!item.disabled) {
                item.action()
                onClose()
              }
            }}
          >
            {item.icon && <span className="menu-icon">{item.icon}</span>}
            <span className="menu-label">{item.label}</span>
            {item.shortcut && <span className="menu-shortcut">{item.shortcut}</span>}
          </div>
        )
      ))}
    </div>
  )
}

export default ContextMenu
```

### 2. RenameDialog 组件

```jsx
// RenameDialog.jsx
import React, { useState } from 'react'

function RenameDialog({ 
  oldName, 
  onConfirm, 
  onClose,
  theme 
}) {
  const [newName, setNewName] = useState(oldName)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newName && newName !== oldName) {
      onConfirm(newName)
    }
  }

  return (
    <div className={`dialog-overlay ${theme}`} onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>重命名</h2>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="dialog-body">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="dialog-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn-primary">
              确定
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RenameDialog
```

### 3. 后端 API（需要添加）

```javascript
// 重命名文件
POST /api/file/rename
{
  "oldPath": "/path/to/old.md",
  "newPath": "/path/to/new.md"
}

// 删除文件
DELETE /api/file
{
  "path": "/path/to/file.md"
}

// 创建文件夹
POST /api/directory
{
  "path": "/path/to/new-folder"
}

// 复制文件
POST /api/file/copy
{
  "sourcePath": "/path/to/source.md",
  "targetPath": "/path/to/target.md"
}

// 移动文件
POST /api/file/move
{
  "sourcePath": "/path/to/source.md",
  "targetPath": "/path/to/target.md"
}
```

### 4. FileTree 集成

```jsx
// FileTree.jsx
const [contextMenu, setContextMenu] = useState(null)

const handleContextMenu = (e, node) => {
  e.preventDefault()
  
  const menuItems = [
    {
      label: '打开',
      icon: '📂',
      action: () => handleFileClick(node),
      disabled: node.type !== 'file'
    },
    { divider: true },
    {
      label: isFavorite(node.path) ? '取消收藏' : '添加到收藏夹',
      icon: '⭐',
      action: () => handleToggleFavorite(node.path, node.type)
    },
    { divider: true },
    {
      label: '重命名',
      icon: '✏️',
      action: () => handleRename(node)
    },
    {
      label: '删除',
      icon: '🗑️',
      action: () => handleDelete(node)
    },
    { divider: true },
    {
      label: '复制路径',
      icon: '📋',
      action: () => handleCopyPath(node.path)
    }
  ]
  
  setContextMenu({
    x: e.clientX,
    y: e.clientY,
    items: menuItems
  })
}

// 在 renderNode 中添加
<div
  onContextMenu={(e) => handleContextMenu(e, node)}
>
  {/* ... */}
</div>
```

## 📊 预期成果

### 功能改进
- ✅ 文件树右键菜单
- ✅ 文件重命名功能
- ✅ 文件删除功能
- ✅ 新建文件夹功能
- ✅ 添加到收藏夹（右键）
- ✅ 复制路径功能

### 用户体验
- 更便捷的文件操作
- 符合桌面应用习惯
- 减少点击次数
- 提升工作效率

### 代码统计
```
新增代码: 约 400 行
新增组件: 2 个
新增文件: 4 个
修改文件: 3 个
```

## 🗓️ 开发计划

### 阶段 1: ContextMenu 组件（1 小时）
1. 创建 ContextMenu 组件
2. 创建 ContextMenu 样式
3. 测试右键菜单显示

### 阶段 2: RenameDialog 组件（0.5 小时）
1. 创建 RenameDialog 组件
2. 集成到 FileTree
3. 测试重命名功能

### 阶段 3: 文件操作功能（1.5 小时）
1. 实现删除功能
2. 实现新建文件夹
3. 实现复制路径
4. 测试所有操作

### 阶段 4: 后端 API（1 小时）
1. 添加重命名 API
2. 添加删除 API
3. 添加创建文件夹 API
4. 测试 API

### 阶段 5: 集成和测试（1 小时）
1. 集成所有功能
2. 完整测试
3. 更新版本号
4. 构建 fpk

## ✅ 测试清单

### 功能测试
- [ ] 右键菜单正常显示
- [ ] 菜单项点击正常
- [ ] 重命名功能正常
- [ ] 删除功能正常
- [ ] 新建文件夹正常
- [ ] 添加收藏正常
- [ ] 复制路径正常

### 边界测试
- [ ] 重命名为空名称
- [ ] 重命名为已存在名称
- [ ] 删除当前打开文件
- [ ] 删除非空文件夹

### 兼容性测试
- [ ] 深色主题正常
- [ ] 浅色主题正常
- [ ] 与现有功能无冲突

## 📝 发布准备

### 版本信息
```
版本: v1.8.0
类型: 新功能
发布日期: 2026-02-25
```

### 更新内容
- 文件树右键菜单
- 文件重命名
- 文件删除
- 新建文件夹
- 添加到收藏夹（右键）
- 复制路径

## 🎯 成功标准

1. 所有功能正常工作
2. 用户体验良好
3. 无新增 bug
4. 性能无明显影响
5. 代码质量良好

---

**开发状态**: 📋 计划中  
**开始时间**: 2026-02-25  
**预计完成**: 2026-02-25

准备开始开发！🚀


