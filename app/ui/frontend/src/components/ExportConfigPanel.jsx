import React, { useState } from 'react'
import { 
  ChevronDown, 
  ChevronUp, 
  Palette, 
  Type, 
  Code, 
  Image as ImageIcon,
  Settings,
  FileText,
  MoreHorizontal
} from 'lucide-react'
import './ExportConfigPanel.css'

/**
 * 配置区块组件
 */
const ConfigSection = ({ title, icon: Icon, children, defaultExpanded = true }) => {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div className="config-section">
      <div 
        className="config-section-header"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="section-title">
          {Icon && <Icon size={16} />}
          <span>{title}</span>
        </div>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>
      {expanded && (
        <div className="config-section-body">
          {children}
        </div>
      )}
    </div>
  )
}

/**
 * 选择器组件
 */
const Select = ({ label, value, options, onChange }) => {
  return (
    <div className="config-item">
      {label && <label className="config-label">{label}</label>}
      <select 
        className="config-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

/**
 * 单选按钮组
 */
const RadioGroup = ({ label, value, options, onChange }) => {
  return (
    <div className="config-item">
      {label && <label className="config-label">{label}</label>}
      <div className="radio-group">
        {options.map(opt => (
          <label key={opt.value} className="radio-label">
            <input
              type="radio"
              name={label}
              value={opt.value}
              checked={value === opt.value}
              onChange={(e) => onChange(e.target.value)}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

/**
 * 主题选择器
 */
const ThemeSelector = ({ value, themes, onChange }) => {
  return (
    <div className="theme-selector">
      {themes.map(theme => (
        <div
          key={theme.value}
          className={`theme-card ${value === theme.value ? 'selected' : ''}`}
          onClick={() => onChange(theme.value)}
        >
          <div 
            className="theme-preview"
            style={{
              background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`
            }}
          />
          <span className="theme-name">{theme.label}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * 导出配置面板
 */
const ExportConfigPanel = ({ config, onChange, onClose }) => {
  // 标题样式选项
  const titleStyleOptions = [
    { value: 'default', label: '默认样式' },
    { value: 'blue', label: '蓝色主题' },
    { value: 'green', label: '绿色主题' },
    { value: 'orange', label: '橙色主题' },
    { value: 'purple', label: '紫色主题' },
    { value: 'red', label: '红色主题' },
    { value: 'cyan', label: '青色主题' },
    { value: 'gray', label: '灰色主题' }
  ]

  // 主题选项
  const themeOptions = [
    { 
      value: 'default', 
      label: '默认',
      primaryColor: '#3daeff',
      secondaryColor: '#5ab9ff'
    },
    { 
      value: 'simple', 
      label: '简约',
      primaryColor: '#333333',
      secondaryColor: '#666666'
    },
    { 
      value: 'business', 
      label: '商务',
      primaryColor: '#1a73e8',
      secondaryColor: '#4285f4'
    },
    { 
      value: 'tech', 
      label: '科技',
      primaryColor: '#00d4ff',
      secondaryColor: '#00ffff'
    },
    { 
      value: 'literary', 
      label: '文艺',
      primaryColor: '#ff6b9d',
      secondaryColor: '#ffa8c5'
    }
  ]

  // 代码样式选项
  const codeThemeOptions = [
    { value: 'github', label: 'GitHub' },
    { value: 'monokai', label: 'Monokai' },
    { value: 'atom-one-dark', label: 'Atom One Dark' },
    { value: 'vscode', label: 'VS Code' },
    { value: 'dracula', label: 'Dracula' }
  ]

  // 图注格式选项
  const captionFormatOptions = [
    { value: 'title-first', label: 'title 优先' },
    { value: 'alt-first', label: 'alt 优先' },
    { value: 'none', label: '不显示' }
  ]

  // 图床类型选项
  const imageHostOptions = [
    { value: 'local', label: '本地图片' },
    { value: 'upload', label: '图床上传' },
    { value: 'base64', label: 'Base64 嵌入' }
  ]

  const updateConfig = (key, value) => {
    onChange({
      ...config,
      [key]: value
    })
  }

  return (
    <div className="export-config-panel">
      <div className="panel-header">
        <h3>导出配置</h3>
        <button className="panel-close" onClick={onClose}>×</button>
      </div>

      <div className="panel-body">
        {/* 1. 标题样式 */}
        <ConfigSection title="标题样式" icon={Type} defaultExpanded={true}>
          <Select
            value={config.titleStyle}
            options={titleStyleOptions}
            onChange={(value) => updateConfig('titleStyle', value)}
          />
        </ConfigSection>

        {/* 2. 主题文字 */}
        <ConfigSection title="主题文字" icon={Palette} defaultExpanded={true}>
          <ThemeSelector
            value={config.theme}
            themes={themeOptions}
            onChange={(value) => updateConfig('theme', value)}
          />
        </ConfigSection>

        {/* 3. 代码样式 */}
        <ConfigSection title="代码样式" icon={Code} defaultExpanded={false}>
          <Select
            value={config.codeTheme}
            options={codeThemeOptions}
            onChange={(value) => updateConfig('codeTheme', value)}
          />
        </ConfigSection>

        {/* 4. 图注格式 */}
        <ConfigSection title="图注格式" icon={ImageIcon} defaultExpanded={false}>
          <RadioGroup
            value={config.captionFormat}
            options={captionFormatOptions}
            onChange={(value) => updateConfig('captionFormat', value)}
          />
        </ConfigSection>

        {/* 5. 图床配置 */}
        <ConfigSection title="图床配置" icon={ImageIcon} defaultExpanded={false}>
          <Select
            label="图床类型"
            value={config.imageHost}
            options={imageHostOptions}
            onChange={(value) => updateConfig('imageHost', value)}
          />
          {config.imageHost === 'upload' && (
            <div className="config-item">
              <label className="config-label">上传地址</label>
              <input
                type="text"
                className="config-input"
                placeholder="https://..."
                value={config.imageUploadUrl || ''}
                onChange={(e) => updateConfig('imageUploadUrl', e.target.value)}
              />
            </div>
          )}
        </ConfigSection>

        {/* 6. 自定义样式 */}
        <ConfigSection title="自定义样式" icon={Settings} defaultExpanded={false}>
          <div className="config-item">
            <label className="config-label">自定义 CSS</label>
            <textarea
              className="config-textarea"
              rows={6}
              placeholder="/* 输入自定义 CSS */"
              value={config.customCSS || ''}
              onChange={(e) => updateConfig('customCSS', e.target.value)}
            />
          </div>
        </ConfigSection>

        {/* 7. 格式配置 */}
        <ConfigSection title="格式配置" icon={FileText} defaultExpanded={false}>
          <div className="config-item">
            <label className="config-label">段落间距</label>
            <input
              type="range"
              min="0"
              max="30"
              value={config.paragraphSpacing || 16}
              onChange={(e) => updateConfig('paragraphSpacing', parseInt(e.target.value))}
            />
            <span className="range-value">{config.paragraphSpacing || 16}px</span>
          </div>
          <div className="config-item">
            <label className="config-label">字体大小</label>
            <input
              type="range"
              min="12"
              max="20"
              value={config.fontSize || 16}
              onChange={(e) => updateConfig('fontSize', parseInt(e.target.value))}
            />
            <span className="range-value">{config.fontSize || 16}px</span>
          </div>
          <div className="config-item">
            <label className="config-label">行高</label>
            <input
              type="range"
              min="1.2"
              max="2.5"
              step="0.1"
              value={config.lineHeight || 1.6}
              onChange={(e) => updateConfig('lineHeight', parseFloat(e.target.value))}
            />
            <span className="range-value">{config.lineHeight || 1.6}</span>
          </div>
        </ConfigSection>

        {/* 8. 其他选项 */}
        <ConfigSection title="其他选项" icon={MoreHorizontal} defaultExpanded={false}>
          <div className="config-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.includeTOC || false}
                onChange={(e) => updateConfig('includeTOC', e.target.checked)}
              />
              <span>包含目录</span>
            </label>
          </div>
          <div className="config-item">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config.showPageNumber || false}
                onChange={(e) => updateConfig('showPageNumber', e.target.checked)}
              />
              <span>显示页码</span>
            </label>
          </div>
          <div className="config-item">
            <label className="config-label">水印文字</label>
            <input
              type="text"
              className="config-input"
              placeholder="输入水印文字"
              value={config.watermark || ''}
              onChange={(e) => updateConfig('watermark', e.target.value)}
            />
          </div>
        </ConfigSection>
      </div>

      <div className="panel-footer">
        <button 
          className="btn-reset"
          onClick={() => onChange({
            titleStyle: 'default',
            theme: 'default',
            codeTheme: 'github',
            captionFormat: 'title-first',
            imageHost: 'local',
            customCSS: '',
            paragraphSpacing: 16,
            fontSize: 16,
            lineHeight: 1.6,
            includeTOC: false,
            showPageNumber: false,
            watermark: ''
          })}
        >
          重置配置
        </button>
      </div>
    </div>
  )
}

export default ExportConfigPanel
