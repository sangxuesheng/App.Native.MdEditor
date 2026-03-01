import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  cacheDir: '/tmp/.vite',
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:18080',
        changeOrigin: true
      },
      '/health': {
        target: 'http://localhost:18080',
        changeOrigin: true
      }
    }
  },
  build: {
    target: 'esnext', // 支持 top-level await
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    // 性能优化配置
    chunkSizeWarningLimit: 1000, // 提高警告阈值到 1000KB
    rollupOptions: {
      output: {
        // 手动代码分割
        manualChunks: {
          // React 核心库
          'react-vendor': ['react', 'react-dom'],
          // Markdown 相关
          'markdown-vendor': [
            'markdown-it',
            'markdown-it-task-lists',
            'markdown-it-footnote',
            'markdown-it-mathjax3'
          ]
        },
        // 优化 chunk 文件名
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // 使用 esbuild 压缩（更快）
    minify: 'esbuild',
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 禁用源码映射（生产环境）
    sourcemap: false
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@monaco-editor/react',
      'markdown-it',
      'markdown-it-task-lists',
      'markdown-it-footnote'
    ],
    exclude: ['mermaid', 'markdown-it-mathjax3'] // 排除使用 top-level await 的包
  }
})
