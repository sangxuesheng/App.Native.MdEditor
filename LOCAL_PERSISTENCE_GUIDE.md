# 本地持久化自动保存功能集成指南

## 功能说明

本地持久化自动保存功能可以：
- ✅ 自动保存编辑器内容到 localStorage（防抖 500ms）
- ✅ 保存左右栏布局宽度
- ✅ 保存主题状态
- ✅ 保存文件树显示状态
- ✅ 保存工具栏显示状态
- ✅ 保存字体大小
- ✅ 保存光标位置和滚动位置
- ✅ 页面关闭/刷新时自动保存
- ✅ 页面重新打开时自动恢复

## 集成步骤

### 1. 在 App.jsx 顶部添加导入

在现有的导入语句后添加：

```javascript
import { useLocalPersistence, useBeforeUnload, useVisibilityChange } from './hooks/useLocalPersistence'
import { restoreFullState, hasContent, clearContent } from './utils/localPersistence'
```

### 2. 修改状态初始化

将现有的状态初始化改为从 localStorage 恢复：

```javascript
function App() {
  // 恢复保存的状态
  const savedState = restoreFullState()
  
  // 使用恢复的状态初始化
  const [content, setContent] = useState(savedState?.content || '')
  const [currentPath, setCurrentPath] = useState(savedState?.currentPath || '')
  const [editorTheme, setEditorTheme] = useState(savedState?.theme || 'light')
  const [layout, setLayout] = useState(savedState?.layout || 'vertical')
  const [showFileTree, setShowFileTree] = useState(savedState?.showFileTree || false)
  const [showToolbar, setShowToolbar] = useState(savedState?.showToolbar !== false) // 默认显示
  const [editorFontSize, setEditorFontSize] = useState(savedState?.fontSize || 14)
  
  const [fileTreeWidth, setFileTreeWidth] = useState(savedState?.fileTreeWidth || 280)
  const [editorWidth, setEditorWidth] = useState(savedState?.editorWidth || 50)
  
  // ... 其他状态保持不变
```

### 3. 添加自动保存逻辑

在所有状态定义之后，添加自动保存 Hook：

```javascript
  // 本地持久化自动保存
  const persistenceState = {
    content,
    currentPath,
    editorWidth,
    fileTreeWidth,
    theme: editorTheme,
    layout,
    showFileTree,
    showToolbar,
    fontSize: editorFontSize
  }
  
  // 启用自动保存（防抖 500ms）
  const { saveNow } = useLocalPersistence(persistenceState, 500, true)
  
  // 页面关闭/刷新时保存
  useBeforeUnload(persistenceState, true)
  
  // 页面隐藏时保存
  useVisibilityChange(persistenceState, true)
```

### 4. 恢复光标和滚动位置（可选）

在 Monaco Editor 加载完成后恢复光标位置：

```javascript
  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor
    window.monaco = monaco
    
    // ... 现有的主题设置代码 ...
    
    // 恢复光标位置
    if (savedState?.cursorPosition) {
      try {
        editor.setPosition(savedState.cursorPosition)
        editor.revealPositionInCenter(savedState.cursorPosition)
      } catch (error) {
        console.error('Failed to restore cursor position:', error)
      }
    }
    
    // 恢复滚动位置
    if (savedState?.scrollPosition) {
      try {
        editor.setScrollPosition(savedState.scrollPosition)
      } catch (error) {
        console.error('Failed to restore scroll position:', error)
      }
    }
  }
```

### 5. 保存光标和滚动位置（可选）

在编辑器内容变化时保存光标位置：

```javascript
  const handleEditorChange = (value) => {
    setContent(value || '')
    
    // 保存光标位置
    if (editorRef.current) {
      try {
        const position = editorRef.current.getPosition()
        const scrollPosition = editorRef.current.getScrollPosition()
        
        // 更新持久化状态
        persistenceState.cursorPosition = position
        persistenceState.scrollPosition = scrollPosition
      } catch (error) {
        console.error('Failed to save cursor position:', error)
      }
    }
  }
```

### 6. 添加清除功能（可选）

在新建文件或打开文件时，可以选择清除自动保存的内容：

```javascript
  const handleNewFile = () => {
    // 清除自动保存的内容
    clearContent()
    setContent('')
    setCurrentPath('')
    setShowNewFileDialog(true)
  }
  
  const handleOpenFile = (path) => {
    // 清除自动保存的内容
    clearContent()
    loadFile(path)
  }
```

## 完整示例代码

```javascript
import { useLocalPersistence, useBeforeUnload, useVisibilityChange } from './hooks/useLocalPersistence'
import { restoreFullState, hasContent, clearContent } from './utils/localPersistence'

function App() {
  // 1. 恢复保存的状态
  const savedState = restoreFullState()
  
  // 2. 使用恢复的状态初始化
  const [content, setContent] = useState(savedState?.content || '')
  const [currentPath, setCurrentPath] = useState(savedState?.currentPath || '')
  const [editorTheme, setEditorTheme] = useState(savedState?.theme || 'light')
  const [layout, setLayout] = useState(savedState?.layout || 'vertical')
  const [showFileTree, setShowFileTree] = useState(savedState?.showFileTree || false)
  const [showToolbar, setShowToolbar] = useState(savedState?.showToolbar !== false)
  const [editorFontSize, setEditorFontSize] = useState(savedState?.fontSize || 14)
  const [fileTreeWidth, setFileTreeWidth] = useState(savedState?.fileTreeWidth || 280)
  const [editorWidth, setEditorWidth] = useState(savedState?.editorWidth || 50)
  
  // ... 其他状态 ...
  
  // 3. 配置自动保存
  const persistenceState = {
    content,
    currentPath,
    editorWidth,
    fileTreeWidth,
    theme: editorTheme,
    layout,
    showFileTree,
    showToolbar,
    fontSize: editorFontSize
  }
  
  // 启用自动保存
  const { saveNow } = useLocalPersistence(persistenceState, 500, true)
  useBeforeUnload(persistenceState, true)
  useVisibilityChange(persistenceState, true)
  
  // 4. 在需要时手动保存
  const handleSave = () => {
    saveNow() // 立即保存
    // ... 其他保存逻辑 ...
  }
  
  // ... 其他代码 ...
}
```

## 测试方法

1. **测试自动保存**
   - 在编辑器中输入内容
   - 等待 500ms
   - 打开浏览器开发者工具 → Application → Local Storage
   - 查看 `md-editor-content` 是否已保存

2. **测试刷新恢复**
   - 输入一些内容
   - 刷新页面（F5 或 Ctrl+R）
   - 内容应该自动恢复

3. **测试关闭恢复**
   - 输入一些内容
   - 关闭标签页
   - 重新打开网页
   - 内容应该自动恢复

4. **测试布局恢复**
   - 调整左右栏宽度
   - 切换主题
   - 刷新页面
   - 布局和主题应该保持不变

## 注意事项

1. **localStorage 容量限制**
   - 大多数浏览器限制为 5-10MB
   - 如果内容过大，可能会保存失败
   - 建议定期清理或使用 IndexedDB

2. **隐私模式**
   - 在隐私/无痕模式下，localStorage 可能不可用
   - 关闭浏览器后数据会被清除

3. **跨域问题**
   - localStorage 是按域名隔离的
   - 不同域名下的数据不共享

4. **性能考虑**
   - 使用了 500ms 防抖，避免频繁写入
   - 只在状态真正变化时才保存
   - 使用 JSON.stringify 比较可能影响性能

## 高级功能

### 禁用自动保存

如果需要临时禁用自动保存：

```javascript
const { saveNow } = useLocalPersistence(persistenceState, 500, false) // 第三个参数设为 false
```

### 自定义防抖时间

```javascript
const { saveNow } = useLocalPersistence(persistenceState, 1000, true) // 1秒防抖
```

### 清除所有数据

```javascript
import { clearContent } from './utils/localPersistence'

const handleClearAll = () => {
  clearContent()
  setContent('')
  setCurrentPath('')
}
```

## 故障排查

### 内容没有保存

1. 检查浏览器控制台是否有错误
2. 检查 localStorage 是否可用
3. 检查是否超出容量限制

### 内容没有恢复

1. 检查 `restoreFullState()` 是否返回数据
2. 检查状态初始化是否正确
3. 检查是否在其他地方清除了数据

### 性能问题

1. 增加防抖时间
2. 减少保存的状态数量
3. 考虑使用 IndexedDB 替代 localStorage
