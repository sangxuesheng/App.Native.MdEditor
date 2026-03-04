# Markdown 编辑器开发技能

这个技能包含 Markdown 编辑器项目的核心开发知识和最佳实践。

## 项目信息
- **项目名称**: Markdown 编辑器 v2
- **技术栈**: React + Monaco Editor + Vite
- **部署平台**: 飞牛 NAS
- **当前版本**: v1.20.5

## 核心开发技能

### 1. 页面布局修复
**问题**: 页面出现空白区域，工具栏和菜单栏上移导致不显示

**解决方案**:
- 添加根元素样式重置（html, body, #root）
- 使用 100% 而非 100vw/100vh
- 添加 overflow: hidden 防止溢出

**关键代码**:
```css
html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
```

### 2. 拖拽上传图片功能
**实现要点**:
- 监听 dragover, dragleave, drop 事件
- 过滤图片文件类型
- 使用 FormData 上传多文件
- 在鼠标位置插入 Markdown 链接
- 添加视觉反馈效果

### 3. Toast 通知系统
**特点**:
- 不使用系统/浏览器通知
- 自动消失（默认3秒）
- 支持多个通知堆叠
- 成功/失败/警告/信息四种类型

### 4. Z-Index 层级管理
**关键点**:
- 父元素 z-index 会限制子元素
- 确保父容器有足够高的 z-index
- 层级规划：工具栏(100) < 顶部栏(10000) < 菜单(10001)

### 5. Mermaid 图表渲染
**问题**: rehype-highlight 添加 hljs 类名导致正则不匹配

**解决**: 修改正则表达式匹配 `hljs language-mermaid`

**优化**: 图表居中显示，支持响应式和横向滚动

### 6. 编辑器宽度调整
**实现**: 使用百分比限制，从 20%-80% 调整为 10%-90%

### 7. 网页图标设置
**步骤**:
1. 创建 public 目录
2. 复制 markdown.svg
3. 修改 index.html 的 link 标签

### 8. UI 圆角和边框优化
**实现要点**:
- 使用 border-radius: 12px 创建圆角
- 添加 1px 边框增强视觉层次
- 使用 gap 和 padding 控制间距
- 确保三个主题下样式统一

**关键代码**:
```css
.editor-pane,
.preview-pane {
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.editor-preview-container {
  gap: 8px;
  padding: 0 8px 8px 8px;
}
```

### 9. 菜单按钮统一设计
**实现要点**:
- 所有主题添加边框
- 使用 CSS 变量管理主题色
- 圆角从 4px 增加到 6px
- 优化悬停效果

**关键代码**:
```css
.menu-button {
  border: 1px solid var(--menu-button-border);
  border-radius: 6px;
  transition: all 0.15s;
}
```

### 10. Monaco Editor 自定义主题
**实现要点**:
- 在 handleEditorMount 中定义主题
- 修改标题颜色和样式
- 使用 token 规则自定义语法高亮

**关键代码**:
```javascript
monaco.editor.defineTheme('light', {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'keyword.md', foreground: '0165FF', fontStyle: 'bold' },
  ],
  colors: {
    'editor.background': '#FFFFFF',
  }
})
```

### 11. 动画列表组件
**实现要点**:
- 创建可复用的 AnimatedList 组件
- 使用 CSS transition 和 animation
- 控制延迟时间实现渐进效果
- 淡入 + 滑动组合动画

**关键代码**:
```css
.animated-list-item {
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.animated-list-item.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### 12. 高亮文本功能
**实现要点**:
- 使用预处理转换 `==文本==` 为 `<mark>文本</mark>`
- 在 Markdown 渲染前进行转换
- 支持嵌套样式（粗体、斜体、代码等）

**关键代码**:
```javascript
// 预处理：将 ==高亮== 转换为 <mark>高亮</mark>
let processedContent = content.replace(/==([^=\n]+)==/g, '<mark>$1</mark>')
```

```css
mark {
  background-color: #ffff00;
  color: #000000;
  padding: 2px 4px;
  border-radius: 2px;
}
```

## 开发流程

### 标准流程
```bash
# 1. 备份
cp App.jsx App.jsx.backup

# 2. 开发
# ... 修改代码 ...

# 3. 构建
bash build-complete.sh

# 4. 更新版本
# 修改 manifest

# 5. 打包
fnpack build

# 6. 提交
git add -A
git commit -m "说明"
git push
```

### 开发调试
```bash
export PATH=/var/apps/nodejs_v22/target/bin:$PATH
cd app/ui/frontend
npm run dev
# 访问 http://localhost:3011/
```

## 调试技巧

1. **添加日志**: console.log 查看变量值
2. **查看 DOM**: 打印 HTML 结构
3. **正则测试**: 使用在线工具验证
4. **分步调试**: 一次只改一个地方
5. **状态更新**: 使用 useCallback 和函数式更新

## 常见问题

### 工具调用超时
**解决**: 使用 Shell 或 Python 脚本

### 样式不生效
**检查**: 选择器优先级、主题类名

### 正则不匹配
**调试**: 打印实际内容，验证格式

## 最佳实践

1. 修改前备份文件
2. 增量开发，及时测试
3. 添加调试日志
4. 发布前清理代码
5. 更新文档和版本号
6. 使用 CSS 变量管理主题
7. 保持代码模块化

## 技术栈

- React 18
- Monaco Editor
- Vite
- unified/remark/rehype
- Mermaid
- KaTeX
- highlight.js

## 技术要点总结

### CSS 优先级管理
- 后加载的 CSS 文件优先级更高
- 使用 `!important` 可以提升优先级（但应谨慎使用）
- 选择器特异性影响优先级

### React 事件处理
- `e.preventDefault()` - 阻止默认行为
- `e.stopPropagation()` - 阻止事件冒泡
- 使用状态管理控制菜单显示

### 组件通信
- `useImperativeHandle` - 暴露子组件方法给父组件
- `forwardRef` - 转发 ref 到子组件
- Props 传递回调函数
