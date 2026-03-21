import re

# 读取文件
with open('app/ui/frontend/src/components/ImageManagerDialog.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 更新import语句，添加useEffect和RefreshCw
content = re.sub(
    r"import React, \{ useState, useRef, useCallback \} from 'react'",
    "import React, { useState, useRef, useCallback, useEffect } from 'react'",
    content
)

content = re.sub(
    r"import \{ X, Upload, Link as LinkIcon, Image as ImageIcon, Settings, Folder \} from 'lucide-react'",
    "import { X, Upload, Link as LinkIcon, Image as ImageIcon, Settings, Folder, RefreshCw } from 'lucide-react'",
    content
)

# 2. 添加新的state变量
old_state = r"  const \[uploading, setUploading\] = useState\(false\)\n  const fileInputRef = useRef\(null\)"
new_state = """  const [uploading, setUploading] = useState(false)
  const [libraryImages, setLibraryImages] = useState([])
  const [loadingLibrary, setLoadingLibrary] = useState(false)
  const fileInputRef = useRef(null)"""

content = re.sub(old_state, new_state, content)

# 3. 添加加载图片库的函数
load_library_func = """
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

"""

# 在handleFileUpload之前插入
content = re.sub(
    r"(\n  // 处理文件上传)",
    load_library_func + r"\1",
    content
)

# 4. 更新handleFileUpload，上传成功后刷新图片库
old_upload_success = r"        setUploadedImages\(prev => \[\.\.\.result\.images, \.\.\.prev\]\)\n        alert\(`成功上传 \$\{result\.images\.length\} 张图片`\)"
new_upload_success = """        setUploadedImages(prev => [...result.images, ...prev])
        // 如果当前在图片库标签页，刷新图片库
        if (activeTab === 'library') {
          loadLibraryImages()
        }
        alert(`成功上传 ${result.images.length} 张图片`)"""

content = re.sub(old_upload_success, new_upload_success, content)

# 5. 替换图片库标签页的内容
old_library_tab = r'''          \{/\* 图片库标签页 \*/\}
          \{activeTab === 'library' && \(
            <div className="library-tab">
              <div className="empty-state">
                <ImageIcon size=\{64\} />
                <h3>图片库为空</h3>
                <p>上传图片后会显示在这里</p>
              </div>
            </div>
          \)\}'''

new_library_tab = '''          {/* 图片库标签页 */}
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
          )}'''

content = re.sub(old_library_tab, new_library_tab, content, flags=re.DOTALL)

# 写回文件
with open('app/ui/frontend/src/components/ImageManagerDialog.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("图片库功能已添加")
