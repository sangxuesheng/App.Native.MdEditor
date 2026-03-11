# 导出问题诊断

## 问题描述
构建后的 fpk 包中，导出图片、表格和图表有问题，但开发模式正常。

## 可能的原因

### 1. previewRef 引用问题
在 `convertToWechatFormat` 函数（第 2593 行）中：
```javascript
const previewMathElements = previewRef.current.querySelectorAll('.katex, .katex-display')
```

**问题**：如果 `previewRef.current` 为 null，会导致错误。

### 2. 外部资源加载问题
- KaTeX CSS: `katex/dist/katex.min.css`
- Highlight.js CSS: CDN 链接
- MathJax: CDN 链接
- Mermaid: window.mermaid

这些资源在构建后可能路径不正确。

### 3. 构建配置问题
检查 vite.config.js 中的资源处理配置。

## 诊断步骤

1. 打开浏览器开发者工具（F12）
2. 尝试导出功能
3. 查看 Console 标签页的错误信息
4. 查看 Network 标签页，检查是否有资源加载失败

## 需要检查的关键点

1. **Console 错误**：
   - 是否有 "Cannot read property 'querySelectorAll' of null" 错误？
   - 是否有 CSS 或 JS 资源加载失败？

2. **Network 请求**：
   - katex.min.css 是否加载成功？
   - highlight.js CSS 是否加载成功？
   - MathJax 是否加载成功？

3. **导出的 HTML 内容**：
   - 表格是否有正确的 HTML 结构？
   - 图片是否有正确的 src 属性？
   - Mermaid 图表是否已渲染为 SVG？

## 临时解决方案

在 convertToWechatFormat 函数开头添加检查：
```javascript
if (!previewRef.current) {
  console.error('[微信导出] previewRef.current 不存在')
  return html // 返回原始 HTML
}
```

## 下一步
请提供浏览器控制台的错误信息，我可以更准确地定位问题。
