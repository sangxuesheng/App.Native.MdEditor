import React, { useState, useEffect } from 'react';
import { Folder, FolderOpen, ChevronRight, ChevronDown, Plus } from 'lucide-react';
import './FileBrowser.css';

const FileBrowser = ({ rootDirs, theme, onPathSelect, selectedPath }) => {
  const [selectedRootDir, setSelectedRootDir] = useState(null);
  const [subDirectories, setSubDirectories] = useState([]);
  const [expandedDirs, setExpandedDirs] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderParent, setNewFolderParent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (rootDirs && rootDirs.length > 0) {
      setSelectedRootDir(rootDirs[0]);
      loadSubDirectories(rootDirs[0].path);
    }
  }, [rootDirs]);

  const loadSubDirectories = async (rootPath) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/files?path=${encodeURIComponent(rootPath)}`);
      const data = await response.json();
      
      if (data.ok && data.items) {
        const dirs = data.items.filter(item => item.type === 'directory');
        setSubDirectories(dirs);
      } else {
        setError(data.message || '加载目录失败');
      }
    } catch (err) {
      setError('网络错误');
      console.error('Load subdirectories error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRootDirSelect = (dir) => {
    setSelectedRootDir(dir);
    loadSubDirectories(dir.path);
    setExpandedDirs(new Set());
  };

  const handleSubDirClick = (dir) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(dir.path)) {
      newExpanded.delete(dir.path);
    } else {
      newExpanded.add(dir.path);
    }
    setExpandedDirs(newExpanded);
  };

  const handleDirSelect = (dir) => {
    onPathSelect(dir.path);
  };

  const handleNewFolder = (parentDir) => {
    setNewFolderParent(parentDir);
    setNewFolderName('');
    setShowNewFolderDialog(true);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setError('请输入文件夹名称');
      return;
    }

    try {
      const folderPath = newFolderParent ? `${newFolderParent}/${newFolderName.trim()}` : newFolderName.trim();
      
      const response = await fetch('/api/directory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: folderPath })
      });

      const data = await response.json();

      if (data.ok) {
        setShowNewFolderDialog(false);
        setNewFolderName('');
        setError('');
        
        if (newFolderParent) {
          loadSubDirectories(selectedRootDir.path);
        } else {
          loadSubDirectories(selectedRootDir.path);
        }
      } else {
        setError(data.message || '创建文件夹失败');
      }
    } catch (err) {
      setError('网络错误，请重试');
      console.error('Create folder error:', err);
    }
  };

  const renderDirectoryTree = (dirs, depth = 0) => {
    return dirs.map(dir => (
      <div key={dir.path} className="directory-item">
        <div 
          className={`directory-node ${selectedPath === dir.path ? 'selected' : ''}`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => handleDirSelect(dir)}
        >
          {dir.children && dir.children.length > 0 && (
            <button 
              className="expand-button"
              onClick={(e) => {
                e.stopPropagation();
                handleSubDirClick(dir);
              }}
            >
              {expandedDirs.has(dir.path) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
          <Folder size={16} className="folder-icon" />
          <span className="directory-name">{dir.name}</span>
        </div>
        {expandedDirs.has(dir.path) && dir.children && (
          <div className="directory-children">
            {renderDirectoryTree(dir.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className={`file-browser ${theme === 'light' ? 'theme-light' : theme === 'md3' ? 'theme-md3' : 'theme-dark'}`}>
      <div className="file-browser-sidebar">
        <div className="sidebar-header">
          <span className="sidebar-title">目录</span>
        </div>
        <div className="root-directories">
          {rootDirs && rootDirs.map(dir => (
            <div
              key={dir.path}
              className={`root-directory ${selectedRootDir?.path === dir.path ? 'selected' : ''}`}
              onClick={() => handleRootDirSelect(dir)}
            >
              <Folder size={18} className="folder-icon" />
              <span className="directory-name">{dir.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="file-browser-content">
        <div className="content-header">
          <span className="content-title">{selectedRootDir?.name || '请选择目录'}</span>
          <button 
            className="btn-secondary btn-sm"
            onClick={() => handleNewFolder(selectedRootDir?.path)}
          >
            <Plus size={14} />
            新建文件夹
          </button>
        </div>
        
        {loading && (
          <div className="loading-state">加载中...</div>
        )}
        
        {error && (
          <div className="error-message">{error}</div>
        )}
        
        {!loading && !error && subDirectories.length === 0 && (
          <div className="empty-state">
            <Folder size={48} className="empty-icon" />
            <span className="empty-text">此目录为空</span>
          </div>
        )}
        
        {!loading && !error && subDirectories.length > 0 && (
          <div className="directory-tree">
            {renderDirectoryTree(subDirectories)}
          </div>
        )}
      </div>

      {showNewFolderDialog && (
        <div className="new-folder-overlay" onClick={() => setShowNewFolderDialog(false)}>
          <div className="new-folder-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <h3>新建文件夹</h3>
              <button className="dialog-close" onClick={() => setShowNewFolderDialog(false)}>×</button>
            </div>
            <div className="dialog-body">
              <div className="form-group">
                <label>文件夹名称</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="输入文件夹名称"
                  className="form-input"
                  autoFocus
                />
              </div>
              {error && <div className="error-message">{error}</div>}
            </div>
            <div className="dialog-footer">
              <button className="btn-secondary" onClick={() => setShowNewFolderDialog(false)}>取消</button>
              <button className="btn-primary" onClick={handleCreateFolder}>确定</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileBrowser;
