import re

# 读取ImageManagerDialog.jsx
with open('app/ui/frontend/src/components/ImageManagerDialog.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 添加Trash图标导入
content = re.sub(
    r"import \{ X, Upload, Link as LinkIcon, Image as ImageIcon, Settings, Folder, RefreshCw \} from 'lucide-react'",
    "import { X, Upload, Link as LinkIcon, Image as ImageIcon, Settings, Folder, RefreshCw, Trash2 } from 'lucide-react'",
    content
)

# 2. 添加删除图片的函数
delete_function = """
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

"""

# 在handleInsertUploaded之前插入
pattern = r'(\n  // 插入已上传的图片\n  const handleInsertUploaded)'
content = re.sub(pattern, delete_function + r'\1', content)

# 3. 更新图片卡片，添加删除按钮
old_image_item = r'''                  <div key={index} className="image-item">
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
                    </div>'''

new_image_item = r'''                  <div key={index} className="image-item">
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
                    </div>'''

content = content.replace(old_image_item, new_image_item)

# 写回文件
with open('app/ui/frontend/src/components/ImageManagerDialog.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ 前端删除按钮已添加")
