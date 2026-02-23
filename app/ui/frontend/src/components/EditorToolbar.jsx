import React from 'react'
import './EditorToolbar.css'

/**
 * Markdown 编辑器工具栏组件
 * 提供快捷插入功能
 */
function EditorToolbar({ onInsert, disabled }) {
  
  // 插入标题
  const insertHeading = (level) => {
    const prefix = '#'.repeat(level) + ' '
    onInsert(prefix, '', 'heading')
  }

  // 插入加粗
  const insertBold = () => {
    onInsert('**', '**', 'wrap')
  }

  // 插入斜体
  const insertItalic = () => {
    onInsert('*', '*', 'wrap')
  }

  // 插入删除线
  const insertStrikethrough = () => {
    onInsert('~~', '~~', 'wrap')
  }

  // 插入无序列表
  const insertUnorderedList = () => {
    onInsert('- ', '', 'line')
  }

  // 插入有序列表
  const insertOrderedList = () => {
    onInsert('1. ', '', 'line')
  }

  // 插入任务列表
  const insertTaskList = () => {
    onInsert('- [ ] ', '', 'line')
  }

  // 插入链接
  const insertLink = () => {
    onInsert('[', '](https://)', 'wrap')
  }

  // 插入图片
  const insertImage = () => {
    onInsert('![', '](https://)', 'wrap')
  }

  // 插入代码块
  const insertCodeBlock = () => {
    onInsert('```\n', '\n```', 'wrap')
  }

  // 插入行内代码
  const insertInlineCode = () => {
    onInsert('`', '`', 'wrap')
  }

  // 插入引用
  const insertQuote = () => {
    onInsert('> ', '', 'line')
  }

  // 插入分隔线
  const insertHorizontalRule = () => {
    onInsert('\n---\n', '', 'insert')
  }

  // 插入表格
  const insertTable = () => {
    const table = `| 列1 | 列2 | 列3 |
|------|------|------|
| 内容 | 内容 | 内容 |
| 内容 | 内容 | 内容 |
`
    onInsert(table, '', 'insert')
  }

  return (
    <div className="editor-toolbar">
      {/* 标题组 */}
      <div className="toolbar-group">
        <button 
          className="toolbar-btn" 
          onClick={() => insertHeading(1)} 
          disabled={disabled}
          title="标题 1"
        >
          H1
        </button>
        <button 
          className="toolbar-btn" 
          onClick={() => insertHeading(2)} 
          disabled={disabled}
          title="标题 2"
        >
          H2
        </button>
        <button 
          className="toolbar-btn" 
          onClick={() => insertHeading(3)} 
          disabled={disabled}
          title="标题 3"
        >
          H3
        </button>
      </div>

      <div className="toolbar-divider"></div>

      {/* 文本格式组 */}
      <div className="toolbar-group">
        <button 
          className="toolbar-btn" 
          onClick={insertBold} 
          disabled={disabled}
          title="加粗 (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button 
          className="toolbar-btn" 
          onClick={insertItalic} 
          disabled={disabled}
          title="斜体 (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button 
          className="toolbar-btn" 
          onClick={insertStrikethrough} 
          disabled={disabled}
          title="删除线"
        >
          <s>S</s>
        </button>
      </div>

      <div className="toolbar-divider"></div>

      {/* 列表组 */}
      <div className="toolbar-group">
        <button 
          className="toolbar-btn" 
          onClick={insertUnorderedList} 
          disabled={disabled}
          title="无序列表"
        >
          ☰
        </button>
        <button 
          className="toolbar-btn" 
          onClick={insertOrderedList} 
          disabled={disabled}
          title="有序列表"
        >
          ≡
        </button>
        <button 
          className="toolbar-btn" 
          onClick={insertTaskList} 
          disabled={disabled}
          title="任务列表"
        >
          ☑
        </button>
      </div>

      <div className="toolbar-divider"></div>

      {/* 插入组 */}
      <div className="toolbar-group">
        <button 
          className="toolbar-btn" 
          onClick={insertLink} 
          disabled={disabled}
          title="插入链接"
        >
          🔗
        </button>
        <button 
          className="toolbar-btn" 
          onClick={insertImage} 
          disabled={disabled}
          title="插入图片"
        >
          🖼️
        </button>
        <button 
          className="toolbar-btn" 
          onClick={insertCodeBlock} 
          disabled={disabled}
          title="代码块"
        >
          {'</>'}
        </button>
        <button 
          className="toolbar-btn" 
          onClick={insertInlineCode} 
          disabled={disabled}
          title="行内代码"
        >
          {'{`}'}
        </button>
      </div>

      <div className="toolbar-divider"></div>

      {/* 其他组 */}
      <div className="toolbar-group">
        <button 
          className="toolbar-btn" 
          onClick={insertQuote} 
          disabled={disabled}
          title="引用"
        >
          "
        </button>
        <button 
          className="toolbar-btn" 
          onClick={insertTable} 
          disabled={disabled}
          title="插入表格"
        >
          ⊞
        </button>
        <button 
          className="toolbar-btn" 
          onClick={insertHorizontalRule} 
          disabled={disabled}
          title="分隔线"
        >
          —
        </button>
      </div>
    </div>
  )
}

export default EditorToolbar

