# HEIC/HEIF 图片格式支持

## 功能说明

Markdown 编辑器现已支持上传 HEIC/HEIF 格式的图片文件。上传时会自动使用 FFmpeg 将其转换为 JPEG 格式。

## 系统要求

需要在服务器上安装 FFmpeg：

### Debian/Ubuntu
```bash
apt-get update
apt-get install ffmpeg
```

### CentOS/RHEL
```bash
yum install epel-release
yum install ffmpeg
```

### macOS
```bash
brew install ffmpeg
```

## 使用方法

1. **拖拽上传**：直接将 .heic 或 .heif 文件拖拽到上传区域
2. **选择文件**：点击"选择文件"按钮，选择 HEIC/HEIF 文件
3. **自动转换**：系统会自动将 HEIC 转换为 JPEG 格式并保存

## 转换参数

- **输出格式**：JPEG
- **质量**：85（可在代码中调整）
- **文件大小限制**：10MB

## 技术实现

### 前端（ImageUploader.jsx）
- 支持 `.heic` 和 `.heif` 文件扩展名
- 文件类型验证增强

### 后端（server.js + imageConverter.js）
- 使用 FFmpeg 进行格式转换
- 自动检测 HEIC/HEIF 格式
- 转换后保存为 JPEG

## 测试

运行测试脚本检查 FFmpeg 是否正确安装：

```bash
node test-heic-conversion.js
```

## 故障排除

### FFmpeg 未安装
如果上传 HEIC 文件时出现错误，请检查：

1. FFmpeg 是否已安装：
```bash
ffmpeg -version
```

2. 查看服务器日志：
```bash
# 查看应用日志
journalctl -u App.Native.MdEditor2 -f
```

### 转换失败
- 确认文件确实是有效的 HEIC/HEIF 格式
- 检查文件大小是否超过 10MB 限制
- 查看服务器日志获取详细错误信息

## API 端点

### 检查转换器状态
```
GET /api/image/converter/status
```

返回示例：
```json
{
  "ok": true,
  "available": true,
  "tools": {
    "ffmpeg": true
  },
  "recommended": "FFmpeg"
}
```

### 上传图片（支持 HEIC）
```
POST /api/image/upload
Content-Type: multipart/form-data
```

返回示例：
```json
{
  "ok": true,
  "images": [
    {
      "url": "/images/2024/01/15/1234567890_abc123_photo.jpg",
      "filename": "photo.heic",
      "size": 245678,
      "alt": "photo",
      "convertedFrom": "HEIC"
    }
  ]
}
```

## 性能说明

- HEIC 转换通常需要 1-3 秒（取决于文件大小和服务器性能）
- 转换后的 JPEG 文件通常比原始 HEIC 文件略大
- 使用临时文件进行转换，转换完成后自动清理
