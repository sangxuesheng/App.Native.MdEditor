import React from 'react'
import { X } from 'lucide-react'
import AIChatPanel from './AIChatPanel'
import AIConfigPanel from './AIConfigPanel'
import AIImagePanel from './AIImagePanel'
import { useAIChat } from '../../hooks/ai/useAIChat'
import { useAIImage } from '../../hooks/ai/useAIImage'

export default function AIDialog({ isOpen, onClose, getEditorContent, getSelectedText, onInsertImage, onInsertText, onOpenImageManager }) {
  const [showConfig, setShowConfig] = React.useState(false)
  const [mode, setMode] = React.useState('chat') // 'chat' | 'image'
  const [configPanelTab, setConfigPanelTab] = React.useState('chat') // 打开配置面板时默认标签：'chat' | 'image'

  const chat = useAIChat()
  const image = useAIImage()

  const handleChatConfigChange = (updates) => {
    chat.setConfig((prev) => ({ ...prev, ...updates }))
  }

  const handleImageConfigChange = (updates) => {
    image.setConfig((prev) => ({ ...prev, ...updates }))
  }

  // 文生图与对话共用 API 配置：endpoint、apiKey、fetchedModelsByService、disabledProviders 优先从对话 config 按服务商读取
  const effectiveImageConfig = React.useMemo(() => {
    const ep = chat.config.endpoints?.[image.config.type] ?? image.config.endpoint ?? ''
    const ak = chat.config.apiKeys?.[image.config.type] ?? image.config.apiKey ?? ''
    return {
      ...image.config,
      endpoint: ep && ep.trim() ? ep : (image.config.endpoint || ''),
      apiKey: ak,
      fetchedModelsByService: chat.config.fetchedModelsByService,
      disabledProviders: chat.config.disabledProviders,
    }
  }, [image.config, chat.config.endpoints, chat.config.apiKeys, chat.config.fetchedModelsByService, chat.config.disabledProviders])

  const openChatConfig = () => {
    setConfigPanelTab('chat')
    setMode('chat')
    setShowConfig(true)
  }

  const openImageConfig = () => {
    setConfigPanelTab('image')
    setMode('image')
    setShowConfig(true)
  }

  if (!isOpen) return null

  return (
    <div className="ai-dialog-overlay" onClick={onClose}>
      <div className="ai-dialog" onClick={(e) => e.stopPropagation()}>
        {showConfig ? (
          <AIConfigPanel
            config={chat.config}
            onConfigChange={handleChatConfigChange}
            onClose={() => setShowConfig(false)}
            onTestConnection={chat.testConnection}
            imageConfig={image.config}
            onImageConfigChange={handleImageConfigChange}
            onTestConnectionImage={(overrides) => {
                const ep = overrides?.endpoint ?? effectiveImageConfig.endpoint
                const ak = overrides?.apiKey ?? effectiveImageConfig.apiKey
                return image.testConnection({ ...overrides, endpoint: ep, apiKey: ak })
              }}
            initialModelListTab={configPanelTab}
          />
        ) : mode === 'image' ? (
          <AIImagePanel
            config={effectiveImageConfig}
            prompt={image.prompt}
            setPrompt={image.setPrompt}
            generating={image.generating}
            resultUrl={image.resultUrl}
            error={image.error}
            history={image.history}
            onGenerate={() => image.generateWithConfig(effectiveImageConfig)}
            onCancel={image.cancel}
            onOpenConfig={openImageConfig}
            onClose={onClose}
            onSwitchToChat={() => setMode('chat')}
            onInsertImage={onInsertImage}
            onImageConfigChange={handleImageConfigChange}
            onOpenImageManager={() => onOpenImageManager?.('library')}
            onDeleteHistory={image.removeHistoryItem}
            onSelectHistoryItem={(item) => image.setResultUrl?.(item?.url)}
          />
        ) : (
          <AIChatPanel
            config={chat.config}
            onConfigChange={handleChatConfigChange}
            messages={chat.messages}
            isStreaming={chat.isStreaming}
            quoteFullContent={chat.quoteFullContent}
            onSendMessage={chat.sendMessage}
            onStopGeneration={chat.stopGeneration}
            onNewConversation={chat.newConversation}
            onLoadConversation={chat.loadConversation}
            onDeleteConversation={chat.deleteConversation}
            onGetAllConversations={chat.getAllConversations}
            onToggleQuoteFullContent={chat.setQuoteFullContent}
            onOpenConfig={openChatConfig}
            onClose={onClose}
            onSwitchToImage={() => setMode('image')}
            getEditorContent={getEditorContent}
            getSelectedText={getSelectedText}
            onInsertText={onInsertText}
            onRegenerateReply={chat.regenerateReply}
          />
        )}
      </div>
    </div>
  )
}
