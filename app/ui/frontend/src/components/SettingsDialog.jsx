import React, { useState, useEffect } from 'react';
import AnimatedSelect from './AnimatedSelect';
import './SettingsDialog.css';

const SettingsDialog = ({ 
  onClose, 
  theme,
  fontSize = 14,
  lineHeight = 24,
  fontFamily = 'JetBrains Mono',
  lineNumbers = true,
  wordWrap = true,
  syncPreviewWithEditor = true,
  enableSlashMenuReorder = false,
  showNewWindowButton = true,
  showExportConfigButton = true,
  showPublishButton = true,
  onThemeChange,
  onSave
}) => {
  const [settings, setSettings] = useState({
    theme: theme,
    fontSize,
    lineHeight,
    tabSize: 2,
    wordWrap,
    lineNumbers,
    fontFamily,
    // 编辑与预览联动（编辑滚动时预览是否跟随）
    syncPreviewWithEditor,
    enableSlashMenuReorder,
    showNewWindowButton,
    showExportConfigButton,
    showPublishButton,
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // 弹窗中的设置项始终以父组件当前状态为准，避免显示默认值
    setSettings(prev => ({
      ...prev,
      theme,
      fontSize,
      lineHeight,
      fontFamily,
      lineNumbers,
      wordWrap,
      syncPreviewWithEditor,
      enableSlashMenuReorder,
      showNewWindowButton,
      showExportConfigButton,
      showPublishButton,
    }))
    setHasChanges(false)
  }, [
    theme,
    fontSize,
    lineHeight,
    fontFamily,
    lineNumbers,
    wordWrap,
    syncPreviewWithEditor,
    enableSlashMenuReorder,
    showNewWindowButton,
    showExportConfigButton,
    showPublishButton
  ]);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    // 回调设置值给父组件，由父组件负责持久化到数据库
    if (onSave) {
      onSave(settings);
    }

    // 如果主题变更，通知父组件触发主题切换逻辑
    if (settings.theme !== theme && onThemeChange) {
      onThemeChange(settings.theme);
    }

    setHasChanges(false);
    onClose();
  };

  const doRestoreDefaults = () => {
    const defaultSettings = {
      theme: 'light',
      fontSize: 14,
      lineHeight: 24,
      tabSize: 2,
      wordWrap: true,
      lineNumbers: true,
      fontFamily: 'JetBrains Mono',
      syncPreviewWithEditor: true,
      enableSlashMenuReorder: false,
      showNewWindowButton: true,
      showExportConfigButton: true,
      showPublishButton: true,
    };
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  const handleOverlayClick = () => {
    onClose();
  };

  const handleCloseClick = () => {
    onClose();
  };

  const handleCancelClick = () => {
    onClose();
  };

  const handleConfirmClick = () => {
    saveSettings();
  };

  const handleResetClick = () => {
    doRestoreDefaults();
  };

  return (
    <div className={`dialog-overlay compact-panel-overlay theme-${theme}`} onClick={handleOverlayClick}>
      <div className={`dialog-container compact-panel-dialog settings-dialog`} onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>设置</h2>
          <button className="dialog-close" onClick={handleCloseClick}>×</button>
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
                <AnimatedSelect
                  value={settings.theme}
                  onChange={(value) => handleChange('theme', value)}
                  options={[
                    { value: 'light', label: '浅色' },
                    { value: 'dark', label: '深色' },
                  ]}
                  wrapperClassName="setting-select-control"
                />
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
                <AnimatedSelect
                  value={settings.fontFamily}
                  onChange={(value) => handleChange('fontFamily', value)}
                  options={[
                    { value: 'JetBrains Mono', label: 'JetBrains Mono' },
                    { value: 'Fira Code', label: 'Fira Code' },
                    { value: 'Monaco', label: 'Monaco' },
                    { value: 'Consolas', label: 'Consolas' },
                    { value: 'monospace', label: '系统等宽字体' },
                  ]}
                  wrapperClassName="setting-select-control"
                />
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
                  <label>编辑-预览联动</label>
                  <p className="setting-description">左右联动：左边滑动时右边跟随，右边滑动时左边跟随</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.syncPreviewWithEditor}
                    onChange={(e) => handleChange('syncPreviewWithEditor', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <label>启用斜杠菜单拖拽排序</label>
                  <p className="setting-description">开启后，可在 / 命令菜单中拖拽调整条目顺序</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.enableSlashMenuReorder}
                    onChange={(e) => handleChange('enableSlashMenuReorder', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

            </div>

            {/* 工具栏按钮 */}
            <div className="settings-section">
              <h3 className="section-title">工具栏按钮</h3>

              <div className="setting-item">
                <div className="setting-label">
                  <label>显示“新窗口”</label>
                  <p className="setting-description">控制顶部菜单栏“新窗口”入口是否显示</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.showNewWindowButton}
                    onChange={(e) => handleChange('showNewWindowButton', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <label>显示“导出配置”</label>
                  <p className="setting-description">控制顶部工具栏“导出配置”按钮是否显示</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.showExportConfigButton}
                    onChange={(e) => handleChange('showExportConfigButton', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-label">
                  <label>显示“发布”</label>
                  <p className="setting-description">控制顶部工具栏“发布到多平台”按钮是否显示</p>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.showPublishButton}
                    onChange={(e) => handleChange('showPublishButton', e.target.checked)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="dialog-footer">
          <button className="btn-secondary" onClick={handleResetClick}>恢复默认</button>
          <div className="footer-right">
            <button className="btn-secondary" onClick={handleCancelClick}>取消</button>
            <button 
              className="btn-primary" 
              onClick={handleConfirmClick}
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

