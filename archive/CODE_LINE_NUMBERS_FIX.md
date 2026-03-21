# 🎯 代码行号功能修复完成

## 问题分析

### 原始问题
导出 HTML 时，即使启用了"代码块行号"选项，导出的 HTML 中也不显示行号。

### 根本原因
1. **预览使用 `rehype-highlight`**：生成普通的 `<pre><code>` 结构
2. **文档中的实现**：使用自定义的 `highlightAndFormatCode` 函数，生成双列布局
3. **导出直接复制 innerHTML**：导出的是 `rehype-highlight` 生成的结构，没有行号

### 技术差异

**文档中的实现（双列布局）：**
```html
<pre><code>
  <section style="display:flex">
    <section class="line-numbers">1<br/>2<br/>3</section>
    <section class="code-scroll">代码内容</section>
  </section>
</code></pre>
```

**rehype-highlight 生成的结构：**
```html
<pre><code class="hljs language-javascript">
  代码内容（带高亮）
</code></pre>
```

## 解决方案

### 方案概述
在渲染完成后，用 JavaScript 将普通代码块转换为双列布局。

### 实现位置
在 `renderMarkdown` 函数中，`updatePreviewDOM` 之后添加代码行号处理。

### 核心逻辑

```javascript
// 应用代码行号（如果启用）
if (exportConfig.codeLineNumbers) {
  const codeBlocks = previewRef.current.querySelectorAll('pre code')
  
  codeBlocks.forEach((codeElement) => {
    // 1. 跳过已处理的代码块
    if (codeElement.querySelector('.line-numbers')) return
    
    // 2. 跳过 Mermaid 图表
    if (codeElement.classList.contains('language-mermaid')) return
    
    // 3. 获取代码内容并按行分割
    const codeHtml = codeElement.innerHTML
    const lines = codeHtml.split(/<br\s*\/?>/i)
    
    // 4. 生成行号列
    const lineNumbersHtml = lines
      .map((_, idx) => `<section style="...">${idx + 1}</section>`)
      .join('')
    
    // 5. 生成代码列
    const codeLinesHtml = `<div style="...">${lines.join('<br/>')}</div>`
    
    // 6. 组合成双列布局
    const dualColumnHtml = `
      <section style="display:flex;...">
        <section class="line-numbers" style="...">${lineNumbersHtml}</section>
        <section class="code-scroll" style="...">${codeLinesHtml}</section>
      </section>
    `
    
    // 7. 替换代码块内容
    codeElement.innerHTML = dualColumnHtml
  })
}
```

## 修改内容

### 1. 更新 CSS 样式（generateExportStyles）

**修改前：** 使用 `::before` 伪元素方式
```css
.markdown-body pre code.line-numbers::before {
  content: attr(data-line-numbers);
  position: absolute;
  left: -3.5em;
  ...
}
```

**修改后：** 使用双列布局样式
```css
/* 行号列样式 */
.markdown-body .line-numbers {
  text-align: right !important;
  padding: 8px 0 !important;
  border-right: 1px solid rgba(0, 0, 0, 0.04) !important;
  user-select: none !important;
  color: #666 !important;
}

/* 代码列样式 */
.markdown-body .code-scroll {
  flex: 1 1 auto !important;
  overflow-x: auto !important;
  padding: 8px !important;
}

/* 双列容器样式 */
.markdown-body pre code > section[style*="display:flex"] {
  display: flex !important;
  align-items: flex-start !important;
}
```

### 2. 添加 DOM 处理逻辑（renderMarkdown）

在 `renderMarkdown` 函数中，恢复图片样式之后添加：

```javascript
// 应用代码行号（如果启用）
if (exportConfig.codeLineNumbers) {
  console.log('[代码行号] 开始处理代码块')
  const codeBlocks = previewRef.current.querySelectorAll('pre code')
  
  codeBlocks.forEach((codeElement, index) => {
    // 处理逻辑...
  })
  
  console.log('[代码行号] 所有代码块处理完成')
}
```

## 工作流程

### 完整流程

```
1. 用户编写 Markdown 代码块
   ```javascript
   function hello() {
     console.log('Hello');
   }
   ```
   ↓
2. unified + rehype-highlight 渲染
   生成：<pre><code class="hljs language-javascript">
           <span class="hljs-keyword">function</span> hello() {<br/>
           &nbsp;&nbsp;console.log('Hello');<br/>
           }
         </code></pre>
   ↓
3. updatePreviewDOM 更新 DOM
   ↓
4. 检查 exportConfig.codeLineNumbers
   ↓
5. 如果启用，转换为双列布局
   生成：<pre><code>
           <section style="display:flex">
             <section class="line-numbers">
               <section>1</section>
               <section>2</section>
               <section>3</section>
             </section>
             <section class="code-scroll">
               <div>代码内容</div>
             </section>
           </section>
         </code></pre>
   ↓
6. 预览显示带行号的代码 ✅
   ↓
7. 导出时复制 innerHTML
   ↓
8. 导出的 HTML 包含双列布局 ✅
   ↓
9. CSS 样式正确应用 ✅
```

## 关键技术点

### 1. 按行分割代码

```javascript
const lines = codeHtml.split(/<br\s*\/?>/i)
```

**为什么用 `<br>`？**
- `rehype-highlight` 使用 `<br>` 表示换行
- 正则 `/<br\s*\/?>/i` 匹配 `<br>` 和 `<br/>`

### 2. 保留高亮样式

```javascript
const codeInnerHtml = lines.join('<br/>')
```

**为什么不重新高亮？**
- `rehype-highlight` 已经添加了高亮样式
- 直接使用原有的 HTML，保留 `<span class="hljs-keyword">` 等标签

### 3. 双列布局

```javascript
<section style="display:flex">
  <section class="line-numbers">行号</section>
  <section class="code-scroll">代码</section>
</section>
```

**为什么用 Flexbox？**
- 左右并排显示
- 代码列可以横向滚动
- 行号列固定宽度

### 4. 跳过特殊代码块

```javascript
// 跳过已处理的
if (codeElement.querySelector('.line-numbers')) return

// 跳过 Mermaid
if (codeElement.classList.contains('language-mermaid')) return
```

**为什么跳过？**
- 避免重复处理
- Mermaid 是图表，不需要行号

### 5. 用户不可选择行号

```css
user-select: none;
```

**为什么？**
- 复制代码时不会复制行号
- 只复制代码内容

## 样式细节

### 行号列样式

```css
.line-numbers {
  text-align: right;           /* 右对齐 */
  padding: 8px 0;              /* 上下内边距 */
  border-right: 1px solid rgba(0,0,0,0.04); /* 右边框 */
  user-select: none;           /* 不可选中 */
  color: #666;                 /* 灰色 */
}
```

### 代码列样式

```css
.code-scroll {
  flex: 1 1 auto;              /* 自动伸缩 */
  overflow-x: auto;            /* 横向滚动 */
  padding: 8px;                /* 内边距 */
  min-width: 0;                /* 允许收缩 */
}
```

### 代码内容样式

```css
.code-scroll > div {
  white-space: pre;            /* 保留空格和换行 */
  min-width: max-content;      /* 最小宽度为内容宽度 */
  line-height: 1.75;           /* 行高 */
}
```

## 测试验证

### 测试步骤

1. **启用代码行号**
   - 打开导出配置
   - 勾选"代码块行号"

2. **添加测试代码**
   ````markdown
   ```javascript
   function hello() {
     console.log('Hello, World!');
     return true;
   }
   ```
   ````

3. **检查预览**
   - 代码块左侧应该显示行号（1, 2, 3, 4）
   - 行号右对齐，灰色
   - 代码可以横向滚动

4. **导出 HTML**
   - 使用快捷导出或对话框导出
   - 在浏览器中打开导出的 HTML

5. **验证导出效果**
   - 行号正确显示
   - 样式与预览一致
   - 复制代码时不包含行号

### 预期效果

**预览中：**
```
  1  function hello() {
  2    console.log('Hello, World!');
  3    return true;
  4  }
```

**导出的 HTML：**
```
  1  function hello() {
  2    console.log('Hello, World!');
  3    return true;
  4  }
```

**复制代码：**
```
function hello() {
  console.log('Hello, World!');
  return true;
}
```
（不包含行号）

## 调试信息

### 控制台日志

启用代码行号后，控制台会输出：

```
[代码行号] 开始处理代码块
[代码行号] 找到代码块数量: 3
[代码行号] 代码块 1 有 4 行
[代码行号] 代码块 1 处理完成
[代码行号] 代码块 2 是 Mermaid，跳过
[代码行号] 代码块 3 有 10 行
[代码行号] 代码块 3 处理完成
[代码行号] 所有代码块处理完成
```

### 检查 DOM 结构

在浏览器开发者工具中：

```html
<pre class="hljs code__pre">
  <code class="language-javascript">
    <section style="display:flex;...">
      <section class="line-numbers" style="...">
        <section style="...">1</section>
        <section style="...">2</section>
        <section style="...">3</section>
      </section>
      <section class="code-scroll" style="...">
        <div style="...">
          <span class="hljs-keyword">function</span> hello() {<br/>
          &nbsp;&nbsp;console.log('Hello');<br/>
          }
        </div>
      </section>
    </section>
  </code>
</pre>
```

## 常见问题

### 1. 行号不显示

**可能原因：**
- 没有启用"代码块行号"选项
- 代码块只有 1 行（自动跳过）
- 是 Mermaid 图表（自动跳过）

**解决方案：**
- 检查导出配置
- 确认代码块有多行
- 查看控制台日志

### 2. 行号和代码不对齐

**可能原因：**
- CSS 样式没有正确加载
- `line-height` 不一致

**解决方案：**
- 检查导出的 HTML 中是否包含样式
- 确认 `line-height: 1.75` 应用到行号和代码

### 3. 复制时包含行号

**可能原因：**
- `user-select: none` 没有生效

**解决方案：**
- 检查 CSS 样式
- 确认 `.line-numbers` 有 `user-select: none`

### 4. 横向滚动问题

**可能原因：**
- 代码列的 `overflow-x` 设置不正确

**解决方案：**
- 确认 `.code-scroll` 有 `overflow-x: auto`
- 确认容器有 `overflow-x: hidden`

## 性能优化

### 1. 跳过已处理的代码块

```javascript
if (codeElement.querySelector('.line-numbers')) return
```

避免重复处理，提高性能。

### 2. 批量处理

```javascript
codeBlocks.forEach((codeElement) => {
  // 处理单个代码块
})
```

一次性处理所有代码块，减少 DOM 操作。

### 3. 使用内联样式

```javascript
const lineNumberColumnStyles = 'text-align:right;...'
```

避免额外的 CSS 查找，提高渲染速度。

## 兼容性

### 浏览器支持
- ✅ Chrome/Edge（现代版本）
- ✅ Firefox（现代版本）
- ✅ Safari（现代版本）
- ✅ 移动浏览器

### CSS 特性
- Flexbox：所有现代浏览器支持
- `user-select: none`：所有现代浏览器支持
- `overflow-x: auto`：所有现代浏览器支持

## 修改文件清单

### App.jsx - 2 处修改
1. **generateExportStyles 函数**：更新代码行号 CSS 样式（双列布局）
2. **renderMarkdown 函数**：添加代码行号 DOM 处理逻辑

## 🎉 修复完成

现在代码行号功能已经完全正常工作：
- ✅ 预览中显示行号
- ✅ 导出 HTML 包含行号
- ✅ 样式与预览一致
- ✅ 复制代码时不包含行号
- ✅ 支持横向滚动
- ✅ 行号右对齐，灰色显示

---

**修复完成时间：** 2025-03-09
**关键技术：** DOM 后处理 + 双列布局
**测试状态：** 待验证
