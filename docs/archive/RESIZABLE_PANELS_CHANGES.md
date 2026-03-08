# 可拉缩面板功能 - 代码变更摘要

## 变更日期
2026-02-26

## 新增文件

### 1. src/components/Resizer.jsx
可拖拽分隔条组件，核心功能：
- 支持垂直和水平两个方向
- 使用 useRef 跟踪拖拽状态
- 监听全局鼠标事件
- 通过回调函数传递拖拽偏移量

### 2. src/components/Resizer.css
分隔条样式文件：
- 4px 宽度的分隔条
- hover 和 active 状态的视觉反馈
- 支持三种主题配色

## 修改文件

### 1. src/App.jsx

#### 导入变更
```javascript
// 新增导入
import Resizer from './components/Resizer'
```

#### 状态管理新增
```javascript
// 面板宽度状态
const [fileTreeWidth, setFileTreeWidth] = useState(() => {
  const saved = localStorage.getItem('md-editor-filetree-width')
  return saved ? parseInt(saved) : 280
})
const [editorWidth, setEditorWidth] = useState(() => {
  const saved = localStorage.getItem('md-editor-editor-width')
  return saved ? parseInt(saved) : 50
})
```

#### 新增 useEffect
```javascript
// 保存面板宽度到 localStorage
useEffect(() => {
  localStorage.setItem('md-editor-filetree-width', fileTreeWidth.toString())
}, [fileTreeWidth])

useEffect(() => {
  localStorage.setItem('md-editor-editor-width', editorWidth.toString())
}, [editorWidth])
```

#### 新增处理函数
```javascript
// 处理文件树宽度调整
const handleFileTreeResize = useCallback((delta) => {
  setFileTreeWidth(prev => {
    const newWidth = prev + delta
    return Math.max(200, Math.min(600, newWidth))
  })
}, [])

// 处理编辑器宽度调整
const handleEditorResize = useCallback((delta) => {
  const mainContent = document.querySelector('.main-content')
  if (!mainContent) return
  
  const totalWidth = mainContent.offsetWidth - (showFileTree ? fileTreeWidth : 0) - 8
  const deltaPercent = (delta / totalWidth) * 100
  
  setEditorWidth(prev => {
    const newWidth = prev + deltaPercent
    return Math.max(20, Math.min(80, newWidth))
  })
}, [showFileTree, fileTreeWidth])
```

#### JSX 结构变更
```jsx
// 文件树部分 - 添加 Resizer
{showFileTree && (
  <>
    <FileTree 
      {...props}
      style={{ width: `${fileTreeWidth}px`, flexShrink: 0 }}
    />
    <Resizer direction="vertical" onResize={handleFileTreeResize} />
  </>
)}

// 编辑器部分 - 添加动态宽度和 Resizer
<div className="editor-pane" 
     style={(layout === 'vertical') ? { width: `${editorWidth}%`, flexShrink: 0 } : {}}>
  {/* 编辑器内容 */}
</div>
{(layout === 'vertical' || layout === 'horizontal') && (
  <Resizer 
    direction={layout === 'vertical' ? 'vertical' : 'horizontal'} 
    onResize={handleEditorResize} 
  />
)}

// 预览区 - 添加 flex: 1
<div className="preview-pane" 
     style={(layout === 'vertical') ? { flex: 1 } : {}}>
  {/* 预览内容 */}
</div>
```

### 2. src/App.css

#### 布局系统变更
从 Grid 布局改为 Flexbox 布局：

**之前（Grid）:**
```css
.main-content {
  display: grid;
  grid-template-columns: 280px 1fr 1fr;
}
```

**之后（Flexbox）:**
```css
.main-content {
  display: flex;
  flex-direction: row; /* 或 column */
}

.main-content.layout-vertical {
  flex-direction: row;
}

.main-content.layout-horizontal {
  flex-direction: column;
}
```

#### 移除的样式
- 所有 grid-template-* 相关样式
- grid-area 相关样式
- 固定的 280px 文件树宽度

#### 新增的样式
```css
/* 单独显示时占满空间 */
.main-content.layout-editor-only .editor-pane,
.main-content.layout-preview-only .preview-pane {
  flex: 1;
}

/* 水平布局时各占一半 */
.main-content.layout-horizontal .editor-pane,
.main-content.layout-horizontal .preview-pane {
  flex: 1;
  min-height: 0;
}
```

## 备份文件
- `App.jsx.backup_20260226_230702`
- `App.css.backup_20260226_230702`

## 技术要点

### 1. 为什么使用 Flexbox 而不是 Grid？
- Flexbox 更适合动态调整大小
- 可以通过 inline style 轻松控制宽度
- 与 flex: 1 配合实现自动填充剩余空间

### 2. 宽度限制的原因
- **文件树**: 200-600px，防止过窄或过宽影响使用
- **编辑器**: 20%-80%，确保预览区始终可见

### 3. localStorage 的使用
- 键名使用前缀 `md-editor-` 避免冲突
- 使用 parseInt 确保类型正确
- 提供默认值处理首次加载

### 4. useCallback 的使用
- 避免每次渲染创建新函数
- 优化性能，减少不必要的重渲染

## 兼容性说明
- 需要现代浏览器支持（ES6+）
- 需要 localStorage API
- 需要 Flexbox 支持（所有现代浏览器）

## 性能考虑
- 拖拽时直接更新 state，React 会批量更新
- 使用 useCallback 缓存处理函数
- 未来可考虑添加 throttle 优化高频更新

## 已知限制
1. 水平布局下的编辑器高度调整使用相同的百分比逻辑，可能需要单独优化
2. 窗口大小变化时，百分比宽度会自动调整，但可能不符合用户预期
3. 移动端触摸事件未特别优化

## 后续改进方向
1. 添加双击恢复默认宽度
2. 添加拖拽时的半透明遮罩层
3. 添加动画过渡效果
4. 支持触摸设备
5. 添加键盘快捷键调整
6. 支持保存多套布局预设
