<template>
  <header class="header" :class="{ scrolled: isScrolled, dark: variant === 'dark' }">
    <div class="header-inner">
      <router-link to="/" class="logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12h5l2-3 2 6 2-3h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="logo-text">RelayHub</span>
      </router-link>

      <nav class="nav-links">
        <router-link to="/">首页</router-link>
        <router-link to="/studio/image">图片</router-link>
        <router-link to="/studio/video">视频</router-link>
        <router-link to="/studio/audio">音频</router-link>
        <router-link to="/team">团队协作</router-link>
        <router-link to="/ecommerce">电商工作室</router-link>
        <router-link to="/film">影视工作室</router-link>
        <router-link to="/digital-human">AI数字人</router-link>
        <router-link to="/director">导演台</router-link>
        <router-link to="/comfyui">comfyui</router-link>
        <router-link to="/templates">模板中心</router-link>
      </nav>

      <div class="header-actions">
        <router-link to="/api">API</router-link>
        <router-link to="/dashboard" class="profile-link">
          <el-button plain size="default">个人中心</el-button>
        </router-link>
      </div>

      <button class="mobile-toggle" @click="mobileOpen = !mobileOpen">
        <el-icon :size="22"><component :is="mobileOpen ? 'Close' : 'Menu'" /></el-icon>
      </button>
    </div>

    <Transition name="slide">
      <div v-if="mobileOpen" class="mobile-menu">
        <router-link to="/" @click="mobileOpen = false">首页</router-link>
        <router-link to="/studio/image" @click="mobileOpen = false">图片</router-link>
        <router-link to="/studio/video" @click="mobileOpen = false">视频</router-link>
        <router-link to="/studio/audio" @click="mobileOpen = false">音频</router-link>
        <router-link to="/team" @click="mobileOpen = false">团队协作</router-link>
        <router-link to="/ecommerce" @click="mobileOpen = false">电商工作室</router-link>
        <router-link to="/film" @click="mobileOpen = false">影视工作室</router-link>
        <router-link to="/digital-human" @click="mobileOpen = false">AI数字人</router-link>
        <router-link to="/director" @click="mobileOpen = false">导演台</router-link>
        <router-link to="/comfyui" @click="mobileOpen = false">comfyui</router-link>
        <router-link to="/templates" @click="mobileOpen = false">模板中心</router-link>
        <router-link to="/api" @click="mobileOpen = false">API</router-link>
        <router-link to="/dashboard" @click="mobileOpen = false">个人中心</router-link>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineProps({
  variant: {
    type: String,
    default: 'default',
  },
})

const isScrolled = ref(false)
const mobileOpen = ref(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  transition: background 0.3s, border-color 0.3s;
}

.header.scrolled,
.header.dark {
  background: rgba(5, 5, 5, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
}

.header-inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-icon svg {
  width: 18px;
  height: 18px;
}

.logo-text {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.nav-links {
  display: flex;
  gap: 4px;
  flex: 1;
  overflow-x: auto;
  scrollbar-width: none;
}

.nav-links::-webkit-scrollbar {
  display: none;
}

.nav-links a {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  padding: 6px 12px;
  border-radius: 8px;
  white-space: nowrap;
  transition: all 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.06);
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-shrink: 0;
}

.header-actions > a {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: color 0.2s;
}

.header-actions > a:hover {
  color: var(--text-primary);
}

.mobile-toggle {
  display: none;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 4px;
}

.mobile-menu {
  display: none;
  flex-direction: column;
  padding: 16px 24px 24px;
  gap: 16px;
  border-bottom: 1px solid var(--border-color);
  background: rgba(5, 5, 5, 0.95);
  backdrop-filter: blur(20px);
}

.mobile-menu a {
  font-size: 16px;
  color: var(--text-secondary);
  padding: 8px 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 1024px) {
  .nav-links {
    display: none;
  }

  .header-actions {
    display: none;
  }

  .mobile-toggle {
    display: flex;
    margin-left: auto;
  }

  .mobile-menu {
    display: flex;
  }
}
</style>
