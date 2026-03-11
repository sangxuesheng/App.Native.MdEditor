# 🔧 代码块靠右问题 - 深度修复

## 问题现状

用户反馈：导出的 HTML 中代码块依旧靠右，且没有行号。

## 已完成的修复

### 修复 1: 基础对齐样式
```css
.markdown-body pre {
  text-align: left !important;
  direction: ltr !important;
  unicode-bidi: normal !important;
}
```

### 修复 2: 代码元素样式
```css
.markdown-body pre code {
  text-align: left !important;
  direction: ltr !important;
  display: block !important;
  unicode-bidi: normal !important;
}
```

### 修复 3: highlight.js 类样式
```css
.markdown-body .hljs {
  text-align: left !important;
  direction: ltr !important;
  display: block !important;
  unicode-bidi: normal !important;
}
```

### 修复 4: 内联元素样式
```css
.markdown-body pre code span,
.markdown-body .hljs span {
  direction: ltr !important;
  unicode-bidi: normal !important;
}
```

### 修复 5: 通配符强制样式
```css
.markdown-body pre *,
.markdown-body pre code *,
.markdown-body .hljs * {
  text-align: left !important;
  direction: ltr !important;
}
```

## 诊断步骤

### 步骤 1: 检查浏览器缓存
```bash
# 清除缓存
Ctrl + Shift + Delete

# 强制刷新
Ctrl + F5
```

### 步骤 2: 检查导出的 HTML
1. 导出 HTML 文件
2. 用文本编辑器打开
3. 搜索 `<style>` 标签
4. 确认是否包含以下样式：
```css
.markdown-body pre {
  text-align: left !important;
  direction: ltr !important;
}
```

### 步骤 3: 检查浏览器开发者工具
1. 在浏览器中打开导出的 HTML
2. 按 F12 打开开发者工具
3. 选择代码块元素
4. 查看 "Computed" 标签
5. 检查以下属性：
   - `text-align`: 应该是 `left`
   - `direction`: 应该是 `ltr`
   - `unicode-bidi`: 应该是 `normal`

### 步骤 4: 检查 CSS 优先级
在开发者工具的 "Styles" 标签中，查看是否有其他样式覆盖了我们的样式。

## 可能的原因

### 原因 1: 外部 CSS 覆盖
**问题：** `github-markdown-css` 或 `highlight.js` 的 CSS 有更高优先级

**解决方案：** 使用 `!important` 强制应用样式（已完成）

### 原因 2: 内联样式
**问题：** HTML 中有内联 `style` 属性覆盖了 CSS

**检查方法：**
```html
<!-- 查找是否有这样的代码 -->
<pre style="text-align: right;">
<code style="direction: rtl;">
```

**解决方案：** 需要在生成 HTML 时移除这些内联样式

### 原因 3: JavaScript 动态修改
**问题：** 某些 JavaScript 代码在页面加载后修改了样式

**检查方法：** 在开发者工具的 Console 中运行：
```javascript
const pre = document.querySelector('pre');
console.log(window.getComputedStyle(pre).textAlign);
console.log(window.getComputedStyle(pre).direction);
```

### 原因 4: 浏览器默认样式
**问题：** 某些浏览器对 RTL 语言有特殊处理

**解决方案：** 在 `<html>` 标签上明确设置 `dir="ltr"`

## 临时测试方案

### 方案 1: 手动修改导出的 HTML
1. 导出 HTML
2. 用文本编辑器打开
3. 在 `<html>` 标签中添加 `dir="ltr"`：
```html
<html lang="zh-CN" dir="ltr">
```
4. 在 `<style>` 标签中添加：
```css
* {
  direction: ltr !important;
  text-align: left !important;
}
```
5. 保存并在浏览器中打开

### 方案 2: 使用浏览器控制台测试
1. 在浏览器中打开导出的 HTML
2. 按 F12 打开控制台
3. 运行以下代码：
```javascript
document.querySelectorAll('pre, pre code, .hljs').forEach(el => {
  el.style.textAlign = 'left';
  el.style.direction = 'ltr';
  el.style.unicodeBidi = 'normal';
});
```
4. 查看代码块是否变为左对齐

## 行号问题

### 问题：没有显示行号
**原因：** `exportConfig.codeLineNumbers` 默认是 `false`

### 解决方案：
1. 打开应用
2. 点击右侧工具栏的"导出配置"按钮
3. 找到"代码块行号"选项
4. 勾选该选项
5. 重新导出 HTML

### 验证：
在控制台中应该看到：
```
[代码行号] exportConfig.codeLineNumbers: true
[代码行号] 开始处理代码块
[代码行号] 找到代码块数量: 3
```

## 完整的测试清单

- [ ] 清除浏览器缓存
- [ ] 重新导出 HTML
- [ ] 在浏览器中打开导出的 HTML
- [ ] 检查代码块是否左对齐
- [ ] 启用"代码块行号"选项
- [ ] 重新导出 HTML
- [ ] 检查是否显示行号
- [ ] 检查行号是否在左侧
- [ ] 检查代码是否左对齐
- [ ] 测试复制代码（不应包含行号）

## 如果问题依旧存在

### 请提供以下信息：

1. **导出的 HTML 文件**（前 100 行）
2. **浏览器控制台截图**
3. **开发者工具的 Computed 样式截图**
4. **以下命令的输出：**
```javascript
// 在浏览器控制台中运行
const pre = document.querySelector('pre');
const code = document.querySelector('pre code');
console.log('pre.textAlign:', window.getComputedStyle(pre).textAlign);
console.log('pre.direction:', window.getComputedStyle(pre).direction);
console.log('code.textAlign:', window.getComputedStyle(code).textAlign);
console.log('code.direction:', window.getComputedStyle(code).direction);
console.log('pre.innerHTML:', pre.innerHTML.substring(0, 200));
```

## 紧急修复方案

如果以上所有方法都不起作用，可以尝试这个**终极方案**：

### 在 HTML 的 `<head>` 中添加：
```html
<style>
  /* 终极修复 - 覆盖所有样式 */
  html, body {
    direction: ltr !important;
  }
  
  * {
    direction: ltr !important;
  }
  
  pre, pre *, code, code * {
    text-align: left !important;
    direction: ltr !important;
    unicode-bidi: normal !important;
  }
</style>
```

这个方案会强制所有元素使用 LTR 方向和左对齐。

---

**修复完成时间：** 2025-03-09
**修复级别：** 深度修复（5 层样式覆盖）
**测试状态：** 待用户验证
