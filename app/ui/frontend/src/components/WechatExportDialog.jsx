import React, { useState, useEffect } from 'react'
import { X, Copy, Download, Eye, Palette, Settings } from 'lucide-react'
import { getAllThemes, getThemeById, generateWechatCSS } from '../config/wechatThemes'
import './WechatExportDialog.css'

/**
 * 微信公众号导出设置对话框
 * 功能：主题选择、样式自定义、实时预览、多种导出方式
 */
function WechatExportDialog({ show, onClose, content, previewHtml }) {
  const [selectedTheme, setSelectedTheme] = useState('default')
  const [customColors, setCustomColors] = useState({})
  const [showPreview, setShowPreview] = useState(true)
  const [exportStatus, setExportStatus] = useState('')

  const themes = getAllThemes()
  const currentTheme = getThemeById(selectedTheme)

  // 生成最终的 HTML
  const generateFinalHtml = () => {
    const theme = { ...currentTheme }
    // 应用自定义颜色
    if (Object.keys(customColors).length > 0) {
      theme.colors = { ...theme.colors, ...customColors }
    }
    
    const css = generateWechatCSS(theme)
    return `${css}<div class="wechat-content">${previewHtml}</div>`
  }

  // 复制富文本到剪贴板
  const handleCopyRichText = async () => {
    try {
      const html = generateFinalHtml()
      
      // 尝试使用 Clipboard API
      if (navigator.clipboard && window.ClipboardItem) {
        const blob = new Blob([html], { type: 'text/html' })
        const clipboardItem = new ClipboardItem({ 'text/html': blob })
        await navigator.clipboard.write([clipboardItem])
        setExportStatus('✅ 已复制！可以直接粘贴到微信公众号编辑器')
      } else {
        // 降级方案
        copyHtmlFallback(html)
      }
      
      setTimeout(() => setExportStatus(''), 3000)
    } catch (error) {
      console.error('复制失败:', error)
      setExportStatus('❌ 复制失败，请重试')
      setTimeout(() => setExportStatus(''), 3000)
    }
  }

  // 降级复制方案
  const copyHtmlFallback = (html) => {
    const container = document.createElement('div')
    container.innerHTML = html
    container.style.position = 'fixed'
    container.style.left = '-9999px'
    document.body.appendChild(container)

    const range = document.createRange()
    range.selectNodeContents(container)
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)

    try {
      document.execCommand('copy')
      setExportStatus('✅ 已复制！可以直接粘贴到微信公众号编辑器')
    } catch (err) {
      setExportStatus('❌ 复制失败，请使用导出 HTML 功能')
    }

    document.body.removeChild(container)
  }

  // 导出 HTML 文件
  const handleExportHtml = () => {
    const html = generateFinalHtml()
    const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>微信公众号文章</title>
</head>
<body>
  ${html}
</body>
</html>`

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `wechat-article-${Date.now()}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setExportStatus('✅ HTML 文件已下载')
    setTimeout(() => setExportStatus(''), 3000)
  }

  // 导出 CSS 文件
  const handleExportCss = () => {
    const theme = { ...currentTheme }
    if (Object.keys(customColors).length > 0) {
      theme.colors = { ...theme.colors, ...customColors }
    }
    
    const css = generateWechatCSS(theme).replace(/<\/?style>/g, '').trim()
    const blob = new Blob([css], { type: 'text/css;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `wechat-theme-${selectedTheme}.css`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setExportStatus('✅ CSS 文件已下载')
    setTimeout(() => setExportStatus(''), 3000)
  }

  // 重置自定义颜色
  const handleResetColors = () => {
    setCustomColors({})
    setExportStatus('✅ 已重置为默认颜色')
    setTimeout(() => setExportStatus(''), 2000)
  }

  if (!show) return null

  return (
    <div className="wechat-export-dialog-overlay" onClick={onClose}>
      <div className="wechat-export-dialog" onClick={(e) => e.stopPropagation()}>
        {/* 头部 */}
        <div className="dialog-header">
          <h2>
            <Palette size={20} />
            微信公众号导出
          </h2>
          <button className="close-btn" onClick={onClose} title="关闭">
            <X size={20} />
          </button>
        </div>

        {/* 内容区 */}
        <div className="dialog-content">
          {/* 左侧：设置面板 */}
          <div className="settings-panel">
            {/* 主题选择 */}
            <div className="setting-section">
              <h3>
                <Palette size={16} />
                选择主题
              </h3>
              <div className="theme-grid">
                {themes.map((theme) => (
                  <div
                    key={theme.id}
                    className={`theme-card ${selectedTheme === theme.id ? 'active' : ''}`}
                    onClick={() => setSelectedTheme(theme.id)}
                  >
                    <div 
                      className="theme-preview" 
                      style={{ background: theme.colors.primary }}
                    />
                    <div className="theme-info">
                      <div className="theme-name">{theme.name}</div>
                      <div className="theme-desc">{theme.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 颜色自定义 */}
            <div className="setting-section">
              <h3>
                <Settings size={16} />
                自定义颜色
                <button className="reset-btn" onClick={handleResetColors}>
                  重置
                </button>
              </h3>
              <div className="color-settings">
                <div className="color-item">
                  <label>主色调</label>
                  <input
                    type="color"
                    value={customColors.primary || currentTheme.colors.primary}
                    onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                  />
                </div>
                <div className="color-item">
                  <label>标题颜色</label>
                  <input
                    type="color"
                    value={customColors.h1Color || currentTheme.colors.h1Color}
                    onChange={(e) => setCustomColors({ ...customColors, h1Color: e.target.value })}
                  />
                </div>
                <div className="color-item">
                  <label>链接颜色</label>
                  <input
                    type="color"
                    value={customColors.linkColor || currentTheme.colors.linkColor}
                    onChange={(e) => setCustomColors({ ...customColors, linkColor: e.target.value })}
                  />
                </div>
                <div className="color-item">
                  <label>引用块背景</label>
                  <input
                    type="color"
                    value={customColors.quoteBg || currentTheme.colors.quoteBg}
                    onChange={(e) => setCustomColors({ ...customColors, quoteBg: e.target.value })}
                  />
                </div>
                <div className="color-item">
                  <label>代码块背景</label>
                  <input
                    type="color"
                    value={customColors.codeBg || currentTheme.colors.codeBg}
                    onChange={(e) => setCustomColors({ ...customColors, codeBg: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* 导出选项 */}
            <div className="setting-section">
              <h3>导出选项</h3>
              <div className="export-buttons">
                <button className="export-btn primary" onClick={handleCopyRichText}>
                  <Copy size={16} />
                  复制富文本
                </button>
                <button className="export-btn" onClick={handleExportHtml}>
                  <Download size={16} />
                  导出 HTML
                </button>
                <button className="export-btn" onClick={handleExportCss}>
                  <Download size={16} />
                  导出 CSS
                </button>
              </div>
              {exportStatus && (
                <div className="export-status">{exportStatus}</div>
              )}
            </div>
          </div>

          {/* 右侧：预览面板 */}
          {showPreview && (
            <div className="preview-panel">
              <div className="preview-header">
                <h3>
                  <Eye size={16} />
                  实时预览
                </h3>
              </div>
              <div 
                className="preview-content"
                dangerouslySetInnerHTML={{ __html: generateFinalHtml() }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WechatExportDialog
