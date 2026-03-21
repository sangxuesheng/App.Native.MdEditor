# 移动端白屏问题快速排查

## 当前状态

✅ 构建成功  
✅ 部署成功  
✅ 应用已启动  
⚠️ 移动端出现白屏

---

## 立即测试

### 1. 桌面端测试

访问：http://192.168.2.2:18080/

**预期结果**：
- 看到 1.5-2 秒的加载动画
- 然后正常显示编辑器

**如果桌面端正常**：说明代码没问题，是移动端特定问题

### 2. 移动端测试

在移动设备上访问：http://192.168.2.2:18080/

**打开浏览器控制台**：
- iOS Safari: 设置 > Safari > 高级 > Web 检查器
- Android Chrome: chrome://inspect

**查看错误信息**

---

## 可能的原因和解决方案

### 原因 1：Hook 在移动端执行失败

**症状**：白屏，控制台有错误

**临时解决方案**：禁用首屏加载

编辑 `App.jsx`，找到这行：
```javascript
const { isLoading, loadingMessage } = useMobileFirstScreenLoader()
```

改为：
```javascript
// 临时禁用首屏加载
const isLoading = false
const loadingMessage = ''
// const { isLoading, loadingMessage } = useMobileFirstScreenLoader()
```

然后重新构建：
```bash
cd /vol4/1000/开发文件夹/mac
npm run build --prefix app/ui/frontend
bash build-optimized.sh
```

---

### 原因 2：CSS 未加载

**症状**：白屏，但没有错误

**检查方法**：
在控制台执行：
```javascript
document.querySelector('.first-screen-loader')
```

如果返回 `null`，说明组件没有渲染。

**解决方案**：检查 CSS 文件是否存在
```bash
cd /vol4/1000/开发文件夹/mac
ls -la app/ui/frontend/dist/assets/*FirstScreenLoader*
```

---

### 原因 3：React 渲染错误

**症状**：白屏，控制台有 React 错误

**解决方案**：添加错误边界

在 `App.jsx` 中添加：
```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('React 错误:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <div>应用加载失败，请刷新页面</div>
    }
    return this.props.children
  }
}

// 在 return 中使用
return (
  <ErrorBoundary>
    {/* 原有内容 */}
  </ErrorBoundary>
)
```

---

## 快速回退方案

如果需要立即恢复正常使用，完全移除首屏加载功能：

### 步骤 1：编辑 App.jsx

```bash
cd /vol4/1000/开发文件夹/mac/app/ui/frontend/src
```

找到并注释掉这些行：
```javascript
// import FirstScreenLoader from './components/FirstScreenLoader'
// import { useMobileFirstScreenLoader } from './hooks/useFirstScreenLoader.jsx'
// import { preloadCommonComponents } from './utils/lazyComponents'
```

在 App 函数中：
```javascript
// const { isLoading, loadingMessage } = useMobileFirstScreenLoader()
const isLoading = false
const loadingMessage = ''
```

在 return 中：
```javascript
return (
  // <>
  //   {isLoading && <FirstScreenLoader message={loadingMessage} />}
  //   {!isLoading && (
      <AppUiProvider value={appUi}>
        {/* 原有内容 */}
      </AppUiProvider>
  //   )}
  // </>
)
```

### 步骤 2：编辑 main.jsx

```javascript
// import { initPerformanceOptimizations } from './utils/performanceOptimization.jsx'
// initPerformanceOptimizations()
```

### 步骤 3：重新构建

```bash
cd /vol4/1000/开发文件夹/mac
npm run build --prefix app/ui/frontend
bash build-optimized.sh
```

---

## 调试命令

### 查看应用日志
```bash
tail -f /var/log/apps/App.Native.MdEditor2.log
```

### 重启应用
```bash
appcenter-cli stop App.Native.MdEditor2
appcenter-cli start App.Native.MdEditor2
```

### 检查应用状态
```bash
curl http://localhost:18080/health
```

---

## 下一步

1. **先测试桌面端**：确认桌面端是否正常
2. **查看移动端控制台**：找到具体错误信息
3. **根据错误选择方案**：
   - 如果是 Hook 错误 → 禁用首屏加载
   - 如果是 CSS 错误 → 检查文件是否存在
   - 如果是 React 错误 → 添加错误边界

4. **如果急需使用**：直接使用回退方案，完全移除首屏加载功能

---

## 联系信息

如果问题持续，请提供：
1. 浏览器控制台的完整错误信息
2. 网络面板截图（显示哪些资源加载失败）
3. 是否桌面端也有问题

我会根据具体错误信息提供针对性的解决方案。
