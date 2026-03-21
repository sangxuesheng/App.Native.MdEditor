import React from 'react'
import { X, Download } from 'lucide-react'
import './ImagePreviewDialog.css'

function ImagePreviewDialog({ image, onClose, theme }) {
  if (!image) return null

  const doDownloadImage = () => {
    const link = document.createElement('a')
    link.href = image.url
    link.download = image.filename || 'image'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatFileSize = (bytes) => {
    if (bytes === undefined || bytes === null) return '0 B'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return '未知'
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN')
  }

  const handleMaskClick = () => {
    onClose()
  }

  const handleDownloadClick = () => {
    doDownloadImage()
  }

  const handleCloseClick = (e) => {
    e.stopPropagation()
    onClose()
  }

  return (
    <div className="img-preview-mask" onClick={handleMaskClick}>
      <div className="img-preview-card" onClick={(e) => e.stopPropagation()}>
        {/* 图片信息头部 - 参考截图布局 */}
        <div className="img-preview-info-header">
          <div className="info-title">图片信息</div>
          <div className="info-details">
            <div className="info-row">
              <span className="info-label">文件名：</span>
              <span className="info-value">{image.filename || '未知'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">文件大小：</span>
              <span className="info-value">{formatFileSize(image.size || 0)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">修改时间：</span>
              <span className="info-value">{formatDate(image.mtime || image.uploadTime)}</span>
            </div>
            <div className="info-row actions-row">
              <span className="info-label">操作：</span>
              <div className="info-actions">
                <button 
                  className="info-action-btn"
                  onClick={handleDownloadClick}
                  title="下载图片"
                >
                  <Download size={16} />
                  <span>下载</span>
                </button>
                <button 
                  className="info-action-btn close-btn"
                  onClick={handleCloseClick}
                  title="关闭"
                >
                  <X size={16} />
                  <span>关闭</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 图片预览主体 */}
        <div className="img-preview-body">
          <img src={image.url} alt={image.filename || '图片'} />
        </div>
      </div>
    </div>
  )
}

export default ImagePreviewDialog
