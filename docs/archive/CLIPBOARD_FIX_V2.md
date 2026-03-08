# 剪贴板功能修复说明 v2

## 问题描述

### 第一次问题
在打包后的 fpk 环境中，菜单的复制和粘贴功能不可用，报错：
```
Error: command 'editor.action.clipboardPasteAction' not found
Error: command 'editor.action.clipboardCopyAction' not found
```

### 第二次问题（v1 修复后）
使用 `navigator.clipboard` API 后，在 fpk 环境中报错：
```
TypeError: Cannot read properties of undefined (reading 'writeText')
TypeError: Cannot read properties of undefined (reading 'readText')
```

原因：`navigator.clipboard` 在非 HTTPS 环境或某些受限的 WebView 环境中是 `undefined`。

## 根本原因
1. Monaco Editor 的内置命令在打包后不可用
2. `navigator.clipboard` API 在某些环境中不可用（非 HTTPS、WebView 等）

## 解决方案 v2
实现多层降级策略：
1. **首选**：使用现代 Clipboard API (`navigator.clipboard`)
2. **降级**：使用传统的 `document.execCommand('copy')`
3. **最终降级**：提示用户使用键盘快捷键

## 修改内容

### 文件：`app/ui/frontend/src/App.jsx`

#### 1. 修改 `handleMenuCopy` 函数
```javascript
const handleMenuCopy = async () => {
  if (editorRef.current) {
    editorRef.current.focus()
    const selection = editorRef.current.getSelection()
    const selectedText = editorRef.current.getModel().getValueInRange(selection)
    
    if (selectedText) {
      try {
        // 检查 Clipboard API 是否可用
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(selectedText)
          setStatus('已复制')
          setTimeout(() => setStatus('就绪'), 1000)
        } else {
          // 降级方案：使用传统的 document.execCommand
          const textarea = document.createElement('textarea')
          textarea.value = selectedText
          textarea.style.position = 'fixed'
          textarea.style.opacity = '0'
          document.body.appendChild(textarea)
          textarea.select()
          const success = document.execCommand('copy')
          document.body.removeChild(textarea)
          
          if (success) {
            setStatus('已复制')
            setTimeout(() => setStatus('就绪'), 1000)
          } else {
            setStatus('复制失败，请使用 Ctrl+C')
            setTimeout(() => setStatus('就绪'), 2000)
          }
        }
      } catch (err) {
        console.error('复制失败:', err)
        setStatus('复制失败，请使用 Ctrl+C')
        setTimeout(() => setStatus('就绪'), 2000)
      }
    }
  }
}
```

#### 2. 新增 `handleMenuCut` 函数
```javascript
const handleMenuCut = async () => {
  if (editorRef.current) {
    editorRef.current.focus()
    const selection = editorRef.current.getSelection()
    const selectedText = editorRef.current.getModel().getValueInRange(selection)
    
    if (selectedText) {
      try {
        // 检查 Clipboard API 是否可用
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(selectedText)
          editorRef.current.executeEdits('cut', [{
            range: selection,
            text: '',
            forceMoveMarkers: true
          }])
          setStatus('已剪切')
          setTimeout(() => setStatus('就绪'), 1000)
        } else {
          // 降级方案：使用传统的 document.execCommand
          const textarea = document.createElement('textarea')
          textarea.value = selectedText
          textarea.style.position = 'fixed'
          textarea.style.opacity = '0'
          document.body.appendChild(textarea)
          textarea.select()
          const success = document.execCommand('copy')
          document.body.removeChild(textarea)
          
          if (success) {
            editorRef.current.executeEdits('cut', [{
              range: selection,
              text: '',
              forceMoveMarkers: true
            }])
            setStatus('已剪切')
            setTimeout(() => setStatus('就绪'), 1000)
          } else {
            setStatus('剪切失败，请使用 Ctrl+X')
            setTimeout(() => setStatus('就绪'), 2000)
          }
        }
      } catch (err) {
        console.error('剪切失败:', err)
        setStatus('剪切失败，请使用 Ctrl+X')
        setTimeout(() => setStatus('就绪'), 2000)
      }
    }
  }
}
```

#### 3. 修改 `handleMenuPaste` 函数
```javascript
const handleMenuPaste = async () => {
  if (editorRef.current) {
    editorRef.current.focus()
    
    try {
      // 检查 Clipboard API 是否可用
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText()
        if (text) {
          const selection = editorRef.current.getSelection()
          editorRef.current.executeEdits('paste', [{
            range: selection,
            text: text,
            forceMoveMarkers: true
          }])
          setStatus('已粘贴')
          setTimeout(() => setStatus('就绪'), 1000)
        }
      } else {
        // 降级方案：提示用户使用快捷键
        setStatus('请使用 Ctrl+V 粘贴')
        setTimeout(() => setStatus('就绪'), 2000)
      }
    } catch (err) {
      console.error('粘贴失败:', err)
      setStatus('请使用 Ctrl+V 粘贴')
      setTimeout(() => setStatus('就绪'), 2000)
    }
  }
}
```

#### 4. 在 MenuBar 组件中添加 onCut 属性
在 MenuBar 组件调用处（约第 1004 行）添加：
```javascript
onCut={handleMenuCut}
```

## 降级策略说明

### 复制和剪切
1. **首选**：`navigator.clipboard.writeText()` - 现代异步 API
2. **降级**：`document.execCommand('copy')` - 传统同步 API，兼容性好
3. **最终降级**：提示用户使用 Ctrl+C / Ctrl+X

### 粘贴
1. **首选**：`navigator.clipboard.readText()` - 现代异步 API
2. **降级**：提示用户使用 Ctrl+V（因为 execCommand('paste') 通常被浏览器禁用）

## 兼容性

### navigator.clipboard
- ✅ 现代浏览器（HTTPS 环境）
- ❌ 非 HTTPS 环境
- ❌ 某些 WebView 环境

### document.execCommand
- ✅ 几乎所有浏览器
- ✅ HTTP/HTTPS 环境
- ✅ 大多数 WebView 环境
- ⚠️ 已被标记为废弃，但仍广泛支持

## 构建步骤
修改完成后，需要重新构建前端并打包：

```bash
# 1. 构建前端
cd app/ui/frontend
npm run build

# 2. 打包 fpk
cd ../../..
bash build-fpk-filetree.sh
```

## 优势
1. **多层降级**：确保在各种环境下都能工作
2. **用户友好**：提供清晰的状态提示
3. **兼容性强**：支持现代和传统浏览器
4. **错误处理完善**：每个步骤都有错误处理

## 注意事项
- 在 fpk 环境中，通常会使用 `document.execCommand` 降级方案
- 粘贴功能可能需要用户使用键盘快捷键（Ctrl+V）
- 备份文件保存在 `App.jsx.backup` 和 `App.jsx.old`

## 测试建议
1. 测试复制功能：选中文本后点击菜单的"复制"，检查状态栏提示
2. 测试剪切功能：选中文本后点击菜单的"剪切"，检查文本是否被删除
3. 测试粘贴功能：点击菜单的"粘贴"或使用 Ctrl+V
4. 测试快捷键：Ctrl+C、Ctrl+X、Ctrl+V
5. 在不同环境测试：开发环境、打包环境、HTTPS/HTTP

修复日期：2026-02-28
版本：v2 (添加降级方案)

