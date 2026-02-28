import React, { useState, useRef, useCallback, useEffect } from 'react'
import { X, Upload, Link as LinkIcon, Image as ImageIcon, Settings, Folder, RefreshCw, Trash2 } from 'lucide-react'
import './ImageManagerDialog.css'

function ImageManagerDialog({ isOpen, onClose, onInsertImage, theme }) {
  const [activeTab, setActiveTab] = useState('upload') // upload, link, library, settings
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [uploadedImages, setUploadedImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [libraryImages, setLibraryImages] = useState([])
  const [loadingLibrary, setLoadingLibrary] = useState(false)
  const fileInputRef = useRef(null)

  // 加载图片库
  const loadLibraryImages = useCallback(async () => {
    setLoadingLibrary(true)
    try {
      const response = await fetch('/api/image/list')
      const result = await response.json()
      
      if (result.ok) {
        setLibraryImages(result.images || [])
      } else {
        console.error('加载图片库失败:', result.error)
      }
    } catch (error) {
      console.error('加载图片库错误:', error)
    } finally {
      setLoadingLibrary(false)
    }
  }, [])

  // 当切换到图片库标签页时加载图片
  useEffect(() => {
    if (isOpen && activeTab === 'library') {
      loadLibraryImages()
    }
  }, [isOpen, activeTab, loadLibraryImages])


  // 处理文件上传
  const handleFileUpload = useCallback(async (files) => {
    if (!files || files.length === 0) return

    setUploading(true)
    const formData = new FormData()
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        alert(`文件 ${file.name} 不是图片格式`)
        continue
      }

      // 验证文件大小（10MB）
      if (file.size > 10 * 1024 * 1024) {
        alert(`文件 ${file.name} 超过 10MB 限制`)
        continue
      }

      formData.append('images', file)
    }

    try {
      const response = await fetch('/api/image/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      
      if (result.ok) {
        setUploadedImages(prev => [...result.images, ...prev])
        // 如果当前在图片库标签页，刷新图片库
        if (activeTab === 'library') {
          loadLibraryImages()
        }
        alert(`成功上传 ${result.images.length} 张图片`)
      } else {
        alert(`上传失败: ${result.error}`)
      }
    } catch (error) {
      console.error('上传错误:', error)
      alert('上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }, [])

  // 拖拽处理
  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files)
    }
  }, [handleFileUpload])

  // 点击选择文件
  const handleSelectClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files)
    }
  }

  // 插入图片链接
  const handleInsertLink = () => {
    if (!imageUrl.trim()) {
      alert('请输入图片链接')
      return
    }

    const alt = imageAlt.trim() || '图片'
    onInsertImage(`![${alt}](${imageUrl})`)
    onClose()
  }

  // 删除图片
  const handleDeleteImage = useCallback(async (image) => {
    if (!confirm(`确定要删除图片 "${image.filename}" 吗？`)) {
      return
    }
    
    try {
      const response = await fetch('/api/image/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: image.url })
      })
      
      const result = await response.json()
      
      if (result.ok) {
        // 刷新图片库
        loadLibraryImages()
        alert('图片已删除')
      } else {
        alert(`删除失败: ${result.message}`)
      }
    } catch (error) {
      console.error('删除图片错误:', error)
      alert('删除失败，请重试')
    }
  }, [loadLibraryImages])


  // 插入已上传的图片
  const handleInsertUploaded = (image) => {
    const alt = image.alt || '图片'
    onInsertImage(`![${alt}](${image.url})`)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="image-manager-overlay" onClick={onClose}>
      <div 
        className={`image-manager-dialog ${theme}`} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="image-manager-header">
          <h2>图片管理</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* 标签页 */}
        <div className="image-manager-tabs">
          <button
            className={`tab-button ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <Upload size={18} />
            <span>上传图片</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'link' ? 'active' : ''}`}
            onClick={() => setActiveTab('link')}
          >
            <LinkIcon size={18} />
            <span>图片链接</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'library' ? 'active' : ''}`}
            onClick={() => setActiveTab('library')}
          >
            <ImageIcon size={18} />
            <span>图片库</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} />
            <span>图床设置</span>
          </button>
        </div>

        {/* 内容区域 */}
        <div className="image-manager-content">
          {/* 上传图片标签页 */}
          {activeTab === 'upload' && (
            <div className="upload-tab">
              <div className="current-storage">
                <Folder size={16} />
                <span>当前图床：</span>
                <strong>本地存储</strong>
                <span className="star">⭐</span>
                <button className="settings-icon-btn">
                  <Settings size={16} />
                </button>
              </div>

              <div
                className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="upload-icon">
                  <Upload size={48} />
                </div>
                <h3>上传图片</h3>
                <p>拖拽图片到此处或点击选择文件</p>
                <button 
                  className="select-button"
                  onClick={handleSelectClick}
                  disabled={uploading}
                >
                  <ImageIcon size={18} />
                  {uploading ? '上传中...' : '选择图片'}
                </button>
                <p className="upload-hint">
                  支持 JPG、PNG、GIF、WebP 格式，单个文件最大 10MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleFileInputChange}
                />
              </div>

              {/* 最近上传 */}
              {uploadedImages.length > 0 && (
                <div className="recent-uploads">
                  <h4>最近上传</h4>
                  <div className="image-grid">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="image-item">
                        <img src={image.url} alt={image.alt || '图片'} />
                        <div className="image-overlay">
                          <button onClick={() => handleInsertUploaded(image)}>
                            插入
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 图片链接标签页 */}
          {activeTab === 'link' && (
            <div className="link-tab">
              <div className="form-group">
                <label>图片链接</label>
                <input
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleInsertLink()}
                />
              </div>
              <div className="form-group">
                <label>图片描述（可选）</label>
                <input
                  type="text"
                  placeholder="图片描述"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleInsertLink()}
                />
              </div>
              <div className="button-group">
                <button className="cancel-button" onClick={onClose}>
                  取消
                </button>
                <button className="insert-button" onClick={handleInsertLink}>
                  插入图片
                </button>
              </div>
            </div>
          )}

          {/* 图片库标签页 */}
          {activeTab === 'library' && (
            <div className="library-tab">
              <div className="library-header">
                <h4>图片库 ({libraryImages.length})</h4>
                <button 
                  className="refresh-button"
                  onClick={loadLibraryImages}
                  disabled={loadingLibrary}
                  title="刷新图片库"
                >
                  <RefreshCw size={18} className={loadingLibrary ? 'spinning' : ''} />
                  刷新
                </button>
              </div>
              
              {loadingLibrary ? (
                <div className="loading-state">
                  <RefreshCw size={48} className="spinning" />
                  <p>加载中...</p>
                </div>
              ) : libraryImages.length === 0 ? (
                <div className="empty-state">
                  <ImageIcon size={64} />
                  <h3>图片库为空</h3>
                  <p>上传图片后会显示在这里</p>
                </div>
              ) : (
                <div className="image-grid">
                  {libraryImages.map((image, index) => (
                    <div key={index} className="image-item">
                      <img src={image.url} alt={image.alt || '图片'} />
                      <button 
                        className="delete-image-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteImage(image)
                        }}
                        title="删除图片"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="image-info">
                        <span className="image-filename" title={image.filename}>
                          {image.filename}
                        </span>
                        <span className="image-size">
                          {(image.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <div className="image-overlay">
                        <button onClick={() => handleInsertUploaded(image)}>
                          插入
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 图床设置标签页 */}
          {activeTab === 'settings' && (
            <div className="settings-tab">
              <div className="placeholder-state">
                <Settings size={64} />
                <h3>图床设置</h3>
                <p>此功能正在开发中...</p>
                <p className="hint">未来将支持：</p>
                <ul>
                  <li>本地存储</li>
                  <li>七牛云</li>
                  <li>阿里云 OSS</li>
                  <li>腾讯云 COS</li>
                  <li>自定义图床</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* 底部关闭按钮 */}
        <div className="image-manager-footer">
          <button className="close-footer-button" onClick={onClose}>
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImageManagerDialog

