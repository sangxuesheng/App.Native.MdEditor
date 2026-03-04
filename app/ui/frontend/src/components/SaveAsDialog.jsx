import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import FileBrowser from './FileBrowser';
import './SaveAsDialog.css';

const SaveAsDialog = ({ onClose, onConfirm, rootDirs, currentPath, theme, isSaveAs = true, initialFileName = '' }) => {
  const [fileName, setFileName] = useState('');
  const [selectedPath, setSelectedPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);
  const [targetPath, setTargetPath] = useState('');

  useEffect(() => {
    // 设置文件名
    if (initialFileName) {
      // 从NewFileDialog传递过来的文件名
      setFileName(initialFileName.replace(/\.md$/, ''));
    } else if (currentPath) {
      // 从当前路径提取文件名
      const pathParts = currentPath.split('/');
      const currentFileName = pathParts[pathParts.length - 1];
      setFileName(currentFileName.replace(/\.md$/, ''));
    }
  }, [rootDirs, currentPath, initialFileName]);

  const checkFileExists = async (path) => {
    try {
      const response = await fetch(`/api/file?path=${encodeURIComponent(path)}`);
      const data = await response.json();
      return data.ok; // 如果文件存在，返回 true
    } catch (err) {
      return false;
    }
  };

  const handlePathSelect = (path) => {
    setSelectedPath(path);
  };

  const handleSaveAs = async () => {
    if (!fileName.trim()) {
      setError('请输入文件名');
      return;
    }

    if (!selectedPath) {
      setError('请选择保存位置');
      return;
    }

    // 确保文件名以 .md 结尾
    let finalFileName = fileName.trim();
    if (!finalFileName.endsWith('.md')) {
      finalFileName += '.md';
    }

    // 构建完整路径
    const fullPath = `${selectedPath}/${finalFileName}`;

    // 检查是否与当前文件相同
    if (fullPath === currentPath) {
      setError('目标路径与当前文件相同，请使用"保存"功能');
      return;
    }

    setLoading(true);
    setError('');

    // 检查文件是否已存在
    const exists = await checkFileExists(fullPath);
    
    if (exists) {
      // 文件已存在，显示覆盖确认
      setTargetPath(fullPath);
      setShowOverwriteConfirm(true);
      setLoading(false);
    } else {
      // 文件不存在，直接保存
      await performSaveAs(fullPath);
    }
  };

  const performSaveAs = async (path) => {
    setLoading(true);
    setError('');

    try {
      onConfirm(path);
      onClose();
    } catch (err) {
      setError('保存失败，请重试');
      console.error('Save as error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOverwriteConfirm = () => {
    setShowOverwriteConfirm(false);
    performSaveAs(targetPath);
  };

  const handleOverwriteCancel = () => {
    setShowOverwriteConfirm(false);
    setTargetPath('');
    setLoading(false);
  };

  const getFullPath = () => {
    if (!selectedPath || !fileName.trim()) {
      return '';
    }
    let finalFileName = fileName.trim();
    if (!finalFileName.endsWith('.md')) {
      finalFileName += '.md';
    }
    return `${selectedPath}/${finalFileName}`;
  };

  return (
    <div className="dialog-overlay theme-light" onClick={onClose}>
      <div className="dialog-content save-as-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>{isSaveAs ? '另存为' : '保存到'}</h2>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>

        <div className="dialog-body">
          {!showOverwriteConfirm ? (
            <div className="save-as-form">
              <div className="file-browser-container">
                <FileBrowser 
                  rootDirs={rootDirs}
                  theme="light"
                  onPathSelect={handlePathSelect}
                  selectedPath={selectedPath}
                />
              </div>

              {error && <div className="error-message">{error}</div>}
            </div>
          ) : (
            <div className="overwrite-confirm">
              <div className="confirm-icon"><AlertTriangle size={48} /></div>
              <h3>文件已存在</h3>
              <p>目标位置已存在同名文件：</p>
              <div className="confirm-path">{targetPath}</div>
              <p>是否要覆盖现有文件？</p>
            </div>
          )}
        </div>

        <div className="dialog-footer">
          {!showOverwriteConfirm ? (
            <>
              <div className="footer-left">
                <div className="file-name-input-footer">
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveAs()}
                    placeholder="输入文件名"
                    className="form-input"
                    autoFocus
                  />
                  <span className="file-extension">.md</span>
                </div>
              </div>
              <div className="footer-right">
                <button className="btn-secondary" onClick={onClose}>取消</button>
                <button 
                  className="btn-primary" 
                  onClick={handleSaveAs}
                  disabled={loading || !fileName.trim() || !selectedPath}
                >
                  {loading ? '保存中...' : (isSaveAs ? '另存为' : '保存')}
                </button>
              </div>
            </>
          ) : (
            <>
              <button className="btn-secondary" onClick={handleOverwriteCancel}>取消</button>
              <button className="btn-danger" onClick={handleOverwriteConfirm}>
                覆盖
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaveAsDialog;
