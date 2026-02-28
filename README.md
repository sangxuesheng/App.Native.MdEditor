# App.Native.MdEditor - 飞牛 NAS Markdown 编辑器

一个为飞牛 fnOS 设计的现代化 Markdown 编辑器，支持实时预览、GFM、数学公式、流程图等丰富功能。

## 🎯 项目状态

**当前版本**: v1.18.0  
**发布日期**: 2026-03-01  
**开发阶段**: 功能完善与优化

## ✨ 核心功能

### 编辑器
- ✅ **Monaco Editor** - 专业的代码编辑器
- ✅ **语法高亮** - Markdown 语法高亮
- ✅ **代码折叠** - 支持 Markdown 标题折叠
- ✅ **行号显示** - 右对齐，3位宽度
- ✅ **自动保存** - 每 2 秒自动保存
- ✅ **滚动同步** - 编辑器和预览独立滚动

### 文件操作
- ✅ **打开文件** - 支持 .md 和 .txt 文件
- ✅ **保存文件** - Ctrl/Cmd + S 快速保存
- ✅ **另存为** - 保存到新位置
- ✅ **导出功能** - 导出为 HTML/Markdown/TXT
- ✅ **文件树** - 可折叠的文件浏览器
- ✅ **收藏夹** - 快速访问常用文件

### 编辑工具
- ✅ **标题** - H1/H2/H3 快速插入
- ✅ **文本格式** - 加粗/斜体/删除线
- ✅ **列表** - 有序列表/无序列表
- ✅ **任务列表** - `- [ ]` 待办事项
- ✅ **链接** - 插入超链接
- ✅ **图片** - 插入图片
- ✅ **代码块** - 插入代码块
- ✅ **引用** - 插入引用
- ✅ **表格** - 快速创建表格
- ✅ **分隔线** - 插入分隔线
- ✅ **图表** - Mermaid 流程图/时序图/甘特图等

### Markdown 渲染
- ✅ **GFM** - GitHub Flavored Markdown
- ✅ **任务列表** - 可交互的任务列表
- ✅ **表格** - 美观的表格渲染
- ✅ **数学公式** - KaTeX 公式渲染
- ✅ **流程图** - Mermaid 图表支持
- ✅ **脚注** - 脚注支持

### 界面与主题
- ✅ **垂直分屏** - 左右分屏编辑
- ✅ **仅编辑器** - 专注写作模式
- ✅ **仅预览** - 专注阅读模式
- ✅ **主题切换** - 深色/浅色/MD3 主题
- ✅ **响应式** - 适配不同屏幕尺寸
- ✅ **字体调整** - 可调整编辑器字体大小

### 设置
- ✅ **设置对话框** - 集中管理所有设置
- ✅ **自动保存** - 可开关自动保存
- ✅ **主题选择** - 三种主题可选
- ✅ **字体大小** - 12-24px 可调

## 🚀 快速开始

### 安装

```bash
# 使用 appcenter-cli 安装
appcenter-cli install App.Native.MdEditor2.fpk
```

### 开发模式

```bash
# 1. 安装前端依赖
cd app/ui/frontend
npm install

# 2. 启动开发服务器
npm run dev

# 3. 在另一个终端启动后端
node app/server/server.js
```

### 生产构建

```bash
# 使用构建脚本
./build-complete.sh

# 打包 FPK
fnpack build
```

## 📁 项目结构

```
App.Native.MdEditor/
├── app/
│   ├── server/
│   │   └── server.js              # Node.js 后端服务
│   └── ui/
│       ├── frontend/               # React 前端
│       │   ├── src/
│       │   │   ├── App.jsx        # 主应用组件
│       │   │   ├── App.css        # 全局样式
│       │   │   ├── components/    # 组件目录
│       │   │   │   ├── EditorToolbar.jsx
│       │   │   │   ├── FileTree.jsx
│       │   │   │   └── ...
│       │   │   └── main.jsx       # 入口文件
│       │   ├── package.json
│       │   └── vite.config.js
│       ├── config                  # 应用入口配置
│       └── images/                 # 图标资源
├── cmd/                            # 生命周期脚本
│   ├── main                        # 主控制脚本
│   ├── install_*                   # 安装脚本
│   ├── upgrade_*                   # 升级脚本
│   └── uninstall_*                 # 卸载脚本
├── config/
│   ├── privilege                   # 权限配置
│   └── resource                    # 资源配置
├── manifest                        # 应用清单
├── build-complete.sh               # 完整构建脚本
├── DEVELOPMENT_PLAN.md             # 开发计划
└── README.md                       # 本文件
```

## 🛠️ 技术栈

### 前端
- **React 18** - UI 框架
- **Vite 5** - 构建工具和开发服务器
- **Monaco Editor** - 代码编辑器（VS Code 同款）
- **Markdown-it** - Markdown 解析器
- **Mermaid** - 流程图和图表渲染
- **KaTeX** - 数学公式渲染
- **Lucide React** - 图标库

### 后端
- **Node.js** - 运行时环境
- **原生 HTTP 模块** - Web 服务器
- **文件系统 API** - 文件读写操作

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl/Cmd + S` | 保存文件 |
| `Ctrl/Cmd + B` | 加粗选中文本 |
| `Ctrl/Cmd + I` | 斜体选中文本 |
| `Ctrl/Cmd + T` | 切换主题 |

## 🔒 安全特性

- ✅ **路径校验** - 严格的路径规范化
- ✅ **授权目录** - 仅访问授权目录
- ✅ **防穿越攻击** - 阻止 `../` 等路径穿越
- ✅ **文件大小限制** - 防止超大文件攻击
- ✅ **错误日志** - 完整的安全日志记录

## 📊 API 接口

### 健康检查
```http
GET /health
```

### 读取文件
```http
GET /api/file?path=/absolute/path/to/file.md
```

### 保存文件
```http
POST /api/file
Content-Type: application/json

{
  "path": "/absolute/path/to/file.md",
  "content": "markdown content"
}
```

### 文件树
```http
GET /api/files?path=/absolute/path/to/directory
```

## 📋 待完善功能

查看 [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) 了解详细的开发计划。

### 高优先级
- 🚧 搜索与替换（Ctrl+F / Ctrl+H）
- 🚧 文件管理增强（新建/重命名/删除）
- 🚧 图片上传和管理
- 🚧 撤销/重做历史

### 中优先级
- 📋 导出 PDF/Word
- 📋 模板系统
- 📋 快捷键自定义
- 📋 协作功能

### 低优先级
- 📋 插件系统
- 📋 移动端适配
- 📋 性能优化

## 📝 版本历史

### v1.18.0 (2026-03-01) ✨ 最新
**用户体验优化**
- ✅ 工具栏打开时立即可用
- ✅ 保存按钮始终启用
- ✅ 智能保存逻辑（有路径直接保存，无路径打开保存对话框）
- ✅ 保存对话框双模式（保存/另存为）
- ✅ 状态栏保存成功绿色高亮提示
- ✅ 图片上传功能完整恢复

### v1.17.9 (2026-03-01)
**可视化表格插入功能**
- ✅ 表格插入对话框
- ✅ 灵活的行列数控制（2-10）
- ✅ 实时表格预览
- ✅ 可编辑表头和单元格
- ✅ 自动生成 Markdown 表格

### v1.17.0 (2026-03-01)
**图片处理完整功能**
- ✅ Ctrl+V 粘贴上传
- ✅ 工具栏快捷上传（支持多选）
- ✅ 拖拽上传（支持批量）
- ✅ 图片管理对话框
- ✅ 图片自动压缩
- ✅ 批量删除管理

### v1.12.6 (2026-02-27)
- ✅ 修复编辑器和预览区域无法滚动的问题
- ✅ 修复工具栏位置和高度异常
- ✅ 重构布局系统，移除 flex-wrap
- ✅ 优化 Monaco Editor 滚动条配置

### v1.12.5 (2026-02-27)
- ✅ 修复代码折叠图标不显示的问题
- ✅ 优化行号显示（右对齐，3位宽度）
- ✅ 添加 Markdown 标题折叠支持

### v1.12.0 - v1.12.4
- ✅ 文件树功能
- ✅ 收藏夹功能
- ✅ 导出功能
- ✅ 设置对话框
- ✅ 主题切换优化

查看完整版本历史：[RELEASE_NOTES_v1.12.5.md](RELEASE_NOTES_v1.12.5.md)

## 🧪 测试

```bash
# 运行测试（待实现）
npm test
```

## 📖 文档

- [开发计划](DEVELOPMENT_PLAN.md) - 详细的开发计划和路线图
- [发布说明](RELEASE_NOTES_v1.12.5.md) - 版本更新说明

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 贡献指南
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

待定

## 👥 作者

飞牛 NAS Markdown 编辑器开发团队

## 🙏 致谢

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - 强大的代码编辑器
- [Markdown-it](https://github.com/markdown-it/markdown-it) - 优秀的 Markdown 解析器
- [Mermaid](https://mermaid.js.org/) - 图表渲染引擎
- [KaTeX](https://katex.org/) - 数学公式渲染
- [React](https://react.dev/) - UI 框架
- [Vite](https://vitejs.dev/) - 构建工具

---

**项目地址**: https://github.com/sangxuesheng/App.Native.MdEditor  
**问题反馈**: https://github.com/sangxuesheng/App.Native.MdEditor/issues  
**最后更新**: 2026-03-01
