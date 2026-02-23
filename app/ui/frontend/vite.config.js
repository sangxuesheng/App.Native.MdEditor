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
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true
  }
})

