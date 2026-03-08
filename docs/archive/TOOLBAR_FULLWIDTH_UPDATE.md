# 编辑器工具栏横跨全宽功能实现

## 实施时间
2026-02-27 00:15

## 需求
将编辑器工具栏（EditorToolbar）从编辑区内部移出，横跨整个页面宽度（编辑区 + 预览区），预览区下移。

## 实现方案

### 1. 结构调整

#### 修改前
```jsx
<main>
  <FileTree />
  <div className="editor-pane">
    <EditorToolbar />  // 只在编辑区内
    <Editor />
  </div>
  <div className="preview-pane">
    <Preview />
  </div>
</main>
```

#### 修改后
```jsx
<main>
  <EditorToolbar />  // 提升到 main 顶部，横跨全宽
  <FileTree />
  <div className="editor-pane">
    <Editor />  // 工具栏已移除
  </div>
  <div className="preview-pane">
    <Preview />
  </div>
</main>
```

### 2. 文件修改

#### App.jsx
**位置**: 第890-896行

**修改内容**:
1. 将 `EditorToolbar` 从 `editor-pane` 内移出
2. 放置到 `main-content` 的第一个子元素
3. 添加条件渲染：只在有编辑器的布局下显示

```jsx
<main className={`main-content layout-${layout} ${showFileTree ? 'with-filetree' : ''}`}>
  {showToolbar && (layout === 'horizontal' || layout === 'vertical' || layout === 'editor-only') && (
    <EditorToolbar 
      onInsert={handleToolbarInsert} 
      disabled={!editorRef.current}
    />
  )}
  {/* 其他内容 */}
</main>
```

#### App.css
**新增样式**:

1. **工具栏横跨全宽**
```css
.main-content > .editor-toolbar {
  width: 100%;
  flex-basis: 100%;
  flex-shrink: 0;
  order: -1;
  border-bottom: 1px solid #21262d;
  z-index: 10;
}
```

2. **main-content 支持换行**
```css
.main-content {
  flex: 1;
  display: flex;
  flex-wrap: wrap;  /* 新增 */
  min-height: 0;
  overflow: hidden;
}
```

3. **垂直布局优化**
```css
.main-content.layout-vertical {
  flex-direction: row;
  flex-wrap: wrap;
}

.main-content.layout-vertical > .editor-toolbar {
  width: 100%;
  flex-basis: 100%;
}

/* 确保其他元素在工具栏下方 */
.main-content.layout-vertical > .file-tree,
.main-content.layout-vertical > .resizer,
.main-content.layout-vertical > .editor-pane,
.main-content.layout-vertical > .preview-pane {
  order: 1;
}
```

4. **水平布局优化**
```css
.main-content.layout-horizontal {
  flex-direction: column;
  flex-wrap: nowrap;
}

.main-content.layout-horizontal > .editor-toolbar {
  width: 100%;
}
```

5. **主题支持**
```css
/* 浅色主题 */
.app.theme-light .main-content > .editor-toolbar {
  border-bottom-color: #d0d7de;
}

/* MD3 主题 */
.app.theme-md3 .main-content > .editor-toolbar {
  border-bottom-color: #e6e0e9;
}
```

### 3. 布局效果

#### 垂直布局（默认）
```
┌─────────────────────────────────────────┐
│         EditorToolbar (全宽)             │
├──────────┬──────────────┬───────────────┤
│ FileTree │   Editor     │   Preview     │
│          │              │               │
└──────────┴──────────────┴───────────────┘
```

#### 水平布局
```
┌─────────────────────────────────────────┐
│         EditorToolbar (全宽)             │
├──────────┬──────────────────────────────┤
│ FileTree │         Editor               │
│          ├──────────────────────────────┤
│          │         Preview              │
└──────────┴──────────────────────────────┘
```

#### 仅编辑器布局
```
┌─────────────────────────────────────────┐
│         EditorToolbar (全宽)             │
├──────────┬──────────────────────────────┤
│ FileTree │         Editor               │
│          │                              │
└──────────┴──────────────────────────────┘
```

## 技术要点

### 1. Flexbox order 属性
使用 `order: -1` 确保工具栏始终在最前面，即使在 DOM 中的位置可能不同。

### 2. flex-wrap 支持
添加 `flex-wrap: wrap` 允许工具栏独占一行，其他元素换行显示。

### 3. flex-basis: 100%
确保工具栏占据整行宽度，强制其他元素换行。

### 4. 条件渲染
只在有编辑器的布局下显示工具栏（排除 preview-only 布局）。

## 备份文件

- `App.jsx.backup_toolbar_20260227_001500`
- `App.css.backup_toolbar_20260227_001500`

## 测试要点

### 基础功能
- [ ] 工具栏横跨整个宽度（编辑区 + 预览区）
- [ ] 工具栏在所有面板上方
- [ ] 预览区正确下移
- [ ] 工具栏按钮功能正常

### 布局测试
- [ ] 垂直布局：工具栏横跨全宽
- [ ] 水平布局：工具栏横跨全宽
- [ ] 仅编辑器：工具栏横跨全宽
- [ ] 仅预览：不显示工具栏

### 响应式测试
- [ ] 调整文件树宽度，工具栏保持全宽
- [ ] 调整编辑器宽度，工具栏保持全宽
- [ ] 隐藏文件树，工具栏仍然全宽

### 主题测试
- [ ] Dark 主题：边框颜色正确
- [ ] Light 主题：边框颜色正确
- [ ] MD3 主题：边框颜色正确

## 预期效果

1. ✅ 工具栏横跨编辑区和预览区的整个宽度
2. ✅ 工具栏位置固定在内容区顶部
3. ✅ 预览区从工具栏下方开始显示
4. ✅ 所有布局模式下工具栏都正确显示
5. ✅ 工具栏功能完全正常

## 已知问题

无

## 后续优化建议

1. 可以考虑添加工具栏的固定定位（sticky）
2. 可以添加工具栏的折叠/展开功能
3. 可以优化工具栏在小屏幕下的显示

---

**实施者**: AI Assistant (Gemini Flash)  
**日期**: 2026-02-27  
**状态**: ✅ 完成
