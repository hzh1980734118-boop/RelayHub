<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="logo">
            <div class="logo-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M4 12h5l2-3 2 6 2-3h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span>RelayHub</span>
          </div>
          <p class="brand-desc">AI 模型统一中转平台，一个 API 接入全球顶尖模型。</p>
        </div>

        <div v-for="group in linkGroups" :key="group.title" class="footer-col">
          <h4>{{ group.title }}</h4>
          <a v-for="link in group.links" :key="link" href="#">{{ link }}</a>
        </div>
      </div>

      <div class="footer-bottom">
        <span>© 2026 RelayHub. All rights reserved.</span>
        <div class="social-links">
          <a href="#">GitHub</a>
          <a href="#">Discord</a>
          <a href="#">Twitter</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
const linkGroups = [
  {
    title: '产品',
    links: ['模型列表', 'API 文档', '定价方案', '状态监控'],
  },
  {
    title: '资源',
    links: ['快速开始', 'SDK 下载', '更新日志', '常见问题'],
  },
  {
    title: '公司',
    links: ['关于我们', '联系我们', '隐私政策', '服务条款'],
  },
]
</script>

<style scoped>
.footer {
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
  padding: 64px 24px 32px;
}

.footer-inner {
  max-width: 1280px;
  margin: 0 auto;
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 48px;
  margin-bottom: 48px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
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

.brand-desc {
  color: var(--text-secondary);
  font-size: 14px;
  max-width: 280px;
  line-height: 1.7;
}

.footer-col h4 {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 16px;
}

.footer-col a {
  display: block;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 10px;
  transition: color 0.2s;
}

.footer-col a:hover {
  color: var(--text-primary);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 32px;
  border-top: 1px solid var(--border-color);
  font-size: 13px;
  color: var(--text-muted);
}

.social-links {
  display: flex;
  gap: 20px;
}

.social-links a {
  color: var(--text-secondary);
  transition: color 0.2s;
}

.social-links a:hover {
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }

  .footer-brand {
    grid-column: 1 / -1;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}
</style>
