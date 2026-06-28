<template>
  <div class="templates">
    <div class="tpl-bg">
      <div class="bg-glow bg-glow-purple"></div>
    </div>

    <!-- Header -->
    <header class="tpl-header">
      <router-link to="/" class="logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 12h5l2-3 2 6 2-3h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span>RelayHub</span>
      </router-link>
      <span class="page-label">模板中心</span>
      <div class="header-right">
        <router-link to="/dashboard">
          <el-button plain size="small">控制台</el-button>
        </router-link>
      </div>
    </header>

    <!-- Hero -->
    <section class="tpl-hero">
      <h1>零门槛快速创作</h1>
      <p>1000+ 精选模板，覆盖全场景创作需求，一键套用即刻出片</p>
      <div class="hero-search">
        <el-input v-model="globalSearch" placeholder="搜索模板..." prefix-icon="Search" size="large" clearable class="hero-search-input" />
      </div>
    </section>

    <!-- Category tabs -->
    <section class="tpl-categories">
      <div class="cat-scroll">
        <button
          v-for="cat in categories"
          :key="cat.key"
          type="button"
          class="cat-btn"
          :class="{ active: activeCategory === cat.key }"
          @click="activeCategory = cat.key"
        >
          <el-icon :size="16"><component :is="cat.icon" /></el-icon>
          <span>{{ cat.label }}</span>
        </button>
      </div>
      <div class="sub-filter">
        <span class="filter-label">排序：</span>
        <button
          v-for="s in sorts"
          :key="s"
          type="button"
          class="sort-btn"
          :class="{ active: activeSort === s }"
          @click="activeSort = s"
        >{{ s }}</button>
      </div>
    </section>

    <!-- Template grid -->
    <section class="tpl-grid-section">
      <div class="tpl-grid">
        <div
          v-for="tpl in filteredTemplates"
          :key="tpl.id"
          class="tpl-card"
          :style="{ '--accent': tpl.accent }"
        >
          <div class="tpl-cover" :style="{ background: tpl.gradient }">
            <div class="tpl-overlay">
              <el-button type="primary" size="default" class="tpl-use-btn">
                <el-icon><VideoPlay /></el-icon>
                使用模板
              </el-button>
            </div>
            <span v-if="tpl.badge" class="tpl-badge" :class="tpl.badgeType">{{ tpl.badge }}</span>
            <span class="tpl-duration" v-if="tpl.duration">{{ tpl.duration }}</span>
          </div>
          <div class="tpl-body">
            <h3>{{ tpl.title }}</h3>
            <div class="tpl-meta">
              <span class="tpl-cat-tag">{{ tpl.category }}</span>
              <span class="tpl-usage">
                <el-icon :size="12"><User /></el-icon>
                {{ tpl.usage }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured collections -->
    <section class="collections-section">
      <h2 class="section-title">精选合集</h2>
      <div class="collections-grid">
        <div v-for="col in collections" :key="col.title" class="collection-card" :style="{ background: col.gradient }">
          <div class="collection-content">
            <h3>{{ col.title }}</h3>
            <p>{{ col.count }} 个模板</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const globalSearch = ref('')
const activeCategory = ref('all')
const activeSort = ref('热门')

const categories = [
  { key: 'all', label: '全部', icon: 'Grid' },
  { key: 'video', label: '视频', icon: 'VideoCamera' },
  { key: 'image', label: '图像', icon: 'Picture' },
  { key: 'audio', label: '音频', icon: 'Microphone' },
  { key: 'ecommerce', label: '电商', icon: 'ShoppingCart' },
  { key: 'social', label: '社媒', icon: 'ChatDotSquare' },
  { key: 'film', label: '影视', icon: 'Film' },
  { key: 'ai', label: 'AI 特效', icon: 'MagicStick' },
]

const sorts = ['热门', '最新', '最多使用']

const templates = ref([
  { id: 1, title: '商品展示 3D 旋转', category: '电商', badge: '热门', badgeType: 'hot', duration: '0:15', usage: '12.3k', accent: '#f97316', gradient: 'linear-gradient(135deg, #2a1a0d, #3a2010)' },
  { id: 2, title: '节日促销倒计时', category: '电商', badge: '新', badgeType: 'new', duration: '0:10', usage: '8.9k', accent: '#ef4444', gradient: 'linear-gradient(135deg, #2a0d0d, #3a1010)' },
  { id: 3, title: '产品开箱测评', category: '视频', badge: '', badgeType: '', duration: '0:45', usage: '23.1k', accent: '#38bdf8', gradient: 'linear-gradient(135deg, #0d1a2a, #10203a)' },
  { id: 4, title: '直播间背景模板', category: '电商', badge: '推荐', badgeType: 'rec', duration: '', usage: '15.6k', accent: '#a855f7', gradient: 'linear-gradient(135deg, #1a0d2a, #20103a)' },
  { id: 5, title: '短视频片头动画', category: '视频', badge: '', badgeType: '', duration: '0:05', usage: '31.2k', accent: '#4ade80', gradient: 'linear-gradient(135deg, #0d2a1a, #103a20)' },
  { id: 6, title: '品牌 Logo 演绎', category: '视频', badge: '热门', badgeType: 'hot', duration: '0:08', usage: '18.7k', accent: '#f59e0b', gradient: 'linear-gradient(135deg, #2a1a0d, #3a2010)' },
  { id: 7, title: '产品白底图生成', category: '图像', badge: '', badgeType: '', duration: '', usage: '9.4k', accent: '#ec4899', gradient: 'linear-gradient(135deg, #2a0d1a, #3a1020)' },
  { id: 8, title: '社媒九宫格排版', category: '图像', badge: '新', badgeType: 'new', duration: '', usage: '6.8k', accent: '#6366f1', gradient: 'linear-gradient(135deg, #1a0d2a, #20103a)' },
  { id: 9, title: '带货口播提词器', category: '音频', badge: '', badgeType: '', duration: '1:00', usage: '11.2k', accent: '#14b8a6', gradient: 'linear-gradient(135deg, #0d2a2a, #103a3a)' },
  { id: 10, title: '影视级开场片头', category: '影视', badge: '推荐', badgeType: 'rec', duration: '0:20', usage: '27.5k', accent: '#8b5cf6', gradient: 'linear-gradient(135deg, #0d0d2a, #10103a)' },
  { id: 11, title: 'AI 写真换脸', category: 'AI 特效', badge: '热门', badgeType: 'hot', duration: '', usage: '42.1k', accent: '#3b82f6', gradient: 'linear-gradient(135deg, #0d1a2a, #10203a)' },
  { id: 12, title: '老照片修复上色', category: 'AI 特效', badge: '', badgeType: '', duration: '', usage: '19.3k', accent: '#f472b6', gradient: 'linear-gradient(135deg, #2a0d1a, #3a1020)' },
  { id: 13, title: '抖音热门卡点', category: '社媒', badge: '热门', badgeType: 'hot', duration: '0:15', usage: '55.8k', accent: '#ef4444', gradient: 'linear-gradient(135deg, #2a0d0d, #3a1010)' },
  { id: 14, title: '小红书封面模板', category: '社媒', badge: '', badgeType: '', duration: '', usage: '33.4k', accent: '#ec4899', gradient: 'linear-gradient(135deg, #2a0d1a, #3a1020)' },
  { id: 15, title: '微电影调色预设', category: '影视', badge: '', badgeType: '', duration: '0:30', usage: '14.6k', accent: '#f59e0b', gradient: 'linear-gradient(135deg, #2a1a0d, #3a2010)' },
  { id: 16, title: '播客音频包装', category: '音频', badge: '新', badgeType: 'new', duration: '2:00', usage: '5.2k', accent: '#4ade80', gradient: 'linear-gradient(135deg, #0d2a1a, #103a20)' },
  { id: 17, title: '产品详情页套版', category: '电商', badge: '', badgeType: '', duration: '', usage: '8.1k', accent: '#f97316', gradient: 'linear-gradient(135deg, #2a1a0d, #3a2010)' },
  { id: 18, title: 'AI 动漫化视频', category: 'AI 特效', badge: '推荐', badgeType: 'rec', duration: '0:10', usage: '28.9k', accent: '#a855f7', gradient: 'linear-gradient(135deg, #1a0d2a, #20103a)' },
  { id: 19, title: 'YouTube 片尾关注', category: '社媒', badge: '', badgeType: '', duration: '0:10', usage: '16.3k', accent: '#ef4444', gradient: 'linear-gradient(135deg, #2a0d0d, #3a1010)' },
  { id: 20, title: '婚礼电影模板', category: '影视', badge: '', badgeType: '', duration: '3:00', usage: '7.8k', accent: '#f472b6', gradient: 'linear-gradient(135deg, #2a0d1a, #3a1020)' },
])

const filteredTemplates = computed(() => {
  let list = templates.value
  if (globalSearch.value) {
    const q = globalSearch.value.toLowerCase()
    list = list.filter(t => t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))
  }
  if (activeCategory.value !== 'all') {
    const catMap = { video: '视频', image: '图像', audio: '音频', ecommerce: '电商', social: '社媒', film: '影视', ai: 'AI 特效' }
    list = list.filter(t => t.category === catMap[activeCategory.value])
  }
  if (activeSort.value === '最新') {
    list = [...list].reverse()
  }
  if (activeSort.value === '最多使用') {
    list = [...list].sort((a, b) => parseFloat(b.usage) - parseFloat(a.usage))
  }
  return list
})

const collections = [
  { title: '电商大促', count: 86, gradient: 'linear-gradient(135deg, #f97316, #ea580c)' },
  { title: '短视频爆款', count: 124, gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
  { title: 'AI 创意', count: 67, gradient: 'linear-gradient(135deg, #a855f7, #9333ea)' },
  { title: '品牌营销', count: 93, gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
]
</script>

<style scoped>
.templates { min-height: 100vh; background: #0a0a0e; }

.tpl-bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.bg-glow-purple {
  position: absolute; top: -200px; left: 50%; transform: translateX(-50%);
  width: 700px; height: 500px;
  background: radial-gradient(ellipse, rgba(168,85,247,0.05) 0%, transparent 70%);
}

/* Header */
.tpl-header {
  position: relative; z-index: 10;
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 24px; gap: 24px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
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

/* Hero */
.tpl-hero {
  position: relative; z-index: 5;
  text-align: center; padding: 48px 24px 32px;
}

.tpl-hero h1 {
  font-size: clamp(28px, 4vw, 40px); font-weight: 800;
  letter-spacing: -0.03em; margin-bottom: 8px;
}

.tpl-hero > p { font-size: 15px; color: rgba(255,255,255,0.4); margin-bottom: 28px; }

.hero-search { max-width: 520px; margin: 0 auto; }
.hero-search-input :deep(.el-input__wrapper) {
  border-radius: 14px; padding: 12px 16px;
  background: rgba(255,255,255,0.04) !important;
  border-color: rgba(255,255,255,0.08) !important;
}

/* Categories */
.tpl-categories {
  position: relative; z-index: 5;
  max-width: 1280px; margin: 0 auto 0;
  padding: 0 24px;
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 12px;
}

.cat-scroll { display: flex; gap: 6px; flex-wrap: wrap; }

.cat-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 18px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
  color: rgba(255,255,255,0.55); font-size: 13px;
  cursor: pointer; transition: all 0.2s;
}

.cat-btn:hover { color: #fff; border-color: rgba(255,255,255,0.12); }
.cat-btn.active {
  background: rgba(168,85,247,0.1);
  border-color: rgba(168,85,247,0.3);
  color: #a855f7;
}

.sub-filter { display: flex; align-items: center; gap: 6px; }

.filter-label { font-size: 12px; color: rgba(255,255,255,0.3); }

.sort-btn {
  padding: 6px 14px; border-radius: 8px;
  font-size: 12px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.45);
  cursor: pointer; transition: all 0.2s;
}

.sort-btn:hover { color: #fff; }
.sort-btn.active {
  background: rgba(255,255,255,0.06);
  border-color: rgba(255,255,255,0.1);
  color: #fff;
}

/* Grid */
.tpl-grid-section {
  position: relative; z-index: 5;
  max-width: 1280px; margin: 0 auto 64px;
  padding: 28px 24px 0;
}

.tpl-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.tpl-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.tpl-card:hover {
  border-color: color-mix(in srgb, var(--accent) 30%, transparent);
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0,0,0,0.35);
}

.tpl-cover {
  aspect-ratio: 16 / 10;
  position: relative;
  display: flex; align-items: center; justify-content: center;
}

.tpl-overlay {
  position: absolute; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.3s;
}

.tpl-card:hover .tpl-overlay { opacity: 1; }

.tpl-use-btn {
  border-radius: 10px;
  font-weight: 600;
}

.tpl-badge {
  position: absolute; top: 10px; left: 10px;
  font-size: 10px; font-weight: 700;
  padding: 3px 10px; border-radius: 5px;
}

.tpl-badge.hot { background: #ef4444; color: #fff; }
.tpl-badge.new { background: #4ade80; color: #000; }
.tpl-badge.rec { background: #f59e0b; color: #000; }

.tpl-duration {
  position: absolute; bottom: 8px; right: 8px;
  font-size: 11px; padding: 2px 8px;
  background: rgba(0,0,0,0.6); border-radius: 4px;
  color: #fff;
}

.tpl-body { padding: 12px 14px; }

.tpl-body h3 { font-size: 14px; font-weight: 600; margin-bottom: 8px; }

.tpl-meta {
  display: flex; justify-content: space-between; align-items: center;
}

.tpl-cat-tag {
  font-size: 11px; padding: 3px 8px;
  background: rgba(255,255,255,0.05);
  border-radius: 4px; color: rgba(255,255,255,0.4);
}

.tpl-usage {
  display: flex; align-items: center; gap: 4px;
  font-size: 11px; color: rgba(255,255,255,0.3);
}

/* Collections */
.collections-section {
  position: relative; z-index: 5;
  max-width: 1280px; margin: 0 auto 80px;
  padding: 0 24px;
}

.section-title { font-size: 22px; font-weight: 700; margin-bottom: 20px; }

.collections-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.collection-card {
  aspect-ratio: 2 / 1;
  border-radius: 16px;
  padding: 24px;
  display: flex; align-items: flex-end;
  cursor: pointer;
  transition: all 0.3s;
}

.collection-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.3);
}

.collection-content h3 { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 4px; }
.collection-content p { font-size: 13px; color: rgba(255,255,255,0.6); }

@media (max-width: 1024px) {
  .tpl-grid { grid-template-columns: repeat(2, 1fr); }
  .collections-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .tpl-grid { grid-template-columns: 1fr; }
  .collections-grid { grid-template-columns: 1fr; }
}
</style>
