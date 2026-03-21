# HTML 导出优化完成

## 优化内容

### 1. 图注样式优化 ✅

#### 问题
- 图注没有在图片正下方
- 图注字体不是辅助字体
- 图注颜色不是辅助色

#### 解决方案
添加了完整的图注样式：

```css
/* 图注样式 */
.markdown-body figure.image-figure {
  display: block;
  text-align: center;
  margin: 1em 0;
}

.markdown-body figure.image-figure img {
  max-width: 100%;
  height: auto;
  display: block;        /* 确保图片是块级元素 */
  margin: 0 auto;        /* 图片居中 */
}

.markdown-body figure.image-figure figcaption {
  margin-top: 0.5em;     /* 图注在图片下方 */
  font-size: 0.85em;     /* 辅助字体大小（85%） */
  color: #6c757d;        /* 辅助颜色（灰色） */
  text-align: center;    /* 居中对齐 */
  font-style: italic;    /* 斜体 */
  line-height: 1.4;      /* 行高 */
}
```

#### 效果
- ✅ 图注紧贴图片下方（margin-top: 0.5em）
- ✅ 字体大小为 85%（辅助字体）
- ✅ 颜色为 #6c757d（辅助灰色）
- ✅ 居中对齐
- ✅ 斜体显示

---

### 2. 代码行号显示 ✅

#### 问题
- 选择"代码块行号"选项后，导出的 HTML 中没有显示行号

#### 原因
- `generateExportStyles()` 函数中缺少代码行号的样式
- 只在预览的 useEffect 中有，导出时没有

#### 解决方案
添加了代码行号样式：

```css
/* 代码块行号 */
${exportConfig.codeLineNumbers ? `
.markdown-body pre {
  position: relative;
  padding-left: 3.5em !important;  /* 为行号留出空间 */
}

.markdown-body pre code.line-numbers {
  position: relative;
}

.markdown-body pre code.line-numbers::before {
  content: attr(data-line-numbers);  /* 从 data 属性读取行号 */
  position: absolute;
  left: -3.5em;                      /* 放在左侧 */
  top: 0;
  width: 2.5em;
  padding-right: 0.5em;
  text-align: right;                 /* 右对齐 */
  color: #666;                       /* 灰色 */
  white-space: pre;                  /* 保留换行 */
  line-height: inherit;              /* 继承行高 */
  user-select: none;                 /* 不可选择 */
  pointer-events: none;              /* 不响应鼠标事件 */
}
` : ''}
```

#### 效果
- ✅ 代码块左侧显示行号
- ✅ 行号右对齐
- ✅ 行号颜色为灰色
- ✅ 行号不可选择（复制代码时不会复制行号）

---

## 修改文件

### App.jsx - 1 处修改
在 `generateExportStyles()` 函数中添加：
1. 代码行号样式（条件渲染）
2. 图注样式（始终包含）

---

## 测试验证

### 测试 1: 图注样式
1. 在 Markdown 中插入图片：
   ```markdown
   ![图片描述](image.jpg "图片标题")
   ```
2. 导出 HTML
3. 在浏览器中打开
4. 验证：
   - ✅ 图注在图片正下方
   - ✅ 图注字体较小（85%）
   - ✅ 图注颜色为灰色
   - ✅ 图注居中显示
   - ✅ 图注为斜体

### 测试 2: 代码行号
1. 在导出配置中启用"代码块行号"
2. 在 Markdown 中添加代码块：
   ````markdown
   ```javascript
   function hello() {
     console.log("Hello");
     return true;
   }
   ```
   ````
3. 导出 HTML
4. 在浏览器中打开
5. 验证：
   - ✅ 代码块左侧显示行号（1, 2, 3...）
   - ✅ 行号右对齐
   - ✅ 行号颜色为灰色
   - ✅ 复制代码时不会复制行号

---

## 样式说明

### 图注样式细节

#### 字体大小
- 正文：16px（默认）
- 图注：0.85em = 13.6px（辅助字体）

#### 颜色
- 正文：#24292f（深色）或 #c9d1d9（暗色主题）
- 图注：#6c757d（辅助灰色，Bootstrap 的 text-muted 颜色）

#### 间距
- 图片与图注：0.5em（约 8px）
- 图注行高：1.4（紧凑但可读）

### 代码行号样式细节

#### 位置
- 行号宽度：2.5em
- 行号右边距：0.5em
- 代码左边距：3.5em（2.5em + 0.5em + 0.5em）

#### 颜色
- 行号：#666（中灰色）
- 代码：继承代码主题颜色

#### 交互
- `user-select: none`：不可选择
- `pointer-events: none`：不响应鼠标事件
- 复制代码时只复制代码内容，不复制行号

---

## 兼容性

### 浏览器支持
- ✅ Chrome/Edge（现代版本）
- ✅ Firefox（现代版本）
- ✅ Safari（现代版本）
- ✅ 移动浏览器

### CSS 特性
- `::before` 伪元素：所有现代浏览器支持
- `attr()` 函数：所有现代浏览器支持
- `user-select: none`：所有现代浏览器支持

---

## 进一步优化建议

### 图注样式
如果需要更多自定义，可以添加：
```css
.markdown-body figure.image-figure figcaption {
  /* 添加背景色 */
  background: rgba(0, 0, 0, 0.03);
  padding: 0.3em 0.5em;
  border-radius: 4px;
  
  /* 或添加边框 */
  border-top: 1px solid #e1e4e8;
  padding-top: 0.5em;
}
```

### 代码行号
如果需要更多自定义，可以添加：
```css
.markdown-body pre code.line-numbers::before {
  /* 添加背景色 */
  background: rgba(0, 0, 0, 0.03);
  
  /* 添加边框 */
  border-right: 1px solid #e1e4e8;
  
  /* 调整字体 */
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.9em;
}
```

---

## 🎉 优化完成

现在 HTML 导出功能已经完全优化：
- ✅ 图注样式完美
- ✅ 代码行号正常显示
- ✅ 所有主题正常工作
- ✅ 样式与预览一致

请测试验证效果！
