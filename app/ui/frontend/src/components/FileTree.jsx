import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { ChevronRight, File, Folder, Star, FileText, FileJson } from 'lucide-react';
import FavoritesPanel from './FavoritesPanel';
import FileSearchBox from './FileSearchBox';
import OutlinePanel from './OutlinePanel';
import HistoryPanel from './HistoryPanel';
import ContextMenu from './ContextMenu';
import RenameDialog from './RenameDialog';
import NewFolderDialog from './NewFolderDialog';
import FilePropertiesDialog from './FilePropertiesDialog';
import AnimatedList from './AnimatedList';
import { filterFileTree, highlightMatches } from '../utils/fileSearcher';
import { useDebounce } from '../hooks/useDebounce';
import { toggleFavorite, isFavorite, updateFavoritePath } from '../utils/favoritesManager';
import './FileTree.css';

const FileTree = forwardRef(({ 
  onFileSelect, 
  currentPath,
  favorites,
  onOpenFavorite,
  onRemoveFavorite,
  onClearFavorites,
  onReorderFavorites,
  content,
  onHeadingClick,
  onVersionRestore,
  style
}, ref) => {
  // 从 localStorage 恢复展开状态
  const getInitialExpandedState = () => {
    try {
      const saved = localStorage.getItem('md-editor-expanded-folders');
      console.log('[FileTree] Restoring expanded folders:', saved);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log('[FileTree] Restored expanded folders:', parsed);
        return new Set(parsed);
      }
    } catch (error) {
      console.error('Failed to restore expanded folders:', error);
    }
    return new Set();
  };

  const [activeTab, setActiveTab] = useState('files'); // 'files', 'outline', 'history'
  const [tree, setTree] = useState([]);
  const [expanded, setExpanded] = useState(getInitialExpandedState());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);
  
  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  // 保存展开状态到 localStorage
  useEffect(() => {
    try {
      const expandedArray = Array.from(expanded);
      localStorage.setItem('md-editor-expanded-folders', JSON.stringify(expandedArray));
      console.log('[FileTree] Saved expanded folders:', expandedArray);
    } catch (error) {
      console.error('Failed to save expanded folders:', error);
    }
  }, [expanded]);
  // 重命名对话框状态
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renameNode, setRenameNode] = useState(null);

  // 新建文件夹对话框状态
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderParent, setNewFolderParent] = useState(null);

  // 文件属性对话框状态
  const [showPropertiesDialog, setShowPropertiesDialog] = useState(false);
  const [propertiesNode, setPropertiesNode] = useState(null);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    refreshDirectory: loadDirectory,
    expandToPath: expandToPath
  }));

  // 展开到指定路径
  const expandToPath = async (targetPath) => {
    // 解析路径，获取所有父级目录
    const pathParts = targetPath.split('/').filter(Boolean)
    const newExpanded = new Set(expanded)
    
    // 逐级展开父目录
    let currentPath = ''
    for (let i = 0; i < pathParts.length - 1; i++) {
      currentPath += '/' + pathParts[i]
      newExpanded.add(currentPath)
      
      // 加载该目录（如果还没加载）
      const node = findNodeByPath(tree, currentPath)
      if (node && !node.children) {
        await loadDirectory(currentPath)
      }
    }
    
    setExpanded(newExpanded)
  }

  // 在树中查找节点
  const findNodeByPath = (nodes, targetPath) => {
    for (const node of nodes) {
      if (node.path === targetPath) {
        return node
      }
      if (node.children) {
        const found = findNodeByPath(node.children, targetPath)
        if (found) return found
      }
    }
    return null
  }

  // 加载根目录并恢复展开状态
  useEffect(() => {
    const initializeTree = async () => {
      // 先加载根目录
      await loadDirectory('/');
      
      // 如果有持久化的展开状态，逐级加载这些文件夹
      if (expanded.size > 0) {
        console.log('[FileTree] Restoring expanded folders:', Array.from(expanded));
        
        // 将路径按层级排序（浅到深）
        const sortedPaths = Array.from(expanded).sort((a, b) => {
          const depthA = a.split('/').filter(Boolean).length;
          const depthB = b.split('/').filter(Boolean).length;
          return depthA - depthB;
        });
        
        // 逐级加载每个展开的文件夹
        for (const path of sortedPaths) {
          try {
            await loadDirectory(path);
            console.log('[FileTree] Loaded expanded folder:', path);
          } catch (error) {
            console.error('[FileTree] Failed to load folder:', path, error);
          }
        }
      }
    };
    
    initializeTree();
  }, []); // 只在组件挂载时执行一次

  // 点击其他地方关闭右键菜单
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // 加载目录内容
  const loadDirectory = async (dirPath) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/files?path=${encodeURIComponent(dirPath)}`);
      const data = await response.json();
      
      if (!data.ok) {
        setError(data.message || '加载失败');
        return false;
      }
      
      if (dirPath === '/') {
        // 根目录
        setTree(data.items);
      } else {
        // 更新树结构
        setTree(prevTree => updateTreeNode(prevTree, dirPath, data.items));
      }
      
      return true;
    } catch (err) {
      setError('网络错误');
      console.error('Load directory error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 更新树节点
  const updateTreeNode = (nodes, targetPath, children) => {
    return nodes.map(node => {
      if (node.path === targetPath) {
        return { ...node, children };
      }
      if (node.children) {
        return { ...node, children: updateTreeNode(node.children, targetPath, children) };
      }
      return node;
    });
  };

  // 切换目录展开/折叠
  const toggleDirectory = async (node) => {
    const newExpanded = new Set(expanded);
    
    if (expanded.has(node.path)) {
      // 折叠：直接更新状态
      newExpanded.delete(node.path);
      setExpanded(newExpanded);
    } else {
      // 展开：如果需要加载数据，先加载再更新状态
      if (!node.children) {
        // 先加载数据
        await loadDirectory(node.path);
      }
      // 数据加载完成后再更新展开状态
      newExpanded.add(node.path);
      setExpanded(newExpanded);
    }
  };

  // 处理文件点击
  const handleFileClick = (node) => {
    if (node.type === 'file') {
      onFileSelect(node.path);
    } else {
      toggleDirectory(node);
    }
  };

  // 处理右键菜单
  const handleContextMenu = (e, node) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedNode(node);
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      node
    });
  };

  // 处理文件树头部右键菜单
  const handleHeaderContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 显示刷新菜单
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      node: null,
      type: 'header'
    });
  };

  // 处理空白区域右键菜单（显示根目录菜单）
  const handleEmptyAreaContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 如果有根目录，使用第一个根目录
    if (tree.length > 0 && tree[0].type === 'directory') {
      setSelectedNode(tree[0]);
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        node: tree[0]
      });
    }
  };

  // 右键菜单操作处理
  const handleMenuAction = async (action) => {
    setContextMenu(null);
    
    // 处理头部菜单操作
    if (contextMenu?.type === 'header') {
      if (action === 'refresh') {
        await loadDirectory('/');
      }
      return;
    }
    
    if (!selectedNode) return;
    
    switch (action) {
      case 'open':
        if (selectedNode.type === 'file') {
          onFileSelect(selectedNode.path);
        } else {
          toggleDirectory(selectedNode);
        }
        break;
        
      case 'rename':
        setRenameNode(selectedNode);
        setShowRenameDialog(true);
        break;
        
      case 'delete':
        await handleDelete(selectedNode);
        break;
        
      case 'copy':
        await handleCopy(selectedNode);
        break;
        
      case 'cut':
        await handleCut(selectedNode);
        break;
        
      case 'favorite':
        toggleFavorite(selectedNode.path, selectedNode.type);
        // 刷新收藏夹显示
        if (onReorderFavorites) {
          const { getFavorites } = await import('../utils/favoritesManager');
          onReorderFavorites(getFavorites());
        }
        break;
        
      case 'paste':
        if (selectedNode.type === 'directory') {
          await handlePaste(selectedNode);
        }
        break;
        
      case 'newfolder':
        if (selectedNode.type === 'directory') {
          setNewFolderParent(selectedNode);
          setShowNewFolderDialog(true);
        }
        break;
        
      case 'refresh':
        if (selectedNode.type === 'directory') {
          await loadDirectory(selectedNode.path);
        }
        break;
        
      case 'properties':
        handleShowProperties(selectedNode);
        break;
        
      default:
        break;
    }
    
    setSelectedNode(null);
  };

  // 重命名文件/文件夹
  const handleRename = async (newName) => {
    if (!renameNode) return;
    
    try {
      const oldPath = renameNode.path;
      const pathParts = oldPath.split('/');
      pathParts[pathParts.length - 1] = newName;
      const newPath = pathParts.join('/');
      
      const response = await fetch('/api/file/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPath, newPath })
      });
      
      const data = await response.json();
      
      if (data.ok) {
        // 更新收藏夹中的路径
        updateFavoritePath(oldPath, newPath);
        if (onReorderFavorites) {
          const { getFavorites } = await import('../utils/favoritesManager');
          onReorderFavorites(getFavorites());
        }
        
        // 刷新父目录
        const parentPath = pathParts.slice(0, -1).join('/') || '/';
        await loadDirectory(parentPath);
        
        // 如果重命名的是当前打开的文件，更新路径
        if (currentPath === oldPath) {
          onFileSelect(newPath);
        }
      } else {
        alert(`重命名失败: ${data.message || data.code}`);
      }
    } catch (error) {
      console.error('Rename error:', error);
      alert('重命名失败: 网络错误');
    }
    
    setShowRenameDialog(false);
    setRenameNode(null);
  };

  // 新建文件夹
  const handleNewFolder = async (folderName) => {
    if (!newFolderParent) return;
    
    try {
      const newPath = `${newFolderParent.path}/${folderName}`;
      
      const response = await fetch('/api/folder/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: newPath })
      });
      
      const data = await response.json();
      
      if (data.ok) {
        // 刷新父目录
        await loadDirectory(newFolderParent.path);
      } else {
        alert(`创建文件夹失败: ${data.message || data.code}`);
      }
    } catch (error) {
      console.error('Create folder error:', error);
      alert('创建文件夹失败: 网络错误');
    }
    
    setShowNewFolderDialog(false);
    setNewFolderParent(null);
  };

  // 删除文件/文件夹
  const handleDelete = async (node) => {
    const confirmMsg = node.type === 'directory' 
      ? `确定要删除文件夹 "${node.name}" 及其所有内容吗？`
      : `确定要删除文件 "${node.name}" 吗？`;
      
    if (!window.confirm(confirmMsg)) {
      return;
    }
    
    try {
      const response = await fetch('/api/file/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: node.path })
      });
      
      const data = await response.json();
      
      if (data.ok) {
        // 刷新父目录
        const pathParts = node.path.split('/');
        const parentPath = pathParts.slice(0, -1).join('/') || '/';
        await loadDirectory(parentPath);
        
        // 如果删除的是当前打开的文件，清空编辑器
        if (currentPath === node.path) {
          onFileSelect('');
        }
      } else {
        alert(`删除失败: ${data.message || data.code}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('删除失败: 网络错误');
    }
  };

  // 复制文件/文件夹
  const handleCopy = async (node) => {
    try {
      // 将路径存储到剪贴板（使用 localStorage 模拟）
      localStorage.setItem('clipboard', JSON.stringify({
        action: 'copy',
        path: node.path,
        type: node.type
      }));
      
      // 显示提示
      const msg = node.type === 'directory' ? '文件夹已复制' : '文件已复制';
      console.log(msg);
    } catch (error) {
      console.error('Copy error:', error);
    }
  };

  // 剪切文件/文件夹
  const handleCut = async (node) => {
    try {
      // 将路径存储到剪贴板（使用 localStorage 模拟）
      localStorage.setItem('clipboard', JSON.stringify({
        action: 'cut',
        path: node.path,
        type: node.type
      }));
      
      // 显示提示
      const msg = node.type === 'directory' ? '文件夹已剪切' : '文件已剪切';
      console.log(msg);
    } catch (error) {
      console.error('Cut error:', error);
    }
  };

  // 粘贴文件/文件夹
  const handlePaste = async (targetNode) => {
    try {
      const clipboardData = localStorage.getItem('clipboard');
      if (!clipboardData) {
        alert('剪贴板为空');
        return;
      }
      
      const clipData = JSON.parse(clipboardData);
      const { action, path: sourcePath, type } = clipData;
      
      if (!sourcePath) {
        alert('剪贴板数据无效');
        return;
      }
      
      // 构建目标路径
      const fileName = sourcePath.split('/').pop();
      const targetPath = `${targetNode.path}/${fileName}`;
      
      // 检查是否粘贴到自己
      if (sourcePath === targetPath) {
        alert('不能粘贴到相同位置');
        return;
      }
      
      // 检查是否粘贴到子目录（避免循环）
      if (type === 'directory' && targetPath.startsWith(sourcePath + '/')) {
        alert('不能将文件夹粘贴到其子目录中');
        return;
      }
      
      const apiEndpoint = action === 'cut' ? '/api/file/move' : '/api/file/copy';
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourcePath, targetPath })
      });
      
      const data = await response.json();
      
      if (data.ok) {
        // 如果是剪切，清空剪贴板
        if (action === 'cut') {
          localStorage.removeItem('clipboard');
        }
        
        // 刷新目标目录
        await loadDirectory(targetNode.path);
        
        // 如果是剪切，也刷新源目录
        if (action === 'cut') {
          const sourceParent = sourcePath.split('/').slice(0, -1).join('/') || '/';
          if (sourceParent !== targetNode.path) {
            await loadDirectory(sourceParent);
          }
        }
        
        const msg = action === 'cut' ? '移动成功' : '复制成功';
        alert(msg);
      } else {
        alert(`操作失败: ${data.message || data.code}`);
      }
    } catch (error) {
      console.error('Paste error:', error);
      alert('粘贴失败: 网络错误');
    }
  };

  // 显示属性
  const handleShowProperties = (node) => {
    setPropertiesNode(node);
    setShowPropertiesDialog(true);
  };

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // 过滤树节点（搜索）
  const filterTree = (nodes, query) => {
    return filterFileTree(nodes, query);
  };

  // 渲染高亮的文件名
  const renderHighlightedName = (name, query) => {
    const parts = highlightMatches(name, query);
    return (
      <>
        {parts.map((part, index) => (
          part.highlight ? (
            <mark key={index} className="tree-node-highlight">{part.text}</mark>
          ) : (
            <span key={index}>{part.text}</span>
          )
        ))}
      </>
    );
  };

  // 根据文件类型获取图标
  const getFileIcon = (path) => {
    if (path.endsWith('.md')) return <FileText size={16} />
    if (path.endsWith('.txt')) return <File size={16} />
    if (path.endsWith('.json')) return <FileJson size={16} />
    return <File size={16} />
  };

  // 渲染树节点
  const renderNode = (node, level = 0) => {
    const isExpanded = expanded.has(node.path);
    const isActive = currentPath === node.path;
    const hasChildren = node.type === 'directory';
    const children = node.children || [];
    const isFav = isFavorite(node.path);

    return (
      <div key={node.path} className="tree-node">
        <div
          className={`tree-node-content ${isActive ? 'active' : ''}`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => handleFileClick(node)}
          onContextMenu={(e) => handleContextMenu(e, node)}
        >
          {hasChildren && (
            <>
              <span className={`tree-node-icon ${isExpanded ? 'expanded' : ''}`}>
                <ChevronRight size={16} />
              </span>
              <span className="tree-node-icon">
                <Folder size={16} />
              </span>
            </>
          )}
          {!hasChildren && (
            <span className="tree-node-icon">
              {getFileIcon(node.path)}
            </span>
          )}
          <span className="tree-node-name" title={node.path}>
            {debouncedQuery ? renderHighlightedName(node.name, debouncedQuery) : node.name}
          </span>
          {isFav && (
            <span className="tree-node-favorite" title="已收藏">
              <Star size={14} fill="currentColor" />
            </span>
          )}
        </div>
        
        {hasChildren && isExpanded && children.length > 0 && (
          <div className="tree-node-children">
            {children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredTree = filterTree([...tree], debouncedQuery);

  return (
    <div className="file-tree" style={style}>
      {/* 标签页导航 */}
      <div className="file-tree-tabs">
        <button 
          className={`file-tree-tab ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          文件
        </button>
        <button 
          className={`file-tree-tab ${activeTab === 'outline' ? 'active' : ''}`}
          onClick={() => setActiveTab('outline')}
        >
          大纲
        </button>
        <button 
          className={`file-tree-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          历史
        </button>
      </div>

      {/* 文件夹标签页内容 */}
      {activeTab === 'files' && (
        <>
          <div className="file-tree-header" onContextMenu={handleHeaderContextMenu}>
            <FileSearchBox
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={setSearchQuery}
            />
          </div>
          
          <FavoritesPanel
            favorites={favorites || []}
            onOpenFavorite={onOpenFavorite}
            onRemoveFavorite={onRemoveFavorite}
            onClearFavorites={onClearFavorites}
            onReorderFavorites={onReorderFavorites}
            currentPath={currentPath}
          />
          
          <div className="file-tree-content" onContextMenu={handleEmptyAreaContextMenu}>
            {loading && tree.length === 0 && (
              <div className="file-tree-loading">加载中...</div>
            )}
            
            {error && (
              <div className="file-tree-error">{error}</div>
            )}
            
            {!loading && !error && filteredTree.length === 0 && (
              <div className="file-tree-empty">
                {searchQuery ? '未找到匹配的文件' : '暂无文件'}
              </div>
            )}
            
            <AnimatedList delay={30}>
              {filteredTree.map(node => renderNode(node))}
            </AnimatedList>
          </div>
        </>
      )}

      {/* 大纲标签页内容 */}
      {activeTab === 'outline' && (
        <OutlinePanel 
          content={content || ''}
          onHeadingClick={onHeadingClick}
        />
      )}

      {/* 历史标签页内容 */}
      {activeTab === 'history' && (
        <HistoryPanel 
          currentPath={currentPath}
          theme={document.documentElement.classList.contains('theme-dark') ? 'dark' : 'light'}
          onVersionRestore={onVersionRestore}
        />
      )}
      
      {/* 右键菜单 */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          node={contextMenu.node}
          type={contextMenu.type}
          onAction={handleMenuAction}
          onClose={() => setContextMenu(null)}
        />
      )}
      
      {/* 重命名对话框 */}
      {showRenameDialog && renameNode && (
        <RenameDialog
          node={renameNode}
          onConfirm={handleRename}
          onCancel={() => {
            setShowRenameDialog(false);
            setRenameNode(null);
          }}
        />
      )}
      
      {/* 新建文件夹对话框 */}
      {showNewFolderDialog && newFolderParent && (
        <NewFolderDialog
          parentPath={newFolderParent.path}
          onConfirm={handleNewFolder}
          onCancel={() => {
            setShowNewFolderDialog(false);
            setNewFolderParent(null);
          }}
        />
      )}

      {/* 文件属性对话框 */}
      {showPropertiesDialog && propertiesNode && (
        <FilePropertiesDialog
          node={propertiesNode}
          onClose={() => {
            setShowPropertiesDialog(false);
            setPropertiesNode(null);
          }}
        />
      )}
    </div>
  );
});

FileTree.displayName = 'FileTree';

export default FileTree;
