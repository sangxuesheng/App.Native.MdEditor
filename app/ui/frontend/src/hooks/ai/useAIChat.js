import { useState, useEffect, useCallback, useRef } from 'react'
import { AIService } from '../../utils/ai/aiService'
import { aiStorage } from '../../utils/ai/aiStorage'
import { DEFAULT_CONFIG } from '../../constants/aiConfig'

export function useAIChat() {
  const [messages, setMessages] = useState([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [quoteFullContent, setQuoteFullContent] = useState(false)
  
  const aiServiceRef = useRef(null)
  const abortControllerRef = useRef(null)

  // 初始化 AI 服务
  useEffect(() => {
    let cancelled = false
    Promise.all([
      aiStorage.loadConfig(),
      aiStorage.loadCurrentConversation(),
    ]).then(([savedConfig, savedMessages]) => {
      if (cancelled) return
      const effective = savedConfig
        ? { ...DEFAULT_CONFIG, ...savedConfig, customModels: { ...(DEFAULT_CONFIG.customModels || {}), ...(savedConfig.customModels || {}) } }
        : DEFAULT_CONFIG
      if (savedConfig) setConfig(effective)
      aiServiceRef.current = new AIService(effective)
      if (Array.isArray(savedMessages) && savedMessages.length > 0) {
        setMessages(savedMessages)
      }
    })
    return () => { cancelled = true }
  }, [])

  // 保存配置到数据库
  useEffect(() => {
    aiStorage.saveConfig(config)
    if (aiServiceRef.current) {
      aiServiceRef.current.updateConfig(config)
    }
  }, [config])

  // 自动保存当前会话（防抖，避免流式输出时频繁请求）
  useEffect(() => {
    if (messages.length === 0) return
    const id = setTimeout(() => {
      aiStorage.saveCurrentConversation(messages)
    }, 800)
    return () => clearTimeout(id)
  }, [messages])

  // 发送消息
  const sendMessage = useCallback(
    async (content, fullContent = null, quotedFromIndex = null) => {
      if (!content.trim() || isStreaming) return

      // 首次发送时生成会话 ID，确保新建会话时能正确归档
      setCurrentConversationId((prev) => prev || aiStorage.generateConversationId())

      // 添加用户消息；若引用全文，将全文直接附在用户消息后，确保 AI 能收到
      let userContent = content.trim()
      if (quoteFullContent && fullContent && typeof fullContent === 'string') {
        userContent = `${userContent}\n\n【以下为需要处理的全文】\n\n${fullContent}\n\n【全文结束】`
      }

      const userMessage = {
        role: 'user',
        content: userContent,
        timestamp: Date.now(),
        quotedFromIndex: typeof quotedFromIndex === 'number' ? quotedFromIndex : undefined,
      }

      setMessages((prev) => [...prev, { ...userMessage, content: content.trim() }])

      // 创建 AI 回复消息
      const aiMessage = {
        role: 'assistant',
        content: '',
        reasoning: '',
        done: false,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsStreaming(true)

      // 构建上下文（发送给 API 的用含全文的 userMessage）
      const contextMessages = [...messages, userMessage]

      // 若启用引用全文，同时添加系统消息作为补充说明
      if (quoteFullContent && fullContent && typeof fullContent === 'string') {
        contextMessages.unshift({
          role: 'system',
          content: '用户启用了「引用全文」，用户消息末尾会包含需要处理的完整文章内容。',
        })
      }

      // 只保留最近 10 条消息作为上下文
      const recentMessages = contextMessages.slice(-10)

      // 发送请求
      await aiServiceRef.current.sendMessage(
        recentMessages,
        // onChunk
        (chunk, type = 'content') => {
          setMessages((prev) => {
            const updated = [...prev]
            const lastMsg = updated[updated.length - 1]
            if (!lastMsg) return prev // 防止流式响应早于 state 更新到达导致 lastMsg 为空
            if (type === 'reasoning') {
              lastMsg.reasoning = (lastMsg.reasoning || '') + chunk
            } else {
              lastMsg.content = (lastMsg.content || '') + chunk
            }
            return updated
          })
        },
        // onComplete
        () => {
          setMessages((prev) => {
            const updated = [...prev]
            const lastMsg = updated[updated.length - 1]
            if (lastMsg) lastMsg.done = true
            return updated
          })
          setIsStreaming(false)
        },
        // onError
        (error) => {
          setMessages((prev) => {
            const updated = [...prev]
            const lastMsg = updated[updated.length - 1]
            if (lastMsg) {
              lastMsg.content = `❌ 错误: ${error.message}`
              lastMsg.done = true
              lastMsg.error = true
            }
            return updated
          })
          setIsStreaming(false)
        }
      )
    },
    [messages, isStreaming, quoteFullContent, config]
  )

  // 停止生成
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsStreaming(false)
  }, [])

  // 新建会话：先归档当前会话到历史，再清空
  const newConversation = useCallback(async () => {
    if (messages.length > 0) {
      const idToSave = currentConversationId || aiStorage.generateConversationId()
      const title = messages[0]?.content?.slice(0, 30) || '新对话'
      await aiStorage.saveConversation(idToSave, messages, title)
    }
    setMessages([])
    setCurrentConversationId(aiStorage.generateConversationId())
    await aiStorage.saveCurrentConversation([])
  }, [messages, currentConversationId])

  // 加载会话：若有当前对话内容，先保存到历史再切换，避免丢失
  const loadConversation = useCallback(async (id) => {
    if (messages.length > 0) {
      const idToSave = currentConversationId || aiStorage.generateConversationId()
      const title = messages[0]?.content?.slice(0, 30) || '新对话'
      await aiStorage.saveConversation(idToSave, messages, title)
    }
    const conversation = await aiStorage.loadConversation(id)
    if (conversation) {
      setMessages(conversation.messages)
      setCurrentConversationId(id)
      await aiStorage.saveCurrentConversation(conversation.messages)
    }
  }, [messages, currentConversationId])

  // 删除会话
  const deleteConversation = useCallback(async (id) => {
    await aiStorage.deleteConversation(id)
    if (id === currentConversationId) {
      newConversation()
    }
  }, [currentConversationId, newConversation])

  // 获取所有会话（异步）
  const getAllConversations = useCallback(async () => {
    const conversations = await aiStorage.loadAllConversations()
    return Object.values(conversations).sort((a, b) => b.timestamp - a.timestamp)
  }, [])

  const testConnection = useCallback(async () => {
    if (aiServiceRef.current) {
      return aiServiceRef.current.testConnection()
    }
    return { success: true, message: '连接成功' }
  }, [])

  // 重新生成：移除指定 assistant 消息及其前一条 user 消息，用 user 内容重新发送
  const regenerateReply = useCallback(
    (assistantIndex) => {
      if (assistantIndex < 1 || isStreaming) return
      const userMsg = messages[assistantIndex - 1]
      if (!userMsg || userMsg.role !== 'user') return
      const userContent = userMsg.content
      setMessages((prev) => prev.slice(0, assistantIndex - 1))
      sendMessage(userContent)
    },
    [messages, isStreaming, sendMessage]
  )

  return {
    messages,
    isStreaming,
    config,
    setConfig,
    quoteFullContent,
    setQuoteFullContent,
    sendMessage,
    stopGeneration,
    newConversation,
    loadConversation,
    deleteConversation,
    getAllConversations,
    testConnection,
    regenerateReply,
  }
}
