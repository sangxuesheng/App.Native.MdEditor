# ✅ 工具栏和菜单栏格式化按钮焦点问题修复

## 🐛 问题描述

使用工具栏和菜单栏的格式化按钮（如 H1-H6、无序列表、有序列表、任务列表、引用等）后，光标没有自动回到编辑器，需要手动点击编辑区才能继续编辑。

## 🔍 问题原因

在 `handleToolbarInsert` 函数中，`line` 和 `heading` 模式在执行完编辑操作后直接 `return`，没有调用 `editor.focus()`，导致编辑器失去焦点。

## 🔧 修复方案

在 `line` 和 `heading` 两个 case 的 `return` 语句之前添加 `editor.focus()`。

### 修改位置

**文件**：`app/ui/frontend/src/App.jsx`

**函数**：`handleToolbarInsert`

### 修改内容

#### 1. line 模式（无序列表、有序列表、任务列表等）

```javascript
case 'line':
  const lineContent = model.getLineContent(selection.startLineNumber)
  newText = `${before}${lineContent}`
  editor.executeEdits('', [{
    range: {
      startLineNumber: selection.startLineNumber,
      startColumn: 1,
      endLineNumber: selection.startLineNumber,
      endColumn: lineContent.length + 1
    },
    text: newText
  }])
  editor.setPosition({
    lineNumber: selection.startLineNumber,
    column: before.length + 1
  })
  editor.focus()  // ✅ 新增：让编辑器获得焦点
  return
```

#### 2. heading 模式（H1-H6 标题）

```javascript
case 'heading':
  const headingLine = model.getLineContent(selection.startLineNumber)
  const cleanLine = headingLine.replace(/^#+\s*/, '')
  newText = `${before}${cleanLine}`
  editor.executeEdits('', [{
    range: {
      startLineNumber: selection.startLineNumber,
      startColumn: 1,
      endLineNumber: selection.startLineNumber,
      endColumn: headingLine.length + 1
    },
    text: newText
  }])
  editor.setPosition({
    lineNumber: selection.startLineNumber,
    column: newText.length + 1
  })
  editor.focus()  // ✅ 新增：让编辑器获得焦点
  return
```

## ✅ 修复效果

修复后，以下操作都会自动让编辑器获得焦点：

### 工具栏按钮
- ✅ H1-H6 标题
- ✅ 无序列表
- ✅ 有序列表
- ✅ 任务列表
- ✅ 引用

### 菜单栏
- ✅ 格式 → 标题 → H1-H6
- ✅ 格式 → 无序列表
- ✅ 格式 → 有序列表
- ✅ 格式 → 任务列表
- ✅ 格式 → 引用

### 其他模式
- ✅ `wrap` 模式（加粗、斜体、链接等）- 已有 `editor.focus()`
- ✅ `insert` 模式（插入内容）- 已有 `editor.focus()`

## 🎯 用户体验改进

**修复前**：
1. 点击格式化按钮
2. 格式应用成功
3. ❌ 需要手动点击编辑器才能继续输入

**修复后**：
1. 点击格式化按钮
2. 格式应用成功
3. ✅ 光标自动回到编辑器，可以立即继续输入

## 🚀 下一步

重新构建前端：

```bash
cd app/ui/frontend
npm run build
cd ../../..
bash build-fpk-filetree.sh
```

## 📝 相关问题

这个问题与之前的复制粘贴问题类似，都是因为操作后没有让编辑器获得焦点。

修复时间：2026-02-28

