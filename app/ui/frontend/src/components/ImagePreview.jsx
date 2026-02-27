import React, { useState } from 'react';
import './ImagePreview.css';

const ImagePreview = ({ image, onInsert, onDelete, onClose }) => {
  const [scale, setScale] = useState(1);

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(3, prev + 0.2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.2));
  };

  const handleReset = () => {
    setScale(1);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(image.url);
    alert('链接已复制到剪贴板');
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = image.url;
    a.download = image.filename;
    a.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN');
  };

  return (
    <div className="image-preview-overlay" onClick={onClose}>
      <div className="image-preview-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="image-preview-header">
          <div className="image-preview-title">{image.filename}</div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="image-preview-body" onWheel={handleWheel}>
          <img
            src={image.url}
            alt={image.filename}
            style={{ transform: `scale(${scale})` }}
          />
        </div>

        <div className="image-preview-controls">
          <button className="control-btn" onClick={handleZoomOut} title="缩小">
            🔍−
          </button>
          <button className="control-btn" onClick={handleReset} title="重置">
            {Math.round(scale * 100)}%
          </button>
          <button className="control-btn" onClick={handleZoomIn} title="放大">
            🔍+
          </button>
        </div>

        <div className="image-preview-footer">
          <div className="image-preview-info">
            {image.size && <span>{formatFileSize(image.size)}</span>}
            {image.uploadDate && <span>{formatDate(image.uploadDate)}</span>}
          </div>
          <div className="image-preview-actions">
            <button className="action-btn" onClick={handleCopyLink}>
              📋 复制链接
            </button>
            <button className="action-btn" onClick={() => onInsert(image)}>
              ➕ 插入
            </button>
            <button className="action-btn" onClick={handleDownload}>
              ⬇️ 下载
            </button>
            <button className="action-btn delete-btn" onClick={() => {
              onDelete(image);
              onClose();
            }}>
              🗑️ 删除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;
