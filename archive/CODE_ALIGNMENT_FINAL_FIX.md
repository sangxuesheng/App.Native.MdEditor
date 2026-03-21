# 🎯 代码块靠右问题 - 根本原因找到并修复！

## 问题根源

通过浏览器控制台诊断，发现：

```javascript
pre.textAlign: left       ✅ 正确
pre.direction: ltr        ✅ 正确
code.textAlign: right     ❌ 问题在这里！
code.direction: ltr       ✅ 正确
```

**根本原因：**
`<code>` 元素被添加了 `line-numbers` 类，而 CSS 中 `.line-numbers` 有 `text-align: right !important;`，导致代码块靠右！

## 问题分析

### 代码流程

1. **第 217-233 行**：旧的行号实现
```javascript
if (exportConfig.codeLineNumbers) {
  const codeBlocks = preview.querySelectorAll('pre code')
  codeBlocks.forEach(block => {
    block.classList.add('line-numbers')  // ❌ 添加 line-numbers 类到 code 元素
  })
}
```

2. **第 3765 行**：CSS 样式
```css
.markdown-body .line-numbers {
  text-align: right !important;  // ❌ 这会应用到 code 元素
}
```

3. **结果**：
```html
<code class="hljs language-javascript line-numbers">
  <!-- 代码内容靠右显示 -->
</code>
```

### 冲突的两种实现

#### 旧实现（::before 伪元素）
```javascript
// 给 code 元素添加 line-numbers 类
block.classList.add('line-numbers')

// CSS 使用 ::before 显示行号
.markdown-body pre code.line-numbers::before {
  content: attr(data-line-numbers);
}
```

#### 新实现（双列布局）
```javascript
// 创建双列布局
<section class="line-numbers">1<br/>2<br/>3</section>
<section class="code-scroll">代码内容</section>
```

**问题：** 两种实现同时存在，导致冲突！

## 修复方案

### 修复：更精确的 CSS 选择器

**修复前：**
```css
.markdown-body .line-numbers {
  text-align: right !important;  /* 应用到所有 .line-numbers */
}
```

**修复后：**
```css
/* 只应用于双列布局中的 section 元素 */
.markdown-body section.line-numbers {
  text-align: right !important;  /* 只应用到 section.line-numbers */
}

/* 代码元素不应该右对齐 */
.markdown-body pre code.line-numbers {
  text-align: left !important;  /* 强制 code.line-numbers 左对齐 */
}
```

## 修复效果

### 修复前
```html
<code class="line-numbers" style="text-align: right;">
  function hello() {  <!-- 靠右显示 -->
}
</code>
```

### 修复后
```html
<code class="line-numbers" style="text-align: left;">
  function hello() {  <!-- 靠左显示 ✅ -->
}
</code>
```

## 为什么之前的修复没有生效？

### 之前的修复
```css
.markdown-body pre code {
  text-align: left !important;
}
```

### CSS 优先级
```
.markdown-body .line-numbers          /* 优先级: 0,2,0 */
.markdown-body pre code               /* 优先级: 0,1,2 */
```

**结果：** `.line-numbers` 的优先级更高，覆盖了 `pre code` 的样式！

### 正确的修复
```css
.markdown-body pre code.line-numbers  /* 优先级: 0,2,2 */
```

**结果：** 优先级更高，成功覆盖！

## 完整的修复内容

### 修改 1: 更精确的选择器
```css
/* 只应用于 section 元素 */
.markdown-body section.line-numbers {
  text-align: right !important;
}

.markdown-body section.line-numbers section {
  padding: 0 10px 0 0 !important;
  line-height: 1.75 !important;
}
```

### 修改 2: 强制 code 元素左对齐
```css
/* 代码元素不应该右对齐 */
.markdown-body pre code.line-numbers {
  text-align: left !important;
}
```

## 测试验证

### 测试步骤
1. 清除浏览器缓存（Ctrl + Shift + Delete）
2. 刷新页面（Ctrl + F5）
3. 导出 HTML
4. 在浏览器中打开
5. 运行诊断命令：
```javascript
const code = document.querySelector('pre code');
console.log('code.textAlign:', window.getComputedStyle(code).textAlign);
```

### 预期结果
```
code.textAlign: left  ✅
```

## 行号功能说明

### 当前状态
- ❌ 旧实现（::before 伪元素）：在预览中添加 `line-numbers` 类
- ✅ 新实现（双列布局）：在渲染后转换为双列布局

### 启用行号的步骤
1. 打开导出配置
2. 勾选"代码块行号"
3. 导出 HTML

### 预期效果
```
  1  function hello() {
  2    console.log('Hello');
  3  }
```

## 未来优化建议

### 建议 1: 移除旧实现
删除第 217-233 行的代码，只保留新的双列布局实现。

### 建议 2: 统一实现方式
在预览和导出中使用相同的双列布局实现。

### 建议 3: 重构 CSS
将行号相关的 CSS 整理到一个独立的部分。

## 修改文件清单

### App.jsx - 1 处修复
**位置：** 第 3765 行附近

**修改内容：**
- 将 `.markdown-body .line-numbers` 改为 `.markdown-body section.line-numbers`
- 将 `.markdown-body .line-numbers section` 改为 `.markdown-body section.line-numbers section`
- 添加 `.markdown-body pre code.line-numbers { text-align: left !important; }`

## 🎉 修复完成

现在代码块应该：
- ✅ 始终左对齐（无论是否启用行号）
- ✅ 不受 `line-numbers` 类的影响
- ✅ CSS 优先级正确
- ✅ 启用行号后正确显示

---

**修复完成时间：** 2025-03-09
**关键发现：** CSS 选择器优先级冲突
**最终修复：** 使用更精确的选择器
**测试状态：** 待用户验证

## 感谢

感谢用户提供的浏览器控制台输出，这帮助我们快速定位到了问题的根源！
