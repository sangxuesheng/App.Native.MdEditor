import React from 'react'
import AIToggleButton from './AIToggleButton'
import AIChatPanel from './AIChatPanel'
import AIConfigPanel from './AIConfigPanel'
import { useAIChat } from '../../hooks/ai/useAIChat'

export default function AISidebar({ editorContent, selectedText }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [showConfig, setShowConfig] = React.useState(false)

  const {
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
  } = useAIChat()

  const handleConfigChange = (updates) => {
    setConfig((prev) => ({ ...prev, ...updates }))
  }

  const handleTestConnection = async () => {
    // 这里会调用 AI 服务的测试连接方法
    return { success: true, message: '连接成功' }
  }

  return (
    <>
      {/* 切换按钮 */}
      <AIToggleButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />

      {/* AI 侧边栏 */}
      {isOpen && (
        <div className="ai-sidebar">
          {showConfig ? (
            <AIConfigPanel
              config={config}
              onConfigChange={handleConfigChange}
              onClose={() => setShowConfig(false)}
              onTestConnection={handleTestConnection}
            />
          ) : (
            <AIChatPanel
              messages={messages}
              isStreaming={isStreaming}
              quoteFullContent={quoteFullContent}
              onSendMessage={sendMessage}
              onStopGeneration={stopGeneration}
              onNewConversation={newConversation}
              onLoadConversation={loadConversation}
              onDeleteConversation={deleteConversation}
              onToggleQuoteFullContent={setQuoteFullContent}
              onOpenConfig={() => setShowConfig(true)}
              onClose={() => setIsOpen(false)}
              editorContent={editorContent}
              selectedText={selectedText}
            />
          )}
        </div>
      )}
    </>
  )
}
