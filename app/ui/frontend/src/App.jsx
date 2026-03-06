import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import Editor from '@monaco-editor/react'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeKatex from 'rehype-katex'
import rehypeStringify from 'rehype-stringify'
import rehypeRaw from 'rehype-raw'
import rehypeHighlight from 'rehype-highlight'
import 'katex/dist/katex.min.css'
// github-markdown-css 将根据主题动态加载

import FileTree from './components/FileTree'
import Resizer from './components/Resizer'
import markdownLogo from './assets/markdown.svg'
import EditorToolbar from './components/EditorToolbar'
import MenuBar from './components/MenuBar'
import NewFileDialog from './components/NewFileDialog'
import SaveAsDialog from './components/SaveAsDialog'
import ExportDialog from './components/ExportDialog'
import SettingsDialog from './components/SettingsDialog'
import MarkdownHelpDialog from './components/MarkdownHelpDialog'
import ShortcutsDialog from './components/ShortcutsDialog'
import ImageManagerDialog from './components/ImageManagerDialog'
import TableInsertDialog from './components/TableInsertDialog'
import AboutDialog from './components/AboutDialog'
import FileHistoryDialog from './components/FileHistoryDialog'
import { ToastContainer } from './components/Toast'
import { useDebounce } from './hooks/useDebounce'
import { saveFileHistory } from './utils/fileHistoryManagerV2'
import { handleError, logError, getUserFriendlyMessage } from './utils/errorHandler'
import './App.css'
import { getRecentFiles, addRecentFile, clearRecentFiles } from './utils/recentFilesManager'

import { getFavorites, toggleFavorite, clearFavorites, updateFavoritesOrder } from './utils/favoritesManager'
import { FolderArchive, Sun, Moon, Columns, FileText, Eye } from 'lucide-react'
import { useLocalPersistence, useBeforeUnload, useVisibilityChange } from './hooks/useLocalPersistence'
import { restoreFullState, clearContent as clearPersistedContent } from './utils/localPersistence'

// 初始化 unified 处理器
const createMarkdownProcessor = () => {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeKatex)
    .use(rehypeHighlight)
    .use(rehypeStringify)
}

// Mermaid 懒加载 - 使用预加载的 CDN
let mermaidModule = null
const loadMermaid = async () => {
  if (!mermaidModule) {
    // 等待 window.mermaid 可用
    let attempts = 0
    while (!window.mermaid && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
    
    if (!window.mermaid) {
      throw new Error('Mermaid not available')
    }
    
    mermaidModule = window.mermaid
    mermaidModule.initialize({ 
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose'
    })
  }
  return mermaidModule
}

function App() {
  // 恢复保存的状态
  const savedState = restoreFullState()
  
  const [content, setContent] = useState(savedState?.content || '')
  const [showImageManager, setShowImageManager] = useState(false)
  const [currentPath, setCurrentPath] = useState(savedState?.currentPath || '')
  const [status, setStatus] = useState('就绪')
  const [statusType, setStatusType] = useState('normal') // normal, success, error
  const [showTableDialog, setShowTableDialog] = useState(false)
  const [editorTheme, setEditorTheme] = useState(savedState?.theme || localStorage.getItem('md-editor-theme') || 'light')
  const [layout, setLayout] = useState(savedState?.layout || 'vertical')
  const [showFileTree, setShowFileTree] = useState(savedState?.showFileTree || false)
  const [showNewFileDialog, setShowNewFileDialog] = useState(false)
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false)
  const [isSaveAsMode, setIsSaveAsMode] = useState(true)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showToolbar, setShowToolbar] = useState(savedState?.showToolbar !== false)
  const [editorFontSize, setEditorFontSize] = useState(savedState?.fontSize || 14)
  const [recentFiles, setRecentFiles] = useState([])
  const [favorites, setFavorites] = useState([])

  const [rootDirs, setRootDirs] = useState([])
  const [mermaidLoaded, setMermaidLoaded] = useState(false)
  const previewRef = useRef(null)
  const editorRef = useRef(null)
  const fileTreeRef = useRef(null)
  // 跟踪上次保存的内容（用于自动保存优化）
  const lastSavedContentRef = useRef('')
  const lastSavedPathRef = useRef('')
  // 自动保存定时器
  const autoSaveTimerRef = useRef(null)
  // 面板宽度状态
  const [fileTreeWidth, setFileTreeWidth] = useState(savedState?.fileTreeWidth || 280)
  const [editorWidth, setEditorWidth] = useState(savedState?.editorWidth || 50)

  // Toast 通知状态
  const [toasts, setToasts] = useState([])

  // Toast 通知辅助函数
  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type, duration }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

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

  // 保存面板宽度到 localStorage（保留原有逻辑以兼容）
  useEffect(() => {
    localStorage.setItem('md-editor-filetree-width', fileTreeWidth.toString())
  }, [fileTreeWidth])

  useEffect(() => {
    localStorage.setItem('md-editor-editor-width', editorWidth.toString())
  }, [editorWidth])

  // 初始化主题
  useEffect(() => {
    const savedTheme = localStorage.getItem('md-editor-theme') || 'light'
    setEditorTheme(savedTheme)
  }, [])

  // 当主题变化时，应用到 Monaco Editor
  useEffect(() => {
    if (editorRef.current && window.monaco) {
      try {
        const monacoTheme = editorTheme === 'dark' ? 'vs-dark' : 'vs'
        window.monaco.editor.setTheme(monacoTheme)
      } catch (error) {
        console.error('Failed to set Monaco theme:', error)
      }
    }
  }, [editorTheme])

  // 动态加载 github-markdown CSS
  useEffect(() => {
    // 移除旧的样式表
    const oldLink = document.querySelector('link[data-github-markdown]')
    if (oldLink) {
      oldLink.remove()
    }

    // 添加新的样式表
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.setAttribute('data-github-markdown', 'true')
    link.href = editorTheme === 'dark' 
      ? 'https://cdn.jsdelivr.net/npm/github-markdown-css@5/github-markdown-dark.min.css'
      : 'https://cdn.jsdelivr.net/npm/github-markdown-css@5/github-markdown-light.min.css'
    document.head.appendChild(link)
  }, [editorTheme])

  // 处理文件树宽度调整
  const handleFileTreeResize = useCallback((delta) => {
    setFileTreeWidth(prev => {
      const newWidth = prev + delta
      return Math.max(200, Math.min(600, newWidth)) // 限制在 200-600px
    })
  }, [])

  // 处理编辑器宽度调整
  const handleEditorResize = useCallback((delta) => {
    const mainContent = document.querySelector('.main-content')
    if (!mainContent) return
    
    const totalWidth = mainContent.offsetWidth - (showFileTree ? fileTreeWidth : 0) - 8 // 减去分隔条宽度
    const deltaPercent = (delta / totalWidth) * 100
    
    setEditorWidth(prev => {
      const newWidth = prev + deltaPercent
      return Math.max(10, Math.min(90, newWidth)) // 限制在 10%-90%
    })
  }, [showFileTree, fileTreeWidth])

  const toggleEditorTheme = async () => {
    // 在 light 和 dark 之间切换
    const newTheme = editorTheme === 'light' ? 'dark' : 'light'
    
    // 保存主题设置
    setEditorTheme(newTheme)
    localStorage.setItem('md-editor-theme', newTheme)
    
    // 如果 Mermaid 已加载，根据主题设置
    if (mermaidLoaded && mermaidModule) {
      mermaidModule.initialize({ 
        startOnLoad: false,
        theme: newTheme === 'dark' ? 'dark' : 'default',
        securityLevel: 'loose'
      })
      setTimeout(() => renderMarkdown(), 100)
    }
  }

  const saveFile = async (path = currentPath, saveContent = content) => {
    if (!path) {
      setStatus('未指定文件路径，无法保存')
      return false
    }

    try {
      setStatus('保存中...')
      const response = await fetch('/api/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, content: saveContent })
      })
      const data = await response.json()
      
      if (data.ok) {
        // 不在这里保存历史版本，由调用方决定
        
        // 更新上次保存的内容（用于自动保存优化）
        lastSavedContentRef.current = saveContent
        lastSavedPathRef.current = path
        
        // 刷新文件树（刷新父目录）
        if (fileTreeRef.current && fileTreeRef.current.refreshDirectory) {
          const parentPath = path.split('/').slice(0, -1).join('/') || '/'
          await fileTreeRef.current.refreshDirectory(parentPath)
        }
        
        setStatus(`已保存: ${path}`)
        setStatusType('success')
        setTimeout(() => {
          setStatus('就绪')
          setStatusType('normal')
        }, 2000)
        return true
      } else {
        const errorMsg = getUserFriendlyMessage(
          new Error(data.message || data.code),
          { operation: '保存文件', filePath: path, showDetails: false }
        )
        setStatus(`保存失败: ${data.message || data.code}`)
        logError(new Error(data.message || data.code), {
          operation: '保存文件',
          filePath: path,
          responseData: data
        })
        return false
      }
    } catch (error) {
      const formattedError = handleError(error, {
        operation: '保存文件',
        filePath: path,
        contentSize: new Blob([saveContent]).size
      })
      setStatus(`保存失败: ${formattedError.message}`)
      return false
    }
  }

  // 根据文件大小动态调整自动保存间隔
  const getAutoSaveInterval = useCallback(() => {
    const contentSize = new Blob([content]).size
    const sizeInMB = contentSize / 1024 / 1024
    
    // 小文件（<100KB）：30秒
    // 中等文件（100KB-1MB）：60秒
    // 大文件（>1MB）：120秒
    if (sizeInMB > 1) {
      return 120000 // 2分钟
    } else if (sizeInMB > 0.1) {
      return 60000 // 1分钟
    } else {
      return 30000 // 30秒
    }
  }, [content])

  // 自动保存（替代 useAutoSave）- 只在内容变化时保存
  useEffect(() => {
    if (!currentPath || content === '') return

    // 清除之前的定时器
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }

    autoSaveTimerRef.current = setTimeout(async () => {
      // 检查内容是否真的变化了
      const contentChanged = content !== lastSavedContentRef.current
      const pathChanged = currentPath !== lastSavedPathRef.current

      // 只在内容变化或路径变化时才保存
      if (contentChanged || pathChanged) {
        try {
          const success = await saveFile(currentPath, content)
          if (success) {
            // 保存历史版本（自动保存标记）
            await saveFileHistory(currentPath, content, '', true)
            // 更新上次保存的内容
            lastSavedContentRef.current = content
            lastSavedPathRef.current = currentPath
          }
        } catch (error) {
          console.error('自动保存失败:', error)
        }
      }
    }, getAutoSaveInterval())

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [content, currentPath, getAutoSaveInterval])

  // 当文件加载时，更新上次保存的内容
  useEffect(() => {
    if (currentPath && content) {
      lastSavedContentRef.current = content
      lastSavedPathRef.current = currentPath
    }
  }, [currentPath])

  // 加载最近文件列表和收藏夹
  useEffect(() => {
    setRecentFiles(getRecentFiles())
    setFavorites(getFavorites())
  }, [])

  // 加载根目录列表
  useEffect(() => {
    const loadRootDirs = async () => {
      try {
        const response = await fetch('/api/files?path=/')
        const data = await response.json()
        if (data.ok && data.items) {
          setRootDirs(data.items)
        }
      } catch (error) {
        console.error('Load root dirs error:', error)
      }
    }
    loadRootDirs()
  }, [])

  // 全局快捷键处理
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // 检查是否在输入框中
      const isInputFocused = document.activeElement.tagName === 'INPUT' || 
                            document.activeElement.tagName === 'TEXTAREA'
      
      // Ctrl+N - 新建文件
      if (e.ctrlKey && e.key === 'n' && !e.shiftKey && !isInputFocused) {
        e.preventDefault()
        handleNewFile()
        return
      }
      
      // Ctrl+Shift+S - 另存为
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault()
        handleSaveAs()
        return
      }
      
      // Ctrl+T - 切换主题
      if (e.ctrlKey && e.key === 't' && !isInputFocused) {
        e.preventDefault()
        toggleEditorTheme()
        return
      }
      
      // Ctrl+\ - 切换文件树
      if (e.ctrlKey && e.key === '\\') {
        e.preventDefault()
        setShowFileTree(prev => !prev)
        return
      }
      
      // Shift+Alt+F - 格式化文档
      if (e.shiftKey && e.altKey && e.key === 'F') {
        e.preventDefault()
        if (editorRef.current) {
          handleMenuFormatDocument()
        }
        return
      }
      
      // Ctrl+1-6 - 插入标题
      if (e.ctrlKey && /^[1-6]$/.test(e.key) && editorRef.current) {
        e.preventDefault()
        const level = parseInt(e.key)
        const prefix = '#'.repeat(level) + ' '
        handleToolbarInsert(prefix, '', 'heading')
        return
      }
    }
    
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const path = params.get('path')
    if (path) {
      setCurrentPath(path)
      loadFile(path)
    } else if (!savedState?.content) {
      // 只在没有保存内容时才显示默认文本
      setContent(`# Markdown 编辑器功能展示
这是一个完整的 Markdown 功能展示文档，包含了各种常用的格式和元素。

## 文本格式
### 基础文本样式
- **粗体文本**
- *斜体文本*
- ***粗斜体文本***
- ~~删除线文本~~
- \`行内代码\`

### 标题层级
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题

## 列表
### 无序列表
- 第一项
- 第二项
  - 嵌套项目 1
  - 嵌套项目 2
- 第三项

### 有序列表
1. 第一步
2. 第二步
   1. 子步骤 A
   2. 子步骤 B
3. 第三步

### 任务列表
- [x] 已完成的任务
- [ ] 待完成的任务
- [ ] 另一个待完成的任务

## 链接和图片
### 链接
[这是一个链接](https://example.com)

[带标题的链接](https://example.com "链接标题")

### 图片
![示例图片](https://pic1.imgdb.cn/item/69a61149dcdb109d1d43dafd.png"图片描述")

## 引用
> 这是一个引用块
>
> 可以包含多行内容
>
> > 这是嵌套引用

## 代码块
### JavaScript 代码
\`\`\`javascript
function greet(name) {
    console.log(\`Hello, \${name}!\`);
    return \`Welcome to Markdown Editor\`;
}

const message = greet('用户');
\`\`\`

### Python 代码
\`\`\`python
def calculate_fibonacci(n):
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

# 计算前10个斐波那契数
for i in range(10):
    print(f"F({i}) = {calculate_fibonacci(i)}")
\`\`\`

### CSS 代码
\`\`\`css
.markdown-editor {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #333;
}

.code-block {
    background-color: #f4f4f4;
    border-radius: 4px;
    padding: 1rem;
    overflow-x: auto;
}
\`\`\`

## 表格
| 功能     | 描述             | 状态      |
| -------- | ---------------- | --------- |
| 实时预览 | 边写边看效果     | ✅ 已实现 |
| 语法高亮 | 代码块高亮显示   | ✅ 已实现 |
| 导出功能 | 支持多种格式导出 | ✅ 已实现 |
| 主题切换 | 多种主题可选     | 🚧 开发中 |
| 插件系统 | 扩展功能支持     | 📋 计划中 |

## 数学公式
### 行内公式
这是一个行内公式：\$E = mc^2\$

### 块级公式
\$\$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
\$\$

\$\$
\\begin{align}
\\nabla \\times \\vec{\\mathbf{B}} -\\, \\frac1c\\, \\frac{\\partial\\vec{\\mathbf{E}}}{\\partial t} &= \\frac{4\\pi}{c}\\vec{\\mathbf{j}} \\\\
\\nabla \\cdot \\vec{\\mathbf{E}} &= 4 \\pi \\rho \\\\
\\nabla \\times \\vec{\\mathbf{E}}\\, +\\, \\frac1c\\, \\frac{\\partial\\vec{\\mathbf{B}}}{\\partial t} &= \\vec{\\mathbf{0}} \\\\
\\nabla \\cdot \\vec{\\mathbf{B}} &= 0
\\end{align}
\$\$

## 流程图 (Mermaid)
\`\`\`mermaid
graph TD
    A[开始] --> B{是否登录?}
    B -->|是| C[显示主界面]
    B -->|否| D[显示登录页面]
    D --> E[用户输入凭据]
    E --> F{验证成功?}
    F -->|是| C
    F -->|否| G[显示错误信息]
    G --> D
    C --> H[结束]
\`\`\`

## 时序图
\`\`\`mermaid
sequenceDiagram
    participant U as 用户
    participant E as 编辑器
    participant P as 预览器
    participant S as 服务器

    U->>E: 输入 Markdown 文本
    E->>P: 实时渲染
    P->>U: 显示预览
    U->>E: 点击导出
    E->>S: 发送导出请求
    S->>E: 返回导出文件
    E->>U: 下载文件
\`\`\`

## 分隔线
---

## 特殊符号和 Emoji
### 常用符号
- © 版权符号
- ® 注册商标
- ™ 商标符号
- § 章节符号
- ¶ 段落符号

### Emoji 表情
- 😀 开心
- 🚀 火箭
- 💡 想法
- ⭐ 星星
- 🎉 庆祝
- 📝 笔记
- 💻 电脑
- 🔧 工具

## 脚注
这是一个带脚注的文本[^1]，还有另一个脚注[^2]。

[^1]: 这是第一个脚注的内容
[^2]: 这是第二个脚注的内容，可以包含更多详细信息

## 高亮文本
==这是高亮文本==

## 键盘按键
按 <kbd>Ctrl</kbd> + <kbd>S</kbd> 保存文档

按 <kbd>Ctrl</kbd> + <kbd>C</kbd> 复制内容

## 缩写
HTML 是 *HyperText Markup Language* 的缩写

CSS 是 *Cascading Style Sheets* 的缩写

## 定义列表
Markdown
:   一种轻量级标记语言

HTML
:   超文本标记语言
:   用于创建网页的标准标记语言

## 总结
这个 Markdown 文档展示了编辑器支持的各种功能：
1. **文本格式化** - 粗体、斜体、删除线等
2. **结构化内容** - 标题、列表、表格
3. **媒体内容** - 链接、图片
4. **代码展示** - 语法高亮的代码块
5. **数学公式** - LaTeX 格式的数学表达式
6. **图表绘制** - Mermaid 流程图和时序图
7. **交互元素** - 任务列表、脚注
8. **特殊格式** - 引用、分隔线、高亮

---

*最后更新时间：2025 年 1 月*

**版权声明**：本文档仅用于功能展示，欢迎自由使用和修改。

---


点击工具栏的"新建"按钮创建新文件，或从左侧文件树打开现有文件。

开始编辑吧！`)
    }
  }, [])

  const loadFile = async (path) => {
    try {
      // 清除自动保存的内容（因为要加载新文件）
      clearPersistedContent()
      
      setStatus('正在加载...')
      const response = await fetch(`/api/file?path=${encodeURIComponent(path)}`)
      const data = await response.json()
      
      if (data.ok) {
        const fileContent = data.content || ''
        
        // 检查文件大小
        const fileSizeKB = fileContent.length / 1024
        if (fileSizeKB > 1024) { // 大于 1MB
          const fileSizeMB = (fileSizeKB / 1024).toFixed(2)
          const confirmed = window.confirm(
            `文件较大（${fileSizeMB} MB），加载可能需要一些时间。是否继续？`
          )
          if (!confirmed) {
            setStatus('已取消加载')
            setTimeout(() => setStatus('就绪'), 2000)
            return
          }
        }
        
        // 添加到最近文件列表
        addRecentFile(path)
        setRecentFiles(getRecentFiles())
        
        setContent(fileContent)
        
        setStatus(`已加载: ${path}`)
      } else {
        const errorMsg = getUserFriendlyMessage(
          new Error(data.message || data.code),
          { operation: '加载文件', filePath: path }
        )
        setStatus(`加载失败: ${data.message || data.code}`)
        console.error(errorMsg)
      }
    } catch (error) {
      const formattedError = handleError(error, {
        operation: '加载文件',
        filePath: path
      })
      setStatus(`加载失败: ${formattedError.message}`)
    }
  }

  const handleFileSelect = (filePath) => {
    setCurrentPath(filePath)
    loadFile(filePath)
  }

  const handleNewFile = () => {
    setShowNewFileDialog(true)
  }

  const [initialFileName, setInitialFileName] = useState('')

  const handleNewFileConfirm = (fileContent) => {
    // 清除自动保存的内容（因为要创建新文件）
    clearPersistedContent()
    
    // 直接加载模板内容到编辑器
    setContent(fileContent)
    setCurrentPath('') // 清空当前路径，表示这是新文件
    setInitialFileName('') // 清空初始文件名，用户保存时自己填写
    setStatus('新建文件 - 未保存')
    // 不再打开保存对话框，用户编辑完成后通过保存按钮触发
  }

  const handleSaveAsConfirm = async (newPath) => {
    // 使用当前编辑器内容进行保存
    const success = await saveFile(newPath, content)
    if (success) {
      setCurrentPath(newPath)
      setStatus(`已保存: ${newPath}`)
      
      // 另存为后创建历史版本（标记为手动保存）
      await saveFileHistory(newPath, content, '', false).catch(err => {
        console.warn('保存历史版本失败:', err)
      })
      
      // 刷新文件树（刷新父目录）
      if (fileTreeRef.current && fileTreeRef.current.refreshDirectory) {
        const parentPath = newPath.split('/').slice(0, -1).join('/') || '/'
        await fileTreeRef.current.refreshDirectory(parentPath)
      }
      
      setTimeout(() => setStatus('就绪'), 2000)
    }
  }

  const handleImageUpload = useCallback(async (file) => {
    if (!file || !editorRef.current) return
    
    setStatus('正在压缩图片...')
    
    try {
      // 压缩图片
      try {
        file = await compressImage(file)
        setStatus('正在上传图片...')
      } catch (error) {
        console.error('图片压缩失败:', error)
        setStatus('正在上传图片...')
      }
      
      // 上传图片
      const formData = new FormData()
      formData.append('images', file)
      
      const response = await fetch('/api/image/upload', {
        method: 'POST',
        body: formData
      })
      
      const result = await response.json()
      
      if (result.ok && result.images && result.images.length > 0) {
        const image = result.images[0]
        const markdown = `![图片](${image.url})`
        
        // 插入到编辑器
        const editor = editorRef.current
        const selection = editor.getSelection()
        editor.executeEdits('paste-image', [{
          range: selection,
          text: markdown,
          forceMoveMarkers: true
        }])
        
        setStatus(`图片上传成功: ${image.filename}`)
        setTimeout(() => setStatus('就绪'), 2000)
      } else {
        const errorMsg = getUserFriendlyMessage(
          new Error(result.message || '上传失败'),
          { operation: '图片上传', fileName: file.name }
        )
        setStatus(`图片上传失败: ${result.message || '未知错误'}`)
        logError(new Error(result.message || '上传失败'), {
          operation: '图片上传',
          fileName: file.name,
          fileSize: file.size,
          responseData: result
        })
        setTimeout(() => setStatus('就绪'), 2000)
      }
    } catch (error) {
      const formattedError = handleError(error, {
        operation: '图片上传',
        fileName: file.name,
        fileSize: file.size
      })
      setStatus(`图片上传失败: ${formattedError.message}`)
      setTimeout(() => setStatus('就绪'), 2000)
    }
  }, [])

  // 处理大纲点击，跳转到指定行
  const handleHeadingClick = useCallback((lineNumber) => {
    if (!editorRef.current) return
    
    const editor = editorRef.current
    // 跳转到指定行并居中显示
    editor.revealLineInCenter(lineNumber)
    // 设置光标位置
    editor.setPosition({ lineNumber, column: 1 })
    // 聚焦编辑器
    editor.focus()
  }, [])

  // 插入表格
  const insertTable = useCallback((markdown) => {
    if (!editorRef.current) return

    const editor = editorRef.current
    const selection = editor.getSelection()
    const position = selection.getStartPosition()

    // 插入表格
    editor.executeEdits('insert-table', [{
      range: {
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      },
      text: '\n' + markdown + '\n'
    }])

    // 移动光标到表格后
    const lines = markdown.split('\n').length
    const newPosition = {
      lineNumber: position.lineNumber + lines + 2,
      column: 1
    }
    editor.setPosition(newPosition)
    editor.focus()
  }, [])

  const handleSaveClick = async () => {
    if (currentPath) {
      // 清除自动保存定时器，避免冲突
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
        autoSaveTimerRef.current = null
      }
      // 如果有路径，直接保存
      const success = await saveFile(currentPath, content)
      if (success) {
        // 手动保存后创建历史版本（标记为手动保存）
        await saveFileHistory(currentPath, content, '', false).catch(err => {
          console.warn('保存历史版本失败:', err)
        })
      }
    } else {
      // 如果没有路径，打开保存对话框（不是另存为）
      setIsSaveAsMode(false)
      setShowSaveAsDialog(true)
    }
  }

  // 恢复历史版本
  const handleVersionRestore = useCallback(async (restoredContent, version) => {
    if (!restoredContent) return
    
    // 更新编辑器内容
    setContent(restoredContent)
    
    // 自动保存一个新版本，标记为从哪个版本恢复
    try {
      await saveFileHistory(
        currentPath, 
        restoredContent, 
        `从版本 ${version.versionNumber} 恢复`, 
        false // 手动保存
      )
    } catch (error) {
      console.error('保存恢复版本失败:', error)
    }
    
    // 显示成功提示
    setStatus(`已恢复到版本 ${version.versionNumber}`)
    setStatusType('success')
    setTimeout(() => {
      setStatus('就绪')
      setStatusType('normal')
    }, 3000)
    
    // 聚焦编辑器
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }, [currentPath])

  const handleSaveAs = () => {
    setIsSaveAsMode(true)
    setShowSaveAsDialog(true)
  }

  const handleExport = (format) => {
    if (!format) {
      // 如果没有指定格式，打开导出对话框让用户选择
      setShowExportDialog(true)
      return
    }

    // 直接导出指定格式
    const getFileName = () => {
      if (currentPath) {
        const pathParts = currentPath.split('/')
        const fileName = pathParts[pathParts.length - 1]
        return fileName.replace(/\.md$/, '')
      }
      return 'document'
    }

    const fileName = getFileName()

    try {
      switch (format) {
        case 'html':
        case 'html-plain':
          // HTML 导出
          const includeCSS = format !== 'html-plain'
          const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileName}</title>
  ${includeCSS ? `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css@5/github-markdown-light.min.css">
  <script>
    window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true,
        processEnvironments: true
      }
    };
  </script>
  <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
  <style>
    body {
      margin: 0;
      padding: 20px;
      background-color: #ffffff;
    }
    .markdown-body {
      box-sizing: border-box;
      min-width: 200px;
      max-width: 980px;
      margin: 0 auto;
      padding: 45px;
    }
    @media (max-width: 767px) {
      .markdown-body {
        padding: 15px;
      }
    }
  </style>` : ''}
</head>
<body>
  <div class="markdown-body">
    ${previewRef.current?.innerHTML || ''}
  </div>
</body>
</html>`
          const htmlBlob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
          const htmlUrl = URL.createObjectURL(htmlBlob)
          const htmlLink = document.createElement('a')
          htmlLink.href = htmlUrl
          htmlLink.download = `${fileName}.html`
          document.body.appendChild(htmlLink)
          htmlLink.click()
          document.body.removeChild(htmlLink)
          URL.revokeObjectURL(htmlUrl)
          setStatus('已导出为 HTML')
          break

        case 'md':
          // Markdown 导出
          const mdBlob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
          const mdUrl = URL.createObjectURL(mdBlob)
          const mdLink = document.createElement('a')
          mdLink.href = mdUrl
          mdLink.download = `${fileName}.md`
          document.body.appendChild(mdLink)
          mdLink.click()
          document.body.removeChild(mdLink)
          URL.revokeObjectURL(mdUrl)
          setStatus('已导出为 Markdown')
          break

        case 'wechat':
          // 公众号格式 - 复制到剪贴板
          const wechatHtml = previewRef.current?.innerHTML || ''
          navigator.clipboard.writeText(wechatHtml).then(() => {
            setStatus('已复制公众号格式到剪贴板')
            setStatusType('success')
            setTimeout(() => {
              setStatus('就绪')
              setStatusType('normal')
            }, 2000)
          }).catch(() => {
            setStatus('复制失败')
            setStatusType('error')
          })
          break

        case 'pdf':
        case 'png':
          // PDF 和 PNG 需要更多选项，打开导出对话框
          setShowExportDialog(true)
          break

        default:
          setShowExportDialog(true)
      }
    } catch (error) {
      setStatus('导出失败: ' + error.message)
      setStatusType('error')
      console.error('Export error:', error)
    }
  }

  const handleSettings = () => {
    setShowSettingsDialog(true)
  }

  const renderMarkdown = useCallback(async () => {
    if (!previewRef.current) return

    const startTime = performance.now() // 性能监控

    try {
      // 大文件优化：检测文件大小
      const contentSize = new Blob([content]).size
      const isLargeFile = contentSize > 1024 * 1024 // 1MB
      
      if (isLargeFile) {
        console.log(`大文件检测: ${(contentSize / 1024 / 1024).toFixed(2)}MB，使用优化渲染`)
        // 对于大文件，显示加载提示
        previewRef.current.innerHTML = '<div style="padding: 20px; text-align: center; color: #888;">正在渲染大文件，请稍候...</div>'
        // 使用 setTimeout 让 UI 有时间更新
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      // 预处理：将 ==高亮== 转换为 <mark>高亮</mark>
      let processedContent = content.replace(/==([^=\n]+)==/g, '<mark>$1</mark>')
      
      // 使用 unified 处理器渲染 Markdown
      const processor = createMarkdownProcessor()
      const file = await processor.process(processedContent)
      let html = String(file)

      
      // 提取 Mermaid 代码块
      const mermaidRegex = /```mermaid\n([\s\S]*?)```/g
      let match
      let mermaidIndex = 0
      const mermaidBlocks = []
      
      while ((match = mermaidRegex.exec(content)) !== null) {
        const code = match[1]
        const id = `mermaid-${mermaidIndex++}`
        mermaidBlocks.push({ id, code })
      }

      console.log('Mermaid blocks found in content:', mermaidBlocks.length)
      
      // 一次性替换所有 Mermaid 代码块
      console.log('查找 language-mermaid 代码块...')
      const mermaidMatches = html.match(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g)
      console.log('找到的 language-mermaid 块:', mermaidMatches ? mermaidMatches.length : 0)
      
      // 查找所有 pre code 块
      const allCodeBlocks = html.match(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/g)
      console.log('所有代码块数量:', allCodeBlocks ? allCodeBlocks.length : 0)
      if (allCodeBlocks && allCodeBlocks.length > 0) {
        console.log('前3个代码块:', allCodeBlocks.slice(0, 3).map(b => b.substring(0, 100)))
      }
      
      let blockIndex = 0
      html = html.replace(
        /<pre><code class="hljs language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
        (match, htmlCode) => {
          const id = `mermaid-${blockIndex}`
          blockIndex++
          // 解码 HTML 实体
          const textarea = document.createElement('textarea')
          textarea.innerHTML = htmlCode
          const decodedCode = textarea.value
          return `<div class="mermaid" id="${id}" data-code="${encodeURIComponent(decodedCode)}">${decodedCode}</div>`
        }
      )

      previewRef.current.innerHTML = html

      // 只有在有 Mermaid 图表时才加载 Mermaid
      if (mermaidBlocks.length > 0) {
        try {
          if (!mermaidLoaded) {
            setStatus('正在加载 Mermaid...')
          }
          const mermaid = await loadMermaid()
          setMermaidLoaded(true)
          
          // 等待 DOM 更新完成
          await new Promise(resolve => setTimeout(resolve, 100))
          
          const mermaidNodes = previewRef.current.querySelectorAll('.mermaid')
          console.log('Mermaid nodes found:', mermaidNodes.length)
          
          // 逐个渲染 Mermaid 图表
          for (let i = 0; i < mermaidNodes.length; i++) {
            const node = mermaidNodes[i]
            const encodedCode = node.getAttribute('data-code')
            const code = encodedCode ? decodeURIComponent(encodedCode) : node.textContent
            const id = node.id || `mermaid-${i}`
            
            console.log(`Rendering node ${i}:`, code.substring(0, 50))
            
            try {
              const { svg } = await mermaid.render(id + '-svg', code)
              node.innerHTML = svg
            } catch (err) {
              console.error(`Failed to render mermaid ${i}:`, err)
              
              // 检查是否是中文导致的错误
              const hasChinese = /[\u4e00-\u9fa5]/.test(code)
              let errorMsg = `Mermaid 渲染失败: ${err.message}`
              
              if (hasChinese && (code.includes('erDiagram') || code.includes('classDiagram'))) {
                errorMsg += '\n\n💡 提示：erDiagram 和 classDiagram 对中文支持有限，建议：\n'
                errorMsg += '1. 使用英文或拼音命名实体\n'
                errorMsg += '2. 使用引号包裹中文标签，如: "用户"\n'
                errorMsg += '3. 或改用 flowchart/graph 类型'
              }
              
              node.innerHTML = `<pre style="color: #f85149; background: #161b22; padding: 16px; border-radius: 6px; border: 1px solid #30363d; white-space: pre-wrap;">${errorMsg}\n\n原始代码：\n${code}</pre>`
            }
          }
          
          console.log('Mermaid rendering completed')
          
          if (!mermaidLoaded) {
            setStatus('就绪')
          }
        } catch (err) {
          logError(err, {
            operation: 'Mermaid 渲染',
            mermaidBlocksCount: mermaidBlocks.length
          })
          setStatus('Mermaid 渲染失败')
          setTimeout(() => setStatus('就绪'), 2000)
        }
      }
    } catch (err) {
      const formattedError = handleError(err, {
        operation: 'Markdown 渲染',
        contentSize: new Blob([content]).size,
        showDetails: true
      })
      previewRef.current.innerHTML = `<pre style="color: #f85149; background: #161b22; padding: 16px; border-radius: 6px; border: 1px solid #30363d; white-space: pre-wrap;">${formattedError.title}\n\n${formattedError.message}\n\n💡 ${formattedError.suggestion}\n\n详细信息：${formattedError.details}</pre>`
    } finally {
      // 性能监控：记录渲染时间
      const endTime = performance.now()
      const renderTime = endTime - startTime
      const contentSize = new Blob([content]).size
      console.log(`Markdown 渲染完成: ${renderTime.toFixed(2)}ms, 文件大小: ${(contentSize / 1024).toFixed(2)}KB`)
      
      // 如果渲染时间过长，给出提示
      if (renderTime > 1000) {
        console.warn(`⚠️ 渲染时间较长 (${renderTime.toFixed(2)}ms)，建议优化文档内容`)
      }
    }

  }, [content, mermaidLoaded])

  // 使用 debounce 优化 Markdown 渲染性能
  const debouncedContent = useDebounce(content, 500) // 500ms 延迟

  useEffect(() => {
    renderMarkdown()
  }, [debouncedContent, renderMarkdown])

  useEffect(() => {
    if (layout === 'preview-only' || layout === 'vertical') {
      const timer = setTimeout(() => {
        renderMarkdown()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [layout, renderMarkdown])

  // 处理脚注链接点击，防止页面滚动
  useEffect(() => {
    const handleFootnoteClick = (e) => {
      const target = e.target.closest('a[href^="#"]')
      if (!target) return
      
      const href = target.getAttribute('href')
      if (!href || href === '#') return
      
      // 检查是否是脚注相关的链接
      const isFootnoteLink = href.includes('fn') || href.includes('fnref') || 
                            target.hasAttribute('data-footnote-ref') || 
                            target.hasAttribute('data-footnote-backref')
      
      if (isFootnoteLink) {
        e.preventDefault()
        e.stopPropagation()
        
        // 查找目标元素
        const targetId = href.substring(1)
        const targetElement = previewRef.current?.querySelector(`#${targetId}`)
        
        if (targetElement) {
          // 获取预览容器 - previewRef.current 的父元素就是 .preview-pane
          const previewPane = previewRef.current.parentElement
          if (!previewPane) {
            console.log('找不到 preview-pane')
            return
          }
          
          // 计算目标元素相对于 markdown-body 的位置
          const targetRect = targetElement.getBoundingClientRect()
          const previewRect = previewPane.getBoundingClientRect()
          
          // 计算需要滚动的距离（将目标元素滚动到预览区中心）
          const scrollTop = previewPane.scrollTop
          const targetOffset = targetRect.top - previewRect.top + scrollTop
          const centerOffset = previewPane.clientHeight / 2 - targetRect.height / 2
          
          console.log('脚注滚动:', {
            targetId,
            scrollTop,
            targetOffset,
            centerOffset,
            finalScroll: targetOffset - centerOffset
          })
          
          // 只在预览区内滚动，不影响页面
          previewPane.scrollTo({
            top: targetOffset - centerOffset,
            behavior: 'smooth'
          })
        } else {
          console.log('找不到目标元素:', href)
        }
      }
    }
    
    const previewElement = previewRef.current
    if (previewElement) {
      previewElement.addEventListener('click', handleFootnoteClick, true)
      return () => {
        previewElement.removeEventListener('click', handleFootnoteClick, true)
      }
    }
  }, [previewRef])

  const handleToolbarInsert = (before, after, mode) => {
    if (!editorRef.current) return

    const editor = editorRef.current
    const model = editor.getModel()
    const selection = editor.getSelection()
    const selectedText = model.getValueInRange(selection)

    let newText = ''
    let newSelection = null

    switch (mode) {
      case 'wrap':
        newText = `${before}${selectedText}${after}`
        newSelection = {
          startLineNumber: selection.startLineNumber,
          startColumn: selection.startColumn + before.length,
          endLineNumber: selection.endLineNumber,
          endColumn: selection.endColumn + before.length
        }
        break

      case 'line':
        const lineContent = model.getLineContent(selection.startLineNumber)
        newText = `${before}${lineContent}`
        editor.executeEdits('', [{
          range: {
            startLineNumber: selection.startLineNumber,
            startColumn: 1,
            endLineNumber: selection.startLineNumber,
            endColumn: lineContent.length + 1
          },
          text: newText
        }])
        editor.setPosition({
          lineNumber: selection.startLineNumber,
          column: before.length + 1
        })
        editor.focus()
        return

      case 'heading':
        const headingLine = model.getLineContent(selection.startLineNumber)
        const cleanLine = headingLine.replace(/^#+\s*/, '')
        newText = `${before}${cleanLine}`
        editor.executeEdits('', [{
          range: {
            startLineNumber: selection.startLineNumber,
            startColumn: 1,
            endLineNumber: selection.startLineNumber,
            endColumn: headingLine.length + 1
          },
          text: newText
        }])
        editor.setPosition({
          lineNumber: selection.startLineNumber,
          column: newText.length + 1
        })
        editor.focus()
        return

      case 'insert':
        newText = before
        break

      default:
        return
    }

    editor.executeEdits('', [{
      range: selection,
      text: newText
    }])

    if (newSelection) {
      editor.setSelection(newSelection)
    } else if (mode === 'insert') {
      const lines = newText.split('\n')
      const lastLine = lines[lines.length - 1]
      editor.setPosition({
        lineNumber: selection.startLineNumber + lines.length - 1,
        column: lastLine.length + 1
      })
    }

    editor.focus()
  }

  const handleImageInsert = (markdown) => {
    if (editorRef.current) {
      const editor = editorRef.current
      const selection = editor.getSelection()
      const op = {
        range: selection,
        text: markdown,
        forceMoveMarkers: true
      }
      editor.executeEdits('insert-image', [op])
      editor.focus()
    }
  }

  const handleEditorMount = (editor) => {
    editorRef.current = editor
    
    // 定义自定义主题 - 修改标题颜色
    monaco.editor.defineTheme('light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword.md', foreground: '0165FF', fontStyle: 'bold' },
        { token: 'string.md', foreground: '0165FF', fontStyle: 'bold' },
      ],
      colors: {
        'editor.foreground': '#24292f',
        'editor.background': '#FFFFFF',
      }
    })
    
    // 应用主题
    const monacoTheme = editorTheme === 'dark' ? 'vs-dark' : 'vs'
    monaco.editor.setTheme(monacoTheme)
    
    // 监听粘贴事件，处理图片粘贴
    const domNode = editor.getDomNode()
    if (domNode) {
      domNode.addEventListener('paste', async (e) => {
        const items = e.clipboardData?.items
        if (!items) return
        
        // 查找图片项
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          if (item.type.startsWith('image/')) {
            e.preventDefault()
            e.stopPropagation()
            
            const file = item.getAsFile()
            if (!file) continue
            
            // 显示上传提示
            setStatus('正在上传图片...')
            
            try {
              // 上传图片
              const formData = new FormData()
              formData.append('images', file)
              
              const response = await fetch('/api/image/upload', {
                method: 'POST',
                body: formData
              })
              
              const result = await response.json()
              
              if (result.ok && result.images && result.images.length > 0) {
                const image = result.images[0]
                const markdown = `![图片](\${image.url})`
                
                // 插入到编辑器
                const selection = editor.getSelection()
                editor.executeEdits('paste-image', [{
                  range: selection,
                  text: markdown,
                  forceMoveMarkers: true
                }])
                
                showToast(`图片上传成功: ${image.filename}`, 'success')
                setStatus('就绪')
              } else {
                const errorMsg = getUserFriendlyMessage(
                  new Error(result.message || '上传失败'),
                  { operation: '粘贴上传图片' }
                )
                showToast('图片上传失败', 'error')
                logError(new Error(result.message || '上传失败'), {
                  operation: '粘贴上传图片',
                  responseData: result
                })
                setStatus('就绪')
              }
            } catch (error) {
              const formattedError = handleError(error, {
                operation: '粘贴上传图片',
                fileType: file.type
              })
              showToast(`图片上传失败: ${formattedError.message}`, 'error')
              setStatus('就绪')
            }
            
            break
          }
        }
      })
      
      // 监听拖拽事件，处理图片拖拽上传
      domNode.addEventListener('dragover', (e) => {
        e.preventDefault()
        e.stopPropagation()
        // 添加拖拽悬停效果
        domNode.style.opacity = '0.7'
      })
      
      domNode.addEventListener('dragleave', (e) => {
        e.preventDefault()
        e.stopPropagation()
        // 移除拖拽悬停效果
        domNode.style.opacity = '1'
      })
      
      domNode.addEventListener('drop', async (e) => {
        e.preventDefault()
        e.stopPropagation()
        
        // 移除拖拽悬停效果
        domNode.style.opacity = '1'
        
        const files = e.dataTransfer?.files
        if (!files || files.length === 0) return
        
        // 过滤出图片文件
        const imageFiles = Array.from(files).filter(file => 
          file.type.startsWith('image/')
        )
        
        if (imageFiles.length === 0) {
          setStatus('请拖拽图片文件')
          setStatusType('error')
          setTimeout(() => {
            setStatus('就绪')
            setStatusType('normal')
          }, 2000)
          return
        }
        
        // 显示上传提示
        setStatus(`正在上传 ${imageFiles.length} 张图片...`)
        setStatusType('normal')
        
        try {
          // 上传图片
          const formData = new FormData()
          imageFiles.forEach(file => {
            formData.append('images', file)
          })
          
          const response = await fetch('/api/image/upload', {
            method: 'POST',
            body: formData
          })
          
          const result = await response.json()
          
          if (result.ok && result.images && result.images.length > 0) {
            // 生成 Markdown 图片链接
            const markdownImages = result.images.map(image => 
              `![${image.filename}](${image.url})`
            ).join('\n')
            
            // 获取鼠标位置对应的编辑器位置
            const position = editor.getTargetAtClientPoint(e.clientX, e.clientY)
            
            if (position) {
              // 在鼠标位置插入
              editor.executeEdits('drop-image', [{
                range: new monaco.Range(
                  position.position.lineNumber,
                  position.position.column,
                  position.position.lineNumber,
                  position.position.column
                ),
                text: markdownImages + '\n',
                forceMoveMarkers: true
              }])
            } else {
              // 如果无法获取位置，在当前光标位置插入
              const selection = editor.getSelection()
              editor.executeEdits('drop-image', [{
                range: selection,
                text: markdownImages + '\n',
                forceMoveMarkers: true
              }])
            }
            
            // 显示成功通知
            showToast(`成功上传 ${result.images.length} 张图片`, 'success')
            setStatus('就绪')
            setStatusType('normal')
          } else {
            const errorMsg = getUserFriendlyMessage(
              new Error(result.message || '上传失败'),
              { operation: '拖拽上传图片', fileCount: imageFiles.length }
            )
            showToast('图片上传失败', 'error')
            logError(new Error(result.message || '上传失败'), {
              operation: '拖拽上传图片',
              fileCount: imageFiles.length,
              responseData: result
            })
            setStatus('就绪')
            setStatusType('normal')
          }
        } catch (error) {
          const formattedError = handleError(error, {
            operation: '拖拽上传图片',
            fileCount: imageFiles.length,
            fileNames: imageFiles.map(f => f.name)
          })
          showToast(`图片上传失败: ${formattedError.message}`, 'error')
          setStatus('就绪')
          setStatusType('normal')
        }
      })
    }
    
    // 注册自定义 Markdown 折叠提供器
    monaco.languages.registerFoldingRangeProvider('markdown', {
      provideFoldingRanges: (model) => {
        const ranges = []
        const lines = model.getLinesContent()
        
        // 查找标题并计算折叠范围
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i]
          const headingMatch = line.match(/^(#{1,6})\s/)
          
          if (headingMatch) {
            const level = headingMatch[1].length
            let endLine = i
            
            // 找到下一个同级或更高级标题
            for (let j = i + 1; j < lines.length; j++) {
              const nextLine = lines[j]
              const nextMatch = nextLine.match(/^(#{1,6})\s/)
              
              if (nextMatch && nextMatch[1].length <= level) {
                endLine = j - 1
                break
              }
              endLine = j
            }
            
            // 只有当有内容可折叠时才添加折叠范围
            if (endLine > i) {
              ranges.push({
                start: i + 1,
                end: endLine + 1,
                kind: monaco.languages.FoldingRangeKind.Region
              })
            }
          }
        }
        
        return ranges
      }
    })
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
      if (currentPath) {
        // 清除自动保存定时器，避免冲突
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current)
          autoSaveTimerRef.current = null
        }
        const success = await saveFile(currentPath, content)
        if (success) {
          // 手动保存后创建历史版本（标记为手动保存）
          await saveFileHistory(currentPath, content, '', false).catch(err => {
            console.warn('保存历史版本失败:', err)
          })
        }
      }
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB, () => {
      handleToolbarInsert('**', '**', 'wrap')
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI, () => {
      handleToolbarInsert('*', '*', 'wrap')
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
      handleToolbarInsert('[', '](https://)', 'wrap')
    })

    // 搜索和替换快捷键
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      editor.trigger('keyboard', 'actions.find')
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH, () => {
      editor.trigger('keyboard', 'editor.action.startFindReplaceAction')
    })
  }

  // MenuBar 处理函数
  const handleMenuUndo = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'undo')
    }
  }

  const handleMenuRedo = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'redo')
    }
  }

  const handleMenuCopy = () => {
    if (editorRef.current) {
      editorRef.current.focus()
      editorRef.current.trigger('keyboard', 'editor.action.clipboardCopyAction')
    }
  }

  const handleMenuCut = () => {
    if (editorRef.current) {
      editorRef.current.focus()
      editorRef.current.trigger('keyboard', 'editor.action.clipboardCutAction')
    }
  }

  const handleMenuPaste = async () => {
    if (editorRef.current) {
      editorRef.current.focus()
      
      // 尝试使用浏览器剪贴板 API
      try {
        const text = await navigator.clipboard.readText()
        if (text) {
          const selection = editorRef.current.getSelection()
          editorRef.current.executeEdits('paste', [{
            range: selection,
            text: text,
            forceMoveMarkers: true
          }])
        }
      } catch (err) {
        // 如果剪贴板 API 失败，回退到 Monaco 的方法
        console.log('使用 Monaco Editor 粘贴方法')
        editorRef.current.trigger('keyboard', 'editor.action.clipboardPasteAction')
      }
    }
  }
  const handleMenuFormatDocument = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run()
    }
  }

  const handleMenuFind = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'actions.find')
    }
  }

  const handleMenuReplace = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'editor.action.startFindReplaceAction')
    }
  }

  const handleInsertCode = (type) => {
    if (!editorRef.current) return
    
    const templates = {
      'strikethrough': ['~~', '~~', 'wrap'],
      'ul': ['- ', '', 'line'],
      'ol': ['1. ', '', 'line'],
      'task': ['- [ ] ', '', 'line'],
      'quote': ['>  ', '', 'line'],
      'codeblock': ['```\n', '\n```', 'wrap'],
      'inline': ['`', '`', 'wrap'],
      'hr': ['\n---\n', '', 'insert'],
      'math': ['$$\n', '\n$$', 'wrap'],
      'mermaid': ['```mermaid\n', '\n```', 'wrap']
    }
    
    if (templates[type]) {
      handleToolbarInsert(...templates[type])
    }
  }

  // 视图菜单处理函数
  const handleToggleToolbar = () => {
    setShowToolbar(!showToolbar)
  }

  const handleZoomIn = () => {
    setEditorFontSize(prev => Math.min(prev + 2, 32))
  }

  const handleZoomOut = () => {
    setEditorFontSize(prev => Math.max(prev - 2, 10))
  }

  const handleZoomReset = () => {
    setEditorFontSize(14)
  }

  // 帮助菜单处理函数
  const handleShowMarkdownHelp = () => {
    setShowMarkdownHelp(true)
  }

  const handleShowShortcuts = () => {
    setShowShortcuts(true)
  }

  const handleShowAbout = () => {
    setShowAbout(true)
  }

  // 文件历史处理函数
  const handleShowHistory = () => {
    if (!currentPath) {
      setStatus('请先打开一个文件')
      setTimeout(() => setStatus('就绪'), 2000)
      return
    }
    setShowHistory(true)
  }

  const handleRestoreHistory = (historyContent) => {
    setContent(historyContent)
    setStatus('已恢复历史版本')
    setTimeout(() => setStatus('就绪'), 2000)
  }

  const handleDeleteHistory = (timestamp) => {
    if (currentPath) {
      deleteHistoryVersion(currentPath, timestamp)
      setStatus('已删除历史版本')
      setTimeout(() => setStatus('就绪'), 2000)
    }
  }

  // 最近文件处理函数
  const handleOpenRecentFile = (filePath) => {
    setCurrentPath(filePath)
    loadFile(filePath)
  }

  const handleClearRecentFiles = () => {
    clearRecentFiles()
    setRecentFiles([])
  }

  // 收藏夹处理函数
  const handleToggleFavorite = (path, type = 'file') => {
    const newState = toggleFavorite(path, type)
    setFavorites(getFavorites())
    return newState
  }

  const handleRemoveFavorite = (path) => {
    toggleFavorite(path)
    setFavorites(getFavorites())
  }

  const handleClearFavorites = () => {
    if (window.confirm('确定要清空收藏夹吗？')) {
      clearFavorites()
      setFavorites([])
    }
  }

  const handleReorderFavorites = (newFavorites) => {
    updateFavoritesOrder(newFavorites)
    setFavorites(newFavorites)
  }

  const handleOpenFavorite = async (path) => {
    // 从收藏夹列表中找到对应项
    const favoriteItem = favorites.find(item => item.path === path)
    
    if (favoriteItem) {
      if (favoriteItem.type === 'directory') {
        // 如果是文件夹，展开到该文件夹
        setCurrentPath(path)
        if (fileTreeRef.current && fileTreeRef.current.expandToPath) {
          await fileTreeRef.current.expandToPath(path)
        }
      } else {
        // 如果是文件，加载文件内容并展开到该文件
        setCurrentPath(path)
        if (fileTreeRef.current && fileTreeRef.current.expandToPath) {
          await fileTreeRef.current.expandToPath(path)
        }
        loadFile(path)
      }
    } else {
      // 如果找不到收藏项，尝试作为文件加载
      setCurrentPath(path)
      loadFile(path)
    }
  }


  return (
    <div className={`app theme-${editorTheme}`}>
      {showNewFileDialog && (
        <NewFileDialog
          onClose={() => setShowNewFileDialog(false)}
          onConfirm={handleNewFileConfirm}
          rootDirs={rootDirs}
          theme={editorTheme}
        />
      )}

      {showSaveAsDialog && (
        <SaveAsDialog
          onClose={() => setShowSaveAsDialog(false)}
          onConfirm={handleSaveAsConfirm}
          rootDirs={rootDirs}
          currentPath={currentPath}
          theme={editorTheme}
          initialFileName={initialFileName}
          isSaveAs={isSaveAsMode}
        />
      )}

      {showExportDialog && (
        <ExportDialog
          onClose={() => setShowExportDialog(false)}
          content={content}
          currentPath={currentPath}
          theme={editorTheme}
          previewHtml={previewRef.current?.innerHTML}
        />
      )}

      {showSettingsDialog && (
        <SettingsDialog
          onClose={() => setShowSettingsDialog(false)}
          theme={editorTheme}
          onThemeChange={toggleEditorTheme}
        />
      )}

      {showMarkdownHelp && (
        <MarkdownHelpDialog
          onClose={() => setShowMarkdownHelp(false)}
          theme={editorTheme}
        />
      )}

      {showShortcuts && (
        <ShortcutsDialog
          onClose={() => setShowShortcuts(false)}
          theme={editorTheme}
        />
      )}

      {showAbout && (
        <AboutDialog
          onClose={() => setShowAbout(false)}
          theme={editorTheme}
        />
      )}

      {showHistory && (
        <FileHistoryDialog
          filePath={currentPath}
          currentContent={content}
          history={getFileHistory(currentPath)}
          onRestore={handleRestoreHistory}
          onDelete={handleDeleteHistory}
          onClose={() => setShowHistory(false)}
          theme={editorTheme}
        />
      )}

      <header className="toolbar">
        <div className="toolbar-left">
          <button 
            className="btn-icon toggle-filetree-btn"
            onClick={() => setShowFileTree(!showFileTree)}
            title="切换文件树 (Ctrl+B)"
          >
            <FolderArchive />
          </button>
          <img src={markdownLogo} alt="Markdown" className="app-logo" />
          <MenuBar
            onNewFile={handleNewFile}
            onSave={handleSaveClick}
            onSaveAs={handleSaveAs}
            onExport={handleExport}
            onUndo={handleMenuUndo}
            onRedo={handleMenuRedo}
            onCopy={handleMenuCopy}
            onCut={handleMenuCut}
            onPaste={handleMenuPaste}
            onFormatDocument={handleMenuFormatDocument}
            onFind={handleMenuFind}
            onReplace={handleMenuReplace}
            onInsertHeading={(level) => handleToolbarInsert('#'.repeat(level) + ' ', '', 'heading')}
            onInsertBold={() => handleToolbarInsert('**', '**', 'wrap')}
            onInsertItalic={() => handleToolbarInsert('*', '*', 'wrap')}
            onInsertLink={() => handleToolbarInsert('[', '](https://)', 'wrap')}
            onInsertImage={() => setShowImageManager(true)}
            onInsertCode={handleInsertCode}
            onInsertTable={() => setShowTableDialog(true)}
            onOpenTableInsert={() => setShowTableDialog(true)}
            onToggleFileTree={() => setShowFileTree(!showFileTree)}
            onToggleTheme={toggleEditorTheme}
            onSettings={handleSettings}
            onToggleToolbar={handleToggleToolbar}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomReset={handleZoomReset}
            onLayoutChange={setLayout}
            onShowMarkdownHelp={handleShowMarkdownHelp}
            onShowShortcuts={handleShowShortcuts}
            onShowAbout={handleShowAbout}
            onShowHistory={handleShowHistory}
            recentFiles={recentFiles}
            onOpenRecentFile={handleOpenRecentFile}
            onClearRecentFiles={handleClearRecentFiles}
            disabled={!currentPath}
            theme={editorTheme}
          />
        
        </div>
        
        <div className="toolbar-right">

          <button className="btn-primary" onClick={handleSaveClick} disabled={false}>
            保存
          </button>
        </div>
      </header>

      <main className={`main-content layout-${layout} ${showFileTree ? 'with-filetree' : ''}`}>
        <div className="editor-preview-container">
          {showFileTree && (
            <>
              <FileTree 
                ref={fileTreeRef}
                onFileSelect={handleFileSelect} 
                currentPath={currentPath}
                favorites={favorites}
                onOpenFavorite={handleOpenFavorite}
                onRemoveFavorite={handleRemoveFavorite}
                onClearFavorites={handleClearFavorites}
                onReorderFavorites={handleReorderFavorites}
                content={content}
                onHeadingClick={handleHeadingClick}
                onVersionRestore={handleVersionRestore}
                style={{ width: `${fileTreeWidth}px`, flexShrink: 0 }}
                theme={editorTheme}
              />
              <Resizer direction="vertical" onResize={handleFileTreeResize} />
            </>
          )}
          <div className="editor-preview-wrapper">
            {showToolbar && (layout === 'vertical' || layout === 'editor-only') && (
              <EditorToolbar 
                onInsert={handleToolbarInsert}
                onImageUpload={handleImageUpload}
                onOpenImageManager={() => setShowImageManager(true)}
                onOpenTableInsert={() => setShowTableDialog(true)}
                disabled={false}
              />
            )}
            <div className="editor-preview-content">
              {(layout === 'vertical' || layout === 'editor-only') && (
            <>
              <div className="editor-pane" style={(layout === 'vertical') ? { width: `${editorWidth}%`, flexShrink: 0, flex: '1 1 auto', minHeight: 0 } : { flex: 1, minHeight: 0 }}>
              
              <Editor
                height="100%"
                defaultLanguage="markdown"
                theme={editorTheme === 'dark' ? 'vs-dark' : 'vs'}
                value={content}
                onChange={(value) => setContent(value || '')}
                onMount={handleEditorMount}
                options={{
                  fontSize: editorFontSize,
                  lineHeight: 24,
                  minimap: { enabled: false },
                  wordWrap: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontLigatures: true,
                  // 行号配置
                  lineNumbers: 'on',
                  lineNumbersMinChars: 2,
                  // 代码折叠配置
                  folding: true,
                  showFoldingControls: 'always',
                  foldingStrategy: 'auto',
                  foldingHighlight: true,
                  foldingMaximumRegions: 5000,
                  unfoldOnClickAfterEndOfLine: true,
                  // 滚动条配置
                  scrollbar: {
                    vertical: 'visible',
                    horizontal: 'visible',
                    useShadows: false,
                    verticalHasArrows: false,
                    horizontalHasArrows: false,
                    verticalScrollbarSize: 10,
                    horizontalScrollbarSize: 10
                  }
                }}
              />
            </div>
            {layout === 'vertical' && (
              <Resizer direction="vertical" onResize={handleEditorResize} />
            )}
          </>
        )}

        {(layout === 'vertical' || layout === 'preview-only') && (
          <div className="preview-pane" style={(layout === 'vertical') ? { flex: 1, minHeight: 0 } : { flex: 1, minHeight: 0 }}>
            <div 
              ref={previewRef}
              className="markdown-body"
            />
          </div>
        )}
            </div>
          </div>
        </div>

      </main>

      <footer className="statusbar">
        <div className="statusbar-left">
          <button 
            className="statusbar-btn" 
            onClick={toggleEditorTheme}
            title="主题 (Ctrl+T)"
          >
            {editorTheme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <span className={`status-text status-${statusType}`}>{status}</span>
        </div>
        <div className="statusbar-right">
          <span className="status-info">
            {content.length} 字符 · {content.split('\n').length} 行
          </span>
          <button 
            className="statusbar-btn" 
            onClick={() => {
              const layouts = ['vertical', 'editor-only', 'preview-only']
              const currentIndex = layouts.indexOf(layout)
              const nextIndex = (currentIndex + 1) % layouts.length
              setLayout(layouts[nextIndex])
            }}
            title="切换布局"
          >
            {layout === 'vertical' ? (
              <Columns size={16} />
            ) : layout === 'editor-only' ? (
              <FileText size={16} />
            ) : (
              <Eye size={16} />
            )}
          </button>
        </div>
      </footer>

      {showImageManager && (
        <ImageManagerDialog
          isOpen={showImageManager}
          onClose={() => setShowImageManager(false)}
          onInsertImage={handleImageInsert}
          theme={editorTheme}
          onNotify={(message, type) => {
            setStatus(message)
            setStatusType(type || 'normal')
            setTimeout(() => {
              setStatus('就绪')
              setStatusType('normal')
            }, 2000)
          }}
        />
      )}

      {showTableDialog && (
        <TableInsertDialog
          isOpen={showTableDialog}
          onClose={() => setShowTableDialog(false)}
          onInsert={insertTable}
          theme={editorTheme}
        />
      )}

      {/* Toast 通知容器 */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

export default App
