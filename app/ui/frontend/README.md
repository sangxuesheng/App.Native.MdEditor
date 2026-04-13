# Markdown 编辑器前端（app/ui/frontend）

基于 **React 18 + Vite 5 + Monaco Editor** 的前端应用，负责编辑器 UI、鉴权入口、文件树交互、预览与导出工作流。

## 这份文档覆盖什么

- 前端启动与联调方式
- 鉴权与同源代理（`proxy.cgi`）在前端的工作方式
- 当前实际使用的主要后端接口（按代码校对）
- 开发中最常见的坑位与排障方式

## 核心架构（前端视角）

### 1) 启动链路

- 入口：`src/main.jsx`
- 根组件：`src/components/auth/AuthBootstrap.jsx`
- 应用主体：`src/App.jsx`

启动时先走 Auth Bootstrap：

1. 调用 `GET /api/auth/me` 探测登录态
2. 未登录时渲染 `LoginPage`
3. 已登录（或后端无 auth 路由时）进入 `App`

### 2) proxy.cgi 同源模式

在 fnOS 桌面 iframe 场景，URL 会带 `.../proxy.cgi/...` 路径。前端会自动：

- 计算 `window.__APP_PROXY_BASE_PATH__`
- 将 `/api`、`/health`、`/images`、`/math-svg` 的 fetch 请求重写到同源 proxy 路径
- 启动时请求 `GET /api/service-port` 缓存实际服务端口，供“新窗口打开/发布”生成直连地址

相关实现：`src/main.jsx`、`src/App.jsx`

## 开发环境

### 环境要求

- Node.js 22+
- npm

### 安装依赖

```bash
cd app/ui/frontend
npm install
```

### 本地开发

```bash
npm run dev
```

- 默认地址：`http://localhost:3000`
- Vite 开启 `strictPort: true`，3000 被占用会直接退出，不会自动换端口

### 与后端联调（重要）

`vite.config.js` 当前将 `/api` 代理到 `http://127.0.0.1:18080`。  
所以联调建议后端这样启动：

```bash
PORT=18080 node app/server/server.js
```

否则前端可打开但 API 会请求失败。

## 构建

```bash
cd app/ui/frontend
npm run build
```

构建产物输出到 `dist/`，由后端静态服务加载。

## 主要目录

```text
app/ui/frontend/
├── src/
│   ├── main.jsx                    # 入口、proxy fetch 重写
│   ├── App.jsx                     # 编辑器主应用
│   ├── components/auth/            # AuthBootstrap + LoginPage
│   ├── components/                 # 对话框、菜单栏、文件树等
│   ├── hooks/                      # UI/AI 相关 hooks
│   └── utils/                      # API 封装、设置与工具函数
├── vite.config.js
└── package.json
```

## 后端接口（前端常用）

以下为当前代码路径实际调用的关键接口（非完整清单）：

### 鉴权

- `GET /api/auth/me`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### 文件与目录

- `GET /api/files?path=/` 或 `GET /api/files?path=/abs/dir`
- `GET /api/file?path=/abs/file&mode=text|binary|hex`
- `POST /api/file`
- `GET /api/file/office/extract?path=/abs/file&format=docx|xlsx`

### 运行环境

- `GET /health`
- `GET /api/service-port`

## 常见问题（前端开发）

1. **页面能打开但接口全部失败**
   - 优先检查后端端口是否为 `18080`（或同步修改 Vite 代理）

2. **在 proxy.cgi 场景下请求地址异常**
   - 检查 `window.__APP_PROXY_BASE_PATH__` 是否正确
   - 检查请求是否为根路径（以 `/api` 等开头，才会被重写）

3. **登录页反复出现**
   - 检查后端是否设置 `ENABLE_AUTH=true`
   - 检查 `Set-Cookie` 是否成功下发（`md_editor_session`）
   - 检查浏览器是否禁用了同站 Cookie

