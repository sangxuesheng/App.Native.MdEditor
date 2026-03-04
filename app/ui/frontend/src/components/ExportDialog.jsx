import React, { useState } from 'react';
import { Globe, FileText, File, FileCode } from 'lucide-react';
import './ExportDialog.css';

const ExportDialog = ({ onClose, content, currentPath, theme, previewHtml }) => {
  const [exportFormat, setExportFormat] = useState('html');
  const [exportTheme, setExportTheme] = useState('github-dark');
  const [includeCSS, setIncludeCSS] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getFileName = () => {
    if (currentPath) {
      const pathParts = currentPath.split('/');
      const fileName = pathParts[pathParts.length - 1];
      return fileName.replace(/\.md$/, '');
    }
    return 'document';
  };

  const exportAsHTML = () => {
    const fileName = getFileName();
    const cssTheme = exportTheme === 'github-dark' 
      ? 'github-markdown-dark' 
      : 'github-markdown-light';
    
    const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileName}</title>
  ${includeCSS ? `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css@5/github-markdown-${exportTheme === 'github-dark' ? 'dark' : 'light'}.min.css">
  <script>
    window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true,
        processEnvironments: true
      }
    };
  </script>
  <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
  <style>
    body {
      margin: 0;
      padding: 20px;
      background-color: ${exportTheme === 'github-dark' ? '#0d1117' : '#ffffff'};
    }
    .markdown-body {
      box-sizing: border-box;
      min-width: 200px;
      max-width: 980px;
      margin: 0 auto;
      padding: 45px;
    }
    @media (max-width: 767px) {
      .markdown-body {
        padding: 15px;
      }
    }
  </style>` : ''}
</head>
<body>
  <div class="markdown-body ${cssTheme}">
    ${previewHtml || ''}
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsPDF = async () => {
    setError('PDF 导出功能需要服务器端支持，当前版本暂不支持。您可以先导出为 HTML，然后使用浏览器的"打印为 PDF"功能。');
  };

  const exportAsMarkdown = () => {
    const fileName = getFileName();
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAsText = () => {
    const fileName = getFileName();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setLoading(true);
    setError('');

    try {
      switch (exportFormat) {
        case 'html':
          exportAsHTML();
          setTimeout(() => {
            onClose();
          }, 500);
          break;
        case 'pdf':
          await exportAsPDF();
          break;
        case 'markdown':
          exportAsMarkdown();
          setTimeout(() => {
            onClose();
          }, 500);
          break;
        case 'text':
          exportAsText();
          setTimeout(() => {
            onClose();
          }, 500);
          break;
        default:
          setError('不支持的导出格式');
      }
    } catch (err) {
      setError('导出失败: ' + err.message);
      console.error('Export error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`dialog-overlay ${theme === 'light' ? 'theme-light' : 'theme-dark'}`} onClick={onClose}>
      <div className="dialog-content export-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>导出文档</h2>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>

        <div className="dialog-body">
          <div className="export-form">
            <div className="form-group">
              <label>导出格式</label>
              <div className="format-options">
                <label className={`format-option ${exportFormat === 'html' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="format"
                    value="html"
                    checked={exportFormat === 'html'}
                    onChange={(e) => setExportFormat(e.target.value)}
                  />
                  <div className="format-card">
                    <div className="format-icon"><Globe size={32} /></div>
                    <div className="format-info">
                      <h4>HTML</h4>
                      <p>网页格式，可在浏览器中打开</p>
                    </div>
                  </div>
                </label>

                <label className={`format-option ${exportFormat === 'pdf' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="format"
                    value="pdf"
                    checked={exportFormat === 'pdf'}
                    onChange={(e) => setExportFormat(e.target.value)}
                  />
                  <div className="format-card">
                    <div className="format-icon"><File size={32} /></div>
                    <div className="format-info">
                      <h4>PDF</h4>
                      <p>便携式文档格式</p>
                    </div>
                  </div>
                </label>

                <label className={`format-option ${exportFormat === 'markdown' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="format"
                    value="markdown"
                    checked={exportFormat === 'markdown'}
                    onChange={(e) => setExportFormat(e.target.value)}
                  />
                  <div className="format-card">
                    <div className="format-icon"><FileCode size={32} /></div>
                    <div className="format-info">
                      <h4>Markdown</h4>
                      <p>原始 Markdown 文件</p>
                    </div>
                  </div>
                </label>

                <label className={`format-option ${exportFormat === 'text' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="format"
                    value="text"
                    checked={exportFormat === 'text'}
                    onChange={(e) => setExportFormat(e.target.value)}
                  />
                  <div className="format-card">
                    <div className="format-icon"><FileText size={32} /></div>
                    <div className="format-info">
                      <h4>纯文本</h4>
                      <p>TXT 文本文件</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {exportFormat === 'html' && (
              <>
                <div className="form-group">
                  <label>主题</label>
                  <select 
                    value={exportTheme} 
                    onChange={(e) => setExportTheme(e.target.value)}
                    className="form-select"
                  >
                    <option value="github-dark">GitHub Dark</option>
                    <option value="github-light">GitHub Light</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={includeCSS}
                      onChange={(e) => setIncludeCSS(e.target.checked)}
                    />
                    <span>包含样式表（推荐）</span>
                  </label>
                  <p className="form-hint">包含 CSS 样式可以确保导出的 HTML 正确显示</p>
                </div>
              </>
            )}

            <div className="export-info">
              <div className="info-item">
                <span className="info-label">文件名:</span>
                <span className="info-value">{getFileName()}.{exportFormat === 'markdown' ? 'md' : exportFormat === 'text' ? 'txt' : exportFormat}</span>
              </div>
              <div className="info-item">
                <span className="info-label">大小:</span>
                <span className="info-value">{(content.length / 1024).toFixed(2)} KB</span>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}
          </div>
        </div>

        <div className="dialog-footer">
          <button className="btn-secondary" onClick={onClose}>取消</button>
          <button 
            className="btn-primary" 
            onClick={handleExport}
            disabled={loading}
          >
            {loading ? '导出中...' : '导出'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;

