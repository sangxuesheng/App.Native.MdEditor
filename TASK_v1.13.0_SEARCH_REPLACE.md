# 🔍 v1.13.0 - 搜索与替换功能开发任务

## 📅 开发计划

**目标版本**: v1.13.0  
**预计工作量**: 2-3 天  
**开始日期**: 2026-02-27  
**预计完成**: 2026-03-01

---

## 🎯 功能目标

实现完整的搜索和替换功能，包括：
- 编辑器内搜索（Ctrl+F）
- 替换功能（Ctrl+H）
- 正则表达式搜索
- 大小写敏感选项
- 全词匹配选项
- 搜索历史记录

---

## ✅ 任务清单

### 阶段 1: 基础搜索功能 (4-6 小时)

#### 1.1 搜索 UI 组件
- [ ] 创建 SearchBox 组件
  - [ ] 搜索输入框
  - [ ] 上一个/下一个按钮
  - [ ] 关闭按钮
  - [ ] 匹配计数显示（如：1/5）
  - [ ] 选项按钮（大小写、全词、正则）

#### 1.2 搜索逻辑
- [ ] 集成 Monaco Editor 搜索 API
- [ ] 实现搜索功能
  - [ ] 查找下一个
  - [ ] 查找上一个
  - [ ] 查找全部
- [ ] 搜索结果高亮
- [ ] 当前匹配项特殊高亮

#### 1.3 快捷键
- [ ] Ctrl/Cmd + F 打开搜索框
- [ ] Enter 查找下一个
- [ ] Shift + Enter 查找上一个
- [ ] Esc 关闭搜索框

---

### 阶段 2: 替换功能 (3-4 小时)

#### 2.1 替换 UI
- [ ] 扩展 SearchBox 为 SearchReplaceBox
  - [ ] 替换输入框
  - [ ] 替换按钮
  - [ ] 全部替换按钮
  - [ ] 替换并查找下一个按钮

#### 2.2 替换逻辑
- [ ] 单个替换
- [ ] 全部替换
- [ ] 替换并查找下一个
- [ ] 替换确认（可选）

#### 2.3 快捷键
- [ ] Ctrl/Cmd + H 打开替换框
- [ ] Ctrl/Cmd + Shift + H 全部替换

---

### 阶段 3: 高级搜索选项 (2-3 小时)

#### 3.1 搜索选项
- [ ] 大小写敏感（Aa 按钮）
- [ ] 全词匹配（Ab| 按钮）
- [ ] 正则表达式（.* 按钮）
- [ ] 选项状态持久化

#### 3.2 正则表达式支持
- [ ] 正则表达式验证
- [ ] 错误提示
- [ ] 正则表达式帮助

#### 3.3 搜索历史
- [ ] 保存搜索历史（最近 10 条）
- [ ] 下拉选择历史记录
- [ ] 清除历史

---

### 阶段 4: UI/UX 优化 (2-3 小时)

#### 4.1 样式优化
- [ ] 搜索框样式（与编辑器主题匹配）
- [ ] 动画效果（展开/收起）
- [ ] 响应式设计
- [ ] 深色/浅色主题适配

#### 4.2 交互优化
- [ ] 自动选中搜索框文本
- [ ] 搜索时实时高亮
- [ ] 无匹配时提示
- [ ] 搜索进度指示（大文件）

#### 4.3 可访问性
- [ ] 键盘导航
- [ ] ARIA 标签
- [ ] 焦点管理

---

### 阶段 5: 测试与文档 (1-2 小时)

#### 5.1 功能测试
- [ ] 基础搜索测试
- [ ] 替换功能测试
- [ ] 正则表达式测试
- [ ] 边界情况测试
- [ ] 性能测试（大文件）

#### 5.2 文档
- [ ] 更新 README.md
- [ ] 创建 RELEASE_NOTES_v1.13.0.md
- [ ] 更新快捷键文档
- [ ] 添加使用示例

---

## 🛠️ 技术方案

### Monaco Editor 搜索 API

Monaco Editor 提供了内置的搜索功能：

```javascript
// 获取编辑器实例
const editor = editorRef.current;

// 打开搜索框
editor.trigger('keyboard', 'actions.find');

// 打开替换框
editor.trigger('keyboard', 'editor.action.startFindReplaceAction');

// 查找下一个
editor.trigger('keyboard', 'editor.action.nextMatchFindAction');

// 查找上一个
editor.trigger('keyboard', 'editor.action.previousMatchFindAction');
```

### 自定义搜索组件

如果需要更多控制，可以使用 Monaco Editor 的搜索 API：

```javascript
import * as monaco from 'monaco-editor';

// 查找所有匹配
const matches = editor.getModel().findMatches(
  searchString,
  true, // searchOnlyEditableRange
  isRegex,
  matchCase,
  matchWholeWord ? searchString : null,
  true // captureMatches
);

// 高亮匹配
const decorations = matches.map(match => ({
  range: match.range,
  options: {
    className: 'search-highlight',
    isWholeLine: false
  }
}));

editor.deltaDecorations([], decorations);
```

---

## 📁 文件结构

```
app/ui/frontend/src/
├── components/
│   ├── SearchBox.jsx          # 搜索框组件（新建）
│   ├── SearchBox.css          # 搜索框样式（新建）
│   └── ...
├── hooks/
│   └── useSearch.js           # 搜索逻辑 Hook（新建）
├── App.jsx                    # 集成搜索功能
└── App.css                    # 搜索相关样式
```

---

## 🎨 UI 设计

### 搜索框布局

```
┌─────────────────────────────────────────────┐
│ 🔍 [搜索文本...        ] [Aa] [Ab|] [.*] ✕ │
│    1/5                    ↑    ↓            │
└─────────────────────────────────────────────┘
```

### 替换框布局

```
┌─────────────────────────────────────────────┐
│ 🔍 [搜索文本...        ] [Aa] [Ab|] [.*] ✕ │
│ ↻  [替换文本...        ] [替换] [全部替换]  │
│    1/5                    ↑    ↓            │
└─────────────────────────────────────────────┘
```

---

## 🔧 实现步骤

### Step 1: 创建基础组件

```bash
# 创建组件文件
touch app/ui/frontend/src/components/SearchBox.jsx
touch app/ui/frontend/src/components/SearchBox.css
touch app/ui/frontend/src/hooks/useSearch.js
```

### Step 2: 实现搜索逻辑

1. 创建 `useSearch` Hook
2. 集成 Monaco Editor 搜索 API
3. 实现搜索状态管理

### Step 3: 实现 UI 组件

1. 创建 SearchBox 组件
2. 添加搜索输入框和按钮
3. 实现选项切换

### Step 4: 集成到主应用

1. 在 App.jsx 中引入 SearchBox
2. 添加快捷键监听
3. 管理搜索框显示/隐藏

### Step 5: 测试和优化

1. 功能测试
2. 性能优化
3. UI/UX 优化

---

## 📊 进度跟踪

- [ ] 阶段 1: 基础搜索功能 (0%)
- [ ] 阶段 2: 替换功能 (0%)
- [ ] 阶段 3: 高级搜索选项 (0%)
- [ ] 阶段 4: UI/UX 优化 (0%)
- [ ] 阶段 5: 测试与文档 (0%)

**总体进度**: 0%

---

## 🐛 已知问题

暂无

---

## 💡 注意事项

1. **性能**: 大文件搜索可能较慢，需要考虑性能优化
2. **正则表达式**: 需要验证正则表达式的有效性
3. **用户体验**: 搜索框不应遮挡编辑内容
4. **主题适配**: 确保在所有主题下都清晰可见

---

## 🎯 成功标准

- ✅ 搜索功能正常工作
- ✅ 替换功能正常工作
- ✅ 支持正则表达式
- ✅ 快捷键正常工作
- ✅ UI 美观且易用
- ✅ 性能良好（<100ms 响应）
- ✅ 所有主题下都正常显示

---

**创建时间**: 2026-02-27  
**负责人**: AI Assistant  
**状态**: 准备开始 🚀
