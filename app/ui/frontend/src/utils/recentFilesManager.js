/**
 * 最近文件管理器
 * 负责记录和管理最近打开的文件列表
 */

const STORAGE_KEY = 'md-editor-recent-files'
const MAX_RECENT_FILES = 20

/**
 * 获取最近文件列表
 * @returns {Array} 最近文件列表
 */
export function getRecentFiles() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    
    const files = JSON.parse(data)
    return Array.isArray(files) ? files : []
  } catch (error) {
    console.error('Failed to load recent files:', error)
    return []
  }
}

/**
 * 添加文件到最近列表
 * @param {string} filePath - 文件路径
 */
export function addRecentFile(filePath) {
  if (!filePath) return
  
  try {
    let files = getRecentFiles()
    
    // 移除已存在的相同路径
    files = files.filter(item => item.path !== filePath)
    
    // 添加到列表开头
    files.unshift({
      path: filePath,
      timestamp: Date.now(),
      name: getFileName(filePath)
    })
    
    // 限制列表长度
    if (files.length > MAX_RECENT_FILES) {
      files = files.slice(0, MAX_RECENT_FILES)
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files))
  } catch (error) {
    console.error('Failed to add recent file:', error)
  }
}

/**
 * 从最近列表中移除文件
 * @param {string} filePath - 文件路径
 */
export function removeRecentFile(filePath) {
  try {
    let files = getRecentFiles()
    files = files.filter(item => item.path !== filePath)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files))
  } catch (error) {
    console.error('Failed to remove recent file:', error)
  }
}

/**
 * 清空最近文件列表
 */
export function clearRecentFiles() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear recent files:', error)
  }
}

/**
 * 检查文件是否在最近列表中
 * @param {string} filePath - 文件路径
 * @returns {boolean}
 */
export function isRecentFile(filePath) {
  const files = getRecentFiles()
  return files.some(item => item.path === filePath)
}

/**
 * 从路径中提取文件名
 * @param {string} filePath - 文件路径
 * @returns {string}
 */
function getFileName(filePath) {
  if (!filePath) return ''
  const parts = filePath.split('/')
  return parts[parts.length - 1] || filePath
}

/**
 * 格式化时间戳为相对时间
 * @param {number} timestamp - 时间戳
 * @returns {string}
 */
export function formatRelativeTime(timestamp) {
  const now = Date.now()
  const diff = now - timestamp
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}

