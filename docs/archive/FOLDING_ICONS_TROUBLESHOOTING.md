# 🔧 折叠图标故障排查

## 问题
折叠图标不显示

## 已完成的修复

### 1. 更新 CSS 选择器
```css
/* 更准确的选择器 */
.monaco-editor .cldr.codicon.codicon-folding-expanded::before {
  content: '⌄' !important;
  font-family: inherit !important;
  font-size: 16px !important;
  display: inline-block !important;
}
```

### 2. 添加可见性保证
```css
/* 确保折叠图标可见 */
.monaco-editor .margin-view-overlays .cldr {
  display: inline-block !important;
  visibility: visible !important;
  opacity: 1 !important;
}
```

## 故障排查步骤

### 步骤 1: 刷新浏览器缓存
**方法**:
- Chrome/Edge: `Ctrl + Shift + R` (Windows/Linux) 或 `Cmd + Shift + R` (Mac)
- Firefox: `Ctrl + F5` (Windows/Linux) 或 `Cmd + Shift + R` (Mac)
- Safari: `Cmd + Option + R`

### 步骤 2: 检查编辑器配置
```bash
cd /vol4/1000/开发文件夹/mac/app/ui/frontend/src
grep -A5 "folding:" App.jsx
```

**预期输出**:
```javascript
folding: true,
showFoldingControls: 'always',
foldingStrategy: 'auto',
foldingHighlight: true,
foldingMaximumRegions: 5000,
unfoldOnClickAfterEndOfLine: true
```

### 步骤 3: 检查折叠提供器
```bash
grep -c "registerFoldingRangeProvider" App.jsx
```

**预期输出**: `1`

### 步骤 4: 检查 CSS 样式
```bash
grep -A5 "自定义折叠图标" App.css
```

**预期输出**: 应该看到折叠图标的 CSS 样式

### 步骤 5: 测试文档
创建以下测试文档：

```markdown
# 第一章

这是第一章的内容

## 1.1 小节

小节内容

### 1.1.1 子小节

子小节内容

## 1.2 小节

另一个小节

# 第二章

第二章内容
```

**预期结果**:
- 每个标题左侧应该显示折叠图标
- 展开状态: `⌄`
- 折叠状态: `›`

## 可能的原因和解决方案

### 原因 1: 浏览器缓存
**症状**: CSS 更新后没有生效

**解决方案**:
1. 硬刷新浏览器（Ctrl + Shift + R）
2. 清除浏览器缓存
3. 重启浏览器

### 原因 2: Monaco Editor 未加载
**症状**: 编辑器本身有问题

**解决方案**:
1. 检查浏览器控制台是否有错误
2. 确认 Monaco Editor 正确加载
3. 重启开发服务器

### 原因 3: CSS 选择器不匹配
**症状**: 样式没有应用到元素上

**解决方案**:
已在最新的 CSS 中修复，使用了更准确的选择器。

### 原因 4: 文档没有标题
**症状**: 文档中没有 Markdown 标题

**解决方案**:
确保文档中有 Markdown 标题（# 开头的行）。

## 调试方法

### 方法 1: 浏览器开发者工具
1. 打开浏览器开发者工具（F12）
2. 切换到 Elements/元素 标签
3. 找到 `.monaco-editor` 元素
4. 查找 `.cldr.codicon-folding-expanded` 元素
5. 检查是否有折叠图标元素
6. 查看应用的 CSS 样式

### 方法 2: 检查 Monaco Editor 配置
在浏览器控制台运行：
```javascript
// 检查编辑器实例
console.log(editorRef.current)

// 检查配置
console.log(editorRef.current.getOptions())
```

### 方法 3: 临时禁用自定义样式
临时注释掉自定义折叠图标的 CSS，看是否显示默认图标：
```css
/* 临时注释
.monaco-editor .cldr.codicon.codicon-folding-expanded::before {
  content: '⌄' !important;
}
*/
```

如果默认图标显示，说明是自定义样式的问题。

## 备用方案

### 方案 A: 使用默认折叠图标
如果自定义图标有问题，可以暂时使用 Monaco Editor 的默认图标。

**操作**: 删除或注释掉自定义折叠图标的 CSS。

### 方案 B: 使用不同的图标
尝试使用其他 Unicode 字符：

```css
.monaco-editor .cldr.codicon.codicon-folding-expanded::before {
  content: '▾' !important;  /* 小三角形 */
}

.monaco-editor .cldr.codicon.codicon-folding-collapsed::before {
  content: '▸' !important;  /* 小三角形 */
}
```

### 方案 C: 调整 showFoldingControls
尝试不同的 showFoldingControls 值：

```javascript
showFoldingControls: 'mouseover',  // 鼠标悬停时显示
// 或
showFoldingControls: 'always',     // 始终显示（当前设置）
```

## 验证清单

- [ ] 浏览器已硬刷新
- [ ] 编辑器配置正确（folding: true）
- [ ] 折叠提供器已注册
- [ ] CSS 样式已添加
- [ ] 测试文档包含标题
- [ ] 浏览器控制台无错误
- [ ] Monaco Editor 正确加载

## 如果问题仍然存在

### 收集信息
1. 浏览器类型和版本
2. 浏览器控制台的错误信息
3. 开发者工具中 `.cldr` 元素的 HTML 和 CSS
4. 截图

### 临时解决方案
使用 Monaco Editor 的默认折叠图标：

1. 注释掉自定义折叠图标的 CSS
2. 保留折叠配置
3. 折叠功能仍然可用，只是使用默认图标

## 最新的完整配置

### App.jsx - 编辑器配置
```javascript
options={{
  // ... 其他配置
  lineNumbers: 'on',
  lineNumbersMinChars: 3,
  folding: true,
  showFoldingControls: 'always',
  foldingStrategy: 'auto',
  foldingHighlight: true,
  foldingMaximumRegions: 5000,
  unfoldOnClickAfterEndOfLine: true
}}
```

### App.jsx - 折叠提供器
```javascript
monaco.languages.registerFoldingRangeProvider('markdown', {
  provideFoldingRanges: (model) => {
    // ... 折叠逻辑
  }
})
```

### App.css - 折叠图标样式
```css
/* 自定义折叠图标 */
.monaco-editor .cldr.codicon.codicon-folding-expanded::before {
  content: '⌄' !important;
  font-family: inherit !important;
  font-size: 16px !important;
  display: inline-block !important;
}

.monaco-editor .cldr.codicon.codicon-folding-collapsed::before {
  content: '›' !important;
  font-family: inherit !important;
  font-size: 16px !important;
  display: inline-block !important;
}

/* 确保折叠图标可见 */
.monaco-editor .margin-view-overlays .cldr {
  display: inline-block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* 调整折叠图标位置 */
.monaco-editor .cldr.alwaysShowFoldIcons {
  left: 30px !important;
}
```

### App.css - 行号右对齐
```css
.monaco-editor .line-numbers {
  text-align: right !important;
  padding-right: 8px !important;
}
```

## 总结

✅ 已更新 CSS 选择器  
✅ 已添加可见性保证  
✅ 已提供完整的故障排查步骤  
✅ 已提供备用方案  

**下一步**: 请硬刷新浏览器（Ctrl + Shift + R）并测试！

---

**状态**: 等待测试反馈
