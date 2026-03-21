import React, { useCallback } from 'react'
import AIDialog from './AIDialog'

export default function AISidebar({ isOpen, onClose, getEditorContent, getSelectedText, onInsertImage, onInsertText, onOpenImageManager }) {
  const handleOpenImageManager = useCallback((tab) => {
    onOpenImageManager?.(tab)
  }, [onOpenImageManager])

  const handleInsertImage = useCallback((url) => {
    if (onInsertImage) {
      onInsertImage(`![AI生成](${url})`)
    }
  }, [onInsertImage])

  return (
    <AIDialog
      isOpen={isOpen}
      onClose={onClose}
      getEditorContent={getEditorContent}
      getSelectedText={getSelectedText}
      onInsertImage={handleInsertImage}
      onInsertText={onInsertText}
      onOpenImageManager={handleOpenImageManager}
    />
  )
}
