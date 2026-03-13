import React from 'react'
import ReactDOM from 'react-dom/client'
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

