/**
 * 压缩图片
 * @param {File} file - 原始图片文件
 * @param {number} maxWidth - 最大宽度
 * @param {number} maxHeight - 最大高度
 * @param {number} quality - 压缩质量 (0-1)
 * @returns {Promise<File>} 压缩后的图片文件
 */
export const compressImage = (file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    // 如果文件小于 200KB，不压缩
    if (file.size < 200 * 1024) {
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
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = width * ratio
          height = height * ratio
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
                console.log(`图片已压缩: ${(file.size / 1024).toFixed(1)}KB -> ${(compressedFile.size / 1024).toFixed(1)}KB`)
                resolve(compressedFile)
              } else {
                resolve(file)
              }
            } else {
              resolve(file)
            }
          },
          file.type,
          quality
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
