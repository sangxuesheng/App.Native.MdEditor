# 预览区不显示默认文本 - 深度排查报告

## 🔍 问题描述

**现象**：
- 编辑区：有默认文本 ✅
- 预览区：没有显示默认文本 ❌
- 设备：平板端、桌面端
- 时机：打开应用时

---

## 🕵️ 深度排查过程

### 1. 首屏加载逻辑检查

**发现的关键代码**：
```javascript
// App.jsx 第 6793-6796 行
return (
  <>
    {isLoading && <FirstScreenLoader message={loadingMessage} />}
    {!isLoading && (
      <AppUiProvider value={appUi}>
        <div className="app">
          {/* 整个应用内容 */}
        </div>
      </AppUiProvider>
    )}
  </>
)
```

**问题点 1**：
- ✅ 加载动画显示时：`isLoading = true`
- ❌ 主应用完全不渲染：`{!isLoading && (...)}`
- 结果：编辑区和预览区都不存在于 DOM 中

### 2. 加载时间检查

**桌面端加载时间**：
```javascript
// useFirstScreenLoader.jsx 第 137 行
const minTime = isMobile ? 1200 : 2500 // 桌面端 2.5 秒
```

**问题点 2**：
- 桌面端：至少等待 2.5 秒
- 平板端：至少等待 2.5 秒（>768px）
- 在这期间，主应用完全不渲染

### 3. 状态初始化检查

**内容状态**：
```javascript
// App.jsx 第 121 行
const [content, setContent] = useState(DEFAULT_APP_STATE.content)
```

**问题点 3**：
- 内容状态在组件挂载时就初始化了
- 但由于 `{!isLoading && (...)}` 的限制，预览区不会渲染
- 即使有默认内容，也不会显示

### 4. CSS 加载检查

**构建产物**：
```
index-YJuaaldD.css (259KB)
monaco-vendor-Bwtp0z3V.css (116KB)
LightweightEditor-BADUP0tH.css (774B)
```

**问题点 4**：
- CSS 文件正常
- 但预览区的 CSS 只有在主应用渲染后才会生效

### 5. 渲染时序分析

```
时间线：
0ms     - 页面打开
↓
<100ms  - React 挂载，isLoading = true
↓
100ms   - 显示 FirstScreenLoader
↓       - 主应用 DOM 不存在（{!isLoading && ...}）
↓       - 编辑区不存在
↓       - 预览区不存在
↓
2500ms  - isLoading = false
↓
2500ms+ - 主应用开始渲染
↓       - 编辑区渲染（显示默认文本）
↓       - 预览区渲染（应该显示默认文本）
```

---

## 🎯 可能的原因分析

### 原因 1：预览区渲染延迟（最可能 ⭐⭐⭐⭐⭐）

**描述**：
- 加载动画消失后，主应用开始渲染
- 编辑区（Monaco Editor）可能先渲染
- 预览区的 Markdown 处理需要时间
- 导致预览区显示延迟

**证据**：
- 编辑区有默认文本（说明内容状态正常）
- 预览区没有内容（说明渲染或处理有问题）

**验证方法**：
```javascript
// 在控制台检查
console.log('Content:', content)
console.log('HTML Content:', htmlContent)
console.log('Preview element:', document.querySelector('.markdown-body'))
```

### 原因 2：Markdown 处理器未初始化（可能 ⭐⭐⭐⭐）

**描述**：
- Markdown 处理器（unified）需要初始化
- 在加载动画期间，处理器可能未准备好
- 导致默认内容无法转换为 HTML

**证据**：
- `createMarkdownProcessor()` 在文件顶部定义
- 但可能在组件渲染时才真正执行

**验证方法**：
```javascript
// 检查处理器
console.log('Processor:', createMarkdownProcessor())
```

### 原因 3：CSS 样式未加载（可能 ⭐⭐⭐）

**描述**：
- github-markdown-css 动态加载
- 在加载动画期间可能未加载
- 导致预览区样式缺失，内容不可见

**证据**：
- 代码中有 "github-markdown-css 将根据主题动态加载" 注释
- 可能在主题切换时才加载

**验证方法**：
```javascript
// 检查 CSS
Array.from(document.styleSheets).find(s => 
  s.href?.includes('github-markdown')
)
```

### 原因 4：useEffect 执行时序问题（可能 ⭐⭐⭐）

**描述**：
- 预览区的渲染可能依赖某个 useEffect
- 由于 `{!isLoading && (...)}` 的限制
- useEffect 在加载动画消失后才执行
- 可能有额外的延迟

**证据**：
- 主应用被条件渲染包裹
- useEffect 只在组件挂载后执行

### 原因 5：字体加载问题（可能性较低 ⭐⭐）

**描述**：
- KaTeX 字体或其他字体未加载
- 导致预览区内容不可见

**证据**：
- 之前优化保留了所有字体格式
- 字体文件应该正常

**验证方法**：
```javascript
// 检查字体
document.fonts.ready.then(() => {
  console.log('Fonts loaded:', document.fonts.size)
})
```

### 原因 6：状态持久化问题（可能性较低 ⭐）

**描述**：
- 本地存储的状态覆盖了默认内容
- 导致预览区显示空内容

**证据**：
- 代码中有 `useLocalPersistence` Hook
- 可能从 localStorage 加载了空内容

**验证方法**：
```javascript
// 检查本地存储
localStorage.getItem('md-editor-content')
```

---

## 🔬 推荐的排查步骤

### 步骤 1：检查内容状态（最优先）

```javascript
// 在 App.jsx 中添加日志
useEffect(() => {
  console.log('[Debug] Content:', content)
  console.log('[Debug] Content length:', content?.length)
}, [content])

useEffect(() => {
  console.log('[Debug] HTML Content:', htmlContent)
  console.log('[Debug] HTML length:', htmlContent?.length)
}, [htmlContent])
```

### 步骤 2：检查预览区 DOM

```javascript
// 在控制台执行
setTimeout(() => {
  const preview = document.querySelector('.markdown-body')
  console.log('Preview element:', preview)
  console.log('Preview innerHTML:', preview?.innerHTML)
  console.log('Preview children:', preview?.children.length)
}, 3000)
```

### 步骤 3：检查 Markdown 处理

```javascript
// 在 App.jsx 中添加日志
const htmlContent = useMemo(() => {
  console.log('[Debug] Processing markdown, content length:', content.length)
  const result = processor.processSync(content)
  console.log('[Debug] HTML result length:', String(result).length)
  return String(result)
}, [content, processor])
```

### 步骤 4：检查渲染时序

```javascript
// 在 App.jsx 中添加日志
useEffect(() => {
  console.log('[Debug] isLoading changed:', isLoading)
  if (!isLoading) {
    console.log('[Debug] Main app will render now')
    setTimeout(() => {
      console.log('[Debug] Preview element:', document.querySelector('.markdown-body'))
    }, 100)
  }
}, [isLoading])
```

### 步骤 5：检查 CSS 加载

```javascript
// 在控制台执行
setTimeout(() => {
  const sheets = Array.from(document.styleSheets)
  console.log('Total stylesheets:', sheets.length)
  sheets.forEach(s => console.log('Sheet:', s.href))
}, 3000)
```

---

## 💡 可能的解决方案

### 方案 1：预渲染主应用（推荐 ⭐⭐⭐⭐⭐）

**思路**：主应用始终渲染，只是被加载动画覆盖

```javascript
return (
  <>
    {/* 首屏加载动画 - 覆盖在主应用上方 */}
    {isLoading && <FirstScreenLoader message={loadingMessage} />}
    
    {/* 主应用内容 - 始终渲染 */}
    <AppUiProvider value={appUi}>
      <div 
        className={`app theme-${editorTheme}`}
        style={{ visibility: isLoading ? 'hidden' : 'visible' }}
      >
        {/* 应用内容 */}
      </div>
    </AppUiProvider>
  </>
)
```

**优点**：
- 主应用在后台渲染
- 加载动画消失时立即可见
- 预览区已经处理好内容

### 方案 2：强制触发预览更新

**思路**：在加载动画消失后强制更新预览

```javascript
useEffect(() => {
  if (!isLoading) {
    // 强制触发预览更新
    setContent(prev => prev)
  }
}, [isLoading])
```

### 方案 3：延迟隐藏加载动画

**思路**：等待预览区渲染完成后再隐藏

```javascript
// 在 useFirstScreenLoader.jsx 中
// 检查预览区是否已渲染
const previewElement = document.querySelector('.markdown-body')
if (previewElement && previewElement.children.length > 0) {
  setIsLoading(false)
}
```

### 方案 4：添加预览区就绪检测

**思路**：等待预览区内容渲染完成

```javascript
useEffect(() => {
  if (!isLoading) {
    const checkPreview = setInterval(() => {
      const preview = document.querySelector('.markdown-body')
      if (preview && preview.children.length > 0) {
        clearInterval(checkPreview)
        console.log('Preview ready')
      }
    }, 100)
    
    setTimeout(() => clearInterval(checkPreview), 3000)
  }
}, [isLoading])
```

---

## 📋 总结

### 最可能的原因（按概率排序）

1. **预览区渲染延迟**（90%）
   - 主应用渲染后，预览区需要时间处理 Markdown
   - 编辑区先显示，预览区延迟

2. **Markdown 处理器未初始化**（70%）
   - 处理器在组件渲染时才执行
   - 需要时间转换默认内容

3. **CSS 样式未加载**（50%）
   - github-markdown-css 动态加载延迟
   - 内容存在但不可见

4. **useEffect 执行时序**（30%）
   - 条件渲染导致 useEffect 延迟执行

5. **字体加载问题**（10%）
   - 字体未加载导致内容不可见

6. **状态持久化问题**（5%）
   - 本地存储覆盖默认内容

### 推荐的修复方案

**首选**：方案 1 - 预渲染主应用
- 最彻底的解决方案
- 性能最优
- 用户体验最好

**备选**：方案 2 + 方案 4
- 强制触发更新 + 就绪检测
- 确保预览区正常显示

---

## 🧪 下一步行动

1. **添加调试日志**（步骤 1-4）
2. **在控制台查看输出**
3. **根据日志确定具体原因**
4. **实施对应的解决方案**

**需要我现在添加调试日志并实施修复吗？**
