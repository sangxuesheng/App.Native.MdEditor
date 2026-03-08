# 🔄 重启服务器指南

## 问题诊断

✅ 前端代码：已构建成功  
✅ 后端代码：API 已添加  
❌ 后端服务器：需要重启以加载新 API

---

## 🚀 解决方案

### 方法 1: 重启后端服务器（推荐）

```bash
# 1. 停止当前运行的服务器
pkill -f server.js

# 2. 启动新的服务器
cd /vol4/1000/开发文件夹/mac
./app/server/server.js
```

### 方法 2: 使用 FPK 包（生产环境）

```bash
# 1. 打包新版本
cd /vol4/1000/开发文件夹/mac
bash 快速打包

# 2. 重新安装 FPK
# (根据你的部署方式)
```

---

## ✅ 验证步骤

### 1. 验证后端 API

```bash
curl -X POST http://localhost:18080/api/image/upload \
  -H "Content-Type: application/json"
```

**期望结果**: 应该看到 `INVALID_CONTENT_TYPE` 错误（这是正常的，说明 API 存在）  
**错误结果**: 如果看到 `Not Found`，说明服务器还没重启

### 2. 验证前端

1. 刷新浏览器（Ctrl+Shift+R 强制刷新）
2. 打开开发者工具（F12）
3. 点击工具栏的"图片"按钮
4. 应该看到图片管理对话框

---

## 🐛 常见问题

### 问题 1: handleImageInsert is not defined

**原因**: 开发服务器缓存  
**解决**: 
- 停止开发服务器（Ctrl+C）
- 重新运行 `npm run dev`
- 或者使用生产构建

### 问题 2: POST /api/image/upload 404

**原因**: 后端服务器未重启  
**解决**: 按照上面的方法 1 重启后端服务器

### 问题 3: 图片上传失败

**原因**: 可能是权限或路径问题  
**解决**: 
- 检查授权目录配置
- 确保有写入权限
- 查看服务器日志

---

## 📝 完整重启流程

```bash
# 1. 停止所有服务
pkill -f server.js
# 如果使用开发服务器，也停止它（Ctrl+C）

# 2. 重新构建前端（如果有修改）
cd /vol4/1000/开发文件夹/mac/app/ui/frontend
export PATH=/var/apps/nodejs_v22/target/bin:$PATH
npm run build

# 3. 启动后端服务器
cd /vol4/1000/开发文件夹/mac
./app/server/server.js &

# 4. 验证
curl -X POST http://localhost:18080/api/image/upload \
  -H "Content-Type: application/json"

# 5. 打开浏览器测试
# http://localhost:18080
```

---

## 🎯 快速命令

```bash
# 一键重启（复制粘贴执行）
cd /vol4/1000/开发文件夹/mac && \
pkill -f server.js && \
sleep 2 && \
./app/server/server.js &

# 等待 2 秒后验证
sleep 2 && \
curl -X POST http://localhost:18080/api/image/upload \
  -H "Content-Type: application/json"
```

---

**创建时间**: 2026-02-27  
**适用版本**: v1.15.0
