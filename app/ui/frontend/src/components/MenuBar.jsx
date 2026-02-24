import React, { useState, useRef, useEffect } from 'react'
import './MenuBar.css'

/**
 * 菜单栏组件 - 一二级菜单结构
 */
function MenuBar({ 
  onNewFile, 
  onSave, 
  onSaveAs, 
  onExport,
  onUndo,
  onRedo,
  onCopy,
  onPaste,
  onFormatDocument,
  onFind,
  onReplace,
  onInsertHeading,
  onInsertBold,
  onInsertItalic,
  onInsertLink,
  onInsertImage,
  onInsertCode,
  onInsertTable,
  onToggleFileTree,
  onToggleTheme,
  onSettings,
  disabled,
  theme
}) {
  const [activeMenu, setActiveMenu] = useState(null)
  const menuRef = useRef(null)

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMenuClick = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName)
  }

  const handleMenuItemClick = (action) => {
    action()
    setActiveMenu(null)
  }

  const menuConfig = [
    {
      name: '文件',
      items: [
        { label: '新建', shortcut: 'Ctrl+N', action: onNewFile },
        { label: '保存', shortcut: 'Ctrl+S', action: onSave, disabled },
        { label: '另存为', shortcut: 'Ctrl+Shift+S', action: onSaveAs },
        { divider: true },
        { 
          label: '导出', 
          submenu: [
            { label: '公众号格式', action: () => onExport('wechat') },
            { label: 'HTML 格式', action: () => onExport('html') },
            { label: 'HTML 格式（无样式）', action: () => onExport('html-plain') },
            { label: 'HTML 格式（兼容样式）', action: () => onExport('html-compat') },
            { label: 'MD 格式', action: () => onExport('md') },
            { label: '复制选中内容', shortcut: 'Ctrl+C', action: () => onExport('copy') }
          ]
        }
      ]
    },
    {
      name: '编辑',
      items: [
        { label: '撤销', shortcut: 'Ctrl+Z', action: onUndo },
        { label: '重做', shortcut: 'Ctrl+Y', action: onRedo },
        { divider: true },
        { 
          label: '复制', 
          submenu: [
            { label: '复制', shortcut: 'Ctrl+C', action: onCopy },
            { label: '剪切', shortcut: 'Ctrl+X', action: () => {} },
            { label: '粘贴', shortcut: 'Ctrl+V', action: onPaste }
          ]
        },
        { label: '粘贴', shortcut: 'Ctrl+V', action: onPaste },
        { divider: true },
        { label: '格式化文档', shortcut: 'Shift+Alt+F', action: onFormatDocument },
        { divider: true },
        { label: '查找', shortcut: 'Ctrl+F', action: onFind },
        { label: '替换', shortcut: 'Ctrl+H', action: onReplace }
      ]
    },
    {
      name: '格式',
      items: [
        { 
          label: '标题', 
          submenu: [
            { label: '一级标题', shortcut: 'Ctrl+1', action: () => onInsertHeading(1) },
            { label: '二级标题', shortcut: 'Ctrl+2', action: () => onInsertHeading(2) },
            { label: '三级标题', shortcut: 'Ctrl+3', action: () => onInsertHeading(3) },
            { label: '四级标题', shortcut: 'Ctrl+4', action: () => onInsertHeading(4) },
            { label: '五级标题', shortcut: 'Ctrl+5', action: () => onInsertHeading(5) },
            { label: '六级标题', shortcut: 'Ctrl+6', action: () => onInsertHeading(6) }
          ]
        },
        { divider: true },
        { label: '加粗', shortcut: 'Ctrl+B', action: onInsertBold },
        { label: '斜体', shortcut: 'Ctrl+I', action: onInsertItalic },
        { label: '删除线', action: () => onInsertCode('strikethrough') },
        { divider: true },
        { label: '无序列表', action: () => onInsertCode('ul') },
        { label: '有序列表', action: () => onInsertCode('ol') },
        { label: '任务列表', action: () => onInsertCode('task') },
        { divider: true },
        { label: '引用', action: () => onInsertCode('quote') },
        { label: '代码块', action: () => onInsertCode('codeblock') },
        { label: '行内代码', action: () => onInsertCode('inline') }
      ]
    },
    {
      name: '插入',
      items: [
        { label: '链接', shortcut: 'Ctrl+K', action: onInsertLink },
        { label: '图片', action: onInsertImage },
        { label: '表格', action: onInsertTable },
        { label: '分隔线', action: () => onInsertCode('hr') },
        { divider: true },
        { label: '代码块', action: () => onInsertCode('codeblock') },
        { label: '数学公式', action: () => onInsertCode('math') },
        { label: 'Mermaid 图表', action: () => onInsertCode('mermaid') }
      ]
    },
    {
      name: '样式',
      items: [
        { label: '水平布局', action: () => {} },
        { label: '垂直布局', action: () => {} },
        { label: '仅编辑器', action: () => {} },
        { label: '仅预览', action: () => {} },
        { divider: true },
        { label: '切换主题', shortcut: 'Ctrl+T', action: onToggleTheme }
      ]
    },
    {
      name: '视图',
      items: [
        { label: '切换文件树', shortcut: 'Ctrl+B', action: onToggleFileTree },
        { label: '切换工具栏', action: () => {} },
        { divider: true },
        { label: '放大', shortcut: 'Ctrl++', action: () => {} },
        { label: '缩小', shortcut: 'Ctrl+-', action: () => {} },
        { label: '重置缩放', shortcut: 'Ctrl+0', action: () => {} }
      ]
    },
    {
      name: '帮助',
      items: [
        { label: 'Markdown 语法', action: () => {} },
        { label: '快捷键列表', action: () => {} },
        { divider: true },
        { label: '关于', action: () => {} }
      ]
    }
  ]

  return (
    <div className="menubar" ref={menuRef}>
      {menuConfig.map((menu) => (
        <div key={menu.name} className="menu-item">
          <button
            className={`menu-button ${activeMenu === menu.name ? 'active' : ''}`}
            onClick={() => handleMenuClick(menu.name)}
          >
            {menu.name}
          </button>
          
          {activeMenu === menu.name && (
            <div className="menu-dropdown">
              {menu.items.map((item, index) => {
                if (item.divider) {
                  return <div key={`divider-${index}`} className="menu-divider" />
                }
                
                if (item.submenu) {
                  return (
                    <div key={item.label} className="menu-dropdown-item has-submenu">
                      <span className="menu-label">{item.label}</span>
                      <span className="menu-arrow">▶</span>
                      <div className="menu-submenu">
                        {item.submenu.map((subItem) => (
                          <button
                            key={subItem.label}
                            className="menu-dropdown-item"
                            onClick={() => handleMenuItemClick(subItem.action)}
                            disabled={subItem.disabled}
                          >
                            <span className="menu-label">{subItem.label}</span>
                            {subItem.shortcut && (
                              <span className="menu-shortcut">{subItem.shortcut}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                }
                
                return (
                  <button
                    key={item.label}
                    className="menu-dropdown-item"
                    onClick={() => handleMenuItemClick(item.action)}
                    disabled={item.disabled}
                  >
                    <span className="menu-label">{item.label}</span>
                    {item.shortcut && (
                      <span className="menu-shortcut">{item.shortcut}</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default MenuBar

