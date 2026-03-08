# HEIC 图片格式支持 - 部署指南

## 功能概述

Markdown 编辑器现已支持 HEIC/HEIF 格式图片上传，使用 FFmpeg 自动转换为 JPEG 格式。

## 已完成的集成

### 1. 前端支持 (ImageUploader.jsx)
- ✅ 文件选择器支持 `.heic` 和 `.heif` 扩展名
- ✅ 文件类型验证增强，支持 HEIC 格式
- ✅ 用户界面提示更新

### 2. 后端转换 (server.js + imageConverter.js)
- ✅ 集成 imageConverter 模块
- ✅ 自动检测 HEIC/HEIF 文件
- ✅ 使用 FFmpeg 转换为 JPEG
- ✅ 转换状态 API 端点
- ✅ 异步处理支持

### 3. 安装脚本 (cmd/install_init)
- ✅ 自动检测并安装 FFmpeg
- ✅ 支持多种 Linux 发行版
- ✅ 安装验证

## 部署步骤

### 1. 构建前端

```bash
cd /vol4/1000/开发文件夹/mac
./build-frontend.sh
```

### 2. 测试 FFmpeg 安装

```bash
# 检查 FFmpeg 是否已安装
ffmpeg -version

# 如果未安装，运行安装脚本
./install-ffmpeg.sh
```

### 3. 测试转换功能

```bash
node test-heic-conversion.js
```

### 4. 重启服务

```bash
# 重启应用服务
systemctl restart App.Native.MdEditor2
```

## API 端点

### 检查转换器状态
```
GET /api/image/converter/status
```

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

### 上传图片（支持 HEIC）
```
POST /api/image/upload
Content-Type: multipart/form-data
```

响应示例（HEIC 文件）：
```json
{
  "ok": true,
  "images": [
    {
      "url": "/images/2024/03/07/1234567890_abc123_photo.jpg",
      "filename": "photo.heic",
      "size": 245678,
      "alt": "photo",
      "convertedFrom": "HEIC"
    }
  ]
}
```

## 转换参数

在 `imageConverter.js` 中可以调整以下参数：

- **输出格式**: JPEG（默认）
- **质量**: 85（范围 1-100）
- **最大宽度/高度**: 可选限制

## 支持的格式

### 输入格式
- HEIC (High Efficiency Image Container)
- HEIF (High Efficiency Image Format)

### 输出格式
- JPEG（默认，质量 85）

## 文件大小限制

- 上传限制: 10MB
- 转换后的 JPEG 文件通常比原始 HEIC 文件略大

## 性能说明

- HEIC 转换通常需要 1-3 秒（取决于文件大小和服务器性能）
- 使用临时文件进行转换，转换完成后自动清理
- 转换过程在后端异步处理，不阻塞其他请求

## 故障排除

### FFmpeg 未安装

**症状**: 上传 HEIC 文件时返回错误

**解决方案**:
```bash
# Debian/Ubuntu
apt-get update && apt-get install -y ffmpeg

# CentOS/RHEL
yum install -y epel-release && yum install -y ffmpeg

# Alpine
apk add --no-cache ffmpeg
```

### 转换失败

**检查步骤**:

1. 验证 FFmpeg 安装：
```bash
ffmpeg -version
```

2. 检查文件是否有效：
```bash
ffmpeg -i test.heic
```

3. 查看服务器日志：
```bash
journalctl -u App.Native.MdEditor2 -f
```

### 权限问题

确保临时目录可写：
```bash
# 检查临时目录权限
ls -la /tmp

# 如果需要，修复权限
chmod 1777 /tmp
```

## 测试清单

- [ ] FFmpeg 已安装并可用
- [ ] 前端可以选择 .heic 文件
- [ ] 上传 HEIC 文件成功转换为 JPEG
- [ ] 转换后的图片可以正常显示
- [ ] 转换器状态 API 返回正确信息
- [ ] 服务器日志无错误

## 版本信息

- **功能版本**: v1.25.0+
- **FFmpeg 最低版本**: 4.0+
- **Node.js 版本**: 22.x

## 相关文件

- `app/ui/frontend/src/components/ImageUploader.jsx` - 前端上传组件
- `app/server/server.js` - 后端服务器
- `app/server/imageConverter.js` - 图片转换模块
- `cmd/install_init` - 安装初始化脚本
- `install-ffmpeg.sh` - FFmpeg 安装脚本
- `test-heic-conversion.js` - 转换功能测试脚本

## 技术细节

### 转换流程

1. 前端上传 HEIC 文件
2. 后端接收并检测文件格式
3. 如果是 HEIC/HEIF，调用 imageConverter
4. imageConverter 使用 FFmpeg 转换为 JPEG
5. 保存转换后的 JPEG 文件
6. 返回图片 URL 给前端
7. 自动清理临时文件

### FFmpeg 命令示例

```bash
ffmpeg -i input.heic -q:v 5 output.jpg
```

参数说明：
- `-i input.heic`: 输入文件
- `-q:v 5`: 质量参数（2-31，数值越小质量越高）
- `output.jpg`: 输出文件

## 未来改进

- [ ] 支持批量转换优化
- [ ] 添加转换进度反馈
- [ ] 支持更多输出格式（PNG, WebP）
- [ ] 可配置的转换参数
- [ ] 转换缓存机制

## 支持

如有问题，请查看：
- 服务器日志
- FFmpeg 文档: https://ffmpeg.org/documentation.html
- HEIC 格式说明: https://en.wikipedia.org/wiki/High_Efficiency_Image_File_Format
