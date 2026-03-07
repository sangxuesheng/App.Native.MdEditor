# HEIC 支持 - 快速参考

## ✅ 已完成

### 前端 (ImageUploader.jsx)
```javascript
// 文件类型验证
const isImage = file.type.startsWith('image/');
const isHEIC = file.name.toLowerCase().endsWith('.heic') || 
               file.name.toLowerCase().endsWith('.heif');

// 文件选择器
accept="image/*,.heic,.heif"
```

### 后端 (server.js)
```javascript
// 导入转换器
const imageConverter = require('./imageConverter');

// 检测 HEIC 并转换
if (isHEIC) {
  const convertResult = await imageConverter.convertImage(fileContent, originalFilename, {
    format: 'jpeg',
    quality: 85
  });
  fileContent = convertResult.buffer;
  finalExt = '.jpg';
  convertedFrom = 'HEIC';
}
```

### 转换器 (imageConverter.js)
```javascript
// 使用 FFmpeg 转换
async function convertWithFFmpeg(inputBuffer, inputFormat, options) {
  // 写入临时文件
  // 执行 FFmpeg 命令
  // 读取输出文件
  // 清理临时文件
}
```

### 安装脚本 (cmd/install_init)
```bash
# 自动检测并安装 FFmpeg
if ! command -v ffmpeg >/dev/null 2>&1; then
    apt-get install -y ffmpeg  # Debian/Ubuntu
    # 或其他发行版的安装命令
fi
```

## 🚀 快速部署

```bash
# 1. 构建前端
./build-frontend.sh

# 2. 检查 FFmpeg
ffmpeg -version

# 3. 测试转换功能
node test-heic-conversion.js

# 4. 重启服务
systemctl restart App.Native.MdEditor2
```

## 📝 测试清单

- [x] FFmpeg 已安装
- [x] 前端支持 .heic/.heif 文件选择
- [x] 后端集成 imageConverter
- [x] 异步转换处理
- [x] 自动清理临时文件
- [x] 安装脚本自动安装 FFmpeg

## 🔧 关键文件

| 文件 | 说明 |
|------|------|
| `app/ui/frontend/src/components/ImageUploader.jsx` | 前端上传组件 |
| `app/server/server.js` | 后端服务器（已集成转换器） |
| `app/server/imageConverter.js` | FFmpeg 转换模块 |
| `cmd/install_init` | 安装脚本（自动安装 FFmpeg） |
| `test-heic-conversion.js` | 测试脚本 |

## 📊 API 示例

### 检查转换器状态
```bash
curl http://localhost:18080/api/image/converter/status
```

响应：
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

### 上传 HEIC 图片
```bash
curl -X POST http://localhost:18080/api/image/upload \
  -F "image=@photo.heic"
```

响应：
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

## ⚙️ 配置参数

在 `imageConverter.js` 中修改：

```javascript
const convertOptions = {
  format: 'jpeg',      // 输出格式
  quality: 85,         // 质量 (1-100)
  maxWidth: undefined, // 最大宽度（可选）
  maxHeight: undefined // 最大高度（可选）
};
```

## 🐛 故障排除

### FFmpeg 未安装
```bash
# 检查
ffmpeg -version

# 安装
apt-get install ffmpeg  # Debian/Ubuntu
yum install ffmpeg      # CentOS/RHEL
```

### 转换失败
```bash
# 查看日志
journalctl -u App.Native.MdEditor2 -f

# 测试 FFmpeg
ffmpeg -i test.heic test.jpg
```

### 权限问题
```bash
# 检查临时目录
ls -la /tmp

# 修复权限
chmod 1777 /tmp
```

## 📈 性能

- **转换时间**: 1-3 秒（取决于文件大小）
- **文件大小**: JPEG 通常比 HEIC 略大
- **并发处理**: 支持多文件同时上传
- **临时文件**: 自动清理

## 🔄 转换流程

```
用户上传 HEIC
    ↓
前端验证文件类型
    ↓
后端接收文件
    ↓
检测 HEIC 格式
    ↓
调用 imageConverter
    ↓
FFmpeg 转换为 JPEG
    ↓
保存 JPEG 文件
    ↓
返回图片 URL
    ↓
清理临时文件
```

## 📦 版本要求

- **Node.js**: 22.x
- **FFmpeg**: 4.0+
- **应用版本**: v1.25.0+

## 🎯 支持的格式

### 输入
- `.heic` (High Efficiency Image Container)
- `.heif` (High Efficiency Image Format)

### 输出
- `.jpg` / `.jpeg` (默认，质量 85)

## 💡 提示

1. HEIC 是 iPhone 默认的照片格式
2. 转换为 JPEG 可确保广泛兼容性
3. 质量 85 是质量和文件大小的良好平衡
4. 转换过程完全自动，用户无感知
5. 支持中文文件名

## 📚 相关文档

- [完整部署指南](./HEIC_DEPLOYMENT_GUIDE.md)
- [FFmpeg 文档](https://ffmpeg.org/documentation.html)
- [HEIC 格式说明](https://en.wikipedia.org/wiki/High_Efficiency_Image_File_Format)
