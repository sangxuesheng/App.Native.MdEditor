import React from 'react'
import { User, Bot } from 'lucide-react'

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  const isError = message.error

  return (
    <div className={`chat-message ${isUser ? 'user' : 'assistant'} ${isError ? 'error' : ''}`}>
      <div className="message-avatar">
        {isUser ? <User size={20} /> : <Bot size={20} />}
      </div>
      <div className="message-content">
        {/* 推理过程（DeepSeek R1） */}
        {message.reasoning && (
          <div className="message-reasoning">
            <details>
              <summary>💭 推理过程</summary>
              <pre>{message.reasoning}</pre>
            </details>
          </div>
        )}
        
        {/* 消息内容 */}
        <div className="message-text">
          {message.content || (message.done ? '' : '正在思考...')}
        </div>

        {/* 时间戳 */}
        {message.timestamp && (
          <div className="message-timestamp">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  )
}
