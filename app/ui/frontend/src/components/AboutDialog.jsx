import React from 'react'
import { Sparkles, FileText, Palette, Save, FolderTree, Zap, Upload, Gauge } from 'lucide-react'
import './Dialog.css'
import './AboutDialog.css'

function AboutDialog({ onClose, theme }) {
  const getThemeClass = () => {
    if (theme === 'light') return 'theme-light'
    if (theme === 'md3') return 'theme-md3'
    return 'theme-dark'
  }

  const handleOverlayClick = () => {
    onClose()
  }

  const handleCloseClick = () => {
    onClose()
  }

  return (
    <div className="dialog-overlay compact-panel-overlay" onClick={handleOverlayClick}>
      <div className={`dialog-container compact-panel-dialog about-dialog ${getThemeClass()}`} onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>关于</h2>
          <button className="dialog-close" onClick={handleCloseClick}>×</button>
        </div>
        
        <div className="dialog-content about-content">
          <div className="about-logo">
            <div className="logo-circle">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <rect width="64" height="64" rx="12" fill="url(#gradient)"/>
                <path d="M16 24L24 16L32 24L40 16L48 24" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 32H48" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                <path d="M16 40H48" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                <path d="M16 48H32" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="64" y2="64">
                    <stop offset="0%" stopColor="#667eea"/>
                    <stop offset="100%" stopColor="#764ba2"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <div className="about-info">
            <h3 className="app-name">Markdown 编辑器</h3>
            <p className="app-version">版本 v1.27.31</p>
            <p className="app-description">
              专为飞牛 NAS 设计的专业 Markdown 编辑器
            </p>
          </div>

          <div className="about-features">
            <h4>核心功能</h4>
            <ul>
              <li><Sparkles size={16} /> 实时预览与语法高亮</li>
              <li><FileText size={16} /> 支持 GFM、LaTeX、Mermaid</li>
              <li><Palette size={16} /> 深色/浅色主题切换</li>
              <li><Save size={16} /> 自动保存与草稿恢复</li>
              <li><FolderTree size={16} /> 文件树浏览与管理</li>
              <li><Zap size={16} /> 专业菜单栏与快捷键</li>
              <li><Upload size={16} /> 多格式导出功能</li>
              <li><Gauge size={16} /> 性能优化与懒加载</li>
            </ul>
          </div>

          <div className="about-tech">
            <h4>技术栈</h4>
            <div className="tech-tags">
              <span className="tech-tag">React 18</span>
              <span className="tech-tag">Monaco Editor</span>
              <span className="tech-tag">Markdown-it</span>
              <span className="tech-tag">Mermaid</span>
              <span className="tech-tag">KaTeX</span>
              <span className="tech-tag">Vite 5</span>
            </div>
          </div>

          <div className="about-footer-info">
            <p>© 2026 Markdown 编辑器</p>
            <p>为飞牛 NAS 用户精心打造</p>
          </div>
        </div>

        <div className="dialog-footer">
          <button className="btn-primary" onClick={handleCloseClick}>关闭</button>
        </div>
      </div>
    </div>
  )
}

export default AboutDialog
