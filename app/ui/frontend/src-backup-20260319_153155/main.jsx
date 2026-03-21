import React from 'react'
import ReactDOM from 'react-dom/client'
// 内置字体：JetBrains Mono、Fira Code，打包进应用，飞牛 NAS 离线可用
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import '@fontsource/jetbrains-mono/600.css'
import '@fontsource/fira-code/400.css'
import '@fontsource/fira-code/500.css'
import App from './App.jsx'
import './index.css'
import { initPerformanceOptimizations } from './utils/performanceOptimization.jsx'

// 初始化性能优化
initPerformanceOptimizations()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

