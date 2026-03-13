// AI 会话存储工具
const STORAGE_KEY_PREFIX = 'ai_'
const CONVERSATIONS_KEY = `${STORAGE_KEY_PREFIX}conversations`
const CONFIG_KEY = `${STORAGE_KEY_PREFIX}config`
const CURRENT_CONVERSATION_KEY = `${STORAGE_KEY_PREFIX}current`

export const aiStorage = {
  // 保存配置
  saveConfig(config) {
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
      return true
    } catch (error) {
      console.error('保存 AI 配置失败:', error)
      return false
    }
  },

  // 加载配置
  loadConfig() {
    try {
      const saved = localStorage.getItem(CONFIG_KEY)
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error('加载 AI 配置失败:', error)
      return null
    }
  },

  // 保存当前会话
  saveCurrentConversation(messages) {
    try {
      localStorage.setItem(CURRENT_CONVERSATION_KEY, JSON.stringify(messages))
      return true
    } catch (error) {
      console.error('保存当前会话失败:', error)
      return false
    }
  },

  // 加载当前会话
  loadCurrentConversation() {
    try {
      const saved = localStorage.getItem(CURRENT_CONVERSATION_KEY)
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error('加载当前会话失败:', error)
      return []
    }
  },

  // 保存会话到历史
  saveConversation(id, messages, title) {
    try {
      const conversations = this.loadAllConversations()
      conversations[id] = {
        id,
        messages,
        title: title || messages[0]?.content?.slice(0, 30) || '新对话',
        timestamp: Date.now(),
      }
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations))
      return true
    } catch (error) {
      console.error('保存会话失败:', error)
      return false
    }
  },

  // 加载所有会话
  loadAllConversations() {
    try {
      const saved = localStorage.getItem(CONVERSATIONS_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch (error) {
      console.error('加载会话列表失败:', error)
      return {}
    }
  },

  // 加载单个会话
  loadConversation(id) {
    try {
      const conversations = this.loadAllConversations()
      return conversations[id] || null
    } catch (error) {
      console.error('加载会话失败:', error)
      return null
    }
  },

  // 删除会话
  deleteConversation(id) {
    try {
      const conversations = this.loadAllConversations()
      delete conversations[id]
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations))
      return true
    } catch (error) {
      console.error('删除会话失败:', error)
      return false
    }
  },

  // 清空所有会话
  clearAllConversations() {
    try {
      localStorage.removeItem(CONVERSATIONS_KEY)
      localStorage.removeItem(CURRENT_CONVERSATION_KEY)
      return true
    } catch (error) {
      console.error('清空会话失败:', error)
      return false
    }
  },

  // 生成会话 ID
  generateConversationId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
}
