# Markdown 编辑器 v1.12.2 发布说明

## 发布日期
2026-02-26

## 版本信息
- 版本号: 1.12.2
- 包名: App.Native.MdEditor2.fpk
- 构建时间: 2026-02-26 23:30

## 🎉 新增功能

### 可拉缩面板功能
实现了三个面板（文件树、编辑区、预览区）的可拖拽调整大小功能。

#### 核心特性
1. **文件树宽度调整**
   - 拖动文件树右侧分隔条
   - 可调范围: 200px - 600px
   - 默认宽度: 280px

2. **编辑器宽度调整**
   - 垂直布局: 拖动编辑器右侧分隔条
   - 水平布局: 拖动编辑器下方分隔条
   - 可调范围: 20% - 80%
   - 默认宽度: 50%

3. **预览区自适应**
   - 自动占据剩余空间
   - 随编辑器调整自动变化

#### 用户体验优化
- ✅ 鼠标悬停时分隔条高亮显示
- ✅ 拖拽时光标自动切换（↔ 或 ↕）
- ✅ 拖拽时禁用文本选择
- ✅ 支持三种主题配色（Dark/Light/MD3）

#### 持久化存储
- ✅ 自动保存面板宽度到 localStorage
- ✅ 刷新页面后自动恢复上次的布局
- ✅ 存储键名:
  - `md-editor-filetree-width`: 文件树宽度
  - `md-editor-editor-width`: 编辑器宽度百分比

## 🔧 技术改进

### 新增组件
- **Resizer.jsx**: 可拖拽分隔条组件
  - 支持垂直和水平两个方向
  - 使用 useRef 跟踪拖拽状态
  - 监听全局鼠标事件
  - 通过回调传递拖拽偏移量

- **Resizer.css**: 分隔条样式
  - 4px 宽度的分隔条
  - hover 和 active 状态的视觉反馈
  - 支持三种主题配色

### 架构优化
- **布局系统**: 从 Grid 布局改为 Flexbox 布局
  - 更适合动态调整大小
  - 支持灵活的面板宽度控制
  - 更好的响应式表现

- **状态管理**: 添加面板宽度状态管理
  - 使用 useState 管理宽度
  - 使用 useEffect 持久化到 localStorage
  - 使用 useCallback 优化性能

### 修改的文件
1. **App.jsx** (31K, 1000行)
   - 导入 Resizer 组件
   - 添加面板宽度状态管理
   - 添加 localStorage 持久化
   - 添加拖拽处理函数
   - 修改 JSX 结构添加 Resizer

2. **App.css** (17K, 807行)
   - 从 Grid 布局改为 Flexbox
   - 移除固定宽度定义
   - 添加动态布局支持

3. **FileTree.jsx** (609行)
   - 添加 style 参数支持
   - 应用动态宽度样式

## 📦 构建信息

### 构建输出
```
✓ 1916 modules transformed
✓ built in 8.00s

dist/index.html                    0.80 kB │ gzip:  0.40 kB
dist/assets/index-BZVyIkxm.css    83.38 kB │ gzip: 13.99 kB
dist/assets/index-DvErg6sV.js    106.04 kB │ gzip: 30.19 kB
```

### 包信息
- 包名: App.Native.MdEditor2.fpk
- 构建工具: fnpack
- 状态: ✅ 打包成功

## 📚 文档

新增文档文件:
- `RESIZABLE_PANELS_FEATURE.md` - 功能实现详细报告
- `RESIZABLE_PANELS_TEST_GUIDE.md` - 完整测试指南
- `RESIZABLE_PANELS_CHANGES.md` - 代码变更摘要
- `RESIZABLE_PANELS_SUMMARY.md` - 总结文档
- `RESIZABLE_PANELS_FINAL_REPORT.md` - 最终报告
- `FILETREE_RESIZE_FIX.md` - FileTree 修复说明

## 🧪 测试建议

### 基础功能测试
1. 启动应用
2. 拖动文件树分隔条，观察宽度变化
3. 拖动编辑器分隔条，观察宽度变化
4. 刷新页面，验证宽度保持
5. 切换布局模式，验证功能正常
6. 切换主题，验证样式正确

### 边界测试
1. 尝试将文件树拖到最小（200px）
2. 尝试将文件树拖到最大（600px）
3. 尝试将编辑器拖到最小（20%）
4. 尝试将编辑器拖到最大（80%）

### 布局测试
1. 垂直布局: 三个面板水平排列
2. 水平布局: 编辑器和预览区垂直排列
3. 仅编辑器: 文件树和编辑器
4. 仅预览: 文件树和预览区

## 🔄 升级说明

### 从 v1.12.1 升级
1. 备份当前数据（如有需要）
2. 卸载旧版本
3. 安装新版本 fpk
4. 首次启动会使用默认布局
5. 调整面板大小后会自动保存

### 兼容性
- 需要飞牛 OS 0.9.27 或更高版本
- 支持所有现代浏览器
- 需要 localStorage API 支持

## 🐛 已知问题

无

## 📝 备注

- 所有修改都已备份，可以安全回滚
- 备份文件位于 `app/ui/frontend/src/` 目录
- 如有问题，请参考文档或回滚到 v1.12.1

## 👥 贡献者

- AI Assistant (Gemini Flash) - 功能实现

---

**下载**: App.Native.MdEditor2.fpk  
**安装**: 使用 appcenter-cli 或飞牛应用中心安装  
**反馈**: 如有问题请提交 Issue
