# fpk 安装速度优化 - 快速开始

## 🚀 三步快速优化

### 第 1 步：诊断当前问题

```bash
bash diagnose-fpk-size.sh
```

这会显示：
- 各个目录的大小
- node_modules 中最大的包
- 可删除的文件统计
- 优化建议

**预期输出示例：**
```
前端 node_modules: 180MB
  - monaco-editor: 45MB
  - mathjax: 25MB
  - mermaid: 18MB
  
可删除的文件:
  - *.map 文件: 35MB
  - *.md 文档: 5MB
  - 构建脚本: 2MB
```

---

### 第 2 步：运行优化构建

```bash
# 开发快速模式（推荐）
bash build-and-deploy-optimized.sh --local

# 或完整优化流程
bash build-and-deploy-optimized.sh
```

**优化脚本会自动：**
- ✅ 清理 node_modules 中的不必要文件
- ✅ 删除前端 source maps
- ✅ 优化服务端依赖
- ✅ 显示优化前后的大小对比

**预期输出：**
```
✅ 清理后 node_modules 大小: 85MB (从 180MB 减少)
✅ 前端构建成功 → dist (42MB)
✅ 打包成功 → App.Native.MdEditor2.fpk (95MB)
```

---

### 第 3 步：验证安装速度

在飞牛 NAS 上：

```bash
# 查看应用安装目录大小
du -sh /var/apps/App.Native.MdEditor2/

# 查看应用启动时间
time curl http://localhost:18080/health
```

---

## 📊 预期效果

| 指标 | 优化前 | 优化后 | 改善 |
|---|---|---|---|
| fpk 文件大小 | 200MB | 95-110MB | 50% ↓ |
| 安装时间 | 5-6 分钟 | 2-3 分钟 | 50% ↓ |
| 应用启动时间 | 3-5 秒 | 2-3 秒 | 30% ↓ |

---

## 🔧 常用命令

```bash
# 仅构建前端（不打包）
bash build-and-deploy-optimized.sh --build

# 仅打包（不构建）
bash build-and-deploy-optimized.sh --pack

# 仅安装已有的 fpk
bash build-and-deploy-optimized.sh --install

# 仅重启应用
bash build-and-deploy-optimized.sh --restart

# 诊断打包大小
bash diagnose-fpk-size.sh
```

---

## 📋 优化清单

在运行优化脚本前，可以手动做这些：

- [ ] 删除项目根目录的 *.md 文档（除了必要的）
- [ ] 删除 *.py 脚本文件
- [ ] 删除 build*.sh、快速*.sh 等临时脚本
- [ ] 清空 .trae/ 目录
- [ ] 清空 app/shares/history/ 目录

```bash
# 一键清理（谨慎执行）
rm -f *.md *.py build*.sh 快速*.sh
rm -rf .trae/ app/shares/history/
```

---

## ⚡ 开发工作流

```
修改代码
    ↓
bash build-and-deploy-optimized.sh --local
    ↓
验证功能：http://192.168.2.2:18080/
    ↓
完成开发
    ↓
bash build-and-deploy-optimized.sh
    ↓
上传到应用市场
```

---

## 🆘 常见问题

**Q: 优化脚本会删除我的代码吗？**
A: 不会。脚本只删除 node_modules 中的不必要文件和构建产物中的 source maps，不会删除源代码。

**Q: 删除 source maps 后无法调试？**
A: 在生产环境中不需要 source maps。开发时可以保留，打包时删除。

**Q: 能否进一步优化？**
A: 可以，详见 `FPK_OPTIMIZATION_GUIDE.md` 中的进阶优化部分。

**Q: 优化后应用功能会受影响吗？**
A: 不会。优化只是删除了不必要的文件，应用功能完全不变。

---

## 📞 需要帮助？

1. 查看详细指南：`FPK_OPTIMIZATION_GUIDE.md`
2. 运行诊断工具：`bash diagnose-fpk-size.sh`
3. 查看脚本日志：脚本会显示每一步的详细信息

---

## 🎯 下一步

1. **立即开始：** `bash diagnose-fpk-size.sh`
2. **运行优化：** `bash build-and-deploy-optimized.sh --local`
3. **验证效果：** 在 NAS 上检查安装时间
4. **持续优化：** 根据诊断结果进行进阶优化
