import React, { useState, useRef, useEffect } from 'react'
import { 
  Heading1, 
  Heading2, 
  Heading3, 
  Bold, 
  Italic, 
  Strikethrough,
  List,
  ListOrdered,
  CheckSquare,
  Link2,
  Image,
  Upload,
  Code2,
  FileCode,
  Quote,
  Table,
  Minus,
  BarChart3,
  ChevronDown,
  ImageIcon
} from 'lucide-react'
import './EditorToolbar.css'

function EditorToolbar({ onInsert, onImageUpload, onOpenImageManager, onOpenTableInsert, disabled }) {
  const [showChartMenu, setShowChartMenu] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const chartMenuRef = useRef(null)
  const chartButtonRef = useRef(null)
  const fileInputRef = useRef(null)
  
  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }
  
  const handleFileChange = async (e) => {
    const files = e.target.files
    if (files && files.length > 0 && onImageUpload) {
      for (let i = 0; i < files.length; i++) {
        await onImageUpload(files[i])
      }
      // 清空 input，允许重复选择同一文件
      e.target.value = ''
    }
  }
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chartMenuRef.current && !chartMenuRef.current.contains(event.target) &&
          !chartButtonRef.current?.contains(event.target)) {
        setShowChartMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  useEffect(() => {
    if (showChartMenu && chartButtonRef.current) {
      const rect = chartButtonRef.current.getBoundingClientRect()
      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.left
      })
    }
  }, [showChartMenu])
  
  const insertHeading = (level) => {
    const prefix = '#'.repeat(level) + ' '
    onInsert(prefix, '', 'heading')
  }

  const insertBold = () => onInsert('**', '**', 'wrap')
  const insertItalic = () => onInsert('*', '*', 'wrap')
  const insertStrikethrough = () => onInsert('~~', '~~', 'wrap')
  const insertUnorderedList = () => onInsert('- ', '', 'line')
  const insertOrderedList = () => onInsert('1. ', '', 'line')
  const insertTaskList = () => onInsert('- [ ] ', '', 'line')
  const insertLink = () => onInsert('[', '](https://)', 'wrap')
  const insertImage = () => onInsert('![', '](https://)', 'wrap')
  const insertCodeBlock = () => onInsert('```\n', '\n```', 'wrap')
  const insertInlineCode = () => onInsert('`', '`', 'wrap')
  const insertQuote = () => onInsert('> ', '', 'line')
  const insertHorizontalRule = () => onInsert('\n---\n', '', 'insert')
  const insertTable = () => {
    const table = `| 列1 | 列2 | 列3 |
|------|------|------|
| 内容 | 内容 | 内容 |
| 内容 | 内容 | 内容 |
`
    onInsert(table, '', 'insert')
  }

  const insertChart = (type) => {
    const charts = {
      flowchart: `${'```'}mermaid
graph TD
    A[开始] --> B{判断条件}
    B -->|是| C[执行操作]
    B -->|否| D[其他操作]
    C --> E[结束]
    D --> E
${'```'}`,
      sequence: `${'```'}mermaid
sequenceDiagram
    participant A as 用户
    participant B as 系统
    A->>B: 发送请求
    B->>B: 处理请求
    B-->>A: 返回响应
${'```'}`,
      class: `${'```'}mermaid
classDiagram
    class "动物" {
        +String 名称
        +int 年龄
        +吃()
        +睡()
    }
    class "狗" {
        +吠叫()
    }
    "动物" <|-- "狗"
${'```'}`,
      state: `${'```'}mermaid
stateDiagram-v2
    [*] --> 待机
    待机 --> 运行: 启动
    运行 --> 暂停: 暂停
    暂停 --> 运行: 继续
    运行 --> [*]: 停止
${'```'}`,
      gantt: `${'```'}mermaid
gantt
    title 项目进度
    dateFormat  YYYY-MM-DD
    section 阶段1
    任务1           :a1, 2024-01-01, 30d
    任务2           :after a1, 20d
    section 阶段2
    任务3           :2024-02-01, 25d
${'```'}`,
      pie: `${'```'}mermaid
pie title 数据分布
    "类别A" : 45
    "类别B" : 30
    "类别C" : 15
    "类别D" : 10
${'```'}`,
      journey: `${'```'}mermaid
journey
    title 用户旅程
    section 访问网站
      打开首页: 5: 用户
      浏览内容: 4: 用户
    section 注册
      填写表单: 3: 用户
      验证邮箱: 2: 用户, 系统
${'```'}`,
      er: `${'```'}mermaid
erDiagram
    "用户" ||--o{ "订单" : "创建"
    "订单" ||--|{ "订单项" : "包含"
    "商品" ||--o{ "订单项" : "属于"

    "用户" {
        int id "用户ID（主键）"
        string name "姓名"
        string email "邮箱"
    }
    "订单" {
        int id "订单ID（主键）"
        int user_id "关联用户ID（外键）"
        datetime create_time "创建时间"
    }
    "订单项" {
        int id "订单项ID（主键）"
        int order_id "关联订单ID（外键）"
        int product_id "关联商品ID（外键）"
        int quantity "购买数量"
        decimal price "商品单价"
    }
    "商品" {
        int id "商品ID（主键）"
        string name "商品名称"
        decimal price "售价"
        int stock "库存"
    }
${'```'}`
    }
    
    onInsert(charts[type] + '\n', '', 'insert')
    setShowChartMenu(false)
  }

  const iconSize = 16

  const chartTypes = [
    { id: 'flowchart', label: '流程图', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><path d="M10 6.5h4M17.5 10v4"/></svg>) },
    { id: 'sequence', label: '时序图', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><line x1="6" y1="8" x2="6" y2="20"/><line x1="18" y1="8" x2="18" y2="20"/><path d="M6 12h12M18 12l-2-2M18 12l-2 2"/></svg>) },
    { id: 'class', label: '类图', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="6"/><line x1="3" y1="9" x2="21" y2="9"/><rect x="3" y="9" width="18" height="6"/><line x1="3" y1="15" x2="21" y2="15"/><rect x="3" y="15" width="18" height="6"/></svg>) },
    { id: 'state', label: '状态图', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="12" r="3"/><circle cx="18" cy="12" r="3"/><path d="M9 12h6M15 12l-2-2M15 12l-2 2"/></svg>) },
    { id: 'gantt', label: '甘特图', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="15" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="12" y2="18"/><circle cx="15" cy="6" r="1.5" fill="currentColor"/><circle cx="21" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="18" r="1.5" fill="currentColor"/></svg>) },
    { id: 'pie', label: '饼图', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 3v9l6.36 6.36"/><path d="M3 12h9"/></svg>) },
    { id: 'journey', label: '用户旅程图', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h4l3-9 4 18 3-9h4"/></svg>) },
    { id: 'er', label: '实体关系图', icon: (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="8" height="10" rx="1"/><rect x="14" y="7" width="8" height="10" rx="1"/><path d="M10 12h4"/></svg>) }
  ]


  return (
    <div className="editor-toolbar">
      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={() => insertHeading(1)} disabled={disabled} title="标题 1"><Heading1 size={iconSize} /></button>
        <button className="toolbar-btn" onClick={() => insertHeading(2)} disabled={disabled} title="标题 2"><Heading2 size={iconSize} /></button>
        <button className="toolbar-btn" onClick={() => insertHeading(3)} disabled={disabled} title="标题 3"><Heading3 size={iconSize} /></button>
      </div>
      <div className="toolbar-divider"></div>
      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={insertBold} disabled={disabled} title="加粗 (Ctrl+B)"><Bold size={iconSize} /></button>
        <button className="toolbar-btn" onClick={insertItalic} disabled={disabled} title="斜体 (Ctrl+I)"><Italic size={iconSize} /></button>
        <button className="toolbar-btn" onClick={insertStrikethrough} disabled={disabled} title="删除线"><Strikethrough size={iconSize} /></button>
      </div>
      <div className="toolbar-divider"></div>
      <div className="toolbar-divider"></div>
      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={insertUnorderedList} disabled={disabled} title="无序列表"><List size={iconSize} /></button>
        <button className="toolbar-btn" onClick={insertOrderedList} disabled={disabled} title="有序列表"><ListOrdered size={iconSize} /></button>
        <button className="toolbar-btn" onClick={insertTaskList} disabled={disabled} title="任务列表"><CheckSquare size={iconSize} /></button>
      </div>
      <div className="toolbar-divider"></div>
      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={insertLink} disabled={disabled} title="插入链接"><Link2 size={iconSize} /></button>
        <button className="toolbar-btn" onClick={onOpenImageManager} disabled={disabled} title="图片管理"><Image size={iconSize} /></button>
        <button className="toolbar-btn" onClick={handleUploadClick} disabled={disabled} title="上传图片 (支持多选)"><Upload size={iconSize} /></button>
        <button className="toolbar-btn" onClick={insertCodeBlock} disabled={disabled} title="代码块"><FileCode size={iconSize} /></button>
        <button className="toolbar-btn" onClick={insertInlineCode} disabled={disabled} title="行内代码"><Code2 size={iconSize} /></button>
      </div>
      <div className="toolbar-divider"></div>
      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={insertQuote} disabled={disabled} title="引用"><Quote size={iconSize} /></button>
        <button className="toolbar-btn" onClick={onOpenTableInsert} disabled={disabled} title="插入表格"><Table size={iconSize} /></button>
        <button className="toolbar-btn" onClick={insertHorizontalRule} disabled={disabled} title="分隔线"><Minus size={iconSize} /></button>
      </div>
      <div className="toolbar-divider"></div>
      <div className="toolbar-group chart-group">
        <button 
          ref={chartButtonRef}
          className={`toolbar-btn chart-btn ${showChartMenu ? 'active' : ''}`} 
          onClick={() => setShowChartMenu(!showChartMenu)} 
          disabled={disabled} 
          title="插入图表"
        >
          <BarChart3 size={iconSize} />
          <ChevronDown size={12} />
        </button>
      </div>
      
      {showChartMenu && (
        <div 
          ref={chartMenuRef}
          className="chart-dropdown" 
          style={{
            position: 'fixed',
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            zIndex: 9999
          }}
        >
          <div className="chart-dropdown-header">图表类型</div>
          <div className="chart-grid">
            {chartTypes.map(chart => (
              <button key={chart.id} className="chart-item" onClick={() => insertChart(chart.id)} disabled={disabled}>
                <span className="chart-icon">{chart.icon}</span>
                <span className="chart-label">{chart.label}</span>
              </button>
            ))}
          </div>
          <div className="chart-dropdown-footer">图表将在预览面板中渲染</div>
        </div>
      )}
      
      {/* 隐藏的文件输入框 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  )
}

// 使用 React.memo 优化性能，避免不必要的重渲染
export default React.memo(EditorToolbar)
