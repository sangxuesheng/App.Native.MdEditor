import React, { useState, useCallback, useEffect, useRef } from 'react'
import { Bot } from 'lucide-react'
import AIDialog from './AIDialog'

const STORAGE_KEY = 'ai-toggle-btn-position'
const DEFAULT_RIGHT = 20
const DEFAULT_BOTTOM = 20

function loadSavedPosition() {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (!s) return null
    const { x, y } = JSON.parse(s)
    if (typeof x === 'number' && typeof y === 'number') return { x, y }
  } catch (_) {}
  return null
}

function savePosition(x, y) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ x, y }))
  } catch (_) {}
}

export default function AISidebar({ getEditorContent, getSelectedText, onInsertImage, onInsertText, onOpenImageManager }) {
  const [isOpen, setIsOpen] = useState(false)
  const [pos, setPos] = useState(() => {
    const saved = loadSavedPosition()
    if (saved) return saved
    return null // 延迟到 mount 时根据窗口计算
  })

  useEffect(() => {
    if (pos !== null) return
    setPos({
      x: window.innerWidth - 56 - DEFAULT_RIGHT,
      y: window.innerHeight - 56 - DEFAULT_BOTTOM,
    })
  }, [])
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 })
  const hasMovedRef = useRef(false)

  // 窗口 resize 时保持按钮在可视区域内
  useEffect(() => {
    const onResize = () => {
      setPos(p => {
        if (!p) return p
        const maxX = Math.max(0, window.innerWidth - 56)
        const maxY = Math.max(0, window.innerHeight - 56)
        return {
          x: Math.min(maxX, Math.max(0, p.x)),
          y: Math.min(maxY, Math.max(0, p.y)),
        }
      })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const getClientCoords = (e) => {
    if (e.touches?.length) return { x: e.touches[0].clientX, y: e.touches[0].clientY }
    return { x: e.clientX, y: e.clientY }
  }

  const handlePointerDown = useCallback((e) => {
    if (e.button !== 0 && e.type !== 'touchstart') return
    if (!pos) return
    hasMovedRef.current = false
    const { x, y } = getClientCoords(e)
    dragStartRef.current = { x, y, posX: pos.x, posY: pos.y }
    setIsDragging(true)
  }, [pos])

  useEffect(() => {
    if (!isDragging) return
    const onMove = (e) => {
      e.preventDefault?.()
      hasMovedRef.current = true
      const { x, y } = getClientCoords(e)
      const dx = x - dragStartRef.current.x
      const dy = y - dragStartRef.current.y
      setPos(p => {
        const nx = dragStartRef.current.posX + dx
        const ny = dragStartRef.current.posY + dy
        const maxX = Math.max(0, window.innerWidth - 56)
        const maxY = Math.max(0, window.innerHeight - 56)
        return {
          x: Math.min(maxX, Math.max(0, nx)),
          y: Math.min(maxY, Math.max(0, ny)),
        }
      })
    }
    const onUp = () => {
      if (hasMovedRef.current) {
        setPos(p => {
          savePosition(p.x, p.y)
          return p
        })
      }
      setIsDragging(false)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchmove', onMove, { passive: false })
      document.removeEventListener('touchend', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('touchend', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onUp)
    }
  }, [isDragging])

  const handleTouchStart = useCallback((e) => handlePointerDown(e), [handlePointerDown])
  const handleMouseDown = useCallback((e) => handlePointerDown(e), [handlePointerDown])

  const handleClick = useCallback((e) => {
    if (hasMovedRef.current) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    setIsOpen(true)
  }, [])

  const handleOpenImageManager = useCallback((tab) => {
    onOpenImageManager?.(tab)
  }, [onOpenImageManager])

  const handleInsertImage = useCallback((url) => {
    if (onInsertImage) {
      onInsertImage(`![AI生成](${url})`)
    }
  }, [onInsertImage])

  return (
    <>
      {/* AI 浮动按钮（可拖动） */}
      <button
        className={`ai-toggle-btn ${isDragging ? 'dragging' : ''}`}
        style={pos ? { left: pos.x, top: pos.y, right: 'auto', bottom: 'auto' } : { right: DEFAULT_RIGHT, bottom: DEFAULT_BOTTOM }}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        title="打开 AI 助手（可拖动调整位置）"
      >
        <Bot size={24} />
        <span className="ai-toggle-label">AI</span>
      </button>

      {/* AI 对话窗口 */}
      <AIDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        getEditorContent={getEditorContent}
        getSelectedText={getSelectedText}
        onInsertImage={handleInsertImage}
        onInsertText={onInsertText}
        onOpenImageManager={handleOpenImageManager}
      />
    </>
  )
}
