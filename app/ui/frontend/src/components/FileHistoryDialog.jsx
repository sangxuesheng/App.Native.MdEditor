import React, { useState } from 'react'
import { Scroll, Trash2, ArrowLeft } from 'lucide-react'
import { 
  formatHistoryTime, 
  formatFileSize, 
  calculateDiff 
} from '../utils/fileHistoryManager'
import './FileHistoryDialog.css'

/**
 * 文件历史记录对话框
 */
function FileHistoryDialog({ 
  filePath, 
  currentContent,
  history, 
  onRestore, 
  onDelete,
  onClose,
  theme 
}) {
  const [selectedVersion, setSelectedVersion] = useState(null)
  const [showDiff, setShowDiff] = useState(false)

  const handleVersionClick = (version) => {
    setSelectedVersion(version)
    setShowDiff(false)
  }

  const handleRestore = () => {
    if (selectedVersion && window.confirm('确定要恢复到此版本吗？当前内容将被替换。')) {
      onRestore(selectedVersion.content)
      onClose()
    }
  }

  const handleDelete = (version) => {
    if (window.confirm('确定要删除此历史版本吗？')) {
      onDelete(version.timestamp)
      if (selectedVersion && selectedVersion.timestamp === version.timestamp) {
        setSelectedVersion(null)
      }
    }
  }

  const handleShowDiff = () => {
    setShowDiff(!showDiff)
  }

  const renderDiff = () => {
    if (!selectedVersion || !showDiff) return null
    
    const diff = calculateDiff(selectedVersion.content, currentContent)
    
    return (
      <div className="history-diff">
        <div className="diff-stats">
          <span className="diff-stat added">+{diff.added} 行</span>
          <span className="diff-stat removed">-{diff.removed} 行</span>
          <span className="diff-stat modified">~{diff.modified} 行</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`dialog-overlay ${theme}`} onClick={onClose}>
      <div className="dialog-content history-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>文件历史记录</h2>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>

        <div className="dialog-body">
          <div className="history-file-path">{filePath}</div>

          {history.length === 0 ? (
            <div className="history-empty">
              <span className="empty-icon"><Scroll size={48} /></span>
              <span className="empty-text">暂无历史记录</span>
              <span className="empty-hint">保存文件时会自动创建历史版本</span>
            </div>
          ) : (
            <div className="history-container">
              <div className="history-list">
                <div className="history-list-header">
                  <span>版本历史 ({history.length}/{10})</span>
                </div>
                {history.map((version, index) => (
                  <div
                    key={version.timestamp}
                    className={`history-item ${selectedVersion?.timestamp === version.timestamp ? 'selected' : ''}`}
                    onClick={() => handleVersionClick(version)}
                  >
                    <div className="history-item-header">
                      <span className="history-index">#{index + 1}</span>
                      <span className="history-time">{formatHistoryTime(version.timestamp)}</span>
                    </div>
                    <div className="history-item-info">
                      <span className="history-size">{formatFileSize(version.size)}</span>
                      <span className="history-lines">{version.lines} 行</span>
                    </div>
                    <button
                      className="history-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(version)
                      }}
                      title="删除此版本"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="history-preview">
                {selectedVersion ? (
                  <>
                    <div className="preview-header">
                      <span className="preview-title">版本预览</span>
                      <div className="preview-actions">
                        <button
                          className="btn-secondary"
                          onClick={handleShowDiff}
                        >
                          {showDiff ? '隐藏差异' : '显示差异'}
                        </button>
                        <button
                          className="btn-primary"
                          onClick={handleRestore}
                        >
                          恢复此版本
                        </button>
                      </div>
                    </div>

                    {renderDiff()}

                    <div className="preview-content">
                      <pre className="preview-text">{selectedVersion.content}</pre>
                    </div>
                  </>
                ) : (
                  <div className="preview-placeholder">
                    <span className="placeholder-icon"><ArrowLeft size={48} /></span>
                    <span className="placeholder-text">选择一个版本查看内容</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="dialog-footer">
          <button className="btn-secondary" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}

export default FileHistoryDialog

