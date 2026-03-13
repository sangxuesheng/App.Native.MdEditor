// AI 服务调用工具
export class AIService {
  constructor(config) {
    this.config = config
  }

  // 更新配置
  updateConfig(config) {
    this.config = { ...this.config, ...config }
  }

  // 发送消息（流式响应）
  async sendMessage(messages, onChunk, onComplete, onError) {
    const { endpoint, apiKey, model, temperature, maxTokens } = this.config

    try {
      // 构建请求 URL
      const url = endpoint.endsWith('/chat/completions')
        ? endpoint
        : `${endpoint}/chat/completions`

      // 构建请求体
      const payload = {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      }

      // 构建请求头
      const headers = {
        'Content-Type': 'application/json',
      }

      // 如果需要 API Key
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`
      }

      // 发送请求
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // 处理流式响应
      await this.handleStreamResponse(response, onChunk, onComplete, onError)
    } catch (error) {
      console.error('AI 服务调用失败:', error)
      onError?.(error)
    }
  }

  // 处理流式响应
  async handleStreamResponse(response, onChunk, onComplete, onError) {
    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    try {
      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || trimmed === 'data: [DONE]') continue

          try {
            // 移除 "data: " 前缀
            const jsonStr = trimmed.startsWith('data: ')
              ? trimmed.slice(6)
              : trimmed

            const data = JSON.parse(jsonStr)
            const delta = data.choices?.[0]?.delta || {}

            // 处理内容
            if (delta.content) {
              onChunk?.(delta.content)
            }

            // 处理推理过程（DeepSeek R1）
            if (delta.reasoning_content) {
              onChunk?.(delta.reasoning_content, 'reasoning')
            }
          } catch (parseError) {
            console.warn('解析 SSE 数据失败:', parseError, trimmed)
          }
        }
      }

      onComplete?.()
    } catch (error) {
      console.error('处理流式响应失败:', error)
      onError?.(error)
    }
  }

  // 测试连接
  async testConnection() {
    const { endpoint, apiKey, model } = this.config

    try {
      const url = endpoint.endsWith('/chat/completions')
        ? endpoint
        : `${endpoint}/chat/completions`

      const headers = {
        'Content-Type': 'application/json',
      }

      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'ping' }],
          temperature: 0,
          max_tokens: 1,
          stream: false,
        }),
      })

      if (response.ok) {
        return { success: true, message: '连接成功' }
      } else {
        return {
          success: false,
          message: `连接失败: ${response.status} ${response.statusText}`,
        }
      }
    } catch (error) {
      return {
        success: false,
        message: `连接失败: ${error.message}`,
      }
    }
  }
}
