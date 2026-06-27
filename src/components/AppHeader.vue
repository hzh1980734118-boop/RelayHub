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
        <router-link to="/studio/image">生图</router-link>
        <router-link to="/studio/video">生视频</router-link>
        <router-link to="/studio/audio">配音</router-link>
        <router-link to="/pricing">定价</router-link>
        <router-link to="/docs">文档</router-link>
      </nav>

      <div class="header-actions">
        <router-link to="/login">
          <el-button plain size="default">登录</el-button>
        </router-link>
        <router-link to="/dashboard">
          <el-button type="primary" size="default">控制台</el-button>
        </router-link>
      </div>

      <button class="mobile-toggle" @click="mobileOpen = !mobileOpen">
        <el-icon :size="22"><component :is="mobileOpen ? 'Close' : 'Menu'" /></el-icon>
      </button>
    </div>

    <Transition name="slide">
      <div v-if="mobileOpen" class="mobile-menu">
        <router-link to="/studio/image" @click="mobileOpen = false">生图</router-link>
        <router-link to="/studio/video" @click="mobileOpen = false">生视频</router-link>
        <router-link to="/studio/audio" @click="mobileOpen = false">配音</router-link>
        <router-link to="/pricing" @click="mobileOpen = false">定价</router-link>
        <router-link to="/docs" @click="mobileOpen = false">文档</router-link>
        <router-link to="/login" @click="mobileOpen = false">登录</router-link>
        <router-link to="/dashboard" @click="mobileOpen = false">控制台</router-link>
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
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 32px;
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
  gap: 28px;
  flex: 1;
}

.nav-links a {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: color 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
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

@media (max-width: 768px) {
  .nav-links,
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
