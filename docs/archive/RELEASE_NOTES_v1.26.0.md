# 版本更新说明 v1.26.0

## 🎉 新功能：HEIC/HEIF 图片格式支持

### 功能概述

Markdown 编辑器现已支持上传 HEIC/HEIF 格式的图片文件（iPhone 默认照片格式），上传时会自动使用 FFmpeg 转换为 JPEG 格式，确保广泛兼容性。

### 主要特性

✅ **自动格式转换**
- 上传 HEIC/HEIF 文件时自动转换为 JPEG
- 转换过程完全透明，用户无感知
- 保留原始文件名信息

✅ **高质量输出**
- JPEG 质量设置为 85（可配置）
- 保持良好的图片质量和文件大小平衡

✅ **完整的前后端支持**
- 前端文件选择器支持 .heic 和 .heif 扩展名
- 后端自动检测并转换 HEIC 格式
- 转换状态 API 端点

✅ **自动化安装**
- 安装时自动检测并安装 FFmpeg
- 支持多种 Linux 发行版
- 安装验证和错误处理

### 技术实现

#### 前端更新
- `ImageUploader.jsx`: 支持 HEIC/HEIF 文件类型验证
- 文件选择器接受 `.heic` 和 `.heif` 扩展名
- 用户界面提示更新

#### 后端更新
- `server.js`: 集成 imageConverter 模块
- 异步处理 HEIC 转换
- 自动清理临时文件

#### 新增模块
- `imageConverter.js`: FFmpeg 转换封装
- 支持多种转换选项（质量、尺寸等）
- 完善的错误处理

#### 安装脚本
- `cmd/install_init`: 自动安装 FFmpeg
- 支持 Debian/Ubuntu/CentOS/RHEL/Alpine
- 安装验证和状态检查

### 使用方法

1. **上传 HEIC 图片**
   - 拖拽 .heic 文件到上传区域
   - 或点击"选择文件"按钮选择 HEIC 文件
   - 系统自动转换为 JPEG 并插入

2. **检查转换器状态**
   ```bash
   curl http://localhost:18080/api/image/converter/status
   ```

3. **查看转换日志**
   ```bash
   journalctl -u App.Native.MdEditor2 -f
   ```

### API 更新

#### 新增端点

**GET /api/image/converter/status**
- 检查 FFmpeg 转换器是否可用
- 返回转换器状态信息

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

#### 更新端点

**POST /api/image/upload**
- 现在支持 HEIC/HEIF 格式
- 自动转换为 JPEG
- 返回转换信息

响应示例（HEIC 文件）：
```json
{
  "ok": true,
  "images": [{
    "url": "/images/2024/03/07/1234567890_abc123_photo.jpg",
    "filename": "photo.heic",
    "size": 245678,
    "alt": "photo",
    "convertedFrom": "HEIC"
  }]
}
```

### 系统要求

- **FFmpeg**: 4.0+ (安装时自动安装)
- **Node.js**: 22.x
- **磁盘空间**: 转换时需要临时空间（通常 < 20MB）

### 性能说明

- **转换时间**: 1-3 秒（取决于文件大小和服务器性能）
- **文件大小**: 转换后的 JPEG 通常比原始 HEIC 略大
- **并发支持**: 支持多文件同时上传和转换
- **资源占用**: 转换过程使用临时文件，完成后自动清理

### 配置选项

在 `app/server/imageConverter.js` 中可以调整：

```javascript
{
  format: 'jpeg',      // 输出格式
  quality: 85,         // 质量 (1-100)
  maxWidth: undefined, // 最大宽度（可选）
  maxHeight: undefined // 最大高度（可选）
}
```

### 故障排除

#### FFmpeg 未安装
如果转换失败，检查 FFmpeg 是否已安装：
```bash
ffmpeg -version
```

手动安装：
```bash
# Debian/Ubuntu
apt-get install ffmpeg

# CentOS/RHEL
yum install epel-release && yum install ffmpeg

# Alpine
apk add ffmpeg
```

#### 转换失败
查看详细日志：
```bash
journalctl -u App.Native.MdEditor2 -f
```

测试 FFmpeg：
```bash
ffmpeg -i test.heic test.jpg
```

### 测试

运行测试脚本验证功能：
```bash
node test-heic-conversion.js
```

### 文件清单

#### 新增文件
- `app/server/imageConverter.js` - FFmpeg 转换模块
- `test-heic-conversion.js` - 转换功能测试脚本
- `HEIC_DEPLOYMENT_GUIDE.md` - 完整部署指南
- `HEIC_QUICK_REFERENCE.md` - 快速参考文档

#### 修改文件
- `app/ui/frontend/src/components/ImageUploader.jsx` - 前端支持
- `app/server/server.js` - 后端集成
- `cmd/install_init` - 安装脚本更新

#### 保留文件
- `install-ffmpeg.sh` - 独立 FFmpeg 安装脚本
- `HEIC_SUPPORT.md` - 功能说明文档

### 向后兼容性

✅ 完全向后兼容
- 不影响现有图片上传功能
- 仅新增 HEIC/HEIF 格式支持
- 其他图片格式（JPG, PNG, GIF, WebP）保持不变

### 已知限制

1. **文件大小限制**: 10MB（与其他图片格式相同）
2. **转换时间**: 大文件可能需要 2-3 秒
3. **输出格式**: 目前仅支持转换为 JPEG
4. **系统依赖**: 需要 FFmpeg 支持

### 未来改进计划

- [ ] 支持更多输出格式（PNG, WebP）
- [ ] 转换进度实时反馈
- [ ] 批量转换优化
- [ ] 可配置的转换参数界面
- [ ] 转换缓存机制

### 升级说明

#### 从 v1.25.0 升级

1. **更新代码**
   ```bash
   # 拉取最新代码
   git pull
   ```

2. **构建前端**
   ```bash
   ./build-frontend.sh
   ```

3. **重启服务**
   ```bash
   systemctl restart App.Native.MdEditor2
   ```

4. **验证功能**
   ```bash
   node test-heic-conversion.js
   ```

#### 全新安装

安装脚本会自动：
- 检测并安装 FFmpeg
- 配置转换器
- 验证功能可用性

### 贡献者

- 功能设计与实现
- FFmpeg 集成
- 文档编写

### 相关链接

- [完整部署指南](./HEIC_DEPLOYMENT_GUIDE.md)
- [快速参考](./HEIC_QUICK_REFERENCE.md)
- [FFmpeg 官方文档](https://ffmpeg.org/documentation.html)
- [HEIC 格式说明](https://en.wikipedia.org/wiki/High_Efficiency_Image_File_Format)

### 反馈

如有问题或建议，请：
1. 查看故障排除部分
2. 检查服务器日志
3. 运行测试脚本诊断

---

**版本**: v1.26.0  
**发布日期**: 2024-03-07  
**更新类型**: 功能增强
