# Markdown 编辑器 v1.10.3 发布说明

## 版本信息
- **版本号**: v1.10.3
- **发布日期**: 2025-02-26
- **包大小**: ~50MB

## ✨ UI改进

### 主要更新

1. **工具栏图标升级**
   - 使用 Lucide React 图标库替换原有emoji图标
   - 现代化、专业的SVG图标设计
   - 更清晰的视觉效果和更好的可读性
   - 图标大小统一为16px，视觉更协调

2. **新图标列表**
   - 标题：Heading1, Heading2, Heading3
   - 格式：Bold, Italic, Strikethrough
   - 列表：List, ListOrdered, CheckSquare
   - 插入：Link2, Image, FileCode, Code2
   - 其他：Quote, Table, Minus

### 技术细节

#### 依赖更新
- 新增：lucide-react (现代化图标库)
- 图标大小：16px
- 支持主题适配

#### 优势
- SVG矢量图标，任意缩放不失真
- 更好的浏览器兼容性
- 统一的设计语言
- 更专业的视觉效果

## 📦 安装说明

### 方式一：通过应用中心安装
1. 下载 `App.Native.MdEditor2.fpk`
2. 登录飞牛NAS应用中心
3. 点击"本地安装"上传fpk文件
4. 等待安装完成

### 方式二：命令行安装
```bash
# 上传fpk到NAS后
appcenter-cli install-local /path/to/App.Native.MdEditor2.fpk
```

## 🔄 从旧版本升级

直接安装新版本fpk即可自动覆盖升级，所有数据和配置保持不变。

## ✨ 核心功能（保持不变）

- ✅ 实时预览
- ✅ 语法高亮
- ✅ GFM支持（表格、任务列表等）
- ✅ LaTeX数学公式
- ✅ Mermaid流程图
- ✅ 三种主题（浅色/深色/MD3）
- ✅ 自动保存
- ✅ 文件树管理
- ✅ 收藏夹功能
- ✅ 文件搜索
- ✅ 导出功能（HTML/MD）

## 📝 更新日志

### v1.10.3 (2025-02-26)
- ✨ 使用Lucide React图标库替换工具栏图标
- ✨ 现代化、专业的SVG图标设计
- ✨ 统一图标大小和视觉效果
- 📦 新增lucide-react依赖

### v1.10.2 (2025-02-26)
- 🐛 修复菜单功能失效问题
- ✅ 恢复所有菜单项正常功能

### v1.10.1 (2025-02-25)
- ✅ UI布局优化
- ✅ 文件树与编辑器对齐

### v1.10.0 (之前版本)
- 添加Material Design 3主题
- 支持三种主题循环切换

## 🎨 视觉对比

**之前**: 使用emoji和文本字符（H1, B, I, ☰, 🔗等）
**现在**: 使用专业SVG图标（统一设计语言，更清晰）

## 🔗 相关链接

- 访问地址: http://your-nas-ip:18080/
- 依赖: nodejs_v22
- 图标库: [Lucide Icons](https://lucide.dev/)

## 👥 贡献者

- UI改进: 2025-02-26

---

**推荐升级**: 新版本提供更专业的视觉体验，建议所有用户升级。










