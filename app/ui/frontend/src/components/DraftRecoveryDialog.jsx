import React from 'react'
import { formatTimeSince } from '../utils/draftManager'
import './DraftRecoveryDialog.css'

/**
 * 草稿恢复对话框
 */
function DraftRecoveryDialog({ draft, onRecover, onDiscard, onClose }) {
  if (!draft) return null

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>发现未保存的草稿</h2>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>
        
        <div className="dialog-body">
          <div className="draft-info">
            <div className="draft-info-item">
              <span className="label">文件:</span>
              <span className="value">{draft.filePath}</span>
            </div>
            <div className="draft-info-item">
              <span className="label">保存时间:</span>
              <span className="value">{formatTimeSince(draft.timestamp)}</span>
            </div>
            <div className="draft-info-item">
              <span className="label">大小:</span>
              <span className="value">{draft.size} 字符</span>
            </div>
          </div>

          <div className="draft-preview">
            <div className="draft-preview-label">草稿预览:</div>
            <pre className="draft-preview-content">
              {draft.content.substring(0, 500)}
              {draft.content.length > 500 && '\n...'}
            </pre>
          </div>

          <p className="draft-warning">
            ⚠️ 恢复草稿将覆盖当前编辑器内容
          </p>
        </div>

        <div className="dialog-footer">
          <button className="btn-secondary" onClick={onDiscard}>
            丢弃草稿
          </button>
          <button className="btn-primary" onClick={onRecover}>
            恢复草稿
          </button>
        </div>
      </div>
    </div>
  )
}

export default DraftRecoveryDialog

