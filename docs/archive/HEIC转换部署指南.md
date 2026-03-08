# 后端 HEIC 转换 - 部署和测试指南

## 当前状态

✅ 后端转换模块已完成  
✅ API 集成完成  
✅ 服务器运行在 18081 端口  
⚠️ 转换工具未安装（需要安装 ImageMagick 或 libheif）

## 快速测试

### 1. 检查服务器状态

```bash
curl http://localhost:18081/health
# 应返回: {"ok":true,"app":"App.Native.MdEditor"}

curl http://localhost:18081/api/image/converter/status
# 应返回转换工具状态
```

### 2. 安装转换工具

**选项 A: ImageMagick（推荐）**
```bash
sudo ./install-imagemagick.sh
```

**选项 B: libheif（轻量级）**
```bash
sudo ./install-libheif.sh
```

### 3. 验证安装

```bash
./test-heic-converter.sh
```

### 4. 测试上传

```bash
# 如果有 HEIC 文件
./test-heic-upload.sh /path/to/photo.heic
```

## 前端测试

1. 确保前端开发服务器运行在 3000 端口
2. 打开浏览器访问 http://localhost:3000
3. 点击图片上传按钮
4. 选择 HEIC 文件上传
5. 查看控制台日志

### 预期行为

**如果转换工具已安装：**
- HEIC 文件自动转换为 JPEG
- 返回转换信息（压缩率等）
- 图片正常显示

**如果转换工具未安装：**
- 返回错误：`HEIC 转换失败: 未安装图片转换工具`
- 提示安装 ImageMagick 或 libheif

## 调试

### 查看服务器日志

```bash
tail -f /tmp/mdeditor-server-18081.log
```

### 测试转换功能

```bash
# 测试 ImageMagick
convert test.heic test.jpg

# 测试 libheif
heif-convert test.heic test.jpg
```

### 常见问题

**1. 端口冲突**
- 18080 端口被占用，改用 18081
- 修改 `vite.config.js` 中的代理配置

**2. 转换失败**
- 检查转换工具是否安装：`which convert` 或 `which heif-convert`
- 查看服务器日志中的错误信息

**3. 文件类型不支持**
- 确保文件扩展名是 `.heic` 或 `.heif`（不区分大小写）
- 检查服务器日志中的 "跳过不支持的文件类型" 消息

## 生产部署

### 1. 安装转换工具

```bash
# 在生产服务器上安装
sudo ./install-imagemagick.sh
```

### 2. 配置环境变量

```bash
export PORT=18080
export TRIM_DATA_ACCESSIBLE_PATHS="/path/to/data"
```

### 3. 启动服务

```bash
cd app/server
node server.js
```

### 4. 使用 PM2 管理进程（推荐）

```bash
npm install -g pm2
pm2 start server.js --name mdeditor-backend
pm2 save
pm2 startup
```

## 性能优化

### 1. 限制并发转换

在 `imageConverter.js` 中添加队列机制：

```javascript
const pLimit = require('p-limit');
const limit = pLimit(3); // 最多同时转换3个文件
```

### 2. 添加转换缓存

缓存已转换的文件，避免重复转换。

### 3. 监控资源使用

```bash
# 监控 CPU 和内存
top -p $(pgrep -f "node server.js")
```

## 文件结构

```
app/server/
├── server.js              # 主服务器（已集成转换功能）
├── imageConverter.js      # 转换核心模块
└── historyManager.js      # 历史管理

scripts/
├── install-imagemagick.sh # ImageMagick 安装脚本
├── install-libheif.sh     # libheif 安装脚本
├── test-heic-converter.sh # 功能测试脚本
└── test-heic-upload.sh    # 上传测试脚本

docs/
├── 后端HEIC转换说明.md    # 完整文档
└── HEIC转换快速开始.md    # 快速指南
```

## API 文档

### GET /api/image/converter/status

检查转换工具状态

**响应：**
```json
{
  "ok": true,
  "available": true,
  "tools": {
    "imageMagick": true,
    "libheif": false
  },
  "recommended": "ImageMagick"
}
```

### POST /api/image/upload

上传图片（支持 HEIC 自动转换）

**请求：**
- Content-Type: multipart/form-data
- 字段名: images
- 支持格式: .jpg, .jpeg, .png, .gif, .webp, .heic, .heif

**响应（HEIC 转换成功）：**
```json
{
  "ok": true,
  "images": [
    {
      "url": "/images/2026/03/07/xxx_photo.jpg",
      "filename": "photo.jpg",
      "size": 245678,
      "alt": "photo",
      "converted": true,
      "originalFilename": "photo.heic",
      "conversionInfo": {
        "originalFormat": "heic",
        "convertedFormat": "jpeg",
        "originalSize": 1234567,
        "convertedSize": 245678,
        "compressionRatio": "80.11%"
      }
    }
  ]
}
```

**响应（转换失败）：**
```json
{
  "ok": false,
  "code": "CONVERSION_ERROR",
  "message": "HEIC 转换失败: 未安装图片转换工具"
}
```

## 下一步

1. ✅ 安装转换工具
2. ✅ 测试 HEIC 上传
3. ⬜ 添加转换进度提示（可选）
4. ⬜ 添加批量转换优化（可选）
5. ⬜ 部署到生产环境

## 支持

如有问题，请查看：
- 服务器日志：`/tmp/mdeditor-server-18081.log`
- 详细文档：`后端HEIC转换说明.md`
- 测试脚本：`test-heic-converter.sh`
