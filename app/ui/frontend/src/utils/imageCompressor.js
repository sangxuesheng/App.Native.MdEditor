/**
 * 获取图片压缩设置
 */
const getCompressionSettings = () => {
  try {
    const savedSettings = localStorage.getItem('md-editor-settings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      return {
        enabled: settings.imageCompression !== false,
        quality: (settings.imageQuality || 80) / 100,
        maxWidth: settings.imageMaxWidth || 1920,
        maxHeight: settings.imageMaxHeight || 1080
      }
    }
  } catch (error) {
    console.error('读取压缩设置失败:', error)
  }
  
  // 默认设置
  return {
    enabled: true,
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080
  }
}

/**
 * 压缩图片
 * @param {File} file - 原始图片文件
 * @param {number} maxWidth - 最大宽度（可选，从设置读取）
 * @param {number} maxHeight - 最大高度（可选，从设置读取）
 * @param {number} quality - 压缩质量（可选，从设置读取）
 * @returns {Promise<File>} 压缩后的图片文件
 */
export const compressImage = (file, maxWidth, maxHeight, quality) => {
  return new Promise((resolve, reject) => {
    // 获取压缩设置
    const settings = getCompressionSettings()
    
    // 如果禁用压缩，直接返回原文件
    if (!settings.enabled) {
      console.log('图片压缩已禁用，使用原文件')
      resolve(file)
      return
    }
    
    // 使用传入的参数或设置中的值
    const finalMaxWidth = maxWidth || settings.maxWidth
    const finalMaxHeight = maxHeight || settings.maxHeight
    const finalQuality = quality || settings.quality
    
    // 如果文件小于 200KB，不压缩
    if (file.size < 200 * 1024) {
      console.log(`文件小于 200KB (${(file.size / 1024).toFixed(1)}KB)，跳过压缩`)
      resolve(file)
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target.result
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        // 计算缩放比例
        if (width > finalMaxWidth || height > finalMaxHeight) {
          const ratio = Math.min(finalMaxWidth / width, finalMaxHeight / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
          console.log(`图片尺寸: ${img.width}x${img.height} -> ${width}x${height}`)
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        
        // 转换为 Blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // 创建新的 File 对象
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })
              
              // 如果压缩后更大，使用原文件
              if (compressedFile.size < file.size) {
                console.log(`图片已压缩: ${(file.size / 1024).toFixed(1)}KB -> ${(compressedFile.size / 1024).toFixed(1)}KB (质量: ${Math.round(finalQuality * 100)}%)`)
                resolve(compressedFile)
              } else {
                console.log(`压缩后文件更大，使用原文件: ${(file.size / 1024).toFixed(1)}KB`)
                resolve(file)
              }
            } else {
              resolve(file)
            }
          },
          file.type,
          finalQuality
        )
      }
      
      img.onerror = () => {
        reject(new Error('图片加载失败'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
  })
}
