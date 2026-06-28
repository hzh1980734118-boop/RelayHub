<template>
  <div class="placeholder-page">
    <AppHeader variant="dark" />
    <main class="placeholder-main">
      <div class="placeholder-glow"></div>
      <div class="placeholder-content">
        <div class="placeholder-icon">
          <el-icon :size="48"><component :is="icon" /></el-icon>
        </div>
        <h1>{{ title }}</h1>
        <p>{{ subtitle }}</p>
        <span class="placeholder-badge">即将上线</span>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const route = useRoute()

const title = computed(() => route.meta.title || '页面')
const subtitle = computed(() => route.meta.subtitle || '该功能正在开发中，敬请期待。')
const icon = computed(() => route.meta.icon || 'More')
</script>

<style scoped>
.placeholder-page {
  background: #080808;
  min-height: 100vh;
}

.placeholder-main {
  position: relative;
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 120px 24px 80px;
  overflow: hidden;
}

.placeholder-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  height: 400px;
  background: radial-gradient(ellipse, rgba(168, 85, 247, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.placeholder-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.placeholder-icon {
  width: 96px;
  height: 96px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 16px;
}

.placeholder-content h1 {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.placeholder-content p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.4);
  max-width: 400px;
}

.placeholder-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 999px;
  background: rgba(168, 85, 247, 0.12);
  color: #a855f7;
  border: 1px solid rgba(168, 85, 247, 0.2);
  margin-top: 8px;
}
</style>
