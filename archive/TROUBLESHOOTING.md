# 首屏加载问题排查指南

## 问题描述

移动端和平板端出现白屏，没有显示加载动画，也没有后续编辑器出现。

## 可能的原因

### 1. JavaScript 错误导致应用崩溃

**排查方法**：
```javascript
// 在移动端打开浏览器控制台
// Chrome: chrome://inspect
// Safari: 设置 > Safari > 高级 > Web 检查器
```

查看是否有错误信息。

### 2. CSS 未正确加载

**排查方法**：
检查网络面板，确认 `FirstScreenLoader.css` 是否加载成功。

### 3. Hook 执行错误

**已修复**：简化了 `useMobileFirstScreenLoader` Hook，移除了复杂的资源检测逻辑。

## 临时解决方案

如果问题持续，可以暂时禁用首屏加载动画：

### 方案 A：注释掉首屏加载（最快）

在 `App.jsx` 中：

```javascript
function App() {
  // 临时禁用首屏加载
  // const { isLoading, loadingMessage } = useMobileFirstScreenLoader()
  const isLoading = false
  const loadingMessage = ''
  
  // ... 其他代码
}
```

### 方案 B：使用更简单的加载逻辑

```javascript
function App() {
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // 简单延迟 1.5 秒
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [])
  
  // ... 其他代码
}
```

## 调试步骤

### 1. 检查构建产物

```bash
cd /vol4/1000/开发文件夹/mac
ls -lh app/ui/frontend/dist/assets/*.css
ls -lh app/ui/frontend/dist/assets/*.js
```

### 2. 检查是否有 JavaScript 错误

在 `App.jsx` 的 `useMobileFirstScreenLoader` 调用处添加 try-catch：

```javascript
function App() {
  let isLoading = false
  let loadingMessage = ''
  
  try {
    const result = useMobileFirstScreenLoader()
    isLoading = result.isLoading
    loadingMessage = result.loadingMessage
  } catch (error) {
    console.error('首屏加载 Hook 错误:', error)
    isLoading = false
  }
  
  // ... 其他代码
}
```

### 3. 添加日志输出

在 `useFirstScreenLoader.jsx` 中添加日志：

```javascript
export const useMobileFirstScreenLoader = () => {
  console.log('[FirstScreenLoader] Hook 开始执行')
  
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState('正在初始化编辑环境')
  
  console.log('[FirstScreenLoader] 初始状态:', { isLoading, loadingMessage })
  
  useEffect(() => {
    console.log('[FirstScreenLoader] useEffect 执行')
    // ... 其他代码
  }, [])
  
  return { isLoading, loadingMessage }
}
```

### 4. 检查 CSS 是否生效

在浏览器控制台执行：

```javascript
// 检查 CSS 类是否存在
document.querySelector('.first-screen-loader')

// 检查 CSS 规则
Array.from(document.styleSheets).find(sheet => 
  sheet.href?.includes('FirstScreenLoader')
)
```

## 快速修复

我已经简化了 Hook，现在重新构建：

```bash
cd /vol4/1000/开发文件夹/mac
npm run build --prefix app/ui/frontend
bash build-optimized.sh
```

## 如果问题仍然存在

请提供以下信息：

1. 浏览器控制台的错误信息
2. 网络面板中是否有资源加载失败
3. 是否所有设备都有问题，还是仅移动端

## 回退方案

如果需要完全移除首屏加载功能：

```bash
cd /vol4/1000/开发文件夹/mac/app/ui/frontend/src

# 1. 编辑 App.jsx，注释掉相关代码
# 2. 编辑 main.jsx，注释掉 initPerformanceOptimizations()
# 3. 重新构建
npm run build
```
