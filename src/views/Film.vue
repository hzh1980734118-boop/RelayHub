<template>
  <div class="film" @click="closePopovers">
    <div class="film-bg">
      <div class="bg-glow bg-glow-red"></div>
      <div class="bg-glow bg-glow-blue"></div>
    </div>

    <!-- Header -->
    <header class="film-header">
      <router-link to="/" class="logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 12h5l2-3 2 6 2-3h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span>RelayHub</span>
      </router-link>
      <span class="page-label">影视工作室</span>
      <div class="header-right">
        <span class="film-badge">专业版</span>
        <router-link to="/dashboard">
          <el-button plain size="small">控制台</el-button>
        </router-link>
      </div>
    </header>

    <!-- 主内容 -->
    <div class="film-layout">
      <!-- 左侧工具面板 -->
      <aside class="film-toolbar">
        <div class="tool-section">
          <h4>参考图</h4>
          <div class="ref-slots">
            <button type="button" class="ref-upload" title="上传参考图" @click="triggerRefUpload">
              <el-icon :size="20"><Upload /></el-icon>
            </button>
            <div v-for="(img, idx) in referenceImages" :key="idx" class="ref-thumb">
              <img :src="img" alt="参考图" />
              <button type="button" class="ref-remove" @click.stop="removeRefImage(idx)">
                <el-icon :size="12"><Close /></el-icon>
              </button>
            </div>
            <div v-for="n in emptyRefSlots" :key="'empty-'+n" class="ref-empty"></div>
          </div>
          <input ref="refFileInput" type="file" accept="image/*" multiple class="hidden-input" @change="handleRefUpload" />
        </div>

        <div class="tool-section">
          <h4>镜头运动</h4>
          <div class="camera-select-wrap">
            <button type="button" class="camera-select-btn" @click.stop="showCameraMenu = !showCameraMenu">
              <el-icon><VideoCamera /></el-icon>
              <span>{{ cameraMovement }}</span>
              <el-icon class="arrow"><ArrowDown /></el-icon>
            </button>
            <Transition name="menu-fade">
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
                      muted loop playsinline preload="metadata"
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

        <div class="tool-section">
          <h4>镜头运动节奏</h4>
          <div class="rhythm-chart">
            <svg viewBox="0 0 120 40" preserveAspectRatio="none">
              <polyline points="0,30 20,25 40,15 60,20 80,8 100,12 120,5" fill="none" stroke="rgba(239,68,68,0.8)" stroke-width="2"/>
            </svg>
          </div>
        </div>

        <div class="tool-section">
          <h4>持续时间</h4>
          <div class="duration-wrap">
            <el-slider v-model="durationNum" :min="3" :max="30" :show-tooltip="false" />
            <span class="duration-val">{{ durationNum }}秒</span>
          </div>
        </div>

        <div class="tool-section">
          <h4>分辨率</h4>
          <div class="chip-row">
            <button v-for="r in resolutions" :key="r" type="button" class="chip" :class="{ active: resolution === r }" @click="resolution = r">{{ r }}</button>
          </div>
        </div>

        <div class="tool-section">
          <h4>画幅比例</h4>
          <div class="chip-row">
            <button v-for="r in ratios" :key="r" type="button" class="chip" :class="{ active: aspectRatio === r }" @click="aspectRatio = r">{{ r }}</button>
          </div>
        </div>

        <div class="tool-section">
          <h4>风格预设</h4>
          <div class="chip-row">
            <button v-for="s in stylePresets" :key="s" type="button" class="chip" :class="{ active: stylePreset === s }" @click="stylePreset = s">{{ s }}</button>
          </div>
        </div>
      </aside>

      <!-- 主预览区 -->
      <main class="film-main">
        <div class="film-preview">
          <!-- 16:9 监视器框 -->
          <div class="monitor-frame">
            <div class="monitor-screen">
              <div v-if="generating" class="monitor-loading">
                <el-icon class="spin" :size="48"><Loading /></el-icon>
                <span>渲染中...</span>
              </div>
              <div v-else-if="hasPreview" class="monitor-player">
                <el-icon :size="64"><VideoPlayFilled /></el-icon>
                <span>点击播放</span>
                <div class="monitor-progress">
                  <div class="progress-track"><div class="progress-fill"></div></div>
                  <span>0:00 / 0:{{ String(durationNum).padStart(2,'0') }}</span>
                </div>
              </div>
              <div v-else class="monitor-empty">
                <el-icon :size="56"><VideoCamera /></el-icon>
                <p>{{ prompt.trim() || '专业级影视创作平台' }}</p>
                <span>输入场景描述，开始生成</span>
              </div>
            </div>
            <!-- 监视器标签 -->
            <div class="monitor-label">
              <span class="monitor-dot"></span>
              REC {{ selectedModel?.name || '未连接' }}
            </div>
          </div>

          <!-- 时间线 -->
          <div class="timeline">
            <div class="timeline-track">
              <div v-for="n in 20" :key="n" class="timeline-tick" :class="{ major: n % 5 === 0 }"></div>
            </div>
            <div class="timeline-label">00:00:00:00</div>
          </div>
        </div>
      </main>
    </div>

    <!-- 底部控制栏 -->
    <footer class="control-bar" @click.stop>
      <div class="control-dock">
        <div class="prompt-bar">
          <textarea
            ref="promptInputRef"
            v-model="prompt"
            class="prompt-input"
            placeholder="描述你的场景——使用方括号引用滤镜代码..."
            rows="1"
            @keydown.enter.exact.prevent="handleGenerate"
            @input="autoResizeInput"
          ></textarea>
        </div>
        <div class="control-toolbar">
          <div class="control-left">
            <button type="button" class="ctrl-btn" @click.stop="togglePopover('model')">
              <span class="ctrl-icon">〰</span>
              {{ selectedModel?.name || '选择模型' }}
            </button>
            <div class="quantity-ctrl">
              <button type="button" class="qty-btn" :disabled="quantity <= 1" @click="quantity--">−</button>
              <span>{{ quantity }}/{{ maxQuantity }}</span>
              <button type="button" class="qty-btn" :disabled="quantity >= maxQuantity" @click="quantity++">+</button>
            </div>
            <button type="button" class="ctrl-btn" @click="audioOn = !audioOn">
              <el-icon><Mute /></el-icon>
              {{ audioOn ? '声音开' : '静音' }}
            </button>
          </div>
          <button type="button" class="generate-btn" :class="{ generating }" @click="handleGenerate">
            <span class="gen-label">{{ generating ? '渲染中...' : '生成镜头' }}</span>
            <span class="gen-cost">预算 ¥{{ estimatedCost }}</span>
          </button>
        </div>
      </div>

      <!-- Model dropdown -->
      <div v-if="activePopover === 'model'" class="model-dropdown" @click.stop>
        <div class="model-dropdown-search">
          <el-input v-model="modelSearch" placeholder="搜索模型..." prefix-icon="Search" size="small" clearable />
        </div>
        <div v-if="filteredDropdownModels.length === 0" class="model-dropdown-empty">暂无匹配模型</div>
        <button
          v-for="m in filteredDropdownModels"
          :key="m.id"
          type="button"
          class="model-dropdown-item"
          :class="{ active: selectedModel?.id === m.id }"
          @click="selectModel(m); activePopover = null"
        >
          <span class="model-dropdown-name">{{ m.name }}</span>
          <span class="model-dropdown-provider">{{ m.provider }}</span>
          <span class="model-dropdown-price">{{ m.price }}</span>
          <el-icon v-if="selectedModel?.id === m.id" class="model-dropdown-check"><Check /></el-icon>
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getStudioModelGroups, estimateModelCost } from '@/data/models.js'

const prompt = ref('')
const generating = ref(false)
const hasPreview = ref(false)
const quantity = ref(1)
const maxQuantity = 4
const resolution = ref('4K')
const aspectRatio = ref('16:9')
const stylePreset = ref('电影级')
const audioOn = ref(true)
const durationNum = ref(8)
const activePopover = ref(null)
const modelSearch = ref('')
const selectedModel = ref(null)
const promptInputRef = ref(null)

// 参考图
const refFileInput = ref(null)
const referenceImages = ref([])
const maxRefImages = 4

// 镜头运动
const cameraMovement = ref('静止镜头')
const showCameraMenu = ref(false)
const hoverCameraLabel = ref(null)
const cameraVideoRefs = ref({})

const base = import.meta.env.BASE_URL
const cameraOptions = [
  { label: '向右平移', previewVideo: `${base}video/向右平移.mp4` },
  { label: '向上平移', previewVideo: `${base}video/向上平移.mp4` },
  { label: '向下平移', previewVideo: `${base}video/向下平移.mp4` },
  { label: '360度旋转', previewVideo: `${base}video/360度旋转.mp4` },
  { label: '放大', previewVideo: `${base}video/放大.mp4` },
  { label: '跟随镜头', previewVideo: `${base}video/跟随镜头.mp4` },
  { label: '静止镜头', previewVideo: `${base}video/静止镜头.mp4` },
  { label: '拉远', previewVideo: `${base}video/拉远.mp4` },
  { label: '上摇镜头', previewVideo: `${base}video/上摇镜头.mp4` },
  { label: '手持镜头', previewVideo: `${base}video/手持镜头.mp4` },
  { label: '缩小', previewVideo: `${base}video/缩小.mp4` },
  { label: '推近', previewVideo: `${base}video/推近.mp4` },
  { label: '无人机升空', previewVideo: `${base}video/无人机升空.mp4` },
  { label: '下摇镜头', previewVideo: `${base}video/下摇镜头.mp4` },
  { label: '向左平移', previewVideo: `${base}video/向左平移.mp4` },
  { label: '向右推拉', previewVideo: `${base}video/向右推拉.mp4` },
  { label: '向左推拉', previewVideo: `${base}video/向左推拉.mp4` },
]

const resolutions = ['720p', '1080p', '2K', '4K', '8K']
const ratios = ['16:9', '9:16', '2.35:1', '1:1', '4:3']
const stylePresets = ['电影级', '纪录片', '广告风', 'MV风', 'Vlog', '黑白', '复古']

const emptyRefSlots = computed(() => Math.max(0, maxRefImages - referenceImages.value.length))

const dropdownModels = computed(() => getStudioModelGroups('video').flatMap(g => g.models))

const filteredDropdownModels = computed(() => {
  if (!modelSearch.value) return dropdownModels.value
  const q = modelSearch.value.toLowerCase()
  return dropdownModels.value.filter(m =>
    m.name.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q) || m.provider.toLowerCase().includes(q)
  )
})

const estimatedCost = computed(() => {
  if (!selectedModel.value) return '0.00'
  return estimateModelCost(selectedModel.value, 'video', quantity.value)
})

onMounted(() => {
  const groups = getStudioModelGroups('video')
  selectedModel.value = groups[0]?.models[0] ?? null
})

watch(hoverCameraLabel, (newLabel, oldLabel) => {
  if (oldLabel) { const prev = cameraVideoRefs.value[oldLabel]; if (prev) prev.pause() }
  if (newLabel) { const next = cameraVideoRefs.value[newLabel]; if (next) next.play().catch(() => {}) }
})

function selectModel(model) { selectedModel.value = model }
function closePopovers() { activePopover.value = null; showCameraMenu.value = false }
function togglePopover(key) { activePopover.value = activePopover.value === key ? null : key }

function selectCameraMovement(opt) {
  cameraMovement.value = opt.label
  showCameraMenu.value = false
}

function triggerRefUpload() { refFileInput.value?.click() }
function handleRefUpload(e) {
  const files = Array.from(e.target.files || [])
  const remain = maxRefImages - referenceImages.value.length
  files.slice(0, remain).forEach(f => referenceImages.value.push(URL.createObjectURL(f)))
  e.target.value = ''
  if (files.length > remain) ElMessage.warning(`最多上传 ${maxRefImages} 张参考图`)
}
function removeRefImage(idx) {
  URL.revokeObjectURL(referenceImages.value[idx])
  referenceImages.value.splice(idx, 1)
}

function handleGenerate() {
  if (!selectedModel.value) { ElMessage.warning('请先选择模型'); activePopover.value = 'model'; return }
  if (!prompt.value.trim()) { ElMessage.warning('请输入场景描述'); promptInputRef.value?.focus(); return }
  generating.value = true
  hasPreview.value = false
  setTimeout(() => {
    generating.value = false
    hasPreview.value = true
    ElMessage.success('镜头生成完成')
  }, 3000)
}

function autoResizeInput() {
  const el = promptInputRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 120)}px`
}
</script>

<style scoped>
.film {
  min-height: 100vh;
  background: #0a0a0e;
  display: flex;
  flex-direction: column;
}

.film-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.bg-glow-red {
  position: absolute;
  top: -150px;
  right: -100px;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(239,68,68,0.05) 0%, transparent 70%);
}

.bg-glow-blue {
  position: absolute;
  bottom: 10%;
  left: -100px;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%);
}

/* Header */
.film-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  gap: 24px;
}

.logo { display: flex; align-items: center; gap: 10px; font-size: 16px; font-weight: 700; color: #fff; flex-shrink: 0; }
.logo-icon {
  width: 32px; height: 32px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
}
.logo-icon svg { width: 18px; height: 18px; }

.page-label {
  font-size: 13px; font-weight: 600;
  color: rgba(255,255,255,0.45);
  padding: 6px 16px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 999px;
}

.header-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }

.film-badge {
  font-size: 12px; font-weight: 600;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(239,68,68,0.12);
  color: #ef4444;
  border: 1px solid rgba(239,68,68,0.2);
}

/* Layout */
.film-layout {
  position: relative;
  z-index: 5;
  flex: 1;
  display: grid;
  grid-template-columns: 260px 1fr;
  padding-bottom: 180px;
}

/* Toolbar */
.film-toolbar {
  border-right: 1px solid rgba(255,255,255,0.06);
  padding: 20px 18px;
  overflow-y: auto;
  max-height: calc(100vh - 260px);
}

.tool-section { margin-bottom: 22px; }
.tool-section h4 {
  font-size: 11px; font-weight: 600;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.35);
  margin-bottom: 10px;
}

/* Ref images */
.ref-slots { display: flex; gap: 8px; flex-wrap: wrap; }
.ref-upload, .ref-empty, .ref-thumb {
  width: 52px; height: 52px; border-radius: 10px; flex-shrink: 0;
}
.ref-upload {
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.04);
  border: 1px dashed rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.35);
  cursor: pointer;
  transition: all 0.2s;
}
.ref-upload:hover { border-color: rgba(239,68,68,0.4); color: #ef4444; }
.ref-empty { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); }
.ref-thumb { position: relative; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
.ref-thumb img { width: 100%; height: 100%; object-fit: cover; }
.ref-remove {
  position: absolute; top: 2px; right: 2px;
  width: 18px; height: 18px; border-radius: 50%;
  background: rgba(0,0,0,0.7); border: none; color: #fff;
  cursor: pointer; opacity: 0; transition: opacity 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.ref-thumb:hover .ref-remove { opacity: 1; }
.hidden-input { display: none; }

/* Camera */
.camera-select-wrap { position: relative; }
.camera-select-btn {
  display: flex; align-items: center; gap: 8px;
  width: 100%; padding: 10px 12px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  color: rgba(255,255,255,0.8); font-size: 13px;
  cursor: pointer; transition: all 0.2s;
}
.camera-select-btn:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.12); }
.camera-select-btn .arrow { margin-left: auto; font-size: 12px; color: rgba(255,255,255,0.3); }

.camera-menu {
  position: absolute; bottom: calc(100% + 6px); left: 0;
  z-index: 30; width: 280px; max-height: 320px;
  overflow-y: auto; padding: 6px;
  background: rgba(20,20,28,0.98);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  backdrop-filter: blur(16px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}

.camera-opt {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 9px 10px;
  background: none; border: none; border-radius: 8px;
  color: rgba(255,255,255,0.75); font-size: 13px;
  text-align: left; cursor: pointer; transition: all 0.15s;
}
.camera-opt:hover, .camera-opt.active { background: rgba(239,68,68,0.1); color: #f87171; }

.camera-opt-preview {
  width: 56px; height: 34px; border-radius: 5px;
  overflow: hidden; flex-shrink: 0;
  background: rgba(0,0,0,0.3); position: relative;
}
.camera-opt-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.camera-opt-placeholder {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.2);
}
.camera-opt-label { flex: 1; min-width: 0; }

.rhythm-chart {
  width: 100%; height: 40px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px; overflow: hidden;
}
.rhythm-chart svg { width: 100%; height: 100%; }

.duration-wrap { display: flex; align-items: center; gap: 10px; }
.duration-wrap :deep(.el-slider) { flex: 1; }
.duration-val { font-size: 12px; color: rgba(255,255,255,0.5); white-space: nowrap; }

.chip-row { display: flex; flex-wrap: wrap; gap: 5px; }
.chip {
  padding: 5px 12px; border-radius: 6px;
  font-size: 11px; background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.5); cursor: pointer;
  transition: all 0.2s;
}
.chip:hover { color: #fff; border-color: rgba(255,255,255,0.12); }
.chip.active {
  background: rgba(239,68,68,0.12);
  border-color: rgba(239,68,68,0.3);
  color: #f87171;
}

/* Main preview */
.film-main {
  display: flex; align-items: center; justify-content: center;
  padding: 32px 48px;
}

.film-preview { width: 100%; max-width: 900px; }

.monitor-frame {
  background: #111118;
  border: 2px solid #2a2a36;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.03);
}

.monitor-screen {
  aspect-ratio: 16 / 9;
  display: flex; align-items: center; justify-content: center;
  position: relative;
  background: #0a0a10;
}

.monitor-loading, .monitor-empty {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; color: rgba(255,255,255,0.25); text-align: center;
  padding: 24px;
}
.monitor-empty p { font-size: clamp(18px, 2.5vw, 24px); color: rgba(255,255,255,0.3); margin: 0; }
.monitor-empty span { font-size: 13px; color: rgba(255,255,255,0.2); }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.monitor-player {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; color: rgba(239,68,68,0.6); cursor: pointer;
}

.monitor-progress {
  position: absolute; bottom: 16px; left: 24px; right: 24px;
  display: flex; align-items: center; gap: 12px;
}
.progress-track {
  flex: 1; height: 3px;
  background: rgba(255,255,255,0.1);
  border-radius: 2px; overflow: hidden;
}
.progress-fill {
  width: 28%; height: 100%;
  background: #ef4444; border-radius: 2px;
}
.monitor-progress span { font-size: 11px; color: rgba(255,255,255,0.35); font-family: monospace; white-space: nowrap; }

.monitor-label {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 16px;
  font-size: 12px; font-weight: 600;
  color: rgba(255,255,255,0.5);
  font-family: monospace;
}
.monitor-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #ef4444;
  box-shadow: 0 0 8px #ef4444;
  animation: pulse 1.5s infinite;
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

/* Timeline */
.timeline {
  margin-top: 12px;
  padding: 0 4px;
}
.timeline-track {
  display: flex; gap: 0;
  height: 24px; align-items: flex-end;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 4px;
  padding: 0 8px;
}
.timeline-tick {
  flex: 1; height: 8px;
  border-right: 1px solid rgba(255,255,255,0.06);
}
.timeline-tick.major { height: 16px; border-color: rgba(255,255,255,0.12); }
.timeline-label {
  text-align: right;
  font-size: 10px; color: rgba(255,255,255,0.2);
  font-family: monospace; margin-top: 4px;
}

/* Control bar */
.control-bar {
  position: fixed; bottom: 24px; left: 24px; right: 24px;
  z-index: 20;
}
.control-dock {
  background: rgba(22,22,22,0.92);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px; overflow: visible;
}

.prompt-bar { padding: 16px 20px 12px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.prompt-input {
  width: 100%; background: transparent; border: none; outline: none;
  resize: none; font-size: 16px; line-height: 1.5; color: #fff;
  font-family: inherit; min-height: 24px; max-height: 120px;
}
.prompt-input::placeholder { color: rgba(255,255,255,0.3); }

.control-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; padding: 12px 16px; position: relative;
}
.control-left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; flex: 1; }

.ctrl-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 10px 14px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  color: rgba(255,255,255,0.85); font-size: 13px;
  cursor: pointer; transition: all 0.2s;
}
.ctrl-btn:hover { background: rgba(255,255,255,0.08); }
.ctrl-icon { font-size: 15px; opacity: 0.5; }

.quantity-ctrl {
  display: flex; align-items: center; gap: 4px;
  padding: 6px 10px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  font-size: 13px; color: rgba(255,255,255,0.8);
}
.qty-btn {
  width: 26px; height: 26px;
  background: rgba(255,255,255,0.06); border: none;
  border-radius: 8px; color: #fff; font-size: 15px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.generate-btn {
  display: flex; flex-direction: column; align-items: center;
  padding: 14px 32px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  border: none; border-radius: 16px; cursor: pointer;
  flex-shrink: 0; min-width: 130px;
  box-shadow: 0 4px 24px rgba(239,68,68,0.3);
  transition: all 0.25s;
}
.generate-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(239,68,68,0.4); }
.generate-btn.generating { opacity: 0.7; pointer-events: none; }
.gen-label { font-size: 15px; font-weight: 800; color: #fff; letter-spacing: 0.04em; }
.gen-cost {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; color: rgba(255,255,255,0.7); margin-top: 2px;
}

/* Model dropdown */
.model-dropdown {
  position: absolute; bottom: calc(100% + 8px); left: 0;
  z-index: 30; width: 320px; max-height: 360px;
  overflow-y: auto; padding: 8px;
  background: rgba(22,22,22,0.98);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  backdrop-filter: blur(16px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}
.model-dropdown-search { padding: 0 4px 8px; border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 4px; }
.model-dropdown-search :deep(.el-input__wrapper) { border-radius: 10px; background: rgba(255,255,255,0.04) !important; }
.model-dropdown-empty { padding: 24px 16px; text-align: center; font-size: 13px; color: rgba(255,255,255,0.35); }
.model-dropdown-item {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 10px 12px;
  background: none; border: none; border-radius: 10px;
  color: rgba(255,255,255,0.8); font-size: 13px;
  text-align: left; cursor: pointer; transition: all 0.15s;
}
.model-dropdown-item:hover, .model-dropdown-item.active { background: rgba(239,68,68,0.1); color: #f87171; }
.model-dropdown-name { font-weight: 600; flex: 1; }
.model-dropdown-provider { font-size: 11px; color: rgba(255,255,255,0.35); }
.model-dropdown-price { font-size: 11px; color: rgba(255,255,255,0.3); font-family: monospace; }
.model-dropdown-check { color: #f87171; font-size: 16px; }

/* Transitions */
.menu-fade-enter-active, .menu-fade-leave-active { transition: all 0.2s; }
.menu-fade-enter-from, .menu-fade-leave-to { opacity: 0; transform: translateY(6px); }

@media (max-width: 1024px) {
  .film-layout { grid-template-columns: 1fr; }
  .film-toolbar { max-height: none; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); }
}
</style>
