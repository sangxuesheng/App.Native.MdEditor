import React, { useState, useRef, useCallback, useEffect } from 'react'
import { X, Upload, Link as LinkIcon, Image as ImageIcon, Settings, Folder, RefreshCw, Trash2, CheckSquare, Square, Star, ImageUp } from 'lucide-react'
import './ImageManagerDialog.css'
import { compressImage } from '../utils/imageCompressor'
import ImagePreviewDialog from './ImagePreviewDialog'
import ElasticSlider from './ElasticSlider'

function ImageManagerDialog({ isOpen, onClose, onInsertImage, theme, onNotify }) {
  const [activeTab, setActiveTab] = useState('upload') // upload, link, library, settings, compression
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [imageTitle, setImageTitle] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [uploadedImages, setUploadedImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const [libraryImages, setLibraryImages] = useState([])
  const [loadingLibrary, setLoadingLibrary] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedImages, setSelectedImages] = useState([])
  const [confirmDialog, setConfirmDialog] = useState(null)
  const fileInputRef = useRef(null)
  const recentUploadsRef = useRef(null)
  
  // 图片压缩设置
  const [imageSettings, setImageSettings] = useState({
    imageCompression: true,
    imageCompressionMode: 'quality', // 'quality' 或 'size'
    imageQuality: 80,
    imageTargetSizePercent: 30, // 目标文件大小百分比
    imageMaxWidth: 1920,
    imageMaxHeight: 1080,
    maxFileSize: 10 // 最大文件大小（MB）
  })
  const [hasSettingsChanges, setHasSettingsChanges] = useState(false)

  // 加载图片设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('md-editor-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setImageSettings({
          imageCompression: parsed.imageCompression ?? true,
          imageCompressionMode: parsed.imageCompressionMode || 'quality',
          imageQuality: parsed.imageQuality ?? 80,
          imageTargetSizePercent: parsed.imageTargetSizePercent ?? 30,
          imageMaxWidth: parsed.imageMaxWidth ?? 1920,
          imageMaxHeight: parsed.imageMaxHeight ?? 1080,
          maxFileSize: parsed.maxFileSize ?? 10
        })
      } catch (err) {
        console.error('Failed to load image settings:', err)
      }
    }
  }, [])

  // 处理图片设置变更
  const handleImageSettingChange = (key, value) => {
    setImageSettings(prev => ({ ...prev, [key]: value }))
    setHasSettingsChanges(true)
  }

  // 保存图片设置
  const handleSaveImageSettings = () => {
    const savedSettings = localStorage.getItem('md-editor-settings')
    let allSettings = {}
    
    if (savedSettings) {
      try {
        allSettings = JSON.parse(savedSettings)
      } catch (err) {
        console.error('Failed to parse settings:', err)
      }
    }
    
    const updatedSettings = { ...allSettings, ...imageSettings }
    localStorage.setItem('md-editor-settings', JSON.stringify(updatedSettings))
    setHasSettingsChanges(false)
    onNotify?.('图片设置已保存', 'success')
  }

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

  // 当对话框关闭时清空输入
  useEffect(() => {
    if (!isOpen) {
      setImageUrl('')
      setImageAlt('')
      setImageTitle('')
    }
  }, [isOpen])


  // 处理文件上传
  const handleFileUpload = useCallback(async (files) => {
    if (!files || files.length === 0) return

    setUploading(true)
    const formData = new FormData()
    
    for (let i = 0; i < files.length; i++) {
      let file = files[i]
      
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        onNotify?.(`文件 ${file.name} 不是图片格式`, 'error')
        continue
      }

      // 验证文件大小（使用配置的最大值）
      const maxSizeBytes = imageSettings.maxFileSize * 1024 * 1024
      if (file.size > maxSizeBytes) {
        onNotify?.(`文件 ${file.name} 超过 ${imageSettings.maxFileSize}MB 限制`, 'error')
        continue
      }

      // 压缩图片 - 使用当前设置
      try {
        // 检查是否是 HEIC/HEIF 文件
        const isHEIC = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
        
        if (imageSettings.imageCompression && !isHEIC) {
          const originalSize = file.size
          
          // 如果是按文件大小压缩，计算目标大小
          let targetSize = undefined
          if (imageSettings.imageCompressionMode === 'size') {
            targetSize = Math.round((originalSize / 1024) * (imageSettings.imageTargetSizePercent / 100))
            console.log(`原始文件: ${(originalSize / 1024).toFixed(1)}KB, 目标百分比: ${imageSettings.imageTargetSizePercent}%, 目标大小: ${targetSize}KB`)
          }
          
          file = await compressImage(file, {
            enabled: true,
            mode: imageSettings.imageCompressionMode,
            quality: imageSettings.imageQuality / 100,
            targetSize: targetSize,
            maxWidth: imageSettings.imageMaxWidth,
            maxHeight: imageSettings.imageMaxHeight
          })
          
          console.log(`压缩设置: 模式=${imageSettings.imageCompressionMode === 'quality' ? '按质量' : '按文件大小'}, 质量=${imageSettings.imageQuality}%, 最大尺寸=${imageSettings.imageMaxWidth}x${imageSettings.imageMaxHeight}`)
          console.log(`压缩结果: ${(originalSize / 1024).toFixed(1)}KB -> ${(file.size / 1024).toFixed(1)}KB`)
        } else {
          if (isHEIC) {
            console.log('HEIC 文件跳过压缩（将在服务器端转换）')
            // 通知用户 HEIC 文件将在服务器端转换
            onNotify?.('HEIC 文件将在服务器端自动转换为 JPEG', 'info')
          } else {
            console.log('图片压缩已禁用')
          }
        }
      } catch (error) {
        console.error('图片压缩失败:', error)
        // 压缩失败，使用原文件
      }

      formData.append('images', file)
      console.log(`添加文件到 FormData: ${file.name}, 大小: ${file.size}`)
    }

    try {
      console.log('开始上传图片...')
      const response = await fetch('/api/image/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      console.log('服务器返回:', result)
      
      if (result.ok) {
        // 打印每个上传的图片信息
        result.images.forEach(img => {
          console.log(`上传成功: filename="${img.filename}", alt="${img.alt}", url="${img.url}"`)
        })
        
        setUploadedImages(prev => [...result.images, ...prev])
        // 如果当前在图片库标签页，刷新图片库
        if (activeTab === 'library') {
          loadLibraryImages()
        }
        onNotify?.(`成功上传 ${result.images.length} 张图片`, 'success')
        
        // 自动滚动到上传的图片位置
        setTimeout(() => {
          if (recentUploadsRef.current) {
            recentUploadsRef.current.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'nearest' 
            })
          }
        }, 100)
      } else {
        onNotify?.(`上传失败: ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('上传错误:', error)
      onNotify?.('上传失败，请重试', 'error')
    } finally {
      setUploading(false)
    }
  }, [imageSettings, activeTab, loadLibraryImages, onNotify])

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

  // 处理粘贴事件
  const handlePaste = useCallback((e) => {
    // 只在上传标签页处理粘贴
    if (activeTab !== 'upload') return

    const items = e.clipboardData?.items
    if (!items) return

    // 检查是否有图片文件
    let hasImage = false
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.startsWith('image/')) {
        hasImage = true
        const file = item.getAsFile()
        if (file) {
          handleFileUpload([file])
        }
        break
      }
    }

    // 如果没有图片文件，检查是否有文本（可能是图片链接）
    if (!hasImage) {
      const text = e.clipboardData?.getData('text')
      if (text && text.trim()) {
        // 简单判断是否是图片链接
        const imageUrlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?.*)?$/i
        if (imageUrlPattern.test(text.trim())) {
          // 切换到图片链接标签页并填入链接
          setActiveTab('link')
          setImageUrl(text.trim())
          onNotify?.('已自动填入图片链接', 'success')
        }
      }
    }
  }, [activeTab, handleFileUpload, onNotify])

  // 添加粘贴事件监听
  useEffect(() => {
    if (isOpen && activeTab === 'upload') {
      window.addEventListener('paste', handlePaste)
      return () => {
        window.removeEventListener('paste', handlePaste)
      }
    }
  }, [isOpen, activeTab, handlePaste])

  // 插入图片链接
  const handleInsertLink = () => {
    if (!imageUrl.trim()) {
      onNotify?.('请输入图片链接', 'error')
      return
    }

    const alt = imageAlt.trim() || '图片'
    const title = imageTitle.trim()
    
    // 如果有标题，使用 Markdown 的 title 语法
    const markdown = title 
      ? `![${alt}](${imageUrl} "${title}")`
      : `![${alt}](${imageUrl})`
    
    onInsertImage(markdown)
    onClose()
  }

  // 删除图片
  const handleDeleteImage = useCallback(async (image) => {
    // 直接删除，不再显示系统确认框
    
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
        onNotify?.('图片已删除', 'success')
      } else {
        onNotify?.(`删除失败: ${result.message}`, 'error')
      }
    } catch (error) {
      console.error('删除图片错误:', error)
      onNotify?.('删除失败，请重试', 'error')
    }
  }, [loadLibraryImages])

  // 批量删除图片
  const handleBatchDelete = useCallback(async () => {
    if (selectedImages.length === 0) {
      onNotify?.('请先选择要删除的图片', 'error')
      return
    }
    
    // 直接删除，不再显示系统确认框
    
    try {
      let successCount = 0
      let failCount = 0
      
      for (const image of selectedImages) {
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
            successCount++
          } else {
            failCount++
          }
        } catch (error) {
          console.error('删除图片错误:', error)
          failCount++
        }
      }
      
      // 刷新图片库
      loadLibraryImages()
      
      // 清空选择
      setSelectedImages([])
      setSelectionMode(false)
      
      onNotify?.(`删除完成！成功: ${successCount}，失败: ${failCount}`, successCount > 0 ? 'success' : 'error')
    } catch (error) {
      console.error('批量删除错误:', error)
      onNotify?.('批量删除失败，请重试', 'error')
    }
  }, [selectedImages, loadLibraryImages])

  // 切换图片选择
  const toggleImageSelection = useCallback((image) => {
    setSelectedImages(prev => {
      const isSelected = prev.some(img => img.url === image.url)
      if (isSelected) {
        return prev.filter(img => img.url !== image.url)
      } else {
        return [...prev, image]
      }
    })
  }, [])

  // 全选/取消全选
  const toggleSelectAll = useCallback(() => {
    if (selectedImages.length === libraryImages.length) {
      setSelectedImages([])
    } else {
      setSelectedImages([...libraryImages])
    }
  }, [selectedImages, libraryImages])

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
          <button
            className={`tab-button ${activeTab === 'compression' ? 'active' : ''}`}
            onClick={() => setActiveTab('compression')}
          >
            <ImageUp size={18} />
            <span>图片设置</span>
          </button>
        </div>

        {/* 内容区域 */}
        <div className="image-manager-content">
          {/* 上传图片标签页 */}
          {activeTab === 'upload' && (
            <div className="upload-tab">
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
                <p>拖拽图片到此处、点击选择文件或按 Ctrl+V 粘贴</p>
                <button 
                  className="select-button"
                  onClick={handleSelectClick}
                  disabled={uploading}
                >
                  <ImageIcon size={18} />
                  {uploading ? '上传中...' : '选择图片'}
                </button>
                <p className="upload-hint">
                  支持 JPG、PNG、GIF、WebP 格式，单个文件最大 {imageSettings.maxFileSize}MB<br />
                  粘贴图片链接将自动跳转到"图片链接"标签页
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

              <div className="current-storage">
                <Folder size={16} />
                <span>当前图床：</span>
                <strong>本地存储</strong>
                <span className="star"><Star size={16} fill="currentColor" /></span>
                <button className="settings-icon-btn">
                  <Settings size={16} />
                </button>
              </div>

              {/* 最近上传 */}
              {uploadedImages.length > 0 && (
                <div className="recent-uploads" ref={recentUploadsRef}>
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
              <div className="form-group">
                <label>图片标题（可选）</label>
                <input
                  type="text"
                  placeholder="图片标题"
                  value={imageTitle}
                  onChange={(e) => setImageTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleInsertLink()}
                />
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
                  {libraryImages.map((image, index) => {
                    const isSelected = selectedImages.some(img => img.url === image.url)
                    return (
                      <div 
                        key={index} 
                        className={`image-item ${selectionMode ? 'selection-mode' : ''} ${isSelected ? 'selected' : ''}`}
                      >
                        {selectionMode && (
                          <div 
                            className="image-checkbox"
                            onClick={() => toggleImageSelection(image)}
                          >
                            {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                          </div>
                        )}
                        <img 
                          src={image.url} 
                          alt={image.alt || '图片'} 
                          onClick={() => {
                            if (selectionMode) {
                              toggleImageSelection(image)
                            } else {
                              setPreviewImage(image)
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                        {!selectionMode && (
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
                        )}
                        <div className="image-info">
                          <span className="image-filename" title={image.filename}>
                            {image.filename}
                          </span>
                          <span className="image-size">
                            {(image.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                        {!selectionMode && (
                          <div className="image-overlay">
                            <button onClick={() => handleInsertUploaded(image)}>
                              插入
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
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

          {/* 图片设置标签页 */}
          {activeTab === 'compression' && (
            <div className="compression-tab">
              <div className="compression-settings">
                <h3 className="section-title">图片压缩设置</h3>
                
                <div className="setting-item">
                  <div className="setting-label">
                    <label>自动压缩图片</label>
                    <p className="setting-description">上传图片时自动压缩以节省空间</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={imageSettings.imageCompression}
                      onChange={(e) => handleImageSettingChange('imageCompression', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                {imageSettings.imageCompression && (
                  <>
                    <div className="setting-item">
                      <div className="setting-label">
                        <label>压缩模式</label>
                        <p className="setting-description">选择按质量或按文件大小压缩</p>
                      </div>
                      <select 
                        value={imageSettings.imageCompressionMode} 
                        onChange={(e) => handleImageSettingChange('imageCompressionMode', e.target.value)}
                        className="form-select"
                      >
                        <option value="quality">按质量压缩</option>
                        <option value="size">按文件大小压缩</option>
                      </select>
                    </div>

                    {imageSettings.imageCompressionMode === 'quality' ? (
                      <div className="setting-item slider-item">
                        <div className="setting-label">
                          <label>压缩质量</label>
                          <p className="setting-description">图片压缩质量（50-100，值越大质量越好，文件越大）</p>
                        </div>
                        <div className="slider-control">
                          <ElasticSlider
                            min={50}
                            max={100}
                            value={imageSettings.imageQuality}
                            onChange={(value) => handleImageSettingChange('imageQuality', value)}
                            className="quality-slider"
                          />
                          <span className="slider-value">
                            {imageSettings.imageQuality}%
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="setting-item slider-item">
                        <div className="setting-label">
                          <label>目标文件大小</label>
                          <p className="setting-description">压缩到原始文件大小的百分比（例如：30% 表示压缩到原大小的30%）</p>
                        </div>
                        <div className="slider-control">
                          <ElasticSlider
                            min={5}
                            max={80}
                            value={imageSettings.imageTargetSizePercent}
                            onChange={(value) => handleImageSettingChange('imageTargetSizePercent', value)}
                            className="quality-slider"
                          />
                          <span className="slider-value">
                            {imageSettings.imageTargetSizePercent}%
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="setting-item">
                      <div className="setting-label">
                        <label>最大宽度</label>
                        <p className="setting-description">图片最大宽度（像素）</p>
                      </div>
                      <input
                        type="number"
                        min="800"
                        max="4096"
                        step="100"
                        value={imageSettings.imageMaxWidth}
                        onChange={(e) => handleImageSettingChange('imageMaxWidth', parseInt(e.target.value))}
                        className="form-input"
                        style={{ width: '120px' }}
                      />
                    </div>

                    <div className="setting-item">
                      <div className="setting-label">
                        <label>最大高度</label>
                        <p className="setting-description">图片最大高度（像素）</p>
                      </div>
                      <input
                        type="number"
                        min="600"
                        max="4096"
                        step="100"
                        value={imageSettings.imageMaxHeight}
                        onChange={(e) => handleImageSettingChange('imageMaxHeight', parseInt(e.target.value))}
                        className="form-input"
                        style={{ width: '120px' }}
                      />
                    </div>
                  </>
                )}

                <div className="setting-item">
                  <div className="setting-label">
                    <label>最大文件大小</label>
                    <p className="setting-description">单个上传文件的最大大小（MB）</p>
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="1"
                    value={imageSettings.maxFileSize}
                    onChange={(e) => handleImageSettingChange('maxFileSize', parseInt(e.target.value))}
                    className="form-input"
                    style={{ width: '120px' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="image-manager-footer">
          {activeTab === 'library' && libraryImages.length > 0 && (
            <div className="footer-left-actions">
              {!selectionMode ? (
                <button 
                  className="selection-mode-button"
                  onClick={() => setSelectionMode(true)}
                  title="批量管理"
                >
                  <CheckSquare size={18} />
                  批量管理
                </button>
              ) : (
                <>
                  <button 
                    className="select-all-button"
                    onClick={toggleSelectAll}
                    title={selectedImages.length === libraryImages.length ? '取消全选' : '全选'}
                  >
                    {selectedImages.length === libraryImages.length ? <CheckSquare size={18} /> : <Square size={18} />}
                    {selectedImages.length === libraryImages.length ? '取消全选' : '全选'}
                  </button>
                  <button 
                    className="batch-delete-button"
                    onClick={handleBatchDelete}
                    disabled={selectedImages.length === 0}
                    title="删除选中"
                  >
                    <Trash2 size={18} />
                    删除选中 ({selectedImages.length})
                  </button>
                  <button 
                    className="cancel-selection-button"
                    onClick={() => {
                      setSelectionMode(false)
                      setSelectedImages([])
                    }}
                    title="取消选择"
                  >
                    取消
                  </button>
                </>
              )}
            </div>
          )}
          <div className="footer-right-actions">
            {activeTab === 'link' ? (
              <>
                <button className="cancel-button" onClick={onClose}>
                  取消
                </button>
                <button className="insert-button" onClick={handleInsertLink}>
                  插入图片
                </button>
              </>
            ) : (
              <>
                <button className="close-footer-button" onClick={onClose}>
                  关闭
                </button>
                {activeTab === 'compression' && (
                  <button 
                    className="save-settings-button"
                    onClick={handleSaveImageSettings}
                    disabled={!hasSettingsChanges}
                  >
                    保存设置
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImageManagerDialog

