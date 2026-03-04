/**
 * 收藏夹管理器
 * 负责管理用户收藏的文件和文件夹
 */

const STORAGE_KEY = 'md-editor-favorites'
const MAX_FAVORITES = 50

/**
 * 获取收藏夹列表
 * @returns {Array} 收藏项列表
 */
export function getFavorites() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    
    const favorites = JSON.parse(data)
    return Array.isArray(favorites) ? favorites : []
  } catch (error) {
    console.error('Failed to load favorites:', error)
    return []
  }
}

/**
 * 添加到收藏夹
 * @param {string} path - 文件或文件夹路径
 * @param {string} type - 类型: 'file' 或 'directory'
 * @returns {boolean} 是否添加成功
 */
export function addFavorite(path, type = 'file') {
  if (!path) return false
  
  try {
    let favorites = getFavorites()
    
    // 检查是否已存在
    if (favorites.some(item => item.path === path)) {
      return false
    }
    
    // 添加到列表
    favorites.push({
      path,
      type,
      name: getFileName(path),
      timestamp: Date.now(),
      order: favorites.length
    })
    
    // 限制数量
    if (favorites.length > MAX_FAVORITES) {
      favorites = favorites.slice(0, MAX_FAVORITES)
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    return true
  } catch (error) {
    console.error('Failed to add favorite:', error)
    return false
  }
}

/**
 * 从收藏夹移除
 * @param {string} path - 文件或文件夹路径
 * @returns {boolean} 是否移除成功
 */
export function removeFavorite(path) {
  try {
    let favorites = getFavorites()
    const originalLength = favorites.length
    
    favorites = favorites.filter(item => item.path !== path)
    
    // 重新排序
    favorites.forEach((item, index) => {
      item.order = index
    })
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    return favorites.length < originalLength
  } catch (error) {
    console.error('Failed to remove favorite:', error)
    return false
  }
}

/**
 * 检查是否已收藏
 * @param {string} path - 文件或文件夹路径
 * @returns {boolean}
 */
export function isFavorite(path) {
  const favorites = getFavorites()
  return favorites.some(item => item.path === path)
}

/**
 * 切换收藏状态
 * @param {string} path - 文件或文件夹路径
 * @param {string} type - 类型: 'file' 或 'directory'
 * @returns {boolean} 新的收藏状态
 */
export function toggleFavorite(path, type = 'file') {
  if (isFavorite(path)) {
    removeFavorite(path)
    return false
  } else {
    addFavorite(path, type)
    return true
  }
}

/**
 * 更新收藏项顺序
 * @param {Array} favorites - 新的收藏列表（已排序）
 */
export function updateFavoritesOrder(favorites) {
  try {
    // 更新 order 字段
    favorites.forEach((item, index) => {
      item.order = index
    })
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    return true
  } catch (error) {
    console.error('Failed to update favorites order:', error)
    return false
  }
}

/**
 * 清空收藏夹
 */
export function clearFavorites() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch (error) {
    console.error('Failed to clear favorites:', error)
    return false
  }
}

/**
 * 更新收藏项的路径（用于文件重命名）
 * @param {string} oldPath - 旧路径
 * @param {string} newPath - 新路径
 * @returns {boolean} 是否更新成功
 */
export function updateFavoritePath(oldPath, newPath) {
  try {
    const favorites = getFavorites()
    const index = favorites.findIndex(item => item.path === oldPath)
    
    if (index === -1) {
      return false // 不在收藏夹中
    }
    
    // 更新路径和名称
    favorites[index].path = newPath
    favorites[index].name = getFileName(newPath)
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    return true
  } catch (error) {
    console.error('Failed to update favorite path:', error)
    return false
  }
}

/**
 * 从路径中提取文件名
 * @param {string} path - 文件路径
 * @returns {string}
 */
function getFileName(path) {
  if (!path) return ''
  const parts = path.split('/')
  return parts[parts.length - 1] || path
}

/**
 * 获取收藏项的图标类型
 * @param {string} type - 类型: 'file' 或 'directory'
 * @param {string} path - 文件路径
 * @returns {string} 图标类型标识
 */
export function getFavoriteIcon(type, path) {
  if (type === 'directory') {
    return 'folder'
  }
  
  // 根据文件扩展名返回不同图标类型
  if (path.endsWith('.md')) return 'markdown'
  if (path.endsWith('.txt')) return 'text'
  if (path.endsWith('.json')) return 'json'
  
  return 'file'
}
