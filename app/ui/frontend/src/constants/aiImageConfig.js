// AI 文生图配置常量
// 服务商与 AI 对话保持一致，每家仅保留文生图模型
const DEFAULT_SIZES = ['1024x1024', '768x768', '512x512', '1024x768', '768x1024', '1280x720', '720x1280']

export const AI_IMAGE_SERVICES = [
  {
    value: 'builtin',
    label: '内置服务（免费）',
    endpoint: 'https://proxy-ai.doocs.org/v1',
    needsApiKey: false,
    models: ['Kwai-Kolors/Kolors'],
    sizes: DEFAULT_SIZES,
  },
  {
    value: 'deepseek',
    label: 'DeepSeek',
    endpoint: 'https://api.deepseek.com/v1',
    needsApiKey: true,
    models: [], // DeepSeek 暂无文生图 API
    sizes: DEFAULT_SIZES,
  },
  {
    value: 'openai',
    label: 'OpenAI',
    endpoint: 'https://api.openai.com/v1',
    needsApiKey: true,
    models: ['dall-e-3', 'dall-e-2'],
    sizes: ['1024x1024', '1024x1792', '1792x1024', '512x512', '256x256'],
  },
  {
    value: 'qwen',
    label: '通义千问',
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    needsApiKey: true,
    models: ['wanx-v1', 'wanx-sketch-to-image-v1'],
    sizes: DEFAULT_SIZES,
  },
  {
    value: 'hunyuan',
    label: '腾讯混元',
    endpoint: 'https://api.hunyuan.cloud.tencent.com/v1',
    needsApiKey: true,
    models: [], // 混元生图 API 格式不同，暂用自定义
    sizes: DEFAULT_SIZES,
  },
  {
    value: 'doubao',
    label: '火山方舟（豆包）',
    endpoint: 'https://ark.cn-beijing.volces.com/api/v3',
    needsApiKey: true,
    models: [], // Seedream API 格式不同，暂用自定义
    sizes: DEFAULT_SIZES,
  },
  {
    value: 'doubao-ai',
    label: '豆包 AI',
    endpoint: 'https://api.doubao-ai.com/v1',
    needsApiKey: true,
    models: ['default'], // 文生图 API 见 https://doubao-app.com/apidoc/
    sizes: DEFAULT_SIZES,
  },
  {
    value: 'siliconflow',
    label: '硅基流动',
    endpoint: 'https://api.siliconflow.cn/v1',
    needsApiKey: true,
    models: [
      'black-forest-labs/FLUX.1-schnell',
      'black-forest-labs/FLUX.1-dev',
      'black-forest-labs/FLUX-1.1-pro',
    ],
    sizes: DEFAULT_SIZES,
  },
  {
    value: '302ai',
    label: '302.AI',
    endpoint: 'https://api.302.ai/v1',
    needsApiKey: true,
    models: ['dall-e-3', 'dall-e-2'],
    sizes: ['1024x1024', '1024x1792', '1792x1024', '512x512', '256x256'],
  },
  {
    value: 'zhipu',
    label: '智谱 AI',
    endpoint: 'https://open.bigmodel.cn/api/paas/v4',
    needsApiKey: true,
    models: ['cogview-4-250304', 'cogview-4', 'cogview-3-flash'],
    sizes: DEFAULT_SIZES,
  },
  {
    value: 'baichuan',
    label: '百川智能',
    endpoint: 'https://api.baichuan-ai.com/v1',
    needsApiKey: true,
    models: [],
    sizes: DEFAULT_SIZES,
  },
  {
    value: 'yi',
    label: '零一万物',
    endpoint: 'https://api.lingyiwanwu.com/v1',
    needsApiKey: true,
    models: [],
    sizes: DEFAULT_SIZES,
  },
  {
    value: 'moonshot',
    label: '月之暗面（Kimi）',
    endpoint: 'https://api.moonshot.cn/v1',
    needsApiKey: true,
    models: [],
    sizes: DEFAULT_SIZES,
  },
  {
    value: 'qianfan',
    label: '百度千帆',
    endpoint: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop',
    needsApiKey: true,
    models: [],
    sizes: DEFAULT_SIZES,
  },
  {
    value: 'custom',
    label: '自定义（兼容 OpenAI Images API）',
    endpoint: '',
    needsApiKey: true,
    models: ['dall-e-2', 'dall-e-3', 'stable-diffusion'],
    sizes: [...DEFAULT_SIZES, '1920x1080', '1080x1920', '1024x1792', '1792x1024', '256x256'],
  },
]

export const DEFAULT_IMAGE_CONFIG = {
  type: 'builtin',
  endpoint: 'https://proxy-ai.doocs.org/v1',
  apiKey: '',
  model: 'Kwai-Kolors/Kolors',
  size: '1024x1024',
  customModels: {}, // 各服务商自定义模型 { [serviceType]: string[] }
}
