import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import Editor from '@monaco-editor/react'
import MarkdownIt from 'markdown-it'
import taskLists from 'markdown-it-task-lists'
import footnote from 'markdown-it-footnote'
import katex from 'markdown-it-katex'
import 'github-markdown-css/github-markdown-dark.css'
import 'github-markdown-css/github-markdown-light.css'
import FileTree from './components/FileTree'
import markdownLogo from './assets/markdown.svg'
import DraftRecoveryDialog from './components/DraftRecoveryDialog'
import EditorToolbar from './components/EditorToolbar'
import MenuBar from './components/MenuBar'
import NewFileDialog from './components/NewFileDialog'
import SaveAsDialog from './components/SaveAsDialog'
import ExportDialog from './components/ExportDialog'
import SettingsDialog from './components/SettingsDialog'
import MarkdownHelpDialog from './components/MarkdownHelpDialog'
import ShortcutsDialog from './components/ShortcutsDialog'
import AboutDialog from './components/AboutDialog'
import { useAutoSave } from './hooks/useAutoSave'
import { getDraft, clearDraft, hasDraft } from './utils/draftManager'
import './App.css'
import { getRecentFiles, addRecentFile, clearRecentFiles } from './utils/recentFilesManager'

import { getFavorites, toggleFavorite, clearFavorites, updateFavoritesOrder } from './utils/favoritesManager'
// 初始化 Markdown 渲染器
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
})
  .use(taskLists, { enabled: true })
  .use(footnote)
  .use(katex)

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
  const [content, setContent] = useState('')
  const [currentPath, setCurrentPath] = useState('')
  const [status, setStatus] = useState('就绪')
  const [editorTheme, setEditorTheme] = useState('light')
  const [layout, setLayout] = useState('vertical')
  const [showFileTree, setShowFileTree] = useState(true)
  const [showDraftDialog, setShowDraftDialog] = useState(false)
  const [showNewFileDialog, setShowNewFileDialog] = useState(false)
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false)
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showToolbar, setShowToolbar] = useState(true)
  const [editorFontSize, setEditorFontSize] = useState(14)
  const [recentFiles, setRecentFiles] = useState([])
  const [favorites, setFavorites] = useState([])
  const [pendingDraft, setPendingDraft] = useState(null)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const [rootDirs, setRootDirs] = useState([])
  const [mermaidLoaded, setMermaidLoaded] = useState(false)
  const previewRef = useRef(null)
  const editorRef = useRef(null)
  const fileTreeRef = useRef(null)

  const toggleEditorTheme = async () => {
    // 三个主题循环切换: light -> vs-dark -> md3 -> light
    let newTheme = 'light'
    if (editorTheme === 'light') {
      newTheme = 'vs-dark'
    } else if (editorTheme === 'vs-dark') {
      newTheme = 'md3'
    } else {
      newTheme = 'light'
    }
    setEditorTheme(newTheme)
    
    // 如果 Mermaid 已加载，更新主题
    if (mermaidLoaded && mermaidModule) {
      let mermaidTheme = 'default'
      if (newTheme === 'vs-dark') {
        mermaidTheme = 'dark'
      } else if (newTheme === 'md3') {
        mermaidTheme = 'default'
      }
      mermaidModule.initialize({ 
        startOnLoad: false,
        theme: mermaidTheme,
        securityLevel: 'loose'
      })
      setTimeout(() => renderMarkdown(), 100)
    }
  }

  const saveFile = async (path = currentPath) => {
    if (!path) {
      setStatus('未指定文件路径，无法保存')
      return false
    }

    try {
      setStatus('保存中...')
      const response = await fetch('/api/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, content })
      })
      const data = await response.json()
      
      if (data.ok) {
        // 保存历史记录
        saveFileHistory(path, content)
        
        setStatus(`已保存: ${path}`)
        setTimeout(() => setStatus('就绪'), 2000)
        return true
      } else {
        setStatus(`保存失败: ${data.message || data.code}`)
        return false
      }
    } catch (error) {
      setStatus('保存失败: 网络错误')
      console.error('Save file error:', error)
      return false
    }
  }

  const autoSave = useAutoSave(content, currentPath, saveFile, {
    interval: 30000,
    enabled: autoSaveEnabled && !!currentPath,
    onAutoSaveSuccess: (message) => {
      setStatus(message)
      setTimeout(() => setStatus('就绪'), 2000)
    },
    onAutoSaveError: (error) => {
      console.error('自动保存失败:', error)
    }
  })

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const path = params.get('path')
    if (path) {
      setCurrentPath(path)
      loadFile(path)
    } else {
      setContent(`# 欢迎使用 Markdown 编辑器

这是一个功能强大的 Markdown 编辑器，支持：

## 核心功能
- ✅ 实时预览
- ✅ 语法高亮
- ✅ GFM 支持（表格、任务列表等）
- ✅ LaTeX 数学公式
- ✅ Mermaid 流程图
- ✅ 多种布局模式
- ✅ 新建文件（支持模板）
- ✅ 另存为
- ✅ 导出功能（HTML/PDF/TXT）

## 快捷键
- \`Ctrl/Cmd + S\`: 保存文件
- \`Ctrl/Cmd + B\`: 加粗
- \`Ctrl/Cmd + I\`: 斜体
- \`Ctrl/Cmd + K\`: 插入链接

## 开始使用

点击工具栏的"新建"按钮创建新文件，或从左侧文件树打开现有文件。

开始编辑吧！`)
    }
  }, [])

  const loadFile = async (path) => {
    try {
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
        
        if (hasDraft(path, fileContent)) {
          const draft = getDraft(path)
          setPendingDraft(draft)
          setShowDraftDialog(true)
          setContent(fileContent)
        } else {
          setContent(fileContent)
          autoSave.reset()
        }
        
        setStatus(`已加载: ${path}`)
      } else {
        setStatus(`加载失败: ${data.message || data.code}`)
      }
    } catch (error) {
      setStatus('加载失败: 网络错误')
      console.error('Load file error:', error)
    }
  }

  const handleFileSelect = (filePath) => {
    setCurrentPath(filePath)
    loadFile(filePath)
  }

  const handleRecoverDraft = () => {
    if (pendingDraft) {
      setContent(pendingDraft.content)
      autoSave.reset()
      setStatus('已恢复草稿')
      setTimeout(() => setStatus('就绪'), 2000)
    }
    setShowDraftDialog(false)
    setPendingDraft(null)
  }

  const handleDiscardDraft = () => {
    if (pendingDraft) {
      clearDraft(pendingDraft.filePath)
      setStatus('已丢弃草稿')
      setTimeout(() => setStatus('就绪'), 2000)
    }
    setShowDraftDialog(false)
    setPendingDraft(null)
  }

  const handleNewFile = () => {
    setShowNewFileDialog(true)
  }

  const handleNewFileConfirm = async (filePath, fileContent) => {
    setCurrentPath(filePath)
    setContent(fileContent)
    autoSave.reset()
    setStatus(`已创建: ${filePath}`)
    
    // 刷新文件树（刷新父目录）
    if (fileTreeRef.current && fileTreeRef.current.refreshDirectory) {
      const parentPath = filePath.split('/').slice(0, -1).join('/') || '/'
      await fileTreeRef.current.refreshDirectory(parentPath)
    }
    
    setTimeout(() => setStatus('就绪'), 2000)
  }

  const handleSaveAs = () => {
    setShowSaveAsDialog(true)
  }

  const handleSaveAsConfirm = async (newPath) => {
    const success = await saveFile(newPath)
    if (success) {
      setCurrentPath(newPath)
      autoSave.reset()
    }
  }

  const handleExport = () => {
    setShowExportDialog(true)
  }

  const handleSettings = () => {
    setShowSettingsDialog(true)
  }

  const renderMarkdown = useCallback(async () => {
    if (!previewRef.current) return

    let html = md.render(content)
    
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
    
    // 一次性替换所有 Mermaid 代码块，使用 HTML 中的代码内容
    let blockIndex = 0
    html = html.replace(
      /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g,
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
            node.innerHTML = `<pre style="color: red;">Mermaid 渲染失败: ${err.message}</pre>`
          }
        }
        
        console.log('Mermaid rendering completed')
        
        if (!mermaidLoaded) {
          setStatus('就绪')
        }
      } catch (err) {
        console.error('Mermaid render error:', err)
        setStatus('Mermaid 渲染失败')
        setTimeout(() => setStatus('就绪'), 2000)
      }
    }
  }, [content, mermaidLoaded])

  useEffect(() => {
    renderMarkdown()
  }, [renderMarkdown])

  useEffect(() => {
    if (layout === 'preview-only' || layout === 'horizontal' || layout === 'vertical') {
      const timer = setTimeout(() => {
        renderMarkdown()
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [layout, renderMarkdown])

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

  const handleEditorMount = (editor) => {
    editorRef.current = editor
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      autoSave.manualSave()
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
      editorRef.current.trigger('keyboard', 'editor.action.clipboardCopyAction')
    }
  }

  const handleMenuPaste = () => {
    if (editorRef.current) {
      editorRef.current.trigger('keyboard', 'editor.action.clipboardPasteAction')
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

  const handleOpenFavorite = (path) => {
    setCurrentPath(path)
    loadFile(path)
  }


  return (
    <div className={`app ${editorTheme === 'light' ? 'theme-light' : editorTheme === 'md3' ? 'theme-md3' : 'theme-dark'}`}>
      {showDraftDialog && (
        <DraftRecoveryDialog
          draft={pendingDraft}
          onRecover={handleRecoverDraft}
          onDiscard={handleDiscardDraft}
          onClose={() => setShowDraftDialog(false)}
        />
      )}

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
          autoSaveEnabled={autoSaveEnabled}
          onAutoSaveChange={setAutoSaveEnabled}
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
          <img src={markdownLogo} alt="Markdown" className="app-logo" />
          <MenuBar
            onNewFile={handleNewFile}
            onSave={() => autoSave.manualSave()}
            onSaveAs={handleSaveAs}
            onExport={(format) => {
              if (format === 'copy') {
                handleMenuCopy()
              } else {
                setShowExportDialog(true)
              }
            }}
            onUndo={handleMenuUndo}
            onRedo={handleMenuRedo}
            onCopy={handleMenuCopy}
            onPaste={handleMenuPaste}
            onFormatDocument={handleMenuFormatDocument}
            onFind={handleMenuFind}
            onReplace={handleMenuReplace}
            onInsertHeading={(level) => handleToolbarInsert('#'.repeat(level) + ' ', '', 'heading')}
            onInsertBold={() => handleToolbarInsert('**', '**', 'wrap')}
            onInsertItalic={() => handleToolbarInsert('*', '*', 'wrap')}
            onInsertLink={() => handleToolbarInsert('[', '](https://)', 'wrap')}
            onInsertImage={() => handleToolbarInsert('![', '](https://)', 'wrap')}
            onInsertCode={handleInsertCode}
            onInsertTable={() => handleToolbarInsert("\n| 列1 | 列2 |\n|-----|-----|\n| 内容 | 内容 |\n", "", "insert")}
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
          {currentPath && <span className="file-path">{currentPath}</span>}
        </div>
        
        <div className="toolbar-right">
          <button 
            className={`btn-icon ${autoSaveEnabled ? 'active' : ''}`}
            onClick={() => setAutoSaveEnabled(!autoSaveEnabled)} 
            title={autoSaveEnabled ? '自动保存: 开启' : '自动保存: 关闭'}
          >
            {autoSaveEnabled ? '自动' : '手动'}
          </button>
          {autoSave.hasChanges && <span className="unsaved-indicator" title="有未保存的更改">●</span>}
          <button className="btn-primary" onClick={() => autoSave.manualSave()} disabled={!currentPath}>
            保存
          </button>
        </div>
      </header>

      <main className={`main-content layout-${layout} ${showFileTree ? 'with-filetree' : ''}`}>
        {showFileTree && (
          <FileTree 
            ref={fileTreeRef}
            onFileSelect={handleFileSelect} 
            currentPath={currentPath}
            favorites={favorites}
            onOpenFavorite={handleOpenFavorite}
            onRemoveFavorite={handleRemoveFavorite}
            onClearFavorites={handleClearFavorites}
            onReorderFavorites={handleReorderFavorites}
          />
        )}
        {(layout === 'horizontal' || layout === 'vertical' || layout === 'editor-only') && (
          <div className="editor-pane">
            {showToolbar && (
              <EditorToolbar 
                onInsert={handleToolbarInsert} 
                disabled={!editorRef.current}
              />
            )}
            <Editor
              height="100%"
              defaultLanguage="markdown"
              theme={editorTheme}
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
                fontLigatures: true
              }}
            />
          </div>
        )}

        {(layout === 'horizontal' || layout === 'vertical' || layout === 'preview-only') && (
          <div className="preview-pane">
            <div 
              ref={previewRef}
              className="markdown-body"
            />
          </div>
        )}
      </main>

      <footer className="statusbar">
        <div className="statusbar-left">
          <button 
            className="statusbar-btn" 
            onClick={toggleEditorTheme}
            title="切换主题 (Ctrl+T)"
          >
            {editorTheme === 'light' ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
              </svg>
            ) : editorTheme === 'md3' ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445z"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278z"/>
              </svg>
            )}
          </button>
          <span className="status-text">{status}</span>
        </div>
        <div className="statusbar-right">
          <span className="status-info">
            {content.length} 字符 · {content.split('\n').length} 行
            {autoSave.hasChanges && ' · 未保存'}
          </span>
          <button 
            className="statusbar-btn" 
            onClick={() => {
              const layouts = ['vertical', 'horizontal', 'editor-only', 'preview-only']
              const currentIndex = layouts.indexOf(layout)
              const nextIndex = (currentIndex + 1) % layouts.length
              setLayout(layouts[nextIndex])
            }}
            title="切换布局"
          >
            {layout === 'vertical' ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z"/>
              </svg>
            ) : layout === 'horizontal' ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h11A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-11A1.5 1.5 0 0 1 1 5.5v-3zm0 8A1.5 1.5 0 0 1 2.5 9h11a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 13.5v-3z"/>
              </svg>
            ) : layout === 'editor-only' ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/>
                <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
              </svg>
            )}
          </button>
        </div>
      </footer>
    </div>
  )
}

export default App
