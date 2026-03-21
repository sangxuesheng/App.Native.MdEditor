/**
 * App.jsx 集成补丁
 * 
 * 将以下代码添加到 App.jsx 中以启用本地持久化自动保存功能
 */

// ============================================
// 1. 在文件顶部的导入区域添加以下导入
// ============================================

import { useLocalPersistence, useBeforeUnload, useVisibilityChange } from './hooks/useLocalPersistence'
import { restoreFullState, hasContent, clearContent } from './utils/localPersistence'

// ============================================
// 2. 在 App() 函数开始处添加状态恢复
// ============================================

function App() {
  // 恢复保存的状态
  const savedState = restoreFullState()
  
  // 修改现有的状态初始化，使用恢复的值
  // 将原来的：
  // const [content, setContent] = useState('')
  // 改为：
  const [content, setContent] = useState(savedState?.content || '')
  
  // 将原来的：
  // const [currentPath, setCurrentPath] = useState('')
  // 改为：
  const [currentPath, setCurrentPath] = useState(savedState?.currentPath || '')
  
  // 将原来的：
  // const [editorTheme, setEditorTheme] = useState('light')
  // 改为：
  const [editorTheme, setEditorTheme] = useState(savedState?.theme || 'light')
  
  // 将原来的：
  // const [layout, setLayout] = useState('vertical')
  // 改为：
  const [layout, setLayout] = useState(savedState?.layout || 'vertical')
  
  // 将原来的：
  // const [showFileTree, setShowFileTree] = useState(false)
  // 改为：
  const [showFileTree, setShowFileTree] = useState(savedState?.showFileTree || false)
  
  // 将原来的：
  // const [showToolbar, setShowToolbar] = useState(true)
  // 改为：
  const [showToolbar, setShowToolbar] = useState(savedState?.showToolbar !== false)
  
  // 将原来的：
  // const [editorFontSize, setEditorFontSize] = useState(14)
  // 改为：
  const [editorFontSize, setEditorFontSize] = useState(savedState?.fontSize || 14)
  
  // fileTreeWidth 和 editorWidth 已经从 localStorage 读取，保持不变
  
  // ... 其他状态保持不变 ...

// ============================================
// 3. 在所有状态定义之后，添加自动保存逻辑
//    建议放在 useEffect 之前
// ============================================

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

// ============================================
// 4. 可选：在文件加载时清除自动保存的内容
// ============================================

  // 在 loadFile 函数开始处添加：
  const loadFile = async (path) => {
    try {
      setStatus('加载中...')
      setStatusType('normal')
      
      // 清除自动保存的内容（因为要加载新文件）
      clearContent()
      
      // ... 原有的加载逻辑 ...
    } catch (error) {
      // ... 错误处理 ...
    }
  }

// ============================================
// 5. 可选：在新建文件时清除自动保存的内容
// ============================================

  // 在 handleNewFileConfirm 函数中添加：
  const handleNewFileConfirm = (fileContent) => {
    // 清除自动保存的内容
    clearContent()
    
    // 直接加载模板内容到编辑器
    setContent(fileContent)
    setCurrentPath('') // 清空当前路径，表示这是新文件
    setInitialFileName('') // 清空初始文件名，用户保存时自己填写
    setStatus('新建文件 - 未保存')
  }

// ============================================
// 6. 可选：添加手动保存功能
// ============================================

  // 在需要手动保存的地方调用：
  const handleManualSave = () => {
    const success = saveNow() // 立即保存，不等待防抖
    if (success) {
      showToast('已保存到本地', 'success')
    } else {
      showToast('保存失败', 'error')
    }
  }

// ============================================
// 7. 可选：显示最后保存时间
// ============================================

  // 添加一个状态来显示最后保存时间
  const [lastSaveTime, setLastSaveTime] = useState(savedState?.lastSaveTime || null)
  
  // 在自动保存后更新时间
  useEffect(() => {
    if (savedState?.lastSaveTime) {
      setLastSaveTime(savedState.lastSaveTime)
    }
  }, [savedState?.lastSaveTime])
  
  // 格式化显示时间
  const formatLastSaveTime = () => {
    if (!lastSaveTime) return ''
    const date = new Date(lastSaveTime)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return '刚刚保存'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前保存`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前保存`
    return date.toLocaleString('zh-CN')
  }

// ============================================
// 完成！
// ============================================

/**
 * 集成后的功能：
 * 
 * ✅ 编辑器内容自动保存（500ms 防抖）
 * ✅ 布局宽度自动保存
 * ✅ 主题状态自动保存
 * ✅ 文件树显示状态自动保存
 * ✅ 工具栏显示状态自动保存
 * ✅ 字体大小自动保存
 * ✅ 页面刷新自动恢复
 * ✅ 页面关闭/重新打开自动恢复
 * ✅ 页面隐藏时自动保存
 * 
 * 测试方法：
 * 1. 在编辑器中输入内容
 * 2. 刷新页面（F5）
 * 3. 内容应该自动恢复
 * 
 * 查看保存的数据：
 * 浏览器开发者工具 → Application → Local Storage → 查看 md-editor-* 开头的键
 */
