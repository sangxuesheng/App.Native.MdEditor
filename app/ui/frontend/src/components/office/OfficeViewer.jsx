import { useEffect, useRef } from 'react'
import { FORMAT_DOCX, FORMAT_PPTX_EXPERIMENTAL, FORMAT_XLSX } from '../../constants/fileFormats'
import './OfficeViewer.css'

export default function OfficeViewer({
  format,
  content,
  metadata,
  loading,
  loadingMore,
  error,
  onSelectSheet,
  onLoadMore,
}) {
  if (loading && !content) {
    return (
      <div className="office-viewer">
        <div className="office-viewer-status">正在加载 Office 预览...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="office-viewer office-viewer-error">
        <div className="office-viewer-status">Office 预览加载失败</div>
        <div className="office-viewer-error-detail">{error}</div>
      </div>
    )
  }

  if (format === FORMAT_DOCX) {
    const text = typeof content === 'string' ? content : (content?.text || content?.content || '')
    return (
      <div className="office-viewer">
        <div className="office-preview-banner">Word文档转换预览（可能有格式损失）</div>
        {metadata?.macroDetected && (
          <div className="office-preview-warning">检测到宏内容：已禁用执行风险</div>
        )}
        {metadata?.truncated && (
          <div className="office-preview-warning">内容已截断显示</div>
        )}
        <pre className="office-docx-text">{text || '无可预览内容'}</pre>
      </div>
    )
  }

  if (format === FORMAT_XLSX) {
    const headerRow = content?.headerRow || []
    const bodyRows = content?.rows || []

    const colCount = Number.isFinite(content?.colCount) ? content.colCount : headerRow.length
    const safeColCount = Math.max(0, colCount || 0)
    const sheetNames = Array.isArray(metadata?.sheetNames) ? metadata.sheetNames : []
    const activeSheetIndex = Number.isFinite(content?.sheetIndex) ? content.sheetIndex : 0
    const hasMore = !!content?.hasMore
    const tableWrapRef = useRef(null)
    const rafRef = useRef(0)

    useEffect(() => {
      const el = tableWrapRef.current
      if (!el) return

      const onScroll = () => {
        if (!onLoadMore || loadingMore || loading) return
        if (!hasMore) return
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(() => {
          const remain = el.scrollHeight - (el.scrollTop + el.clientHeight)
          if (remain < 240) {
            onLoadMore()
          }
        })
      }

      el.addEventListener('scroll', onScroll, { passive: true })
      // 初次渲染若内容不足一屏，尝试补一次
      onScroll()
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        el.removeEventListener('scroll', onScroll)
      }
    }, [onLoadMore, loadingMore, loading, hasMore, activeSheetIndex])

    return (
      <div className="office-viewer">
        <div className="office-preview-banner">Excel表格转换预览（纯 HTML 表格）</div>
        {metadata?.macroDetected && (
          <div className="office-preview-warning">检测到宏内容：已禁用执行风险</div>
        )}
        {sheetNames.length > 1 && (
          <div className="office-xlsx-sheets">
            {sheetNames.map((name, idx) => (
              <button
                key={`${idx}-${name}`}
                type="button"
                className={`office-xlsx-sheet-tab${idx === activeSheetIndex ? ' is-active' : ''}`}
                onClick={() => onSelectSheet && onSelectSheet(idx)}
                title={name}
              >
                {name}
              </button>
            ))}
          </div>
        )}
        <div className="office-preview-table-wrap" ref={tableWrapRef}>
          {bodyRows.length === 0 && headerRow.length === 0 ? (
            <div className="office-preview-empty">无可预览内容</div>
          ) : (
            <table className="office-xlsx-table">
              <thead>
                <tr>
                  {Array.from({ length: safeColCount }).map((_, c) => (
                    <th key={c} className="office-xlsx-th">
                      {String(headerRow?.[c] ?? '')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((r, i) => (
                  <tr key={i}>
                    {Array.from({ length: safeColCount }).map((_, c) => (
                      <td key={c} className="office-xlsx-td">
                        {String(r?.[c] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {(loadingMore || (hasMore && !loadingMore)) && (
            <div className="office-xlsx-loadmore">
              {loadingMore ? '正在加载更多行...' : '继续下拉加载更多行'}
            </div>
          )}
        </div>

        {(metadata?.truncatedRows || metadata?.truncatedCols || metadata?.truncatedSheets) && (
          <div className="office-preview-warning">
            表格已截断预览范围（rows/cols 超出限制）
          </div>
        )}
      </div>
    )
  }

  if (format === FORMAT_PPTX_EXPERIMENTAL) {
    return (
      <div className="office-viewer">
        <div className="office-preview-banner">PPTX（实验性）</div>
        <div className="office-preview-empty">
          PPTX 文件暂不支持预览（仅作为二进制信息查看）。
        </div>
      </div>
    )
  }

  return (
    <div className="office-viewer">
      <div className="office-preview-empty">该 Office 格式暂不支持预览</div>
    </div>
  )
}

