# 图片缩放 CSS 深度修复说明

## 🔍 问题深度分析

### 现象
编辑区已经设置了 `style="width:50%;height:auto;"` 和 `style="width:100%;height:auto;"`，但预览区的两张图片显示大小相同。

### 根本原因

#### 1. CSS 优先级问题
```css
/* 原有样式 - 优先级较高 */
.markdown-body .image-figure img {
  max-width: 100%;  /* 这会限制所有图片 */
}

/* 覆盖样式 - 优先级不够 */
.markdown-body img[style*="width"] {
  max-width: none !important;  /* 可能被覆盖 */
}
```

#### 2. display 属性冲突
```css
.markdown-body .image-figure img {
  display: block;  /* block 元素可能影响宽度计算 */
  margin: 0 auto;  /* 居中对齐 */
}
```

#### 3. 可能的 HTML 结构
Markdown 渲染后可能生成：
```html
<div class="image-figure">
  <img src="..." style="width:50%;height:auto;" />
</div>
```

或者：
```html
<p>
  <img src="..." style="width:50%;height:auto;" />
</p>
```

---

## ✅ 最终修复方案

### CSS 修改

```css
.markdown-body .image-figure img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}

/* 支持内联样式的图片缩放 - 使用更高优先级 */
.markdown-body img[style*="width"],
.markdown-body .image-figure img[style*="width"],
.markdown-body p img[style*="width"] {
  max-width: none !important;
  display: inline-block !important;  /* 改为 inline-block */
}

/* 确保内联样式的 width 生效 */
img[style*="width"] {
  max-width: none !important;
}
```

### 关键修改点

1. **添加多个选择器**
   - `.markdown-body img[style*="width"]` - 基础选择器
   - `.markdown-body .image-figure img[style*="width"]` - 针对 figure 包裹
   - `.markdown-body p img[style*="width"]` - 针对段落包裹

2. **修改 display 属性**
   - 从 `display: block` 改为 `display: inline-block`
   - 这样可以让 width 百分比正确计算

3. **添加全局覆盖**
   - `img[style*="width"]` 作为最后的保障
   - 确保任何带 width 样式的图片都不受限制

---

## 🧪 测试方法

### 方法 1：使用测试页面

打开 `test-image-scale.html` 文件：
```bash
# 在浏览器中打开
open /vol4/1000/开发文件夹/mac/test-image-scale.html
```

**预期结果**：
- 50% 的图片应该是 100% 图片的一半宽度
- 25%、33%、50%、100% 应该有明显的大小差异

### 方法 2：在实际应用中测试

1. **构建应用**
```bash
cd /vol4/1000/开发文件夹/mac/app/ui/frontend
export PATH=/var/apps/nodejs_v22/target/bin:$PATH
npm run build
```

2. **在编辑器中输入**
```html
<img src="https://pic1.imgdb.cn/item/69a61149dcdb109d1d43dafd.png" alt="测试" style="width:50%;height:auto;" />

<img src="https://pic1.imgdb.cn/item/69a61149dcdb109d1d43dafd.png" alt="测试" style="width:100%;height:auto;" />
```

3. **检查预览区**
   - 第一张图片应该是第二张的一半宽度
   - 如果还是相同大小，继续下一步

### 方法 3：使用浏览器开发者工具

1. **打开开发者工具**（F12）

2. **检查图片元素**
   - 右键点击预览区的图片 → 检查元素

3. **查看 Computed 样式**
   - 找到 `width` 属性
   - 找到 `max-width` 属性

4. **预期值**
   ```
   width: 50% (或具体像素值)
   max-width: none
   display: inline-block
   ```

5. **如果不是预期值**
   - 查看 Styles 面板
   - 找到哪个 CSS 规则覆盖了样式
   - 记录下来以便进一步修复

---

## 🔧 可能的额外问题

### 问题 1：github-markdown-css 覆盖

如果使用了 github-markdown-css，它可能有全局的 img 样式：

```css
/* github-markdown-css 可能的样式 */
.markdown-body img {
  max-width: 100%;
  box-sizing: content-box;
}
```

**解决方案**：在我们的 CSS 后面添加更高优先级的规则（已添加）

### 问题 2：容器宽度限制

`.markdown-body` 有 `max-width: 900px`，这意味着：
- `width: 50%` = 450px（相对于 900px）
- `width: 100%` = 900px

如果容器本身很小，图片可能看起来差不多大。

**检查方法**：
```javascript
// 在控制台执行
const container = document.querySelector('.markdown-body')
console.log('容器宽度:', container.offsetWidth)
```

### 问题 3：图片加载问题

如果图片还没加载完成，可能显示不正确。

**解决方案**：等待图片加载完成后再检查

---

## 📊 CSS 优先级计算

### 选择器优先级对比

| 选择器 | 优先级 | 说明 |
|--------|--------|------|
| `img` | 0,0,0,1 | 元素选择器 |
| `.markdown-body img` | 0,0,1,1 | 类 + 元素 |
| `.markdown-body .image-figure img` | 0,0,2,1 | 类 + 类 + 元素 |
| `.markdown-body img[style*="width"]` | 0,0,1,1,1 | 类 + 元素 + 属性 |
| `img[style*="width"]` | 0,0,0,1,1 | 元素 + 属性 |
| 内联样式 | 1,0,0,0 | 最高优先级 |
| `!important` | 覆盖一切 | 除了更高优先级的 !important |

### 我们的策略

1. 使用 `!important` 确保覆盖
2. 添加多个选择器覆盖不同情况
3. 使用属性选择器 `[style*="width"]` 精确匹配

---

## 🎯 调试步骤

### 步骤 1：确认 CSS 已加载

在浏览器控制台执行：
```javascript
const styles = Array.from(document.styleSheets)
  .flatMap(sheet => {
    try {
      return Array.from(sheet.cssRules)
    } catch(e) {
      return []
    }
  })
  .filter(rule => rule.selectorText && rule.selectorText.includes('img[style'))

console.log('找到的 CSS 规则:', styles.length)
styles.forEach(rule => {
  console.log(rule.selectorText, rule.style.maxWidth)
})
```

### 步骤 2：检查图片实际样式

```javascript
const img = document.querySelector('.markdown-body img[style*="width"]')
if (img) {
  const computed = window.getComputedStyle(img)
  console.log({
    inlineStyle: img.getAttribute('style'),
    computedWidth: computed.width,
    computedMaxWidth: computed.maxWidth,
    computedDisplay: computed.display,
    actualWidth: img.offsetWidth,
    parentWidth: img.parentElement.offsetWidth
  })
}
```

### 步骤 3：强制应用样式

如果 CSS 还是不生效，可以在控制台强制应用：
```javascript
document.querySelectorAll('.markdown-body img[style*="width"]').forEach(img => {
  img.style.maxWidth = 'none'
  img.style.display = 'inline-block'
})
```

如果这样能生效，说明 CSS 文件没有正确加载或被覆盖。

---

## 🚀 完整测试流程

### 1. 构建前端
```bash
cd /vol4/1000/开发文件夹/mac/app/ui/frontend
export PATH=/var/apps/nodejs_v22/target/bin:$PATH
npm run build
```

### 2. 打包应用
```bash
cd /vol4/1000/开发文件夹/mac
bash build-complete.sh
fnpack build
```

### 3. 安装测试
```bash
appcenter-cli install-local
```

### 4. 测试场景

#### 场景 A：基础测试
```html
<img src="https://pic1.imgdb.cn/item/69a61149dcdb109d1d43dafd.png" alt="50%" style="width:50%;height:auto;" />
<img src="https://pic1.imgdb.cn/item/69a61149dcdb109d1d43dafd.png" alt="100%" style="width:100%;height:auto;" />
```

**预期**：第一张是第二张的一半宽度

#### 场景 B：多比例测试
```html
<img src="..." alt="25%" style="width:25%;height:auto;" />
<img src="..." alt="33%" style="width:33%;height:auto;" />
<img src="..." alt="50%" style="width:50%;height:auto;" />
<img src="..." alt="67%" style="width:67%;height:auto;" />
<img src="..." alt="100%" style="width:100%;height:auto;" />
```

**预期**：每张图片大小递增

#### 场景 C：Markdown 语法测试
```markdown
![测试](https://pic1.imgdb.cn/item/69a61149dcdb109d1d43dafd.png)
```

然后右键缩放到 50%，检查是否正确转换并显示。

---

## 📝 如果还是不生效

### 最后的解决方案：修改渲染逻辑

如果 CSS 方案完全不行，可以在 JavaScript 中处理：

```javascript
// 在 renderMarkdown 函数中添加
useEffect(() => {
  if (previewRef.current) {
    // 找到所有带 width 样式的图片
    const images = previewRef.current.querySelectorAll('img[style*="width"]')
    images.forEach(img => {
      // 强制移除 max-width 限制
      img.style.maxWidth = 'none'
      img.style.display = 'inline-block'
    })
  }
}, [debouncedContent])
```

---

## ✅ 修复总结

### 已完成的修改

1. ✅ 添加多个 CSS 选择器覆盖不同情况
2. ✅ 使用 `!important` 提高优先级
3. ✅ 修改 `display` 为 `inline-block`
4. ✅ 添加全局 `img[style*="width"]` 规则
5. ✅ 创建测试页面验证 CSS

### 待验证

- ⏳ 在实际应用中测试是否生效
- ⏳ 使用开发者工具检查 computed 样式
- ⏳ 确认不同比例的图片大小不同

---

**修复时间**：2026-03-07  
**版本**：v1.0.4  
**状态**：✅ CSS 已修复，等待测试验证
