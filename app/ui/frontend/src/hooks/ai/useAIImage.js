import { useState, useEffect, useCallback, useRef } from 'react'
import { loadSetting, persistSetting } from '../../utils/settingsApi'
import { DEFAULT_IMAGE_CONFIG } from '../../constants/aiImageConfig'

export function useAIImage() {
  const [config, setConfig] = useState(DEFAULT_IMAGE_CONFIG)
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [resultUrl, setResultUrl] = useState(null)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])
  const abortRef = useRef(null)

  useEffect(() => {
    loadSetting('aiImageConfig', null).then((saved) => {
      if (saved && typeof saved === 'object') {
        const merged = {
          ...DEFAULT_IMAGE_CONFIG,
          ...saved,
          customModels: { ...(DEFAULT_IMAGE_CONFIG.customModels || {}), ...(saved.customModels || {}) },
        }
        setConfig(merged)
      }
    })
  }, [])

  useEffect(() => {
    persistSetting('aiImageConfig', config)
  }, [config])

  const generate = useCallback(async () => {
    const text = prompt.trim()
    if (!text || generating) return

    setGenerating(true)
    setError(null)
    setResultUrl(null)
    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/ai/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: config.endpoint,
          apiKey: config.apiKey || undefined,
          model: config.model,
          size: config.size || '1024x1024',
          prompt: text,
        }),
        signal: abortRef.current.signal,
      })
      const data = await res.json()

      if (!data?.ok) {
        throw new Error(data?.message || '生成失败')
      }

      setResultUrl(data.url)
      setHistory((h) => [{ prompt: text, url: data.url, time: Date.now() }, ...h.slice(0, 19)])
    } catch (err) {
      if (err.name === 'AbortError') return
      setError(err.message || '生成失败')
    } finally {
      setGenerating(false)
      abortRef.current = null
    }
  }, [prompt, config, generating])

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
    }
  }, [])

  const testConnection = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: config.endpoint,
          apiKey: config.apiKey || undefined,
          model: config.model,
          size: config.size || '1024x1024',
          prompt: 'test',
        }),
      })
      const data = await res.json()
      return data?.ok ? { success: true, message: '连接成功' } : { success: false, message: data?.message || '连接失败' }
    } catch (e) {
      return { success: false, message: e.message || '连接失败' }
    }
  }, [config])

  return {
    config,
    setConfig,
    prompt,
    setPrompt,
    generating,
    resultUrl,
    error,
    history,
    generate,
    cancel,
    testConnection,
  }
}
