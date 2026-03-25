/**
 * 添加图床对话框组件
 */

import React, { useState } from 'react'
import { X, Plus, Trash2, Eye, EyeOff } from 'lucide-react'
import './AddImagebedDialog.css'
import AnimatedSelect from './AnimatedSelect'

function AddImagebedDialog({ onClose, onSuccess, onNotify, theme = 'light', editingConfig, onSaveEdit, onTestNotification }) {
  const [type, setType] = useState(editingConfig?.type || 'local')
  const [name, setName] = useState(editingConfig?.name || '')
  const [config, setConfig] = useState(editingConfig?.config || {})
  const [helpExpanded, setHelpExpanded] = useState(false)
  const [aliyunHelpExpanded, setAliyunHelpExpanded] = useState(false)
  const [tencentHelpExpanded, setTencentHelpExpanded] = useState(false)
  const [qiniuHelpExpanded, setQiniuHelpExpanded] = useState(false)
  // GitHub 多仓库列表
  const [repoList, setRepoList] = useState(() => {
    if (editingConfig?.type === 'github') {
      const repos = editingConfig?.config?.repos
      if (Array.isArray(repos) && repos.length > 0) return repos
      if (editingConfig?.config?.repo) return [editingConfig.config.repo]
    }
    return ['']
  })
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [visibleSecrets, setVisibleSecrets] = useState({})
  const isEditing = !!editingConfig

  // 当编辑配置改变时，更新表单状态
  React.useEffect(() => {
    if (editingConfig) {
      setType(editingConfig.type || 'local')
      setName(editingConfig.name || '')
      setConfig(editingConfig.config || {})
      if (editingConfig.type === 'github') {
        const repos = editingConfig?.config?.repos
        if (Array.isArray(repos) && repos.length > 0) {
          setRepoList(repos)
        } else if (editingConfig?.config?.repo) {
          setRepoList([editingConfig.config.repo])
        } else {
          setRepoList([''])
        }
      }
    } else {
      setHelpExpanded(false)
      setAliyunHelpExpanded(false)
      setTencentHelpExpanded(false)
      setQiniuHelpExpanded(false)
    }
  }, [editingConfig])

  const imagebedTypes = [
    { value: 'local', label: '本地存储', description: '无需配置，开箱即用' },
    { value: 'github', label: 'GitHub', description: '免费无限存储' },
    { value: 'qiniu', label: '七牛云', description: '国内快速，免费额度' },
    { value: 'aliyun', label: '阿里云 OSS', description: '国内主流服务' },
    { value: 'tencent', label: '腾讯云 COS', description: '腾讯云生态' },
    { value: 'custom', label: '自定义图床', description: '灵活配置' },
  ]

  const configFields = {
    local: [],
    github: [
      { key: 'owner', label: 'GitHub 用户名', type: 'text', required: true },
      { key: 'repos', label: '仓库列表', type: 'repo-list', required: true },
      { key: 'branch', label: '分支', type: 'text', required: true, defaultValue: 'main' },
      { key: 'token', label: 'GitHub Token', type: 'password', required: true },
      { key: 'path', label: '存储路径', type: 'text', required: false, defaultValue: 'images/' },
      { key: 'cdnDomain', label: 'CDN 加速域名', type: 'select', required: false, defaultValue: 'jsdelivr', options: [
        { value: 'jsdelivr', label: 'jsDelivr（推荐，国内快速）' },
        { value: 'raw', label: '原始 GitHub（可能较慢）' },
      ]},
    ],
    qiniu: [
      { key: 'accessKey', label: 'Access Key', type: 'password', required: true },
      { key: 'secretKey', label: 'Secret Key', type: 'password', required: true },
      { key: 'bucket', label: 'Bucket', type: 'text', required: true },
      { key: 'domain', label: '域名', type: 'text', required: true, placeholder: 'https://cdn.example.com' },
      { key: 'zone', label: '区域', type: 'select', required: true, defaultValue: 'z0', options: [
        { value: 'z0', label: '华东-浙江（z0）' },
        { value: 'cn-east-2', label: '华东-浙江 2（cn-east-2）' },
        { value: 'z1', label: '华北-河北（z1）' },
        { value: 'z2', label: '华南-广东（z2）' },
        { value: 'na0', label: '北美-洛杉矶（na0）' },
        { value: 'as0', label: '亚太-新加坡（as0）' },
      ]},
      { key: 'path', label: '上传目录', type: 'text', required: false, defaultValue: 'images/' },
    ],
    aliyun: [
      { key: 'region', label: '区域', type: 'text', required: true, placeholder: 'oss-cn-hangzhou' },
      { key: 'accessKeyId', label: 'Access Key ID', type: 'password', required: true },
      { key: 'accessKeySecret', label: 'Access Key Secret', type: 'password', required: true },
      { key: 'bucket', label: 'Bucket', type: 'text', required: true },
      { key: 'path', label: '上传目录', type: 'text', required: false, defaultValue: 'images/' },
      { key: 'domain', label: '域名（可选）', type: 'text', required: false },
    ],
    tencent: [
      { key: 'secretId', label: 'Secret ID', type: 'password', required: true },
      { key: 'secretKey', label: 'Secret Key', type: 'password', required: true },
      { key: 'bucket', label: 'Bucket', type: 'text', required: true, placeholder: 'my-bucket-1234567890' },
      { key: 'region', label: '区域', type: 'text', required: true, placeholder: 'ap-beijing' },
      { key: 'path', label: '上传目录', type: 'text', required: false, defaultValue: 'images/' },
      { key: 'domain', label: '域名（可选）', type: 'text', required: false },
    ],
    custom: [
      { key: 'uploadUrl', label: '上传 URL', type: 'text', required: true, placeholder: 'https://api.example.com/upload' },
      { key: 'deleteUrl', label: '删除 URL', type: 'text', required: false },
      { key: 'listUrl', label: '列表 URL', type: 'text', required: false },
      { key: 'uploadFieldName', label: '上传字段名', type: 'text', required: false, defaultValue: 'file' },
      { key: 'responseUrlPath', label: '响应 URL 路径', type: 'text', required: false, defaultValue: 'url' },
    ],
  }

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const toggleSecretVisibility = (key) => {
    setVisibleSecrets(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // 多仓库列表操作
  const handleRepoChange = (index, value) => {
    setRepoList(prev => prev.map((r, i) => i === index ? value : r))
  }
  const handleAddRepo = () => {
    setRepoList(prev => [...prev, ''])
  }
  const handleRemoveRepo = (index) => {
    setRepoList(prev => prev.filter((_, i) => i !== index))
  }

  const applyDefaults = (baseConfig) => {
    const fields = configFields[type] || []
    const next = { ...baseConfig }
    fields.forEach(field => {
      if (field.type === 'repo-list') return
      if (!Object.prototype.hasOwnProperty.call(next, field.key) && field.defaultValue !== undefined) {
        next[field.key] = field.defaultValue
      }
    })
    return next
  }

  // 获取最终 config（合并 repoList）
  const getFinalConfig = () => {
    if (type === 'github') {
      const repos = repoList.filter(r => r.trim())
      return applyDefaults({ ...config, repos, repo: repos[0] || '' })
    }
    return applyDefaults(config)
  }

  const handleTest = async () => {
    if (!name) {
      setTestResult({ success: false, message: '✗ 请输入图床名称' })
      return
    }

    setTesting(true)
    setTestResult(null)
    try {
      const finalConfig = getFinalConfig()
      // 先添加临时配置进行测试
      const response = await fetch('/api/imagebed/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `${name} (测试)`, type, config: finalConfig }),
      })
      const result = await response.json()

      if (result.ok) {
        // 测试连接
        const testResponse = await fetch(`/api/imagebed/${result.id}/test`, {
          method: 'POST',
        })
        const testResult = await testResponse.json()

        // 删除临时配置
        await fetch(`/api/imagebed/${result.id}`, { method: 'DELETE' })

        if (testResult.success) {
          setTestResult({ success: true, message: '✓ 连接成功' })
        } else {
          setTestResult({ success: false, message: `✗ 连接失败: ${testResult.error}` })
        }
      } else {
        setTestResult({ success: false, message: '✗ 添加失败' })
      }
    } catch (err) {
      console.error('Test failed:', err)
      setTestResult({ success: false, message: '✗ 测试失败' })
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async () => {
    if (!name) {
      setTestResult({ success: false, message: '✗ 请输入图床名称' })
      return
    }

    // 验证必填字段
    const fields = configFields[type] || []
    for (const field of fields) {
      if (field.type === 'repo-list') {
        const repos = repoList.filter(r => r.trim())
        if (field.required && repos.length === 0) {
          setTestResult({ success: false, message: '✗ 请至少添加一个仓库名' })
          return
        }
      } else if (field.required && !config[field.key]) {
        setTestResult({ success: false, message: `✗ 请填写 ${field.label}` })
        return
      }
    }

    const finalConfig = getFinalConfig()
    setSaving(true)
    try {
      if (isEditing) {
        // 编辑模式
        onSaveEdit?.(name, finalConfig)
      } else {
        // 添加模式
        const response = await fetch('/api/imagebed/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, type, config: finalConfig }),
        })
        const result = await response.json()

        if (result.ok) {
          setTestResult({ success: true, message: '✓ 图床已添加' })
          setTimeout(() => {
            onSuccess()
          }, 500)
        } else {
          setTestResult({ success: false, message: '✗ 添加失败' })
        }
      }
    } catch (err) {
      console.error('Failed to save imagebed:', err)
      setTestResult({ success: false, message: '✗ 保存失败' })
    } finally {
      setSaving(false)
    }
  }

  const currentFields = configFields[type] || []

  return (
    <div className={`imagebed-dialog-overlay ${theme}`} onClick={onClose}>
      <div className="imagebed-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h3>{isEditing ? '编辑图床' : '添加新图床'}</h3>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="dialog-body">
          <div className="form-group">
            <label>图床名称</label>
            <input
              type="text"
              placeholder="例如：我的 GitHub"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>图床类型</label>
            {isEditing ? (
              <div className="type-display">
                {imagebedTypes.find(t => t.value === type)?.label || type}
              </div>
            ) : (
              <div className="type-selector">
                {imagebedTypes.map(t => (
                  <button
                    key={t.value}
                    className={`type-option ${type === t.value ? 'active' : ''}`}
                    onClick={() => {
                      setType(t.value)
                      setConfig({})
                    }}
                    title={t.description}
                  >
                    <span className="type-label">{t.label}</span>
                    <span className="type-desc">{t.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {currentFields.length > 0 && (
            <div className="config-fields">
              <h4>配置信息</h4>
              {currentFields.map(field => (
                <div key={field.key} className="form-group">
                  <label>
                    {field.label}
                    {field.required && <span className="required">*</span>}
                  </label>
                  {field.type === 'repo-list' ? (
                    <div className="repo-list-field">
                      {repoList.map((repo, index) => (
                        <div key={index} className="repo-list-item">
                          <input
                            type="text"
                            placeholder={`仓库名 ${index + 1}，例如：img${index}`}
                            value={repo}
                            onChange={(e) => handleRepoChange(index, e.target.value)}
                          />
                          {repoList.length > 1 && (
                            <button
                              className="repo-remove-btn"
                              onClick={() => handleRemoveRepo(index)}
                              title="删除此仓库"
                              type="button"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        className="repo-add-btn"
                        onClick={handleAddRepo}
                        type="button"
                      >
                        <Plus size={15} />
                        添加仓库
                      </button>
                      {repoList.filter(r => r.trim()).length > 1 && (
                        <p className="repo-list-hint">已配置 {repoList.filter(r => r.trim()).length} 个仓库，上传时自动轮询</p>
                      )}
                    </div>
                  ) : field.type === 'select' ? (
                    <AnimatedSelect
                      value={config[field.key] || field.defaultValue || ''}
                      onChange={(value) => handleConfigChange(field.key, value)}
                      options={field.options?.map(opt => ({ value: opt.value, label: opt.label })) || []}
                      wrapperClassName="form-select-control"
                    />
                  ) : field.type === 'password' ? (
                    <div className="form-input-with-icon">
                      <input
                        type={visibleSecrets[field.key] ? 'text' : 'password'}
                        placeholder={field.placeholder || field.label}
                        value={config[field.key] ?? field.defaultValue ?? ''}
                        onChange={(e) => handleConfigChange(field.key, e.target.value)}
                      />
                      <button
                        type="button"
                        className="form-icon-btn"
                        onClick={() => toggleSecretVisibility(field.key)}
                        title={visibleSecrets[field.key] ? '隐藏' : '显示'}
                      >
                        {visibleSecrets[field.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      placeholder={field.placeholder || field.label}
                      value={config[field.key] ?? field.defaultValue ?? ''}
                      onChange={(e) => handleConfigChange(field.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* GitHub 配置帮助 */}
          {type === 'github' && (
            <div className="github-help-section">
              <button
                className={`github-help-toggle ${helpExpanded ? 'open' : ''}`}
                onClick={() => setHelpExpanded(prev => !prev)}
                type="button"
              >
                <span>如何配置 GitHub 图床？</span>
                <span className={`help-arrow ${helpExpanded ? 'expanded' : ''}`}>▶</span>
              </button>
              {helpExpanded && (
                <div className="github-help-content">
                  <ol>
                    <li>登录 <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>，创建一个<strong>公开仓库</strong>（如 <code>img0</code>）用于存储图片。</li>
                    <li>前往 <a href="https://github.com/settings/tokens/new" target="_blank" rel="noreferrer">Settings → Developer settings → Personal access tokens</a>，生成一个 Token，勾选 <code>repo</code> 权限。</li>
                    <li>填写<strong>GitHub 用户名</strong>（如 <code>tingwen-img</code>）和<strong>仓库名</strong>（如 <code>img0</code>）。</li>
                    <li><strong>分支</strong>：填写仓库的默认分支名，通常为 <code>main</code> 或 <code>master</code>，可在仓库主页查看。</li>
                    <li><strong>存储路径</strong>：图片在仓库中的存储目录，例如填 <code>images/</code> 表示存放在仓库根目录的 images 文件夹下，留空或填 <code>/</code> 则存放在根目录。</li>
                    <li>如需<strong>轮询多仓库</strong>，点击「添加仓库」添加更多仓库名（如 <code>img1</code>、<code>img2</code>），上传时自动轮流使用。</li>
                    <li><strong>CDN 加速域名</strong>推荐选择 jsDelivr，国内访问速度快。</li>
                    <li>点击「测试连接」验证配置是否正确，再保存。</li>
                  </ol>
                  <p className="help-note">💡 免费仓库单文件不超过 100MB，单仓库建议不超过 1GB，使用多仓库轮询可分散存储压力。</p>
                  <p className="help-warning">⚠️ <strong>隐私警告：</strong>GitHub 公开仓库中的所有文件均可被任何人访问和下载，请勿上传包含个人隐私、敏感信息或版权内容的图片！</p>
                </div>
              )}
            </div>
          )}

          {/* 七牛云配置帮助 */}
          {type === 'qiniu' && (
            <div className="github-help-section">
              <button
                className={`github-help-toggle ${qiniuHelpExpanded ? 'open' : ''}`}
                onClick={() => setQiniuHelpExpanded(prev => !prev)}
                type="button"
              >
                <span>如何配置七牛云图床？</span>
                <span className={`help-arrow ${qiniuHelpExpanded ? 'expanded' : ''}`}>▶</span>
              </button>
              {qiniuHelpExpanded && (
                <div className="github-help-content">
                  <ol>
                    <li>登录 <a href="https://portal.qiniu.com/kodo/bucket" target="_blank" rel="noreferrer">七牛云 Kodo 控制台</a>，创建 Bucket（建议公开空间，便于直接访问图片）。</li>
                    <li>前往 <a href="https://portal.qiniu.com/user/key" target="_blank" rel="noreferrer">个人中心 → 密钥管理</a> 获取 <code>AccessKey</code> 与 <code>SecretKey</code>。</li>
                    <li><strong>Bucket</strong>：填写你创建的空间名。</li>
                    <li><strong>域名</strong>：填写空间绑定的访问域名（建议完整填写 <code>https://...</code>）。</li>
                    <li><strong>区域</strong>：选择 Bucket 所在区域（例如华东-浙江为 <code>z0</code>）。</li>
                    <li><strong>上传目录</strong>：可选，填写如 <code>images/</code> 或 <code>md-editor/</code>，用于归档文件；留空则传到根目录。</li>
                    <li>点击「测试连接」验证配置，成功后再保存。</li>
                  </ol>
                  <p className="help-note">💡 上传凭证由服务端动态生成（SDK 标准做法），凭证有效期默认 1 小时，可按需求调整。</p>
                  <p className="help-note">📘 官方文档：<a href="https://developer.qiniu.com/kodo/1289/nodejs" target="_blank" rel="noreferrer">七牛云 Node.js SDK</a></p>
                  <p className="help-warning">⚠️ <strong>安全提醒：</strong>请勿在前端暴露 AK/SK。建议使用子账号并最小权限授权；公共空间文件可被任何人访问，请勿上传隐私内容。</p>
                </div>
              )}
            </div>
          )}

          {/* 阿里云 OSS 配置帮助 */}
          {type === 'aliyun' && (
            <div className="github-help-section">
              <button
                className={`github-help-toggle ${aliyunHelpExpanded ? 'open' : ''}`}
                onClick={() => setAliyunHelpExpanded(prev => !prev)}
                type="button"
              >
                <span>如何配置阿里云 OSS 图床？</span>
                <span className={`help-arrow ${aliyunHelpExpanded ? 'expanded' : ''}`}>▶</span>
              </button>
              {aliyunHelpExpanded && (
                <div className="github-help-content">
                  <ol>
                    <li>登录 <a href="https://oss.console.aliyun.com" target="_blank" rel="noreferrer">阿里云 OSS 控制台</a>，创建一个 Bucket，权限设置为<strong>公共读</strong>。</li>
                    <li><strong>区域</strong>：填写 Bucket 所在地域的 Endpoint 前缀，例如杭州填 <code>oss-cn-hangzhou</code>，上海填 <code>oss-cn-shanghai</code>。可在 OSS 控制台 → Bucket → 概览中查看。</li>
                    <li>前往 <a href="https://ram.console.aliyun.com/manage/ak" target="_blank" rel="noreferrer">访问控制 → AccessKey 管理</a>，创建 AccessKey，获取 <code>Access Key ID</code> 和 <code>Access Key Secret</code>。</li>
                    <li><strong>Bucket</strong>：填写你创建的 Bucket 名称。</li>
                    <li><strong>上传目录</strong>：可选，填写例如 <code>images/</code> 或 <code>md-editor/</code>，用于统一归档上传文件；留空则存到根目录。</li>
                    <li><strong>域名（可选）</strong>：如绑定了自定义域名，填写完整域名（如 <code>https://img.example.com</code>）；不填则使用阿里云默认域名。</li>
                    <li>点击「测试连接」验证配置是否正确，再保存。</li>
                  </ol>
                  <p className="help-note">💡 建议为 OSS 操作单独创建 RAM 子账号并仅授予 <code>oss:PutObject</code>、<code>oss:DeleteObject</code> 等必要权限，避免使用主账号 AccessKey。</p>
                  <p className="help-warning">⚠️ <strong>费用提醒：</strong>阿里云 OSS 按存储量和流量计费，请留意用量，避免产生意外费用。公共读 Bucket 中的文件任何人均可访问，请勿上传隐私文件。</p>
                </div>
              )}
            </div>
          )}

          {/* 腾讯云 COS 配置帮助 */}
          {type === 'tencent' && (
            <div className="github-help-section">
              <button
                className={`github-help-toggle ${tencentHelpExpanded ? 'open' : ''}`}
                onClick={() => setTencentHelpExpanded(prev => !prev)}
                type="button"
              >
                <span>如何配置腾讯云 COS 图床？</span>
                <span className={`help-arrow ${tencentHelpExpanded ? 'expanded' : ''}`}>▶</span>
              </button>
              {tencentHelpExpanded && (
                <div className="github-help-content">
                  <ol>
                    <li>登录 <a href="https://console.cloud.tencent.com/cos" target="_blank" rel="noreferrer">腾讯云 COS 控制台</a>，创建一个存储桶，权限建议设置为<strong>公有读私有写</strong>。</li>
                    <li><strong>区域</strong>：填写存储桶所在地域的地域标识，例如北京为 <code>ap-beijing</code>，上海为 <code>ap-shanghai</code>。可在 COS 控制台 → 存储桶详情中查看。</li>
                    <li>前往 <a href="https://console.cloud.tencent.com/cam/capi" target="_blank" rel="noreferrer">访问管理 → API 密钥管理</a>，创建或查看 SecretId 与 SecretKey。</li>
                    <li><strong>Secret ID</strong> / <strong>Secret Key</strong>：填写上一步获取的密钥信息。</li>
                    <li><strong>Bucket</strong>：填写存储桶名称（格式如 <code>my-bucket-1234567890</code>）。</li>
                    <li><strong>域名（可选）</strong>：如已绑定自定义域名，填写完整域名（如 <code>https://img.example.com</code>）；不填则使用 COS 默认域名。</li>
                    <li>点击「测试连接」验证配置是否正确，再保存。</li>
                  </ol>
                  <p className="help-note">💡 建议为 COS 操作创建子账号并仅授予 <code>cos:PutObject</code>、<code>cos:DeleteObject</code> 等必要权限，避免使用主账号密钥。</p>
                  <p className="help-warning">⚠️ <strong>费用提醒：</strong>腾讯云 COS 按存储量和流量计费，请留意用量。公有读存储桶中的文件任何人均可访问，请勿上传隐私文件。</p>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="dialog-footer">
          <div className="footer-left">
            {testResult && (
              <span className={`test-result ${testResult.success ? 'success' : 'error'}`}>
                {testResult.message}
              </span>
            )}
          </div>
          <div className="footer-right">
            <button className="cancel-btn" onClick={onClose}>
              取消
            </button>
            <button
              className="test-btn"
              onClick={handleTest}
              disabled={saving || testing}
            >
              {testing ? '测试中...' : '测试连接'}
            </button>
            <button
              className="save-btn"
              onClick={handleSave}
              disabled={saving || testing}
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddImagebedDialog
