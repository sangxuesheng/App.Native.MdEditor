/**
 * 草稿管理工具
 * 使用 localStorage 存储草稿数据
 */

const DRAFT_PREFIX = 'md-editor-draft:'
const DRAFT_INDEX_KEY = 'md-editor-drafts-index'

/**
 * 保存草稿
 * @param {string} filePath - 文件路径
 * @param {string} content - 内容
 */
export function saveDraft(filePath, content) {
  if (!filePath) return

  const key = DRAFT_PREFIX + filePath
  const draft = {
    filePath,
    content,
    timestamp: Date.now(),
    size: content.length
  }

  try {
    localStorage.setItem(key, JSON.stringify(draft))
    updateDraftIndex(filePath)
  } catch (error) {
    console.error('保存草稿失败:', error)
    // localStorage 可能已满，尝试清理旧草稿
    if (error.name === 'QuotaExceededError') {
      cleanOldDrafts(5) // 保留最近 5 个草稿
      try {
        localStorage.setItem(key, JSON.stringify(draft))
        updateDraftIndex(filePath)
      } catch (retryError) {
        console.error('重试保存草稿失败:', retryError)
      }
    }
  }
}

/**
 * 获取草稿
 * @param {string} filePath - 文件路径
 * @returns {Object|null} - 草稿对象或 null
 */
export function getDraft(filePath) {
  if (!filePath) return null

  const key = DRAFT_PREFIX + filePath
  try {
    const data = localStorage.getItem(key)
    if (!data) return null
    return JSON.parse(data)
  } catch (error) {
    console.error('读取草稿失败:', error)
    return null
  }
}

/**
 * 清除草稿
 * @param {string} filePath - 文件路径
 */
export function clearDraft(filePath) {
  if (!filePath) return

  const key = DRAFT_PREFIX + filePath
  try {
    localStorage.removeItem(key)
    removeDraftFromIndex(filePath)
  } catch (error) {
    console.error('清除草稿失败:', error)
  }
}

/**
 * 获取所有草稿列表
 * @returns {Array} - 草稿列表
 */
export function getAllDrafts() {
  try {
    const index = getDraftIndex()
    return index.map(filePath => getDraft(filePath)).filter(Boolean)
  } catch (error) {
    console.error('获取草稿列表失败:', error)
    return []
  }
}

/**
 * 清理所有草稿
 */
export function clearAllDrafts() {
  try {
    const index = getDraftIndex()
    index.forEach(filePath => {
      const key = DRAFT_PREFIX + filePath
      localStorage.removeItem(key)
    })
    localStorage.removeItem(DRAFT_INDEX_KEY)
  } catch (error) {
    console.error('清理所有草稿失败:', error)
  }
}

/**
 * 清理旧草稿（保留最近 N 个）
 * @param {number} keepCount - 保留数量
 */
export function cleanOldDrafts(keepCount = 10) {
  try {
    const drafts = getAllDrafts()
    // 按时间戳排序
    drafts.sort((a, b) => b.timestamp - a.timestamp)
    
    // 删除超出保留数量的草稿
    drafts.slice(keepCount).forEach(draft => {
      clearDraft(draft.filePath)
    })
  } catch (error) {
    console.error('清理旧草稿失败:', error)
  }
}

/**
 * 检查是否有草稿
 * @param {string} filePath - 文件路径
 * @param {string} currentContent - 当前内容
 * @returns {boolean} - 是否有不同的草稿
 */
export function hasDraft(filePath, currentContent = '') {
  const draft = getDraft(filePath)
  if (!draft) return false
  return draft.content !== currentContent
}

/**
 * 获取草稿索引
 * @returns {Array} - 文件路径数组
 */
function getDraftIndex() {
  try {
    const data = localStorage.getItem(DRAFT_INDEX_KEY)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('读取草稿索引失败:', error)
    return []
  }
}

/**
 * 更新草稿索引
 * @param {string} filePath - 文件路径
 */
function updateDraftIndex(filePath) {
  try {
    const index = getDraftIndex()
    if (!index.includes(filePath)) {
      index.push(filePath)
      localStorage.setItem(DRAFT_INDEX_KEY, JSON.stringify(index))
    }
  } catch (error) {
    console.error('更新草稿索引失败:', error)
  }
}

/**
 * 从索引中移除草稿
 * @param {string} filePath - 文件路径
 */
function removeDraftFromIndex(filePath) {
  try {
    const index = getDraftIndex()
    const newIndex = index.filter(path => path !== filePath)
    localStorage.setItem(DRAFT_INDEX_KEY, JSON.stringify(newIndex))
  } catch (error) {
    console.error('移除草稿索引失败:', error)
  }
}

/**
 * 格式化时间差
 * @param {number} timestamp - 时间戳
 * @returns {string} - 格式化的时间差
 */
export function formatTimeSince(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  
  if (seconds < 60) return '刚刚'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} 分钟前`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} 小时前`
  return `${Math.floor(seconds / 86400)} 天前`
}

