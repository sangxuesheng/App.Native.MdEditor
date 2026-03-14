import React from 'react'
import { X, Settings, Image as ImageIcon, Search, Trash2, Loader2, MessageSquare } from 'lucide-react'
import AnimatedSelect from '../AnimatedSelect'
import { AI_IMAGE_SERVICES, SIZE_LABELS, isImageModel } from '../../constants/aiImageConfig'

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
  onImageConfigChange,
}) {
  const sizeOptions = React.useMemo(() => {
    const svc = AI_IMAGE_SERVICES.find((s) => s.value === config?.type)
    const sizes = svc?.sizes || ['1024x1024']
    return sizes.map((s) => {
      const raw = SIZE_LABELS[s] || s
      const label = raw.includes(' (') ? raw.replace(' (', '\n(') : raw
      return { value: s, label }
    })
  }, [config?.type])

  /** 当前服务商下已启用的文生图模型列表（与配置面板逻辑一致，未配置时视为全部启用）。内置用预设，其他从拉取结果中仅保留文生图模型 */
  const imageModelOptions = React.useMemo(() => {
    const type = config?.type
    if (!type) return []
    const svc = AI_IMAGE_SERVICES.find((s) => s.value === type)
    let source
    if (type === 'builtin') {
      source = svc?.models || []
    } else {
      const fetched = config?.fetchedModelsByService?.[type] || []
      source = fetched.filter((m) => isImageModel(m))
    }
    const custom = Array.isArray(config?.customModels?.[type]) ? config.customModels[type] : []
    const full = [...source, ...custom].filter(Boolean)
    const seen = new Set()
    const all = full.filter((m) => !seen.has(m) && seen.add(m))
    const verified = config?.verifiedImageModelsByService?.[type]
    const enabled = verified != null && verified.length > 0 ? all.filter((m) => verified.includes(m)) : all
    let opts = enabled.map((m) => ({ value: m, label: m }))
    const current = config?.model
    if (current && !opts.some((o) => o.value === current)) opts = [{ value: current, label: current }, ...opts]
    return opts
  }, [config?.type, config?.model, config?.customModels, config?.verifiedImageModelsByService, config?.fetchedModelsByService])

  const inputRef = React.useRef(null)
  const [showHistory, setShowHistory] = React.useState(false)

  const handleSubmit = (e) => {
    e?.preventDefault()
    if (!prompt.trim() || generating) return
    onGenerate()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
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
                onClick={() => {
                  onInsertImage(resultUrl)
                  onClose?.()
                }}
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

      <form className="ai-input-area" onSubmit={handleSubmit}>
        <div className="ai-input-box">
          <div className="ai-input-content">
            <div className="ai-input-text">
              <textarea
                ref={inputRef}
                className="ai-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="描述你想生成的图像... (Enter 生成，Shift+Enter 换行)"
                disabled={generating}
                rows={3}
              />
            </div>
          </div>
          <div className="ai-input-footer">
            {onImageConfigChange && (
              <>
                <div className="ai-image-size-wrap">
                  <AnimatedSelect
                    value={config?.size || '1024x1024'}
                    onChange={(v) => onImageConfigChange({ size: v })}
                    options={sizeOptions}
                    disabled={generating}
                    placement="top"
                    floating
                  />
                </div>
                <div className="ai-image-model-wrap">
                  <AnimatedSelect
                    value={config?.model ?? ''}
                    onChange={(v) => onImageConfigChange({ model: v })}
                    options={imageModelOptions.length > 0 ? imageModelOptions : [{ value: config?.model ?? '', label: config?.model || '选择模型' }]}
                    disabled={generating}
                    placement="top"
                    floating
                  />
                </div>
              </>
            )}
            <button
              type="submit"
              className="ai-send-btn"
              disabled={!prompt.trim() || generating}
            >
              {generating ? (
                <>
                  <Loader2 size={14} className="spin" />
                  <span>生成中</span>
                </>
              ) : (
                <span>生成</span>
              )}
            </button>
          </div>
        </div>
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
