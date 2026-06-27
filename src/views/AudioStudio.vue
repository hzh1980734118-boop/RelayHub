<template>
  <div class="audio-studio">
    <div class="studio-bg">
      <div class="bg-glow bg-glow-green"></div>
    </div>

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
        <router-link to="/studio/audio" class="active">配音</router-link>
      </nav>

      <div class="header-right">
        <span class="quota-badge">
          <el-icon><Present /></el-icon>
          本月免费额度 10,000 字符
        </span>
        <router-link to="/dashboard">
          <el-button plain size="small">控制台</el-button>
        </router-link>
      </div>
    </header>

    <div class="audio-layout">
      <!-- 左侧音色库 -->
      <aside class="voice-sidebar">
        <div class="sidebar-header">
          <h3>音色库</h3>
          <el-button type="primary" size="small" plain>
            <el-icon><Upload /></el-icon>
            克隆音色
          </el-button>
        </div>
        <p class="sidebar-tip">接入 Fish Audio，支持原有音频资产与音色克隆</p>

        <div class="voice-list">
          <button
            v-for="voice in voicePresets"
            :key="voice.id"
            type="button"
            class="voice-item"
            :class="{ active: selectedVoice === voice.id }"
            @click="selectedVoice = voice.id"
          >
            <div class="voice-avatar">
              <el-icon><Microphone /></el-icon>
            </div>
            <div class="voice-info">
              <div class="voice-name-row">
                <span>{{ voice.name }}</span>
                <span v-if="voice.tag" class="voice-tag">{{ voice.tag }}</span>
              </div>
              <p>{{ voice.desc }}</p>
            </div>
          </button>
        </div>

        <div class="asset-section">
          <h4>音频资产</h4>
          <div class="asset-grid">
            <div v-for="asset in audioAssets" :key="asset" class="asset-chip">{{ asset }}</div>
          </div>
        </div>
      </aside>

      <!-- 主区域 -->
      <main class="audio-main">
        <div class="preview-area">
          <div v-if="script.trim()" class="preview-text">{{ script }}</div>
          <div v-else class="preview-empty">在下方输入需要配音的文本...</div>
        </div>
      </main>
    </div>

    <!-- 底部输入与控制 -->
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
            <button type="button" class="ctrl-btn" @click="showModelPanel = !showModelPanel">
              <el-icon><Cpu /></el-icon>
              {{ selectedModel?.name || '选择模型' }}
            </button>
            <button type="button" class="ctrl-btn">
              <el-icon><Microphone /></el-icon>
              {{ currentVoiceName }}
            </button>
            <button type="button" class="ctrl-btn">
              <el-icon><Odometer /></el-icon>
              语速 {{ speed }}
            </button>
            <button type="button" class="ctrl-btn">
              <el-icon><Sunny /></el-icon>
              情感 {{ emotion }}
            </button>
          </div>
          <button type="button" class="generate-btn" :class="{ generating }" @click="handleGenerate">
            <span class="gen-label">{{ generating ? '生成中...' : '生成配音' }}</span>
            <span class="gen-cost">免费额度</span>
          </button>
        </div>
      </div>

      <Transition name="panel-slide">
        <aside v-if="showModelPanel" class="model-panel" @click.stop>
          <h4>配音模型</h4>
          <button
            v-for="model in audioModels"
            :key="model.id"
            type="button"
            class="model-item"
            :class="{ selected: selectedModel?.id === model.id }"
            @click="selectModel(model)"
          >
            <span>{{ model.name }}</span>
            <span class="model-desc-sm">{{ model.desc }}</span>
          </button>
        </aside>
      </Transition>
    </footer>

    <Transition name="fade">
      <div v-if="showResult" class="result-overlay" @click="showResult = false">
        <div class="result-card" @click.stop>
          <h3>配音生成完成</h3>
          <div class="audio-player-mock">
            <el-icon :size="48"><VideoPlay /></el-icon>
            <span>音频预览（演示）</span>
          </div>
          <el-button type="primary" @click="showResult = false">关闭</el-button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAvailableModels, voicePresets } from '@/data/models.js'

const script = ref('')
const selectedVoice = ref('v1')
const selectedModel = ref(null)
const showModelPanel = ref(false)
const generating = ref(false)
const showResult = ref(false)
const speed = ref('1.0x')
const emotion = ref('自然')
const scriptInputRef = ref(null)

const audioModels = computed(() => getAvailableModels('audio'))
const audioAssets = ['背景音乐', '音效库', '片头模板', '转场音效', '环境音']

const currentVoiceName = computed(() =>
  voicePresets.value.find(v => v.id === selectedVoice.value)?.name ?? '选择音色'
)

onMounted(() => {
  selectedModel.value = audioModels.value[0] ?? null
})

function selectModel(model) {
  selectedModel.value = model
  showModelPanel.value = false
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
  background: rgba(74, 222, 128, 0.1);
  border-radius: 50%;
  filter: blur(120px);
  bottom: 20%;
  right: 10%;
}

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

.studio-nav a:hover { color: #fff; }

.studio-nav a.active,
.studio-nav a.router-link-active {
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

.audio-layout {
  position: relative;
  z-index: 5;
  flex: 1;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 0;
  padding-bottom: 200px;
}

.voice-sidebar {
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  padding: 24px;
  overflow-y: auto;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.sidebar-header h3 {
  font-size: 16px;
  font-weight: 600;
}

.sidebar-tip {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 20px;
  line-height: 1.5;
}

.voice-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.voice-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
  color: #fff;
  transition: all 0.2s;
}

.voice-item:hover,
.voice-item.active {
  background: rgba(74, 222, 128, 0.08);
  border-color: rgba(74, 222, 128, 0.25);
}

.voice-avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #4ade80;
}

.voice-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 600;
}

.voice-tag {
  font-size: 10px;
  padding: 2px 6px;
  background: var(--accent-green);
  color: #000;
  border-radius: 4px;
  font-weight: 700;
}

.voice-info p {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
}

.asset-section h4 {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 12px;
}

.asset-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.asset-chip {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
}

.audio-main {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
}

.preview-area {
  max-width: 640px;
  text-align: center;
}

.preview-text {
  font-size: clamp(22px, 3vw, 32px);
  line-height: 1.5;
  color: #7ec8e3;
}

.preview-empty {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.25);
}

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
}

.prompt-input-inline::placeholder { color: rgba(255, 255, 255, 0.35); }

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
}

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
}

.gen-label {
  font-size: 15px;
  font-weight: 800;
  color: #000;
}

.gen-cost {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.6);
}

.model-panel {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 16px;
  width: 280px;
  background: rgba(18, 18, 18, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 12px;
}

.model-panel h4 {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 8px;
  padding: 0 8px;
}

.model-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: 10px 12px;
  background: transparent;
  border: none;
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  text-align: left;
}

.model-item:hover,
.model-item.selected {
  background: rgba(255, 255, 255, 0.06);
}

.model-desc-sm {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 4px;
}

.result-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  max-width: 400px;
}

.audio-player-mock {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px;
  margin: 20px 0;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  color: var(--text-muted);
}

.panel-slide-enter-active,
.panel-slide-leave-active { transition: all 0.2s; }
.panel-slide-enter-from,
.panel-slide-leave-to { opacity: 0; transform: translateY(8px); }

.fade-enter-active,
.fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }

@media (max-width: 768px) {
  .studio-nav { display: none; }
  .quota-badge { display: none; }
  .audio-layout { grid-template-columns: 1fr; }
  .voice-sidebar { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); }
}
</style>
