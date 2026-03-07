import React, { useState, useRef, useEffect } from 'react'
import './ElasticSlider.css'

const ElasticSlider = ({ min = 0, max = 100, value, onChange, className = '' }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [localValue, setLocalValue] = useState(value)
  const sliderRef = useRef(null)
  const thumbRef = useRef(null)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const getPercentage = (val) => {
    return ((val - min) / (max - min)) * 100
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    updateValue(e)
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      updateValue(e)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const updateValue = (e) => {
    if (!sliderRef.current) return

    const rect = sliderRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const percentage = x / rect.width
    const newValue = Math.round(min + percentage * (max - min))
    
    setLocalValue(newValue)
    onChange?.(newValue)
  }

  const handleTrackClick = (e) => {
    if (e.target === sliderRef.current || e.target.classList.contains('elastic-slider-track')) {
      updateValue(e)
    }
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  const percentage = getPercentage(localValue)

  return (
    <div 
      className={`elastic-slider ${className} ${isDragging ? 'dragging' : ''}`}
      ref={sliderRef}
      onClick={handleTrackClick}
    >
      <div className="elastic-slider-track">
        <div 
          className="elastic-slider-fill"
          style={{ width: `${percentage}%` }}
        />
        <div 
          className="elastic-slider-thumb"
          ref={thumbRef}
          style={{ left: `${percentage}%` }}
          onMouseDown={handleMouseDown}
        >
          <div className="elastic-slider-thumb-inner" />
        </div>
      </div>
    </div>
  )
}

export default ElasticSlider
