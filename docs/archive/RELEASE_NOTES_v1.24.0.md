# Markdown 编辑器 v1.24.0 发布说明

## 新增功能

### 🎉 支持 HEIC/HEIF 图片格式

现在可以直接上传 iPhone/iPad 拍摄的 HEIC 格式照片，系统会自动转换为 JPEG 格式。

**主要特性：**
- ✅ 支持 `.heic` 和 `.heif` 文件上传
- ✅ 自动使用 FFmpeg 转换为 JPEG 格式
- ✅ 保留原始文件名（支持中文）
- ✅ 转换质量：85%（高质量）
- ✅ 无缝集成到现有上传流程

**使用方法：**
1. 拖拽 HEIC 文件到上传区域
2. 或点击"选择文件"按钮选择 HEIC 文件
3. 系统自动转换并插入到编辑器

## 技术实现

### 前端改进
- `ImageUploader.jsx`：增强文件类型检测，支持 HEIC/HEIF
- 文件选择器接受 `.heic` 和 `.heif` 扩展名
- 更新提示文本显示支持的格式

### 后端改进
- `imageConverter.js`：新增图片转换模块
  - 使用 FFmpeg 进行格式转换
  - 支持质量和尺寸参数配置
  - 自动清理临时文件
- `server.js`：集成转换功能
  - 自动检测 HEIC/HEIF 格式
  - 异步转换处理
  - 转换状态 API 端点

### 安装检查
- `install_init`：增加 FFmpeg 安装检查
- 提供安装建议和警告信息

## 系统要求

需要在服务器上安装 FFmpeg：

```bash
# Debian/Ubuntu
apt-get install ffmpeg

# CentOS/RHEL
yum install ffmpeg

# macOS
brew install ffmpeg
```

## API 变更

### 新增端点

**GET /api/image/converter/status**
检查图片转换器状态

响应示例：
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

### 修改端点

**POST /api/image/upload**
现在支持 HEIC/HEIF 格式，返回数据增加转换信息：

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

## 测试

提供测试脚本验证功能：

```bash
node test-heic-conversion.js
```

## 性能说明

- HEIC 转换时间：1-3 秒（取决于文件大小）
- 转换后文件大小：通常与原文件相近或略大
- 内存使用：转换过程使用临时文件，完成后自动清理

## 兼容性

- ✅ 向后兼容：不影响现有图片上传功能
- ✅ 优雅降级：如果 FFmpeg 未安装，会显示友好错误提示
- ✅ 多格式支持：JPG、PNG、GIF、WebP、HEIC、HEIF

## 文档

详细文档请参考：
- `HEIC_SUPPORT.md` - HEIC 功能完整说明
- `test-heic-conversion.js` - 测试脚本

## 升级说明

从 v1.23.0 升级到 v1.24.0：

1. 确保 FFmpeg 已安装
2. 重启应用服务
3. 测试 HEIC 上传功能

## 已知问题

无

## 下一步计划

- 支持更多图片格式（AVIF、WebP2）
- 图片压缩优化选项
- 批量转换功能

---

**发布日期**：2024-01-15  
**版本**：v1.24.0  
**维护者**：YourName
