import React, { useState, useEffect, useRef } from 'react'
import './RenameDialog.css'

/**
 * 重命名对话框组件
 */
function RenameDialog({ 
  node,
  onConfirm, 
  onCancel
}) {
  const [newName, setNewName] = useState(node?.name || '')
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current && node) {
      inputRef.current.focus()
      // 选中文件名（不包括扩展名）
      const dotIndex = node.name.lastIndexOf('.')
      if (dotIndex > 0) {
        inputRef.current.setSelectionRange(0, dotIndex)
      } else {
        inputRef.current.select()
      }
    }
  }, [node])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // 验证
    if (!newName.trim()) {
      setError('名称不能为空')
      return
    }

    if (newName === node.name) {
      onCancel()
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
      onCancel()
    }
  }

  if (!node) return null

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-content rename-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>重命名</h2>
          <button className="dialog-close" onClick={onCancel}>×</button>
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
              原名称: {node.name}
            </div>
          </div>
          
          <div className="dialog-footer">
            <button type="button" className="btn-secondary" onClick={onCancel}>
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
