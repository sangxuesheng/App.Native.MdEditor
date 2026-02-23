# 自动保存功能 - 构建指南

## 🚀 快速构建

已创建自动化构建脚本：`build-autosave.sh`

### 方法 1: 使用脚本（推荐）

```bash
cd /Users/sangxuesheng/Desktop/开发/App.Native.MdEditor
bash build-autosave.sh
```

脚本会自动完成：
1. ✅ 检查项目目录和依赖
2. ✅ 创建临时构建目录
3. ✅ 复制项目文件
4. ✅ 复制 node_modules
5. ✅ 构建前端
6. ✅ 打包 FPK
7. ✅ 复制到下载目录

---

## 📋 方法 2: 手动构建

如果脚本遇到权限问题，可以手动执行：

### 步骤 1: 构建前端

```bash
cd /Users/sangxuesheng/Desktop/开发/App.Native.MdEditor/app/ui/frontend

# 设置临时目录
export TMPDIR=/tmp
export npm_config_cache=/tmp/.npm

# 构建
npm run build
```

### 步骤 2: 检查构建产物

```bash
ls -lh dist/
```

应该看到：
- `index.html`
- `assets/` 目录（包含 JS 和 CSS 文件）

### 步骤 3: 打包 FPK

```bash
cd /Users/sangxuesheng/Desktop/开发/App.Native.MdEditor
fnpack build
```

### 步骤 4: 查找 FPK 文件

```bash
ls -lh *.fpk
```

---

## 🔧 方法 3: 使用临时目录构建

如果原目录有权限问题：

```bash
# 创建临时目录
BUILD_TEMP="/tmp/fpk_autosave_$(date +%s)"
mkdir -p "$BUILD_TEMP"

# 复制项目（排除 node_modules）
cd /Users/sangxuesheng/Desktop/开发/App.Native.MdEditor
rsync -av --exclude='node_modules' --exclude='node_modules.bak' --exclude='dist' --exclude='.git' ./ "$BUILD_TEMP/"

# 复制 node_modules
cd app/ui/frontend
tar cf - node_modules | (cd "$BUILD_TEMP/app/ui/frontend" && tar xf -)

# 构建
cd "$BUILD_TEMP/app/ui/frontend"
npm run build

# 打包
cd "$BUILD_TEMP"
fnpack build

# 查看结果
ls -lh *.fpk

# 复制到下载目录
cp *.fpk ~/Downloads/App.Native.MdEditor-v1.2.0-autosave.fpk

echo "FPK 位置: $BUILD_TEMP"
```

---

## ⚠️ 常见问题

### 问题 1: vite 构建失败

**错误**: `EPERM: operation not permitted`

**解决方案**:
```bash
# 使用临时目录
export TMPDIR=/tmp
npm run build
```

### 问题 2: node_modules 复制失败

**错误**: `Operation not permitted`

**解决方案**:
```bash
# 使用 tar 复制
cd app/ui/frontend
tar cf - node_modules | (cd /tmp/build/app/ui/frontend && tar xf -)
```

### 问题 3: chmod 失败

**错误**: `Unable to change file mode`

**解决方案**:
```bash
# 直接用 bash 执行，不需要 chmod
bash build-autosave.sh
```

---

## 📦 构建产物

成功构建后，你会得到：

```
App.Native.MdEditor.fpk
├── 大小: ~1.2 MB
├── 版本: 1.2.0
└── 新功能: 自动保存机制
```

---

## 🧪 测试清单

部署后测试以下功能：

### 1. 自动保存
- [ ] 编辑文件
- [ ] 等待 30 秒
- [ ] 状态栏显示"草稿已保存"
- [ ] 刷新页面
- [ ] 弹出草稿恢复对话框

### 2. 手动保存
- [ ] 编辑文件
- [ ] 按 `Ctrl/Cmd + S`
- [ ] 状态栏显示"文件已保存"
- [ ] 未保存指示器消失

### 3. 草稿恢复
- [ ] 编辑文件但不保存
- [ ] 关闭标签页
- [ ] 重新打开文件
- [ ] 弹出恢复对话框
- [ ] 点击"恢复草稿"
- [ ] 内容正确恢复

### 4. 草稿丢弃
- [ ] 编辑文件但不保存
- [ ] 关闭标签页
- [ ] 重新打开文件
- [ ] 弹出恢复对话框
- [ ] 点击"丢弃草稿"
- [ ] 显示原文件内容

### 5. 自动保存开关
- [ ] 点击工具栏自动保存按钮
- [ ] 按钮变为灰色（关闭）
- [ ] 编辑内容，等待 30 秒
- [ ] 不应该自动保存
- [ ] 再次点击按钮
- [ ] 按钮变为蓝色（开启）

### 6. 未保存指示器
- [ ] 编辑文件
- [ ] 工具栏出现橙色圆点
- [ ] 圆点有脉冲动画
- [ ] 状态栏显示"未保存"
- [ ] 保存后指示器消失

---

## 🎯 部署步骤

1. **上传 FPK**
   ```bash
   # FPK 文件位置
   ~/Downloads/App.Native.MdEditor-v1.2.0-autosave.fpk
   ```

2. **安装/更新应用**
   - 登录飞牛 NAS
   - 进入应用中心
   - 上传 FPK 文件
   - 安装或更新应用

3. **测试功能**
   - 打开 Markdown 编辑器
   - 按照测试清单逐项测试

---

## 📊 版本信息

| 项目 | 信息 |
|------|------|
| 版本 | 1.2.0 |
| 功能 | 自动保存机制 |
| 文件 | 新增 4 个文件，修改 3 个文件 |
| 大小 | ~1.2 MB |
| 日期 | 2026-02-23 |

---

## 🎉 新功能亮点

1. **自动保存** - 每 30 秒自动保存草稿
2. **草稿恢复** - 意外关闭后可恢复内容
3. **状态指示** - 清晰的未保存提示
4. **智能清理** - 自动管理草稿空间
5. **开关控制** - 可随时开启/关闭自动保存

---

**准备好了吗？运行构建脚本开始吧！** 🚀

```bash
cd /Users/sangxuesheng/Desktop/开发/App.Native.MdEditor
bash build-autosave.sh
```

