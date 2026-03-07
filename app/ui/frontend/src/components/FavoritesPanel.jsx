import React, { useState } from 'react'
import { Star, Folder, FileText, File, FileJson, ChevronDown, ChevronRight, GripVertical, Trash2, FolderOpen } from 'lucide-react'
import './FavoritesPanel.css'

/**
 * 收藏夹面板组件
 */
function FavoritesPanel({ 
  favorites, 
  onOpenFavorite, 
  onRemoveFavorite,
  onClearFavorites,
  onReorderFavorites,
  currentPath 
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)

  const handleToggle = () => {
    setIsExpanded(!isExpanded)
  }

  const handleItemClick = (path) => {
    onOpenFavorite(path)
  }

  const handleRemoveClick = (e, path) => {
    e.stopPropagation()
    onRemoveFavorite(path)
  }

  // 处理右键菜单
  const handleContextMenu = (e, item) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item: item,
      type: item ? 'item' : 'header'
    })
  }

  // 处理头部右键菜单
  const handleHeaderContextMenu = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item: null,
      type: 'header'
    })
  }

  // 关闭右键菜单
  const closeContextMenu = () => {
    setContextMenu(null)
  }

  // 处理右键菜单操作
  const handleContextMenuAction = (action) => {
    if (!contextMenu) return

    // 处理头部菜单操作
    if (contextMenu.type === 'header') {
      if (action === 'clear') {
        onClearFavorites()
      }
      closeContextMenu()
      return
    }

    // 处理收藏项菜单操作
    switch (action) {
      case 'open':
        onOpenFavorite(contextMenu.item.path)
        break
      case 'remove':
        onRemoveFavorite(contextMenu.item.path)
        break
      default:
        break
    }
    closeContextMenu()
  }

  // 拖拽开始
  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index.toString())
    // 添加拖拽样式
    e.currentTarget.style.opacity = '0.5'
  }

  // 拖拽结束
  const handleDragEnd = (e) => {
    setDraggedIndex(null)
    e.currentTarget.style.opacity = '1'
  }

  // 拖拽经过
  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  // 放置
  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      return
    }

    // 重新排序
    const newFavorites = [...favorites]
    const [draggedItem] = newFavorites.splice(draggedIndex, 1)
    newFavorites.splice(dropIndex, 0, draggedItem)

    // 更新顺序
    if (onReorderFavorites) {
      onReorderFavorites(newFavorites)
    }

    setDraggedIndex(null)
  }

  const getFavoriteIcon = (type, path) => {
    if (type === 'directory') return <Folder size={16} />
    if (path.endsWith('.md')) return <FileText size={16} />
    if (path.endsWith('.txt')) return <File size={16} />
    if (path.endsWith('.json')) return <FileJson size={16} />
    return <File size={16} />
  }

  return (
    <div className="favorites-panel">
      <div className="favorites-header" onClick={handleToggle} onContextMenu={handleHeaderContextMenu}>
        <span className="favorites-toggle">{isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</span>
        <span className="favorites-title"><Star size={16} fill="currentColor" /> 收藏夹</span>
        <span className="favorites-count">({favorites.length})</span>
      </div>

      {isExpanded && (
        <div className="favorites-content" onContextMenu={handleHeaderContextMenu}>
          {favorites.length === 0 ? (
            <div className="favorites-empty">
              <span className="empty-icon"><Star size={48} /></span>
              <span className="empty-text">暂无收藏</span>
              <span className="empty-hint">右键文件可添加收藏</span>
            </div>
          ) : (
            <>
              <div className="favorites-list">
                {favorites.map((item, index) => (
                  <div
                    key={item.path}
                    className={`favorite-item ${currentPath === item.path ? 'active' : ''} ${draggedIndex === index ? 'dragging' : ''}`}
                    onClick={() => handleItemClick(item.path)}
                    onContextMenu={(e) => handleContextMenu(e, item)}
                    title={item.path}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    <span className="favorite-drag-handle" title="拖拽排序"><GripVertical size={16} /></span>
                    <span className="favorite-icon">
                      {getFavoriteIcon(item.type, item.path)}
                    </span>
                    <span className="favorite-name">{item.name}</span>
                    <button
                      className="favorite-remove"
                      onClick={(e) => handleRemoveClick(e, item.path)}
                      title="取消收藏"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              
              {favorites.length > 0 && (
                <div className="favorites-actions">
                  <button
                    className="favorites-clear-btn"
                    onClick={onClearFavorites}
                    title="清空收藏夹"
                  >
                    清空收藏夹
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 自定义右键菜单 */}
      {contextMenu && (
        <div 
          className="favorites-context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.type === 'header' ? (
            // 头部菜单
            <>
              <div 
                className="context-menu-item danger"
                onClick={() => handleContextMenuAction('clear')}
              >
                <Trash2 size={16} />
                <span>清空收藏夹</span>
              </div>
            </>
          ) : (
            // 收藏项菜单
            <>
              <div 
                className="context-menu-item"
                onClick={() => handleContextMenuAction('open')}
              >
                <FolderOpen size={16} />
                <span>打开</span>
              </div>
              <div className="context-menu-divider" />
              <div 
                className="context-menu-item danger"
                onClick={() => handleContextMenuAction('remove')}
              >
                <Trash2 size={16} />
                <span>取消收藏</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* 点击其他地方关闭菜单 */}
      {contextMenu && (
        <div 
          className="context-menu-overlay"
          onClick={closeContextMenu}
          onContextMenu={(e) => {
            e.preventDefault()
            closeContextMenu()
          }}
        />
      )}
    </div>
  )
}

export default FavoritesPanel
