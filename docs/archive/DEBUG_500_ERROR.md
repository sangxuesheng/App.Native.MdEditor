# 🔍 500 错误调试指南

## 可能的原因

### 1. 前端构建问题
```bash
# 检查是否有构建错误
cd /vol4/1000/开发文件夹/mac/app/ui/frontend
npm run build

# 查看构建输出，检查是否有错误
```

### 2. 后端服务器问题
```bash
# 检查后端服务器是否运行
ps aux | grep node

# 查看服务器日志
cd /vol4/1000/开发文件夹/mac/app/server
# 如果有日志文件，查看最新的错误
```

### 3. 文件路径问题
```bash
# 确认文件存在
ls -la /vol4/1000/开发文件夹/mac/app/ui/frontend/src/components/ResizablePanel.jsx
ls -la /vol4/1000/开发文件夹/mac/app/ui/frontend/src/components/ResizablePanel.css
```

## 快速修复方案

### 方案 1：使用测试页面（绕过服务器）
```bash
# 直接打开测试页面，不依赖服务器
cd /vol4/1000/开发文件夹/mac/app/ui/frontend
python3 -m http.server 8000

# 然后访问: http://localhost:8000/test-resizable.html
```

### 方案 2：重新构建前端
```bash
cd /vol4/1000/开发文件夹/mac/app/ui/frontend

# 清理旧的构建
rm -rf dist

# 重新构建
npm run build

# 检查构建结果
ls -la dist/
```

### 方案 3：检查浏览器控制台
打开浏览器开发者工具（F12），查看：
1. **Console** 标签 - 查看 JavaScript 错误
2. **Network** 标签 - 查看具体哪个请求返回 500
3. **Sources** 标签 - 检查文件是否正确加载

## 详细调试步骤

### 步骤 1：确认错误来源
```bash
# 在浏览器控制台中运行
console.log('ResizablePanel imported:', typeof ResizablePanel)
```

### 步骤 2：检查导入路径
```bash
# 确认文件结构
cd /vol4/1000/开发文件夹/mac/app/ui/frontend/src
tree -L 2
```

### 步骤 3：验证组件语法
```bash
# 使用 ESLint 或其他工具检查语法
cd /vol4/1000/开发文件夹/mac/app/ui/frontend
npm run build 2>&1 | tee build.log
```

### 步骤 4：测试独立组件
创建一个简单的测试文件：
```jsx
// test-component.jsx
import ResizablePanel from './components/ResizablePanel'

function Test() {
  return (
    <ResizablePanel direction="horizontal" defaultSizes={[200, null]}>
      <div>Panel 1</div>
      <div>Panel 2</div>
    </ResizablePanel>
  )
}
```

## 常见问题解决

### 问题 1：CSS 文件未找到
```bash
# 确认 CSS 文件存在
ls -la /vol4/1000/开发文件夹/mac/app/ui/frontend/src/components/ResizablePanel.css

# 检查导入语句
grep "import.*ResizablePanel.css" /vol4/1000/开发文件夹/mac/app/ui/frontend/src/components/ResizablePanel.jsx
```

### 问题 2：React 版本不兼容
```bash
# 检查 React 版本
cd /vol4/1000/开发文件夹/mac/app/ui/frontend
npm list react react-dom
```

### 问题 3：缺少依赖
```bash
# 重新安装依赖
cd /vol4/1000/开发文件夹/mac/app/ui/frontend
rm -rf node_modules package-lock.json
npm install
```

## 推荐的测试流程

### 1. 先测试独立页面
```bash
# 使用不依赖后端的测试页面
cd /vol4/1000/开发文件夹/mac/app/ui/frontend
python3 -m http.server 8000

# 访问: http://localhost:8000/test-resizable.html
# 如果这个能正常工作，说明组件本身没问题
```

### 2. 再测试完整应用
```bash
# 重新构建
cd /vol4/1000/开发文件夹/mac/app/ui/frontend
npm run build

# 启动后端服务器
cd /vol4/1000/开发文件夹/mac/app/server
node server.js

# 访问完整应用
```

### 3. 检查浏览器控制台
- 打开 F12 开发者工具
- 查看 Console 中的错误信息
- 查看 Network 中失败的请求
- 复制完整的错误堆栈信息

## 获取更多帮助

如果问题仍然存在，请提供：
1. 完整的错误信息（从浏览器控制台）
2. Network 标签中失败请求的详细信息
3. 构建日志（npm run build 的输出）
4. 服务器日志（如果有）

---

**提示**: 大多数 500 错误都是由于文件路径、导入错误或构建配置问题引起的。
