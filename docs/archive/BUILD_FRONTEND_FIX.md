# 前端构建问题解决方案

## 问题：vite: command not found

这是因为 node_modules 中的依赖没有正确安装。

---

## 解决方案

### 步骤 1: 清理并重新安装依赖

在**系统终端**中执行：

```bash
# 进入前端目录
cd "/Users/sangxuesheng/Desktop/开发/App.Native.MdEditor/app/ui/frontend"

# 删除旧的 node_modules（如果存在）
rm -rf node_modules package-lock.json

# 重新安装依赖
npm install

# 等待安装完成（可能需要 2-3 分钟）
```

### 步骤 2: 验证安装

```bash
# 检查 vite 是否安装
ls node_modules/.bin/vite

# 应该看到文件存在
```

### 步骤 3: 构建

```bash
# 执行构建
npm run build
```

**预期输出**：
```
> md-editor-frontend@1.0.0 build
> vite build

vite v5.3.1 building for production...
✓ modules transformed.
dist/index.html                   0.xx kB
dist/assets/index-xxx.css        xx.xx kB
dist/assets/index-xxx.js        xxx.xx kB
✓ built in x.xxs
```

---

## 如果 npm install 失败

### 方法 1: 使用缓存目录

```bash
cd "/Users/sangxuesheng/Desktop/开发/App.Native.MdEditor/app/ui/frontend"

# 使用临时缓存目录
npm install --cache /tmp/.npm-cache
```

### 方法 2: 检查 npm 权限

```bash
# 检查 npm 全局目录权限
ls -la /usr/local/lib/node_modules/npm

# 如果有权限问题，修复：
sudo chown -R $(whoami) /usr/local/lib/node_modules
sudo chown -R $(whoami) /usr/local/bin
```

### 方法 3: 使用 npx

如果 npm install 一直有问题，可以直接使用 npx：

```bash
cd "/Users/sangxuesheng/Desktop/开发/App.Native.MdEditor/app/ui/frontend"

# 使用 npx 直接运行 vite
npx vite build
```

---

## 完整的构建流程

```bash
# 1. 进入前端目录
cd "/Users/sangxuesheng/Desktop/开发/App.Native.MdEditor/app/ui/frontend"

# 2. 清理旧文件
rm -rf node_modules package-lock.json dist

# 3. 安装依赖
npm install --cache /tmp/.npm-cache

# 4. 构建
npm run build

# 5. 验证构建产物
ls -la dist/
```

---

## 验证构建成功

构建成功后，应该看到：

```bash
dist/
├── index.html          # HTML 文件
└── assets/
    ├── index-xxx.css   # 样式文件
    └── index-xxx.js    # JavaScript 文件
```

检查文件时间戳：

```bash
ls -lh dist/
# 应该显示刚刚的时间
```

---

## 构建成功后

### 下一步：构建 FPK

```bash
# 回到项目根目录
cd "/Users/sangxuesheng/Desktop/开发/App.Native.MdEditor"

# 使用一键构建命令
BUILD_DIR="/tmp/fpk_filetree_$(date +%s)" && \
mkdir -p "$BUILD_DIR" && \
rsync -av --exclude='node_modules*' --exclude='.git' --exclude='app/ui/frontend/src' . "$BUILD_DIR/" && \
cd "$BUILD_DIR" && \
sed -i '' 's/version=.*/version=1.1.0/' manifest && \
"/Users/sangxuesheng/Desktop/开发/fnpack-1.2.1-darwin-arm64" build && \
echo "✅ FPK: $BUILD_DIR/App.Native.MdEditor.fpk" && \
ls -lh "$BUILD_DIR/App.Native.MdEditor.fpk" && \
open "$BUILD_DIR"
```

---

## 常见问题

### Q1: npm install 很慢

**A**: 这是正常的，首次安装需要下载约 200MB 的依赖包。

### Q2: 出现 EACCES 错误

**A**: 权限问题，执行：
```bash
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### Q3: 网络错误

**A**: 可能是网络问题，重试：
```bash
npm install --registry=https://registry.npmmirror.com
```

---

## 快速命令（复制粘贴）

```bash
# 完整流程（一次性执行）
cd "/Users/sangxuesheng/Desktop/开发/App.Native.MdEditor/app/ui/frontend" && \
rm -rf node_modules package-lock.json dist && \
npm install --cache /tmp/.npm-cache && \
npm run build && \
echo "✅ 前端构建完成！" && \
ls -lh dist/
```

---

**提示**: 如果遇到权限问题，参考之前的 `NPM_PERMISSION_FIX.md` 或 `MANUAL_SETUP.md` 文档。

