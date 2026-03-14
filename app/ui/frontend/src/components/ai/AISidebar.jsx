import React from 'react'
import { Bot } from 'lucide-react'
import AIDialog from './AIDialog'

export default function AISidebar({ getEditorContent, getSelectedText, onInsertImage, onInsertText }) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleInsertImage = React.useCallback((url) => {
    if (onInsertImage) {
      onInsertImage(`![AI生成](${url})`)
    }
  }, [onInsertImage])

  return (
    <>
      {/* AI 切换按钮 */}
      <button
        className="ai-toggle-btn"
        onClick={() => setIsOpen(true)}
        title="打开 AI 助手"
      >
        <Bot size={24} />
        <span className="ai-toggle-label">AI</span>
      </button>

      {/* AI 对话窗口 */}
      <AIDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        getEditorContent={getEditorContent}
        getSelectedText={getSelectedText}
        onInsertImage={handleInsertImage}
        onInsertText={onInsertText}
      />
    </>
  )
}
