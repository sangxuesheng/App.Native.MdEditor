/**
 * 本地持久化工具
 * 用于保存和恢复编辑器状态到 localStorage
 */

const STORAGE_KEYS = {
  CONTENT: 'md-editor-content',
  CURRENT_PATH: 'md-editor-current-path',
  EDITOR_WIDTH: 'md-editor-editor-width',
  FILETREE_WIDTH: 'md-editor-filetree-width',
  THEME: 'md-editor-theme',
  LAYOUT: 'md-editor-layout',
  SHOW_FILETREE: 'md-editor-show-filetree',
  SHOW_TOOLBAR: 'md-editor-show-toolbar',
  FONT_SIZE: 'md-editor-font-size',
  LAST_SAVE_TIME: 'md-editor-last-save-time',
  CURSOR_POSITION: 'md-editor-cursor-position',
  SCROLL_POSITION: 'md-editor-scroll-position'
}

/**
 * 保存编辑器内容
 */
export const saveContent = (content) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CONTENT, content)
    localStorage.setItem(STORAGE_KEYS.LAST_SAVE_TIME, Date.now().toString())
    return true
  } catch (error) {
    console.error('Failed to save content:', error)
    return false
  }
}

/**
 * 获取保存的内容
 */
export const getContent = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.CONTENT) || ''
  } catch (error) {
    console.error('Failed to get content:', error)
    return ''
  }
}

/**
 * 保存当前文件路径
 */
export const saveCurrentPath = (path) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_PATH, path)
    return true
  } catch (error) {
    console.error('Failed to save current path:', error)
    return false
  }
}

/**
 * 获取当前文件路径
 */
export const getCurrentPath = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_PATH) || ''
  } catch (error) {
    console.error('Failed to get current path:', error)
    return ''
  }
}

/**
 * 保存编辑器宽度
 */
export const saveEditorWidth = (width) => {
  try {
    localStorage.setItem(STORAGE_KEYS.EDITOR_WIDTH, width.toString())
    return true
  } catch (error) {
    console.error('Failed to save editor width:', error)
    return false
  }
}

/**
 * 获取编辑器宽度
 */
export const getEditorWidth = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.EDITOR_WIDTH)
    return saved ? parseInt(saved) : 50
  } catch (error) {
    console.error('Failed to get editor width:', error)
    return 50
  }
}

/**
 * 保存文件树宽度
 */
export const saveFileTreeWidth = (width) => {
  try {
    localStorage.setItem(STORAGE_KEYS.FILETREE_WIDTH, width.toString())
    return true
  } catch (error) {
    console.error('Failed to save filetree width:', error)
    return false
  }
}

/**
 * 获取文件树宽度
 */
export const getFileTreeWidth = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.FILETREE_WIDTH)
    return saved ? parseInt(saved) : 280
  } catch (error) {
    console.error('Failed to get filetree width:', error)
    return 280
  }
}

/**
 * 保存主题
 */
export const saveTheme = (theme) => {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme)
    return true
  } catch (error) {
    console.error('Failed to save theme:', error)
    return false
  }
}

/**
 * 获取主题
 */
export const getTheme = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'light'
  } catch (error) {
    console.error('Failed to get theme:', error)
    return 'light'
  }
}

/**
 * 保存布局
 */
export const saveLayout = (layout) => {
  try {
    localStorage.setItem(STORAGE_KEYS.LAYOUT, layout)
    return true
  } catch (error) {
    console.error('Failed to save layout:', error)
    return false
  }
}

/**
 * 获取布局
 */
export const getLayout = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.LAYOUT) || 'vertical'
  } catch (error) {
    console.error('Failed to get layout:', error)
    return 'vertical'
  }
}

/**
 * 保存文件树显示状态
 */
export const saveShowFileTree = (show) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SHOW_FILETREE, show.toString())
    return true
  } catch (error) {
    console.error('Failed to save show filetree:', error)
    return false
  }
}

/**
 * 获取文件树显示状态
 */
export const getShowFileTree = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SHOW_FILETREE)
    return saved === 'true'
  } catch (error) {
    console.error('Failed to get show filetree:', error)
    return false
  }
}

/**
 * 保存工具栏显示状态
 */
export const saveShowToolbar = (show) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SHOW_TOOLBAR, show.toString())
    return true
  } catch (error) {
    console.error('Failed to save show toolbar:', error)
    return false
  }
}

/**
 * 获取工具栏显示状态
 */
export const getShowToolbar = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SHOW_TOOLBAR)
    return saved !== 'false' // 默认显示
  } catch (error) {
    console.error('Failed to get show toolbar:', error)
    return true
  }
}

/**
 * 保存字体大小
 */
export const saveFontSize = (size) => {
  try {
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, size.toString())
    return true
  } catch (error) {
    console.error('Failed to save font size:', error)
    return false
  }
}

/**
 * 获取字体大小
 */
export const getFontSize = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.FONT_SIZE)
    return saved ? parseInt(saved) : 14
  } catch (error) {
    console.error('Failed to get font size:', error)
    return 14
  }
}

/**
 * 保存光标位置
 */
export const saveCursorPosition = (position) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURSOR_POSITION, JSON.stringify(position))
    return true
  } catch (error) {
    console.error('Failed to save cursor position:', error)
    return false
  }
}

/**
 * 获取光标位置
 */
export const getCursorPosition = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.CURSOR_POSITION)
    return saved ? JSON.parse(saved) : null
  } catch (error) {
    console.error('Failed to get cursor position:', error)
    return null
  }
}

/**
 * 保存滚动位置
 */
export const saveScrollPosition = (position) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SCROLL_POSITION, JSON.stringify(position))
    return true
  } catch (error) {
    console.error('Failed to save scroll position:', error)
    return false
  }
}

/**
 * 获取滚动位置
 */
export const getScrollPosition = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SCROLL_POSITION)
    return saved ? JSON.parse(saved) : null
  } catch (error) {
    console.error('Failed to get scroll position:', error)
    return null
  }
}

/**
 * 获取最后保存时间
 */
export const getLastSaveTime = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.LAST_SAVE_TIME)
    return saved ? parseInt(saved) : null
  } catch (error) {
    console.error('Failed to get last save time:', error)
    return null
  }
}

/**
 * 清除所有保存的内容（但保留布局设置）
 */
export const clearContent = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CONTENT)
    localStorage.removeItem(STORAGE_KEYS.CURRENT_PATH)
    localStorage.removeItem(STORAGE_KEYS.LAST_SAVE_TIME)
    localStorage.removeItem(STORAGE_KEYS.CURSOR_POSITION)
    localStorage.removeItem(STORAGE_KEYS.SCROLL_POSITION)
    return true
  } catch (error) {
    console.error('Failed to clear content:', error)
    return false
  }
}

/**
 * 检查是否有保存的内容
 */
export const hasContent = () => {
  try {
    const content = localStorage.getItem(STORAGE_KEYS.CONTENT)
    return content && content.length > 0
  } catch (error) {
    console.error('Failed to check content:', error)
    return false
  }
}

/**
 * 保存完整状态
 */
export const saveFullState = (state) => {
  try {
    if (state.content !== undefined) saveContent(state.content)
    if (state.currentPath !== undefined) saveCurrentPath(state.currentPath)
    if (state.editorWidth !== undefined) saveEditorWidth(state.editorWidth)
    if (state.fileTreeWidth !== undefined) saveFileTreeWidth(state.fileTreeWidth)
    if (state.theme !== undefined) saveTheme(state.theme)
    if (state.layout !== undefined) saveLayout(state.layout)
    if (state.showFileTree !== undefined) saveShowFileTree(state.showFileTree)
    if (state.showToolbar !== undefined) saveShowToolbar(state.showToolbar)
    if (state.fontSize !== undefined) saveFontSize(state.fontSize)
    if (state.cursorPosition !== undefined) saveCursorPosition(state.cursorPosition)
    if (state.scrollPosition !== undefined) saveScrollPosition(state.scrollPosition)
    return true
  } catch (error) {
    console.error('Failed to save full state:', error)
    return false
  }
}

/**
 * 恢复完整状态
 */
export const restoreFullState = () => {
  try {
    return {
      content: getContent(),
      currentPath: getCurrentPath(),
      editorWidth: getEditorWidth(),
      fileTreeWidth: getFileTreeWidth(),
      theme: getTheme(),
      layout: getLayout(),
      showFileTree: getShowFileTree(),
      showToolbar: getShowToolbar(),
      fontSize: getFontSize(),
      cursorPosition: getCursorPosition(),
      scrollPosition: getScrollPosition(),
      lastSaveTime: getLastSaveTime()
    }
  } catch (error) {
    console.error('Failed to restore full state:', error)
    return null
  }
}
