import React, { useEffect } from 'react'
import './ConfirmDialog.css'

/**
 * 自定义确认对话框（不使用系统弹窗）
 */
function ConfirmDialog({ 
  title, 
  message, 
  confirmText = '确定', 
  cancelText = '取消',
  onConfirm, 
  onCancel,
  theme = 'light',
  confirmVariant = 'danger',
  closeOnOverlayClick = true
}) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onCancel()
    }
  }

  const handleCancelClick = () => {
    onCancel()
  }

  const handleConfirmClick = () => {
    onConfirm()
  }

  const confirmButtonClass = confirmVariant === 'primary' ? 'btn-primary' : 'btn-danger'
  const messageLines = String(message || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  return (
    <div className={`dialog-overlay theme-${theme}`} onClick={handleOverlayClick}>
      <div
        className="dialog-container confirm-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="dialog-content confirm-dialog-panel">
          <h2 className="confirm-dialog-title">{title}</h2>
          <div className="confirm-dialog-message-list">
            {messageLines.map((line, index) => (
              <p key={`${line}-${index}`} className="confirm-message">{line}</p>
            ))}
          </div>
          <div className="confirm-dialog-actions">
            <button className="btn-secondary" onClick={handleCancelClick}>
              {cancelText}
            </button>
            <button className={confirmButtonClass} onClick={handleConfirmClick}>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
