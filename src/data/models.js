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
  audio: '配音模型',
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
  {
    id: 10,
    name: 'Kling 2.1 Standard',
    type: 'video',
    typeLabel: '视频',
    provider: 'Kuaishou',
    price: '¥0.25/秒',
    priceUnit: 0.25,
    desc: '标准版视频生成，速度与质量均衡',
    context: '1080p',
    enabled: true,
    online: true,
    hot: false,
    gradient: 'linear-gradient(135deg, #1a2a3a, #0d151f)',
    previewVideo: '',
  },
  {
    id: 11,
    name: 'Seedance 2.0 Fast',
    type: 'video',
    typeLabel: '视频',
    provider: 'ByteDance',
    price: '¥0.15/秒',
    priceUnit: 0.15,
    desc: '快速视频生成，适合预览与迭代',
    context: '720p',
    enabled: true,
    online: true,
    hot: true,
    gradient: 'linear-gradient(135deg, #3a2a1a, #1f150d)',
    previewVideo: '',
  },
  {
    id: 12,
    name: 'Seedance 2.0',
    type: 'video',
    typeLabel: '视频',
    provider: 'ByteDance',
    price: '¥0.35/秒',
    priceUnit: 0.35,
    desc: '高质量视频生成，细节更丰富',
    context: '1080p',
    enabled: true,
    online: true,
    hot: true,
    gradient: 'linear-gradient(135deg, #2a3a1a, #151f0d)',
    previewVideo: '',
  },
  {
    id: 13,
    name: 'Kling 2.1 Master',
    type: 'video',
    typeLabel: '视频',
    provider: 'Kuaishou',
    price: '¥0.5/秒',
    priceUnit: 0.5,
    desc: '大师版视频生成，电影级画质与运动',
    context: '4K',
    enabled: true,
    online: true,
    hot: true,
    gradient: 'linear-gradient(135deg, #1a1a3a, #0d0d1f)',
    previewVideo: '',
  },
  {
    id: 20,
    name: 'Fish Audio 语音合成',
    type: 'audio',
    typeLabel: '配音',
    provider: 'Fish Audio',
    price: '免费额度',
    priceUnit: 0,
    desc: '高品质文字转语音，每月含免费额度',
    context: 'TTS',
    enabled: true,
    online: true,
    hot: true,
    gradient: 'linear-gradient(135deg, #1a3a2a, #0d1f15)',
  },
  {
    id: 21,
    name: 'Fish Audio 音色克隆',
    type: 'audio',
    typeLabel: '配音',
    provider: 'Fish Audio',
    price: '免费额度',
    priceUnit: 0,
    desc: '上传音频样本，克隆专属音色',
    context: 'Clone',
    enabled: true,
    online: true,
    hot: true,
    gradient: 'linear-gradient(135deg, #2a1a3a, #150d1f)',
  },
  {
    id: 22,
    name: 'Fish Audio 音频资产',
    type: 'audio',
    typeLabel: '配音',
    provider: 'Fish Audio',
    price: '免费额度',
    priceUnit: 0,
    desc: '内置丰富音频资产与预设音色库',
    context: 'Assets',
    enabled: true,
    online: true,
    hot: false,
    gradient: 'linear-gradient(135deg, #1a3a3a, #0d1f1f)',
  },
])

const MODE_TYPE_MAP = {
  image: 'image',
  video: 'video',
  audio: 'audio',
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

export function estimateModelCost(model, mode, quantity = 1) {
  const multipliers = { image: 10, video: 100, audio: 1 }
  const base = model.priceUnit ?? 0.1
  if (mode === 'audio' && base === 0) return '0.00'
  return (base * (multipliers[mode] ?? 1) * quantity).toFixed(2)
}

/** Fish Audio 预设音色 */
export const voicePresets = ref([
  { id: 'v1', name: '温柔女声', tag: '推荐', desc: '自然清晰，适合 narration' },
  { id: 'v2', name: '磁性男声', tag: '热门', desc: '低沉有质感，适合广告' },
  { id: 'v3', name: '活力少年', tag: '', desc: '年轻活泼，适合短视频' },
  { id: 'v4', name: '新闻播报', tag: '', desc: '专业稳重，适合资讯' },
  { id: 'v5', name: '我的克隆音色', tag: '克隆', desc: '已克隆的自定义音色' },
])
