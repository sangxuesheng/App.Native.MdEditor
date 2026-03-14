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
  const hasInitialConfigLoad = useRef(false)

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
      hasInitialConfigLoad.current = true
    })
  }, [])

  // 配置（含自定义模型）持久化到服务器
  useEffect(() => {
    if (!hasInitialConfigLoad.current) return
    persistSetting('aiImageConfig', config).catch((err) => {
      console.error('[useAIImage] 保存文生图配置到服务器失败:', err)
    })
  }, [config])

  /** 使用指定配置发起生成（用于与对话共用 API 时传入合并后的 effectiveConfig） */
  const generateWithConfig = useCallback(async (overrideConfig) => {
    const text = prompt.trim()
    if (!text || generating) return
    const c = overrideConfig || config

    setGenerating(true)
    setError(null)
    setResultUrl(null)
    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/ai/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: c.endpoint,
          apiKey: c.apiKey || undefined,
          model: c.model,
          size: c.size || '1024x1024',
          prompt: text,
        }),
        signal: abortRef.current.signal,
      })
      const raw = await res.text()
      let data = {}
      try {
        data = raw ? JSON.parse(raw) : {}
      } catch (_) {
        data = { ok: false, message: res.status === 400 ? '请求参数有误，请检查模型与配置' : '生成失败' }
      }
      let errMsg = data?.message || (res.status === 400 ? '请求参数有误，请检查模型与配置' : '生成失败')
      if (typeof errMsg === 'string' && /^\s*bad\s*request\s*$/i.test(errMsg)) {
        errMsg = '请求参数有误：请检查模型名、出图尺寸或 API Key 是否符合该服务商要求'
      }
      if (!data?.ok) {
        throw new Error(errMsg)
      }

      // 自动保存到图片库（不压缩），插入时使用本地路径
      let displayUrl = data.url
      if (data.url) {
        try {
          const saveRes = await fetch('/api/image/fetch-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: data.url, alt: 'AI生成' }),
          })
          const saveData = await saveRes.json()
          if (saveData?.ok && saveData?.url) displayUrl = saveData.url
        } catch (_) {}
      }
      setResultUrl(displayUrl)
      setHistory((h) => [{ prompt: text, url: displayUrl, time: Date.now() }, ...h.slice(0, 19)])
    } catch (err) {
      if (err.name === 'AbortError') return
      let msg = err.message || '生成失败'
      if (/^\s*bad\s*request\s*$/i.test(msg)) msg = '请求参数有误：请检查模型名、出图尺寸或 API Key 是否符合该服务商要求'
      setError(msg)
    } finally {
      setGenerating(false)
      abortRef.current = null
    }
  }, [prompt, config, generating])

  const generate = useCallback(async () => {
    return generateWithConfig(config)
  }, [config, generateWithConfig])

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
    }
  }, [])

  const testConnection = useCallback(async (overrides = {}) => {
    const model = overrides.model ?? config.model
    const endpoint = overrides.endpoint ?? config.endpoint
    const apiKey = overrides.apiKey ?? config.apiKey
    try {
      const res = await fetch('/api/ai/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint,
          apiKey: apiKey || undefined,
          model,
          size: config.size || '1024x1024',
          prompt: 'test',
        }),
      })
      const raw = await res.text()
      let data = {}
      try {
        data = raw ? JSON.parse(raw) : {}
      } catch (_) {
        if (!res.ok) data = { message: res.status === 400 ? '请求参数有误，请检查模型与配置' : '连接失败' }
      }
      let msg = data?.message || (res.status === 400 ? '请求参数有误，请检查模型与配置' : '连接失败')
      if (typeof msg === 'string' && /^\s*bad\s*request\s*$/i.test(msg)) {
        msg = '请求参数有误：请检查模型名、出图尺寸或 API Key 是否符合该服务商要求'
      }
      return data?.ok ? { success: true, message: '连接成功' } : { success: false, message: msg }
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
    generateWithConfig,
    cancel,
    testConnection,
  }
}
