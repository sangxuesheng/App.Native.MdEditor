import React, { useCallback, useEffect, useRef } from 'react'
import './Resizer.css'

/**
 * 可拖拽的分隔条组件
 * @param {string} direction - 'vertical' 或 'horizontal'
 * @param {function} onResize - 拖拽时的回调函数，参数为拖拽的偏移量
 */
function Resizer({ direction = 'vertical', onResize }) {
  const isResizing = useRef(false)
  const startPos = useRef(0)

  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    isResizing.current = true
    startPos.current = direction === 'vertical' ? e.clientX : e.clientY
    document.body.style.cursor = direction === 'vertical' ? 'col-resize' : 'row-resize'
    document.body.style.userSelect = 'none'
  }, [direction])

  const handleMouseMove = useCallback((e) => {
    if (!isResizing.current) return
    
    const currentPos = direction === 'vertical' ? e.clientX : e.clientY
    const delta = currentPos - startPos.current
    
    if (onResize) {
      onResize(delta)
    }
    
    startPos.current = currentPos
  }, [direction, onResize])

  const handleMouseUp = useCallback(() => {
    if (isResizing.current) {
      isResizing.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  return (
    <div 
      className={`resizer resizer-${direction}`}
      onMouseDown={handleMouseDown}
    >
      <div className="resizer-handle" />
    </div>
  )
}

export default Resizer

