<template>
  <div class="home">
    <AppHeader />

    <section class="home-main">
      <div class="home-glow"></div>
      <div class="home-inner">
        <h1 class="home-title">RelayHub</h1>
        <p class="home-subtitle">AI 创作工作台 · 选择功能开始</p>

        <div class="option-grid">
          <router-link
            v-for="item in mainOptions"
            :key="item.key"
            :to="item.path"
            class="option-card"
            :style="{ '--accent': item.accent }"
          >
            <div class="option-icon">
              <el-icon :size="32"><component :is="item.icon" /></el-icon>
            </div>
            <h2>{{ item.title }}</h2>
            <p>{{ item.desc }}</p>
            <span class="option-cta">
              进入
              <el-icon><ArrowRight /></el-icon>
            </span>
          </router-link>
        </div>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const mainOptions = [
  {
    key: 'image',
    title: '生图',
    desc: 'Cinema Studio 风格图像生成，参考 Higgsfield 生图界面',
    path: '/studio/image',
    icon: 'Picture',
    accent: '#a855f7',
  },
  {
    key: 'video',
    title: '生视频',
    desc: 'Cinema Studio 风格视频生成，支持 Kling / Seedance 等模型',
    path: '/studio/video',
    icon: 'VideoCamera',
    accent: '#38bdf8',
  },
  {
    key: 'audio',
    title: '配音',
    desc: '接入 Fish Audio 能力，音色库、音色克隆与音频资产',
    path: '/studio/audio',
    icon: 'Microphone',
    accent: '#4ade80',
  },
]
</script>

<style scoped>
.home {
  background: var(--bg-primary);
  min-height: 100vh;
}

.home-main {
  position: relative;
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100px 24px 80px;
  overflow: hidden;
}

.home-glow {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 700px;
  height: 500px;
  background: var(--gradient-hero);
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
}

.home-inner {
  position: relative;
  width: 100%;
  max-width: 1080px;
  text-align: center;
}

.home-title {
  font-size: clamp(36px, 5vw, 56px);
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 12px;
}

.home-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 56px;
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.option-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  padding: 32px 28px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  transition: all 0.3s;
  color: inherit;
}

.option-card:hover {
  border-color: color-mix(in srgb, var(--accent) 50%, transparent);
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.option-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--accent) 15%, transparent);
  color: var(--accent);
  margin-bottom: 24px;
}

.option-card h2 {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 10px;
}

.option-card p {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  flex: 1;
  margin-bottom: 24px;
}

.option-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--accent);
}

@media (max-width: 768px) {
  .option-grid {
    grid-template-columns: 1fr;
  }
}
</style>
