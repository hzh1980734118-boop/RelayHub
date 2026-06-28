<template>
  <div class="audio-studio" @click="closePopovers">
    <div class="studio-bg">
      <div class="bg-glow bg-glow-green"></div>
    </div>

    <!-- Header -->
    <header class="studio-header">
      <router-link to="/" class="logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 12h5l2-3 2 6 2-3h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span>RelayHub</span>
      </router-link>

      <nav class="audio-nav">
        <button :class="{ active: activeTab === 'tts' }" @click="activeTab = 'tts'">文字转语音</button>
        <button :class="{ active: activeTab === 'assets' }" @click="activeTab = 'assets'">声音资产</button>
        <button :class="{ active: activeTab === 'clone' }" @click="activeTab = 'clone'">音色克隆</button>
      </nav>

      <div class="header-right">
        <span class="quota-badge">
          <el-icon><Present /></el-icon>
          本月免费 10,000 字符
        </span>
        <router-link to="/dashboard">
          <el-button plain size="small">控制台</el-button>
        </router-link>
      </div>
    </header>

    <!-- TTS 主界面 -->
    <template v-if="activeTab === 'tts'">
      <div class="tts-layout">
        <!-- 左侧音色库 -->
        <aside class="voice-sidebar">
          <div class="sidebar-search">
            <el-input v-model="voiceSearch" placeholder="搜索音色..." prefix-icon="Search" size="small" clearable />
          </div>

          <div class="voice-categories">
            <button
              v-for="cat in voiceCategories"
              :key="cat"
              type="button"
              class="cat-btn"
              :class="{ active: activeCategory === cat }"
              @click="activeCategory = cat"
            >{{ cat }}</button>
          </div>

          <div class="voice-grid">
            <button
              v-for="voice in filteredVoices"
              :key="voice.id"
              type="button"
              class="voice-card"
              :class="{ active: selectedVoice === voice.id }"
              @click="selectedVoice = voice.id"
            >
              <div class="voice-card-avatar" :style="{ background: voice.gradient }">
                <el-icon :size="20"><Microphone /></el-icon>
              </div>
              <div class="voice-card-info">
                <span class="voice-card-name">{{ voice.name }}</span>
                <span class="voice-card-lang">{{ voice.lang }}</span>
              </div>
              <span v-if="voice.tag" class="voice-card-tag">{{ voice.tag }}</span>
            </button>
          </div>
        </aside>

        <!-- 主区域 -->
        <main class="tts-main">
          <div class="tts-preview-area">
            <div v-if="script.trim()" class="preview-text">{{ script }}</div>
            <div v-else class="preview-empty">
              <el-icon :size="48"><Microphone /></el-icon>
              <p>输入文本，选择音色，生成配音</p>
            </div>
          </div>
        </main>
      </div>

      <!-- 底部输入栏 -->
      <footer class="control-bar">
        <div class="control-dock">
          <div class="prompt-input-bar">
            <textarea
              ref="scriptInputRef"
              v-model="script"
              class="prompt-input-inline"
              placeholder="输入需要转换为语音的文本..."
              rows="1"
              @input="autoResizeInput"
            ></textarea>
          </div>
          <div class="control-toolbar">
            <div class="control-left">
              <button type="button" class="ctrl-btn" @click.stop="togglePopover('speed')">
                <el-icon><Odometer /></el-icon>
                语速 {{ speed }}
              </button>
              <button type="button" class="ctrl-btn" @click.stop="togglePopover('emotion')">
                <el-icon><Sunny /></el-icon>
                情感 {{ emotion }}
              </button>
              <button type="button" class="ctrl-btn" @click.stop="togglePopover('pitch')">
                <el-icon><TrendCharts /></el-icon>
                音调 {{ pitch }}
              </button>
            </div>
            <button type="button" class="generate-btn" :class="{ generating }" @click="handleGenerate">
              <span class="gen-label">{{ generating ? '生成中...' : '生成配音' }}</span>
              <span class="gen-cost">
                <el-icon><Coin /></el-icon>
                约 {{ estimatedChars }} 字符
              </span>
            </button>
          </div>
        </div>

        <!-- 参数弹出 -->
        <div v-if="activePopover" class="param-popover" @click.stop>
          <button
            v-for="opt in popoverOptions"
            :key="opt"
            type="button"
            class="popover-opt"
            :class="{ active: isOptionActive(opt) }"
            @click="selectPopoverOption(opt)"
          >{{ opt }}</button>
        </div>
      </footer>
    </template>

    <!-- 声音资产页面 -->
    <template v-if="activeTab === 'assets'">
      <div class="assets-page">
        <div class="assets-header">
          <h2>声音资产</h2>
          <div class="assets-actions">
            <el-input v-model="assetSearch" placeholder="搜索资产..." prefix-icon="Search" size="default" clearable class="asset-search-input" />
            <el-button type="primary" size="default">
              <el-icon><Upload /></el-icon>
              上传音频
            </el-button>
          </div>
        </div>

        <div class="assets-categories">
          <button
            v-for="cat in assetCategories"
            :key="cat"
            type="button"
            class="asset-cat-btn"
            :class="{ active: activeAssetCat === cat }"
            @click="activeAssetCat = cat"
          >{{ cat }}</button>
        </div>

        <div class="assets-grid">
          <div v-for="asset in filteredAssets" :key="asset.id" class="asset-card">
            <div class="asset-card-preview" :style="{ background: asset.gradient }">
              <el-icon :size="32"><VideoPlay /></el-icon>
            </div>
            <div class="asset-card-body">
              <h4>{{ asset.name }}</h4>
              <div class="asset-card-meta">
                <span>{{ asset.category }}</span>
                <span>{{ asset.duration }}</span>
              </div>
              <div class="asset-card-actions">
                <el-button size="small" plain>
                  <el-icon><VideoPlay /></el-icon>
                  试听
                </el-button>
                <el-button size="small" type="primary" plain>使用</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 音色克隆页面 -->
    <template v-if="activeTab === 'clone'">
      <div class="clone-page">
        <div class="clone-content">
          <div class="clone-icon">
            <el-icon :size="56"><Microphone /></el-icon>
          </div>
          <h2>音色克隆</h2>
          <p>上传一段音频样本，AI 将学习并克隆您的专属音色</p>

          <div class="clone-upload-zone">
            <div class="upload-area" @click="triggerCloneUpload" @dragover.prevent @drop.prevent="handleCloneDrop">
              <el-icon :size="40"><Upload /></el-icon>
              <span class="upload-title">拖拽或点击上传音频</span>
              <span class="upload-hint">支持 MP3 / WAV / M4A，时长 10 秒 - 5 分钟</span>
            </div>
            <input ref="cloneFileInput" type="file" accept="audio/*" class="hidden-input" @change="handleCloneUpload" />
          </div>

          <div class="clone-settings">
            <el-form label-position="top" class="clone-form">
              <el-form-item label="克隆音色名称">
                <el-input v-model="cloneName" placeholder="为你的音色取个名字..." />
              </el-form-item>
              <el-form-item label="参考文本（可选）">
                <el-input v-model="cloneRefText" type="textarea" :rows="2" placeholder="输入音频对应的文本内容，可提升克隆效果" />
              </el-form-item>
            </el-form>
          </div>

          <el-button type="primary" size="large" class="clone-start-btn" :disabled="!cloneFile">
            <el-icon><MagicStick /></el-icon>
            开始克隆
          </el-button>

          <!-- 已克隆音色 -->
          <div v-if="clonedVoices.length > 0" class="cloned-list">
            <h3>已克隆音色</h3>
            <div class="cloned-grid">
              <div v-for="voice in clonedVoices" :key="voice.id" class="cloned-card">
                <div class="cloned-avatar" :style="{ background: voice.gradient }">
                  <el-icon :size="24"><UserFilled /></el-icon>
                </div>
                <span class="cloned-name">{{ voice.name }}</span>
                <span class="cloned-date">{{ voice.date }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 生成结果弹窗 -->
    <Transition name="fade">
      <div v-if="showResult" class="result-overlay" @click="showResult = false">
        <div class="result-card" @click.stop>
          <h3>配音生成完成</h3>
          <div class="audio-player-mock">
            <div class="player-waveform">
              <span v-for="n in 24" :key="n" class="wave-bar" :style="{ height: `${15 + Math.random() * 50}px` }"></span>
            </div>
            <div class="player-controls">
              <el-icon :size="40"><VideoPlay /></el-icon>
              <span>点击播放预览</span>
            </div>
          </div>
          <span class="result-voice">音色：{{ currentVoiceName }}</span>
          <el-button type="primary" @click="showResult = false">关闭</el-button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { voicePresets } from '@/data/models.js'

const activeTab = ref('tts')
const script = ref('')
const selectedVoice = ref('v1')
const generating = ref(false)
const showResult = ref(false)
const speed = ref('1.0x')
const emotion = ref('自然')
const pitch = ref('标准')
const voiceSearch = ref('')
const activeCategory = ref('全部')
const activePopover = ref(null)
const scriptInputRef = ref(null)
const cloneFileInput = ref(null)

// 声音资产
const assetSearch = ref('')
const activeAssetCat = ref('全部')
const cloneFile = ref(null)
const cloneName = ref('')
const cloneRefText = ref('')
const clonedVoices = ref([
  { id: 'c1', name: '我的音色 01', date: '2026-06-20', gradient: 'linear-gradient(135deg, #4ade80, #22c55e)' },
])

const voiceCategories = ['全部', '推荐', '男声', '女声', '童声', '方言', '英语']
const assetCategories = ['全部', '背景音乐', '音效', '片头', '转场', '环境音', '配音素材']

const filteredVoices = computed(() => {
  let list = voicePresets.value
  if (voiceSearch.value) {
    const q = voiceSearch.value.toLowerCase()
    list = list.filter(v => v.name.toLowerCase().includes(q) || v.desc.toLowerCase().includes(q))
  }
  return list
})

const currentVoiceName = computed(() =>
  voicePresets.value.find(v => v.id === selectedVoice.value)?.name ?? '未选择'
)

const estimatedChars = computed(() => script.value.length)

const popoverOptions = computed(() => {
  const map = {
    speed: ['0.5x', '0.75x', '1.0x', '1.25x', '1.5x', '2.0x'],
    emotion: ['自然', '高兴', '悲伤', '愤怒', '温柔', '严肃', '惊讶'],
    pitch: ['低', '标准', '高'],
  }
  return map[activePopover.value] || []
})

// 声音资产模拟数据
const assets = ref([
  { id: 1, name: '轻松背景音乐', category: '背景音乐', duration: '2:30', gradient: 'linear-gradient(135deg, #1a3a2a, #0d1f15)' },
  { id: 2, name: '打字机音效', category: '音效', duration: '0:05', gradient: 'linear-gradient(135deg, #2a1a3a, #150d1f)' },
  { id: 3, name: '新闻片头', category: '片头', duration: '0:15', gradient: 'linear-gradient(135deg, #3a2a1a, #1f150d)' },
  { id: 4, name: '场景转场', category: '转场', duration: '0:03', gradient: 'linear-gradient(135deg, #1a2a2a, #0d1515)' },
  { id: 5, name: '城市环境音', category: '环境音', duration: '1:20', gradient: 'linear-gradient(135deg, #2a2a1a, #15150d)' },
  { id: 6, name: '雨中街道', category: '环境音', duration: '3:00', gradient: 'linear-gradient(135deg, #1a1a3a, #0d0d1f)' },
  { id: 7, name: '广告配音素材-男声', category: '配音素材', duration: '0:30', gradient: 'linear-gradient(135deg, #3a1a2a, #1f0d15)' },
  { id: 8, name: '广告配音素材-女声', category: '配音素材', duration: '0:30', gradient: 'linear-gradient(135deg, #3a1a1a, #1f0d0d)' },
  { id: 9, name: '悬疑背景', category: '背景音乐', duration: '1:45', gradient: 'linear-gradient(135deg, #1a3a3a, #0d1f1f)' },
  { id: 10, name: '掌声音效', category: '音效', duration: '0:08', gradient: 'linear-gradient(135deg, #2a3a2a, #151f15)' },
  { id: 11, name: '科技感片头', category: '片头', duration: '0:12', gradient: 'linear-gradient(135deg, #1a2a3a, #0d151f)' },
  { id: 12, name: '直播背景', category: '背景音乐', duration: '5:00', gradient: 'linear-gradient(135deg, #3a2a2a, #1f1515)' },
])

const filteredAssets = computed(() => {
  let list = assets.value
  if (activeAssetCat.value !== '全部') {
    list = list.filter(a => a.category === activeAssetCat.value)
  }
  if (assetSearch.value) {
    const q = assetSearch.value.toLowerCase()
    list = list.filter(a => a.name.toLowerCase().includes(q) || a.category.toLowerCase().includes(q))
  }
  return list
})

onMounted(() => {
  const presets = voicePresets.value
  if (presets.length > 0) selectedVoice.value = presets[0].id
})

function togglePopover(key) {
  activePopover.value = activePopover.value === key ? null : key
}

function isOptionActive(opt) {
  const map = {
    speed: speed.value,
    emotion: emotion.value,
    pitch: pitch.value,
  }
  return map[activePopover.value] === opt
}

function selectPopoverOption(opt) {
  switch (activePopover.value) {
    case 'speed': speed.value = opt; break
    case 'emotion': emotion.value = opt; break
    case 'pitch': pitch.value = opt; break
  }
  activePopover.value = null
}

function closePopovers() {
  activePopover.value = null
}

function handleGenerate() {
  if (!script.value.trim()) {
    ElMessage.warning('请输入配音文本')
    scriptInputRef.value?.focus()
    return
  }
  generating.value = true
  setTimeout(() => {
    generating.value = false
    showResult.value = true
    ElMessage.success('配音生成完成')
  }, 2000)
}

function autoResizeInput() {
  const el = scriptInputRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${Math.min(el.scrollHeight, 120)}px`
}

function triggerCloneUpload() {
  cloneFileInput.value?.click()
}

function handleCloneUpload(e) {
  const file = e.target?.files?.[0] || e.dataTransfer?.files?.[0]
  if (file) {
    cloneFile.value = file
    cloneName.value = cloneName.value || file.name.replace(/\.[^.]+$/, '')
    ElMessage.success(`已选择：${file.name}`)
  }
}

function handleCloneDrop(e) {
  const file = e.dataTransfer?.files?.[0]
  if (file) {
    cloneFile.value = file
    cloneName.value = cloneName.value || file.name.replace(/\.[^.]+$/, '')
    ElMessage.success(`已选择：${file.name}`)
  }
}
</script>

<style scoped>
.audio-studio {
  min-height: 100vh;
  background: #080808;
  display: flex;
  flex-direction: column;
}

.studio-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.bg-glow-green {
  position: absolute;
  width: 500px;
  height: 400px;
  background: rgba(74, 222, 128, 0.08);
  border-radius: 50%;
  filter: blur(120px);
  bottom: 20%;
  right: 10%;
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

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
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

.logo-icon svg { width: 18px; height: 18px; }

.audio-nav {
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  padding: 4px;
}

.audio-nav button {
  padding: 8px 20px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.55);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.audio-nav button:hover { color: #fff; }
.audio-nav button.active {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.quota-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--accent-green);
  padding: 6px 12px;
  background: rgba(180, 255, 57, 0.08);
  border: 1px solid rgba(180, 255, 57, 0.2);
  border-radius: 999px;
}

/* TTS Layout */
.tts-layout {
  position: relative;
  z-index: 5;
  flex: 1;
  display: grid;
  grid-template-columns: 340px 1fr;
  padding-bottom: 200px;
}

.voice-sidebar {
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  padding: 20px;
  overflow-y: auto;
  max-height: calc(100vh - 280px);
}

.sidebar-search { margin-bottom: 16px; }

.sidebar-search :deep(.el-input__wrapper) {
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04) !important;
}

.voice-categories {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.cat-btn {
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  transition: all 0.2s;
}

.cat-btn:hover { color: #fff; border-color: rgba(255, 255, 255, 0.12); }
.cat-btn.active {
  background: rgba(74, 222, 128, 0.12);
  border-color: rgba(74, 222, 128, 0.3);
  color: #4ade80;
}

.voice-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.voice-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  color: #fff;
  transition: all 0.2s;
}

.voice-card:hover,
.voice-card.active {
  background: rgba(74, 222, 128, 0.06);
  border-color: rgba(74, 222, 128, 0.2);
}

.voice-card-avatar {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.6);
}

.voice-card-info {
  flex: 1;
  min-width: 0;
}

.voice-card-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
}

.voice-card-lang {
  display: block;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 2px;
}

.voice-card-tag {
  font-size: 10px;
  padding: 2px 8px;
  background: rgba(74, 222, 128, 0.15);
  color: #4ade80;
  border-radius: 999px;
  font-weight: 600;
}

.tts-main {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
}

.tts-preview-area {
  max-width: 640px;
  text-align: center;
}

.preview-text {
  font-size: clamp(22px, 3vw, 32px);
  line-height: 1.5;
  color: #7ec8e3;
  word-break: break-word;
}

.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: rgba(255, 255, 255, 0.2);
}

.preview-empty p {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.3);
}

/* Control bar */
.control-bar {
  position: fixed;
  bottom: 24px;
  left: 24px;
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
}

.prompt-input-inline::placeholder { color: rgba(255, 255, 255, 0.35); }

.control-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  position: relative;
}

.control-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  flex: 1;
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
  cursor: pointer;
  transition: all 0.2s;
}

.ctrl-btn:hover { background: rgba(255, 255, 255, 0.08); }

.generate-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 28px;
  background: linear-gradient(135deg, #4ade80, #22c55e);
  border: none;
  border-radius: 16px;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 0 4px 24px rgba(74, 222, 128, 0.3);
  transition: all 0.25s;
}

.generate-btn:hover { transform: translateY(-2px); }
.generate-btn.generating { opacity: 0.7; pointer-events: none; }

.gen-label { font-size: 15px; font-weight: 800; color: #000; }
.gen-cost { display: flex; align-items: center; gap: 4px; font-size: 11px; color: rgba(0,0,0,0.6); margin-top: 2px; }

/* Popover */
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
  background: rgba(74, 222, 128, 0.15);
  border-color: rgba(74, 222, 128, 0.3);
  color: #4ade80;
}

/* Assets page */
.assets-page {
  position: relative;
  z-index: 5;
  flex: 1;
  padding: 32px 40px 40px;
  overflow-y: auto;
}

.assets-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.assets-header h2 { font-size: 24px; font-weight: 700; }

.assets-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.asset-search-input { width: 240px; }

.assets-categories {
  display: flex;
  gap: 8px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.asset-cat-btn {
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 13px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  transition: all 0.2s;
}

.asset-cat-btn:hover { color: #fff; }
.asset-cat-btn.active {
  background: rgba(74, 222, 128, 0.12);
  border-color: rgba(74, 222, 128, 0.3);
  color: #4ade80;
}

.assets-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.asset-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s;
}

.asset-card:hover {
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.3);
}

.asset-card-preview {
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.4);
}

.asset-card-body {
  padding: 14px 16px;
}

.asset-card-body h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

.asset-card-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 12px;
}

.asset-card-actions {
  display: flex;
  gap: 8px;
}

/* Clone page */
.clone-page {
  position: relative;
  z-index: 5;
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 48px 24px 80px;
  overflow-y: auto;
}

.clone-content {
  max-width: 560px;
  width: 100%;
  text-align: center;
}

.clone-icon {
  width: 96px;
  height: 96px;
  border-radius: 24px;
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: #4ade80;
}

.clone-content h2 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.clone-content > p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 32px;
}

.clone-upload-zone { margin-bottom: 24px; }

.upload-area {
  border: 2px dashed rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 48px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.35);
  cursor: pointer;
  transition: all 0.2s;
}

.upload-area:hover {
  border-color: rgba(74, 222, 128, 0.4);
  color: #4ade80;
  background: rgba(74, 222, 128, 0.03);
}

.upload-title { font-size: 15px; font-weight: 500; color: rgba(255, 255, 255, 0.6); }
.upload-hint { font-size: 12px; color: rgba(255, 255, 255, 0.3); }

.hidden-input { display: none; }

.clone-settings {
  text-align: left;
  margin-bottom: 24px;
}

.clone-settings :deep(.el-form-item__label) {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
}

.clone-start-btn {
  width: 100%;
  max-width: 280px;
  padding: 14px 32px;
  font-size: 16px;
}

/* Cloned list */
.cloned-list {
  margin-top: 48px;
  text-align: left;
}

.cloned-list h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.cloned-grid {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.cloned-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  min-width: 100px;
}

.cloned-avatar {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.5);
}

.cloned-name { font-size: 13px; font-weight: 500; }
.cloned-date { font-size: 11px; color: rgba(255, 255, 255, 0.35); }

/* Result overlay */
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
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  max-width: 420px;
  width: 100%;
}

.result-card h3 {
  font-size: 18px;
  margin-bottom: 24px;
}

.audio-player-mock {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px;
  margin-bottom: 20px;
  background: rgba(74, 222, 128, 0.05);
  border: 1px solid rgba(74, 222, 128, 0.1);
  border-radius: 16px;
}

.player-waveform {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 60px;
}

.wave-bar {
  width: 4px;
  background: #4ade80;
  border-radius: 2px;
  opacity: 0.6;
}

.player-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #4ade80;
  cursor: pointer;
  font-size: 14px;
}

.result-voice {
  display: block;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 20px;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }

@media (max-width: 768px) {
  .tts-layout { grid-template-columns: 1fr; }
  .voice-sidebar { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); max-height: 300px; }
  .assets-grid { grid-template-columns: repeat(2, 1fr); }
  .audio-nav { display: none; }
  .quota-badge { display: none; }
}
</style>
