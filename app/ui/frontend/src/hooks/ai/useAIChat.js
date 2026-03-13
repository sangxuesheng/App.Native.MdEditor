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
    // 加载配置
    const savedConfig = aiStorage.loadConfig()
    if (savedConfig) {
      setConfig(savedConfig)
    }

    // 加载当前会话
    const savedMessages = aiStorage.loadCurrentConversation()
    if (savedMessages.length > 0) {
      setMessages(savedMessages)
    }

    // 创建 AI 服务实例
    aiServiceRef.current = new AIService(savedConfig || DEFAULT_CONFIG)
  }, [])

  // 保存配置
  useEffect(() => {
    aiStorage.saveConfig(config)
    if (aiServiceRef.current) {
      aiServiceRef.current.updateConfig(config)
    }
  }, [config])

  // 自动保存当前会话
  useEffect(() => {
    if (messages.length > 0) {
      aiStorage.saveCurrentConversation(messages)
    }
  }, [messages])

  // 发送消息
  const sendMessage = useCallback(
    async (content, fullContent = null) => {
      if (!content.trim() || isStreaming) return

      // 添加用户消息
      const userMessage = {
        role: 'user',
        content: content.trim(),
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, userMessage])

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

      // 构建上下文
      const contextMessages = [...messages, userMessage]

      // 如果启用引用全文，添加系统消息
      if (quoteFullContent && fullContent) {
        contextMessages.unshift({
          role: 'system',
          content: `下面是一篇 Markdown 文章全文：\n\n${fullContent}`,
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
            if (type === 'reasoning') {
              lastMsg.reasoning += chunk
            } else {
              lastMsg.content += chunk
            }
            return updated
          })
        },
        // onComplete
        () => {
          setMessages((prev) => {
            const updated = [...prev]
            const lastMsg = updated[updated.length - 1]
            lastMsg.done = true
            return updated
          })
          setIsStreaming(false)
        },
        // onError
        (error) => {
          setMessages((prev) => {
            const updated = [...prev]
            const lastMsg = updated[updated.length - 1]
            lastMsg.content = `❌ 错误: ${error.message}`
            lastMsg.done = true
            lastMsg.error = true
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

  // 新建会话
  const newConversation = useCallback(() => {
    // 保存当前会话到历史
    if (messages.length > 0 && currentConversationId) {
      const title = messages[0]?.content?.slice(0, 30) || '新对话'
      aiStorage.saveConversation(currentConversationId, messages, title)
    }

    // 清空当前会话
    setMessages([])
    setCurrentConversationId(aiStorage.generateConversationId())
    aiStorage.saveCurrentConversation([])
  }, [messages, currentConversationId])

  // 加载会话
  const loadConversation = useCallback((id) => {
    const conversation = aiStorage.loadConversation(id)
    if (conversation) {
      setMessages(conversation.messages)
      setCurrentConversationId(id)
    }
  }, [])

  // 删除会话
  const deleteConversation = useCallback((id) => {
    aiStorage.deleteConversation(id)
    if (id === currentConversationId) {
      newConversation()
    }
  }, [currentConversationId, newConversation])

  // 获取所有会话
  const getAllConversations = useCallback(() => {
    const conversations = aiStorage.loadAllConversations()
    return Object.values(conversations).sort((a, b) => b.timestamp - a.timestamp)
  }, [])

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
  }
}
