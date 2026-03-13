# 🚀 fpk 优化 - 快速参考卡

## 立即开始（3 个命令）

```bash
# 1️⃣ 诊断问题
bash diagnose-fpk-size.sh

# 2️⃣ 运行优化（开发模式，最快）
bash build-and-deploy-optimized.sh --local

# 3️⃣ 验证效果
du -sh *.fpk
```

---

## 常用命令速查

| 场景 | 命令 |
|---|---|
| **开发快速部署** | `bash build-and-deploy-optimized.sh --local` |
| **完整优化发布** | `bash build-and-deploy-optimized.sh` |
| **仅构建前端** | `bash build-and-deploy-optimized.sh --build` |
| **仅打包** | `bash build-and-deploy-optimized.sh --pack` |
| **仅安装** | `bash build-and-deploy-optimized.sh --install` |
| **仅重启** | `bash build-and-deploy-optimized.sh --restart` |
| **诊断大小** | `bash diagnose-fpk-size.sh` |

---

## 优化效果预期

```
优化前：fpk 200MB，安装 5-6 分钟
优化后：fpk 95-110MB，安装 2-3 分钟
改善：50% ↓
```

---

## 优化脚本做了什么

✅ 清理 node_modules 中的不必要文件
✅ 删除前端 source maps
✅ 优化服务端依赖
✅ 使用 .fnpackignore 排除不必要文件
✅ 显示优化前后的大小对比

---

## 文件说明

| 文件 | 用途 |
|---|---|
| `build-and-deploy-optimized.sh` | 优化版构建脚本 ⭐ |
| `diagnose-fpk-size.sh` | 打包大小诊断工具 ⭐ |
| `.fnpackignore` | fnpack 排除配置 |
| `QUICK_START_OPTIMIZATION.md` | 快速开始指南 |
| `FPK_OPTIMIZATION_GUIDE.md` | 详细优化指南 |
| `OPTIMIZATION_SUMMARY.md` | 完整方案总结 |

---

## 开发工作流

```
修改代码
    ↓
bash build-and-deploy-optimized.sh --local    # 2-3 分钟
    ↓
验证功能：http://192.168.2.2:18080/
    ↓
完成开发
    ↓
bash build-and-deploy-optimized.sh            # 3-5 分钟
    ↓
上传应用市场
```

---

## 进阶优化（可选）

- 使用 pnpm 替代 npm（节省 50%+ 空间）
- 使用 npm ci 替代 npm install（更快）
- 配置 CDN 加速下载
- 分离前端和服务端依赖

详见 `FPK_OPTIMIZATION_GUIDE.md`

---

## 常见问题

**Q: 会删除我的代码吗？**
A: 不会，只删除不必要的文件。

**Q: 删除 source maps 后无法调试？**
A: 生产环境不需要 source maps。

**Q: 能否进一步优化？**
A: 可以，详见详细指南。

**Q: 如何回滚？**
A: 原脚本 `build-and-deploy.sh` 仍可用。

---

## 监控指标

```bash
# 查看 fpk 大小
ls -lh *.fpk

# 查看 node_modules 大小
du -sh app/ui/frontend/node_modules
du -sh app/server/node_modules

# 查看前端构建产物
du -sh app/ui/frontend/dist
```

---

## 需要帮助？

1. 快速开始：`QUICK_START_OPTIMIZATION.md`
2. 详细指南：`FPK_OPTIMIZATION_GUIDE.md`
3. 完整总结：`OPTIMIZATION_SUMMARY.md`
4. 诊断工具：`bash diagnose-fpk-size.sh`

---

**应用：** App.Native.MdEditor2
**优化目标：** fpk 减少 50%，安装快 50%
**创建日期：** 2026-03-13
