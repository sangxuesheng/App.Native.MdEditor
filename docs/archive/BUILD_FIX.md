# 构建问题解决方案

## 🔴 当前问题

npm 和文件系统都有权限问题，导致无法：
1. 删除 node_modules
2. 安装依赖
3. 运行 vite build

## ✅ 解决方案

### 方案 1: 使用 sudo（推荐）

```bash
cd /Users/sangxuesheng/Desktop/开发/App.Native.MdEditor/app/ui/frontend

# 1. 清理旧的 node_modules
sudo rm -rf node_modules node_modules.bak

# 2. 重新安装依赖
npm install

# 3. 构建前端
npm run build

# 4. 返回项目根目录打包
cd ../../..
/Users/sangxuesheng/Desktop/开发/fnpack-1.2.1-darwin-arm64 build
```

### 方案 2: 在新目录中构建

```bash
# 1. 创建新的构建目录
mkdir -p ~/temp-build
cd ~/temp-build

# 2. 复制前端源码（不包括 node_modules）
rsync -av --exclude='node_modules*' --exclude='dist' \
  /Users/sangxuesheng/Desktop/开发/App.Native.MdEditor/app/ui/frontend/ ./

# 3. 安装依赖
npm install

# 4. 构建
npm run build

# 5. 复制构建产物回原目录
rm -rf /Users/sangxuesheng/Desktop/开发/App.Native.MdEditor/app/ui/frontend/dist
cp -r dist /Users/sangxuesheng/Desktop/开发/App.Native.MdEditor/app/ui/frontend/

# 6. 打包 FPK
cd /Users/sangxuesheng/Desktop/开发/App.Native.MdEditor
/Users/sangxuesheng/Desktop/开发/fnpack-1.2.1-darwin-arm64 build
```

### 方案 3: 修复 npm 权限

```bash
# 修复 npm 全局权限
sudo chown -R $(whoami) /usr/local/lib/node_modules
sudo chown -R $(whoami) ~/.npm

# 然后重新尝试安装
cd /Users/sangxuesheng/Desktop/开发/App.Native.MdEditor/app/ui/frontend
npm install
npm run build
```

### 方案 4: 使用临时目录完整构建（最简单）

```bash
# 一键构建脚本
cd /Users/sangxuesheng/Desktop/开发/App.Native.MdEditor

BUILD_TEMP=~/temp-md-editor-build
rm -rf "$BUILD_TEMP"
mkdir -p "$BUILD_TEMP"

# 复制整个项目
rsync -av --exclude='node_modules*' --exclude='.git' --exclude='app/ui/frontend/dist' ./ "$BUILD_TEMP/"

# 进入前端目录
cd "$BUILD_TEMP/app/ui/frontend"

# 安装依赖并构建
npm install && npm run build

# 返回项目根目录打包
cd "$BUILD_TEMP"
/Users/sangxuesheng/Desktop/开发/fnpack-1.2.1-darwin-arm64 build

# 复制 FPK 到下载目录
cp *.fpk ~/Downloads/App.Native.MdEditor-v1.2.1-final.fpk

echo "✅ FPK 已生成: ~/Downloads/App.Native.MdEditor-v1.2.1-final.fpk"
```

## 🎯 推荐执行顺序

1. **先尝试方案 4**（最简单，在新目录构建）
2. 如果失败，尝试**方案 3**（修复 npm 权限）
3. 如果还是失败，使用**方案 1**（sudo）

## 📋 构建后验证

构建成功后，检查：

```bash
# 1. 检查 dist 目录
ls -lh app/ui/frontend/dist/

# 2. 检查 FPK 文件
ls -lh *.fpk

# 3. 验证版本号
grep version manifest
```

应该看到：
- dist 目录包含 index.html 和 assets 文件夹
- FPK 文件大小约 1.2 MB
- manifest 中版本号为 1.2.1

## ⚠️ 注意事项

1. **方案 4 最安全**：不会影响原项目目录
2. **构建时间**：首次 npm install 可能需要 2-5 分钟
3. **网络要求**：需要稳定的网络连接下载依赖

---

**建议：直接使用方案 4 的一键构建脚本！** 🚀

