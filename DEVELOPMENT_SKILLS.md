# Markdown 编辑器开发 Skills

## 项目信息
- **项目名称**: Markdown 编辑器 v2
- **技术栈**: React + Monaco Editor + Vite
- **部署平台**: 飞牛 NAS
- **当前版本**: v1.20.4

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

## 技术栈

- React 18
- Monaco Editor
- Vite
- unified/remark/rehype
- Mermaid
- KaTeX
- highlight.js

---
最后更新：2025-03-03  
版本：v1.20.4
问 http://localhost:3011/
```

## 常见问题

1. **工具调用超时**: 使用 Shell 命令或 Python 脚本
2. **样式不生效**: 检查选择器优先级和主题类名
3. **正则不匹配**: 打印实际内容，使用在线测试工具
4. **状态更新**: 使用 useCallback 和函数式更新

## 最佳实践

1. 备份文件
2. 增量开发
3. 及时测试
4. 添加日志
5. 清理代码
6. 更新文档
7. 版本管理

## 技术栈

- React 18
- Monaco Editor
- Vite
- unified/remark/rehype
- Mermaid
- KaTeX
- highlight.js

---
最后更新：2025-03-03
版本：v1.20.4
