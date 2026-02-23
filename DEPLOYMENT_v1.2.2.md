# Markdown 编辑器 v1.2.2 部署成功

## 🎉 部署信息

- **版本**: 1.2.2
- **部署时间**: 2026-02-23
- **部署位置**: 飞牛NAS (192.168.2.2)
- **访问端口**: 18080

## ✅ 本次更新内容

### 1. 默认布局优化
- **修改**: 默认布局从上下格式改为左右格式
- **文件**: `app/ui/frontend/src/App.jsx`
- **代码**: `const [layout, setLayout] = useState('vertical')`

### 2. 文件树功能验证
- **状态**: ✅ 正常工作
- **挂载目录显示**: 
  - `/vol4/1000/开发文件夹` (用户数据目录)
  - `/vol4/@appdata/App.Native.MdEditor2` (应用数据目录)
  - `/vol4/@appconf/App.Native.MdEditor2` (应用配置目录)

### 3. 工具栏功能
- ✅ 标题插入 (H1-H3)
- ✅ 文本格式化（加粗/斜体/删除线）
- ✅ 列表插入（无序/有序/任务）
- ✅ 链接和图片插入
- ✅ 代码块和行内代码
- ✅ 引用、表格、分隔线
- ✅ 快捷键支持 (Ctrl+B/I/K/S)

## 🔧 部署步骤

### 1. 环境准备
```bash
# 设置 Node.js 环境
export PATH=/var/apps/nodejs_v22/target/bin:$PATH
node --version  # v22.18.0
npm --version   # 10.9.3
```

### 2. 前端构建
```bash
cd /vol4/1000/开发文件夹/mac/开发/App.Native.MdEditor/app/ui/frontend

# 重新安装依赖（清理旧的 node_modules）
rm -rf node_modules package-lock.json
npm install

# 构建生产版本
npm run build
```

### 3. FPK 打包
```bash
cd /vol4/1000/开发文件夹/mac/开发/App.Native.MdEditor
fnpack build
```

### 4. 应用部署
```bash
# 停止旧版本
appcenter-cli stop App.Native.MdEditor2

# 更新前端文件
rm -rf /vol4/@appcenter/App.Native.MdEditor2/ui/frontend/dist
cp -r app/ui/frontend/dist /vol4/@appcenter/App.Native.MdEditor2/ui/frontend/

# 修复权限
chmod -R 755 /vol4/@appcenter/App.Native.MdEditor2/ui/frontend/dist

# 启动应用
appcenter-cli start App.Native.MdEditor2
```

### 5. 验证部署
```bash
# 检查健康状态
curl http://localhost:18080/health

# 检查前端版本
curl -s http://localhost:18080/ | grep "index-"

# 测试文件树 API
curl http://localhost:18080/api/files?path=/
```

## 📊 部署结果

### 应用状态
```
应用名称: App.Native.MdEditor2
显示名称: Markdown 编辑器 v2
版本: 1.2.2
状态: running
依赖: nodejs_v22
端口: 18080
```

### 前端资源
- **主JS**: `index-g5dO8ubK.js` (642.78 kB)
- **主CSS**: `index-BgQYFr77.css` (28.86 kB)
- **总大小**: ~47 MB (包含所有依赖)

### API 端点
- `GET /health` - 健康检查
- `GET /api/file?path=<path>` - 读取文件
- `POST /api/file` - 保存文件
- `GET /api/files?path=<path>` - 列出目录

## 🎯 功能特性

### 编辑器功能
- Monaco Editor 集成
- Markdown 语法高亮
- 实时预览
- 自动保存（30秒间隔）
- 草稿恢复

### 布局模式
- **垂直布局**（默认）：左右分屏，编辑器在左，预览在右
- 水平布局：上下分屏
- 仅编辑器：全屏编辑
- 仅预览：全屏预览

### 主题支持
- 深色主题（默认）
- 浅色主题
- 一键切换

### 文件管理
- 文件树浏览
- 多目录支持
- 仅显示 .md 文件
- 搜索过滤

## 🔐 权限控制

应用仅能访问以下授权目录：
- `TRIM_DATA_ACCESSIBLE_PATHS`: 用户挂载的数据目录
- `TRIM_PKGVAR`: 应用数据目录
- `TRIM_PKGETC`: 应用配置目录

所有文件操作都会进行路径验证，确保不会访问授权目录之外的文件。

## 📝 已知问题

1. **卸载限制**: 通过 CLI 无法卸载应用，需要从 Web UI 操作
2. **大文件警告**: 部分 JS chunk 超过 500KB，建议后续优化代码分割

## 🚀 后续优化建议

1. **代码分割**: 使用动态 import 减小初始加载体积
2. **图片上传**: 支持本地图片上传功能
3. **表格编辑器**: 可视化表格编辑
4. **更多快捷键**: 支持更多 Markdown 语法快捷键
5. **移动端优化**: 响应式布局优化

## 📞 技术支持

- **日志位置**: `/var/log/apps/App.Native.MdEditor2.log`
- **应用目录**: `/vol4/@appcenter/App.Native.MdEditor2`
- **数据目录**: `/vol4/@appdata/App.Native.MdEditor2`
- **配置目录**: `/vol4/@appconf/App.Native.MdEditor2`

---

**部署人员**: AI Assistant  
**部署状态**: ✅ 成功  
**最后更新**: 2026-02-23 23:15

