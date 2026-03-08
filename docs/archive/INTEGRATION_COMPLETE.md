# 本地持久化自动保存功能 - 集成完成

## ✅ 已完成的修改

### 1. App.jsx 修改内容

#### 添加的导入
```javascript
import { useLocalPersistence, useBeforeUnload, useVisibilityChange } from './hooks/useLocalPersistence'
import { restoreFullState, clearContent as clearPersistedContent } from './utils/localPersistence'
```

#### 修改的状态初始化
- ✅ `content` - 从 localStorage 恢复
- ✅ `currentPath` - 从 localStorage 恢复
- ✅ `editorTheme` - 从 localStorage 恢复
- ✅ `layout` - 从 localStorage 恢复
- ✅ `showFileTree` - 从 localStorage 恢复
- ✅ `showToolbar` - 从 localStorage 恢复
- ✅ `editorFontSize` - 从 localStorage 恢复
- ✅ `fileTreeWidth` - 从 localStorage 恢复
- ✅ `editorWidth` - 从 localStorage 恢复

#### 添加的自动保存逻辑
```javascript
// 本地持久化自动保存
const persistenceState = {
  content,
  currentPath,
  editorWidth,
  fileTreeWidth,
  theme: editorTheme,
  layout,
  showFileTree,
  showToolbar,
  fontSize: editorFontSize
}

// 启用自动保存（防抖 500ms）
const { saveNow } = useLocalPersistence(persistenceState, 500, true)

// 页面关闭/刷新时保存
useBeforeUnload(persistenceState, true)

// 页面隐藏时保存
useVisibilityChange(persistenceState, true)
```

#### 修改的函数
1. **handleNewFileConfirm** - 新建文件时清除自动保存的内容
2. **loadFile** - 加载文件时清除自动保存的内容

## 🎯 功能说明

### 自动保存的内容
1. **编辑器内容** - 实时保存，防抖 500ms
2. **当前文件路径** - 记住正在编辑的文件
3. **编辑器宽度** - 左右栏分隔位置
4. **文件树宽度** - 文件树面板宽度
5. **主题设置** - light/dark 主题
6. **布局模式** - vertical/horizontal
7. **文件树显示状态** - 显示/隐藏
8. **工具栏显示状态** - 显示/隐藏
9. **字体大小** - 编辑器字体大小

### 自动保存触发时机
- ✅ 内容变化后 500ms（防抖）
- ✅ 页面关闭前
- ✅ 页面刷新前
- ✅ 页面隐藏时（切换标签页）
- ✅ 浏览器崩溃前（尽力而为）

### 自动恢复时机
- ✅ 页面加载时
- ✅ 刷新页面后
- ✅ 关闭后重新打开
- ✅ 浏览器崩溃后重启

### 清除时机
- ✅ 新建文件时
- ✅ 打开其他文件时
- ✅ 用户手动清除（可选）

## 🧪 测试方法

### 测试 1: 基础自动保存
1. 在编辑器中输入内容：`# Hello World`
2. 等待 500ms
3. 打开浏览器开发者工具 → Application → Local Storage
4. 查看 `md-editor-content` 是否包含 `# Hello World`

### 测试 2: 刷新恢复
1. 在编辑器中输入一些内容
2. 按 F5 刷新页面
3. 内容应该自动恢复

### 测试 3: 关闭恢复
1. 在编辑器中输入内容
2. 关闭浏览器标签页
3. 重新打开网页
4. 内容应该自动恢复

### 测试 4: 布局恢复
1. 调整左右栏宽度
2. 切换文件树显示/隐藏
3. 刷新页面
4. 布局应该保持不变

### 测试 5: 新建文件清除
1. 在编辑器中输入内容
2. 点击"新建文件"
3. 选择模板
4. 旧内容应该被清除，显示模板内容

### 测试 6: 打开文件清除
1. 在编辑器中输入内容（未保存）
2. 从文件树打开另一个文件
3. 自动保存的内容应该被清除
4. 显示打开的文件内容

## 📊 存储的数据

在浏览器开发者工具中可以看到以下键值对：

| 键名 | 说明 | 示例 |
|------|------|------|
| `md-editor-content` | 编辑器内容 | "# Hello World\n\n..." |
| `md-editor-current-path` | 当前文件路径 | "/path/to/file.md" |
| `md-editor-editor-width` | 编辑器宽度 | "50" |
| `md-editor-filetree-width` | 文件树宽度 | "280" |
| `md-editor-theme` | 主题 | "light" |
| `md-editor-layout` | 布局 | "vertical" |
| `md-editor-show-filetree` | 文件树显示 | "true" |
| `md-editor-show-toolbar` | 工具栏显示 | "true" |
| `md-editor-font-size` | 字体大小 | "14" |
| `md-editor-last-save-time` | 最后保存时间 | "1709654321000" |

## 🔍 调试方法

### 查看保存日志
打开浏览器控制台，可以看到：
```
[LocalPersistence] State saved to localStorage
```

### 查看恢复日志
页面加载时会显示：
```
[LocalPersistence] State restored from localStorage
```

### 查看清除日志
新建或打开文件时会显示：
```
[LocalPersistence] Content cleared
```

### 手动测试 localStorage
在浏览器控制台执行：
```javascript
// 查看保存的内容
localStorage.getItem('md-editor-content')

// 查看所有保存的键
Object.keys(localStorage).filter(key => key.startsWith('md-editor-'))

// 清除所有数据
Object.keys(localStorage)
  .filter(key => key.startsWith('md-editor-'))
  .forEach(key => localStorage.removeItem(key))
```

## ⚙️ 配置选项

### 修改防抖时间
在 App.jsx 中找到：
```javascript
const { saveNow } = useLocalPersistence(persistenceState, 500, true)
```

修改第二个参数：
- `500` - 500ms（默认）
- `1000` - 1秒
- `2000` - 2秒

### 禁用自动保存
```javascript
const { saveNow } = useLocalPersistence(persistenceState, 500, false)
```

### 手动保存
可以在需要的地方调用：
```javascript
const success = saveNow()
if (success) {
  showToast('已保存', 'success')
}
```

## 🐛 已知问题和限制

### 1. localStorage 容量限制
- 大多数浏览器限制为 5-10MB
- 如果内容过大，保存可能失败
- 建议：定期保存到文件

### 2. 隐私模式限制
- 在隐私/无痕模式下，localStorage 可能不可用
- 关闭浏览器后数据会被清除

### 3. 跨域限制
- localStorage 按域名隔离
- 不同域名下的数据不共享

### 4. 性能考虑
- 使用了 500ms 防抖，避免频繁写入
- 大文件可能影响性能
- 建议：超过 1MB 的文件提示用户

## 🚀 后续优化建议

### 1. 添加用户界面提示
```javascript
// 显示最后保存时间
const lastSaveTime = savedState?.lastSaveTime
if (lastSaveTime) {
  const date = new Date(lastSaveTime)
  console.log('最后保存:', date.toLocaleString())
}
```

### 2. 添加手动保存按钮
在工具栏添加一个"保存到本地"按钮，调用 `saveNow()`

### 3. 添加清除按钮
在设置中添加"清除本地数据"选项

### 4. 数据导出/导入
允许用户导出和导入 localStorage 数据

### 5. 升级到 IndexedDB
如果需要存储更大的文件，考虑使用 IndexedDB

## 📝 维护说明

### 添加新的状态保存
如果需要保存新的状态，修改 `persistenceState` 对象：

```javascript
const persistenceState = {
  content,
  currentPath,
  // ... 现有状态
  newState: yourNewState  // 添加新状态
}
```

然后在 `localPersistence.js` 中添加对应的保存/恢复函数。

### 修改保存逻辑
如果需要修改保存逻辑，编辑：
- `src/utils/localPersistence.js` - 存储逻辑
- `src/hooks/useLocalPersistence.js` - Hook 逻辑

## ✅ 集成检查清单

- [x] 创建 `src/utils/localPersistence.js`
- [x] 创建 `src/hooks/useLocalPersistence.js`
- [x] 修改 `App.jsx` 导入
- [x] 修改状态初始化
- [x] 添加自动保存逻辑
- [x] 修改 `handleNewFileConfirm`
- [x] 修改 `loadFile`
- [x] 测试基础功能
- [ ] 测试边界情况
- [ ] 添加用户界面提示（可选）
- [ ] 添加文档说明（可选）

## 🎉 完成！

本地持久化自动保存功能已成功集成到项目中！

现在你可以：
1. 启动开发服务器测试功能
2. 在编辑器中输入内容
3. 刷新页面查看是否恢复
4. 查看浏览器控制台的日志

如有问题，请查看：
- `LOCAL_PERSISTENCE_GUIDE.md` - 详细指南
- `LOCAL_PERSISTENCE_README.md` - 功能说明
- `test-local-persistence.html` - 测试页面

---

**集成完成时间：** 2025-03-05  
**修改文件：** App.jsx  
**新增文件：** localPersistence.js, useLocalPersistence.js  
**状态：** ✅ 已完成并可测试
