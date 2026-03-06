import React from 'react'
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
  theme = 'light'
}) {
  return (
    <div className={`dialog-overlay ${theme}`} onClick={onCancel}>
      <div className="dialog-content confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>{title}</h2>
        </div>
        
        <div className="dialog-body">
          <p className="confirm-message">{message}</p>
        </div>
        
        <div className="dialog-footer">
          <button className="btn-secondary" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="btn-danger" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
