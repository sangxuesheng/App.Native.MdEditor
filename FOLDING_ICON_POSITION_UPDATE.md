# ✅ 折叠图标位置调整

## 完成时间
2026-02-27 02:18

## 修改内容

### 调整折叠图标位置
将折叠图标向左移动，使其更靠近行号。

### 位置对比

**修改前**:
```css
.monaco-editor .cldr.alwaysShowFoldIcons {
  left: 30px !important;
}
```

**修改后**:
```css
.monaco-editor .cldr.alwaysShowFoldIcons {
  left: 25px !important;
}
```

## 视觉效果

### 修改前（left: 30px）
```
┌─────┬─────────────────────────────────┐
│  1    ⌄│ # 标题                        │
│  2     │ 内容                          │
│  3    ⌄│ ## 小节                       │
└─────┴─────────────────────────────────┘
 50px    编辑区
 ↑    ↑
 行号  折叠图标（间距较大）
```

### 修改后（left: 25px）
```
┌─────┬─────────────────────────────────┐
│  1  ⌄│ # 标题                          │
│  2   │ 内容                            │
│  3  ⌄│ ## 小节                         │
└─────┴─────────────────────────────────┘
 50px    编辑区
 ↑  ↑
 行号 折叠图标（更紧凑）
```

## 间距计算

### 修改前
```
行号区域: 50px
折叠图标位置: 30px
行号与图标间距: 约 8-10px
```

### 修改后
```
行号区域: 50px
折叠图标位置: 25px
行号与图标间距: 约 3-5px
```

**节省空间**: 约 5px

## 设计理念

### 1. 紧凑布局
- 行号和折叠图标更紧密
- 减少不必要的空白
- 提高空间利用率

### 2. 视觉连贯
- 行号和折叠图标形成视觉组
- 更容易识别折叠区域
- 界面更整洁

### 3. 编辑空间
- 虽然只节省 5px
- 但视觉上更紧凑
- 编辑区感觉更宽敞

## 完整配置

### 当前的折叠图标样式
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
  left: 25px !important;
}
```

## 配合的优化

### 1. 行号宽度优化
```javascript
lineNumbers: 'on',
lineNumbersMinChars: 3,
```
- 行号区域: 约 50px

### 2. 折叠图标自定义
```css
content: '⌄' !important;  /* 更小的箭头 */
```
- 图标更小巧

### 3. 位置调整
```css
left: 25px !important;  /* 更靠近行号 */
```
- 间距更紧凑

## 如果需要进一步调整

### 更靠近（不推荐）
```css
.monaco-editor .cldr.alwaysShowFoldIcons {
  left: 22px !important;  /* 可能太挤 */
}
```

### 更远一些
```css
.monaco-editor .cldr.alwaysShowFoldIcons {
  left: 28px !important;  /* 稍微宽松 */
}
```

### 当前设置（推荐）
```css
.monaco-editor .cldr.alwaysShowFoldIcons {
  left: 25px !important;  /* 平衡紧凑和可读性 */
}
```

## 文件修改

### App.css
**位置**: 文件末尾

**修改内容**:
```css
/* 调整折叠图标位置 */
.monaco-editor .cldr.alwaysShowFoldIcons {
  left: 25px !important;  /* 从 30px 改为 25px */
}
```

## 验证

### 检查样式
```bash
cd /vol4/1000/开发文件夹/mac/app/ui/frontend/src
tail -5 App.css
```

### 预期输出
```css
/* 调整折叠图标位置 */
.monaco-editor .cldr.alwaysShowFoldIcons {
  left: 25px !important;
}
```

## 总结

✅ 成功调整折叠图标位置  
✅ 从 30px 改为 25px  
✅ 行号和图标更紧凑  
✅ 视觉效果更整洁  
✅ 编辑空间感觉更宽敞  

**状态: 已完成！**

---

**实施者**: AI Assistant (Gemini Flash)  
**日期**: 2026-02-27  
**状态**: ✅ 完成
