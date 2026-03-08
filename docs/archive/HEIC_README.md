# HEIC 格式支持 - README

## 🎉 功能说明

Markdown 编辑器 v1.26.0 现已支持 HEIC/HEIF 图片格式上传，使用 FFmpeg 自动转换为 JPEG。

## ⚡ 快速开始

### 部署（3步）
```bash
# 1. 构建前端
./build-frontend.sh

# 2. 测试功能
node test-heic-conversion.js

# 3. 重启服务
systemctl restart App.Native.MdEditor2
```

### 使用
1. 点击图片上传按钮
2. 选择或拖拽 HEIC 文件
3. 系统自动转换（1-3秒）
4. 图片插入到编辑器

## 📋 文件清单

### 修改的文件（5个）
- `app/ui/frontend/src/components/ImageUploader.jsx` - 前端支持
- `app/server/server.js` - 后端集成
- `cmd/install_init` - 自动安装 FFmpeg
- `manifest` - 版本 1.26.0
- `app/ui/frontend/package.json` - 版本 1.26.0

### 新增的文件（8个）
- `test-heic-conversion.js` - 测试脚本
- `HEIC_DEPLOYMENT_GUIDE.md` - 完整部署指南
- `HEIC_QUICK_REFERENCE.md` - 快速参考
- `HEIC_IMPLEMENTATION_SUMMARY.md` - 实现总结
- `HEIC_DEPLOYMENT_CHECKLIST_FINAL.md` - 部署检查清单
- `HEIC_COMPLETE.md` - 完成总结
- `HEIC_FINAL_REPORT.md` - 最终报告
- `RELEASE_NOTES_v1.26.0.md` - 版本说明

## 📚 文档导航

| 文档 | 用途 | 适合人群 |
|------|------|---------|
| **HEIC_QUICK_REFERENCE.md** | 快速参考 | 所有人 |
| **HEIC_DEPLOYMENT_GUIDE.md** | 完整部署指南 | 运维人员 |
| **HEIC_IMPLEMENTATION_SUMMARY.md** | 技术实现 | 开发人员 |
| **HEIC_DEPLOYMENT_CHECKLIST_FINAL.md** | 部署检查清单 | 运维人员 |
| **HEIC_FINAL_REPORT.md** | 项目总结 | 项目经理 |
| **RELEASE_NOTES_v1.26.0.md** | 版本说明 | 所有人 |

## ✅ 测试验证

```bash
# 检查 FFmpeg
ffmpeg -version

# 运行测试
node test-heic-conversion.js

# 测试 API
curl http://localhost:18080/api/image/converter/status
```

## 🔧 技术栈

- **前端**: React + Vite
- **后端**: Node.js 22.x
- **转换器**: FFmpeg 4.0+
- **格式**: HEIC/HEIF → JPEG

## 📊 性能指标

- **转换时间**: 1-3秒
- **文件大小限制**: 10MB
- **转换质量**: 85
- **并发支持**: 是

## 🐛 故障排除

### FFmpeg 未安装
```bash
apt-get install ffmpeg  # Debian/Ubuntu
yum install ffmpeg      # CentOS/RHEL
```

### 查看日志
```bash
journalctl -u App.Native.MdEditor2 -f
```

### 测试转换
```bash
ffmpeg -i test.heic test.jpg
```

## 📞 支持

- 查看 [部署指南](./HEIC_DEPLOYMENT_GUIDE.md)
- 查看 [快速参考](./HEIC_QUICK_REFERENCE.md)
- 查看 [故障排除](./HEIC_DEPLOYMENT_GUIDE.md#故障排除)

## ✅ 状态

- **版本**: v1.26.0
- **状态**: ✅ 已完成
- **测试**: ✅ 通过
- **可部署**: ✅ 是

---

**最后更新**: 2024-03-07
