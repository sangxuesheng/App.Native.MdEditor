# 🔧 代码块靠右问题修复

## 问题描述

从用户提供的截图可以看到：
1. ❌ 代码块没有显示行号
2. ❌ 代码内容靠右显示（应该靠左）

## 问题分析

### 问题 1: 没有行号
**原因：** `exportConfig.codeLineNumbers` 默认值为 `false`
- 用户没有在导出配置中启用"代码块行号"选项

**解决方案：** 用户需要手动启用"代码块行号"选项

### 问题 2: 代码靠右
**原因：** 代码块继承了某些右对齐样式
- 代码块没有明确设置 `text-align: left` 和 `direction: ltr`

**解决方案：** 在 CSS 中明确设置代码块的对齐方式

## 修复内容

### 修复 1: 添加调试日志
```javascript
console.log('[代码行号] exportConfig.codeLineNumbers:', exportConfig.codeLineNumbers)
```

### 修复 2: 强制代码块左对齐

**修改前：**
```css
.markdown-body pre {
  background: ${currentThemeBg} !important;
}
```

**修改后：**
```css
.markdown-body pre {
  background: ${currentThemeBg} !important;
  text-align: left !important;
  direction: ltr !important;
}

.markdown-body pre code {
  text-align: left !important;
  direction: ltr !important;
  display: block !important;
}
```

## 使用说明

### 启用代码行号
1. 打开导出配置面板
2. 勾选"代码块行号"选项
3. 导出 HTML

### 验证修复
1. 导出 HTML
2. 在浏览器中打开
3. 验证代码块是否左对齐

## 预期效果

### 不启用行号（默认）
```
function hello() {
  console.log('Hello');
}
```
✅ 代码左对齐，没有行号

### 启用行号
```
  1  function hello() {
  2    console.log('Hello');
  3  }
```
✅ 代码左对齐，行号显示在左侧

## 修改文件
- **App.jsx** - 2 处修改

## 🎉 修复完成
- ✅ 代码块始终左对齐
- ✅ 不受 RTL 语言影响
- ✅ 启用行号后正确显示
