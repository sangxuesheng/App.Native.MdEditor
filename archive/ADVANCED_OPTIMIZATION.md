# fpk 进阶优化方案

## 已发现的额外优化点

### 1. 备份文件夹占用 397MB ⚠️
```bash
backups/                    # 397MB
app/shares/history/         # 历史版本
```
**优化方案**：已在 .fpkignore 中排除

### 2. 根目录文档文件过多（84个）
```
*.md 文件：50+ 个
*.txt 文件：10+ 个
*.py 脚本：10+ 个
*.html 测试文件：10+ 个
```
**优化方案**：已在 .fpkignore 中排除

### 3. KaTeX 字体文件 1.2MB
```
app/ui/frontend/public/fonts/  # 1.2MB
- 包含 ttf, woff, woff2 三种格式
- 共 72 个字体文件
```
**优化方案**：
- 保留所有格式以确保兼容性（推荐）
- 使用按需加载策略（仅在需要数学公式时加载）
- 可选：使用 CDN 加载 KaTeX 字体

### 4. 后端 node_modules 中的文档
```
app/server/node_modules/**/README.md
app/server/node_modules/**/LICENSE
app/server/node_modules/**/test/
```
**优化方案**：已在 .fpkignore 中排除

### 5. IDE 配置文件
```
.cursor/    # 36KB
.trae/      # 12KB
docs/       # 1.7MB
```
**优化方案**：已在 .fpkignore 中排除

## 优化效果预估

| 优化项 | 节省空间 | 累计节省 |
|---|---|---|
| 前端 node_modules | 312MB | 312MB |
| 后端开发依赖 | 75MB | 387MB |
| 备份文件夹 | 397MB | 784MB |
| 文档和脚本 | ~5MB | 789MB |
| IDE 配置 | 1.7MB | 790.7MB |
| 后端依赖文档 | ~2MB | 792.7MB |

**最终 fpk 包大小预估**：
- 优化前：92MB
- 基础优化后：20-30MB
- 进阶优化后：**15-25MB**

## 字体优化方案（可选）

### 方案 A：字体按需加载（推荐）
```javascript
// App.jsx - 仅在需要时加载字体
useEffect(() => {
  const hasMath = document.querySelector('.math-formula')
  if (hasMath) {
    import('./fonts/katex.css')
  }
}, [content])
```
**效果**：无数学公式时不加载，节省 1.2MB

### 方案 B：使用 CDN 加载字体
修改 `vite.config.js`，从 CDN 加载 KaTeX 字体：
```javascript
// 在 index.html 中引用 CDN
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.33/dist/katex.min.css">
```
**效果**：完全移除本地字体，节省 1.2MB

### 方案 C：字体子集化
仅打包常用字符，减少字体文件大小：
```bash
# 使用 fonttools 进行字体子集化
pyftsubset KaTeX_Main-Regular.woff2 \
  --unicodes="U+0020-007E,U+00A0-00FF" \
  --output-file="KaTeX_Main-Regular.subset.woff2"
```
**效果**：每个字体文件减少 30-50%

## 构建流程优化

### 1. 并行构建
```bash
# 前端和后端依赖优化可以并行
npm run build &
cd app/server && npm install --production &
wait
```

### 2. 增量构建
```bash
# 仅在依赖变化时重装
if [ package.json -nt node_modules ]; then
    npm install --production
fi
```

### 3. 构建缓存
```bash
# 使用 npm 缓存加速
npm config set cache /tmp/npm-cache
npm cache verify
```

## 网络优化进阶

### 1. 使用 pnpm（可选）
```bash
npm install -g pnpm
pnpm config set registry https://registry.npmmirror.com
```
**优势**：
- 安装速度提升 2-3倍
- 磁盘空间节省 50%
- 严格的依赖管理

### 2. 离线安装包
```bash
# 预先打包依赖
cd app/server
npm pack
# 生成 md-editor-server-1.0.0.tgz
```

### 3. 依赖预编译
```bash
# 预编译 better-sqlite3
cd app/server
npm rebuild better-sqlite3 --build-from-source
```

## 安装流程优化

### 1. 跳过不必要的钩子
```bash
npm install --ignore-scripts --production
```

### 2. 禁用进度条（加速）
```bash
npm install --no-progress --production
```

### 3. 使用本地缓存
```bash
npm install --prefer-offline --production
```

## Vite 构建优化进阶

### 1. 启用 Brotli 压缩
```javascript
// vite.config.js
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br'
    })
  ]
})
```

### 2. 图片优化
```javascript
import viteImagemin from 'vite-plugin-imagemin'

export default defineConfig({
  plugins: [
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      svgo: { plugins: [{ removeViewBox: false }] }
    })
  ]
})
```

### 3. 代码分割优化
```javascript
build: {
  rollupOptions: {
    output: {
      manualChunks(id) {
        // 更细粒度的分包
        if (id.includes('node_modules')) {
          if (id.includes('react')) return 'react-vendor'
          if (id.includes('monaco')) return 'monaco-vendor'
          if (id.includes('katex')) return 'math-vendor'
          if (id.includes('mermaid')) return 'mermaid-vendor'
          return 'vendor'
        }
      }
    }
  }
}
```

## 运行时优化

### 1. 懒加载大型依赖
```javascript
// 按需加载 Monaco Editor
const MonacoEditor = lazy(() => import('@monaco-editor/react'))

// 按需加载 Mermaid
const renderMermaid = async () => {
  const mermaid = await import('mermaid')
  // ...
}
```

### 2. Service Worker 缓存
```javascript
// 缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/assets/react-vendor.js',
        '/assets/markdown-vendor.js'
      ])
    })
  )
})
```

## 最终优化清单

### 已实施 ✅
- [x] 前端 node_modules 不打包（312MB）
- [x] 后端仅生产依赖（75MB）
- [x] 国内镜像源配置
- [x] Vite 代码分包优化
- [x] 排除备份文件夹（397MB）
- [x] 排除文档和脚本（~5MB）
- [x] 排除 IDE 配置（1.7MB）
- [x] 排除后端依赖文档（~2MB）

### 可选优化 🔧
- [ ] 字体优化（节省 0.6-1.2MB）
- [ ] 使用 pnpm（提升安装速度 2-3倍）
- [ ] 启用 Brotli 压缩（减少传输体积 20-30%）
- [ ] 图片优化（减少图片体积 30-50%）
- [ ] 懒加载大型依赖（提升首屏加载速度）
- [ ] Service Worker 缓存（提升二次访问速度）

### 进阶优化 🚀
- [ ] 依赖预编译
- [ ] 构建缓存
- [ ] 并行构建
- [ ] 增量构建
- [ ] 离线安装包

## 优化效果对比

| 阶段 | fpk 大小 | 安装时间 | 优化措施 |
|---|---|---|---|
| 原始 | 92MB | 2-3分钟 | 无 |
| 基础优化 | 20-30MB | 30-50秒 | 排除 node_modules |
| 进阶优化 | 15-25MB | 20-40秒 | 排除备份和文档 |
| 完全优化 | 10-20MB | 15-30秒 | 字体+压缩+懒加载 |

## 使用建议

1. **立即生效**：运行 `bash build-optimized.sh`（已包含进阶优化）
2. **可选优化**：根据需求选择字体优化方案
3. **长期优化**：考虑迁移到 pnpm 和 Service Worker

## 注意事项

1. 字体优化可能影响数学公式显示兼容性
2. 删除备份文件夹前请确认不需要历史版本
3. 使用 pnpm 需要重新安装所有依赖
4. Brotli 压缩需要服务器支持
