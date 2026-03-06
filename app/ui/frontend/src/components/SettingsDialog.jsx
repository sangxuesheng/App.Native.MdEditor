import React, { useState, useEffect } from 'react';
import './SettingsDialog.css';

const SettingsDialog = ({ 
  onClose, 
  theme,
  onThemeChange 
}) => {
  const [settings, setSettings] = useState({
    theme: theme,
    fontSize: 14,
    lineHeight: 24,
    tabSize: 2,
    wordWrap: true,
    minimap: false,
    lineNumbers: true,
    fontFamily: 'JetBrains Mono',
    imageCompression: true,
    imageQuality: 80,
    imageMaxWidth: 1920,
    imageMaxHeight: 1080
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // 从 localStorage 加载设置
    const savedSettings = localStorage.getItem('md-editor-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        // 使用传入的 theme 而不是保存的值
        setSettings(prev => ({ ...prev, ...parsed, theme: theme }));
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    }
  }, [theme]);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // 保存到 localStorage
    localStorage.setItem('md-editor-settings', JSON.stringify(settings));

    // 应用主题设置
    if (settings.theme !== theme) {
      // 直接设置主题
      localStorage.setItem('md-editor-theme', settings.theme);
      onThemeChange();
    }

    setHasChanges(false);
    onClose();
  };

  const handleReset = () => {
    const defaultSettings = {
      theme: 'light',
      fontSize: 14,
      lineHeight: 24,
      tabSize: 2,
      wordWrap: true,
      minimap: false,
      lineNumbers: true,
      fontFamily: 'JetBrains Mono',
      imageCompression: true,
      imageQuality: 80,
      imageMaxWidth: 1920,
      imageMaxHeight: 1080
    };
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  return (
    <div className={`dialog-overlay theme-${theme}`} onClick={onClose}>
      <div className="dialog-content settings-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>设置</h2>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>

        <div className="dialog-body">
          <div className="settings-form">
            {/* 通用设置 */}
            <div className="settings-section">
              <h3 className="section-title">通用</h3>
              
              <div className="setting-item">
                <div className="setting-label">
                  <label>主题</label>
                  <p className="setting-description">选择编辑器的外观主题</p>
                </div>
                <select 
                  value={settings.theme} 
                  onChange={(e) => handleChange('theme', e.target.value)}
                  className="form-select"
                >
                  <option value="light">浅色</option>
                  <option value="dark">深色</option>
                </select>
              </div>
            </div>

            {/* 编辑器设置 */}
            <div className="settings-section">
              <h3 className="section-title">编辑器</h3>
              
              <div className="setting-item">
                <div className="setting-label">
                  <label>字体大小</label>
                  <p className="setting-description">编辑器字体大小（像素）</p>
                </div>
                <input
                  type="number"
                  min="10"
                  max="24"
                  value={settings.fontSize}
                  onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                  className="form-input"
                  style={{ width: '100px' }}
                />
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <label>行高</label>
                  <p className="setting-description">编辑器行高（像素）</p>
                </div>
                <input
                  type="number"
                  min="16"
                  max="40"
                  value={settings.lineHeight}
                  onChange={(e) => handleChange('lineHeight', parseInt(e.target.value))}
                  className="form-input"
                  style={{ width: '100px' }}
                />
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <label>Tab 大小</label>
                  <p className="setting-description">Tab 键对应的空格数</p>
                </div>
                <input
                  type="number"
                  min="2"
                  max="8"
                  value={settings.tabSize}
                  onChange={(e) => handleChange('tabSize', parseInt(e.target.value))}
                  className="form-input"
                  style={{ width: '100px' }}
                />
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <label>字体</label>
                  <p className="setting-description">编辑器字体</p>
                </div>
                <select 
                  value={settings.fontFamily} 
                  onChange={(e) => handleChange('fontFamily', e.target.value)}
                  className="form-select"
                >
                  <option value="JetBrains Mono">JetBrains Mono</option>
                  <option value="Fira Code">Fira Code</option>
                  <option value="Monaco">Monaco</option>
                  <option value="Consolas">Consolas</option>
                  <option value="monospace">系统等宽字体</option>
                </select>
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <label>自动换行</label>
                  <p className="setting-description">长行自动换行显示</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.wordWrap}
                    onChange={(e) => handleChange('wordWrap', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <label>显示行号</label>
                  <p className="setting-description">在编辑器左侧显示行号</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.lineNumbers}
                    onChange={(e) => handleChange('lineNumbers', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <label>显示小地图</label>
                  <p className="setting-description">在编辑器右侧显示代码小地图</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.minimap}
                    onChange={(e) => handleChange('minimap', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            {/* 图片设置 */}
            <div className="settings-section">
              <h3 className="section-title">图片</h3>
              
              <div className="setting-item">
                <div className="setting-label">
                  <label>自动压缩图片</label>
                  <p className="setting-description">上传图片时自动压缩以节省空间</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.imageCompression}
                    onChange={(e) => handleChange('imageCompression', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              {settings.imageCompression && (
                <>
                  <div className="setting-item">
                    <div className="setting-label">
                      <label>压缩质量</label>
                      <p className="setting-description">图片压缩质量（0-100，值越大质量越好）</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={settings.imageQuality}
                        onChange={(e) => handleChange('imageQuality', parseInt(e.target.value))}
                        className="form-range"
                        style={{ flex: 1 }}
                      />
                      <span style={{ minWidth: '40px', textAlign: 'right' }}>{settings.imageQuality}%</span>
                    </div>
                  </div>

                  <div className="setting-item">
                    <div className="setting-label">
                      <label>最大宽度</label>
                      <p className="setting-description">图片最大宽度（像素）</p>
                    </div>
                    <input
                      type="number"
                      min="800"
                      max="4096"
                      step="100"
                      value={settings.imageMaxWidth}
                      onChange={(e) => handleChange('imageMaxWidth', parseInt(e.target.value))}
                      className="form-input"
                      style={{ width: '120px' }}
                    />
                  </div>

                  <div className="setting-item">
                    <div className="setting-label">
                      <label>最大高度</label>
                      <p className="setting-description">图片最大高度（像素）</p>
                    </div>
                    <input
                      type="number"
                      min="600"
                      max="4096"
                      step="100"
                      value={settings.imageMaxHeight}
                      onChange={(e) => handleChange('imageMaxHeight', parseInt(e.target.value))}
                      className="form-input"
                      style={{ width: '120px' }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="dialog-footer">
          <button className="btn-secondary" onClick={handleReset}>恢复默认</button>
          <div className="footer-right">
            <button className="btn-secondary" onClick={onClose}>取消</button>
            <button 
              className="btn-primary" 
              onClick={handleSave}
              disabled={!hasChanges}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDialog;

