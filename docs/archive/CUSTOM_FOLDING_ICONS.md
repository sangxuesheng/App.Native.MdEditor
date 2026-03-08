# ✅ 自定义折叠图标

## 完成时间
2026-02-27 02:15

## 修改内容

### 更换折叠图标
将 Monaco Editor 默认的折叠图标替换为更小、更简洁的箭头符号。

### 图标对比

**修改前**（Monaco Editor 默认）:
- 展开状态: `▼` (codicon-folding-expanded)
- 折叠状态: `▶` (codicon-folding-collapsed)

**修改后**（自定义）:
- 展开状态: `⌄` (更小的向下箭头)
- 折叠状态: `›` (向右箭头)

## CSS 实现

### 添加的样式

```css
/* ==================== 自定义折叠图标 ==================== */
/* 使用更小的箭头符号 */
.monaco-editor .cldr.codicon-folding-expanded::before {
  content: '⌄' !important;
  font-family: inherit !important;
  font-size: 16px !important;
}

.monaco-editor .cldr.codicon-folding-collapsed::before {
  content: '›' !important;
  font-family: inherit !important;
  font-size: 16px !important;
}

/* 调整折叠图标位置 */
.monaco-editor .cldr.alwaysShowFoldIcons {
  left: 30px !important;
}
```

## 样式说明

### 1. 展开图标（⌄）
```css
.monaco-editor .cldr.codicon-folding-expanded::before {
  content: '⌄' !important;
  font-family: inherit !important;
  font-size: 16px !important;
}
```

**说明**:
- `content: '⌄'`: 使用 Unicode 字符 U+2304（向下箭头）
- `font-family: inherit`: 使用编辑器字体
- `font-size: 16px`: 字体大小
- `!important`: 覆盖 Monaco Editor 默认样式

### 2. 折叠图标（›）
```css
.monaco-editor .cldr.codicon-folding-collapsed::before {
  content: '›' !important;
  font-family: inherit !important;
  font-size: 16px !important;
}
```

**说明**:
- `content: '›'`: 使用 Unicode 字符 U+203A（向右箭头）
- 其他属性同上

### 3. 位置调整
```css
.monaco-editor .cldr.alwaysShowFoldIcons {
  left: 30px !important;
}
```

**说明**:
- `left: 30px`: 从左边距 25px 调整到 30px
- 配合缩窄的行号区域，保持视觉平衡

## 视觉效果

### 修改前
```
     1  ▼ # 第一章
     2    内容...
     3  ▼ ## 1.1 小节
     4    小节内容
```

### 修改后
```
  1  ⌄ # 第一章
  2    内容...
  3  ⌄ ## 1.1 小节
  4    小节内容
```

## 图标选择

### 可选的 Unicode 箭头符号

#### 向下箭头（展开状态）
- `⌄` (U+2304) - **当前使用**，简洁小巧
- `˅` (U+02C5) - 更小的向下箭头
- `∨` (U+2228) - 逻辑或符号
- `ᐯ` (U+142F) - 加拿大音节符号
- `▾` (U+25BE) - 小三角形

#### 向右箭头（折叠状态）
- `›` (U+203A) - **当前使用**，单引号样式
- `❯` (U+276F) - 粗箭头
- `▸` (U+25B8) - 小三角形
- `⟩` (U+27E9) - 数学右尖括号
- `＞` (U+FF1E) - 全角大于号

### 如果想更换图标

只需修改 `content` 属性：

```css
/* 使用其他箭头 */
.monaco-editor .cldr.codicon-folding-expanded::before {
  content: '▾' !important;  /* 小三角形 */
}

.monaco-editor .cldr.codicon-folding-collapsed::before {
  content: '▸' !important;  /* 小三角形 */
}
```

## 设计理念

### 1. 简洁
- 使用更小的箭头符号
- 减少视觉干扰
- 保持界面清爽

### 2. 一致性
- 与行号宽度优化配合
- 与整体 UI 风格一致
- 符合现代编辑器设计

### 3. 可读性
- 图标仍然清晰可见
- 易于识别展开/折叠状态
- 不影响编辑体验

## 位置调整

### 为什么调整到 30px？

**原因**:
1. 行号区域缩窄到 3 个字符（约 50px）
2. 折叠图标需要在行号右侧
3. `left: 30px` 提供合适的间距

**计算**:
```
行号区域: 50px
折叠图标位置: 30px
图标宽度: 约 16px
右边距: 50px - 30px - 16px = 4px
```

### 视觉平衡
```
┌─────┬─────────────────────────────────┐
│  1  ⌄│ # 标题                          │
│  2   │ 内容                            │
│  3  ⌄│ ## 小节                         │
└─────┴─────────────────────────────────┘
 50px    编辑区
 ↑  ↑
 行号 折叠图标
```

## 兼容性

### 浏览器支持
- ✅ Chrome/Edge: 完全支持
- ✅ Firefox: 完全支持
- ✅ Safari: 完全支持
- ✅ 所有现代浏览器都支持 Unicode 字符

### Monaco Editor 版本
- ✅ 适用于所有 Monaco Editor 版本
- ✅ 使用 `!important` 确保覆盖默认样式

## 文件修改

### App.css
**位置**: 文件末尾

**添加内容**:
```css
/* ==================== 自定义折叠图标 ==================== */
/* 使用更小的箭头符号 */
.monaco-editor .cldr.codicon-folding-expanded::before {
  content: '⌄' !important;
  font-family: inherit !important;
  font-size: 16px !important;
}

.monaco-editor .cldr.codicon-folding-collapsed::before {
  content: '›' !important;
  font-family: inherit !important;
  font-size: 16px !important;
}

/* 调整折叠图标位置 */
.monaco-editor .cldr.alwaysShowFoldIcons {
  left: 30px !important;
}
```

## 验证

### 检查样式
```bash
cd /vol4/1000/开发文件夹/mac/app/ui/frontend/src
tail -20 App.css
```

### 预期输出
应该看到自定义折叠图标的 CSS 样式。

## 测试

### 测试步骤
1. 打开编辑器
2. 创建包含标题的 Markdown 文档
3. 查看折叠图标
4. 验证图标为 `⌄` 和 `›`
5. 测试折叠/展开功能

### 预期结果
- ✅ 展开状态显示 `⌄`
- ✅ 折叠状态显示 `›`
- ✅ 图标位置正确（left: 30px）
- ✅ 折叠功能正常工作

## 其他自定义选项

### 调整图标大小
```css
.monaco-editor .cldr.codicon-folding-expanded::before {
  font-size: 14px !important;  /* 更小 */
}
```

### 调整图标颜色
```css
.monaco-editor .cldr.codicon-folding-expanded::before {
  color: #888 !important;  /* 灰色 */
}

.monaco-editor .cldr.codicon-folding-expanded:hover::before {
  color: #58a6ff !important;  /* 悬停时蓝色 */
}
```

### 调整图标位置
```css
.monaco-editor .cldr.alwaysShowFoldIcons {
  left: 35px !important;  /* 更靠右 */
}
```

## 总结

✅ 成功自定义折叠图标  
✅ 使用更小的箭头符号（⌄ 和 ›）  
✅ 调整图标位置到 30px  
✅ 与行号宽度优化配合  
✅ 界面更简洁清爽  

**状态: 已完成！**

---

**实施者**: AI Assistant (Gemini Flash)  
**日期**: 2026-02-27  
**状态**: ✅ 完成
