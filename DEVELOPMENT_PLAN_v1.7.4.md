# Markdown 编辑器 v1.7.4 开发计划

## 📅 开发信息
**版本号**: v1.7.4  
**开发日期**: 2026-02-25  
**版本类型**: Bug 修复和优化  
**预计时间**: 2-3 小时

## 🎯 开发目标

修复 v1.7.x 系列的已知问题，优化性能和用户体验，为 v1.8.0 做准备。

## 📋 待修复问题

### 1. 收藏夹拖拽排序 ⭐ 高优先级
**问题**: 收藏夹不支持拖拽排序  
**影响**: 用户无法自定义收藏顺序  
**解决方案**: 实现拖拽排序功能

**技术方案**:
- 使用原生 HTML5 拖拽 API
- 或使用轻量级拖拽库
- 更新 favoritesManager 支持排序
- 更新 FavoritesPanel 组件

**预计工作量**: 1-1.5 小时

### 2. 搜索性能优化 ⭐ 高优先级
**问题**: 大量文件时搜索可能较慢  
**影响**: 用户体验下降  
**解决方案**: 优化搜索算法和防抖

**技术方案**:
- 添加搜索防抖（300ms）
- 优化 filterFileTree 算法
- 限制搜索结果数量
- 添加搜索加载状态

**预计工作量**: 0.5 小时

### 3. 大文件加载优化 ⭐ 中优先级
**问题**: 大文件（>1MB）加载较慢  
**影响**: 用户体验下降  
**解决方案**: 添加加载提示和优化

**技术方案**:
- 添加文件大小检查
- 显示加载进度
- 大文件警告提示
- 考虑分块加载

**预计工作量**: 0.5 小时

### 4. UI/UX 细节改进 ⭐ 中优先级
**问题**: 部分 UI 细节需要优化  
**影响**: 用户体验  
**解决方案**: 改进交互和视觉效果

**改进项**:
- 对话框动画优化
- 按钮悬停效果
- 加载状态提示
- 错误提示优化
- 空状态优化

**预计工作量**: 0.5 小时

### 5. 代码重构和清理 ⭐ 低优先级
**问题**: 部分代码可以优化  
**影响**: 代码质量  
**解决方案**: 重构和清理

**改进项**:
- 移除未使用的代码
- 优化重复代码
- 改进注释
- 统一代码风格

**预计工作量**: 0.5 小时

## 🔧 技术实现

### 1. 收藏夹拖拽排序

#### 方案 A: 原生 HTML5 拖拽
```javascript
// FavoritesPanel.jsx
const handleDragStart = (e, index) => {
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', index)
}

const handleDragOver = (e) => {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
}

const handleDrop = (e, dropIndex) => {
  e.preventDefault()
  const dragIndex = parseInt(e.dataTransfer.getData('text/plain'))
  onReorder(dragIndex, dropIndex)
}
```

#### 方案 B: 使用 react-beautiful-dnd
```javascript
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

// 需要安装: npm install react-beautiful-dnd
```

**推荐**: 方案 A（原生实现，无需额外依赖）

### 2. 搜索防抖

```javascript
// FileSearchBox.jsx
import { useState, useEffect, useCallback } from 'react'

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => clearTimeout(timer)
  }, [value, delay])
  
  return debouncedValue
}

// 使用
const debouncedQuery = useDebounce(searchQuery, 300)
```

### 3. 大文件加载优化

```javascript
// App.jsx
const loadFile = async (path) => {
  try {
    setStatus('正在加载...')
    setLoading(true)
    
    const response = await fetch(`/api/file?path=${encodeURIComponent(path)}`)
    const data = await response.json()
    
    if (data.ok) {
      const fileContent = data.content || ''
      
      // 检查文件大小
      if (fileContent.length > 1024 * 1024) { // 1MB
        const confirmed = window.confirm(
          '文件较大（>1MB），加载可能需要一些时间。是否继续？'
        )
        if (!confirmed) {
          setLoading(false)
          return
        }
      }
      
      setContent(fileContent)
      // ...
    }
  } finally {
    setLoading(false)
  }
}
```

## 📊 预期成果

### 功能改进
- ✅ 收藏夹支持拖拽排序
- ✅ 搜索性能提升 50%
- ✅ 大文件加载体验改善
- ✅ UI/UX 细节优化
- ✅ 代码质量提升

### 性能指标
```
搜索响应: < 100ms → < 50ms
大文件加载: 有提示和进度
内存占用: 无明显增加
```

### 代码统计
```
修改文件: 5-8 个
新增代码: 约 200 行
优化代码: 约 100 行
```

## 🗓️ 开发计划

### 阶段 1: 收藏夹拖拽排序（1-1.5 小时）
1. 实现拖拽事件处理
2. 更新 favoritesManager
3. 更新 FavoritesPanel 组件
4. 测试拖拽功能

### 阶段 2: 性能优化（0.5 小时）
1. 添加搜索防抖
2. 优化搜索算法
3. 添加大文件检查
4. 测试性能改进

### 阶段 3: UI/UX 改进（0.5 小时）
1. 优化对话框动画
2. 改进加载状态
3. 优化错误提示
4. 测试用户体验

### 阶段 4: 代码清理（0.5 小时）
1. 移除未使用代码
2. 优化重复代码
3. 改进注释
4. 代码格式化

### 阶段 5: 测试和发布（0.5 小时）
1. 完整功能测试
2. 性能测试
3. 更新版本号
4. 构建 fpk

## ✅ 测试清单

### 功能测试
- [ ] 收藏夹拖拽排序正常
- [ ] 搜索性能提升明显
- [ ] 大文件加载有提示
- [ ] UI 动画流畅
- [ ] 所有现有功能正常

### 性能测试
- [ ] 搜索响应时间 < 50ms
- [ ] 大文件加载有进度
- [ ] 内存占用正常
- [ ] 无明显卡顿

### 兼容性测试
- [ ] 深色主题正常
- [ ] 浅色主题正常
- [ ] 与现有功能无冲突

## 📝 发布准备

### 版本信息
```
版本: v1.7.4
类型: Bug 修复和优化
发布日期: 2026-02-25
```

### 更新内容
- 收藏夹拖拽排序
- 搜索性能优化
- 大文件加载优化
- UI/UX 改进
- 代码清理

## 🎯 成功标准

1. 所有已知问题修复
2. 性能指标达标
3. 用户体验提升
4. 代码质量改善
5. 无新增 bug

---

**开发状态**: 📋 计划中  
**开始时间**: 2026-02-25  
**预计完成**: 2026-02-25

准备开始开发！🚀

