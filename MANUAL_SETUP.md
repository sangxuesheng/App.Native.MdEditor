# ⚠️ 重要：需要在系统终端中手动执行

由于权限限制，需要你在 **macOS 系统终端**（Terminal.app 或 iTerm）中手动执行以下命令。

---

## 🔧 完整解决步骤

### 步骤 1: 打开系统终端

1. 按 `Cmd + Space` 打开 Spotlight
2. 输入 `Terminal` 并回车
3. 或者在 Launchpad 中找到"终端"应用

### 步骤 2: 修复 npm 权限

在终端中**逐行**执行以下命令：

```bash
# 修复 npm 全局目录权限
sudo chown -R $(whoami) /usr/local/lib/node_modules

# 修复 npm 可执行文件权限
sudo chown -R $(whoami) /usr/local/bin

# 创建并修复 npm 缓存目录
sudo mkdir -p ~/.npm
sudo chown -R $(whoami) ~/.npm
```

**注意**: 执行 `sudo` 命令时会要求输入你的 macOS 用户密码。

### 步骤 3: 验证权限修复

```bash
# 检查 npm 是否可以正常运行
npm --version

# 应该显示版本号，例如：11.8.0
```

### 步骤 4: 安装依赖

```bash
# 进入前端目录
cd "/Users/sangxuesheng/Desktop/开发/App.Native.MdEditor/app/ui/frontend"

# 安装依赖（这一步需要 2-3 分钟）
npm install
```

你应该看到类似的输出：
```
added 234 packages, and audited 235 packages in 2m

89 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

### 步骤 5: 构建项目

```bash
# 在同一目录下执行构建
npm run build
```

你应该看到类似的输出：
```
> md-editor-frontend@1.0.0 build
> vite build

vite v5.3.1 building for production...
✓ 1234 modules transformed.
dist/index.html                   0.45 kB │ gzip:  0.30 kB
dist/assets/index-abc123.css     12.34 kB │ gzip:  3.45 kB
dist/assets/index-def456.js     567.89 kB │ gzip: 123.45 kB
✓ built in 12.34s
```

### 步骤 6: 验证构建结果

```bash
# 检查 dist 目录是否生成
ls -la dist/

# 应该看到：
# index.html
# assets/
```

### 步骤 7: 启动应用

```bash
# 回到项目根目录
cd "/Users/sangxuesheng/Desktop/开发/App.Native.MdEditor"

# 启动后端服务
node app/server/server.js
```

你应该看到：
```
App.Native.MdEditor backend listening on port 18080
Static files: /Users/sangxuesheng/Desktop/开发/App.Native.MdEditor/app/ui/frontend/dist
```

### 步骤 8: 访问应用

打开浏览器，访问：**http://localhost:18080**

你应该看到完整的 Markdown 编辑器界面！

---

## 🎯 快速命令（复制粘贴版）

如果你熟悉终端，可以直接复制以下所有命令一次性执行：

```bash
# 修复权限
sudo chown -R $(whoami) /usr/local/lib/node_modules
sudo chown -R $(whoami) /usr/local/bin
sudo mkdir -p ~/.npm
sudo chown -R $(whoami) ~/.npm

# 安装和构建
cd "/Users/sangxuesheng/Desktop/开发/App.Native.MdEditor/app/ui/frontend"
npm install
npm run build

# 启动服务
cd "/Users/sangxuesheng/Desktop/开发/App.Native.MdEditor"
node app/server/server.js
```

---

## ❓ 常见问题

### Q1: sudo 命令要求输入密码

**A**: 这是正常的，输入你的 macOS 登录密码即可（输入时不会显示任何字符）。

### Q2: npm install 很慢

**A**: 这是正常的，首次安装需要下载约 200MB 的依赖包，根据网络速度可能需要 2-5 分钟。

### Q3: 出现 EACCES 或 EPERM 错误

**A**: 说明权限还没修复好，重新执行步骤 2 的命令。

### Q4: npm install 报错 "Cannot find module"

**A**: 删除 node_modules 重新安装：
```bash
cd "/Users/sangxuesheng/Desktop/开发/App.Native.MdEditor/app/ui/frontend"
rm -rf node_modules package-lock.json
npm install
```

### Q5: 构建后访问 404

**A**: 检查 dist 目录是否存在：
```bash
ls -la "/Users/sangxuesheng/Desktop/开发/App.Native.MdEditor/app/ui/frontend/dist"
```

如果不存在，重新运行 `npm run build`。

---

## ✅ 成功标志

当一切正常时，你应该：

1. ✅ `node_modules/` 目录存在（约 200MB）
2. ✅ `dist/` 目录存在（约 2MB）
3. ✅ 后端服务启动成功（显示 "listening on port 18080"）
4. ✅ 浏览器可以访问 http://localhost:18080
5. ✅ 看到完整的 Markdown 编辑器界面

---

## 🆘 如果还是不行

请在终端中执行以下命令，并把输出发给我：

```bash
# 检查 Node.js 和 npm
node --version
npm --version
which node
which npm

# 检查权限
ls -la /usr/local/lib/node_modules/npm | head -5
ls -la /usr/local/bin/npm

# 检查用户
whoami
id
```

---

**重要提示**: 这些命令必须在 **macOS 系统终端** 中执行，不能在 Cursor 的集成终端中执行，因为权限限制。

