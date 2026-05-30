<template>
  <div class="home">
    <AppHeader />

    <!-- Hero -->
    <section class="hero">
      <div class="hero-glow"></div>
      <div class="hero-content">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          全新上线 · 支持 30+ AI 模型
        </div>
        <h1 class="hero-title">
          统一 API<br />
          <span class="gradient-text">连接全球 AI 模型</span>
        </h1>
        <p class="hero-desc">
          一个接口，无限可能。RelayHub 为您提供稳定、高速的 AI 模型中转服务，
          兼容 OpenAI 格式，即插即用。
        </p>
        <div class="hero-actions">
          <router-link to="/dashboard">
            <el-button type="primary" size="large">开始使用</el-button>
          </router-link>
          <router-link to="/docs">
            <el-button plain size="large">查看文档</el-button>
          </router-link>
        </div>
        <div class="hero-stats">
          <div v-for="stat in stats" :key="stat.label" class="stat-item">
            <span class="stat-value">{{ stat.value }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Feature Cards -->
    <section class="section features">
      <div class="section-inner">
        <div class="feature-cards">
          <div
            v-for="(feature, i) in features"
            :key="feature.title"
            class="feature-card"
            :style="{ '--delay': `${i * 0.1}s` }"
          >
            <div class="feature-icon" :style="{ background: feature.gradient }">
              <el-icon :size="24"><component :is="feature.icon" /></el-icon>
            </div>
            <div class="feature-tag">{{ feature.tag }}</div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.desc }}</p>
            <a href="#" class="feature-link">
              了解更多
              <el-icon><ArrowRight /></el-icon>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Models Showcase -->
    <section class="section models-showcase">
      <div class="section-inner">
        <div class="section-header">
          <h2>支持的 AI 模型</h2>
          <p>接入全球顶尖 AI 模型，持续更新扩展</p>
        </div>
        <div class="model-grid">
          <div
            v-for="model in models"
            :key="model.name"
            class="model-card"
          >
            <div class="model-header">
              <span class="model-type" :class="model.type">{{ model.typeLabel }}</span>
              <el-tag v-if="model.hot" size="small" effect="dark" type="warning">热门</el-tag>
            </div>
            <h3>{{ model.name }}</h3>
            <p>{{ model.desc }}</p>
            <div class="model-meta">
              <span>{{ model.provider }}</span>
              <span class="model-price">{{ model.price }}</span>
            </div>
          </div>
        </div>
        <div class="section-cta">
          <router-link to="/models">
            <el-button plain size="large">查看全部模型</el-button>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Presets / Tags -->
    <section class="section presets">
      <div class="section-inner">
        <div class="section-header">
          <h2>快速接入场景</h2>
          <p>覆盖主流 AI 应用场景，开箱即用</p>
        </div>
        <div class="preset-tags">
          <span v-for="tag in presetTags" :key="tag" class="preset-tag">{{ tag }}</span>
        </div>
        <div class="preset-grid">
          <div
            v-for="preset in presets"
            :key="preset.title"
            class="preset-card"
          >
            <div class="preset-thumb" :style="{ background: preset.bg }">
              <span class="preset-label">{{ preset.title }}</span>
            </div>
            <div class="preset-info">
              <h4>{{ preset.title }}</h4>
              <span>by {{ preset.author }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Banner -->
    <section class="section banner-section">
      <div class="section-inner">
        <div class="banner-card">
          <div class="banner-content">
            <span class="banner-badge">新功能</span>
            <h2>一个控制台，管理所有 API</h2>
            <p>实时监控用量、管理密钥、查看账单 — 全部在一个面板完成</p>
            <router-link to="/dashboard">
              <el-button type="primary" size="large">进入控制台</el-button>
            </router-link>
          </div>
          <div class="banner-visual">
            <div class="mock-dashboard">
              <div class="mock-bar"></div>
              <div class="mock-sidebar"></div>
              <div class="mock-content">
                <div class="mock-line long"></div>
                <div class="mock-line medium"></div>
                <div class="mock-chart"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Explore Tags -->
    <section class="section explore">
      <div class="section-inner">
        <h2 class="explore-title">探索更多能力</h2>
        <div class="explore-tags">
          <span v-for="tag in exploreTags" :key="tag">{{ tag }}</span>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const stats = [
  { value: '30+', label: '支持模型' },
  { value: '99.9%', label: '服务可用性' },
  { value: '<50ms', label: '平均延迟' },
  { value: '10M+', label: '日请求量' },
]

const features = [
  {
    icon: 'Connection',
    tag: 'API 中转',
    title: '统一 API 网关',
    desc: '兼容 OpenAI 格式，一行代码切换任意模型，无需修改业务逻辑。',
    gradient: 'linear-gradient(135deg, #a855f720, #3b82f620)',
  },
  {
    icon: 'Lightning',
    tag: '高速稳定',
    title: '全球加速节点',
    desc: '多区域部署，智能路由，确保最低延迟与最高可用性。',
    gradient: 'linear-gradient(135deg, #b4ff3920, #22c55e20)',
  },
  {
    icon: 'DataAnalysis',
    tag: '实时监控',
    title: '用量可视化',
    desc: '实时追踪 API 调用、Token 消耗与费用，精细到每次请求。',
    gradient: 'linear-gradient(135deg, #f9731620, #ef444420)',
  },
  {
    icon: 'Lock',
    tag: '安全可靠',
    title: '企业级安全',
    desc: '密钥加密存储、IP 白名单、请求签名，全方位保护您的数据。',
    gradient: 'linear-gradient(135deg, #8b5cf620, #a855f720)',
  },
]

const models = [
  { name: 'GPT-4o', type: 'chat', typeLabel: '对话', provider: 'OpenAI', price: '¥0.03/1K tokens', desc: '最强通用对话模型', hot: true },
  { name: 'Claude 3.5 Sonnet', type: 'chat', typeLabel: '对话', provider: 'Anthropic', price: '¥0.02/1K tokens', desc: '长文本理解与推理', hot: true },
  { name: 'Gemini 2.0 Flash', type: 'chat', typeLabel: '对话', provider: 'Google', price: '¥0.01/1K tokens', desc: '快速响应多模态模型', hot: false },
  { name: 'DALL·E 3', type: 'image', typeLabel: '图像', provider: 'OpenAI', price: '¥0.08/张', desc: '高质量 AI 图像生成', hot: false },
  { name: 'Sora', type: 'video', typeLabel: '视频', provider: 'OpenAI', price: '¥0.5/秒', desc: '文本生成视频', hot: true },
  { name: 'Whisper', type: 'audio', typeLabel: '音频', provider: 'OpenAI', price: '¥0.006/分钟', desc: '语音转文字', hot: false },
]

const presetTags = [
  '智能对话', '代码生成', '图像创作', '视频生成', '语音合成',
  '文档分析', '翻译', 'Embedding', 'Function Call', 'RAG',
]

const presets = [
  { title: '智能客服', author: 'RelayHub', bg: 'linear-gradient(135deg, #1e3a5f, #0d1b2a)' },
  { title: '代码助手', author: 'RelayHub', bg: 'linear-gradient(135deg, #2d1b4e, #1a0a2e)' },
  { title: '内容创作', author: 'RelayHub', bg: 'linear-gradient(135deg, #1b4332, #081c15)' },
  { title: '数据分析', author: 'RelayHub', bg: 'linear-gradient(135deg, #4a1942, #2d0f28)' },
  { title: '图像设计', author: 'RelayHub', bg: 'linear-gradient(135deg, #3d2b1f, #1a120b)' },
  { title: '视频制作', author: 'RelayHub', bg: 'linear-gradient(135deg, #1f3d3d, #0f1f1f)' },
]

const exploreTags = [
  'ChatGPT', 'Claude', 'Gemini', 'DALL·E', 'Midjourney', 'Stable Diffusion',
  'Sora', 'Kling', 'Whisper', 'TTS', 'Embedding', 'Fine-tuning',
  'Function Call', 'Vision', 'JSON Mode', 'Stream', 'Batch API',
  'Rate Limit', 'Load Balance', 'Failover', 'SDK', 'Webhook',
]
</script>

<style scoped>
.home {
  background: var(--bg-primary);
}

/* Hero */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120px 24px 80px;
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 600px;
  background: var(--gradient-hero);
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
}

.hero-content {
  position: relative;
  text-align: center;
  max-width: 800px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  border-radius: 999px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: var(--accent-green);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.hero-title {
  font-size: clamp(40px, 6vw, 72px);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin-bottom: 24px;
}

.gradient-text {
  background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-desc {
  font-size: 18px;
  color: var(--text-secondary);
  line-height: 1.7;
  max-width: 560px;
  margin: 0 auto 40px;
}

.hero-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 64px;
}

.hero-stats {
  display: flex;
  gap: 48px;
  justify-content: center;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
}

/* Sections */
.section {
  padding: 80px 24px;
}

.section-inner {
  max-width: 1280px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 48px;
}

.section-header h2 {
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 12px;
}

.section-header p {
  color: var(--text-secondary);
  font-size: 16px;
}

.section-cta {
  text-align: center;
  margin-top: 40px;
}

/* Feature Cards */
.feature-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.feature-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 28px;
  transition: border-color 0.3s, transform 0.3s;
  animation: fadeUp 0.6s ease backwards;
  animation-delay: var(--delay);
}

.feature-card:hover {
  border-color: var(--border-hover);
  transform: translateY(-4px);
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.feature-tag {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent-green);
  margin-bottom: 8px;
}

.feature-card h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.feature-card p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 16px;
}

.feature-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: color 0.2s;
}

.feature-link:hover {
  color: var(--text-primary);
}

/* Model Grid */
.model-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.model-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  transition: border-color 0.3s;
}

.model-card:hover {
  border-color: var(--border-hover);
}

.model-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.model-type {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
}

.model-type.chat { color: #60a5fa; }
.model-type.image { color: #c084fc; }
.model-type.video { color: #f472b6; }
.model-type.audio { color: #4ade80; }

.model-card h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 6px;
}

.model-card p {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.model-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-muted);
}

.model-price {
  color: var(--accent-green);
  font-weight: 500;
}

/* Presets */
.preset-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 32px;
}

.preset-tag {
  padding: 6px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 999px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.preset-tag:hover {
  border-color: var(--border-hover);
  color: var(--text-primary);
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.preset-card {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition: transform 0.3s;
  cursor: pointer;
}

.preset-card:hover {
  transform: scale(1.02);
}

.preset-thumb {
  height: 180px;
  display: flex;
  align-items: flex-end;
  padding: 16px;
}

.preset-label {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.preset-info {
  padding: 12px 16px;
  background: var(--bg-card);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preset-info h4 {
  font-size: 14px;
  font-weight: 600;
}

.preset-info span {
  font-size: 12px;
  color: var(--text-muted);
}

/* Banner */
.banner-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  padding: 48px;
  overflow: hidden;
}

.banner-badge {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(180, 255, 57, 0.1);
  color: var(--accent-green);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 16px;
}

.banner-content h2 {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 12px;
}

.banner-content p {
  color: var(--text-secondary);
  margin-bottom: 24px;
  line-height: 1.7;
}

.mock-dashboard {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  height: 280px;
  display: grid;
  grid-template-columns: 60px 1fr;
  grid-template-rows: 32px 1fr;
  overflow: hidden;
}

.mock-bar {
  grid-column: 1 / -1;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid var(--border-color);
}

.mock-sidebar {
  background: rgba(255, 255, 255, 0.02);
  border-right: 1px solid var(--border-color);
}

.mock-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mock-line {
  height: 10px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
}

.mock-line.long { width: 80%; }
.mock-line.medium { width: 50%; }

.mock-chart {
  flex: 1;
  background: linear-gradient(180deg, rgba(168, 85, 247, 0.15) 0%, transparent 100%);
  border-radius: 8px;
  margin-top: 8px;
}

/* Explore */
.explore-title {
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 32px;
}

.explore-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.explore-tags span {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.explore-tags span:hover {
  background: var(--bg-card);
  color: var(--text-primary);
  border-color: var(--border-hover);
}

/* Responsive */
@media (max-width: 1024px) {
  .feature-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .model-grid,
  .preset-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .banner-card {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .feature-cards,
  .model-grid,
  .preset-grid {
    grid-template-columns: 1fr;
  }

  .hero-stats {
    gap: 24px;
  }

  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
