import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  cacheDir: '/tmp/.vite',
  server: {
    port: 3000,
    host: true, // 局域网可访问，手机等设备可连 NAS_IP:3000 做热更新调试
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:18080',
        changeOrigin: true
      },
      '/health': {
        target: 'http://127.0.0.1:18080',
        changeOrigin: true
      },
      '/images': {
        target: 'http://127.0.0.1:18080',
        changeOrigin: true
      },
      '/math-svg': {
        target: 'http://127.0.0.1:18080',
        changeOrigin: true
      }
    }
  },
  build: {
    target: 'es2020', // 兼容 Edge
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'monaco-vendor': ['@monaco-editor/react', 'monaco-editor'],
          'markdown-vendor': [
            'unified',
            'remark-parse',
            'remark-math',
            'remark-gfm',
            'remark-breaks',
            'remark-rehype',
            'rehype-katex',
            'rehype-stringify',
            'rehype-raw',
            'rehype-highlight'
          ],
          'math-vendor': ['katex', 'mathjax'],
          'utils-vendor': ['mermaid', 'lucide-react']
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    minify: 'esbuild',
    cssCodeSplit: true,
    sourcemap: false,
    // 压缩优化
    reportCompressedSize: false, // 加快构建速度
    cssMinify: 'esbuild'
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@monaco-editor/react',
      'unified',
      'remark-parse',
      'remark-math',
      'remark-gfm',
      'remark-rehype',
      'rehype-katex',
      'rehype-stringify',
      'rehype-raw',
      'rehype-highlight'
    ],
    exclude: ['mermaid']
  }
})
