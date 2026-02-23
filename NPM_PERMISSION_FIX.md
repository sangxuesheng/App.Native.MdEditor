# npm 权限问题解决方案

## 问题描述

当前系统的 npm 遇到权限问题：
```
EPERM: operation not permitted
```

这是因为 npm 全局安装目录的权限配置不正确。

---

## 解决方案

### 方案 1: 修复 npm 权限（推荐）

在终端中执行以下命令：

```bash
# 1. 修复 npm 全局目录权限
sudo chown -R $(whoami) /usr/local/lib/node_modules
sudo chown -R $(whoami) /usr/local/bin
sudo chown -R $(whoami) ~/.npm

# 2. 重新安装依赖
cd "/Users/sangxuesheng/Desktop/开发/App.Native.MdEditor/app/ui/frontend"
npm install

# 3. 构建项目
npm run build
```

### 方案 2: 使用 nvm 管理 Node.js（推荐长期方案）

```bash
# 1. 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 2. 重启终端，然后安装 Node.js
nvm install 18
nvm use 18

# 3. 安装依赖
cd "/Users/sangxuesheng/Desktop/开发/App.Native.MdEditor/app/ui/frontend"
npm install

# 4. 构建项目
npm run build
```

### 方案 3: 使用 Homebrew 重新安装 Node.js

```bash
# 1. 卸载当前 Node.js
sudo rm -rf /usr/local/lib/node_modules
sudo rm -rf /usr/local/bin/npm
sudo rm -rf /usr/local/bin/node

# 2. 使用 Homebrew 安装
brew install node

# 3. 安装依赖
cd "/Users/sangxuesheng/Desktop/开发/App.Native.MdEditor/app/ui/frontend"
npm install

# 4. 构建项目
npm run build
```

### 方案 4: 临时使用 sudo（不推荐）

```bash
cd "/Users/sangxuesheng/Desktop/开发/App.Native.MdEditor/app/ui/frontend"

# 使用 sudo 安装（可能需要输入密码）
sudo npm install --unsafe-perm=true --allow-root

# 构建
sudo npm run build

# 修复生成文件的权限
sudo chown -R $(whoami) node_modules dist
```

---

## 验证安装

安装成功后，你应该看到：

```bash
# 检查 node_modules 目录
ls -la node_modules/

# 检查是否有 react、vite 等包
ls node_modules/ | grep -E "(react|vite|monaco)"

# 应该看到：
# react
# react-dom
# vite
# @monaco-editor
# ...
```

---

## 构建验证

构建成功后，你应该看到：

```bash
# 检查 dist 目录
ls -la dist/

# 应该包含：
# index.html
# assets/
#   - index-[hash].js
#   - index-[hash].css
```

---

## 启动应用

构建完成后：

```bash
# 启动后端服务
cd "/Users/sangxuesheng/Desktop/开发/App.Native.MdEditor"
node app/server/server.js

# 在浏览器中访问
# http://localhost:18080
```

---

## 常见问题

### Q: 为什么会有权限问题？

A: 通常是因为使用 sudo 安装了 Node.js 或全局包，导致某些目录的所有者是 root。

### Q: 哪个方案最好？

A: 推荐使用方案 2（nvm），这是 Node.js 社区推荐的方式，可以避免权限问题。

### Q: 我不想重装 Node.js 怎么办？

A: 使用方案 1，只需要修复权限即可。

---

## 需要帮助？

如果以上方案都不行，请提供以下信息：

```bash
# 1. Node.js 安装方式
which node
which npm

# 2. 权限信息
ls -la /usr/local/lib/node_modules/npm
ls -la /usr/local/bin/npm

# 3. 用户信息
whoami
id
```

---

**建议**: 使用方案 1 或方案 2，这样可以避免以后遇到类似问题。

