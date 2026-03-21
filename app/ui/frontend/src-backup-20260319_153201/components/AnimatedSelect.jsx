import React, { useEffect, useRef, useState } from 'react'
import './AnimatedSelect.css'

function AnimatedSelect({
  label,
  value,
  options,
  onChange,
  wrapperClassName = 'config-item',
  labelClassName = 'config-label',
  disabled = false,
}) {
  const [open, setOpen] = useState(false)
  const [focusedIdx, setFocusedIdx] = useState(-1)
  const containerRef = useRef(null)
  const listRef = useRef(null)

  const selectedOpt = options.find((option) => option.value === value)

  useEffect(() => {
    if (!open) return

    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [open])

  useEffect(() => {
    if (!open) return

    const idx = options.findIndex((option) => option.value === value)
    setFocusedIdx(idx)

    const timer = setTimeout(() => {
      if (!listRef.current) return
      const item = listRef.current.querySelector('.asel-item.selected')
      if (item) {
        item.scrollIntoView({ block: 'nearest' })
      }
    }, 50)

    return () => clearTimeout(timer)
  }, [open, options, value])

  useEffect(() => {
    if (!open || focusedIdx < 0 || !listRef.current) return

    const items = listRef.current.querySelectorAll('.asel-item')
    if (items[focusedIdx]) {
      items[focusedIdx].scrollIntoView({ block: 'nearest' })
    }
  }, [focusedIdx, open])

  const toggleOpen = () => {
    if (disabled) return
    setOpen((current) => !current)
  }

  const handleKeyDown = (event) => {
    if (disabled) return

    if (!open) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        setOpen(true)
        event.preventDefault()
      }
      return
    }

    if (event.key === 'ArrowDown') {
      setFocusedIdx((current) => Math.min(current + 1, options.length - 1))
      event.preventDefault()
      return
    }

    if (event.key === 'ArrowUp') {
      setFocusedIdx((current) => Math.max(current - 1, 0))
      event.preventDefault()
      return
    }

    if (event.key === 'Enter' && focusedIdx >= 0) {
      onChange(options[focusedIdx].value)
      setOpen(false)
      event.preventDefault()
      return
    }

    if (event.key === 'Escape') {
      setOpen(false)
      event.preventDefault()
    }
  }

  return (
    <div className={wrapperClassName} ref={containerRef}>
      {label && <label className={labelClassName}>{label}</label>}
      <div
        className={`asel-trigger${open ? ' open' : ''}${disabled ? ' disabled' : ''}`}
        tabIndex={disabled ? -1 : 0}
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={open}
        aria-disabled={disabled}
      >
        <span className="asel-value">{selectedOpt ? selectedOpt.label : value}</span>
        <span className={`asel-arrow${open ? ' open' : ''}`}></span>
      </div>

      {open && (
        <div className="asel-dropdown" ref={listRef}>
          <div className="asel-list">
            {options.map((option, idx) => (
              <div
                key={option.value}
                className={`asel-item${option.value === value ? ' selected' : ''}${idx === focusedIdx ? ' focused' : ''}`}
                style={{ animationDelay: `${idx * 30}ms` }}
                onMouseDown={(event) => {
                  event.preventDefault()
                  onChange(option.value)
                  setOpen(false)
                }}
                onMouseEnter={() => setFocusedIdx(idx)}
                role="option"
                aria-selected={option.value === value}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AnimatedSelect
