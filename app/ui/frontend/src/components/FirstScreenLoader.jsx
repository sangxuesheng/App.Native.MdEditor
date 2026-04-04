// 首屏加载动画组件
// 移动端优化的 Markdown 编辑器加载动画

import React from 'react'
import './FirstScreenLoader.css'

const FirstScreenLoader = ({ message = '正在初始化编辑环境', theme = 'light' }) => {
  return (
    <div className={`first-screen-loader theme-${theme}`}>
      <div className="canvas-container">
        <svg viewBox="0 0 1200 700" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            {/* 高光渐变 */}
            <linearGradient id="shimmerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="rgba(255, 255, 255, 0.6)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>

            {/* 骨架屏渐变 */}
            <linearGradient id="skeletonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F1F5F9" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>

            {/* 边缘微光滤镜 */}
            <filter id="edgeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* 剪切路径：限制高光在图标内 */}
            <clipPath id="iconClip">
              <rect x="380" y="230" width="440" height="240" rx="24" />
            </clipPath>
          </defs>

          {/* 装饰性背景元素 */}
          <g opacity="0.4">
            <circle cx="200" cy="150" r="80" fill="var(--skeleton-gray)" opacity="0.2" />
            <circle cx="1000" cy="550" r="120" fill="var(--dark-sky-blue)" opacity="0.05" />
          </g>

          {/* 动画主体容器 */}
          <g className="breathing-group">
            {/* 1. 外框：磨砂质感 */}
            <rect 
              x="380" y="230" width="440" height="240" rx="24" 
              fill="url(#skeletonGradient)" 
              fillOpacity="0.8" 
              stroke="var(--dark-sky-blue)" 
              strokeWidth="1.5" 
              strokeOpacity="0.1" 
            />
            
            {/* 边框描边层：仅顺时针描边，无旋转 */}
            <rect 
              x="380" y="230" width="440" height="240" rx="24" 
              fill="none" 
              stroke="var(--dark-sky-blue)" 
              strokeWidth="3" 
              strokeLinecap="round" 
              className="border-draw" 
            />

            {/* 2. Markdown 字符 M (左侧)：旋转+描边 */}
            <path 
              d="M440 400 V300 L490 350 L540 300 V400" 
              fill="none" 
              stroke="var(--dark-sky-blue)" 
              strokeWidth="24" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="logo-draw" 
              style={{ animationDelay: '0.4s' }} 
            />

            {/* 3. 向下箭头组合 (右侧)：旋转+描边 */}
            <g className="arrow-group">
              {/* 箭头竖杠 */}
              <line 
                x1="700" y1="300" x2="700" y2="400" 
                stroke="var(--dark-sky-blue)" 
                strokeWidth="24" 
                strokeLinecap="round" 
                className="logo-draw" 
                style={{ animationDelay: '0.8s' }} 
              />
              {/* 箭头尖端 */}
              <path 
                d="M640 350 L700 410 L760 350" 
                fill="none" 
                stroke="var(--dark-sky-blue)" 
                strokeWidth="24" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="logo-draw" 
                style={{ animationDelay: '1.2s' }} 
              />
            </g>

            {/* 4. 高光扫过层 */}
            <g clipPath="url(#iconClip)">
              <rect className="shimmer-rect" x="0" y="230" width="200" height="240" />
            </g>

            {/* 5. 边缘微光 (增强科技感) */}
            <rect 
              x="380" y="230" width="440" height="240" rx="24" 
              fill="none" 
              stroke="var(--accent-glow)" 
              strokeWidth="2" 
              filter="url(#edgeGlow)" 
              opacity="0.5" 
            />
          </g>

          {/* 底部状态提示 */}
          <g className="fade-in">
            <text 
              x="600" y="540" 
              textAnchor="middle" 
              className="loader-status-text"
              fill="var(--text-color)" 
              fontWeight="300"
            >
              {message}
            </text>
            
            {/* 动态加载点 - 增大尺寸 */}
            <g transform="translate(570, 575)">
              <circle cx="0" cy="0" r="5" className="loading-dot" fill="var(--text-color)">
                <animate 
                  attributeName="opacity" 
                  values="0.2;1;0.2" 
                  dur="1.8s" 
                  repeatCount="indefinite" 
                  begin="0s" 
                />
              </circle>
              <circle cx="30" cy="0" r="5" className="loading-dot" fill="var(--text-color)">
                <animate 
                  attributeName="opacity" 
                  values="0.2;1;0.2" 
                  dur="1.8s" 
                  repeatCount="indefinite" 
                  begin="0.3s" 
                />
              </circle>
              <circle cx="60" cy="0" r="5" className="loading-dot" fill="var(--text-color)">
                <animate 
                  attributeName="opacity" 
                  values="0.2;1;0.2" 
                  dur="1.8s" 
                  repeatCount="indefinite" 
                  begin="0.6s" 
                />
              </circle>
            </g>
          </g>
        </svg>
      </div>
    </div>
  )
}

export default FirstScreenLoader
