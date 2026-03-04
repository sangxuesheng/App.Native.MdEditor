import { useEffect, useRef, useCallback } from 'react'
import { saveDraft, clearDraft } from '../utils/draftManager'

/**
 * 自动保存 Hook
 * @param {string} content - 编辑器内容
 * @param {string} filePath - 当前文件路径
 * @param {Function} onSave - 保存回调函数
 * @param {Object} options - 配置选项
 * @returns {Object} - 保存状态和控制函数
 */
export function useAutoSave(content, filePath, onSave, options = {}) {
  const {
    interval = 30000, // 默认 30 秒
    enabled = true,
    onAutoSaveSuccess,
    onAutoSaveError
  } = options

  const lastSavedContent = useRef(content)
  const lastSavedTime = useRef(Date.now())
  const saveTimerRef = useRef(null)
  const isSavingRef = useRef(false)

  // 检查内容是否有变化（忽略空格变化）
  const hasChanges = useCallback(() => {
    const currentTrimmed = content.trim()
    const lastSavedTrimmed = lastSavedContent.current.trim()
    
    // 如果只是空格变化，不算作修改
    if (currentTrimmed === lastSavedTrimmed) {
      return false
    }
    
    return content !== lastSavedContent.current
  }, [content])

  // 执行保存
  const performSave = useCallback(async (isDraft = false) => {
    if (isSavingRef.current) return false
    if (!hasChanges()) return false

    isSavingRef.current = true

    try {
      if (isDraft) {
        // 保存草稿到 localStorage
        saveDraft(filePath, content)
        lastSavedContent.current = content
        lastSavedTime.current = Date.now()
        onAutoSaveSuccess?.('草稿已保存')
      } else {
        // 保存到服务器
        await onSave()
        lastSavedContent.current = content
        lastSavedTime.current = Date.now()
        // 保存成功后清除草稿
        clearDraft(filePath)
        onAutoSaveSuccess?.('文件已保存')
      }
      return true
    } catch (error) {
      onAutoSaveError?.(error)
      return false
    } finally {
      isSavingRef.current = false
    }
  }, [content, filePath, hasChanges, onSave, onAutoSaveSuccess, onAutoSaveError])

  // 自动保存定时器
  useEffect(() => {
    if (!enabled || !filePath) return

    // 清除旧定时器
    if (saveTimerRef.current) {
      clearInterval(saveTimerRef.current)
    }

    // 设置新定时器
    saveTimerRef.current = setInterval(() => {
      if (hasChanges()) {
        performSave(true) // 自动保存为草稿
      }
    }, interval)

    return () => {
      if (saveTimerRef.current) {
        clearInterval(saveTimerRef.current)
      }
    }
  }, [enabled, filePath, interval, hasChanges, performSave])

  // 手动保存
  const manualSave = useCallback(async () => {
    return await performSave(false)
  }, [performSave])

  // 强制保存草稿
  const saveDraftNow = useCallback(async () => {
    return await performSave(true)
  }, [performSave])

  // 重置保存状态（用于加载新文件时）
  const reset = useCallback(() => {
    lastSavedContent.current = content
    lastSavedTime.current = Date.now()
  }, [content])

  return {
    hasChanges: hasChanges(),
    lastSavedTime: lastSavedTime.current,
    manualSave,
    saveDraftNow,
    reset,
    isSaving: isSavingRef.current
  }
}

