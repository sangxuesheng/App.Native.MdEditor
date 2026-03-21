// 全局快捷键处理 - 添加到 App.jsx 中的 useEffect 部分

// 在 "加载根目录列表" 的 useEffect 之后添加以下代码：

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
}, [handleNewFile, handleSaveAs, toggleEditorTheme, handleMenuFormatDocument, handleToolbarInsert, setShowFileTree])
