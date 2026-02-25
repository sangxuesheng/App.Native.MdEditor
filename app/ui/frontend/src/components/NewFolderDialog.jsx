import React, { useState, useEffect, useRef } from 'react'
import './NewFolderDialog.css'

/**
 * 新建文件夹对话框组件
 */
function NewFolderDialog({ 
  parentPath,
  onConfirm, 
  onCancel
}) {
  const [folderName, setFolderName] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // 验证
    if (!folderName.trim()) {
      setError('文件夹名称不能为空')
      return
    }

    // 检查非法字符
    if (/[<>:"/\\|?*]/.test(folderName)) {
      setError('名称包含非法字符')
      return
    }

    // 检查是否以点开头（隐藏文件夹）
    if (folderName.startsWith('.')) {
      setError('文件夹名称不能以点开头')
      return
    }

    onConfirm(folderName)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-content new-folder-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>新建文件夹</h2>
          <button className="dialog-close" onClick={onCancel}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="dialog-body">
            <div className="form-group">
              <label>文件夹名称</label>
              <input
                ref={inputRef}
                type="text"
                className={`form-input ${error ? 'error' : ''}`}
                value={folderName}
                onChange={(e) => {
                  setFolderName(e.target.value)
                  setError('')
                }}
                onKeyDown={handleKeyDown}
                placeholder="请输入文件夹名称"
              />
              {error && <div className="form-error">{error}</div>}
            </div>
            <div className="form-hint">
              位置: {parentPath}
            </div>
          </div>
          
          <div className="dialog-footer">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              取消
            </button>
            <button type="submit" className="btn-primary">
              创建
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewFolderDialog

