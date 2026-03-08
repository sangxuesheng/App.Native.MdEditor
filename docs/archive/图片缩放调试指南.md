# 图片缩放问题深度调试指南

## 🔍 调试步骤

### 步骤 1：检查控制台日志

打开应用后，按 F12 打开开发者工具，查看控制台输出：

**预期日志**：
```
开始加载 github-markdown-css: https://cdn.jsdelivr.net/npm/github-markdown-css@5/...
github-markdown-css 加载完成，注入覆盖样式
覆盖样式已注入: /* 覆盖 github-markdown-css 的图片样式 */...
验证注入的样式: 存在
样式内容: /* 覆盖 github-markdown-css 的图片样式 */...
```

**如果没有看到这些日志**：
- 说明 useEffect 没有执行
- 或者 github-markdown-css 加载失败

---

### 步骤 2：检查 DOM 中的样式

在控制台执行：

```javascript
// 检查是否有覆盖样式
const override = document.querySelector('style[data-image-scale-override]')
console.log('覆盖样式:', override)
if (override) {
  console.log('样式内容:', override.textContent)
}

// 检查所有样式表
const allStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
console.log('所有样式表:', allStyles.map(s => ({
  tag: s.tagName,
  href: s.href || 'inline',
  attr: s.getAttribute('data-image-scale-override') || s.getAttribute('data-github-markdown')
})))
```

**预期结果**：
- 应该找到 `style[data-image-scale-override]`
- 内容包含 `max-width: none !important`

---

### 步骤 3：检查图片的实际样式

在控制台执行：

```javascript
// 找到一个带 width 样式的图片
const img = document.querySelector('.markdown-body img[style*="width"]')
if (img) {
  const computed = window.getComputedStyle(img)
  console.log('图片信息:', {
    src: img.src,
    inlineStyle: img.getAttribute('style'),
    computedWidth: computed.width,
    computedMaxWidth: computed.maxWidth,
    computedDisplay: computed.display,
    actualWidth: img.offsetWidth,
    parentWidth: img.parentElement.offsetWidth
  })
  
  // 检查哪个 CSS 规则在生效
  console.log('max-width 来源:', computed.getPropertyValue('max-width'))
} else {
  console.log('没有找到带 width 样式的图片')
}
```

**预期结果**：
- `computedMaxWidth`: `"none"`
- `computedDisplay`: `"inline-block"`

**如果不是预期值**：
- 说明覆盖样式没有生效
- 需要检查 CSS 选择器是否匹配

---

### 步骤 4：手动测试覆盖样式

在控制台执行：

```javascript
// 手动注入样式
const testStyle = document.createElement('style')
testStyle.textContent = `
  .markdown-body img[style*="width"] {
    max-width: none !important;
    display: inline-block !important;
    border: 3px solid red !important;  /* 红色边框用于测试 */
  }
`
document.head.appendChild(testStyle)
console.log('测试样式已注入，图片应该有红色边框')
```

**如果图片出现红色边框**：
- 说明选择器是正确的
- 问题可能在于动态注入的时机

**如果图片没有红色边框**：
- 说明选择器不匹配
- 需要检查 HTML 结构

---

### 步骤 5：检查 HTML 结构

在控制台执行：

```javascript
// 检查图片的 HTML 结构
const img = document.querySelector('.markdown-body img[style*="width"]')
if (img) {
  console.log('图片 HTML:', img.outerHTML)
  console.log('父元素:', img.parentElement.outerHTML)
  console.log('祖父元素:', img.parentElement.parentElement?.outerHTML)
  
  // 检查是否在 markdown-body 中
  console.log('在 markdown-body 中:', img.closest('.markdown-body') !== null)
}
```

**预期结构**：
```html
<div class="markdown-body">
  <p>
    <img src="..." alt="..." style="width:50%;height:auto;" />
  </p>
</div>
```

或者：
```html
<div class="markdown-body">
  <div class="image-figure">
    <img src="..." alt="..." style="width:50%;height:auto;" />
  </div>
</div>
```

---

### 步骤 6：检查 CSS 优先级

在控制台执行：

```javascript
// 获取所有影响图片的 CSS 规则
const img = document.querySelector('.markdown-body img[style*="width"]')
if (img) {
  const rules = []
  
  // 遍历所有样式表
  Array.from(document.styleSheets).forEach(sheet => {
    try {
      Array.from(sheet.cssRules || []).forEach(rule => {
        if (rule.selectorText && rule.selectorText.includes('img')) {
          // 检查规则是否匹配图片
          if (img.matches(rule.selectorText)) {
            rules.push({
              selector: rule.selectorText,
              maxWidth: rule.style.maxWidth,
              display: rule.style.display,
              important: rule.style.cssText.includes('!important'),
              source: sheet.href || 'inline'
            })
          }
        }
      })
    } catch (e) {
      // 跨域样式表无法访问
    }
  })
  
  console.log('匹配的 CSS 规则:', rules)
}
```

---

## 🛠️ 可能的问题和解决方案

### 问题 1：覆盖样式没有注入

**症状**：控制台没有看到 "覆盖样式已注入" 日志

**原因**：
- github-markdown-css 加载失败
- onload 回调没有触发

**解决方案**：
```javascript
// 添加超时机制
link.onload = () => { /* 注入样式 */ }
link.onerror = () => { console.error('加载失败') }

// 添加超时保护
setTimeout(() => {
  if (!document.querySelector('style[data-image-scale-override]')) {
    console.warn('超时，强制注入样式')
    // 强制注入
  }
}, 3000)
```

---

### 问题 2：选择器不匹配

**症状**：样式已注入，但图片没有变化

**原因**：
- HTML 结构与选择器不匹配
- 图片不在 `.markdown-body` 中

**解决方案**：
```javascript
// 使用更通用的选择器
img[style*="width"] {
  max-width: none !important;
}

// 或者使用属性选择器
[style*="width:"][style*="height:"] {
  max-width: none !important;
}
```

---

### 问题 3：CSS 优先级不够

**症状**：样式已注入，选择器匹配，但仍被覆盖

**原因**：
- github-markdown-css 有更高优先级的规则
- 内联样式被其他规则覆盖

**解决方案**：
```javascript
// 使用更高优先级的选择器
.markdown-body.markdown-body img[style*="width"] {
  max-width: none !important;
}

// 或者使用 :where() 降低其他规则的优先级
```

---

### 问题 4：图片在加载前就渲染了

**症状**：刷新页面后图片正常，但首次加载不正常

**原因**：
- 图片渲染时，覆盖样式还没注入
- 需要在渲染后重新应用样式

**解决方案**：
```javascript
// 在 renderMarkdown 后强制刷新样式
useEffect(() => {
  if (previewRef.current) {
    const images = previewRef.current.querySelectorAll('img[style*="width"]')
    images.forEach(img => {
      // 强制重新计算样式
      img.style.maxWidth = 'none'
      img.style.display = 'inline-block'
    })
  }
}, [debouncedContent])
```

---

## 🎯 终极解决方案

如果以上方法都不行，使用 JavaScript 强制设置：

```javascript
// 在 App.jsx 中添加
useEffect(() => {
  const applyImageStyles = () => {
    if (!previewRef.current) return
    
    const images = previewRef.current.querySelectorAll('img[style*="width"]')
    console.log('找到图片:', images.length)
    
    images.forEach((img, index) => {
      // 强制设置样式
      img.style.maxWidth = 'none'
      img.style.display = 'inline-block'
      
      console.log(`图片 ${index + 1}:`, {
        width: img.style.width,
        maxWidth: img.style.maxWidth,
        computedWidth: window.getComputedStyle(img).width
      })
    })
  }
  
  // 在内容变化后应用
  applyImageStyles()
  
  // 也在图片加载完成后应用
  const images = previewRef.current?.querySelectorAll('img') || []
  images.forEach(img => {
    img.addEventListener('load', applyImageStyles)
  })
  
  return () => {
    images.forEach(img => {
      img.removeEventListener('load', applyImageStyles)
    })
  }
}, [debouncedContent])
```

---

## 📝 测试清单

运行应用后，依次检查：

- [ ] 控制台有 "开始加载 github-markdown-css" 日志
- [ ] 控制台有 "github-markdown-css 加载完成" 日志
- [ ] 控制台有 "覆盖样式已注入" 日志
- [ ] 控制台有 "验证注入的样式: 存在" 日志
- [ ] DOM 中存在 `style[data-image-scale-override]`
- [ ] 图片的 computed max-width 为 none
- [ ] 图片的 computed display 为 inline-block
- [ ] 50% 的图片明显小于 100% 的图片

---

## 🚀 快速测试命令

在浏览器控制台依次执行：

```javascript
// 1. 检查覆盖样式
console.log('覆盖样式:', document.querySelector('style[data-image-scale-override]'))

// 2. 检查图片
const img = document.querySelector('.markdown-body img[style*="width"]')
console.log('图片:', img)
console.log('computed max-width:', window.getComputedStyle(img).maxWidth)

// 3. 手动强制设置
document.querySelectorAll('.markdown-body img[style*="width"]').forEach(img => {
  img.style.maxWidth = 'none'
  img.style.display = 'inline-block'
})
console.log('已强制设置，检查图片是否变化')
```

---

**创建时间**：2026-03-07  
**版本**：v1.0.6  
**状态**：调试版本，包含详细日志
