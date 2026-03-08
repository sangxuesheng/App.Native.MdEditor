# 工具栏延长到预览区 - 修改说明

## 修改时间
2026-02-27

## 需求
将编辑器工具栏延长，使其横跨编辑区和预览区的整个宽度。

## 实现方案
采用**方案 2**：工具栏保持在编辑区内，通过 CSS 绝对定位延长到预览区。

## 修改内容

### 1. EditorToolbar.css
**文件**: `app/ui/frontend/src/components/EditorToolbar.css`

**修改前**:
```css
.editor-toolbar {
  position: relative;
  z-index: 100;
}
```

**修改后**:
```css
.editor-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}
```

**效果**: 工具栏使用绝对定位，横跨整个父容器宽度

### 2. App.css
**文件**: `app/ui/frontend/src/App.css`

#### 修改 1: 为 .editor-pane 添加定位上下文
```css
.editor-pane {
  display: flex;
  flex-direction: column;
  border-right: 1px solid #21262d;
  position: relative;  /* 新增 */
}
```

#### 修改 2: 为编辑器容器添加间距
```css
/* 编辑器容器 - 为工具栏留出空间 */
.editor-pane > div:last-child {
  height: calc(100% - 53px) !important;
  margin-top: 53px;
}
```

**效果**: 
- 编辑器向下偏移 53px（工具栏高度）
- 编辑器高度调整为 100% - 53px
- 避免内容被工具栏遮挡

## 工作原理

### 布局结构
```
.editor-pane (position: relative)
├── EditorToolbar (position: absolute, top: 0, left: 0, right: 0)
│   └── 工具栏按钮
└── Editor 容器 (margin-top: 53px, height: calc(100% - 53px))
    └── Monaco Editor
```

### 定位说明
1. **editor-pane**: 作为定位上下文（position: relative）
2. **EditorToolbar**: 绝对定位，固定在顶部，横跨整个宽度
3. **Editor 容器**: 向下偏移，避免被工具栏遮挡

## 视觉效果

### 修改前
```
┌─────────────────┬─────────────────┐
│  工具栏         │                 │
├─────────────────┤                 │
│                 │                 │
│  编辑区         │   预览区        │
│                 │                 │
└─────────────────┴─────────────────┘
```

### 修改后
```
┌───────────────────────────────────┐
│         工具栏（横跨全宽）         │
├─────────────────┬─────────────────┤
│                 │                 │
│  编辑区         │   预览区        │
│                 │                 │
└─────────────────┴─────────────────┘
```

## 优点

1. **视觉统一**: 工具栏横跨整个编辑和预览区域
2. **改动最小**: 只修改 CSS，不改变组件结构
3. **兼容性好**: 不影响现有功能和布局
4. **响应式**: 自动适应不同宽度

## 备份文件

- ✅ `EditorToolbar.css.backup` - 原始工具栏样式

## 测试建议

1. 启动应用，查看工具栏是否横跨编辑区和预览区
2. 测试垂直布局（编辑区+预览区并排）
3. 测试水平布局（编辑区+预览区上下）
4. 测试仅编辑器模式
5. 拖动面板宽度，确认工具栏自动调整
6. 测试三种主题（Dark/Light/MD3）
7. 测试工具栏按钮功能是否正常

## 注意事项

- 工具栏高度固定为 53px（min-height）
- 如果修改工具栏高度，需要同步修改 margin-top 和 calc() 中的值
- 工具栏 z-index 为 100，确保在其他元素之上

## 完成时间
2026-02-27 00:15

---
状态: ✅ 已完成
