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

      <nav class="studio-nav">
        <router-link to="/studio/image">生图</router-link>
        <router-link to="/studio/video">生视频</router-link>
        <router-link to="/studio/audio">配音</router-link>
      </nav>

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

    <!-- 顶部模式导航（三个独立入口） -->
    <!-- 左侧快捷返回首页 -->
    <aside class="mode-rail">
      <router-link to="/" class="mode-btn" title="返回首页">
        <el-icon :size="20"><HomeFilled /></el-icon>
        <span>首页</span>
      </router-link>
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

    <!-- 主内容区：预览展示 -->
    <main class="studio-main" :class="{ 'is-video': activeMode === 'video' && (generating || hasVideoPreview) }">
      <!-- 视频模式：生成中 / 已生成 → 16:9 预览面板 -->
      <div v-if="activeMode === 'video' && (generating || hasVideoPreview)" class="video-preview-zone">
        <div class="video-preview-frame">
          <div v-if="generating" class="video-preview-loading">
            <el-icon class="spin" :size="40"><Loading /></el-icon>
            <span>视频生成中...</span>
          </div>
          <div v-else class="video-preview-player">
            <div class="player-screen">
              <el-icon :size="56"><VideoPlay /></el-icon>
              <span>点击播放预览</span>
            </div>
            <div class="player-bar">
              <el-icon><VideoPlay /></el-icon>
              <div class="progress-track"><div class="progress-fill"></div></div>
              <span class="player-time">0:00 / 0:{{ String(durationNum).padStart(2, '0') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 图像模式 / 视频未生成 → 提示词预览 -->
      <div v-else class="preview-zone">
        <div v-if="prompt.trim()" class="preview-content">
          <div class="preview-label">{{ selectedModel?.name || '请选择模型' }}</div>
          <p class="preview-text">{{ prompt }}</p>
        </div>
        <div v-else class="preview-empty">
          <div class="preview-label">{{ selectedModel?.name || '请选择模型' }}</div>
          <p class="preview-hint">{{ currentPlaceholder }}</p>
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
    </main>

    <!-- 底部控制栏（含输入） -->
    <footer class="control-bar" @click.stop>
      <div class="control-dock">
        <!-- 视频专用工具栏：参考图 + 镜头运动 -->
        <div v-if="activeMode === 'video'" class="video-tools-row">
          <div class="tool-block ref-block">
            <span class="tool-label">参考图</span>
            <div class="ref-slots">
              <button type="button" class="ref-upload" title="上传参考图" @click="triggerRefUpload">
                <el-icon :size="20"><Upload /></el-icon>
              </button>
              <div
                v-for="(img, idx) in referenceImages"
                :key="idx"
                class="ref-thumb"
              >
                <img :src="img" alt="参考图" />
                <button type="button" class="ref-remove" @click.stop="removeRefImage(idx)">
                  <el-icon :size="12"><Close /></el-icon>
                </button>
              </div>
              <div
                v-for="n in emptyRefSlots"
                :key="'empty-' + n"
                class="ref-empty"
              ></div>
            </div>
            <input
              ref="refFileInput"
              type="file"
              accept="image/*"
              multiple
              class="hidden-input"
              @change="handleRefUpload"
            />
          </div>

          <div class="tool-block camera-block">
            <span class="tool-label">镜头运动</span>
            <div class="camera-select-wrap">
              <button
                type="button"
                class="camera-select-btn"
                @click.stop="showCameraMenu = !showCameraMenu"
              >
                <el-icon><VideoCamera /></el-icon>
                <span>{{ cameraMovement }}</span>
                <el-icon class="arrow"><ArrowDown /></el-icon>
              </button>
              <Transition name="panel-slide">
                <div v-if="showCameraMenu" class="camera-menu" @click.stop>
                  <button
                    v-for="opt in cameraOptions"
                    :key="opt.label"
                    type="button"
                    class="camera-opt"
                    :class="{ active: cameraMovement === opt.label }"
                    @click="selectCameraMovement(opt)"
                    @mouseenter="hoverCameraLabel = opt.label"
                    @mouseleave="hoverCameraLabel = null"
                  >
                    <div class="camera-opt-preview">
                      <video
                        v-if="opt.previewVideo"
                        :ref="(el) => { if (el) cameraVideoRefs[opt.label] = el }"
                        :src="opt.previewVideo"
                        muted
                        loop
                        playsinline
                        preload="metadata"
                        class="camera-opt-video"
                      ></video>
                      <div v-else class="camera-opt-placeholder">
                        <el-icon :size="16"><VideoCamera /></el-icon>
                      </div>
                    </div>
                    <span class="camera-opt-label">{{ opt.label }}</span>
                    <el-icon v-if="cameraMovement === opt.label"><Check /></el-icon>
                  </button>
                </div>
              </Transition>
            </div>
          </div>

          <div class="tool-block rhythm-block">
            <span class="tool-label">镜头运动节奏</span>
            <div class="rhythm-chart">
              <svg viewBox="0 0 120 40" preserveAspectRatio="none">
                <polyline
                  points="0,30 20,25 40,15 60,20 80,8 100,12 120,5"
                  fill="none"
                  stroke="rgba(56,189,248,0.8)"
                  stroke-width="2"
                />
              </svg>
            </div>
          </div>

          <div class="tool-block duration-block">
            <span class="tool-label">持续时间</span>
            <div class="duration-slider-wrap">
              <el-slider v-model="durationNum" :min="3" :max="15" :show-tooltip="false" />
              <span class="duration-val">{{ durationNum }}秒</span>
            </div>
          </div>
        </div>

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

    <!-- 生成结果预览 -->
    <Transition name="fade">
      <div v-if="showResult" class="result-overlay" @click="showResult = false">
        <div class="result-card" @click.stop>
          <div class="result-header">
            <h3>生成结果</h3>
            <button type="button" class="close-btn" @click="showResult = false">
              <el-icon><Close /></el-icon>
            </button>
          </div>
          <div class="result-preview" :class="activeMode">
            <div v-if="activeMode === 'image'" class="result-media">
              <div class="media-placeholder">
                <el-icon :size="48"><Picture /></el-icon>
                <span>图像预览</span>
              </div>
            </div>
            <div v-else class="result-media">
              <div class="media-placeholder">
                <el-icon :size="48"><VideoCamera /></el-icon>
                <span>视频预览</span>
              </div>
            </div>
          </div>
          <div class="result-meta">
            <span>{{ selectedModel?.name }}</span>
            <span>消耗 ¥{{ estimatedCost }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getStudioModelGroups, estimateModelCost } from '@/data/models.js'

const route = useRoute()

const activeMode = computed(() => route.meta.studioMode || 'image')
const showModelPanel = ref(false)
const modelSearch = ref('')
const prompt = ref('')
const generating = ref(false)
const showResult = ref(false)
const quantity = ref(1)
const maxQuantity = 4
const duration = ref('8')
const resolution = ref('1080p')
const aspectRatio = ref('自动')
const stylePreset = ref('自动')
const audioOn = ref(false)
const activePopover = ref(null)
const selectedModel = ref(null)
const promptInputRef = ref(null)
const refFileInput = ref(null)
const referenceImages = ref([])
const maxRefImages = 3
const cameraMovement = ref('向右平移')
const showCameraMenu = ref(false)
const hoverCameraLabel = ref(null)
const cameraVideoRefs = ref({})
const hasVideoPreview = ref(false)
const durationNum = ref(8)

const cameraOptions = [
  { label: '向右平移', previewVideo: '/video/向右平移.mp4' },
  { label: '向上平移', previewVideo: '/video/向上平移.mp4' },
  { label: '向下平移', previewVideo: '/video/向下平移.mp4' },
  { label: '360度旋转', previewVideo: '/video/360度旋转.mp4' },
  { label: '放大', previewVideo: '/video/放大.mp4' },
  { label: '跟随镜头', previewVideo: '/video/跟随镜头.mp4' },
  { label: '静止镜头', previewVideo: '/video/静止镜头.mp4' },
  { label: '拉远', previewVideo: '/video/拉远.mp4' },
  { label: '上摇镜头', previewVideo: '/video/上摇镜头.mp4' },
  { label: '手持镜头', previewVideo: '/video/手持镜头.mp4' },
  { label: '缩小', previewVideo: '/video/缩小.mp4' },
  { label: '推近', previewVideo: '/video/推近.mp4' },
  { label: '无人机升空', previewVideo: '/video/无人机升空.mp4' },
  { label: '下摇镜头', previewVideo: '/video/下摇镜头.mp4' },
  { label: '向左平移', previewVideo: '/video/向左平移.mp4' },
  { label: '向右推拉', previewVideo: '/video/向右推拉.mp4' },
  { label: '向左推拉', previewVideo: '/video/向左推拉.mp4' },
]

const emptyRefSlots = computed(() =>
  Math.max(0, maxRefImages - referenceImages.value.length)
)

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
  selectedModel.value = groups[0]?.models[0] ?? null
  showModelPanel.value = false
  showCameraMenu.value = false
  hasVideoPreview.value = false
}, { immediate: true })

watch(durationNum, (val) => {
  duration.value = String(val)
})

watch(hoverCameraLabel, (newLabel, oldLabel) => {
  if (oldLabel) {
    const prev = cameraVideoRefs.value[oldLabel]
    if (prev) prev.pause()
  }
  if (newLabel) {
    const next = cameraVideoRefs.value[newLabel]
    if (next) next.play().catch(() => {})
  }
})

const currentPlaceholder = computed(() => {
  const map = {
    image: '描述您想要生成的图像...',
    video: '描述一下你的场景——使用方括号引用滤镜代码。',
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
  }
  return map[activePopover.value] || []
})

function selectModel(model) {
  selectedModel.value = model
  showModelPanel.value = false
}

function closePanels() {
  showModelPanel.value = false
  activePopover.value = null
  showCameraMenu.value = false
}

function selectCameraMovement(opt) {
  cameraMovement.value = opt.label
  showCameraMenu.value = false
}

function triggerRefUpload() {
  refFileInput.value?.click()
}

function handleRefUpload(e) {
  const files = Array.from(e.target.files || [])
  const remain = maxRefImages - referenceImages.value.length
  files.slice(0, remain).forEach(file => {
    referenceImages.value.push(URL.createObjectURL(file))
  })
  e.target.value = ''
  if (files.length > remain) {
    ElMessage.warning(`最多上传 ${maxRefImages} 张参考图`)
  }
}

function removeRefImage(idx) {
  URL.revokeObjectURL(referenceImages.value[idx])
  referenceImages.value.splice(idx, 1)
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
  }
  return map[activePopover.value] === opt
}

function selectPopoverOption(opt) {
  switch (activePopover.value) {
    case 'duration': duration.value = opt.replace('秒', ''); break
    case 'resolution': resolution.value = opt; break
    case 'ratio': aspectRatio.value = opt; break
    case 'style': stylePreset.value = opt; break
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
  if (activeMode.value === 'video') {
    hasVideoPreview.value = false
  }
  setTimeout(() => {
    generating.value = false
    if (activeMode.value === 'video') {
      hasVideoPreview.value = true
      ElMessage.success('视频生成完成')
    } else {
      showResult.value = true
      ElMessage.success('生成完成')
    }
  }, 2000)
}

function autoResizeInput() {
  const el = promptInputRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 120)}px`
}
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
  gap: 24px;
}

.studio-nav {
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  padding: 4px;
}

.studio-nav a {
  padding: 8px 20px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.55);
  transition: all 0.2s;
}

.studio-nav a:hover {
  color: #fff;
}

.studio-nav a.router-link-active {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
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
  text-decoration: none;
}

.mode-btn:hover {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.05);
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

.studio-main.is-video {
  align-items: flex-start;
  padding-top: 48px;
}

.video-preview-zone {
  width: 100%;
  max-width: 960px;
}

.video-preview-frame {
  aspect-ratio: 16 / 9;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.45);
  overflow: hidden;
  position: relative;
}

.video-preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 100%;
  color: rgba(255, 255, 255, 0.35);
  text-align: center;
  padding: 24px;
}

.video-preview-loading .spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.video-preview-player {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.player-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: background 0.2s;
}

.player-screen:hover {
  background: rgba(255, 255, 255, 0.03);
}

.player-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.6);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}

.progress-track {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  width: 35%;
  height: 100%;
  background: #38bdf8;
  border-radius: 2px;
}

.video-tools-row {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  padding: 14px 20px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-wrap: wrap;
}

.tool-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tool-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.4);
}

.ref-slots {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ref-upload,
.ref-empty,
.ref-thumb {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  flex-shrink: 0;
}

.ref-upload {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px dashed rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  transition: all 0.2s;
}

.ref-upload:hover {
  border-color: rgba(56, 189, 248, 0.4);
  color: #38bdf8;
}

.ref-empty {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.ref-thumb {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.ref-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ref-remove {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  border: none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

.ref-thumb:hover .ref-remove {
  opacity: 1;
}

.hidden-input {
  display: none;
}

.camera-select-wrap {
  position: relative;
}

.camera-select-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  min-width: 140px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.camera-select-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
}

.camera-select-btn .arrow {
  margin-left: auto;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.camera-menu {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  z-index: 30;
  min-width: 180px;
  max-height: 280px;
  overflow-y: auto;
  padding: 6px;
  background: rgba(22, 22, 22, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(16px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.camera-opt {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s;
}

.camera-opt:hover,
.camera-opt.active {
  background: rgba(56, 189, 248, 0.12);
  color: #38bdf8;
}

.camera-opt-preview {
  width: 60px;
  height: 36px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.3);
  position: relative;
}

.camera-opt-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-opt-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.25);
}

.camera-opt-label {
  flex: 1;
  min-width: 0;
}

.rhythm-chart {
  width: 120px;
  height: 40px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  overflow: hidden;
}

.rhythm-chart svg {
  width: 100%;
  height: 100%;
}

.duration-slider-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 140px;
}

.duration-slider-wrap :deep(.el-slider) {
  flex: 1;
}

.duration-val {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
}

.preview-zone {
  width: 100%;
  max-width: 720px;
  position: relative;
  text-align: center;
}

.preview-label {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.35);
  margin-bottom: 20px;
}

.preview-text {
  font-size: clamp(24px, 3.5vw, 38px);
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: -0.02em;
  color: #7ec8e3;
  word-break: break-word;
}

.preview-hint {
  font-size: clamp(24px, 3.5vw, 38px);
  font-weight: 500;
  line-height: 1.4;
  color: rgba(126, 200, 227, 0.25);
}

.float-pills {
  position: absolute;
  bottom: -56px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  width: max-content;
  max-width: 100%;
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
  overflow: visible;
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

.result-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.result-card {
  width: 100%;
  max-width: 560px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  overflow: hidden;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.result-header h3 {
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
}

.result-preview {
  padding: 24px;
  min-height: 200px;
}

.result-chat p {
  font-size: 15px;
  line-height: 1.7;
  color: var(--text-secondary);
}

.media-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 240px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  color: var(--text-muted);
}

.result-meta {
  display: flex;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  font-size: 13px;
  color: var(--text-secondary);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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
    padding: 32px 16px 320px 72px;
  }

  .video-tools-row {
    gap: 12px;
  }

  .rhythm-block,
  .duration-block {
    display: none;
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
