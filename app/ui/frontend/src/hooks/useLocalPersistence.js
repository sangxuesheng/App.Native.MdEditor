import { useEffect, useCallback, useRef } from 'react'
import { saveFullState } from '../utils/localPersistence'

/**
 * 本地持久化自动保存 Hook
 * 
 * @param {Object} state - 需要保存的状态对象
 * @param {number} delay - 防抖延迟时间（毫秒），默认 500ms
 * @param {boolean} enabled - 是否启用自动保存，默认 true
 */
export const useLocalPersistence = (state, delay = 500, enabled = true) => {
  const timeoutRef = useRef(null)
  const previousStateRef = useRef(state)

  // 防抖保存函数
  const debouncedSave = useCallback(() => {
    if (!enabled) return

    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // 设置新的定时器
    timeoutRef.current = setTimeout(() => {
      try {
        saveFullState(state)
        console.log('[LocalPersistence] State saved to localStorage')
      } catch (error) {
        console.error('[LocalPersistence] Failed to save state:', error)
      }
    }, delay)
  }, [state, delay, enabled])

  // 监听状态变化
  useEffect(() => {
    // 检查状态是否真的变化了
    const hasChanged = JSON.stringify(state) !== JSON.stringify(previousStateRef.current)
    
    if (hasChanged && enabled) {
      debouncedSave()
      previousStateRef.current = state
    }

    // 清理函数
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [state, debouncedSave, enabled])

  // 立即保存函数（不防抖）
  const saveNow = useCallback(() => {
    if (!enabled) return false

    try {
      // 清除防抖定时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      
      saveFullState(state)
      console.log('[LocalPersistence] State saved immediately')
      return true
    } catch (error) {
      console.error('[LocalPersistence] Failed to save state immediately:', error)
      return false
    }
  }, [state, enabled])

  return { saveNow }
}

/**
 * 监听页面关闭/刷新事件，确保保存
 */
export const useBeforeUnload = (state, enabled = true) => {
  useEffect(() => {
    if (!enabled) return

    const handleBeforeUnload = (e) => {
      try {
        // 立即保存状态
        saveFullState(state)
        console.log('[LocalPersistence] State saved before unload')
      } catch (error) {
        console.error('[LocalPersistence] Failed to save state before unload:', error)
      }
    }

    // 监听页面关闭/刷新
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [state, enabled])
}

/**
 * 监听页面可见性变化，在页面隐藏时保存
 */
export const useVisibilityChange = (state, enabled = true) => {
  useEffect(() => {
    if (!enabled) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        try {
          // 页面隐藏时立即保存
          saveFullState(state)
          console.log('[LocalPersistence] State saved on visibility change')
        } catch (error) {
          console.error('[LocalPersistence] Failed to save state on visibility change:', error)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [state, enabled])
}
