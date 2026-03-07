# HEIC 功能部署检查清单

## 📋 部署前检查

### 1. 代码完整性 ✅
- [x] 前端 ImageUploader.jsx 已更新
- [x] 后端 server.js 已集成 imageConverter
- [x] imageConverter.js 模块存在且完整
- [x] 安装脚本 cmd/install_init 已更新
- [x] 版本号已更新（v1.26.0）

### 2. 语法验证 ✅
```bash
# 所有文件语法检查通过
node -c app/server/server.js          # ✓
node -c app/server/imageConverter.js  # ✓
node -c test-heic-conversion.js       # ✓
```

### 3. FFmpeg 状态 ✅
```bash
# FFmpeg 已安装并可用
ffmpeg -version  # ✓
node test-heic-conversion.js  # ✓
```

### 4. 文档完整性 ✅
- [x] HEIC_DEPLOYMENT_GUIDE.md - 完整部署指南
- [x] HEIC_QUICK_REFERENCE.md - 快速参考
- [x] HEIC_IMPLEMENTATION_SUMMARY.md - 实现总结
- [x] RELEASE_NOTES_v1.26.0.md - 版本说明
- [x] test-heic-conversion.js - 测试脚本

## 🚀 部署步骤

### 步骤 1: 构建前端
```bash
cd /vol4/1000/开发文件夹/mac
./build-frontend.sh
```

**预期结果**: 
- 前端构建成功
- dist 目录包含最新文件
- 无构建错误

### 步骤 2: 验证 FFmpeg
```bash
# 检查 FFmpeg 版本
ffmpeg -version

# 运行测试脚本
node test-heic-conversion.js
```

**预期结果**:
```
✓ FFmpeg 可用
✓ 转换器状态正常
✓ 测试完成
```

### 步骤 3: 重启服务
```bash
# 重启应用服务
systemctl restart App.Native.MdEditor2

# 检查服务状态
systemctl status App.Native.MdEditor2
```

**预期结果**:
- 服务启动成功
- 无错误日志
- 端口 18080 监听正常

### 步骤 4: 功能测试
```bash
# 测试转换器状态 API
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

### 步骤 5: 前端测试
1. 打开浏览器访问应用
2. 点击图片上传按钮
3. 选择或拖拽 HEIC 文件
4. 验证上传成功
5. 检查图片显示正常

**预期结果**:
- 可以选择 .heic 文件
- 上传进度显示正常
- 转换自动完成（1-3秒）
- 图片插入到编辑器
- 预览区正常显示

## ✅ 验证清单

### 代码层面
- [x] 前端支持 HEIC 文件选择
- [x] 后端异步处理转换
- [x] imageConverter 模块正常工作
- [x] 临时文件自动清理
- [x] 错误处理完善

### 功能层面
- [ ] 可以上传 HEIC 文件
- [ ] 自动转换为 JPEG
- [ ] 转换后图片正常显示
- [ ] 支持批量上传
- [ ] 支持拖拽上传
- [ ] 错误提示友好

### 性能层面
- [ ] 转换时间 < 5秒
- [ ] 不阻塞其他请求
- [ ] 临时文件正确清理
- [ ] 内存使用正常

### 系统层面
- [x] FFmpeg 已安装
- [ ] 服务正常运行
- [ ] 日志无错误
- [ ] 端口正常监听

## 🔍 故障排除

### 问题 1: FFmpeg 未安装
**症状**: 转换器状态显示 `available: false`

**解决方案**:
```bash
# Debian/Ubuntu
apt-get update && apt-get install -y ffmpeg

# CentOS/RHEL
yum install -y epel-release && yum install -y ffmpeg

# 验证
ffmpeg -version
```

### 问题 2: 上传失败
**症状**: 上传 HEIC 文件返回错误

**检查步骤**:
1. 查看服务器日志
   ```bash
   journalctl -u App.Native.MdEditor2 -f
   ```

2. 检查文件大小（< 10MB）

3. 验证文件格式
   ```bash
   file photo.heic
   ```

4. 测试 FFmpeg 转换
   ```bash
   ffmpeg -i photo.heic test.jpg
   ```

### 问题 3: 转换慢
**症状**: 转换时间 > 5秒

**优化建议**:
1. 检查服务器性能
2. 减小文件大小
3. 调整转换质量参数

### 问题 4: 临时文件未清理
**症状**: /tmp 目录占用增加

**检查**:
```bash
# 查看临时文件
ls -lh /tmp/*heic* /tmp/*jpg*

# 手动清理
rm -f /tmp/input_*.heic /tmp/output_*.jpg
```

## 📊 监控指标

### 关键指标
- **转换成功率**: > 95%
- **平均转换时间**: 1-3 秒
- **错误率**: < 5%
- **临时文件清理率**: 100%

### 监控命令
```bash
# 查看服务日志
journalctl -u App.Native.MdEditor2 -f

# 查看临时文件
watch -n 5 'ls -lh /tmp | grep -E "input_|output_"'

# 查看进程
ps aux | grep ffmpeg
```

## 📝 测试用例

### 测试用例 1: 单文件上传
1. 选择一个 HEIC 文件（< 5MB）
2. 点击上传
3. 验证转换成功
4. 检查图片显示

**预期**: 成功上传并显示

### 测试用例 2: 批量上传
1. 选择多个 HEIC 文件
2. 点击上传
3. 验证所有文件转换成功

**预期**: 所有文件成功上传

### 测试用例 3: 大文件上传
1. 选择一个 HEIC 文件（8-10MB）
2. 点击上传
3. 验证转换成功

**预期**: 成功上传，时间 2-3 秒

### 测试用例 4: 错误处理
1. 选择一个损坏的 HEIC 文件
2. 点击上传
3. 验证错误提示

**预期**: 显示友好的错误信息

### 测试用例 5: 中文文件名
1. 选择一个中文文件名的 HEIC 文件
2. 点击上传
3. 验证文件名正确保存

**预期**: 文件名正确显示

## 🎯 性能基准

### 转换时间（参考）
| 文件大小 | 预期时间 |
|---------|---------|
| 1-2 MB  | 1 秒    |
| 2-5 MB  | 1-2 秒  |
| 5-8 MB  | 2-3 秒  |
| 8-10 MB | 3-4 秒  |

### 资源占用（参考）
- **CPU**: 转换时 20-40%
- **内存**: < 100MB
- **磁盘**: 临时文件 < 20MB

## 📚 相关文档

1. **HEIC_DEPLOYMENT_GUIDE.md** - 详细部署指南
2. **HEIC_QUICK_REFERENCE.md** - 快速参考
3. **HEIC_IMPLEMENTATION_SUMMARY.md** - 实现总结
4. **RELEASE_NOTES_v1.26.0.md** - 版本说明

## ✅ 最终确认

部署前请确认：

- [ ] 所有代码已提交
- [ ] 前端已构建
- [ ] FFmpeg 已安装
- [ ] 测试脚本通过
- [ ] 文档已完善
- [ ] 版本号已更新

部署后请验证：

- [ ] 服务正常运行
- [ ] API 端点正常
- [ ] 前端功能正常
- [ ] 转换功能正常
- [ ] 日志无错误

---

**检查清单版本**: v1.0  
**适用版本**: v1.26.0  
**最后更新**: 2024-03-07
