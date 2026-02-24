import React from 'react'
import './MarkdownHelpDialog.css'

function MarkdownHelpDialog({ onClose, theme }) {
  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className={`dialog-container ${theme === 'light' ? 'theme-light' : 'theme-dark'}`} onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>Markdown 语法帮助</h2>
          <button className="dialog-close" onClick={onClose}>×</button>
        </div>
        
        <div className="dialog-content markdown-help-content">
          <section className="help-section">
            <h3>标题</h3>
            <div className="help-example">
              <code># 一级标题</code>
              <code>## 二级标题</code>
              <code>### 三级标题</code>
            </div>
          </section>

          <section className="help-section">
            <h3>文本格式</h3>
            <div className="help-example">
              <code>**粗体文本**</code>
              <code>*斜体文本*</code>
              <code>~~删除线~~</code>
              <code>`行内代码`</code>
            </div>
          </section>

          <section className="help-section">
            <h3>列表</h3>
            <div className="help-example">
              <code>- 无序列表项</code>
              <code>1. 有序列表项</code>
              <code>- [ ] 任务列表（未完成）</code>
              <code>- [x] 任务列表（已完成）</code>
            </div>
          </section>

          <section className="help-section">
            <h3>链接和图片</h3>
            <div className="help-example">
              <code>[链接文本](https://example.com)</code>
              <code>![图片描述](https://example.com/image.jpg)</code>
            </div>
          </section>

          <section className="help-section">
            <h3>引用</h3>
            <div className="help-example">
              <code>&gt; 这是一段引用文本</code>
            </div>
          </section>

          <section className="help-section">
            <h3>代码块</h3>
            <div className="help-example">
              <pre>```javascript
function hello() {'{'}
  console.log('Hello World')
{'}'}
```</pre>
            </div>
          </section>

          <section className="help-section">
            <h3>表格</h3>
            <div className="help-example">
              <pre>| 列1 | 列2 |
|-----|-----|
| 内容 | 内容 |</pre>
            </div>
          </section>

          <section className="help-section">
            <h3>数学公式</h3>
            <div className="help-example">
              <code>行内公式：$E = mc^2$</code>
              <pre>块级公式：
$$
\int_{'{-\\infty}'}^{'{\\infty}'} e^{'{-x^2}'} dx = \sqrt{'{\\pi}'}
$$</pre>
            </div>
          </section>

          <section className="help-section">
            <h3>Mermaid 图表</h3>
            <div className="help-example">
              <pre>```mermaid
graph LR
    A[开始] --&gt; B[处理]
    B --&gt; C[结束]
```</pre>
            </div>
          </section>

          <section className="help-section">
            <h3>分隔线</h3>
            <div className="help-example">
              <code>---</code>
            </div>
          </section>
        </div>

        <div className="dialog-footer">
          <button className="btn-primary" onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  )
}

export default MarkdownHelpDialog

