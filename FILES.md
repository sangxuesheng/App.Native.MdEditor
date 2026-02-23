# 项目文件清单

## 📁 完整文件列表

### 根目录文档
```
├── README.md                    # 项目总览
├── DEVELOPMENT.md               # 开发指南
├── PROGRESS.md                  # 进度报告
├── QUICKSTART.md                # 快速启动指南
├── build-frontend.sh            # 前端构建脚本
├── ICON.PNG                     # 应用图标
└── ICON_256.PNG                 # 应用图标（256x256）
```

### 应用核心文件
```
├── manifest                     # 应用清单
├── config/
│   ├── privilege               # 权限配置
│   └── resource                # 资源配置
└── wizard/
    ├── config                  # 配置向导
    ├── install                 # 安装向导
    └── uninstall               # 卸载向导
```

### 生命周期脚本
```
├── cmd/
│   ├── main                    # 主控制脚本（start/stop/status）
│   ├── install_init            # 安装初始化
│   ├── install_callback        # 安装回调
│   ├── upgrade_init            # 升级初始化
│   ├── upgrade_callback        # 升级回调
│   ├── uninstall_init          # 卸载初始化
│   ├── uninstall_callback      # 卸载回调
│   ├── config_init             # 配置初始化
│   └── config_callback         # 配置回调
```

### 后端服务
```
├── app/
│   └── server/
│       └── server.js           # Node.js 后端服务（约 230 行）
```

### 前端应用
```
├── app/
│   └── ui/
│       ├── config              # 应用入口配置
│       ├── images/
│       │   ├── icon_64.png    # 64x64 图标
│       │   └── icon_256.png   # 256x256 图标
│       └── frontend/           # React 前端项目
│           ├── .gitignore
│           ├── README.md       # 前端项目说明
│           ├── index.html      # HTML 模板
│           ├── package.json    # 依赖配置
│           ├── vite.config.js  # Vite 配置
│           └── src/
│               ├── App.jsx     # 主应用组件（约 250 行）
│               ├── App.css     # 应用样式（约 300 行）
│               ├── main.jsx    # React 入口
│               └── index.css   # 全局样式
```

---

## 📊 统计信息

### 文件统计
- **总文件数**: 33 个
- **代码文件**: 15 个
- **配置文件**: 8 个
- **文档文件**: 5 个
- **脚本文件**: 9 个
- **资源文件**: 3 个

### 代码统计（估算）
- **JavaScript/JSX**: ~2000 行
- **CSS**: ~400 行
- **Shell Script**: ~800 行
- **JSON/配置**: ~300 行
- **Markdown 文档**: ~1500 行
- **总计**: ~5000 行

### 功能模块
1. **后端服务** (1 个文件)
   - HTTP 服务器
   - 文件读写 API
   - 静态文件服务
   - 路径安全校验

2. **前端应用** (7 个文件)
   - React 组件
   - Monaco Editor 集成
   - Markdown 渲染
   - UI/UX 设计

3. **生命周期管理** (9 个文件)
   - 安装/卸载
   - 启动/停止
   - 配置管理
   - 升级处理

4. **配置系统** (6 个文件)
   - 应用清单
   - 权限配置
   - 资源配置
   - 向导配置

5. **文档系统** (5 个文件)
   - 项目说明
   - 开发指南
   - 快速启动
   - 进度报告

---

## 🎯 核心文件说明

### 必读文件
1. **README.md** - 项目总览，了解项目概况
2. **QUICKSTART.md** - 快速启动，5 分钟上手
3. **DEVELOPMENT.md** - 开发指南，详细开发流程

### 核心代码
1. **app/server/server.js** - 后端服务核心
2. **app/ui/frontend/src/App.jsx** - 前端应用核心
3. **cmd/main** - 生命周期管理核心

### 配置文件
1. **manifest** - 应用元数据
2. **config/privilege** - 权限配置
3. **app/ui/config** - 应用入口配置

---

## 🔍 文件依赖关系

```
manifest
  ├─→ config/privilege
  ├─→ config/resource
  ├─→ cmd/main
  └─→ app/ui/config

cmd/main
  └─→ app/server/server.js

app/server/server.js
  └─→ app/ui/frontend/dist/*

app/ui/frontend/src/App.jsx
  ├─→ App.css
  ├─→ main.jsx
  └─→ index.css

build-frontend.sh
  └─→ app/ui/frontend/package.json
```

---

## 📦 构建产物（运行时生成）

```
app/ui/frontend/
├── node_modules/               # npm 依赖（约 200MB）
└── dist/                       # 构建产物（约 2MB）
    ├── index.html
    ├── assets/
    │   ├── index-[hash].js
    │   ├── index-[hash].css
    │   └── ...
    └── ...
```

---

## 🚀 下一步开发文件

### 计划新增文件
```
app/ui/frontend/src/
├── components/
│   ├── FileTree.jsx           # 文件树组件
│   ├── Toolbar.jsx            # 工具栏组件
│   ├── StatusBar.jsx          # 状态栏组件
│   └── SearchPanel.jsx        # 搜索面板
├── hooks/
│   ├── useFileSystem.js       # 文件系统 Hook
│   ├── useAutoSave.js         # 自动保存 Hook
│   └── useKeyboard.js         # 键盘快捷键 Hook
├── utils/
│   ├── markdown.js            # Markdown 工具
│   ├── file.js                # 文件操作工具
│   └── export.js              # 导出工具
└── styles/
    ├── theme.css              # 主题变量
    └── components.css         # 组件样式

tests/
├── unit/                      # 单元测试
├── integration/               # 集成测试
└── e2e/                       # 端到端测试
```

---

## 📝 文件维护建议

### 定期更新
- **PROGRESS.md** - 每完成一个阶段更新
- **README.md** - 功能变更时更新
- **package.json** - 依赖升级时更新

### 版本控制
- 所有代码文件纳入 Git
- node_modules/ 和 dist/ 忽略
- .DS_Store 等系统文件忽略

### 备份策略
- 定期提交代码到远程仓库
- 重要节点打 tag
- 保留构建产物的备份

---

## ✅ 文件完整性检查

运行以下命令检查文件完整性：

```bash
# 检查必需文件
test -f manifest && echo "✅ manifest" || echo "❌ manifest"
test -f app/server/server.js && echo "✅ server.js" || echo "❌ server.js"
test -f app/ui/frontend/package.json && echo "✅ package.json" || echo "❌ package.json"
test -f cmd/main && echo "✅ cmd/main" || echo "❌ cmd/main"

# 检查可执行权限
test -x cmd/main && echo "✅ cmd/main 可执行" || echo "❌ cmd/main 不可执行"
test -x build-frontend.sh && echo "✅ build-frontend.sh 可执行" || echo "❌ build-frontend.sh 不可执行"
```

---

**文件清单生成时间**: 2026-02-23  
**项目版本**: 1.0.0-beta

