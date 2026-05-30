<template>
  <div class="studio" @click="closePanels">
    <!-- 背景光晕 -->
    <div class="studio-bg">
      <div class="bg-glow bg-glow-left"></div>
      <div class="bg-glow bg-glow-right"></div>
    </div>

    <!-- 顶部栏 -->
    <header class="studio-header">
      <router-link to="/" class="logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 12h5l2-3 2 6 2-3h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span>RelayHub</span>
      </router-link>
      <div class="header-right">
        <span class="balance">
          <el-icon><Coin /></el-icon>
          ¥ 128.50
        </span>
        <router-link to="/dashboard">
          <el-button plain size="small">控制台</el-button>
        </router-link>
      </div>
    </header>

    <!-- 左侧模式切换 -->
    <aside class="mode-rail">
      <button
        v-for="mode in modes"
        :key="mode.key"
        type="button"
        class="mode-btn"
        :class="{ active: activeMode === mode.key }"
        :title="mode.label"
        @click="activeMode = mode.key"
      >
        <el-icon :size="20"><component :is="mode.icon" /></el-icon>
        <span>{{ mode.label }}</span>
      </button>
    </aside>

    <!-- 模型选择面板 -->
    <Transition name="panel-slide">
      <aside v-if="showModelPanel" class="model-panel" @click.stop>
        <div class="panel-search">
          <el-input
            v-model="modelSearch"
            placeholder="搜索模型..."
            prefix-icon="Search"
            clearable
          />
        </div>
        <div class="panel-scroll">
          <div v-if="filteredModelGroups.length === 0" class="empty-models">
            <p>当前模式下暂无可用模型</p>
            <span>请前往控制台 → 模型管理，启用并确保模型在线</span>
            <router-link to="/dashboard">
              <el-button plain size="small">前往模型管理</el-button>
            </router-link>
          </div>
          <div v-for="group in filteredModelGroups" :key="group.title" class="model-group">
            <h4>{{ group.title }}</h4>
            <button
              v-for="model in group.models"
              :key="model.id"
              type="button"
              class="model-item"
              :class="{ selected: selectedModel?.id === model.id }"
              @click="selectModel(model)"
            >
              <div class="model-thumb" :style="{ background: model.gradient }"></div>
              <div class="model-info">
                <div class="model-name-row">
                  <span class="model-name">{{ model.name }}</span>
                  <span v-if="model.hot" class="model-badge hot">热门</span>
                  <el-icon v-if="selectedModel?.id === model.id" class="check-icon"><CircleCheckFilled /></el-icon>
                </div>
                <p class="model-desc">{{ model.desc }}</p>
                <div class="model-specs">
                  <span>{{ model.provider }}</span>
                  <span>{{ model.typeLabel }}</span>
                  <span v-if="model.context !== '-'">{{ model.context }}</span>
                  <span>{{ model.price }}</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </aside>
    </Transition>

    <!-- 主内容区：生成结果展示 -->
    <main class="studio-main">
      <div class="output-zone">
        <!-- 生成中 -->
        <div v-if="generating" class="output-generating">
          <div class="output-label">{{ selectedModel?.name || '请选择模型' }}</div>
          <div class="generating-indicator">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
          <p class="generating-text">正在生成...</p>
        </div>

        <!-- 已有生成结果 -->
        <div v-else-if="generationOutput" class="output-content">
          <div class="output-label">{{ generationOutput.modelName }}</div>

          <div v-if="generationOutput.mode === 'chat'" class="output-text">
            {{ generationOutput.content }}
          </div>

          <div v-else class="output-media">
            <div
              v-for="n in generationOutput.count"
              :key="n"
              class="media-card"
            >
              <el-icon :size="40">
                <Picture v-if="generationOutput.mode === 'image'" />
                <VideoCamera v-else />
              </el-icon>
              <span>{{ generationOutput.mode === 'image' ? '图像' : '视频' }} {{ n }}</span>
            </div>
          </div>

          <div class="float-pills">
            <button
              v-for="pill in floatPills"
              :key="pill.label"
              type="button"
              class="float-pill"
              @click.stop
            >
              <el-icon v-if="pill.icon" :size="14"><component :is="pill.icon" /></el-icon>
              {{ pill.label }}
            </button>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="output-empty">
          <div class="output-label">{{ selectedModel?.name || '请选择模型' }}</div>
          <p class="output-hint">{{ emptyHint }}</p>
        </div>
      </div>
    </main>

    <!-- 底部控制栏（含输入） -->
    <footer class="control-bar" @click.stop>
      <div class="control-dock">
        <div class="prompt-input-bar">
          <textarea
            ref="promptInputRef"
            v-model="prompt"
            class="prompt-input-inline"
            :placeholder="currentPlaceholder"
            rows="1"
            @keydown.enter.exact.prevent="handleGenerate"
            @input="autoResizeInput"
          ></textarea>
        </div>

        <div class="control-toolbar">
          <div class="control-left">
            <button type="button" class="ctrl-btn model-btn" @click="showModelPanel = !showModelPanel">
              <span class="ctrl-icon model-wave">〰</span>
              {{ selectedModel?.name || '选择模型' }}
            </button>

            <template v-if="activeMode === 'video'">
              <button type="button" class="ctrl-btn" @click.stop="togglePopover('duration')">
                <el-icon><Timer /></el-icon>
                {{ duration }}秒
              </button>
              <button type="button" class="ctrl-btn" @click.stop="togglePopover('resolution')">
                <el-icon><Monitor /></el-icon>
                {{ resolution }}
              </button>
              <button type="button" class="ctrl-btn" @click.stop="togglePopover('ratio')">
                <el-icon><Crop /></el-icon>
                {{ aspectRatio }}
              </button>
            </template>

            <template v-else-if="activeMode === 'image'">
              <button type="button" class="ctrl-btn" @click.stop="togglePopover('resolution')">
                <el-icon><Monitor /></el-icon>
                {{ resolution }}
              </button>
              <button type="button" class="ctrl-btn" @click.stop="togglePopover('ratio')">
                <el-icon><Crop /></el-icon>
                {{ aspectRatio }}
              </button>
              <button type="button" class="ctrl-btn" @click.stop="togglePopover('style')">
                <el-icon><Brush /></el-icon>
                {{ stylePreset }}
              </button>
            </template>

            <template v-else>
              <button type="button" class="ctrl-btn" @click.stop="togglePopover('tokens')">
                <el-icon><Document /></el-icon>
                {{ maxTokens }} Token
              </button>
              <button type="button" class="ctrl-btn" @click.stop="togglePopover('temp')">
                <el-icon><Sunny /></el-icon>
                温度 {{ temperature }}
              </button>
            </template>

            <div class="quantity-ctrl">
              <button type="button" class="qty-btn" :disabled="quantity <= 1" @click="quantity--">−</button>
              <span>{{ quantity }}/{{ maxQuantity }}</span>
              <button type="button" class="qty-btn" :disabled="quantity >= maxQuantity" @click="quantity++">+</button>
            </div>

            <button v-if="activeMode === 'video'" type="button" class="ctrl-btn" @click="audioOn = !audioOn">
              <el-icon><Mute /></el-icon>
              {{ audioOn ? '开启' : '关闭' }}
            </button>

            <button type="button" class="ctrl-btn mention-btn">@</button>
          </div>

          <button
            type="button"
            class="generate-btn"
            :class="{ generating }"
            @click="handleGenerate"
          >
            <span class="gen-label">{{ generating ? '生成中...' : '生成' }}</span>
            <span class="gen-cost">
              <el-icon><Coin /></el-icon>
              {{ estimatedCost }}
            </span>
          </button>
        </div>
      </div>

      <!-- 参数弹出选择 -->
      <div v-if="activePopover" class="param-popover" @click.stop>
        <button
          v-for="opt in popoverOptions"
          :key="opt"
          type="button"
          class="popover-opt"
          :class="{ active: isOptionActive(opt) }"
          @click="selectPopoverOption(opt)"
        >
          {{ opt }}
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getStudioModelGroups, estimateModelCost } from '@/data/models.js'

const modes = [
  { key: 'chat', label: '对话', icon: 'ChatDotRound' },
  { key: 'image', label: '图像', icon: 'Picture' },
  { key: 'video', label: '视频', icon: 'VideoCamera' },
]

const activeMode = ref('chat')
const showModelPanel = ref(false)
const modelSearch = ref('')
const prompt = ref('')
const generating = ref(false)
const generationOutput = ref(null)
const quantity = ref(1)
const maxQuantity = 4
const duration = ref('8')
const resolution = ref('1080p')
const aspectRatio = ref('自动')
const stylePreset = ref('自动')
const maxTokens = ref('4096')
const temperature = ref('0.7')
const audioOn = ref(false)
const activePopover = ref(null)
const selectedModel = ref(null)
const promptInputRef = ref(null)

const floatPills = [
  { label: '通用', icon: null },
  { label: '风格：自动', icon: 'Camera' },
  { label: '镜头：自动', icon: 'VideoCamera' },
]

const modelGroups = computed(() => getStudioModelGroups(activeMode.value))

const filteredModelGroups = computed(() => {
  if (!modelSearch.value) return modelGroups.value
  const q = modelSearch.value.toLowerCase()
  return modelGroups.value
    .map(g => ({
      ...g,
      models: g.models.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.desc.toLowerCase().includes(q) ||
        m.provider.toLowerCase().includes(q)
      ),
    }))
    .filter(g => g.models.length > 0)
})

watch(activeMode, () => {
  const groups = getStudioModelGroups(activeMode.value)
  const first = groups[0]?.models[0] ?? null
  selectedModel.value = first
  showModelPanel.value = false
  resetOutput()
}, { immediate: true })

const emptyHint = computed(() => {
  const map = {
    chat: '在下方输入问题，点击生成查看回复',
    image: '在下方描述图像，点击生成查看结果',
    video: '在下方描述视频，点击生成查看结果',
  }
  return map[activeMode.value]
})

const currentPlaceholder = computed(() => {
  const map = {
    chat: '输入您的问题或指令...',
    image: '描述您想要生成的图像...',
    video: '如果你有无限预算，你会如何拍摄？',
  }
  return map[activeMode.value]
})

const estimatedCost = computed(() => {
  if (!selectedModel.value) return '0.00'
  return estimateModelCost(selectedModel.value, activeMode.value, quantity.value)
})

const popoverOptions = computed(() => {
  const map = {
    duration: ['3秒', '5秒', '8秒', '10秒', '15秒'],
    resolution: ['720p', '1080p', '2K', '4K'],
    ratio: ['自动', '16:9', '9:16', '1:1', '4:3'],
    style: ['自动', '写实', '动漫', '油画', '3D'],
    tokens: ['1024', '2048', '4096', '8192', '16384'],
    temp: ['0.3', '0.5', '0.7', '0.9', '1.0'],
  }
  return map[activePopover.value] || []
})

function selectModel(model) {
  if (selectedModel.value?.id !== model.id) {
    resetOutput()
  }
  selectedModel.value = model
  showModelPanel.value = false
}

function resetOutput() {
  generationOutput.value = null
  generating.value = false
  prompt.value = ''
}

function closePanels() {
  showModelPanel.value = false
  activePopover.value = null
}

function togglePopover(key) {
  activePopover.value = activePopover.value === key ? null : key
}

function isOptionActive(opt) {
  const map = {
    duration: `${duration.value}秒`,
    resolution: resolution.value,
    ratio: aspectRatio.value,
    style: stylePreset.value,
    tokens: maxTokens.value,
    temp: temperature.value,
  }
  return map[activePopover.value] === opt
}

function selectPopoverOption(opt) {
  switch (activePopover.value) {
    case 'duration': duration.value = opt.replace('秒', ''); break
    case 'resolution': resolution.value = opt; break
    case 'ratio': aspectRatio.value = opt; break
    case 'style': stylePreset.value = opt; break
    case 'tokens': maxTokens.value = opt; break
    case 'temp': temperature.value = opt; break
  }
  activePopover.value = null
}

function handleGenerate() {
  if (!selectedModel.value) {
    ElMessage.warning('请先选择模型')
    showModelPanel.value = true
    return
  }
  if (!prompt.value.trim()) {
    ElMessage.warning('请输入提示词')
    promptInputRef.value?.focus()
    return
  }
  generating.value = true
  generationOutput.value = null
  setTimeout(() => {
    generating.value = false
    const mode = activeMode.value
    generationOutput.value = {
      modelName: selectedModel.value.name,
      mode,
      prompt: prompt.value.trim(),
      count: quantity.value,
      cost: estimatedCost.value,
      content: mode === 'chat'
        ? `针对「${prompt.value.trim()}」的回复：\n\n这是通过 ${selectedModel.value.name} 生成的模拟内容。RelayHub 已将请求路由至对应模型，接入后端后将在此区域实时展示生成结果。`
        : null,
    }
    ElMessage.success('生成完成')
  }, 2000)
}

function autoResizeInput() {
  const el = promptInputRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 120)}px`
}

onBeforeRouteLeave(() => {
  resetOutput()
})
</script>

<style scoped>
.studio {
  position: relative;
  min-height: 100vh;
  background: #080808;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.studio-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
}

.bg-glow-left {
  width: 500px;
  height: 500px;
  background: rgba(59, 130, 246, 0.12);
  bottom: 10%;
  left: 5%;
}

.bg-glow-right {
  width: 400px;
  height: 400px;
  background: rgba(34, 197, 94, 0.08);
  top: 20%;
  right: 15%;
}

/* Header */
.studio-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon svg {
  width: 18px;
  height: 18px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.balance {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--accent-green);
}

/* Mode rail */
.mode-rail {
  position: fixed;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: rgba(20, 20, 20, 0.8);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 8px;
}

.mode-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 10px;
  background: transparent;
  border: none;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.45);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 56px;
}

.mode-btn:hover {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.05);
}

.mode-btn.active {
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

/* Model panel */
.model-panel {
  position: fixed;
  left: 88px;
  bottom: 200px;
  width: 360px;
  max-height: calc(100vh - 180px);
  background: rgba(18, 18, 18, 0.95);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  z-index: 30;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
}

.panel-search {
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.panel-search :deep(.el-input__wrapper) {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04) !important;
}

.panel-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px 16px;
}

.model-group h4 {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.06em;
  padding: 12px 8px 8px;
}

.model-item {
  display: flex;
  gap: 12px;
  width: 100%;
  padding: 10px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 14px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  margin-bottom: 4px;
}

.model-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.model-item.selected {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.1);
}

.model-thumb {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  flex-shrink: 0;
}

.model-info {
  flex: 1;
  min-width: 0;
}

.model-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.model-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.model-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.04em;
}

.model-badge.hot {
  background: #facc15;
  color: #000;
}

.empty-models {
  text-align: center;
  padding: 32px 16px;
  color: rgba(255, 255, 255, 0.45);
}

.empty-models p {
  font-size: 14px;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.65);
}

.empty-models span {
  display: block;
  font-size: 12px;
  margin-bottom: 16px;
  line-height: 1.6;
}

.check-icon {
  margin-left: auto;
  color: var(--accent-green);
}

.model-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  line-height: 1.4;
  margin-bottom: 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.model-specs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
}

.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: all 0.25s ease;
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

.studio-main {
  position: relative;
  z-index: 5;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 120px 220px 100px;
}

.output-zone {
  width: 100%;
  max-width: 720px;
  position: relative;
  text-align: center;
}

.output-label {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.35);
  margin-bottom: 20px;
}

.output-text {
  font-size: clamp(24px, 3.5vw, 38px);
  font-weight: 500;
  line-height: 1.45;
  letter-spacing: -0.02em;
  color: #7ec8e3;
  word-break: break-word;
  white-space: pre-wrap;
  text-align: center;
}

.output-hint {
  font-size: clamp(20px, 3vw, 32px);
  font-weight: 500;
  line-height: 1.4;
  color: rgba(126, 200, 227, 0.2);
}

.output-generating {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.generating-indicator {
  display: flex;
  gap: 8px;
}

.generating-indicator .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #7ec8e3;
  animation: bounce 1.2s infinite ease-in-out;
}

.generating-indicator .dot:nth-child(2) { animation-delay: 0.15s; }
.generating-indicator .dot:nth-child(3) { animation-delay: 0.3s; }

@keyframes bounce {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
  40% { opacity: 1; transform: scale(1); }
}

.generating-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
}

.output-content {
  position: relative;
}

.output-media {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
}

.media-card {
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.45);
  font-size: 13px;
}

.float-pills {
  margin-top: 40px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}

.float-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.float-pill:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.control-bar {
  position: fixed;
  bottom: 24px;
  left: 88px;
  right: 24px;
  z-index: 20;
}

.control-dock {
  background: rgba(22, 22, 22, 0.92);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  overflow: hidden;
}

.prompt-input-bar {
  padding: 16px 20px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.prompt-input-inline {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  font-size: 16px;
  line-height: 1.5;
  color: #fff;
  font-family: var(--font-family);
  min-height: 24px;
  max-height: 120px;
  overflow-y: auto;
}

.prompt-input-inline::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.control-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
}

.control-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
}

.ctrl-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.ctrl-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}

.model-btn {
  font-weight: 600;
}

.model-wave {
  font-size: 16px;
  opacity: 0.6;
}

.quantity-ctrl {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}

.qty-btn {
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.06);
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.qty-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.mention-btn {
  font-size: 16px;
  font-weight: 600;
  padding: 10px 16px;
}

.generate-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 14px 32px;
  background: linear-gradient(135deg, #38bdf8 0%, #22d3ee 50%, #67e8f9 100%);
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.25s;
  flex-shrink: 0;
  min-width: 140px;
  box-shadow: 0 4px 24px rgba(56, 189, 248, 0.35);
}

.generate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(56, 189, 248, 0.45);
}

.generate-btn.generating {
  opacity: 0.8;
  pointer-events: none;
}

.gen-label {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #000;
}

.gen-cost {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.65);
}

.param-popover {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 120px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px;
  background: rgba(22, 22, 22, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  backdrop-filter: blur(16px);
  max-width: 320px;
}

.popover-opt {
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.popover-opt:hover,
.popover-opt.active {
  background: rgba(56, 189, 248, 0.15);
  border-color: rgba(56, 189, 248, 0.3);
  color: #38bdf8;
}

@media (max-width: 768px) {
  .mode-rail {
    left: 8px;
    padding: 6px;
  }

  .mode-btn span {
    display: none;
  }

  .studio-main {
    padding: 32px 16px 260px 72px;
  }

  .control-bar {
    left: 72px;
    right: 12px;
  }

  .control-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .generate-btn {
    width: 100%;
  }

  .model-panel {
    left: 72px;
    right: 12px;
    width: auto;
  }
}
</style>
