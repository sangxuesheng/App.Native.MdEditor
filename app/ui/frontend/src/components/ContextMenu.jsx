import React, { useEffect, useRef } from 'react'
import { isFavorite } from '../utils/favoritesManager'
import './ContextMenu.css'

/**
 * 右键上下文菜单组件
 */
function ContextMenu({ 
  x, 
  y, 
  node,
  onAction,
  onClose
}) {
  const menuRef = useRef(null)

  // 根据节点类型生成菜单项
  const getMenuItems = () => {
    if (!node) return []
    
    const isFile = node.type === 'file'
    const isDirectory = node.type === 'directory'
    const isFav = isFavorite(node.path)
    
    const items = []
    
    // 打开
    items.push({
      label: isFile ? '打开文件' : '展开文件夹',
      icon: isFile ? '📄' : '📁',
      action: () => onAction('open')
    })
    
    items.push({ divider: true })
    
    // 重命名
    items.push({
      label: '重命名',
      icon: '✏️',
      action: () => onAction('rename')
    })
    
    // 删除
    items.push({
      label: '删除',
      icon: '🗑️',
      action: () => onAction('delete')
    })
    
    items.push({ divider: true })
    
    // 复制
    items.push({
      label: '复制',
      icon: '📋',
      action: () => onAction('copy')
    })
    
    // 剪切
    items.push({
      label: '剪切',
      icon: '✂️',
      action: () => onAction('cut')
    })
    
    items.push({ divider: true })
    
    // 收藏
    items.push({
      label: isFav ? '取消收藏' : '添加到收藏夹',
      icon: isFav ? '☆' : '★',
      action: () => onAction('favorite')
    })
    
    // 新建文件夹（仅目录）
    if (isDirectory) {
      items.push({
        label: '新建文件夹',
        icon: '📁',
        action: () => onAction('newfolder')
      })
    }
    
    // 刷新（仅目录）
    if (isDirectory) {
      items.push({
        label: '刷新',
        icon: '🔄',
        action: () => onAction('refresh')
      })
    }
    
    items.push({ divider: true })
    
    // 属性
    items.push({
      label: '属性',
      icon: 'ℹ️',
      action: () => onAction('properties')
    })
    
    return items
  }

  const items = getMenuItems()

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose()
      }
    }

    const handleScroll = () => {
      onClose()
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('scroll', handleScroll, true)
    
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('scroll', handleScroll, true)
    }
  }, [onClose])

  // 调整菜单位置，避免超出屏幕
  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let adjustedX = x
      let adjustedY = y

      if (rect.right > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 10
      }

      if (rect.bottom > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 10
      }

      menuRef.current.style.left = `${adjustedX}px`
      menuRef.current.style.top = `${adjustedY}px`
    }
  }, [x, y])

  return (
    <div 
      ref={menuRef}
      className="context-menu"
      style={{ left: x, top: y }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, index) => (
        item.divider ? (
          <div key={`divider-${index}`} className="context-menu-divider" />
        ) : (
          <div
            key={index}
            className={`context-menu-item ${item.disabled ? 'disabled' : ''}`}
            onClick={() => {
              if (!item.disabled) {
                item.action()
                onClose()
              }
            }}
          >
            {item.icon && <span className="menu-icon">{item.icon}</span>}
            <span className="menu-label">{item.label}</span>
            {item.shortcut && <span className="menu-shortcut">{item.shortcut}</span>}
          </div>
        )
      ))}
    </div>
  )
}

export default ContextMenu
