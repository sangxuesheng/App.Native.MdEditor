import React from 'react'
import { X, Settings, Image as ImageIcon, Search, Trash2, Loader2, MessageSquare } from 'lucide-react'

export default function AIImagePanel({
  config,
  prompt,
  setPrompt,
  generating,
  resultUrl,
  error,
  history,
  onGenerate,
  onCancel,
  onOpenConfig,
  onClose,
  onSwitchToChat,
  onInsertImage,
}) {
  const inputRef = React.useRef(null)
  const [showHistory, setShowHistory] = React.useState(false)

  const handleSubmit = (e) => {
    e?.preventDefault()
    onGenerate()
  }

  return (
    <div className="ai-chat-panel ai-image-panel">
      <div className="ai-chat-header">
        <div className="ai-chat-title">
          <ImageIcon size={20} />
          <h3>AI 文生图</h3>
        </div>
        <div className="ai-chat-actions">
          <button className="ai-icon-btn" onClick={onSwitchToChat} title="AI 对话">
            <MessageSquare size={18} />
          </button>
          <button className="ai-icon-btn" onClick={onOpenConfig} title="配置">
            <Settings size={18} />
          </button>
          <button
            className="ai-icon-btn"
            onClick={() => setShowHistory(!showHistory)}
            title="历史记录"
          >
            <Search size={18} />
          </button>
          <button className="ai-icon-btn" onClick={onClose} title="关闭">
            <X size={18} />
          </button>
        </div>
      </div>

      <p className="ai-image-desc">使用 AI 根据文字描述生成图像</p>

      <div className="ai-image-main">
        {generating ? (
          <div className="ai-image-loading">
            <Loader2 size={48} className="spin" />
            <p>正在生成图像...</p>
            <button className="ai-btn ai-btn-secondary" onClick={onCancel}>
              取消生成
            </button>
          </div>
        ) : resultUrl ? (
          <div className="ai-image-result">
            <img src={resultUrl} alt="生成结果" />
            {onInsertImage && (
              <button
                className="ai-btn ai-btn-primary"
                onClick={() => onInsertImage(resultUrl)}
              >
                插入到文档
              </button>
            )}
          </div>
        ) : (
          <div className="ai-image-placeholder">
            <ImageIcon size={64} />
            <p>输入描述，点击生成</p>
          </div>
        )}
      </div>

      {error && (
        <div className="ai-image-error">
          {error}
        </div>
      )}

      <form className="ai-image-input-area" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          className="ai-image-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="描述你想生成的图像..."
          disabled={generating}
        />
        <button
          type="submit"
          className="ai-image-generate-btn"
          disabled={!prompt.trim() || generating}
        >
          {generating ? <Loader2 size={20} className="spin" /> : '生成'}
        </button>
      </form>

      {showHistory && history.length > 0 && (
        <div className="ai-image-history-overlay" onClick={() => setShowHistory(false)}>
          <div className="ai-image-history-panel" onClick={(e) => e.stopPropagation()}>
            <h4>历史记录</h4>
            <div className="ai-image-history-list">
              {history.map((item, i) => (
                <div key={i} className="ai-image-history-item">
                  <img src={item.url} alt="" />
                  <span>{item.prompt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
