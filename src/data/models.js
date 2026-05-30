import { ref, computed } from 'vue'

export const TYPE_LABELS = {
  chat: '对话',
  image: '图像',
  video: '视频',
  audio: '音频',
}

export const TYPE_GROUP_TITLES = {
  chat: '对话模型',
  image: '图像模型',
  video: '视频模型',
  audio: '音频模型',
}

/** 模型管理统一数据源（控制台模型管理与创作台共用） */
export const managedModels = ref([
  {
    id: 1,
    name: 'GPT-4o',
    type: 'chat',
    typeLabel: '对话',
    provider: 'OpenAI',
    price: '¥0.03/1K',
    priceUnit: 0.03,
    desc: '最强通用对话模型，支持多模态理解',
    context: '128K',
    enabled: true,
    online: true,
    hot: true,
    gradient: 'linear-gradient(135deg, #1f3a1a, #0f1f0d)',
  },
  {
    id: 2,
    name: 'Claude 3.5 Sonnet',
    type: 'chat',
    typeLabel: '对话',
    provider: 'Anthropic',
    price: '¥0.02/1K',
    priceUnit: 0.02,
    desc: '长文本理解与复杂推理',
    context: '200K',
    enabled: true,
    online: true,
    hot: true,
    gradient: 'linear-gradient(135deg, #3a1f1a, #1f0f0d)',
  },
  {
    id: 3,
    name: 'Gemini 2.0 Flash',
    type: 'chat',
    typeLabel: '对话',
    provider: 'Google',
    price: '¥0.01/1K',
    priceUnit: 0.01,
    desc: '快速响应的多模态对话模型',
    context: '1M',
    enabled: true,
    online: true,
    hot: false,
    gradient: 'linear-gradient(135deg, #1a2a3a, #0d151f)',
  },
  {
    id: 4,
    name: 'DALL·E 3',
    type: 'image',
    typeLabel: '图像',
    provider: 'OpenAI',
    price: '¥0.08/张',
    priceUnit: 0.08,
    desc: '高质量 AI 图像生成',
    context: '1024px',
    enabled: true,
    online: true,
    hot: false,
    gradient: 'linear-gradient(135deg, #1a3a3a, #0d1f1f)',
  },
  {
    id: 5,
    name: 'Sora',
    type: 'video',
    typeLabel: '视频',
    provider: 'OpenAI',
    price: '¥0.5/秒',
    priceUnit: 0.5,
    desc: '文本生成高质量视频',
    context: '1080p',
    enabled: false,
    online: true,
    hot: true,
    gradient: 'linear-gradient(135deg, #2a3a1a, #151f0d)',
  },
  {
    id: 6,
    name: 'Whisper',
    type: 'audio',
    typeLabel: '音频',
    provider: 'OpenAI',
    price: '¥0.006/分',
    priceUnit: 0.006,
    desc: '高精度语音转文字',
    context: '-',
    enabled: true,
    online: false,
    hot: false,
    gradient: 'linear-gradient(135deg, #2a1a3a, #150d1f)',
  },
  {
    id: 7,
    name: 'Kling 2.0',
    type: 'video',
    typeLabel: '视频',
    provider: 'Kuaishou',
    price: '¥0.3/秒',
    priceUnit: 0.3,
    desc: '高质量视频生成，运动自然流畅',
    context: '1080p',
    enabled: true,
    online: true,
    hot: true,
    gradient: 'linear-gradient(135deg, #1a1a3a, #0d0d1f)',
  },
  {
    id: 8,
    name: 'Midjourney v6',
    type: 'image',
    typeLabel: '图像',
    provider: 'Midjourney',
    price: '¥0.06/张',
    priceUnit: 0.06,
    desc: '艺术风格图像生成',
    context: '1024px',
    enabled: true,
    online: true,
    hot: true,
    gradient: 'linear-gradient(135deg, #3a2a1a, #1f150d)',
  },
])

const MODE_TYPE_MAP = {
  chat: 'chat',
  image: 'image',
  video: 'video',
}

/** 创作台可用模型：已启用且在线 */
export function getAvailableModels(type) {
  return managedModels.value.filter(m => m.type === type && m.enabled && m.online)
}

/** 按类型分组供创作台选择 */
export function getStudioModelGroups(mode) {
  const type = MODE_TYPE_MAP[mode]
  if (!type) return []

  const models = getAvailableModels(type)
  if (!models.length) return []

  return [{
    title: TYPE_GROUP_TITLES[type],
    models,
  }]
}

/** 公开模型列表页数据（由模型管理派生） */
export const publicModels = computed(() =>
  managedModels.value
    .filter(m => m.enabled)
    .map(m => ({
      name: m.name,
      provider: m.provider,
      type: m.typeLabel,
      typeKey: m.type,
      context: m.context,
      price: m.price,
      desc: m.desc,
      hot: m.hot,
      online: m.online,
    }))
)

export function getModelSpecs(model) {
  const specs = []
  if (model.context && model.context !== '-') specs.push(model.context)
  specs.push(model.price)
  return specs
}

export function estimateModelCost(model, mode, quantity = 1) {
  const multipliers = { chat: 1, image: 10, video: 100 }
  const base = model.priceUnit ?? 0.1
  return (base * (multipliers[mode] ?? 1) * quantity).toFixed(2)
}
