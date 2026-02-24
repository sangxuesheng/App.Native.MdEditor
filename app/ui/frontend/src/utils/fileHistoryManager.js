/**
 * 文件历史记录管理器
 * 负责保存和管理文件的编辑历史版本
 */

const STORAGE_KEY_PREFIX = 'md-editor-file-history-'
const MAX_HISTORY_PER_FILE = 10
const MAX_CONTENT_SIZE = 100 * 1024 // 100KB

/**
 * 获取文件的历史记录
 * @param {string} filePath - 文件路径
 * @returns {Array} 历史记录列表
 */
export function getFileHistory(filePath) {
  if (!filePath) return []
  
  try {
    const key = STORAGE_KEY_PREFIX + encodeURIComponent(filePath)
    const data = localStorage.getItem(key)
    if (!data) return []
    
    const history = JSON.parse(data)
    return Array.isArray(history) ? history : []
  } catch (error) {
    console.error('Failed to load file history:', error)
    return []
  }
}

/**
 * 保存文件历史版本
 * @param {string} filePath - 文件路径
 * @param {string} content - 文件内容
 * @returns {boolean} 是否保存成功
 */
export function saveFileHistory(filePath, content) {
  if (!filePath || content === undefined) return false
  
  // 内容过大时不保存
  if (content.length > MAX_CONTENT_SIZE) {
    console.warn('Content too large to save history:', content.length)
    return false
  }
  
  try {
    const key = STORAGE_KEY_PREFIX + encodeURIComponent(filePath)
    let history = getFileHistory(filePath)
    
    // 检查是否与最新版本相同
    if (history.length > 0 && history[0].content === content) {
      return false // 内容未变化，不保存
    }
    
    // 创建新的历史记录
    const newRecord = {
      content,
      timestamp: Date.now(),
      size: content.length,
      lines: content.split('\n').length
    }
    
    // 添加到历史记录开头
    history.unshift(newRecord)
    
    // 限制历史记录数量
    if (history.length > MAX_HISTORY_PER_FILE) {
      history = history.slice(0, MAX_HISTORY_PER_FILE)
    }
    
    localStorage.setItem(key, JSON.stringify(history))
    return true
  } catch (error) {
    console.error('Failed to save file history:', error)
    return false
  }
}

/**
 * 删除文件的历史记录
 * @param {string} filePath - 文件路径
 */
export function clearFileHistory(filePath) {
  if (!filePath) return
  
  try {
    const key = STORAGE_KEY_PREFIX + encodeURIComponent(filePath)
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Failed to clear file history:', error)
  }
}

/**
 * 删除指定的历史版本
 * @param {string} filePath - 文件路径
 * @param {number} timestamp - 版本时间戳
 */
export function deleteHistoryVersion(filePath, timestamp) {
  if (!filePath || !timestamp) return
  
  try {
    const key = STORAGE_KEY_PREFIX + encodeURIComponent(filePath)
    let history = getFileHistory(filePath)
    
    history = history.filter(record => record.timestamp !== timestamp)
    
    if (history.length > 0) {
      localStorage.setItem(key, JSON.stringify(history))
    } else {
      localStorage.removeItem(key)
    }
  } catch (error) {
    console.error('Failed to delete history version:', error)
  }
}

/**
 * 获取所有有历史记录的文件
 * @returns {Array} 文件路径列表
 */
export function getAllHistoryFiles() {
  const files = []
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        const filePath = decodeURIComponent(key.substring(STORAGE_KEY_PREFIX.length))
        files.push(filePath)
      }
    }
  } catch (error) {
    console.error('Failed to get history files:', error)
  }
  
  return files
}

/**
 * 清空所有历史记录
 */
export function clearAllHistory() {
  try {
    const keys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
        keys.push(key)
      }
    }
    
    keys.forEach(key => localStorage.removeItem(key))
  } catch (error) {
    console.error('Failed to clear all history:', error)
  }
}

/**
 * 格式化时间戳
 * @param {number} timestamp - 时间戳
 * @returns {string} 格式化的时间
 */
export function formatHistoryTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  // 今天
  if (date.toDateString() === now.toDateString()) {
    return `今天 ${hours}:${minutes}:${seconds}`
  }
  
  // 昨天
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) {
    return `昨天 ${hours}:${minutes}:${seconds}`
  }
  
  // 今年
  if (year === now.getFullYear()) {
    return `${month}-${day} ${hours}:${minutes}`
  }
  
  // 其他
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 格式化的大小
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * 计算两个文本的差异
 * @param {string} oldText - 旧文本
 * @param {string} newText - 新文本
 * @returns {Object} 差异统计
 */
export function calculateDiff(oldText, newText) {
  const oldLines = oldText.split('\n')
  const newLines = newText.split('\n')
  
  let added = 0
  let removed = 0
  let modified = 0
  
  const maxLen = Math.max(oldLines.length, newLines.length)
  
  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i]
    const newLine = newLines[i]
    
    if (oldLine === undefined) {
      added++
    } else if (newLine === undefined) {
      removed++
    } else if (oldLine !== newLine) {
      modified++
    }
  }
  
  return { added, removed, modified }
}

