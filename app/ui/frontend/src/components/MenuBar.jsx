import React, { useState, useRef, useEffect } from 'react'
import './MenuBar.css'
import {
  FilePlus,
  Save,
  Download,
  History,
  FileText,
  Sparkles,
  Undo,
  Redo,
  Copy,
  Scissors,
  Clipboard,
  Search,
  Replace,
  WrapText,
  Heading,
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Code,
  Link,
  Image,
  Table,
  Minus,
  Calculator,
  Network,
  FolderTree,
  Wrench,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  HelpCircle,
  Keyboard,
  Info,
  X
} from 'lucide-react'

/**
 * 菜单栏组件 - 一二级菜单结构
 */

// 菜单项图标组件
const MenuItemIcon = ({ type }) => {
  const iconStyle = { width: '14px', height: '14px', marginRight: '8px', flexShrink: 0, strokeWidth: 2.5 };
  
  const icons = {
    // 文件菜单
    'new': <FilePlus style={iconStyle} />,
    'save': <Save style={iconStyle} />,
    'export': <Download style={iconStyle} />,
    'history': <History style={iconStyle} />,
    'recent': <FileText style={iconStyle} />,
    'autosave': <Sparkles style={iconStyle} />,
    
    // 编辑菜单
    'undo': <Undo style={iconStyle} />,
    'redo': <Redo style={iconStyle} />,
    'copy': <Copy style={iconStyle} />,
    'cut': <Scissors style={iconStyle} />,
    'paste': <Clipboard style={iconStyle} />,
    'find': <Search style={iconStyle} />,
    'replace': <Replace style={iconStyle} />,
    'format': <WrapText style={iconStyle} />,
    
    // 格式菜单
    'heading': <Heading style={iconStyle} />,
    'bold': <Bold style={iconStyle} />,
    'italic': <Italic style={iconStyle} />,
    'strikethrough': <Strikethrough style={iconStyle} />,
    'list-ul': <List style={iconStyle} />,
    'list-ol': <ListOrdered style={iconStyle} />,
    'list-task': <ListTodo style={iconStyle} />,
    'quote': <Quote style={iconStyle} />,
    'code': <Code style={iconStyle} />,
    
    // 插入菜单
    'link': <Link style={iconStyle} />,
    'image': <Image style={iconStyle} />,
    'table': <Table style={iconStyle} />,
    'hr': <Minus style={iconStyle} />,
    'math': <Calculator style={iconStyle} />,
    'ListTree': <Network style={iconStyle} />,
    
    // 视图菜单
    'tree': <FolderTree style={iconStyle} />,
    'toolbar': <Wrench style={iconStyle} />,
    'zoom-in': <ZoomIn style={iconStyle} />,
    'zoom-out': <ZoomOut style={iconStyle} />,
    'zoom-reset': <RotateCcw style={iconStyle} />,
    
    // 帮助菜单
    'help': <HelpCircle style={iconStyle} />,
    'keyboard': <Keyboard style={iconStyle} />,
    'about': <Info style={iconStyle} />,
    'clear': <X style={iconStyle} />,
  };
  
  return icons[type] || null;
};


function MenuBar({ 
  onNewFile, 
  onSave, 
  onSaveAs, 
  onExport,
  recentFiles,
  onOpenRecentFile,
  onClearRecentFiles,
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
  onToggleToolbar,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onLayoutChange,
  onShowMarkdownHelp,
  onShowShortcuts,
  onShowAbout,
  onShowHistory,
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

  const formatTime = (timestamp) => {
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}天前`
    if (hours > 0) return `${hours}小时前`
    if (minutes > 0) return `${minutes}分钟前`
    return '刚刚'
  }

  const menuConfig = [
    {
      name: '文件',
      items: [
        { label: '新建', icon: 'new', shortcut: 'Ctrl+N', action: onNewFile },
        { label: '保存', icon: 'save', shortcut: 'Ctrl+S', action: onSave, disabled },
        { label: '另存为', icon: 'save', shortcut: 'Ctrl+Shift+S', action: onSaveAs },
        { divider: true },
        { label: '最近文件', icon: 'recent', type: 'recent-files' },
        { label: '文件历史', icon: 'history', action: onShowHistory },
        { divider: true },
        { 
          icon: 'export', label: '导出', 
          submenu: [
            { label: '公众号格式', icon: 'export', action: () => onExport('wechat') },
            { label: 'HTML 格式', icon: 'export', action: () => onExport('html') },
            { label: 'HTML 格式（无样式）', icon: 'export', action: () => onExport('html-plain') },
            { label: 'HTML 格式（兼容样式）', icon: 'export', action: () => onExport('html-compat') },
            { label: 'MD 格式', icon: 'export', action: () => onExport('md') },
            { label: '复制选中内容', icon: 'copy', shortcut: 'Ctrl+C', action: () => onExport('copy') }
          ]
        }
      ]
    },
    {
      name: '编辑',
      items: [
        { label: '撤销', icon: 'undo', shortcut: 'Ctrl+Z', action: onUndo },
        { label: '重做', icon: 'redo', shortcut: 'Ctrl+Y', action: onRedo },
        { divider: true },
        { 
          icon: 'copy', label: '复制', 
          submenu: [
            { icon: 'copy', label: '复制', shortcut: 'Ctrl+C', action: onCopy },
            { label: '剪切', icon: 'cut', shortcut: 'Ctrl+X', action: () => {} },
            { label: '粘贴', icon: 'paste', shortcut: 'Ctrl+V', action: onPaste }
          ]
        },
        { label: '粘贴', icon: 'paste', shortcut: 'Ctrl+V', action: onPaste },
        { divider: true },
        { label: '格式化文档', icon: 'format', shortcut: 'Shift+Alt+F', action: onFormatDocument },
        { divider: true },
        { label: '查找', icon: 'find', shortcut: 'Ctrl+F', action: onFind },
        { label: '替换', icon: 'replace', shortcut: 'Ctrl+H', action: onReplace }
      ]
    },
    {
      name: '格式',
      items: [
        { 
          icon: 'heading', label: '标题', 
          submenu: [
            { label: '一级标题', icon: 'heading', shortcut: 'Ctrl+1', action: () => onInsertHeading(1) },
            { label: '二级标题', icon: 'heading', shortcut: 'Ctrl+2', action: () => onInsertHeading(2) },
            { label: '三级标题', icon: 'heading', shortcut: 'Ctrl+3', action: () => onInsertHeading(3) },
            { label: '四级标题', icon: 'heading', shortcut: 'Ctrl+4', action: () => onInsertHeading(4) },
            { label: '五级标题', icon: 'heading', shortcut: 'Ctrl+5', action: () => onInsertHeading(5) },
            { label: '六级标题', icon: 'heading', shortcut: 'Ctrl+6', action: () => onInsertHeading(6) }
          ]
        },
        { divider: true },
        { label: '加粗', icon: 'bold', shortcut: 'Ctrl+B', action: onInsertBold },
        { label: '斜体', icon: 'italic', shortcut: 'Ctrl+I', action: onInsertItalic },
        { label: '删除线', icon: 'strikethrough', action: () => onInsertCode('strikethrough') },
        { divider: true },
        { label: '无序列表', icon: 'list-ul', action: () => onInsertCode('ul') },
        { label: '有序列表', icon: 'list-ol', action: () => onInsertCode('ol') },
        { label: '任务列表', icon: 'list-task', action: () => onInsertCode('task') },
        { divider: true },
        { label: '引用', icon: 'quote', action: () => onInsertCode('quote') },
        { label: '代码块', icon: 'code', action: () => onInsertCode('codeblock') },
        { label: '行内代码', icon: 'code', action: () => onInsertCode('inline') }
      ]
    },
    {
      name: '插入',
      items: [
        { label: '链接', icon: 'link', shortcut: 'Ctrl+K', action: onInsertLink },
        { label: '图片', icon: 'image', action: onInsertImage },
        { label: '表格', icon: 'table', action: onInsertTable },
        { label: '分隔线', icon: 'hr', action: () => onInsertCode('hr') },
        { divider: true },
        { label: '代码块', icon: 'code', action: () => onInsertCode('codeblock') },
        { label: '数学公式', icon: 'math', action: () => onInsertCode('math') },
        { label: 'Mermaid 图表', icon: 'ListTree', action: () => onInsertCode('ListTree') }
      ]
    },
    {
      name: '样式',
      items: [
      ]
    },
    {
      name: '视图',
      items: [
        { label: '切换工具栏', icon: 'toolbar', action: onToggleToolbar },
        { divider: true },
        { label: '放大', icon: 'zoom-in', shortcut: 'Ctrl++', action: onZoomIn },
        { label: '缩小', icon: 'zoom-out', shortcut: 'Ctrl+-', action: onZoomOut },
        { label: '重置缩放', icon: 'zoom-reset', shortcut: 'Ctrl+0', action: onZoomReset }
      ]
    },
    {
      name: '帮助',
      items: [
        { label: 'Markdown 语法', icon: 'help', action: onShowMarkdownHelp },
        { label: '快捷键列表', icon: 'keyboard', action: onShowShortcuts },
        { divider: true },
        { label: '关于', icon: 'about', action: onShowAbout }
      ]
    }
  ]

  return (
    <div ref={menuRef} style={{ display: 'contents' }}>
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
                
                // 最近文件特殊处理
                if (item.type === 'recent-files') {
                  return (
                    <div key="recent-files" className="menu-dropdown-item has-submenu">
                      <>{item.icon && <MenuItemIcon type={item.icon} />}<span className="menu-label">{item.label}</span></>
                      <span className="menu-arrow">▶</span>
                      <div className="menu-submenu recent-files-submenu">
                        {recentFiles && recentFiles.length > 0 ? (
                          <>
                            {recentFiles.map((file, idx) => (
                              <button
                                key={file.path}
                                className="menu-dropdown-item recent-file-item"
                                onClick={() => handleMenuItemClick(() => onOpenRecentFile(file.path))}
                                title={file.path}
                              >
                                <span className="menu-label">{file.name}</span>
                                <span className="menu-shortcut recent-time">{formatTime(file.timestamp)}</span>
                              </button>
                            ))}
                            <div className="menu-divider" />
                            <button
                              className="menu-dropdown-item"
                              onClick={() => handleMenuItemClick(onClearRecentFiles)}
                            >
                              <span className="menu-label">清空列表</span>
                            </button>
                          </>
                        ) : (
                          <div className="menu-dropdown-item disabled">
                            <span className="menu-label">无最近文件</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                }
                
                if (item.submenu) {
                  return (
                    <div key={item.label} className="menu-dropdown-item has-submenu">
                      <>{item.icon && <MenuItemIcon type={item.icon} />}<span className="menu-label">{item.label}</span></>
                      <span className="menu-arrow">▶</span>
                      <div className="menu-submenu">
                        {item.submenu.map((subItem) => (
                          <button
                            key={subItem.label}
                            className="menu-dropdown-item"
                            onClick={() => handleMenuItemClick(subItem.action)}
                            disabled={subItem.disabled}
                          >
                            <>{subItem.icon && <MenuItemIcon type={subItem.icon} />}<span className="menu-label">{subItem.label}</span></>
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
                    <>{item.icon && <MenuItemIcon type={item.icon} />}<span className="menu-label">{item.label}</span></>
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
