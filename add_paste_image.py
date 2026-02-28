import re

# 读取文件
with open('app/ui/frontend/src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 查找 handleEditorMount 函数的位置
pattern = r'(  const handleEditorMount = \(editor\) => \{\s+editorRef\.current = editor\s+)'

# 要插入的粘贴图片处理代码
paste_handler = '''// 监听粘贴事件，处理图片粘贴
    const domNode = editor.getDomNode()
    if (domNode) {
      domNode.addEventListener('paste', async (e) => {
        const items = e.clipboardData?.items
        if (!items) return
        
        // 查找图片项
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          if (item.type.startsWith('image/')) {
            e.preventDefault()
            e.stopPropagation()
            
            const file = item.getAsFile()
            if (!file) continue
            
            // 显示上传提示
            setStatus('正在上传图片...')
            
            try {
              // 上传图片
              const formData = new FormData()
              formData.append('images', file)
              
              const response = await fetch('/api/image/upload', {
                method: 'POST',
                body: formData
              })
              
              const result = await response.json()
              
              if (result.ok && result.images && result.images.length > 0) {
                const image = result.images[0]
                const markdown = `![图片](${image.url})`
                
                // 插入到编辑器
                const selection = editor.getSelection()
                editor.executeEdits('paste-image', [{
                  range: selection,
                  text: markdown,
                  forceMoveMarkers: true
                }])
                
                setStatus(`图片上传成功: ${image.filename}`)
                setTimeout(() => setStatus('就绪'), 2000)
              } else {
                setStatus('图片上传失败')
                setTimeout(() => setStatus('就绪'), 2000)
              }
            } catch (error) {
              console.error('上传图片错误:', error)
              setStatus('图片上传失败')
              setTimeout(() => setStatus('就绪'), 2000)
            }
            
            break
          }
        }
      })
    }
    
    '''

# 替换
new_content = re.sub(pattern, r'\1' + paste_handler, content)

# 写回文件
with open('app/ui/frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("✅ 粘贴图片功能已添加")
