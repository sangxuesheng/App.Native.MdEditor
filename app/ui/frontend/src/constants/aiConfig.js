// AI 配置常量

/** 服务商分类（侧栏展示顺序：国内 → 云算力 → 海外 → 部署 → 聚合 → 垂类 → 其他） */
export const AI_SERVICE_CATEGORIES = [
  {
    id: 'chinaGeneral',
    label: '国内通用大模型',
    values: [
      'deepseek', 'moonshot', 'aliyun-bailian', 'wenxin', 'tencent-cloud',
      'hunyuan', 'zhipu', 'siliconflow', 'yi', 'spark', 'sensenova',
      'stepfun', 'baichuan', 'doubao', 'minimax', 'internlm', '360ai',
      'taichu', 'jina', 'doubao-ai',
    ],
  },
  {
    id: 'cloudCompute',
    label: 'AI算力/云服务',
    values: ['azure-ai', 'bedrock', 'cloudflare', 'nvidia', 'nebius', 'qiniu'],
  },
  {
    id: 'overseasGeneral',
    label: '海外通用大模型',
    values: [
      'openai', 'azure-openai', 'anthropic', 'google', 'vertex-ai',
      'mistral', 'perplexity', 'xai', 'cohere', 'ai21labs',
      'upstage', 'groq', 'fireworks', 'together', 'sambanova', 'cerebras',
    ],
  },
  {
    id: 'deploymentPlatform',
    label: '模型部署/推理平台',
    values: ['ollama', 'ollama-cloud', 'vllm', 'xinference', 'lmstudio', 'higress'],
  },
  {
    id: 'modelAggregation',
    label: '模型聚合/中转',
    values: ['builtin', 'aihubmix', 'openrouter', 'search1api', 'infiniai', 'akashchat', 'cometapi', 'vercel-ai'],
  },
  {
    id: 'verticalTool',
    label: '垂类/工具型AI',
    values: ['comfyui', 'fal', 'huggingface', 'bfl', 'novita', 'ppio', 'modelscope', 'vercel-v0', 'gitee-ai'],
  },
  {
    id: 'other',
    label: '其他',
    values: ['302ai', 'github', 'newapi', 'custom'],
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
    value: 'deepseek',
    label: 'DeepSeek',
    endpoint: 'https://api.deepseek.com/v1',
    needsApiKey: true,
    helpUrl: 'https://api-docs.deepseek.com/zh-cn/',
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
    value: 'azure-openai',
    label: 'Azure OpenAI',
    endpoint: 'https://your-resource.openai.azure.com/openai/deployments/your-deployment',
    needsApiKey: true,
    helpUrl: 'https://learn.microsoft.com/zh-cn/azure/ai-services/openai/',
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'anthropic',
    label: 'Anthropic',
    endpoint: 'https://api.anthropic.com/v1',
    needsApiKey: true,
    helpUrl: 'https://docs.anthropic.com/',
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'google',
    label: 'Google',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta',
    needsApiKey: true,
    helpUrl: 'https://ai.google.dev/docs',
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'vertex-ai',
    label: 'Vertex AI',
    endpoint: 'https://us-central1-aiplatform.googleapis.com/v1/projects',
    needsApiKey: true,
    helpUrl: 'https://cloud.google.com/vertex-ai/docs',
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'mistral',
    label: 'Mistral',
    endpoint: 'https://api.mistral.ai/v1',
    needsApiKey: true,
    helpUrl: 'https://docs.mistral.ai/',
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'perplexity',
    label: 'Perplexity',
    endpoint: 'https://api.perplexity.ai',
    needsApiKey: true,
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'xai',
    label: 'xAI (Grok)',
    endpoint: 'https://api.x.ai/v1',
    needsApiKey: true,
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'cohere',
    label: 'Cohere',
    endpoint: 'https://api.cohere.ai/v1',
    needsApiKey: true,
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'ai21labs',
    label: 'Ai21Labs',
    endpoint: 'https://api.ai21.com/studio/v1',
    needsApiKey: true,
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'upstage',
    label: 'Upstage',
    endpoint: 'https://api.upstage.ai/v1/solar',
    needsApiKey: true,
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'groq',
    label: 'Groq',
    endpoint: 'https://api.groq.com/openai/v1',
    needsApiKey: true,
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'fireworks',
    label: 'Fireworks AI',
    endpoint: 'https://api.fireworks.ai/inference/v1',
    needsApiKey: true,
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'together',
    label: 'Together AI',
    endpoint: 'https://api.together.xyz/v1',
    needsApiKey: true,
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'sambanova',
    label: 'SambaNova',
    endpoint: 'https://api.sambanova.ai/v1',
    needsApiKey: true,
    models: [],
  },
  {
    value: 'cerebras',
    label: 'Cerebras',
    endpoint: 'https://api.cerebras.ai/v1',
    needsApiKey: true,
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'qwen',
    label: '通义千问',
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    needsApiKey: true,
    helpUrl: 'https://help.aliyun.com/zh/dashscope/',
    models: [], // 在线拉取，不默认配置
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
    value: 'doubao',
    label: '火山方舟（豆包）',
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3',
    needsApiKey: true,
    helpUrl: 'https://www.volcengine.com/docs/82379',
    modelHint: 'model 需填写推理接入点 ID（ep-xxxx），在火山方舟控制台创建接入点后获取',
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'doubao-ai',
    label: '豆包 AI',
    endpoint: 'https://api.doubao-ai.com/v1',
    needsApiKey: true,
    helpUrl: 'https://www.volcengine.com/docs/82379',
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
    value: '302ai',
    label: '302.AI',
    endpoint: 'https://api.302.ai/v1',
    needsApiKey: true,
    helpUrl: 'https://302.ai/',
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
    value: 'baichuan',
    label: '百川智能',
    endpoint: 'https://api.baichuan-ai.com/v1',
    needsApiKey: true,
    helpUrl: 'https://platform.baichuan-ai.com/docs',
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'yi',
    label: '零一万物',
    endpoint: 'https://api.lingyiwanwu.com/v1',
    needsApiKey: true,
    helpUrl: 'https://platform.lingyiwanwu.com/docs',
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
    label: 'Wenxin',
    endpoint: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop',
    needsApiKey: true,
    helpUrl: 'https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html',
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'tencent-cloud',
    label: 'TencentCloud',
    endpoint: 'https://api.hunyuan.cloud.tencent.com/v1',
    needsApiKey: true,
    helpUrl: 'https://cloud.tencent.com/document/product/1729',
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'spark',
    label: 'Spark',
    endpoint: 'https://spark-api.xf-yun.com/v1',
    needsApiKey: true,
    helpUrl: 'https://www.xfyun.cn/doc/spark/Web.html',
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'sensenova',
    label: 'SenseNova',
    endpoint: 'https://api.sensenova.cn/v1/llm',
    needsApiKey: true,
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'stepfun',
    label: 'Stepfun',
    endpoint: 'https://api.stepfun.com/v1',
    needsApiKey: true,
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'minimax',
    label: 'MiniMax',
    endpoint: 'https://api.minimax.chat/v1',
    needsApiKey: true,
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'internlm',
    label: 'InternLM',
    endpoint: 'https://openapi.internlm.ai/v1',
    needsApiKey: true,
    models: [], // 在线拉取，不默认配置
  },
  {
    value: '360ai',
    label: '360 AI',
    endpoint: 'https://api.360.cn/v1',
    needsApiKey: true,
    models: [],
  },
  {
    value: 'taichu',
    label: 'Taichu',
    endpoint: 'https://api.taichu.zone/v1',
    needsApiKey: true,
    models: [],
  },
  {
    value: 'jina',
    label: 'Jina AI',
    endpoint: 'https://api.jina.ai/v1',
    needsApiKey: true,
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'qianfan',
    label: '百度千帆',
    endpoint: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop',
    needsApiKey: true,
    helpUrl: 'https://cloud.baidu.com/doc/WENXINWORKSHOP/index.html',
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
    value: 'ollama-cloud',
    label: 'Ollama Cloud',
    endpoint: 'https://api.ollama.com/v1',
    needsApiKey: true,
    models: [],
  },
  {
    value: 'vllm',
    label: 'vLLM',
    endpoint: '',
    needsApiKey: false,
    models: [],
  },
  {
    value: 'xinference',
    label: 'Xinference',
    endpoint: 'http://localhost:9997/v1',
    needsApiKey: false,
    models: [],
  },
  {
    value: 'lmstudio',
    label: 'LM Studio',
    endpoint: 'http://localhost:1234/v1',
    needsApiKey: false,
    models: [],
  },
  {
    value: 'higress',
    label: 'Higress',
    endpoint: '',
    needsApiKey: true,
    models: [],
  },
  {
    value: 'azure-ai',
    label: 'Azure AI',
    endpoint: 'https://your-resource.cognitiveservices.azure.com/openai/deployments',
    needsApiKey: true,
    models: [],
  },
  {
    value: 'bedrock',
    label: 'Bedrock',
    endpoint: 'https://bedrock-runtime.us-east-1.amazonaws.com',
    needsApiKey: true,
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'cloudflare',
    label: 'Cloudflare Workers AI',
    endpoint: 'https://api.cloudflare.com/client/v4/accounts',
    needsApiKey: true,
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'nvidia',
    label: 'Nvidia',
    endpoint: 'https://integrate.api.nvidia.com/v1',
    needsApiKey: true,
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'nebius',
    label: 'Nebius',
    endpoint: 'https://api.nebius.ai/v1',
    needsApiKey: true,
    models: [],
  },
  {
    value: 'qiniu',
    label: 'Qiniu',
    endpoint: 'https://ai.qiniuapi.com/v1',
    needsApiKey: true,
    models: [],
  },
  {
    value: 'aihubmix',
    label: 'AiHubMix',
    endpoint: 'https://api.aihubmix.com/v1',
    needsApiKey: true,
    models: [],
  },
  {
    value: 'openrouter',
    label: 'OpenRouter',
    endpoint: 'https://openrouter.ai/api/v1',
    needsApiKey: true,
    helpUrl: 'https://openrouter.ai/docs',
    models: [], // 在线拉取，不默认配置
  },
  {
    value: 'search1api',
    label: 'Search1API',
    endpoint: 'https://api.search1api.com/v1',
    needsApiKey: true,
    models: [],
  },
  {
    value: 'infiniai',
    label: 'InfiniAI',
    endpoint: 'https://api.infini.ai/v1',
    needsApiKey: true,
    models: [],
  },
  {
    value: 'akashchat',
    label: 'AkashChat',
    endpoint: 'https://api.akashchat.com/v1',
    needsApiKey: true,
    models: [],
  },
  {
    value: 'cometapi',
    label: 'CometAPI',
    endpoint: 'https://api.cometapi.com/v1',
    needsApiKey: true,
    models: [],
  },
  {
    value: 'vercel-ai',
    label: 'Vercel AI Gateway',
    endpoint: 'https://api.vercel.com/v1',
    needsApiKey: true,
    models: [],
  },
  {
    value: 'comfyui',
    label: 'ComfyUI',
    endpoint: '',
    needsApiKey: false,
    models: [],
  },
  {
    value: 'fal',
    label: 'Fal',
    endpoint: 'https://api.fal.ai/v1',
    needsApiKey: true,
    models: [],
  },
  {
    value: 'huggingface',
    label: 'HuggingFace',
    endpoint: 'https://api-inference.huggingface.co',
    needsApiKey: true,
    models: [],
  },
  {
    value: 'bfl',
    label: 'Black Forest Labs',
    endpoint: 'https://api.blackforestlabs.ai/v1',
    needsApiKey: true,
    models: [],
  },
  {
    value: 'novita',
    label: 'Novita',
    endpoint: 'https://api.novita.ai/v1',
    needsApiKey: true,
    models: [],
  },
  {
    value: 'ppio',
    label: 'PPIO',
    endpoint: 'https://api.ppio.ai/v1',
    needsApiKey: true,
    models: [],
  },
  {
    value: 'modelscope',
    label: 'ModelScope',
    endpoint: 'https://api.modelscope.cn/v1',
    needsApiKey: true,
    models: [],
  },
  {
    value: 'vercel-v0',
    label: 'Vercel (v0)',
    endpoint: 'https://api.vercel.com/v0',
    needsApiKey: true,
    models: [],
  },
  {
    value: 'gitee-ai',
    label: 'Gitee AI',
    endpoint: 'https://api.gitee.com/ai/v1',
    needsApiKey: true,
    models: [],
  },
  {
    value: 'github',
    label: 'GitHub',
    endpoint: 'https://api.github.com/copilot/v1',
    needsApiKey: true,
    models: [],
  },
  {
    value: 'newapi',
    label: 'New API',
    endpoint: '',
    needsApiKey: true,
    models: [],
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
  openai: ['gpt-4o-mini', 'gpt-3.5-turbo', 'gpt-4o'],
  'azure-openai': ['gpt-4o-mini', 'gpt-35-turbo'],
  anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
  google: ['gemini-1.5-flash', 'gemini-pro'],
  mistral: ['mistral-small-latest', 'open-mistral-7b'],
  groq: ['llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
  qwen: ['qwen-turbo', 'qwen-plus'],
  hunyuan: ['hunyuan-lite', 'hunyuan-standard'],
  doubao: ['doubao-pro-32k', 'doubao-lite-32k'],
  'doubao-ai': ['doubao-pro-32k', 'doubao-lite-32k'],
  siliconflow: ['Qwen/Qwen2.5-7B-Instruct', 'deepseek-ai/DeepSeek-V2.5'],
  '302ai': ['gpt-4o-mini', 'deepseek-chat'],
  zhipu: ['glm-4-flash', 'glm-4'],
  baichuan: ['Baichuan2-Turbo', 'Baichuan2-53B'],
  yi: ['yi-light', 'yi-medium'],
  moonshot: ['moonshot-v1-8k', 'moonshot-v1-32k'],
  'aliyun-bailian': ['qwen-turbo', 'qwen-plus'],
  ollama: ['llama3.2', 'qwen2.5:7b'],
  'ollama-cloud': ['llama3.2', 'qwen2.5:7b'],
  openrouter: ['openai/gpt-4o-mini', 'anthropic/claude-3-haiku'],
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
  disabledProviders: [], // 被全局关闭的服务商 type 列表，侧栏「已启用」会排除这些
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
