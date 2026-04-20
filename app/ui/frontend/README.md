# Markdown 编辑器 - 前端项目

基于 React + Vite + Monaco Editor 构建的现代化 Markdown 编辑器。

## 功能特性

- ✅ Monaco Editor 代码编辑器
- ✅ 实时 Markdown 预览
- ✅ GFM（GitHub Flavored Markdown）支持
- ✅ 任务列表、表格、脚注
- ✅ LaTeX 数学公式渲染
- ✅ Mermaid 流程图支持
- ✅ 多种布局模式（水平/垂直/单栏）
- ✅ 深色/浅色主题切换
- ✅ 快捷键支持
- ✅ 文件读写 API 集成

## 安装依赖

```bash
npm install
```

## 开发模式

```bash
npm run dev
```

访问 `http://localhost:3000`（`vite.config.js` 开启了 `strictPort: true`，3000 被占用会直接报错而不是自动换端口）。

## 开发代理与同源行为

本地开发时，Vite 默认代理：

- `/api` -> `http://127.0.0.1:18080`
- `/health`、`/images`、`/math-svg` -> `http://127.0.0.1:18008`

生产/安装环境中，应用桌面入口走 `proxy.cgi` 同源路径（`/cgi/ThirdParty/<app>/proxy.cgi/`）。  
前端在该路径下会自动改写根路径请求，避免跨域与端口漂移导致的问题。会被改写的前缀：

- `/api`
- `/health`
- `/images`
- `/math-svg`

调试时可在浏览器 Console 查看：

```js
window.__APP_PROXY_BASE_PATH__
```

若返回值不是 `'/'`，说明当前处于 `proxy.cgi` 模式。

## 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

## 快捷键

- `Ctrl/Cmd + S`: 保存文件
- `Ctrl/Cmd + B`: 加粗选中文本
- `Ctrl/Cmd + I`: 斜体选中文本

## 技术栈

- React 18
- Vite 5
- Monaco Editor
- Markdown-it
- Mermaid
- KaTeX

## 项目结构

```
frontend/
├── src/
│   ├── App.jsx          # 主应用组件
│   ├── App.css          # 应用样式
│   ├── main.jsx         # 入口文件
│   └── index.css        # 全局样式
├── public/              # 静态资源
├── index.html           # HTML 模板
├── vite.config.js       # Vite 配置
└── package.json         # 依赖配置
```

## API 接口

### 读取文件
```
GET /api/file?path=/absolute/path/to/file.md
```

### 保存文件
```
POST /api/file
Content-Type: application/json

{
  "path": "/absolute/path/to/file.md",
  "content": "markdown content"
}
```

### 鉴权接口（前端启动阶段会调用）

```
GET  /api/auth/me
POST /api/auth/login
POST /api/auth/logout
```

前端启动流程由 `src/components/auth/AuthBootstrap.jsx` 驱动：

1. 先请求 `/api/auth/me`
2. 若返回 401，显示登录页
3. 登录成功后进入主应用
4. 若返回 404，按“未启用认证”兼容处理，直接进入主应用

## 联调与排障

### 1) 启动后页面空白 / 接口 404

- 确认后端服务是否启动并监听 `18080`
- 确认 Vite 代理目标与后端端口一致
- 在 `proxy.cgi` 场景下，检查地址是否包含 `/proxy.cgi/`

### 2) 登录页循环出现（已登录仍回到登录页）

- 检查浏览器是否接受并回传 Cookie（`md_editor_session`）
- 检查后端是否开启了 `ENABLE_AUTH=true`
- 使用 `scripts/test-auth-flow.sh` 验证登录/登出链路是否正常

### 3) “新窗口打开”端口不正确

- 前端会请求 `/api/service-port` 并缓存到 `localStorage.md-editor-service-port`
- 清理该键后重试，可验证是否是历史缓存导致的跳转异常

## 部署说明

构建完成后，将 `dist` 目录的内容部署到后端服务的静态文件目录，或配置后端服务代理前端路由。

