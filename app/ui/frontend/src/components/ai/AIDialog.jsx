import React from 'react'
import { X } from 'lucide-react'
import AIChatPanel from './AIChatPanel'
import AIConfigPanel from './AIConfigPanel'
import AIImagePanel from './AIImagePanel'
import AIImageConfigPanel from './AIImageConfigPanel'
import { useAIChat } from '../../hooks/ai/useAIChat'
import { useAIImage } from '../../hooks/ai/useAIImage'

export default function AIDialog({ isOpen, onClose, getEditorContent, getSelectedText, onInsertImage, onInsertText }) {
  const [showConfig, setShowConfig] = React.useState(false)
  const [mode, setMode] = React.useState('chat') // 'chat' | 'image'

  const chat = useAIChat()
  const image = useAIImage()

  const handleChatConfigChange = (updates) => {
    chat.setConfig((prev) => ({ ...prev, ...updates }))
  }

  const handleImageConfigChange = (updates) => {
    image.setConfig((prev) => ({ ...prev, ...updates }))
  }

  if (!isOpen) return null

  const showChatConfig = showConfig && mode === 'chat'
  const showImageConfig = showConfig && mode === 'image'

  return (
    <div className="ai-dialog-overlay" onClick={onClose}>
      <div className="ai-dialog" onClick={(e) => e.stopPropagation()}>
        {showChatConfig ? (
          <AIConfigPanel
            config={chat.config}
            onConfigChange={handleChatConfigChange}
            onClose={() => setShowConfig(false)}
            onTestConnection={chat.testConnection}
          />
        ) : showImageConfig ? (
          <AIImageConfigPanel
            config={image.config}
            onConfigChange={handleImageConfigChange}
            onClose={() => setShowConfig(false)}
            onTestConnection={image.testConnection}
          />
        ) : mode === 'image' ? (
          <AIImagePanel
            config={image.config}
            prompt={image.prompt}
            setPrompt={image.setPrompt}
            generating={image.generating}
            resultUrl={image.resultUrl}
            error={image.error}
            history={image.history}
            onGenerate={image.generate}
            onCancel={image.cancel}
            onOpenConfig={() => { setMode('image'); setShowConfig(true) }}
            onClose={onClose}
            onSwitchToChat={() => setMode('chat')}
            onInsertImage={onInsertImage}
          />
        ) : (
          <AIChatPanel
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
            onOpenConfig={() => { setMode('chat'); setShowConfig(true) }}
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
