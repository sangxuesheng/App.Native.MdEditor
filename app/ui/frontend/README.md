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

访问 http://localhost:3000。

Vite 开发服务器固定使用 `3000` 端口且开启 `strictPort`，端口被占用时会直接退出，避免浏览器误打开到其他服务。开发代理配置见 `vite.config.js`：

| 前缀 | 代理目标 | 用途 |
|------|----------|------|
| `/api` | `http://127.0.0.1:18080` | 后端 API、鉴权、文件与图床能力 |
| `/health` | `http://127.0.0.1:18008` | 健康检查 |
| `/images` | `http://127.0.0.1:18008` | 本地图片静态访问 |
| `/math-svg` | `http://127.0.0.1:18008` | 数学公式 SVG 静态访问 |

如果接口请求一直失败，先确认后端监听端口与代理目标一致；打包/飞牛环境的主服务端口以根目录 `manifest` 的 `service_port` 和运行时环境变量为准。

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
│   ├── main.jsx         # 入口文件，包含 proxy.cgi 路径下的 fetch 改写
│   ├── components/      # 编辑器、登录页、AI、图床、导出等 UI 组件
│   ├── hooks/           # 编辑器状态、AI 等 React hooks
│   ├── utils/           # API 客户端、本地持久化、导出与渲染工具
│   ├── constants/       # AI 服务商、字体、文件格式等配置常量
│   ├── App.css          # 应用样式
│   └── index.css        # 全局样式
├── public/              # 静态资源
├── index.html           # HTML 模板
├── vite.config.js       # Vite 配置
└── package.json         # 依赖配置
```

## API 接口

后端入口主要在 `app/server/server.js`，认证路由在 `app/server/authRoutes.js`。前端调用统一使用同源相对路径；在飞牛桌面 `proxy.cgi` 场景下，`src/main.jsx` 会把 `/api`、`/health`、`/images`、`/math-svg` 自动改写到代理路径。

### 鉴权流程

`AuthBootstrap` 启动时会调用：

1. `GET /api/auth/me`：检查当前 Cookie 是否有效
2. `POST /api/auth/login`：提交 `{ username, password }`，成功后后端写入 `md_editor_session` Cookie
3. `POST /api/auth/logout`：销毁当前会话并清除 Cookie

认证路由始终由后端提供，因此前端启动时会根据 `/api/auth/me` 的 200/401 结果决定进入编辑器或登录页；404 会被视为兼容旧后端的“未启用认证”。当后端设置 `ENABLE_AUTH=true` 时，除 `/api/auth/login`、`/api/auth/logout`、`/api/auth/me`、`/api/service-port` 外的 `/api/*` 请求都需要有效会话。默认管理员账号由后端环境变量控制：`AUTH_ADMIN_USERNAME` 默认 `admin`，`AUTH_ADMIN_PASSWORD` 或 `AUTH_DEFAULT_ADMIN_PASSWORD` 默认 `admin123456`。

可用根目录脚本验证完整流程：

```bash
BASE_URL=http://127.0.0.1:3000 \
USERNAME=admin \
PASSWORD=admin123456 \
TEST_FILE_PATH=/path/to/tmp-auth-test.md \
bash scripts/test-auth-flow.sh
```

### 常用接口分类

| 分类 | 典型接口 | 说明 |
|------|----------|------|
| 服务状态 | `GET /health`, `GET /api/service-port` | 健康检查与实际监听端口 |
| 设置 | `GET /api/settings`, `POST /api/settings` | 应用设置，AI 配置中的密钥会由后端加密落库 |
| 文件树 | `GET /api/files`, `GET /api/file`, `POST /api/file` | 目录浏览、读取与保存文件 |
| 文件操作 | `POST /api/file/rename`, `POST /api/file/delete`, `POST /api/file/copy`, `POST /api/file/move`, `POST /api/folder/create` | 重命名、删除、复制、移动与新建目录 |
| 历史版本 | `POST /api/file/history/save`, `GET /api/file/history/list`, `GET /api/file/history/version` | 保存、读取和清理文件历史版本 |
| 图片与图床 | `POST /api/image/upload`, `GET /api/image/list`, `/api/imagebed/*` | 本地图片、远程图床配置、上传、缩略图与删除 |
| AI | `POST /api/ai/chat/proxy`, `POST /api/ai/image/generate`, `GET/POST /api/ai/conversations` | 对话代理、文生图与会话持久化 |
| 导出配置 | `GET/POST /api/export-presets`, `/api/export-themes/*` | 导出预设和自定义 CSS 主题 |
| 辅助渲染 | `POST /api/plantuml/svg`, `POST /api/math/svg` | PlantUML 与数学公式 SVG 渲染 |

### 文件读写示例

读取文件：

```http
GET /api/file?path=/absolute/path/to/file.md&mode=text
```

保存文件：

```
POST /api/file
Content-Type: application/json

{
  "path": "/absolute/path/to/file.md",
  "content": "markdown content",
  "encoding": "utf8"
}
```

文件路径必须位于后端允许访问的根目录内；Docker 本地运行默认通过 `TRIM_DATA_ACCESSIBLE_PATHS=/app/data` 暴露文件树根目录。

## 部署说明

构建完成后，将 `dist` 目录的内容部署到后端服务的静态文件目录，或配置后端服务代理前端路由。

