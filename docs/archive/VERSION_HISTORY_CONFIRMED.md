# 历史版本功能 - 最终确认

## ✅ 已确认的需求

### 1. 功能定位
- **替代草稿自动保存功能**
- 统一使用历史版本管理
- 删除 draftManager.js、useAutoSave.js 等旧文件

### 2. 存储方案
- **位置**：飞牛NAS共享目录 `shares/history`
- **访问**：使用环境变量 `TRIM_DATA_SHARE_PATHS`（禁止硬编码）
- **结构**：文件路径哈希 + versions.json + 版本快照文件

### 3. UI展示
- **位置**：FileTree组件的"历史"标签页
- **风格**：简洁列表，不使用emoji表情
- **功能**：查看、预览、恢复、对比、删除版本

### 4. 版本保存时机
- **手动保存**：用户按 Ctrl+S 时创建版本（`autoSaved: false`）
- **自动保存**：每30秒自动保存并创建版本（`autoSaved: true`）

### 5. 版本保留策略 ⭐
- **无限制保留所有版本**
- **不自动删除旧版本**
- **用户可以手动删除不需要的版本**

---

## 📝 核心代码要点

### 后端保存版本函数（historyManager.js）

```javascript
async function saveVersion(filePath, content, label = '', autoSaved = true) {
  // ... 前面的代码 ...
  
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
  
  // ⭐ 无限制保留所有版本（不自动删除）
  // 用户可以通过UI手动删除不需要的版本
  
  // 保存索引
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8')
  
  return { versionNumber, fileName }
}
```

### 前端保存逻辑（App.jsx）

```javascript
// 手动保存（Ctrl+S）
const handleSave = async () => {
  try {
    // 1. 保存文件到服务器
    await fetch('/api/file/save', { ... })
    
    // 2. 创建历史版本（手动标记）
    await saveFileHistory(currentPath, content, '', false)
    
    showToast('保存成功', 'success')
  } catch (error) {
    showToast('保存失败', 'error')
  }
}

// 自动保存（30秒）
useEffect(() => {
  if (!autoSaveEnabled || !currentPath || !hasUnsavedChanges) return

  const timer = setTimeout(async () => {
    try {
      await fetch('/api/file/save', { ... })
      
      // 创建历史版本（自动标记）
      await saveFileHistory(currentPath, content, '', true)
      
      setHasUnsavedChanges(false)
    } catch (error) {
      console.warn('自动保存失败:', error)
    }
  }, 30000)

  return () => clearTimeout(timer)
}, [currentPath, content, autoSaveEnabled, hasUnsavedChanges])
```

---

## 🗂️ 版本数据结构

### versions.json
```json
{
  "filePath": "/vol4/documents/test.md",
  "currentVersion": 15,
  "versions": [
    {
      "versionNumber": 15,
      "fileName": "v015_1709712645000.md",
      "timestamp": 1709712645000,
      "size": 2048,
      "lines": 45,
      "label": "",
      "autoSaved": true
    },
    {
      "versionNumber": 14,
      "fileName": "v014_1709712615000.md",
      "timestamp": 1709712615000,
      "size": 2000,
      "lines": 43,
      "label": "完成初稿",
      "autoSaved": false
    }
    // ... 所有历史版本都保留，不限制数量
  ]
}
```

---

## 🎯 用户体验流程

### 场景1：正常编辑和保存

```
1. 用户打开文件 test.md
   └─ 加载文件内容

2. 用户编辑内容
   └─ 30秒后自动保存
   └─ 创建版本1（自动保存）

3. 用户继续编辑
   └─ 30秒后自动保存
   └─ 创建版本2（自动保存）

4. 用户按 Ctrl+S 手动保存
   └─ 创建版本3（手动保存）
   └─ 可以添加版本标签

5. 用户点击"历史"标签页
   └─ 显示所有版本：版本3、版本2、版本1
   └─ 可以查看、对比、恢复任意版本
   └─ 可以手动删除不需要的版本
```

### 场景2：版本管理

```
1. 查看历史版本列表
   └─ 显示所有版本（无数量限制）
   └─ 区分手动保存和自动保存

2. 选择某个版本
   └─ 查看版本内容预览
   └─ 查看版本元数据（时间、大小、行数）

3. 版本对比
   └─ 选择两个版本进行对比
   └─ 高亮显示差异

4. 恢复版本
   └─ 恢复到指定版本
   └─ 恢复操作会创建新版本

5. 删除版本
   └─ 手动删除不需要的版本
   └─ 释放存储空间
```

---

## 📊 与草稿功能的对比

| 特性 | 草稿自动保存（旧）| 历史版本（新）|
|------|------------------|---------------|
| 存储位置 | localStorage | 文件系统（shares/history）|
| 存储容量 | 5-10MB限制 | 无限制 |
| 版本数量 | 只保留最新 | 无限制保留所有版本 |
| 触发时机 | 每30秒 | 手动保存 + 自动保存 |
| 数据持久化 | 清除缓存会丢失 | 永久保存 |
| 版本管理 | 不支持 | 支持查看、对比、恢复 |
| 跨设备访问 | 不支持 | 支持（NAS共享）|

---

## 🚀 实施清单

### 配置修改
- [x] 更新 `config/resource` 添加 history 共享

### 后端开发
- [ ] 创建 `app/server/historyManager.js`
- [ ] 修改 `app/server/server.js` 添加API路由
  - POST `/api/file/history/save`
  - GET `/api/file/history/list`
  - GET `/api/file/history/version`
  - POST `/api/file/history/delete`

### 前端开发
- [ ] 创建 `src/utils/fileHistoryManagerV2.js`
- [ ] 创建 `src/components/HistoryPanel.jsx`
- [ ] 创建 `src/components/HistoryPanel.css`
- [ ] 修改 `src/App.jsx` 替代草稿功能
- [ ] 修改 `src/components/FileTree.jsx` 集成HistoryPanel

### 删除旧功能
- [ ] 删除 `src/utils/draftManager.js`
- [ ] 删除 `src/hooks/useAutoSave.js`
- [ ] 删除 `src/components/DraftRecoveryDialog.jsx`
- [ ] 删除 `src/components/DraftRecoveryDialog.css`

### 测试验证
- [ ] 手动保存创建版本
- [ ] 自动保存创建版本
- [ ] 历史标签页显示版本列表
- [ ] 版本预览功能
- [ ] 版本恢复功能
- [ ] 版本删除功能
- [ ] 所有版本都被保留（无自动删除）

---

## 📚 相关文档

- **VERSION_HISTORY_FINAL_PLAN.md** - 详细开发计划（18.5小时）
- **QUICK_IMPLEMENTATION_GUIDE.md** - 快速实施指南（4-5小时核心功能）
- **FNNAS_PATH_ACCESS_GUIDE.md** - 飞牛NAS路径访问规范

---

## ⚠️ 重要提醒

1. **禁止硬编码路径**：必须使用 `process.env.TRIM_DATA_SHARE_PATHS` 或相对路径
2. **无限制保留版本**：不自动删除旧版本，用户手动管理
3. **错误处理**：历史版本保存失败不影响文件保存主流程
4. **性能考虑**：版本列表较多时使用虚拟滚动优化

---

**文档版本：** 1.0.0  
**确认时间：** 2025-03-06  
**状态：** ✅ 需求已确认，可以开始实施
