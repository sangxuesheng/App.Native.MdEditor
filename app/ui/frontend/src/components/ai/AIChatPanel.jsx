import React from 'react'
import { X, Settings, Plus, FolderOpen, Trash2 } from 'lucide-react'
import ChatMessage from './ChatMessage'
import QuickCommand from './QuickCommand'
import { DEFAULT_QUICK_COMMANDS } from '../../constants/aiConfig'

export default function AIChatPanel({
  messages,
  isStreaming,
  quoteFullContent,
  onSendMessage,
  onStopGeneration,
  onNewConversation,
  onLoadConversation,
  onDeleteConversation,
  onToggleQuoteFullContent,
  onOpenConfig,
  onClose,
  editorContent,
  selectedText,
}) {
  const [input, setInput] = React.useState('')
  const [showConversations, setShowConversations] = React.useState(false)
  const messagesEndRef = React.useRef(null)
  const inputRef = React.useRef(null)

  // 自动滚动到底部
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 处理发送
  const handleSend = () => {
    if (!input.trim() || isStreaming) return

    const fullContent = quoteFullContent ? editorContent : null
    onSendMessage(input, fullContent)
    setInput('')
  }

  // 处理快捷指令
  const handleQuickCommand = (command) => {
    const text = selectedText || ''
    const prompt = command.template.replace('{{sel}}', text)
    setInput(prompt)
    inputRef.current?.focus()
  }

  // 处理键盘事件
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="ai-chat-panel">
      {/* 头部 */}
      <div className="ai-chat-header">
        <h3>AI 对话助手</h3>
        <div className="ai-chat-actions">
          <button
            className="ai-icon-btn"
            onClick={onOpenConfig}
            title="配置"
          >
            <Settings size={18} />
          </button>
          <button
            className="ai-icon-btn"
            onClick={onNewConversation}
            title="新建会话"
          >
            <Plus size={18} />
          </button>
          <button
            className="ai-icon-btn"
            onClick={() => setShowConversations(!showConversations)}
            title="历史会话"
          >
            <FolderOpen size={18} />
          </button>
          <button
            className="ai-icon-btn"
            onClick={onClose}
            title="关闭"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* 快捷指令 */}
      <div className="ai-quick-commands">
        {DEFAULT_QUICK_COMMANDS.map((cmd) => (
          <QuickCommand
            key={cmd.id}
            command={cmd}
            onClick={() => handleQuickCommand(cmd)}
            disabled={isStreaming}
          />
        ))}
      </div>

      {/* 消息列表 */}
      <div className="ai-messages">
        {messages.length === 0 ? (
          <div className="ai-empty-state">
            <p>👋 你好！我是 AI 助手</p>
            <p>我可以帮你润色、翻译、总结文章</p>
            <p>选择快捷指令或直接输入问题开始对话</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区 */}
      <div className="ai-input-area">
        <div className="ai-input-controls">
          <label className="ai-checkbox">
            <input
              type="checkbox"
              checked={quoteFullContent}
              onChange={(e) => onToggleQuoteFullContent(e.target.checked)}
            />
            <span>引用全文</span>
          </label>
        </div>
        <div className="ai-input-wrapper">
          <textarea
            ref={inputRef}
            className="ai-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="说些什么... (Enter 发送，Shift+Enter 换行)"
            disabled={isStreaming}
            rows={3}
          />
          <button
            className="ai-send-btn"
            onClick={isStreaming ? onStopGeneration : handleSend}
            disabled={!input.trim() && !isStreaming}
          >
            {isStreaming ? '⏸️ 停止' : '▶️ 发送'}
          </button>
        </div>
      </div>

      {/* 历史会话列表 */}
      {showConversations && (
        <div className="ai-conversations-overlay" onClick={() => setShowConversations(false)}>
          <div className="ai-conversations-panel" onClick={(e) => e.stopPropagation()}>
            <div className="ai-conversations-header">
              <h4>历史会话</h4>
              <button onClick={() => setShowConversations(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="ai-conversations-list">
              {/* 这里会显示历史会话列表 */}
              <p className="ai-empty-state">暂无历史会话</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
