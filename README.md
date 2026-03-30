# App.Native.MdEditor - 飞牛 NAS Markdown 编辑器

为飞牛 fnOS 设计的 Markdown 编辑器，支持实时预览、图表/公式渲染、图床管理、AI 辅助与多格式导出。

## 项目状态

- 当前版本：`v1.29.61`
- 发布日期：`2026-03-30`
- 开发阶段：稳定版本（桌面端/移动端可用）

## 核心能力

- 编辑体验：Monaco 编辑器、语法高亮、代码折叠、自动保存、编辑/预览联动
- Markdown 扩展：GFM、任务列表、脚注、Mermaid、KaTeX
- 文件与导出：打开/保存/另存为、文件树与收藏夹、HTML/TXT/微信公众号导出
- AI 能力：AI 对话、文生图、AI 主题生成与导出样式辅助
- 一键多平台发布：微信公众号、HTML、PDF、图片等格式导出与发布流程
- 图片能力：粘贴/拖拽上传、图片管理、HEIC 转换、图注与缩放
- 图床能力：支持多类型图床（含 本地、阿里云OSS、腾讯云OSS、github、七牛云、MinIO、WebDAV、自定义 OSS）

## 最近更新

### v1.29.61 (2026-03-30)

- 新增 WebDAV 与自定义 OSS 图床接入入口
- 修复 MinIO 上传目录输入体验问题（光标跳动、自动插入斜杠）
- 补充 MinIO 存储桶访问策略说明（公共读 / 预签名 URL）

### v1.29.53 (2026-03-30)

- 修正 `manifest` 描述格式，避免 `fnpack` 解析异常

更多历史请查看 [CHANGELOG.md](./CHANGELOG.md)。

## 安装与使用

### 飞牛 NAS 安装

1. 下载 `App.Native.MdEditor2.fpk`
2. 在飞牛 NAS 应用中心上传安装
3. 启动应用并访问

### 快速开始

1. 新建或打开 Markdown 文件
2. 在编辑区输入内容，右侧实时预览
3. 使用 `Ctrl/Cmd + S` 保存
4. 通过导出菜单输出目标格式

## 开发与构建

### 环境要求

- Node.js 22+
- npm
- fnOS 开发环境（或 Docker）

### 前端开发

```bash
export PATH=/var/apps/nodejs_v22/target/bin:$PATH
cd app/ui/frontend
npm install
npm run dev
```

### 构建打包

```bash
cd app/ui/frontend
npm run build

cd <项目根目录>
fnpack build
```

### Docker（可选）

```bash
docker build -t mdeditor2:latest .
docker run -d --rm --name mdeditor2 -p 18080:18080 \
  -v $(pwd)/data:/app/data \
  mdeditor2:latest
```

访问地址：`http://localhost:18080/`

## 常用快捷键

- `Ctrl/Cmd + S`：保存
- `Ctrl/Cmd + Shift + S`：另存为
- `Ctrl/Cmd + O`：打开文件
- `Ctrl/Cmd + B`：加粗
- `Ctrl/Cmd + I`：斜体
- `Ctrl/Cmd + K`：插入链接

## 文档

- [CHANGELOG.md](./CHANGELOG.md) - 版本更新历史
- [manifest](./manifest) - 应用元信息（版本、端口、依赖）

## 反馈与贡献

欢迎提交 Pull Request 和 Issue。

提交问题时建议附带：版本号、运行环境、错误信息、复现步骤。

## 许可证

MIT License

---

最后更新：`2026-03-30`  
维护者：听闻  
项目地址：[GitHub](https://github.com/sangxuesheng/App.Native.MdEditor)
