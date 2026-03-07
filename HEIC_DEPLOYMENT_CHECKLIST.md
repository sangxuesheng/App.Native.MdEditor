# HEIC 功能部署检查清单

## 部署前检查

### 1. 系统环境
- [ ] 确认服务器操作系统版本
- [ ] 检查是否有 root/sudo 权限（安装 FFmpeg 需要）

### 2. 安装 FFmpeg
```bash
# 检查是否已安装
ffmpeg -version

# 如果未安装，根据系统选择命令：

# Debian/Ubuntu
sudo apt-get update
sudo apt-get install ffmpeg

# CentOS/RHEL
sudo yum install epel-release
sudo yum install ffmpeg

# macOS
brew install ffmpeg
```

### 3. 验证安装
```bash
# 运行测试脚本
cd /vol4/1000/开发文件夹/mac
node test-heic-conversion.js
```

预期输出：
```
=== HEIC 转换功能测试 ===
1. 检查 FFmpeg 状态...
✅ FFmpeg 可用
```

## 代码检查

### 4. 文件完整性
- [ ] `app/server/imageConverter.js` - 转换模块
- [ ] `app/server/server.js` - 服务器集成
- [ ] `app/ui/frontend/src/components/ImageUploader.jsx` - 前端上传组件
- [ ] `cmd/install_init` - 安装检查脚本

### 5. 语法检查
```bash
cd /vol4/1000/开发文件夹/mac
node -c app/server/imageConverter.js
node -c app/server/server.js
```

## 部署步骤

### 6. 更新版本
- [ ] `manifest` 文件版本号已更新为 1.24.0
- [ ] 描述信息已更新

### 7. 构建前端（如果需要）
```bash
cd app/ui/frontend
npm run build
```

### 8. 重启服务
```bash
# 根据实际部署方式选择：
systemctl restart App.Native.MdEditor2
# 或
pm2 restart App.Native.MdEditor2
# 或手动重启
```

## 功能测试

### 9. 基础功能测试
- [ ] 访问应用首页，确认正常加载
- [ ] 检查转换器状态 API：
```bash
curl http://localhost:18080/api/image/converter/status
```

预期返回：
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

### 10. HEIC 上传测试
- [ ] 准备一个 HEIC 测试文件
- [ ] 打开编辑器，点击图片上传
- [ ] 拖拽或选择 HEIC 文件
- [ ] 确认上传成功并自动转换为 JPEG
- [ ] 检查图片在预览区正常显示
- [ ] 验证 Markdown 中的图片链接正确

### 11. 兼容性测试
- [ ] 测试 JPG 上传（确保不影响现有功能）
- [ ] 测试 PNG 上传
- [ ] 测试 GIF 上传
- [ ] 测试 WebP 上传

### 12. 错误处理测试
- [ ] 上传超大文件（>10MB），确认错误提示
- [ ] 上传非图片文件，确认错误提示
- [ ] 如果 FFmpeg 未安装，确认友好错误提示

## 性能测试

### 13. 转换性能
- [ ] 测试小文件（<1MB）转换时间
- [ ] 测试中等文件（1-5MB）转换时间
- [ ] 测试大文件（5-10MB）转换时间
- [ ] 确认转换过程中服务器响应正常

### 14. 并发测试
- [ ] 同时上传多个 HEIC 文件
- [ ] 确认所有文件都能正确转换

## 监控和日志

### 15. 日志检查
```bash
# 查看应用日志
tail -f /var/log/App.Native.MdEditor2/app.log

# 或使用 journalctl
journalctl -u App.Native.MdEditor2 -f
```

关注日志中的关键信息：
- FFmpeg 命令执行
- 转换成功/失败消息
- 临时文件清理

### 16. 磁盘空间监控
- [ ] 检查临时目录空间（/tmp）
- [ ] 检查图片存储目录空间（/var/apps/App.Native.MdEditor2/shares/images）

## 文档更新

### 17. 用户文档
- [ ] `HEIC_SUPPORT.md` - 功能说明文档
- [ ] `RELEASE_NOTES_v1.24.0.md` - 发布说明

### 18. 开发文档
- [ ] 代码注释完整
- [ ] API 文档更新

## 回滚计划

### 19. 备份
- [ ] 备份当前版本代码
- [ ] 记录当前版本号（v1.23.0）

### 20. 回滚步骤（如果需要）
```bash
# 1. 恢复旧版本代码
git checkout v1.23.0

# 2. 重启服务
systemctl restart App.Native.MdEditor2

# 3. 验证功能正常
```

## 完成确认

- [ ] 所有检查项通过
- [ ] 功能测试通过
- [ ] 性能测试通过
- [ ] 文档完整
- [ ] 团队成员已通知

## 问题记录

如果遇到问题，记录在此：

| 问题 | 解决方案 | 状态 |
|------|----------|------|
|      |          |      |

## 签署

- 部署人员：__________
- 测试人员：__________
- 审核人员：__________
- 部署日期：__________

---

**注意事项：**
1. 在生产环境部署前，建议先在测试环境完整测试
2. 确保有完整的备份和回滚方案
3. 部署时选择低峰时段
4. 部署后持续监控 24 小时
