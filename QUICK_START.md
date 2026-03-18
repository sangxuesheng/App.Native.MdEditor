# ⚡ 多图床支持 - 快速参考卡片

## 🎯 5 分钟快速开始

### 第 1 步: 准备 (1 分钟)
```bash
cd /vol4/1000/开发文件夹/mac
bash integrate-imagebed.sh
```

### 第 2 步: 后端集成 (2 分钟)
编辑 `app/server/server.js`，参考 `INTEGRATION_GUIDE.md` 添加:
- 导入 ImageBedManager
- 初始化 imagebedManager
- 添加 readMultipartBody 函数
- 添加 API 路由处理

### 第 3 步: 前端集成 (1 分钟)
编辑 `ImageManagerDialog.jsx`，参考 `INTEGRATION_GUIDE.md` 添加:
- 导入 ImagebedSettingsPanel
- 添加"图床设置"标签页
- 添加标签页内容

### 第 4 步: 部署 (1 分钟)
```bash
cd app/ui/frontend && npm run build
cd /vol4/1000/开发文件夹/mac
bash build-and-deploy.sh --local
```

---

## 📚 文档速查表

| 需求 | 文档 | 时间 |
|------|------|------|
| 快速了解项目 | `README_IMAGEBED.md` | 10 分钟 |
| 立即开始集成 | `INTEGRATION_GUIDE.md` | 30 分钟 |
| 查看 API 文档 | `IMAGEBED_QUICK_REFERENCE.md` | 5 分钟 |
| 查看集成清单 | `IMAGEBED_INTEGRATION_CHECKLIST.md` | 5 分钟 |
| 查看项目进度 | `PROJECT_SUMMARY.md` | 10 分钟 |
| 遇到问题 | `INTEGRATION_GUIDE.md` (故障排查) | 5 分钟 |
| 查看所有文档 | `DOCUMENTATION_INDEX.md` | 5 分钟 |

---

## 🔧 常用命令

### 检查文件
```bash
# 检查后端模块
ls -la app/server/imagebed/

# 检查前端组件
ls -la app/ui/frontend/src/components/Imagebed*

# 检查文档
ls -la | grep IMAGEBED
```

### 测试 API
```bash
# 获取图床列表
curl http://localhost:18080/api/imagebed/list

# 添加图床
curl -X POST http://localhost:18080/api/imagebed/add \
  -H "Content-Type: application/json" \
  -d '{"name":"本地","type":"local","config":{}}'

# 上传图片
curl -X POST http://localhost:18080/api/image/upload \
  -F "images=@test.jpg"
```

### 部署应用
```bash
# 快速部署
bash build-and-deploy.sh --local

# 完整部署
bash build-and-deploy.sh

# 重启服务
appcenter-cli stop App.Native.MdEditor2
sleep 2
appcenter-cli start App.Native.MdEditor2
```

---

## 📊 项目统计

| 项目 | 数量 |
|------|------|
| 后端文件 | 11 个 |
| 前端文件 | 4 个 |
| 文档文件 | 20+ 个 |
| 代码行数 | ~3,081 行 |
| 文档行数 | ~4,200 行 |
| 支持图床 | 6 种 |
| API 端点 | 13 个 |
| 完成度 | 75% |

---

## ✅ 集成检查清单

### 后端集成
- [ ] 导入 ImageBedManager
- [ ] 导入 imagebedApi
- [ ] 初始化 imagebedManager
- [ ] 添加 readMultipartBody 函数
- [ ] 添加 API 路由处理
- [ ] 安装依赖 (busboy 等)
- [ ] 重启服务
- [ ] 测试 API

### 前端集成
- [ ] 导入 ImagebedSettingsPanel
- [ ] 添加标签页按钮
- [ ] 添加标签页内容
- [ ] 构建前端
- [ ] 部署应用
- [ ] 验证组件显示

### 验证
- [ ] API 返回正确数据
- [ ] 前端组件正常显示
- [ ] 可以添加图床
- [ ] 可以测试连接
- [ ] 可以上传图片
- [ ] 没有错误

---

## 🎯 支持的图床

```
本地存储  ← 推荐首先测试
GitHub    ← 需要 token
七牛云    ← 需要 key/secret
阿里云    ← 需要 key/secret
腾讯云    ← 需要 key/secret
自定义    ← 灵活配置
```

---

## 🚨 常见问题速解

### API 返回 404
→ 检查路由是否添加到 server.js

### 前端组件不显示
→ 检查导入和标签页代码是否添加

### 上传失败
→ 检查 busboy 是否安装

### 样式错误
→ 清理浏览器缓存，重新构建

### 数据库错误
→ 检查数据库文件权限，重启服务

---

## 📞 获取帮助

| 问题 | 解决方案 |
|------|---------|
| 不知道从哪开始 | 阅读 `README_IMAGEBED.md` |
| 需要集成步骤 | 阅读 `INTEGRATION_GUIDE.md` |
| 需要 API 文档 | 查看 `IMAGEBED_QUICK_REFERENCE.md` |
| 遇到错误 | 查看 `INTEGRATION_GUIDE.md` 故障排查 |
| 需要测试方法 | 查看 `IMAGEBED_PHASE4_TESTING_GUIDE.md` |
| 查看项目进度 | 查看 `PROJECT_SUMMARY.md` |

---

## 🎉 完成后

集成完成后，你将拥有:

✅ 6 种图床支持  
✅ 13 个 API 端点  
✅ 完整的前端 UI  
✅ 响应式设计  
✅ 深色主题支持  
✅ 完善的文档

---

## 📈 预计时间

| 任务 | 时间 |
|------|------|
| 准备环境 | 5 分钟 |
| 后端集成 | 30 分钟 |
| 前端集成 | 30 分钟 |
| 构建部署 | 10 分钟 |
| 验证测试 | 15 分钟 |
| **总计** | **1.5 小时** |

---

## 🚀 立即开始

```bash
cd /vol4/1000/开发文件夹/mac
cat README_IMAGEBED.md
bash integrate-imagebed.sh
cat INTEGRATION_GUIDE.md
# 按照指南进行集成
bash build-and-deploy.sh --local
curl http://localhost:18080/api/imagebed/list
```

---

**项目完成度**: 75% → 准备 100%  
**预计完成**: 本周末  
**祝你集成顺利！** 🎉
