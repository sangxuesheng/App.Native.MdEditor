import React from 'react'
import { X, Settings, Plus, FolderOpen, MessageSquare, Image as ImageIcon, Trash2, Loader2, Hand, Send, Square, Check, TextQuote } from 'lucide-react'
import ChatMessage from './ChatMessage'
import QuickCommand from './QuickCommand'
import Resizer from '../Resizer'
import { DEFAULT_QUICK_COMMANDS } from '../../constants/aiConfig'
import { formatHistoryTime } from '../../utils/fileHistoryManagerV2'

const INPUT_HEIGHT_MIN = 80
const INPUT_HEIGHT_MAX = 400
const INPUT_HEIGHT_DEFAULT = 180
const QUOTE_START = '【引用】'
const QUOTE_END = '【/引用】'

export default function AIChatPanel({
  messages,
  isStreaming,
  quoteFullContent,
  onSendMessage,
  onStopGeneration,
  onNewConversation,
  onLoadConversation,
  onDeleteConversation,
  onGetAllConversations,
  onToggleQuoteFullContent,
  onOpenConfig,
  onClose,
  onSwitchToImage,
  getEditorContent,
  getSelectedText,
  onInsertText,
  onRegenerateReply,
}) {
  const [input, setInput] = React.useState('')
  const [quotedBlocks, setQuotedBlocks] = React.useState([])
  const [showConversations, setShowConversations] = React.useState(false)
  const [conversations, setConversations] = React.useState([])
  const [loadingConversations, setLoadingConversations] = React.useState(false)
  const [inputAreaHeight, setInputAreaHeight] = React.useState(INPUT_HEIGHT_DEFAULT)
  const messagesEndRef = React.useRef(null)
  const inputRef = React.useRef(null)

  const handleInputResize = React.useCallback((delta) => {
    setInputAreaHeight((h) => Math.min(INPUT_HEIGHT_MAX, Math.max(INPUT_HEIGHT_MIN, h - delta)))
  }, [])

  // 打开历史面板时加载列表
  React.useEffect(() => {
    if (showConversations && onGetAllConversations) {
      setLoadingConversations(true)
      onGetAllConversations()
        .then(setConversations)
        .catch(() => setConversations([]))
        .finally(() => setLoadingConversations(false))
    }
  }, [showConversations, onGetAllConversations])

  // 自动滚动到底部
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 处理发送（引用块 + 输入文本；引用全文时从编辑器实时获取）
  // 含引用时使用 【引用】...【/引用】 标记，便于展示时解析
  const handleSend = () => {
    const quoted = quotedBlocks.map((b) => b.content).join('\n\n')
    const userText = input.trim()
    let finalContent
    if (quoted && userText) {
      finalContent = `${QUOTE_START}\n${quoted}\n${QUOTE_END}\n\n${userText}`
    } else if (quoted) {
      finalContent = `${QUOTE_START}\n${quoted}\n${QUOTE_END}`
    } else {
      finalContent = userText
    }
    if (!finalContent || isStreaming) return

    const fullContent = quoteFullContent && getEditorContent ? getEditorContent() : null
    const quotedFromIndex = quotedBlocks[0]?.sourceIndex ?? null
    onSendMessage(finalContent, fullContent, quotedFromIndex)
    setInput('')
    setQuotedBlocks([])
  }

  // 处理快捷指令（从编辑器实时获取选中文本）
  const handleQuickCommand = (command) => {
    const text = (getSelectedText ? getSelectedText() : '') || ''
    const prompt = command.template.replace('{{sel}}', text)
    setInput(prompt)
    inputRef.current?.focus()
  }

  // 引用 AI 回复为独立块，插入输入框上方（可点击 × 移除）
  const handleQuoteToInput = (text, sourceIndex) => {
    if (!text) return
    setQuotedBlocks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID?.() ?? `q-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        content: text,
        sourceIndex: typeof sourceIndex === 'number' ? sourceIndex : null,
      },
    ])
    inputRef.current?.focus()
  }

  const removeQuotedBlock = (id) => {
    setQuotedBlocks((prev) => prev.filter((b) => b.id !== id))
  }

  const scrollToMessage = (index) => {
    const el = document.getElementById(`ai-message-${index}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
        <div className="ai-chat-title">
          <MessageSquare size={20} />
          <h3>AI 对话</h3>
        </div>
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
            onClick={onSwitchToImage || (() => setShowConversations(!showConversations))}
            title={onSwitchToImage ? 'AI 文生图' : '历史会话'}
          >
            <ImageIcon size={18} />
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
            <p><Hand size={18} className="ai-empty-icon" /> 你好！我是 AI 助手</p>
            <p>我可以帮你润色、翻译、总结文章</p>
            <p>选择快捷指令或直接输入问题开始对话</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} id={`ai-message-${index}`} className="ai-message-item">
              <ChatMessage
                message={msg}
                index={index}
                isLastAssistant={msg.role === 'assistant' && index === messages.length - 1}
                onQuote={handleQuoteToInput}
                onRegenerate={onRegenerateReply}
                onScrollToMessage={scrollToMessage}
                isStreaming={isStreaming}
                isAlreadyQuoted={quotedBlocks.some((b) => b.sourceIndex === index)}
              />
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 拉动条：上拉可放大输入框 */}
      <Resizer direction="horizontal" onResize={handleInputResize} />

      {/* 输入区：引用全文和发送按钮置于输入框内底部 */}
      <div className="ai-input-area" style={{ height: inputAreaHeight, minHeight: INPUT_HEIGHT_MIN }}>
        <div className="ai-input-box">
          <div className="ai-input-content">
            {quotedBlocks.length > 0 && (
              <div className="ai-quoted-blocks">
                {quotedBlocks.map((block) => {
                  const firstLine = block.content.split('\n')[0] || ''
                  const preview = firstLine.length > 50 ? `${firstLine.slice(0, 50)}…` : firstLine
                  return (
                    <div key={block.id} className="ai-quoted-block">
                      <span className="ai-quoted-block-preview">{preview}</span>
                      <button
                        type="button"
                        className="ai-quoted-block-remove"
                        onClick={() => removeQuotedBlock(block.id)}
                        title="移除引用"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
            <div className="ai-input-text">
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
            </div>
          </div>
          <div className="ai-input-footer">
            <button
              type="button"
              className={`ai-quote-full-btn${quoteFullContent ? ' active' : ''}`}
              onClick={() => onToggleQuoteFullContent(!quoteFullContent)}
              title={quoteFullContent ? '已启用引用全文' : '引用全文'}
            >
              {quoteFullContent ? <Check size={14} /> : <TextQuote size={14} />}
              <span>引用全文</span>
            </button>
            <button
              className="ai-send-btn"
              onClick={isStreaming ? onStopGeneration : handleSend}
              disabled={(!input.trim() && quotedBlocks.length === 0) || isStreaming}
            >
              {isStreaming ? (
                <>
                  <Square size={14} />
                  <span>停止</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>发送</span>
                </>
              )}
            </button>
          </div>
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
              {loadingConversations ? (
                <div className="ai-conversations-loading">
                  <Loader2 size={20} className="spin" />
                  加载中...
                </div>
              ) : conversations.length === 0 ? (
                <div className="ai-conversations-empty">暂无历史会话</div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="ai-conversations-item"
                    onClick={() => {
                      onLoadConversation(conv.id)
                      setShowConversations(false)
                    }}
                  >
                    <div className="ai-conversations-item-content">
                      <div className="ai-conversations-item-title">{conv.title || '新对话'}</div>
                      <div className="ai-conversations-item-time">{formatHistoryTime(conv.timestamp)}</div>
                    </div>
                    <div className="ai-conversations-item-actions">
                      <button
                        title="删除"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteConversation(conv.id)
                          setConversations((prev) => prev.filter((c) => c.id !== conv.id))
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
