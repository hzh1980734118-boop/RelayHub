<template>
  <div class="page">
    <AppHeader variant="dark" />

    <section class="page-hero">
      <h1>定价方案</h1>
      <p>按量计费，无隐藏费用。选择适合您的方案</p>
    </section>

    <section class="page-content">
      <div class="pricing-grid">
        <div
          v-for="plan in plans"
          :key="plan.name"
          class="pricing-card"
          :class="{ featured: plan.featured }"
        >
          <div v-if="plan.featured" class="featured-badge">最受欢迎</div>
          <h3>{{ plan.name }}</h3>
          <div class="price">
            <span class="price-amount">{{ plan.price }}</span>
            <span class="price-period">{{ plan.period }}</span>
          </div>
          <p class="plan-desc">{{ plan.desc }}</p>
          <ul class="plan-features">
            <li v-for="feature in plan.features" :key="feature">
              <el-icon color="#4ade80"><Check /></el-icon>
              {{ feature }}
            </li>
          </ul>
          <el-button
            :type="plan.featured ? 'primary' : 'default'"
            :plain="!plan.featured"
            size="large"
            class="plan-btn"
          >
            {{ plan.cta }}
          </el-button>
        </div>
      </div>

      <div class="pricing-note">
        <h3>按量计费说明</h3>
        <p>所有方案均支持按实际 Token 消耗计费。不同模型价格不同，详见
          <router-link to="/models">模型列表</router-link>。
          充值余额永不过期。
        </p>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const plans = [
  {
    name: 'Free',
    price: '¥0',
    period: '/月',
    desc: '适合个人开发者体验',
    features: [
      '每月 100K 免费 Token',
      '5 个 API 密钥',
      '基础模型访问',
      '社区支持',
    ],
    cta: '免费开始',
    featured: false,
  },
  {
    name: 'Pro',
    price: '¥99',
    period: '/月',
    desc: '适合中小团队与商业项目',
    features: [
      '无限 Token 按量计费',
      '20 个 API 密钥',
      '全部模型访问',
      '优先路由与低延迟',
      '用量分析与报表',
      '邮件支持',
    ],
    cta: '升级 Pro',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: '定制',
    period: '',
    desc: '适合大型企业与高并发场景',
    features: [
      '专属 API 端点',
      '无限 API 密钥',
      'SLA 99.99% 保障',
      '专属客户经理',
      '私有化部署选项',
      '自定义模型接入',
    ],
    cta: '联系销售',
    featured: false,
  },
]
</script>

<style scoped>
.page {
  background: var(--bg-primary);
  min-height: 100vh;
}

.page-hero {
  padding: 120px 24px 48px;
  text-align: center;
}

.page-hero h1 {
  font-size: 40px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 12px;
}

.page-hero p {
  color: var(--text-secondary);
  font-size: 16px;
}

.page-content {
  max-width: 1080px;
  margin: 0 auto;
  padding: 0 24px 80px;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 64px;
}

.pricing-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  padding: 32px;
  position: relative;
  transition: border-color 0.3s;
}

.pricing-card:hover {
  border-color: var(--border-hover);
}

.pricing-card.featured {
  border-color: rgba(180, 255, 57, 0.3);
  background: linear-gradient(180deg, rgba(180, 255, 57, 0.05) 0%, var(--bg-card) 40%);
}

.featured-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 16px;
  background: var(--accent-green);
  color: #000;
  font-size: 12px;
  font-weight: 600;
  border-radius: 999px;
}

.pricing-card h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
}

.price {
  margin-bottom: 12px;
}

.price-amount {
  font-size: 40px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.price-period {
  font-size: 14px;
  color: var(--text-muted);
}

.plan-desc {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.plan-features {
  list-style: none;
  margin-bottom: 32px;
}

.plan-features li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--text-secondary);
  padding: 8px 0;
}

.plan-btn {
  width: 100%;
}

.pricing-note {
  text-align: center;
  padding: 32px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
}

.pricing-note h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.pricing-note p {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.7;
}

.pricing-note a {
  color: var(--accent-green);
  text-decoration: underline;
}

@media (max-width: 768px) {
  .pricing-grid {
    grid-template-columns: 1fr;
  }
}
</style>
