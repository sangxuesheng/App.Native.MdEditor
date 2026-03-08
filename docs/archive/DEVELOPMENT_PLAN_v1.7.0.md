# Markdown 编辑器 v1.7.0 开发计划

## 版本目标
增强文件管理功能，提供更便捷的文件访问和组织方式。

## 核心功能

### 1. 最近文件列表 (Recent Files)
**优先级**: 高  
**预计工作量**: 4小时

#### 功能描述
- 记录最近打开的文件（最多20个）
- 在菜单栏"文件"菜单中显示
- 点击快速打开文件
- 持久化存储到 localStorage
- 显示文件路径和最后访问时间

#### 技术实现
- 创建 `recentFilesManager.js` 工具类
- 在 App.jsx 中集成最近文件状态
- 在 MenuBar 中添加最近文件子菜单
- 使用 localStorage 持久化

#### 文件清单
```
src/utils/recentFilesManager.js       # 最近文件管理器
src/components/MenuBar.jsx            # 更新文件菜单
src/App.jsx                           # 集成最近文件功能
```

### 2. 收藏夹功能 (Favorites)
**优先级**: 高  
**预计工作量**: 5小时

#### 功能描述
- 收藏常用文件和文件夹
- 在文件树中显示收藏夹区域
- 支持添加/移除收藏
- 支持拖拽排序
- 持久化存储

#### 技术实现
- 创建 `FavoritesPanel.jsx` 组件
- 创建 `favoritesManager.js` 工具类
- 在 FileTree 中集成收藏夹面板
- 添加收藏/取消收藏按钮

#### 文件清单
```
src/components/FavoritesPanel.jsx     # 收藏夹面板组件
src/components/FavoritesPanel.css     # 收藏夹样式
src/utils/favoritesManager.js         # 收藏夹管理器
src/components/FileTree.jsx           # 集成收藏夹
src/App.jsx                           # 添加收藏功能
```

### 3. 文件搜索优化 (Enhanced Search)
**优先级**: 中  
**预计工作量**: 4小时

#### 功能描述
- 在文件树顶部添加搜索框
- 支持文件名模糊搜索
- 支持文件内容搜索（可选）
- 实时搜索结果展示
- 高亮匹配项

#### 技术实现
- 创建 `FileSearchBox.jsx` 组件
- 实现搜索算法（模糊匹配）
- 在 FileTree 中集成搜索框
- 添加搜索结果过滤

#### 文件清单
```
src/components/FileSearchBox.jsx      # 搜索框组件
src/components/FileSearchBox.css      # 搜索框样式
src/utils/fileSearcher.js             # 搜索工具
src/components/FileTree.jsx           # 集成搜索功能
```

### 4. 文件历史记录 (File History)
**优先级**: 中  
**预计工作量**: 6小时

#### 功能描述
- 记录文件的编辑历史
- 支持查看历史版本
- 支持恢复到历史版本
- 显示修改时间和内容差异
- 最多保存10个历史版本

#### 技术实现
- 创建 `FileHistoryDialog.jsx` 对话框
- 创建 `fileHistoryManager.js` 管理器
- 在保存时自动创建历史快照
- 使用 diff 算法显示差异

#### 文件清单
```
src/components/FileHistoryDialog.jsx  # 历史记录对话框
src/components/FileHistoryDialog.css  # 历史记录样式
src/utils/fileHistoryManager.js       # 历史管理器
src/App.jsx                           # 集成历史功能
src/components/MenuBar.jsx            # 添加历史菜单项
```

## 开发顺序

### 阶段 1: 最近文件列表（第1天）
1. 创建 recentFilesManager.js
2. 更新 MenuBar 组件
3. 集成到 App.jsx
4. 测试功能

### 阶段 2: 收藏夹功能（第2天）
1. 创建 FavoritesPanel 组件
2. 创建 favoritesManager.js
3. 集成到 FileTree
4. 测试功能

### 阶段 3: 文件搜索优化（第3天）
1. 创建 FileSearchBox 组件
2. 实现搜索算法
3. 集成到 FileTree
4. 测试功能

### 阶段 4: 文件历史记录（第4天）
1. 创建 FileHistoryDialog 组件
2. 创建 fileHistoryManager.js
3. 集成到 App.jsx
4. 测试功能

### 阶段 5: 整合测试（第5天）
1. 完整功能测试
2. 性能优化
3. UI/UX 调整
4. 文档更新

## 技术要点

### 数据持久化
```javascript
// localStorage 结构
{
  "recentFiles": [
    { "path": "/path/to/file.md", "timestamp": 1234567890 }
  ],
  "favorites": [
    { "path": "/path/to/file.md", "type": "file", "order": 0 }
  ],
  "fileHistory": {
    "/path/to/file.md": [
      { "content": "...", "timestamp": 1234567890 }
    ]
  }
}
```

### 性能考虑
- 最近文件列表限制为 20 个
- 历史记录每个文件最多 10 个版本
- 搜索使用防抖（300ms）
- 大文件历史使用压缩存储

### UI/UX 设计
- 最近文件：在文件菜单顶部显示
- 收藏夹：在文件树顶部折叠面板
- 搜索框：在文件树顶部
- 历史记录：独立对话框

## 预期成果

### 功能完整度
- ✅ 最近文件列表（100%）
- ✅ 收藏夹功能（100%）
- ✅ 文件搜索优化（100%）
- ✅ 文件历史记录（100%）

### 代码统计
- 新增代码：约 1200+ 行
- 新增组件：4 个
- 新增工具类：4 个

### 性能指标
- 搜索响应时间：< 100ms
- 历史记录加载：< 200ms
- localStorage 占用：< 5MB

## 测试计划

### 功能测试
1. 最近文件列表正确记录和显示
2. 收藏夹添加/删除/排序正常
3. 搜索功能准确快速
4. 历史记录保存和恢复正常

### 兼容性测试
1. 与现有功能无冲突
2. 主题切换正常
3. 快捷键不冲突

### 性能测试
1. 大量文件搜索性能
2. 历史记录存储性能
3. 内存占用测试

## 风险评估

### 技术风险
- **低**: localStorage 容量限制（5-10MB）
- **低**: 搜索性能（文件数量多时）
- **中**: 历史记录存储空间

### 解决方案
- 限制历史记录数量和大小
- 使用压缩算法
- 提供清理功能

## 版本信息

- **版本号**: v1.7.0
- **开发周期**: 5 天
- **预计发布**: 2026-02-26

---

**状态**: 📋 计划中  
**开始时间**: 2026-02-25  
**负责人**: AI Assistant

