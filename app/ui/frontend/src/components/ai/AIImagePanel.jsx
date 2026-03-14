import React from 'react'
import { createPortal } from 'react-dom'
import { X, Settings, Image as ImageIcon, Search, Trash2, Loader2, MessageSquare, Check, ChevronDown, ChevronUp } from 'lucide-react'
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
  onOpenImageManager,
  onDeleteHistory,
  onSelectHistoryItem,
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

  /** 所有已启用服务商下已启用的文生图模型（与 AI 对话区模型选择逻辑一致） */
  const connectableImageModels = React.useMemo(() => {
    const disabled = new Set(config?.disabledProviders || [])
    const verified = config?.verifiedImageModelsByService || {}
    return AI_IMAGE_SERVICES.flatMap((s) => {
      if (disabled.has(s.value)) return []
      const list = verified[s.value]
      if (s.value === 'builtin') {
        const builtin = s.models || []
        const custom = Array.isArray(config?.customModels?.[s.value]) ? config.customModels[s.value] : []
        const full = [...builtin, ...custom].filter(Boolean)
        const seen = new Set()
        const all = full.filter((m) => !seen.has(m) && seen.add(m))
        const enabled = (list != null && list.length > 0) ? all.filter((m) => list.includes(m)) : all
        return enabled.map((model) => ({ serviceType: s.value, serviceLabel: s.label, model }))
      }
      const fetched = config?.fetchedModelsByService?.[s.value] || []
      const source = fetched.filter((m) => isImageModel(m))
      const custom = Array.isArray(config?.customModels?.[s.value]) ? config.customModels[s.value] : []
      const full = [...source, ...custom].filter(Boolean)
      const seen = new Set()
      const all = full.filter((m) => !seen.has(m) && seen.add(m))
      if (list == null || list.length === 0) return all.map((model) => ({ serviceType: s.value, serviceLabel: s.label, model }))
      return all.filter((m) => list.includes(m)).map((model) => ({ serviceType: s.value, serviceLabel: s.label, model }))
    })
  }, [config?.disabledProviders, config?.verifiedImageModelsByService, config?.customModels, config?.fetchedModelsByService])

  const [modelSearch, setModelSearch] = React.useState('')
  const filteredImageModels = React.useMemo(() => {
    if (!modelSearch.trim()) return connectableImageModels
    const q = modelSearch.trim().toLowerCase()
    return connectableImageModels.filter(
      (item) =>
        item.model.toLowerCase().includes(q) || item.serviceLabel.toLowerCase().includes(q)
    )
  }, [connectableImageModels, modelSearch])

  const groupedImageByService = React.useMemo(() => {
    const map = new Map()
    for (const item of filteredImageModels) {
      const key = item.serviceType
      if (!map.has(key)) map.set(key, { serviceType: item.serviceType, serviceLabel: item.serviceLabel, models: [] })
      map.get(key).models.push(item.model)
    }
    return Array.from(map.values())
  }, [filteredImageModels])

  const [showModelSwitcher, setShowModelSwitcher] = React.useState(false)
  const [modelSwitcherPosition, setModelSwitcherPosition] = React.useState({ top: 0, left: 0 })
  const [modelSwitcherPositionReady, setModelSwitcherPositionReady] = React.useState(false)
  const modelSwitcherButtonRef = React.useRef(null)
  const modelSwitcherPopoverRef = React.useRef(null)

  React.useLayoutEffect(() => {
    if (!showModelSwitcher || !modelSwitcherButtonRef.current) {
      setModelSwitcherPositionReady(false)
      return
    }
    const rect = modelSwitcherButtonRef.current.getBoundingClientRect()
    const dropdownHeight = 320
    const dropdownWidth = 280
    const top = Math.max(8, rect.top - dropdownHeight - 8)
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - dropdownWidth - 8))
    setModelSwitcherPosition({ top, left })
    setModelSwitcherPositionReady(true)
  }, [showModelSwitcher])

  React.useEffect(() => {
    if (!showModelSwitcher) return
    const onDocClick = (e) => {
      const inButton = modelSwitcherButtonRef.current?.contains(e.target)
      const inPopover = modelSwitcherPopoverRef.current?.contains(e.target)
      if (!inButton && !inPopover) setShowModelSwitcher(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('touchstart', onDocClick, { passive: true })
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('touchstart', onDocClick)
    }
  }, [showModelSwitcher])

  const currentImageModel = config?.model || ''
  const currentImageServiceLabel = AI_IMAGE_SERVICES.find((s) => s.value === config?.type)?.label || ''

  const inputRef = React.useRef(null)
  const [showHistory, setShowHistory] = React.useState(false)
  const [previewUrl, setPreviewUrl] = React.useState(null)

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

      <p className="ai-image-desc">
        使用 AI 根据文字描述生成图像，生成结果会默认保存到
        {onOpenImageManager ? (
          <button type="button" className="ai-image-desc-link" onClick={onOpenImageManager}>
            本地图片库
          </button>
        ) : (
          '本地图片库'
        )}
      </p>

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
                  <div className="ai-model-switcher-wrap">
                    <button
                      ref={modelSwitcherButtonRef}
                      type="button"
                      className="ai-model-switcher-btn"
                      onClick={() => { setShowModelSwitcher((v) => !v); setModelSearch('') }}
                      title="切换模型"
                      disabled={generating}
                    >
                      <span className="ai-model-switcher-label">
                        {currentImageServiceLabel && currentImageModel
                          ? `${currentImageServiceLabel} / ${currentImageModel}`
                          : currentImageModel || '选择模型'}
                      </span>
                      {showModelSwitcher ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {showModelSwitcher && modelSwitcherPositionReady && createPortal(
                      <div
                        role="dialog"
                        aria-label="切换文生图模型"
                        className={`ai-model-switcher-dropdown ${document.querySelector('.app')?.classList.contains('theme-light') ? 'theme-light' : 'theme-dark'}`}
                        style={{
                          position: 'fixed',
                          top: modelSwitcherPosition.top,
                          left: modelSwitcherPosition.left,
                          zIndex: 9999,
                          width: 280,
                          maxHeight: 320,
                        }}
                      >
                        <div
                          ref={modelSwitcherPopoverRef}
                          className="ai-model-switcher-popover ai-model-switcher-popover-fixed"
                        >
                          <div className="ai-model-switcher-search">
                            <Search size={16} />
                            <input
                              type="text"
                              placeholder="搜索模型"
                              value={modelSearch}
                              onChange={(e) => setModelSearch(e.target.value)}
                              autoFocus
                            />
                          </div>
                          <div className="ai-model-switcher-list">
                            {groupedImageByService.length === 0 ? (
                              <div className="ai-model-switcher-empty">无匹配模型</div>
                            ) : (
                              groupedImageByService.map((group) => (
                                <div key={group.serviceType} className="ai-model-switcher-group">
                                  <div className="ai-model-switcher-group-title">{group.serviceLabel}</div>
                                  {group.models.map((model) => {
                                    const svc = AI_IMAGE_SERVICES.find((s) => s.value === group.serviceType)
                                    const sizes = svc?.sizes || ['1024x1024']
                                    const firstSize = sizes[0] || '1024x1024'
                                    return (
                                      <button
                                        key={`${group.serviceType}:${model}`}
                                        type="button"
                                        className={`ai-model-switcher-item${config?.type === group.serviceType && currentImageModel === model ? ' active' : ''}`}
                                        onClick={() => {
                                          onImageConfigChange({
                                            type: group.serviceType,
                                            model,
                                            size: config?.type === group.serviceType ? (config?.size || firstSize) : firstSize,
                                          })
                                          setShowModelSwitcher(false)
                                        }}
                                      >
                                        <span className="ai-model-switcher-item-label">{model}</span>
                                        {config?.type === group.serviceType && currentImageModel === model && <Check size={16} />}
                                      </button>
                                    )
                                  })}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>,
                      document.body
                    )}
                  </div>
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
                <div
                  key={item.id ?? i}
                  className="ai-image-history-item"
                  onClick={() => onSelectHistoryItem?.(item)}
                >
                  <img
                    src={item.url}
                    alt=""
                    className="ai-image-history-thumb"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPreviewUrl(item.url)
                    }}
                    title="点击预览"
                  />
                  <span>{item.prompt}</span>
                  {onDeleteHistory && (
                    <button
                      type="button"
                      className="ai-image-history-delete"
                      title="删除"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteHistory(item.id != null ? item.id : item)
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {previewUrl && (
        <div
          className="ai-image-preview-overlay"
          onClick={() => setPreviewUrl(null)}
        >
          <img src={previewUrl} alt="预览" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}
