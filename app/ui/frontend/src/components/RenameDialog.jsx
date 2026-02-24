import React, { useState, useEffect, useRef } from 'react'
import './RenameDialog.css'

/**
 * 重命名对话框组件
 */
function RenameDialog({ 
  oldName, 
  onConfirm, 
  onClose,
  theme 
}) {
  const [newName, setNewName] = useState(oldName)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
      // 选中文件名（不包括扩展名）
      const dotIndex = oldName.lastIndexOf('.')
      if (dotIndex > 0) {
        inputRef.current.setSelectionRange(0, dotIndex)
      } else {
        inputRef.current.select()
      }
    }
  }, [oldName])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // 验证
    if (!newName.trim()) {
      setError('名称不能为空')
      return
    }

    if (newName === oldName) {
      onClose()
      return
    }

    // 检查非法字符
    if (/[<>:"/\\|?*]/.test(newName)) {
      setError('名称包含非法字符')
      return
    }

    onConfirm(newName)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div className={`dialog-overlay ${theme}`} onClick={onClose}>
      <div className="dialog-content rename-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>重命名</h2>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="dialog-body">
            <div className="form-group">
              <label>新名称</label>
              <input
                ref={inputRef}
                type="text"
                className={`form-input ${error ? 'error' : ''}`}
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value)
                  setError('')
                }}
                onKeyDown={handleKeyDown}
              />
              {error && <div className="form-error">{error}</div>}
            </div>
            <div className="form-hint">
              原名称: {oldName}
            </div>
          </div>
          
          <div className="dialog-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn-primary">
              确定
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RenameDialog

