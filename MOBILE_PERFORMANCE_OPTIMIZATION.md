# 移动端性能优化方案

## 基于现有移动端改造清单的性能优化

### 一、代码分割与懒加载优化

#### 1. Monaco Editor 懒加载（最大优化点）
Monaco Editor 是最大的依赖之一，移动端可以延迟加载：

```javascript
// App.jsx 中实现
import { lazy, Suspense } from 'react'

// 懒加载 Monaco Editor
const MonacoEditor = lazy(() => import('@monaco-editor/react'))

// 移动端检测
const isMobile = window.innerWidth < 768

// 移动端使用轻量级 textarea，桌面端使用 Monaco
{isMobile ? (
  <textarea className="mobile-editor" />
) : (
  <Suspense fallback={<div>加载编辑器...</div>}>
    <MonacoEditor />
  </Suspense>
)}
```

**效果**：移动端首屏减少 ~3MB

#### 2. 图片管理器按需加载
```javascript
// 仅在打开图片管理时加载
const ImageManagerDialog = lazy(() => 
  import('./components/ImageManagerDialog')
)
```

**效果**：首屏减少 ~500KB

#### 3. 导出功能按需加载
```javascript
// 导出相关依赖较重（html2canvas, dom-to-image）
const ExportDialog = lazy(() => 
  import('./components/ExportDialog')
)
```

**效果**：首屏减少 ~800KB

### 二、移动端专用构建配置

#### 1. 创建移动端构建模式
```javascript
// vite.config.js
export default defineConfig(({ mode }) => {
  const isMobileBuild = mode === 'mobile'
  
  return {
    plugins: [react()],
    build: {
      rollupOptions: {
        output: {
          manualChunks: isMobileBuild ? {
            // 移动端更激进的分包
            'react-vendor': ['react', 'react-dom'],
            'markdown-vendor': ['unified', 'remark-parse', ...],
            // Monaco 单独分包，移动端可选不加载
            'monaco-vendor': ['@monaco-editor/react', 'monaco-editor']
          } : {
            // 桌面端分包策略
          }
        }
      },
      // 移动端更小的 chunk 限制
      chunkSizeWarningLimit: isMobileBuild ? 500 : 1000
    }
  }
})
```

#### 2. 添加移动端构建命令
```json
// package.json
{
  "scripts": {
    "build": "vite build",
    "build:mobile": "vite build --mode mobile"
  }
}
```

### 三、CSS 优化

#### 1. 移动端 CSS 按需加载
```javascript
// App.jsx
useEffect(() => {
  const isMobile = window.innerWidth < 768
  if (isMobile) {
    // 移动端加载精简样式
    import('./styles/mobile.css')
  } else {
    // 桌面端加载完整样式
    import('./styles/desktop.css')
  }
}, [])
```

#### 2. 关键 CSS 内联
```javascript
// vite.config.js
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [
    react(),
    // 将关键 CSS 内联到 HTML
    viteSingleFile({
      useRecommendedBuildConfig: false,
      removeViteModuleLoader: true
    })
  ]
})
```

### 四、图片优化

#### 1. 响应式图片加载
```javascript
// ImagePreview.jsx
const ImagePreview = ({ src }) => {
  const isMobile = window.innerWidth < 768
  
  // 移动端加载缩略图
  const imageSrc = isMobile 
    ? src.replace('/images/', '/images/thumb/')
    : src
    
  return <img src={imageSrc} loading="lazy" />
}
```

#### 2. WebP 格式支持
```javascript
// 服务端添加 WebP 转换
// app/server/server.js
app.get('/images/:filename', (req, res) => {
  const acceptWebP = req.headers.accept?.includes('image/webp')
  const isMobile = req.headers['user-agent']?.includes('Mobile')
  
  if (acceptWebP && isMobile) {
    // 返回 WebP 格式（体积减少 30-50%）
    res.sendFile(webpPath)
  } else {
    res.sendFile(originalPath)
  }
})
```

### 五、字体优化（移动端专用）

**注意**：项目需要保留 ttf/woff/woff2 三种格式以确保兼容性，不建议删除任何格式。

#### 1. 字体按需加载
```javascript
// App.jsx - 仅在需要数学公式时加载 KaTeX 字体
useEffect(() => {
  const hasMathContent = document.querySelector('.math-formula')
  if (hasMathContent) {
    // 动态加载 KaTeX 字体
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = '/fonts/katex.css'
    document.head.appendChild(link)
  }
}, [content])
```

**效果**：无数学公式时不加载字体，节省 1.2MB

#### 2. 移动端使用系统字体
```css
/* mobile.css */
@media (max-width: 768px) {
  .markdown-body {
    /* 移动端优先使用系统字体 */
    font-family: -apple-system, BlinkMacSystemFont, 
                 "Segoe UI", "Roboto", sans-serif;
  }
  
  /* 数学公式按需加载 KaTeX 字体 */
  .math-formula {
    font-family: 'KaTeX_Main', serif;
  }
}
```

### 六、网络优化

#### 1. Service Worker 缓存策略
```javascript
// public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('md-editor-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/assets/react-vendor.js',
        '/assets/markdown-vendor.js',
        // 移动端不缓存 Monaco
        // '/assets/monaco-vendor.js'
      ])
    })
  )
})

// 移动端图片使用网络优先策略
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/images/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // 缓存图片
          const clone = response.clone()
          caches.open('images').then(cache => {
            cache.put(event.request, clone)
          })
          return response
        })
        .catch(() => caches.match(event.request))
    )
  }
})
```

#### 2. 预连接优化
```html
<!-- index.html -->
<head>
  <!-- 预连接到 API 服务器 -->
  <link rel="preconnect" href="http://localhost:18080">
  <link rel="dns-prefetch" href="http://localhost:18080">
  
  <!-- 移动端预加载关键资源 -->
  <link rel="preload" href="/assets/react-vendor.js" as="script">
  <link rel="preload" href="/assets/markdown-vendor.js" as="script">
</head>
```

### 七、运行时性能优化

#### 1. 虚拟滚动（文件树）
```javascript
// FileTree.jsx - 移动端使用虚拟滚动
import { FixedSizeList } from 'react-window'

const FileTree = ({ files }) => {
  const isMobile = window.innerWidth < 768
  
  if (isMobile && files.length > 100) {
    return (
      <FixedSizeList
        height={window.innerHeight - 100}
        itemCount={files.length}
        itemSize={40}
      >
        {({ index, style }) => (
          <div style={style}>
            <FileItem file={files[index]} />
          </div>
        )}
      </FixedSizeList>
    )
  }
  
  return <div>{files.map(file => <FileItem file={file} />)}</div>
}
```

#### 2. 防抖与节流
```javascript
// 移动端滚动优化
import { useThrottle } from './hooks/useThrottle'

const Preview = () => {
  const handleScroll = useThrottle((e) => {
    // 处理滚动
  }, 100) // 移动端使用更长的节流时间
  
  return <div onScroll={handleScroll}>...</div>
}
```

#### 3. 图片懒加载
```javascript
// ImageManager.jsx
const ImageCard = ({ src }) => {
  const [isVisible, setIsVisible] = useState(false)
  const imgRef = useRef()
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
        observer.disconnect()
      }
    })
    
    if (imgRef.current) {
      observer.observe(imgRef.current)
    }
    
    return () => observer.disconnect()
  }, [])
  
  return (
    <div ref={imgRef}>
      {isVisible ? (
        <img src={src} loading="lazy" />
      ) : (
        <div className="placeholder" />
      )}
    </div>
  )
}
```

### 八、优化效果预估

| 优化项 | 桌面端 | 移动端优化 | 节省 |
|---|---|---|---|
| 首屏 JS | 7.6MB | 3.5MB | 54% |
| Monaco Editor | 3MB | 0MB（懒加载） | 100% |
| 字体文件 | 1.2MB | 1.2MB（按需加载） | 0-100%* |
| 图片资源 | 原始 | WebP | 30-50% |
| CSS 文件 | 全量 | 按需 | 40% |
| **总体积** | **~12MB** | **~6-7MB** | **42-50%** |
| **首屏时间** | **2-3秒** | **1.5-2秒** | **33-40%** |

*字体按需加载：无数学公式时不加载，有数学公式时完整加载

### 九、实施优先级

#### 立即实施（高收益低风险）
1. ✅ 图片懒加载
2. ✅ 预连接优化
3. ✅ 图片压缩优化

#### 短期实施（中等收益）
4. Monaco Editor 懒加载
5. 图片管理器按需加载
6. 导出功能按需加载
7. 虚拟滚动（文件树）

#### 长期实施（需要架构调整）
8. 移动端专用构建
9. WebP 图片格式
10. CSS 按需加载
11. Service Worker 缓存

### 十、快速开始

#### 方案 A：仅优化字体（最快）
```bash
cd /vol4/1000/开发文件夹/mac
bash optimize-fonts.sh
bash build-optimized.sh
```

#### 方案 B：移动端完整优化
```bash
cd /vol4/1000/开发文件夹/mac
bash build-mobile-optimized.sh
bash build-optimized.sh
```

### 十一、性能监控

添加移动端性能监控：

```javascript
// App.jsx
useEffect(() => {
  if ('performance' in window) {
    const perfData = performance.getEntriesByType('navigation')[0]
    
    // 上报性能数据
    fetch('/api/metrics', {
      method: 'POST',
      body: JSON.stringify({
        device: window.innerWidth < 768 ? 'mobile' : 'desktop',
        loadTime: perfData.loadEventEnd - perfData.fetchStart,
        domReady: perfData.domContentLoadedEventEnd - perfData.fetchStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime
      })
    })
  }
}, [])
```

---

## 总结

移动端性能优化的核心策略：

1. **减少首屏加载**：Monaco Editor 懒加载（节省 3MB）
2. **按需加载**：图片管理、导出功能懒加载（节省 1.3MB）
3. **字体优化**：保留所有格式（兼容性），按需加载（节省 0-1.2MB）
4. **网络优化**：预连接 + 图片懒加载
5. **运行时优化**：虚拟滚动 + 防抖节流

预计移动端首屏体积从 12MB 减少到 6-7MB，加载时间从 2-3秒 减少到 1.5-2秒。

配合 fpk 打包优化，最终安装包从 92MB 减少到 15-25MB，安装时间从 2-3分钟 减少到 20-40秒。

**字体说明**：项目保留 ttf/woff/woff2 三种格式以确保最大兼容性，通过按需加载策略优化性能。
