import React, { useState, useEffect } from 'react';
import FavoritesPanel from './FavoritesPanel';
import FileSearchBox from './FileSearchBox';
import { filterFileTree, highlightMatches } from '../utils/fileSearcher';
import { useDebounce } from '../hooks/useDebounce';
import './FileTree.css';

const FileTree = ({ 
  onFileSelect, 
  currentPath,
  favorites,
  onOpenFavorite,
  onRemoveFavorite,
  onClearFavorites,
  onReorderFavorites
}) => {
  const [tree, setTree] = useState([]);
  const [expanded, setExpanded] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);

  // 加载根目录
  useEffect(() => {
    loadDirectory('/');
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
        return;
      }
      
      if (dirPath === '/') {
        // 根目录
        setTree(data.items);
      } else {
        // 更新树结构
        setTree(prevTree => updateTreeNode(prevTree, dirPath, data.items));
      }
    } catch (err) {
      setError('网络错误');
      console.error('Load directory error:', err);
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
      // 折叠
      newExpanded.delete(node.path);
    } else {
      // 展开
      newExpanded.add(node.path);
      // 如果还没有加载子节点，则加载
      if (!node.children) {
        await loadDirectory(node.path);
      }
    }
    
    setExpanded(newExpanded);
  };

  // 处理文件点击
  const handleFileClick = (node) => {
    if (node.type === 'file') {
      onFileSelect(node.path);
    } else {
      toggleDirectory(node);
    }
  };

  // 过滤树节点（搜索）- 使用增强的搜索算法
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

  // 渲染树节点
  const renderNode = (node, level = 0) => {
    const isExpanded = expanded.has(node.path);
    const isActive = currentPath === node.path;
    const hasChildren = node.type === 'directory';
    const children = node.children || [];

    return (
      <div key={node.path} className="tree-node">
        <div
          className={`tree-node-content ${isActive ? 'active' : ''}`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={() => handleFileClick(node)}
        >
          {hasChildren && (
            <span className={`tree-node-icon ${isExpanded ? 'expanded' : ''}`}>
              ▶
            </span>
          )}
          {!hasChildren && <span className="tree-node-icon">📄</span>}
          <span className="tree-node-name" title={node.path}>
            {debouncedQuery ? renderHighlightedName(node.name, debouncedQuery) : node.name}
          </span>
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
    <div className="file-tree">
      <div className="file-tree-header">
        <h3>文件</h3>
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
      
      <div className="file-tree-content">
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
        
        {filteredTree.map(node => renderNode(node))}
      </div>
    </div>
  );
};

export default FileTree;

