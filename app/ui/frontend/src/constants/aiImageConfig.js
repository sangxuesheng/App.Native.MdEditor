// AI 文生图配置常量
// 服务商与 AI 对话保持一致，每家仅保留文生图模型

// 文生图模型 ID 特征（用于从 /v1/models 拉取结果中区分对话模型与图片模型）
const IMAGE_MODEL_PATTERNS = [
  /flux/i, /kolors/i, /dall-e/i, /wanx/i, /cogview/i, /black-forest/i,
  /schnell/i, /qwen-image/i, /stable-diffusion/i, /seedream/i,
  /flux\.1/i, /flux-1/i, /image-edit/i,
  /wan2\.6|wan2\.5|wan2\.2|z-image/i,
]

export function isImageModel(modelId) {
  if (!modelId || typeof modelId !== 'string') return false
  return IMAGE_MODEL_PATTERNS.some((p) => p.test(modelId))
}

const DEFAULT_SIZES = ['1024x1024', '768x768', '512x512', '1024x768', '768x1024', '1280x720', '720x1280']

export const SIZE_LABELS = {
  '1024x1024': '正方形 (1024×1024)',
  '512x512': '小图 (512×512)',
  '768x768': '中图 (768×768)',
  '1024x768': '横版 4:3 (1024×768)',
  '768x1024': '竖版 4:3 (768×1024)',
  '1280x720': '横版 16:9 (1280×720)',
  '720x1280': '竖版 16:9 (720×1280)',
  '1920x1080': '全高清横版 (1920×1080)',
  '1080x1920': '全高清竖版 (1080×1920)',
  '1024x1792': '竖版 (1024×1792)',
  '1792x1024': '横版 (1792×1024)',
  '256x256': '缩略图 (256×256)',
}

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
    models: [], // 在线拉取，不默认配置
    sizes: ['1024x1024', '1024x1792', '1792x1024', '512x512', '256x256'],
  },
  {
    value: 'qwen',
    label: '通义千问',
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    needsApiKey: true,
    models: [], // 在线拉取，不默认配置
    sizes: DEFAULT_SIZES,
  },
  {
    value: 'aliyun-bailian',
    label: '阿里云百炼',
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    needsApiKey: true,
    models: ['wan2.6-t2i', 'wan2.5-t2i-preview', 'z-image-turbo'],
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
    models: [], // 在线拉取，不默认配置
    sizes: DEFAULT_SIZES,
  },
  {
    value: 'siliconflow',
    label: '硅基流动',
    endpoint: 'https://api.siliconflow.cn/v1',
    needsApiKey: true,
    models: [], // 在线拉取，不默认配置
    sizes: DEFAULT_SIZES,
  },
  {
    value: '302ai',
    label: '302.AI',
    endpoint: 'https://api.302.ai/v1',
    needsApiKey: true,
    models: [], // 在线拉取，不默认配置
    sizes: ['1024x1024', '1024x1792', '1792x1024', '512x512', '256x256'],
  },
  {
    value: 'zhipu',
    label: '智谱 AI',
    endpoint: 'https://open.bigmodel.cn/api/paas/v4',
    needsApiKey: true,
    models: [], // 在线拉取，不默认配置
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
    models: [], // 在线拉取，不默认配置
    sizes: [...DEFAULT_SIZES, '1920x1080', '1080x1920', '1024x1792', '1792x1024', '256x256'],
  },
]

export const DEFAULT_IMAGE_CONFIG = {
  type: 'builtin',
  endpoint: 'https://proxy-ai.doocs.org/v1',
  apiKey: '',
  model: 'Kwai-Kolors/Kolors',
  size: '1024x1024',
  customModels: {}, // 各服务商自定义模型 { [serviceType]: string[] }，每项为模型 ID
  customModelLabels: {}, // 自定义模型展示名称 { [serviceType]: { [modelId]: string } }，创建后可修改展示名
  verifiedImageModelsByService: {}, // 各服务商已启用的文生图模型 { [serviceType]: string[] }，与对话的 verifiedModelsByService 一致
}
