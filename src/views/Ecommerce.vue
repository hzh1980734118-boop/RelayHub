<template>
  <div class="ecommerce">
    <div class="shop-bg">
      <div class="bg-glow bg-glow-orange"></div>
      <div class="bg-glow bg-glow-pink"></div>
    </div>

    <!-- Header -->
    <header class="shop-header">
      <router-link to="/" class="logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 12h5l2-3 2 6 2-3h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span>RelayHub</span>
      </router-link>
      <span class="page-label">电商工作室</span>
      <div class="header-right">
        <router-link to="/dashboard">
          <el-button plain size="small">控制台</el-button>
        </router-link>
      </div>
    </header>

    <!-- Hero -->
    <section class="shop-hero">
      <h1>让商品自己开口</h1>
      <p>AI 驱动的电商内容创作平台 — 商品图、带货视频、直播切片，一键生成</p>
      <div class="hero-stats">
        <div class="hero-stat">
          <span class="stat-num">12,847</span>
          <span class="stat-label">今日生成视频</span>
        </div>
        <div class="hero-stat">
          <span class="stat-num">98.6<span class="stat-unit">%</span></span>
          <span class="stat-label">商品图点击率提升</span>
        </div>
        <div class="hero-stat">
          <span class="stat-num">3.2<span class="stat-unit">x</span></span>
          <span class="stat-label">带货转化率</span>
        </div>
      </div>
    </section>

    <!-- 创作工具 -->
    <section class="tools-section">
      <h2 class="section-title">创作工具</h2>
      <div class="tools-grid">
        <div v-for="tool in tools" :key="tool.key" class="tool-card" :style="{ '--accent': tool.accent }">
          <div class="tool-icon">
            <el-icon :size="28"><component :is="tool.icon" /></el-icon>
          </div>
          <h3>{{ tool.title }}</h3>
          <p>{{ tool.desc }}</p>
          <span class="tool-cta">
            开始创作
            <el-icon><ArrowRight /></el-icon>
          </span>
        </div>
      </div>
    </section>

    <!-- 带货视频 -->
    <section class="videos-section">
      <div class="section-header">
        <h2 class="section-title">热门带货视频</h2>
        <div class="video-tabs">
          <button
            v-for="t in videoTabs"
            :key="t"
            type="button"
            class="video-tab"
            :class="{ active: activeVideoTab === t }"
            @click="activeVideoTab = t"
          >{{ t }}</button>
        </div>
      </div>

      <div class="video-grid">
        <div
          v-for="v in filteredVideos"
          :key="v.id"
          class="video-card"
          @mouseenter="v.hover = true"
          @mouseleave="v.hover = false"
        >
          <div class="video-cover" :style="{ background: v.gradient }">
            <video
              v-if="v.video"
              :src="v.video"
              muted loop playsinline preload="metadata"
              class="video-cover-el"
              @mouseenter="(e) => e.target.play().catch(() => {})"
              @mouseleave="(e) => { e.target.pause(); e.target.currentTime = 0 }"
            ></video>
            <div class="video-play-btn">
              <el-icon :size="36"><VideoPlayFilled /></el-icon>
            </div>
            <span class="video-duration">{{ v.duration }}</span>
            <span class="video-views">
              <el-icon :size="12"><View /></el-icon>
              {{ v.views }}
            </span>
          </div>
          <div class="video-body">
            <h4>{{ v.title }}</h4>
            <div class="video-tags">
              <span v-for="tag in v.tags" :key="tag" class="video-tag">{{ tag }}</span>
            </div>
            <div class="video-meta">
              <div class="video-merchant">
                <span class="merchant-avatar" :style="{ background: v.avatarColor }">{{ v.merchant.charAt(0) }}</span>
                <span>{{ v.merchant }}</span>
              </div>
              <span class="video-likes">
                <el-icon :size="14"><StarFilled /></el-icon>
                {{ v.likes }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 模板中心 -->
    <section class="templates-section">
      <h2 class="section-title">视频模板</h2>
      <div class="template-scroll">
        <div v-for="tpl in templates" :key="tpl.id" class="template-card" :style="{ background: tpl.gradient }">
          <video
            v-if="tpl.video"
            :src="tpl.video"
            muted loop autoplay playsinline preload="auto"
            class="template-video-el"
          ></video>
          <span class="template-label">{{ tpl.label }}</span>
          <span class="template-name">{{ tpl.name }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const activeVideoTab = ref('全部')

const tools = [
  { key: 'product-image', title: '商品图生成', desc: 'AI 背景替换 + 场景合成，批量出图', icon: 'Picture', accent: '#f97316' },
  { key: 'live-clip', title: '直播切片', desc: '自动识别高光时刻，智能剪辑带货片段', icon: 'VideoCamera', accent: '#ef4444' },
  { key: 'voiceover', title: 'AI 配音', desc: '多音色带货话术配音，一键合成', icon: 'Microphone', accent: '#f59e0b' },
  { key: 'copywriting', title: '文案生成', desc: '基于商品卖点，自动生成带货脚本', icon: 'Edit', accent: '#ec4899' },
]

const videoTabs = ['全部', '美妆', '服饰', '食品', '数码', '家居']

const base = import.meta.env.BASE_URL

// 带货视频数据
const videos = ref([
  { id: 1, title: '这款口红真的绝了！黄皮必入', merchant: '完美日记', duration: '0:32', views: '23.5万', likes: '8.2k', tags: ['美妆', '口红'], gradient: 'linear-gradient(135deg, #3a1a2a, #1f0d15)', avatarColor: '#ec4899', video: `${base}video/电商工作室/1.mp4` },
  { id: 2, title: '夏季冰丝凉席，躺着就能降温', merchant: '南极人', duration: '0:45', views: '56.8万', likes: '12.6k', tags: ['家居', '凉席'], gradient: 'linear-gradient(135deg, #2a2a3a, #15151f)', avatarColor: '#38bdf8', video: `${base}video/电商工作室/2.mp4` },
  { id: 3, title: '这个收纳盒太能装了！宿舍神器', merchant: '无印良品', duration: '0:28', views: '18.2万', likes: '5.4k', tags: ['家居', '收纳'], gradient: 'linear-gradient(135deg, #2a3a2a, #151f15)', avatarColor: '#4ade80', video: `${base}video/电商工作室/3.mp4` },
  { id: 4, title: '炸鸡配这个酱真的绝绝子', merchant: '肯德基', duration: '0:38', views: '89.3万', likes: '23.1k', tags: ['食品', '炸鸡'], gradient: 'linear-gradient(135deg, #3a2a1a, #1f150d)', avatarColor: '#f97316', video: `${base}video/电商工作室/4.mp4` },
  { id: 5, title: '这件防晒衣我穿了三年还在回购', merchant: '蕉下', duration: '0:52', views: '34.7万', likes: '9.8k', tags: ['服饰', '防晒'], gradient: 'linear-gradient(135deg, #1a3a3a, #0d1f1f)', avatarColor: '#a855f7', video: `${base}video/电商工作室/5.mp4` },
  { id: 6, title: '百元内蓝牙耳机天花板', merchant: '漫步者', duration: '0:41', views: '67.1万', likes: '15.3k', tags: ['数码', '耳机'], gradient: 'linear-gradient(135deg, #1a2a3a, #0d151f)', avatarColor: '#6366f1', video: `${base}video/电商工作室/6.mp4` },
  { id: 7, title: '这个粉底液持妆12小时不暗沉', merchant: '花西子', duration: '0:35', views: '45.9万', likes: '11.2k', tags: ['美妆', '粉底'], gradient: 'linear-gradient(135deg, #3a1a3a, #1f0d1f)', avatarColor: '#f472b6', video: `${base}video/电商工作室/7.mp4` },
  { id: 8, title: '懒人必备！自动炒菜机开箱', merchant: '小米有品', duration: '1:02', views: '28.4万', likes: '6.7k', tags: ['数码', '厨房'], gradient: 'linear-gradient(135deg, #2a2a2a, #151515)', avatarColor: '#fbbf24', video: `${base}video/电商工作室/8.mp4` },
  { id: 9, title: '螺蛳粉天花板！一碗入魂', merchant: '好欢螺', duration: '0:29', views: '102.3万', likes: '34.5k', tags: ['食品', '螺蛳粉'], gradient: 'linear-gradient(135deg, #3a3a1a, #1f1f0d)', avatarColor: '#f59e0b', video: `${base}video/电商工作室/9.mp4` },
  { id: 10, title: '这个挂烫机30秒出蒸汽', merchant: '美的', duration: '0:44', views: '15.6万', likes: '3.9k', tags: ['家居', '电器'], gradient: 'linear-gradient(135deg, #1a3a2a, #0d1f15)', avatarColor: '#14b8a6', video: `${base}video/电商工作室/10.mp4` },
  { id: 11, title: '学生党平价书包，颜值超高', merchant: '卡拉羊', duration: '0:33', views: '21.8万', likes: '7.1k', tags: ['服饰', '书包'], gradient: 'linear-gradient(135deg, #2a1a2a, #150d15)', avatarColor: '#8b5cf6', video: `${base}video/电商工作室/11.mp4` },
  { id: 12, title: '厨房小白也能做的牛排大餐', merchant: '大希地', duration: '0:56', views: '41.2万', likes: '10.4k', tags: ['食品', '牛排'], gradient: 'linear-gradient(135deg, #3a2a2a, #1f1515)', avatarColor: '#ef4444', video: `${base}video/电商工作室/12.mp4` },
])

const filteredVideos = computed(() => {
  if (activeVideoTab.value === '全部') return videos.value
  return videos.value.filter(v => v.tags.includes(activeVideoTab.value))
})

const templates = [
  { id: 1, name: '商品展示', label: '热门', gradient: 'linear-gradient(135deg, #f97316, #ea580c)', video: `${base}video/电商工作室/13.mp4` },
  { id: 2, name: '开箱测评', label: '推荐', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)', video: `${base}video/电商工作室/14.mp4` },
  { id: 3, name: '使用教程', label: '', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', video: `${base}video/电商工作室/15.mp4` },
  { id: 4, name: '对比评测', label: '', gradient: 'linear-gradient(135deg, #38bdf8, #0ea5e9)', video: `${base}video/电商工作室/16.mp4` },
  { id: 5, name: '场景种草', label: '新', gradient: 'linear-gradient(135deg, #ec4899, #db2777)', video: `${base}video/电商工作室/17.mp4` },
  { id: 6, name: '直播高光', label: '', gradient: 'linear-gradient(135deg, #4ade80, #22c55e)', video: `${base}video/电商工作室/18.mp4` },
  { id: 7, name: '工厂实拍', label: '', gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)', video: `${base}video/电商工作室/19.mp4` },
  { id: 8, name: '达人同款', label: '热', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', video: `${base}video/电商工作室/20.mp4` },
]
</script>

<style scoped>
.ecommerce {
  min-height: 100vh;
  background: #0a0a0c;
}

.shop-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.bg-glow-orange {
  position: absolute;
  top: -100px;
  right: -100px;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%);
}

.bg-glow-pink {
  position: absolute;
  bottom: 20%;
  left: -150px;
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, rgba(236,72,153,0.04) 0%, transparent 70%);
}

/* Header */
.shop-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
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
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon svg { width: 18px; height: 18px; }

.page-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.45);
  padding: 6px 16px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 999px;
}

/* Hero */
.shop-hero {
  position: relative;
  z-index: 5;
  text-align: center;
  padding: 64px 24px 48px;
}

.shop-hero h1 {
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 12px;
}

.shop-hero > p {
  font-size: 16px;
  color: rgba(255,255,255,0.4);
  max-width: 560px;
  margin: 0 auto 40px;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 48px;
}

.hero-stat {
  text-align: center;
}

.stat-num {
  display: block;
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #f97316;
}

.stat-unit { font-size: 22px; font-weight: 600; }

.stat-label {
  display: block;
  font-size: 13px;
  color: rgba(255,255,255,0.35);
  margin-top: 4px;
}

/* Sections */
section { position: relative; z-index: 5; }

.section-title {
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 20px;
}

/* Tools */
.tools-section {
  max-width: 1280px;
  margin: 0 auto 64px;
  padding: 0 24px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.tool-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 18px;
  padding: 24px;
  transition: all 0.3s;
  cursor: pointer;
}

.tool-card:hover {
  border-color: color-mix(in srgb, var(--accent) 35%, transparent);
  background: rgba(255,255,255,0.05);
  transform: translateY(-3px);
}

.tool-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.tool-card h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
}

.tool-card p {
  font-size: 13px;
  color: rgba(255,255,255,0.4);
  line-height: 1.5;
  margin-bottom: 16px;
}

.tool-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
}

/* Videos */
.videos-section {
  max-width: 1280px;
  margin: 0 auto 64px;
  padding: 0 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.video-tabs {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.video-tab {
  padding: 7px 16px;
  border-radius: 999px;
  font-size: 13px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.5);
  cursor: pointer;
  transition: all 0.2s;
}

.video-tab:hover { color: #fff; }
.video-tab.active {
  background: rgba(249,115,22,0.12);
  border-color: rgba(249,115,22,0.3);
  color: #f97316;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.video-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.video-card:hover {
  border-color: rgba(255,255,255,0.12);
  transform: translateY(-3px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.3);
}

.video-cover {
  aspect-ratio: 9 / 16;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.video-cover-el {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-play-btn {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.2s;
}

.video-card:hover .video-play-btn { opacity: 1; }

.video-duration {
  position: absolute;
  bottom: 8px;
  right: 8px;
  font-size: 11px;
  padding: 2px 8px;
  background: rgba(0,0,0,0.6);
  border-radius: 4px;
  color: #fff;
}

.video-views {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  padding: 2px 8px;
  background: rgba(0,0,0,0.5);
  border-radius: 4px;
  color: rgba(255,255,255,0.8);
}

.video-body { padding: 12px 14px; }

.video-body h4 {
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-tags {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.video-tag {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(249,115,22,0.1);
  color: #f97316;
}

.video-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: rgba(255,255,255,0.35);
}

.video-merchant {
  display: flex;
  align-items: center;
  gap: 6px;
}

.merchant-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
}

.video-likes {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #ef4444;
}

/* Templates */
.templates-section {
  max-width: 1280px;
  margin: 0 auto 80px;
  padding: 0 24px;
}

.template-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.template-card {
  flex-shrink: 0;
  width: 180px;
  aspect-ratio: 9 / 16;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 14px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

.template-video-el {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.4);
}

.template-label {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(0,0,0,0.5);
  color: #f97316;
}

.template-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

@media (max-width: 1024px) {
  .tools-grid { grid-template-columns: repeat(2, 1fr); }
  .video-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .tools-grid { grid-template-columns: 1fr; }
  .video-grid { grid-template-columns: 1fr; }
  .hero-stats { flex-direction: column; gap: 24px; }
}
</style>
