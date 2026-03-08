# 修复持久化问题 - 补丁说明

## 问题描述
编辑器内容在页面刷新时没有持久化，恢复成了默认文本。

## 原因分析
在 App.jsx 的第 382-613 行有一个 useEffect，它会在页面加载时检查 URL 参数。如果没有 path 参数，就会设置默认的展示内容，这会覆盖从 localStorage 恢复的内容。

## 解决方案

### 需要修改的位置
文件：`app/ui/frontend/src/App.jsx`
行号：约 389 行

### 原代码
```javascript
} else {
  setContent(`# Markdown 编辑器功能展示
```

### 修改后的代码
```javascript
} else if (!savedState?.content) {
  // 只在没有保存内容时才显示默认文本
  setContent(`# Markdown 编辑器功能展示
```

### 手动修改步骤

1. 打开 `app/ui/frontend/src/App.jsx`

2. 找到第 389 行，将：
   ```javascript
   } else {
   ```
   
   改为：
   ```javascript
   } else if (!savedState?.content) {
     // 只在没有保存内容时才显示默认文本
   ```

3. 保存文件并重启开发服务器

## 测试
1. 输入内容：`# 测试持久化`
2. 等待 500ms
3. 刷新页面
4. 应该看到 `# 测试持久化`

---
**状态：** 需要手动修改一行代码
