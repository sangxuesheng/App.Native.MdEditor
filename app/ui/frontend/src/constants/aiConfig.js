// AI 配置常量
export const AI_SERVICES = [
  {
    value: 'default',
    label: '内置服务（免费）',
    endpoint: 'https://proxy-ai.doocs.org/v1',
    needsApiKey: false,
    models: [
      'Qwen/Qwen2.5-7B-Instruct',
      'Qwen/Qwen2.5-Coder-7B-Instruct',
      'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
      'THUDM/GLM-Z1-9B-0414',
      'internlm/internlm2_5-7b-chat',
      'qwen/qwen3-30b-a3b:free',
      'qwen/qwen3-235b-a22b:free',
      'thudm/glm-z1-32b:free',
      'deepseek/deepseek-v3-base:free',
    ],
  },
  {
    value: 'openai',
    label: 'OpenAI',
    endpoint: 'https://api.openai.com/v1',
    needsApiKey: true,
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  },
  {
    value: 'deepseek',
    label: 'DeepSeek',
    endpoint: 'https://api.deepseek.com/v1',
    needsApiKey: true,
    models: ['deepseek-chat', 'deepseek-reasoner'],
  },
  {
    value: 'qwen',
    label: '通义千问',
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    needsApiKey: true,
    models: [
      'qwen-max',
      'qwen-plus',
      'qwen-turbo',
      'qwen2.5-coder-32b-instruct',
    ],
  },
]

export const DEFAULT_CONFIG = {
  type: 'default',
  endpoint: 'https://proxy-ai.doocs.org/v1',
  apiKey: '',
  model: 'Qwen/Qwen2.5-7B-Instruct',
  temperature: 1,
  maxTokens: 1024,
}

export const DEFAULT_QUICK_COMMANDS = [
  {
    id: 'polish',
    label: '润色',
    icon: '✨',
    template: '请润色以下内容，使其更加流畅、专业：\n\n{{sel}}',
  },
  {
    id: 'translate-en',
    label: '翻译成英文',
    icon: '🌐',
    template: '请将以下内容翻译为英文：\n\n{{sel}}',
  },
  {
    id: 'translate-zh',
    label: '翻译成中文',
    icon: '🇨🇳',
    template: 'Please translate the following content into Chinese:\n\n{{sel}}',
  },
  {
    id: 'summary',
    label: '总结',
    icon: '📝',
    template: '请对以下内容进行总结，提取核心要点：\n\n{{sel}}',
  },
  {
    id: 'expand',
    label: '扩写',
    icon: '📖',
    template: '请扩写以下内容，增加更多细节和说明：\n\n{{sel}}',
  },
  {
    id: 'rewrite',
    label: '改写',
    icon: '🔄',
    template: '请改写以下内容，保持原意但使用不同的表达方式：\n\n{{sel}}',
  },
]
