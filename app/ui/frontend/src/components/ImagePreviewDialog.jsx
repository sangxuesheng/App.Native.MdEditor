import React from 'react'
import { X, Download, Info } from 'lucide-react'
import './ImagePreviewDialog.css'

function ImagePreviewDialog({ image, onClose, theme }) {
  if (!image) return null

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = image.url
    link.download = image.filename || 'image'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString) => {
    if (!dateString) return '未知'
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN')
  }

  return (
    <div className="image-preview-overlay" onClick={onClose}>
      <div 
        className={`image-preview-dialog ${theme}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="image-preview-header">
          <h3>{image.filename || '图片预览'}</h3>
          <div className="header-actions">
            <button 
              className="action-button"
              onClick={handleDownload}
              title="下载图片"
            >
              <Download size={20} />
            </button>
            <button 
              className="close-button"
              onClick={onClose}
              title="关闭"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 图片显示区域 */}
        <div className="image-preview-content">
          <img 
            src={image.url} 
            alt={image.filename || '图片'} 
            className="preview-image"
          />
        </div>

        {/* 图片信息 */}
        <div className="image-preview-info">
          <div className="info-icon">
            <Info size={16} />
            <span>图片信息</span>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">文件名：</span>
              <span className="info-value">{image.filename || '未知'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">文件大小：</span>
              <span className="info-value">{formatFileSize(image.size || 0)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">上传时间：</span>
              <span className="info-value">{formatDate(image.uploadTime)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">图片路径：</span>
              <span className="info-value" title={image.url}>{image.url}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImagePreviewDialog
