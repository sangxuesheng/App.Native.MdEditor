# 🔍 预览区空白问题调试

## 问题描述
隐藏文件树后，预览区显示空白

## 可能的原因

### 1. ResizablePanel 尺寸计算问题
当 defaultSizes 为 [null, null] 时，可能导致尺寸计算错误

### 2. CSS 样式问题
preview-pane 可能没有正确的高度/宽度

### 3. 内容渲染问题
markdown-body 可能没有内容或被隐藏

## 调试步骤

### 步骤 1: 检查浏览器控制台
打开 F12 开发者工具，查看：
- Console 标签：是否有 JavaScript 错误
- Elements 标签：检查 preview-pane 的实际尺寸
- 查看 markdown-body 是否有内容

### 步骤 2: 检查元素尺寸
在浏览器控制台运行：
```javascript
document.querySelector('.preview-pane')?.getBoundingClientRect()
document.querySelector('.markdown-body')?.getBoundingClientRect()
```

### 步骤 3: 检查内容
```javascript
document.querySelector('.markdown-body')?.innerHTML
```

### 步骤 4: 检查 ResizablePanel
```javascript
document.querySelectorAll('.resizable-panel-item').forEach((el, i) => {
  console.log(`Panel ${i}:`, el.getBoundingClientRect())
})
```
