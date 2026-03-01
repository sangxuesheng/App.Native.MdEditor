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
    target: 'es2020', // 兼容 Edge
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'markdown-vendor': [
            'markdown-it',
            'markdown-it-task-lists',
            'markdown-it-footnote',
            'markdown-it-katex',
            'markdown-it-mark'
          ]
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    minify: 'esbuild',
    cssCodeSplit: true,
    sourcemap: false
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@monaco-editor/react',
      'markdown-it',
      'markdown-it-task-lists',
      'markdown-it-footnote',
      'markdown-it-katex',
      'markdown-it-mark'
    ],
    exclude: ['mermaid']
  }
})
