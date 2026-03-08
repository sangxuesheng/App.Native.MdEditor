# 🚨 重要：部署步骤

## 问题说明

你遇到的 `400 Bad Request` 错误是因为：
- 后端服务正在运行**旧版本**的代码
- 新的 HEIC 转换功能还没有加载

## ✅ 解决方案：重新打包并部署

### 步骤 1: 构建前端
```bash
cd /vol4/1000/开发文件夹/mac
./build-frontend.sh
```

### 步骤 2: 打包应用
```bash
fnpack build
```

这会创建 `App.Native.MdEditor2.fpk` 文件，包含所有更新的代码。

### 步骤 3: 重启服务

**方法 A: 使用 systemctl（需要 root）**
```bash
sudo systemctl restart App.Native.MdEditor2
```

**方法 B: 使用 appcenter-cli**
```bash
appcenter-cli app restart App.Native.MdEditor2
```

**方法 C: 重新安装应用**
```bash
appcenter-cli app uninstall App.Native.MdEditor2
appcenter-cli app install App.Native.MdEditor2.fpk
```

### 步骤 4: 验证部署
```bash
# 检查服务状态
curl http://localhost:18080/health

# 检查转换器 API（新功能）
curl http://localhost:18080/api/image/converter/status
```

**预期响应**:
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

### 步骤 5: 测试上传
1. 打开浏览器访问应用
2. 点击图片上传按钮
3. 选择一个 HEIC 文件
4. 验证上传成功

## 🔍 故障排除

### 如果转换器 API 返回 404
说明服务还在运行旧代码，需要：
1. 确认已运行 `fnpack build`
2. 重新安装应用包

### 如果转换器 API 返回 `available: false`
说明 FFmpeg 未安装，运行：
```bash
sudo apt-get install ffmpeg  # Debian/Ubuntu
# 或
sudo yum install ffmpeg      # CentOS/RHEL
```

### 查看服务日志
```bash
journalctl -u App.Native.MdEditor2 -f
```

## 📋 快速部署脚本

我已经创建了一个部署脚本：
```bash
./deploy-heic.sh
```

这个脚本会：
1. 检查代码是否更新
2. 提示重启服务
3. 验证功能是否正常

## ⚠️ 注意事项

1. **必须重新打包**: 修改后端代码后必须运行 `fnpack build`
2. **必须重启服务**: 打包后必须重启服务才能加载新代码
3. **开发模式**: 如果在开发模式下测试，确保后端服务指向正确的代码路径

## 🎯 完整部署流程

```bash
# 1. 构建前端
./build-frontend.sh

# 2. 打包应用
fnpack build

# 3. 重启服务（选择一种方法）
sudo systemctl restart App.Native.MdEditor2
# 或
appcenter-cli app restart App.Native.MdEditor2

# 4. 验证
curl http://localhost:18080/api/image/converter/status

# 5. 测试
# 在浏览器中上传 HEIC 文件
```

## ✅ 验证清单

部署后检查：
- [ ] 服务正常运行
- [ ] `/api/image/converter/status` 返回正确响应
- [ ] 可以选择 HEIC 文件
- [ ] HEIC 文件上传成功
- [ ] 转换后的图片正常显示

---

**当前状态**: 代码已更新，等待部署  
**下一步**: 运行 `fnpack build` 并重启服务
