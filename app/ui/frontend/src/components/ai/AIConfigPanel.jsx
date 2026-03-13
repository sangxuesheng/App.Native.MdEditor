import React from 'react'
import { X, TestTube } from 'lucide-react'
import { AI_SERVICES } from '../../constants/aiConfig'

export default function AIConfigPanel({ config, onConfigChange, onClose, onTestConnection }) {
  const [testing, setTesting] = React.useState(false)
  const [testResult, setTestResult] = React.useState(null)

  const currentService = AI_SERVICES.find((s) => s.value === config.type)

  const handleTest = async () => {
    setTesting(true)
    setTestResult(null)
    const result = await onTestConnection()
    setTestResult(result)
    setTesting(false)
  }

  return (
    <div className="ai-config-panel">
      <div className="ai-config-header">
        <h3>AI 配置</h3>
        <button className="ai-icon-btn" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className="ai-config-content">
        {/* 服务类型 */}
        <div className="config-field">
          <label>AI 服务</label>
          <select
            value={config.type}
            onChange={(e) => {
              const service = AI_SERVICES.find((s) => s.value === e.target.value)
              onConfigChange({
                type: e.target.value,
                endpoint: service.endpoint,
                model: service.models[0],
              })
            }}
          >
            {AI_SERVICES.map((service) => (
              <option key={service.value} value={service.value}>
                {service.label}
              </option>
            ))}
          </select>
        </div>

        {/* API 端点 */}
        <div className="config-field">
          <label>API 端点</label>
          <input
            type="text"
            value={config.endpoint}
            onChange={(e) => onConfigChange({ endpoint: e.target.value })}
            placeholder="https://api.example.com/v1"
          />
        </div>

        {/* API Key */}
        {currentService?.needsApiKey && (
          <div className="config-field">
            <label>API Key</label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => onConfigChange({ apiKey: e.target.value })}
              placeholder="sk-..."
            />
          </div>
        )}

        {/* 模型 */}
        <div className="config-field">
          <label>模型</label>
          <select
            value={config.model}
            onChange={(e) => onConfigChange({ model: e.target.value })}
          >
            {currentService?.models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        {/* 温度 */}
        <div className="config-field">
          <label>
            温度 ({config.temperature})
            <span className="config-hint">控制随机性，0-2</span>
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={config.temperature}
            onChange={(e) => onConfigChange({ temperature: parseFloat(e.target.value) })}
          />
        </div>

        {/* 最大 Token */}
        <div className="config-field">
          <label>
            最大 Token ({config.maxTokens})
            <span className="config-hint">控制回复长度</span>
          </label>
          <input
            type="range"
            min="256"
            max="4096"
            step="256"
            value={config.maxTokens}
            onChange={(e) => onConfigChange({ maxTokens: parseInt(e.target.value) })}
          />
        </div>

        {/* 测试连接 */}
        <div className="config-field">
          <button
            className="ai-test-btn"
            onClick={handleTest}
            disabled={testing}
          >
            <TestTube size={16} />
            {testing ? '测试中...' : '测试连接'}
          </button>
          {testResult && (
            <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
              {testResult.message}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
