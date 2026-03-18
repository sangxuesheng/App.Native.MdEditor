// AI 配置常量

/** 服务商分类（侧栏展示顺序） */
export const AI_SERVICE_CATEGORIES = [
  {
    id: 'builtin',
    label: '内置',
    values: ['builtin'],
  },
  {
    id: 'chinaGeneral',
    label: '国内通用大模型',
    values: [
      'hunyuan',
      'deepseek',
      'moonshot',
      'aliyun-bailian',
      'wenxin',
      'zhipu',
      'siliconflow',
      'doubao',
    ],
  },
  {
    id: 'overseasGeneral',
    label: '海外通用大模型',
    values: ['openai'],
  },
  {
    id: 'deploymentPlatform',
    label: '本地部署',
    values: ['ollama'],
  },
  {
    id: 'other',
    label: '其他',
    values: ['custom'],
  },
]

export const AI_SERVICES = [
  {
    value: 'builtin',
    label: '内置服务（免费）',
    endpoint: 'https://proxy-ai.doocs.org/v1',
    needsApiKey: false,
    helpUrl: 'https://doocs.org/',
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
    value: 'hunyuan',
    label: '腾讯混元',
    endpoint: 'https://api.hunyuan.cloud.tencent.com/v1',
    needsApiKey: true,
    helpUrl: 'https://cloud.tencent.com/document/product/1729',
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'deepseek',
    label: 'DeepSeek',
    endpoint: 'https://api.deepseek.com/v1',
    needsApiKey: true,
    helpUrl: 'https://api-docs.deepseek.com/zh-cn/',
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'moonshot',
    label: '月之暗面（Kimi）',
    endpoint: 'https://api.moonshot.cn/v1',
    needsApiKey: true,
    helpUrl: 'https://platform.moonshot.cn/docs',
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'aliyun-bailian',
    label: 'Aliyun Bailian',
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    needsApiKey: true,
    helpUrl: 'https://bailian.console.aliyun.com/cn-beijing/?tab=doc#/doc',
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'wenxin',
    label: '百度千帆',
    endpoint: 'https://qianfan.baidubce.com/v2',
    needsApiKey: true,
    helpUrl: 'https://cloud.baidu.com/product-s/qianfan_home',
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'zhipu',
    label: '智谱 AI',
    endpoint: 'https://open.bigmodel.cn/api/paas/v4',
    needsApiKey: true,
    helpUrl: 'https://open.bigmodel.cn/dev/api',
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'siliconflow',
    label: '硅基流动',
    endpoint: 'https://api.siliconflow.cn/v1',
    needsApiKey: true,
    helpUrl: 'https://docs.siliconflow.cn/',
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'doubao',
    label: '火山方舟（豆包）',
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3',
    needsApiKey: true,
    helpUrl: 'https://www.volcengine.com/docs/82379',
    modelHint: 'model 填推理接入点 ID（ep-xxxx）或带日期后缀的模型 ID（如 doubao-pro-32k-241215），在火山方舟控制台创建接入点或从模型广场复制',
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'openai',
    label: 'OpenAI',
    endpoint: 'https://api.openai.com/v1',
    needsApiKey: true,
    helpUrl: 'https://platform.openai.com/docs/api-reference',
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'ollama',
    label: 'Ollama',
    endpoint: 'http://localhost:11434/v1',
    needsApiKey: false,
    helpUrl: 'https://github.com/ollama/ollama/blob/main/docs/api.md',
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'custom',
    label: '自定义（兼容 OpenAI API）',
    endpoint: '',
    needsApiKey: true,
    models: [], // 在线拉取，不默认配置
  },
]

/**
 * 连通性检查时需排除的模型（语音/音频/ASR/embedding 等，不支持纯文本对话）
 * 各家服务商统一应用，与模型拉取过滤规则一致
 */
export const CONNECTIVITY_TEST_EXCLUDED_PATTERNS = [
  /audio/i, /-asr$/i, /embedding/i, /embed/i, /whisper/i, /tts/i, /speech/i, /moderation/i, /transcri/i,
]

/**
 * 连通性检查专用默认模型（与下方模型列表互不互通，仅用于测试 endpoint/apiKey 是否可用）
 * 下方模型列表通过在线拉取获取，此列表为预设，确保未拉取时也能做连通性测试
 */
export const CONNECTIVITY_TEST_DEFAULT_MODELS = {
  builtin: ['Qwen/Qwen2.5-7B-Instruct', 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
  hunyuan: ['hunyuan-lite', 'hunyuan-turbos-latest', 'hunyuan-a13b'],
  moonshot: ['moonshot-v1-8k', 'moonshot-v1-32k'],
  'aliyun-bailian': ['qwen-turbo', 'qwen-plus'],
  wenxin: ['ernie-speed-128k', 'ernie-4.0-8k'],
  zhipu: ['glm-4-flash', 'glm-4'],
  siliconflow: ['Qwen/Qwen2.5-7B-Instruct', 'deepseek-ai/DeepSeek-V2.5'],
  doubao: ['doubao-pro-32k-241215', 'doubao-lite-32k-250115'],
  openai: ['gpt-4o-mini', 'gpt-3.5-turbo', 'gpt-4o'],
  ollama: ['llama3.2', 'qwen2.5:7b'],
  custom: ['gpt-4o-mini', 'gpt-3.5-turbo'],
}

export const DEFAULT_CONFIG = {
  type: 'builtin',
  endpoint: 'https://proxy-ai.doocs.org/v1',
  apiKey: '',
  model: 'Qwen/Qwen2.5-7B-Instruct',
  temperature: 0.6,
  maxTokens: 1536,
  customModels: {}, // 各服务商自定义模型 { [serviceType]: string[] }，每项为模型 ID
  customModelLabels: {}, // 自定义模型展示名称 { [serviceType]: { [modelId]: string } }，创建后可修改展示名
  verifiedModelsByService: {}, // 各服务商已验证可连接的模型 { [serviceType]: string[] }，仅这些会出现在对话栏「切换模型」中
  disabledProviders: AI_SERVICES.filter((s) => s.value !== 'builtin').map((s) => s.value), // 默认仅 builtin 启用，其他需手动开启
  fetchedModelsByService: {}, // 各服务商在线拉取的模型列表 { [serviceType]: string[] }，拉取后保存数据库，后续无需再拉取
}

export const DEFAULT_QUICK_COMMANDS = [
  {
    id: 'polish',
    label: '润色',
    icon: 'Sparkles',
    template: '请润色以下内容，使其更加流畅、专业：\n\n{{sel}}',
  },
  {
    id: 'translate-en',
    label: '翻译成英文',
    icon: 'Languages',
    template: '请将以下内容翻译为英文：\n\n{{sel}}',
  },
  {
    id: 'translate-zh',
    label: '翻译成中文',
    icon: 'Languages',
    template: 'Please translate the following content into Chinese:\n\n{{sel}}',
  },
  {
    id: 'summary',
    label: '总结',
    icon: 'FileText',
    template: '请对以下内容进行总结，提取核心要点：\n\n{{sel}}',
  },
  {
    id: 'expand',
    label: '扩写',
    icon: 'Maximize2',
    template: '请扩写以下内容，增加更多细节和说明：\n\n{{sel}}',
  },
  {
    id: 'rewrite',
    label: '改写',
    icon: 'RefreshCw',
    template: '请改写以下内容，保持原意但使用不同的表达方式：\n\n{{sel}}',
  },
  {
    id: 'write-theme',
    label: '帮我写主题',
    icon: 'Palette',
    template: `请根据本项目的自定义 CSS 主题规范，帮我写一个主题的 CSS 代码。直接输出可用的 CSS，不要用代码块包裹。

【项目规范】必须遵守：
- 使用简写选择器：container、h1-h6、p、strong、link、ul、ol、li、blockquote、codespan、code_pre、hr、image（系统会自动转换为 .markdown-body 选择器）
- 不要使用 #preview-area
- 可用变量：var(--md-primary-color)、var(--blockquote-background)
- 背景相关属性会自动加 !important

【我的需求】（可选，不填则生成简约蓝色主题）
{{sel}}`,
  },
]
