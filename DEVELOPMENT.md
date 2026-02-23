# Markdown 编辑器 - 开发指南

## 项目结构

```
App.Native.MdEditor/
├── app/
│   ├── server/
│   │   └── server.js          # 后端服务（Node.js）
│   └── ui/
│       ├── frontend/           # React 前端项目
│       │   ├── src/
│       │   │   ├── App.jsx    # 主应用组件
│       │   │   ├── App.css    # 应用样式
│       │   │   ├── main.jsx   # 入口文件
│       │   │   └── index.css  # 全局样式
│       │   ├── index.html
│       │   ├── package.json
│       │   └── vite.config.js
│       ├── config              # 应用入口配置
│       └── images/             # 图标资源
├── cmd/                        # 生命周期脚本
├── config/                     # 权限和资源配置
├── wizard/                     # 安装/配置向导
├── manifest                    # 应用清单
└── build-frontend.sh           # 前端构建脚本
```

## 开发环境要求

- Node.js 18+ 
- npm 或 yarn

## 快速开始

### 1. 安装前端依赖

```bash
cd app/ui/frontend
npm install
```

### 2. 开发模式（前端）

```bash
cd app/ui/frontend
npm run dev
```

前端开发服务器将在 http://localhost:3000 启动，并自动代理 API 请求到后端。

### 3. 启动后端服务

在另一个终端：

```bash
node app/server/server.js
```

后端服务将在 http://localhost:18080 启动。

### 4. 构建生产版本

使用提供的构建脚本：

```bash
./build-frontend.sh
```

或手动构建：

```bash
cd app/ui/frontend
npm run build
```

构建产物将输出到 `app/ui/frontend/dist` 目录。

### 5. 测试生产版本

构建完成后，直接启动后端服务即可：

```bash
node app/server/server.js
```

访问 http://localhost:18080 查看完整应用。

## 功能特性

### 已实现 ✅

- **Monaco Editor 集成** - 专业代码编辑器
- **实时 Markdown 预览** - 即时渲染
- **GFM 支持** - GitHub Flavored Markdown
- **任务列表** - `- [ ]` 和 `- [x]`
- **表格支持** - 完整的表格渲染
- **LaTeX 数学公式** - 行内和块级公式
- **Mermaid 流程图** - 图表可视化
- **多种布局模式** - 水平/垂直/单栏
- **主题切换** - 深色/浅色主题
- **快捷键支持** - Ctrl/Cmd + S/B/I
- **文件读写 API** - 安全的文件操作
- **路径安全校验** - 防止路径穿越攻击

### 待实现 ⏳

- 文件树浏览器（左侧栏）
- 文件搜索功能
- 新建文件/模板
- 导出功能（HTML/PDF）
- 自动保存
- 草稿恢复
- 图片插入
- 更多快捷键

## API 接口

### 健康检查

```
GET /health
```

响应：
```json
{
  "ok": true,
  "app": "App.Native.MdEditor"
}
```

### 读取文件

```
GET /api/file?path=/absolute/path/to/file.md
```

响应：
```json
{
  "ok": true,
  "path": "/absolute/path/to/file.md",
  "content": "# Markdown content..."
}
```

### 保存文件

```
POST /api/file
Content-Type: application/json

{
  "path": "/absolute/path/to/file.md",
  "content": "# Updated content..."
}
```

响应：
```json
{
  "ok": true,
  "path": "/absolute/path/to/file.md"
}
```

## 快捷键

- `Ctrl/Cmd + S` - 保存文件
- `Ctrl/Cmd + B` - 加粗选中文本
- `Ctrl/Cmd + I` - 斜体选中文本

## 技术栈

### 前端
- React 18
- Vite 5
- Monaco Editor
- Markdown-it
- Mermaid
- KaTeX
- GitHub Markdown CSS

### 后端
- Node.js (CommonJS)
- 原生 http 模块
- 文件系统 API

## 开发进度

根据《开发计划表.md》：

- ✅ 阶段 1: 项目初始化与架构设计 (100%)
- ✅ 阶段 2: fnpack 项目创建 (100%)
- ✅ 阶段 3: 运行时依赖与生命周期 (100%)
- 🚧 阶段 4: 应用入口与文件关联 (80%)
- 🚧 阶段 6: Markdown 编辑与预览核心功能 (60%)
- ⏳ 阶段 7: 文件操作增强 (20%)
- ⏳ 阶段 8: 配置管理与向导 (30%)
- ⏳ 阶段 9: 测试 (0%)
- ⏳ 阶段 10: 打包发布 (0%)

## 下一步计划

1. **文件树组件** - 实现左侧文件浏览器
2. **文件搜索** - 支持按名称/内容搜索
3. **自动保存** - 定时保存草稿
4. **导出功能** - HTML/PDF 导出
5. **性能优化** - 大文件处理优化
6. **真机测试** - 在飞牛 fnOS 上测试

## 故障排查

### 前端构建失败

1. 检查 Node.js 版本：`node --version` (需要 18+)
2. 清除缓存：`rm -rf node_modules package-lock.json && npm install`
3. 检查磁盘空间

### 后端无法启动

1. 检查端口占用：`lsof -i :18080`
2. 检查环境变量：`TRIM_SERVICE_PORT`
3. 查看日志：`${TRIM_PKGVAR}/md-editor.log`

### 文件读写失败

1. 检查路径是否为绝对路径
2. 检查路径是否在授权目录内
3. 检查文件权限

## 贡献指南

1. Fork 项目
2. 创建特性分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'Add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

## 许可证

待定

