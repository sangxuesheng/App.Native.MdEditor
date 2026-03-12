import React from 'react'
import './RenameDialog.css'

/**
 * 文件属性对话框组件
 */
function FilePropertiesDialog({ 
  node,
  onClose
}) {
  const handleOverlayClick = () => {
    onClose()
  }

  const handleCloseClick = () => {
    onClose()
  }

  const handleConfirmClick = () => {
    onClose()
  }

  if (!node) return null

  return (
    <div className="dialog-overlay compact-panel-overlay" onClick={handleOverlayClick}>
      <div className="dialog-container compact-panel-dialog properties-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>文件属性</h2>
          <button className="dialog-close" onClick={handleCloseClick}>×</button>
        </div>
        
        <div className="dialog-body">
          <div className="properties-list">
            <div className="property-item">
              <span className="property-label">名称:</span>
              <span className="property-value">{node.name}</span>
            </div>
            <div className="property-item">
              <span className="property-label">路径:</span>
              <span className="property-value">{node.path}</span>
            </div>
            <div className="property-item">
              <span className="property-label">类型:</span>
              <span className="property-value">{node.type === 'directory' ? '文件夹' : '文件'}</span>
            </div>
            {node.size !== undefined && (
              <div className="property-item">
                <span className="property-label">大小:</span>
                <span className="property-value">
                  {node.size < 1024 ? `${node.size} B` : 
                   node.size < 1024 * 1024 ? `${(node.size / 1024).toFixed(2)} KB` : 
                   `${(node.size / (1024 * 1024)).toFixed(2)} MB`}
                </span>
              </div>
            )}
          </div>
        </div>
        
        <div className="dialog-footer">
          <button type="button" className="btn-primary" onClick={handleConfirmClick}>
            确定
          </button>
        </div>
      </div>
    </div>
  )
}

export default FilePropertiesDialog