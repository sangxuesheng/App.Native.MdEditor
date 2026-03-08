# HEIC 支持部署检查清单

## ✅ 实现完成检查

- [x] 创建 `imageConverter.js` 转换模块
- [x] 更新 `server.js` 集成转换功能
- [x] 添加 `/api/image/converter/status` API
- [x] 修改 `/api/image/upload` 支持 HEIC
- [x] 创建 FFmpeg 安装脚本
- [x] 创建功能测试脚本
- [x] 创建上传测试脚本
- [x] 编写完整使用文档
- [x] 代码语法检查通过
- [x] FFmpeg 已安装并可用

## 🧪 测试清单

### 1. 环境检查

```bash
# FFmpeg 版本
ffmpeg -version
# ✅ 已安装: ffmpeg version 5.1.4-0+deb12u1

# Node.js 版本
node --version

# 服务器文件
ls -l app/server/imageConverter.js app/server/server.js
```

### 2. 功能测试

```bash
# 测试 FFmpeg 功能
./test-heic-converter.sh

# 预期输出：
# ✓ 服务器运行正常
# ✓ FFmpeg 已安装
# ✓ FFmpeg 转换测试成功
```

### 3. API 测试

```bash
# 启动服务器
cd app/server && node server.js &

# 健康检查
curl http://localhost:18080/health
# 预期: {"ok":true,"app":"App.Native.MdEditor"}

# 转换工具状态
curl http://localhost:18080/api/image/converter/status
# 预期: {"ok":true,"available":true,"tools":{"ffmpeg":true},...}
```

### 4. 上传测试

```bash
# 使用实际 HEIC 文件测试
./test-heic-upload.sh /path/to/photo.heic

# 预期输出：
# ✓ 上传成功！
# ✓ HEIC 已自动转换为 JPEG
# 图片 URL: http://localhost:18080/images/...
```

### 5. 浏览器测试

- [ ] 打开编辑器页面
- [ ] 点击图片上传按钮
- [ ] 选择 HEIC 格式图片
- [ ] 确认自动转换并插入
- [ ] 检查图片正常显示

## 📋 部署步骤

### 开发环境

```bash
# 1. 确认 FFmpeg 已安装
ffmpeg -version

# 2. 测试功能
./test-heic-converter.sh

# 3. 启动服务器
cd app/server
node server.js

# 4. 在浏览器中测试
# 打开 http://localhost:18080
```

### 生产环境

```bash
# 1. 安装 FFmpeg（如需要）
sudo ./install-ffmpeg.sh

# 2. 构建前端
cd app/ui/frontend
npm run build

# 3. 使用 PM2 启动
pm2 start app/server/server.js --name mdeditor-backend
pm2 save
pm2 startup

# 4. 验证功能
curl http://localhost:18080/api/image/converter/status
```

## 🔍 验证要点

### 代码验证

- [x] `imageConverter.js` 语法正确
- [x] `server.js` 语法正确
- [x] 异步处理正确实现
- [x] 错误处理完善
- [x] 临时文件清理机制

### 功能验证

- [ ] HEIC 文件可以上传
- [ ] 自动转换为 JPEG
- [ ] 返回转换信息
- [ ] 图片正常显示
- [ ] 批量上传正常

### 性能验证

- [ ] 转换时间 < 1秒
- [ ] 内存占用正常
- [ ] 无内存泄漏
- [ ] 临时文件正确清理

## 📊 预期结果

### API 响应示例

**转换工具状态：**
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

**上传成功响应：**
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

## 🚨 常见问题

### FFmpeg 未安装

**症状：** 上传 HEIC 返回 "FFmpeg 未安装或不可用"

**解决：**
```bash
sudo ./install-ffmpeg.sh
```

### 转换失败

**症状：** 上传返回 "HEIC 转换失败"

**检查：**
```bash
# 手动测试 FFmpeg
ffmpeg -i test.heic test.jpg

# 查看服务器日志
# 检查错误信息
```

### 服务器无响应

**症状：** 无法访问 API

**检查：**
```bash
# 检查服务器是否运行
curl http://localhost:18080/health

# 检查端口占用
netstat -tlnp | grep 18080

# 重启服务器
cd app/server && node server.js
```

## 📚 文档参考

- `HEIC快速参考.md` - 快速参考卡片
- `HEIC_FFmpeg使用指南.md` - 完整使用文档
- `HEIC实现完成总结.md` - 实现总结
- `HEIC转换部署指南.md` - 部署指南

## ✅ 最终确认

- [x] 所有代码文件已创建
- [x] 所有脚本已创建并可执行
- [x] 所有文档已创建
- [x] 代码语法检查通过
- [x] FFmpeg 已安装
- [ ] 功能测试通过（待测试）
- [ ] 浏览器测试通过（待测试）

## 🎉 完成状态

**实现状态：** ✅ 完成  
**代码状态：** ✅ 已提交  
**测试状态：** ⏳ 待测试  
**部署状态：** ⏳ 待部署  

---

**下一步：** 运行 `./test-heic-converter.sh` 进行功能测试
