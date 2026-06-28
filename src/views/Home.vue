<template>
  <div class="home">
    <!-- 顶部栏（简化） -->
    <header class="topbar">
      <router-link to="/" class="logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 12h5l2-3 2 6 2-3h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span>RelayHub</span>
      </router-link>
      <div class="topbar-actions">
        <router-link to="/login"><el-button plain size="default">登录</el-button></router-link>
        <router-link to="/dashboard"><el-button type="primary" size="default">控制台</el-button></router-link>
      </div>
    </header>

    <!-- 宣传视频行 -->
    <section class="promo-row">
      <div
        v-for="(promo, i) in promos"
        :key="i"
        class="promo-card"
        :style="{ '--accent': promo.accent }"
      >
        <div class="promo-video">
          <video
            v-if="promo.previewVideo"
            :src="promo.previewVideo"
            muted
            loop
            playsinline
            preload="metadata"
            class="promo-video-el"
            @mouseenter="(e) => e.target.play().catch(() => {})"
            @mouseleave="(e) => { e.target.pause(); e.target.currentTime = 0 }"
          ></video>
          <div v-else class="promo-placeholder">
            <el-icon :size="32"><VideoCamera /></el-icon>
            <span>添加视频</span>
          </div>
        </div>
        <p class="promo-desc">{{ promo.desc }}</p>
      </div>
    </section>

    <!-- 功能模块网格 -->
    <section class="module-grid">
      <!-- 左列 2×2 -->
      <div class="grid-col">
        <router-link
          v-for="item in leftModules"
          :key="item.key"
          :to="item.path"
          class="module-card"
          :style="{ '--accent': item.accent }"
        >
          <div class="module-icon">
            <el-icon :size="24"><component :is="item.icon" /></el-icon>
          </div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
        </router-link>
      </div>

      <!-- 中列 团队协作 -->
      <div class="grid-col center-col">
        <router-link
          :to="teamModule.path"
          class="module-card module-card--large"
          :style="{ '--accent': teamModule.accent }"
        >
          <div class="module-icon module-icon--lg">
            <el-icon :size="36"><component :is="teamModule.icon" /></el-icon>
          </div>
          <h3>{{ teamModule.title }}</h3>
          <p>{{ teamModule.desc }}</p>
          <span class="module-tag">企业版</span>
        </router-link>
      </div>

      <!-- 右列 2×2 -->
      <div class="grid-col">
        <router-link
          v-for="item in rightModules"
          :key="item.key"
          :to="item.path"
          class="module-card"
          :style="{ '--accent': item.accent }"
        >
          <div class="module-icon">
            <el-icon :size="24"><component :is="item.icon" /></el-icon>
          </div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.desc }}</p>
        </router-link>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup>
import AppFooter from '@/components/AppFooter.vue'

const base = import.meta.env.BASE_URL

const promos = [
  { desc: 'AI 图像生成：让灵感，瞬间成为画面', accent: '#a855f7', previewVideo: `${base}video/宣传片/GPT IMAGE 2.0.mp4` },
  { desc: 'AI 视频生成：让创意动起来', accent: '#38bdf8', previewVideo: `${base}video/宣传片/KLING 3.0.mp4` },
  { desc: 'AI 音频制作：让声音，为创意赋能', accent: '#4ade80', previewVideo: `${base}video/宣传片/WAN 2.6.mp4` },
  { desc: '导演台：让镜头的一切，由你掌控', accent: '#8b5cf6', previewVideo: `${base}video/宣传片/SEEFDANCE 2.0.mp4` },
]

const leftModules = [
  { key: 'image', title: '图片生成', desc: '让灵感，瞬间成为画面', path: '/studio/image', icon: 'Picture', accent: '#a855f7' },
  { key: 'video', title: '视频生成', desc: '让创意动起来', path: '/studio/video', icon: 'VideoCamera', accent: '#38bdf8' },
  { key: 'audio', title: '音频制作', desc: '让声音，为创意赋能', path: '/studio/audio', icon: 'Microphone', accent: '#4ade80' },
  { key: 'director', title: '导演台', desc: '让镜头的一切，由你掌控', path: '/director', icon: 'Monitor', accent: '#8b5cf6' },
]

const teamModule = { key: 'team', title: '团队协作', desc: '企业级AI创作协作平台，为团队打造高效生产力', path: '/team', icon: 'UserFilled', accent: '#f59e0b' }

const rightModules = [
  { key: 'ecommerce', title: '电商工作室', desc: '让商品自己开口', path: '/ecommerce', icon: 'ShoppingCart', accent: '#f97316' },
  { key: 'film', title: '影视工作室', desc: '专业级影视创作平台', path: '/film', icon: 'VideoCamera', accent: '#ef4444' },
  { key: 'comfyui', title: 'ComfyUI', desc: '无限组合，无限可能', path: '/comfyui', icon: 'Grid', accent: '#14b8a6' },
  { key: 'templates', title: '模板中心', desc: '零门槛快速创作', path: '/templates', icon: 'Collection', accent: '#6366f1' },
]
</script>

<style scoped>
.home {
  background: #080808;
  min-height: 100vh;
}

/* ===== Topbar ===== */
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1440px;
  margin: 0 auto;
  padding: 16px 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
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

.topbar-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* ===== Promo row ===== */
.promo-row {
  max-width: 1440px;
  margin: 0 auto 80px;
  padding: 24px 24px 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.promo-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: transform 0.3s;
}

.promo-card:hover {
  transform: translateY(-4px);
}

.promo-video {
  aspect-ratio: 16 / 9;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  overflow: hidden;
  position: relative;
  box-shadow: 0 0 40px color-mix(in srgb, var(--accent) 6%, transparent);
  transition: border-color 0.3s;
}

.promo-card:hover .promo-video {
  border-color: color-mix(in srgb, var(--accent) 30%, transparent);
}

.promo-video-el {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.promo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 100%;
  color: rgba(255, 255, 255, 0.15);
  font-size: 13px;
}

.promo-desc {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  line-height: 1.5;
  text-align: center;
}

/* ===== Module grid ===== */
.module-grid {
  max-width: 1440px;
  margin: 0 auto 80px;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}

.grid-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-content: start;
}

.center-col {
  grid-template-columns: 1fr;
}

/* Module card */
.module-card {
  display: flex;
  flex-direction: column;
  padding: 28px 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  transition: all 0.3s;
  color: inherit;
  position: relative;
  overflow: hidden;
}

.module-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--accent);
  opacity: 0;
  transition: opacity 0.3s;
}

.module-card:hover {
  border-color: color-mix(in srgb, var(--accent) 40%, transparent);
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
}

.module-card:hover::before {
  opacity: 1;
}

.module-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--accent) 15%, transparent);
  color: var(--accent);
  margin-bottom: 20px;
}

.module-icon--lg {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  margin-bottom: 24px;
}

.module-card h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.module-card p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  line-height: 1.5;
  flex: 1;
}

/* Large card */
.module-card--large {
  height: 100%;
  justify-content: center;
  text-align: center;
  align-items: center;
}

.module-card--large h3 {
  font-size: 24px;
}

.module-card--large p {
  font-size: 14px;
  max-width: 260px;
}

.module-tag {
  display: inline-block;
  margin-top: 16px;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 15%, transparent);
  color: var(--accent);
  border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
}

@media (max-width: 1024px) {
  .promo-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .module-grid {
    grid-template-columns: 1fr;
  }

  .grid-col {
    grid-template-columns: 1fr 1fr;
  }

  .center-col {
    grid-template-columns: 1fr;
  }

  .module-card--large {
    height: auto;
    min-height: 200px;
  }
}

@media (max-width: 640px) {
  .promo-row {
    grid-template-columns: 1fr;
  }

  .grid-col {
    grid-template-columns: 1fr;
  }
}
</style>
