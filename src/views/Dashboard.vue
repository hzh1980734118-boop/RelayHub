<template>
  <div class="dashboard-layout">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <router-link to="/" class="logo">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 12h5l2-3 2 6 2-3h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span v-if="!sidebarCollapsed" class="logo-text">RelayHub</span>
        </router-link>
        <button class="collapse-btn" @click="sidebarCollapsed = !sidebarCollapsed">
          <el-icon><component :is="sidebarCollapsed ? 'Expand' : 'Fold'" /></el-icon>
        </button>
      </div>

      <nav class="sidebar-nav">
        <div
          v-for="item in navItems"
          :key="item.key"
          class="nav-item"
          :class="{ active: activeNav === item.key }"
          @click="handleNavClick(item.key)"
        >
          <el-icon :size="18"><component :is="item.icon" /></el-icon>
          <span v-if="!sidebarCollapsed">{{ item.label }}</span>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info" v-if="!sidebarCollapsed">
          <el-avatar :size="32" style="background: linear-gradient(135deg, #a855f7, #3b82f6)">U</el-avatar>
          <div class="user-meta">
            <span class="user-name">user@example.com</span>
            <span class="user-plan">Pro 计划</span>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main -->
    <div class="main-area">
      <header class="topbar">
        <div class="topbar-left">
          <h1>{{ currentPageTitle }}</h1>
        </div>
        <div class="topbar-right">
          <el-input
            v-model="searchQuery"
            placeholder="搜索..."
            prefix-icon="Search"
            class="search-input"
            clearable
          />
          <el-badge :value="3" :max="9">
            <el-button circle plain>
              <el-icon><Bell /></el-icon>
            </el-button>
          </el-badge>
          <el-button circle plain>
            <el-icon><Setting /></el-icon>
          </el-button>
        </div>
      </header>

      <main class="dashboard-main">
        <!-- Overview -->
        <template v-if="activeNav === 'overview'">
          <div class="stats-row">
            <div v-for="stat in overviewStats" :key="stat.label" class="stat-card">
              <div class="stat-card-header">
                <span class="stat-label">{{ stat.label }}</span>
                <el-icon :size="18" :style="{ color: stat.color }"><component :is="stat.icon" /></el-icon>
              </div>
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-change" :class="stat.trend">
                <el-icon :size="12"><component :is="stat.trend === 'up' ? 'Top' : 'Bottom'" /></el-icon>
                {{ stat.change }}
              </div>
            </div>
          </div>

          <div class="content-grid">
            <div class="panel chart-panel">
              <div class="panel-header">
                <h3>API 调用趋势</h3>
                <el-radio-group v-model="chartPeriod" size="small">
                  <el-radio-button value="7d">7天</el-radio-button>
                  <el-radio-button value="30d">30天</el-radio-button>
                  <el-radio-button value="90d">90天</el-radio-button>
                </el-radio-group>
              </div>
              <div class="chart-area">
                <div class="chart-bars">
                  <div
                    v-for="(bar, i) in chartData"
                    :key="i"
                    class="chart-bar"
                    :style="{ height: `${bar}%` }"
                  >
                    <span class="bar-tooltip">{{ bar }}K</span>
                  </div>
                </div>
                <div class="chart-labels">
                  <span v-for="label in chartLabels" :key="label">{{ label }}</span>
                </div>
              </div>
            </div>

            <div class="panel usage-panel">
              <div class="panel-header">
                <h3>用量概览</h3>
              </div>
              <div class="usage-items">
                <div v-for="usage in usageItems" :key="usage.label" class="usage-item">
                  <div class="usage-info">
                    <span>{{ usage.label }}</span>
                    <span class="usage-value">{{ usage.used }} / {{ usage.total }}</span>
                  </div>
                  <el-progress
                    :percentage="usage.percentage"
                    :color="usage.color"
                    :show-text="false"
                    :stroke-width="6"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="panel recent-panel">
            <div class="panel-header">
              <h3>最近请求</h3>
              <el-button plain size="small">查看全部</el-button>
            </div>
            <el-table :data="recentRequests" style="width: 100%">
              <el-table-column prop="time" label="时间" width="160" />
              <el-table-column prop="model" label="模型" width="180">
                <template #default="{ row }">
                  <span class="model-badge">{{ row.model }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="endpoint" label="端点" />
              <el-table-column prop="tokens" label="Tokens" width="100" />
              <el-table-column prop="latency" label="延迟" width="100" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === '成功' ? 'success' : 'danger'" size="small" effect="dark">
                    {{ row.status }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>

        <!-- API Keys -->
        <template v-if="activeNav === 'keys'">
          <div class="panel">
            <div class="panel-header">
              <h3>API 密钥管理</h3>
              <el-button type="primary" size="default">
                <el-icon><Plus /></el-icon>
                创建密钥
              </el-button>
            </div>
            <el-table :data="apiKeys" style="width: 100%">
              <el-table-column prop="name" label="名称" width="200" />
              <el-table-column prop="key" label="密钥">
                <template #default="{ row }">
                  <code class="api-key">{{ row.key }}</code>
                </template>
              </el-table-column>
              <el-table-column prop="created" label="创建时间" width="160" />
              <el-table-column prop="lastUsed" label="最后使用" width="160" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === '活跃' ? 'success' : 'info'" size="small" effect="dark">
                    {{ row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120">
                <template #default>
                  <el-button link type="primary" size="small">编辑</el-button>
                  <el-button link type="danger" size="small">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>

        <!-- Models -->
        <template v-if="activeNav === 'models'">
          <div class="model-filter">
            <el-input v-model="modelSearch" placeholder="搜索模型..." prefix-icon="Search" clearable />
            <el-select v-model="modelTypeFilter" placeholder="类型" style="width: 140px">
              <el-option label="全部" value="" />
              <el-option label="对话" value="chat" />
              <el-option label="图像" value="image" />
              <el-option label="视频" value="video" />
              <el-option label="音频" value="audio" />
            </el-select>
          </div>
          <div class="dash-model-grid">
            <div v-for="model in dashModels" :key="model.id" class="dash-model-card">
              <div class="dash-model-top">
                <span class="model-type" :class="model.type">{{ model.typeLabel }}</span>
                <el-switch v-model="model.enabled" />
              </div>
              <h4>{{ model.name }}</h4>
              <p>{{ model.provider }}</p>
              <div class="dash-model-bottom">
                <span>{{ model.price }}</span>
                <span class="model-status" :class="{ online: model.online }">
                  {{ model.online ? '在线' : '离线' }}
                </span>
              </div>
            </div>
          </div>
        </template>

        <!-- Billing -->
        <template v-if="activeNav === 'billing'">
          <div class="stats-row billing-stats">
            <div class="stat-card">
              <div class="stat-card-header">
                <span class="stat-label">账户余额</span>
                <el-icon :size="18" style="color: #b4ff39"><Wallet /></el-icon>
              </div>
              <div class="stat-value">¥ {{ accountBalance.toFixed(2) }}</div>
              <el-button type="primary" size="small" style="margin-top: 12px" @click="showRecharge = true">
                充值
              </el-button>
            </div>
            <div class="stat-card">
              <div class="stat-card-header">
                <span class="stat-label">本月消费</span>
                <el-icon :size="18" style="color: #f97316"><TrendCharts /></el-icon>
              </div>
              <div class="stat-value">¥ 71.50</div>
              <div class="stat-change up">
                <el-icon :size="12"><Top /></el-icon>
                较上月 +12%
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-card-header">
                <span class="stat-label">当前计划</span>
                <el-icon :size="18" style="color: #a855f7"><Medal /></el-icon>
              </div>
              <div class="stat-value" style="font-size: 24px">Pro</div>
              <el-button plain size="small" style="margin-top: 12px">升级计划</el-button>
            </div>
          </div>
          <div class="panel">
            <div class="panel-header">
              <h3>账单记录</h3>
              <el-button type="primary" size="default" @click="showRecharge = true">
                <el-icon><Wallet /></el-icon>
                充值
              </el-button>
            </div>
            <el-table :data="billingRecords" style="width: 100%">
              <el-table-column prop="date" label="日期" width="160" />
              <el-table-column prop="desc" label="描述" />
              <el-table-column prop="amount" label="金额" width="120">
                <template #default="{ row }">
                  <span :class="{ 'amount-income': row.type === 'recharge' }">{{ row.amount }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="payMethod" label="支付方式" width="120">
                <template #default="{ row }">
                  <span v-if="row.payMethod" class="pay-tag" :class="row.payMethod">
                    {{ row.payMethod === 'wechat' ? '微信' : row.payMethod === 'alipay' ? '支付宝' : '-' }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag type="success" size="small" effect="dark">{{ row.status }}</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </template>

        <!-- Settings -->
        <template v-if="activeNav === 'settings'">
          <div class="panel settings-panel">
            <h3>账户设置</h3>
            <el-form label-position="top" class="settings-form">
              <el-form-item label="用户名">
                <el-input model-value="user@example.com" disabled />
              </el-form-item>
              <el-form-item label="显示名称">
                <el-input model-value="RelayHub User" />
              </el-form-item>
              <el-form-item label="API Base URL">
                <el-input model-value="https://api.relayhub.ai/v1" readonly>
                  <template #append>
                    <el-button><el-icon><CopyDocument /></el-icon></el-button>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="速率限制">
                <el-slider :model-value="60" :max="200" show-input />
              </el-form-item>
              <el-form-item>
                <el-button type="primary">保存更改</el-button>
              </el-form-item>
            </el-form>
          </div>
        </template>
      </main>
    </div>

    <RechargeDialog
      v-model="showRecharge"
      :current-balance="accountBalance"
      @success="handleRechargeSuccess"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import RechargeDialog from '@/components/RechargeDialog.vue'
import { managedModels } from '@/data/models.js'

const router = useRouter()

const sidebarCollapsed = ref(false)
const activeNav = ref('overview')
const searchQuery = ref('')
const chartPeriod = ref('7d')
const modelSearch = ref('')
const modelTypeFilter = ref('')
const showRecharge = ref(false)
const accountBalance = ref(128.50)

const navItems = [
  { key: 'overview', label: '概览', icon: 'Odometer' },
  { key: 'studio', label: '创作', icon: 'MagicStick' },
  { key: 'keys', label: 'API 密钥', icon: 'Key' },
  { key: 'models', label: '模型管理', icon: 'Cpu' },
  { key: 'billing', label: '账单', icon: 'Wallet' },
  { key: 'settings', label: '设置', icon: 'Setting' },
]

const pageTitles = {
  overview: '控制台概览',
  keys: 'API 密钥',
  models: '模型管理',
  billing: '账单中心',
  settings: '设置',
}

const currentPageTitle = computed(() => pageTitles[activeNav.value])

function handleNavClick(key) {
  if (key === 'studio') {
    router.push('/studio/image')
    return
  }
  activeNav.value = key
}

const overviewStats = [
  { label: '今日请求', value: '12,847', change: '+8.2%', trend: 'up', icon: 'DataLine', color: '#60a5fa' },
  { label: 'Token 消耗', value: '2.4M', change: '+15.3%', trend: 'up', icon: 'Coin', color: '#a855f7' },
  { label: '平均延迟', value: '42ms', change: '-3.1%', trend: 'down', icon: 'Timer', color: '#4ade80' },
  { label: '成功率', value: '99.97%', change: '+0.02%', trend: 'up', icon: 'CircleCheck', color: '#b4ff39' },
]

const chartData = [45, 62, 38, 75, 55, 88, 72, 95, 68, 82, 58, 90]
const chartLabels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

const usageItems = [
  { label: 'GPT-4o', used: '850K', total: '1M', percentage: 85, color: '#60a5fa' },
  { label: 'Claude 3.5', used: '420K', total: '1M', percentage: 42, color: '#a855f7' },
  { label: 'DALL·E 3', used: '156', total: '500', percentage: 31, color: '#c084fc' },
  { label: 'Whisper', used: '2.1K', total: '10K', percentage: 21, color: '#4ade80' },
]

const recentRequests = [
  { time: '2026-05-30 14:32', model: 'GPT-4o', endpoint: '/v1/chat/completions', tokens: '1,284', latency: '38ms', status: '成功' },
  { time: '2026-05-30 14:31', model: 'Claude 3.5', endpoint: '/v1/chat/completions', tokens: '856', latency: '45ms', status: '成功' },
  { time: '2026-05-30 14:30', model: 'DALL·E 3', endpoint: '/v1/images/generations', tokens: '-', latency: '2.1s', status: '成功' },
  { time: '2026-05-30 14:28', model: 'GPT-4o', endpoint: '/v1/chat/completions', tokens: '2,104', latency: '52ms', status: '成功' },
  { time: '2026-05-30 14:25', model: 'Gemini 2.0', endpoint: '/v1/chat/completions', tokens: '642', latency: '-', status: '失败' },
]

const apiKeys = [
  { name: 'Production', key: 'sk-rh-••••••••••••••••3f8a', created: '2026-01-15', lastUsed: '2026-05-30', status: '活跃' },
  { name: 'Development', key: 'sk-rh-••••••••••••••••7b2c', created: '2026-03-20', lastUsed: '2026-05-29', status: '活跃' },
  { name: 'Testing', key: 'sk-rh-••••••••••••••••9d1e', created: '2026-04-10', lastUsed: '2026-05-15', status: '已禁用' },
]

const dashModels = managedModels

const billingRecords = ref([
  { date: '2026-05-28', desc: 'GPT-4o API 调用', amount: '- ¥ 12.50', type: 'consume', payMethod: '', status: '已支付' },
  { date: '2026-05-25', desc: 'Claude 3.5 API 调用', amount: '- ¥ 8.30', type: 'consume', payMethod: '', status: '已支付' },
  { date: '2026-05-20', desc: '账户充值', amount: '+ ¥ 100.00', type: 'recharge', payMethod: 'wechat', status: '已支付' },
  { date: '2026-05-15', desc: 'DALL·E 3 图像生成', amount: '- ¥ 6.40', type: 'consume', payMethod: '', status: '已支付' },
])

function formatDateTime(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function handleRechargeSuccess({ amount, method }) {
  accountBalance.value += amount
  billingRecords.value.unshift({
    date: formatDateTime(new Date()),
    desc: '账户充值',
    amount: `+ ¥ ${amount.toFixed(2)}`,
    type: 'recharge',
    payMethod: method,
    status: '已支付',
  })
  const methodLabel = method === 'wechat' ? '微信' : '支付宝'
  ElMessage.success(`已通过${methodLabel}成功充值 ¥${amount.toFixed(2)}`)
}
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
}

/* Sidebar */
.sidebar {
  width: 240px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
  flex-shrink: 0;
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
  height: 64px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
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
  flex-shrink: 0;
}

.logo-icon svg {
  width: 18px;
  height: 18px;
}

.logo-text {
  font-size: 16px;
  font-weight: 700;
  white-space: nowrap;
}

.collapse-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  display: flex;
}

.sidebar-nav {
  flex: 1;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-primary);
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
  font-weight: 500;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--border-color);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-meta {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
}

.user-plan {
  font-size: 11px;
  color: var(--accent-green);
}

/* Main Area */
.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.topbar {
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
  background: rgba(5, 5, 5, 0.6);
  backdrop-filter: blur(12px);
  flex-shrink: 0;
}

.topbar-left h1 {
  font-size: 20px;
  font-weight: 600;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  width: 240px;
}

.dashboard-main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

/* Stats */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 20px;
}

.stat-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stat-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  margin-top: 8px;
}

.stat-change.up { color: #4ade80; }
.stat-change.down { color: #f87171; }

/* Panels */
.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.panel {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.panel-header h3 {
  font-size: 16px;
  font-weight: 600;
}

/* Chart */
.chart-area {
  height: 240px;
  display: flex;
  flex-direction: column;
}

.chart-bars {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 0 4px;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(180deg, rgba(168, 85, 247, 0.6) 0%, rgba(168, 85, 247, 0.1) 100%);
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  position: relative;
  transition: height 0.5s ease;
}

.chart-bar:hover {
  background: linear-gradient(180deg, rgba(168, 85, 247, 0.8) 0%, rgba(168, 85, 247, 0.2) 100%);
}

.bar-tooltip {
  display: none;
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.chart-bar:hover .bar-tooltip {
  display: block;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  padding-top: 8px;
  font-size: 11px;
  color: var(--text-muted);
}

/* Usage */
.usage-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.usage-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
}

.usage-value {
  color: var(--text-secondary);
}

/* Table extras */
.model-badge {
  font-family: monospace;
  font-size: 13px;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
}

.api-key {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.04);
  padding: 4px 8px;
  border-radius: 4px;
}

/* Model management */
.model-filter {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.model-filter .el-input {
  max-width: 320px;
}

.dash-model-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.dash-model-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 20px;
}

.dash-model-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.dash-model-card h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.dash-model-card p {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.dash-model-bottom {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text-muted);
}

.model-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(248, 113, 113, 0.15);
  color: #f87171;
}

.model-status.online {
  background: rgba(74, 222, 128, 0.15);
  color: #4ade80;
}

/* Settings */
.settings-panel h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 24px;
}

.settings-form {
  max-width: 480px;
}

.settings-form :deep(.el-form-item__label) {
  color: var(--text-secondary);
}

.billing-stats {
  grid-template-columns: repeat(3, 1fr);
}

.amount-income {
  color: #4ade80;
  font-weight: 500;
}

.text-muted {
  color: var(--text-muted);
}

.pay-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 999px;
}

.pay-tag.wechat {
  background: rgba(7, 193, 96, 0.15);
  color: #07c160;
}

.pay-tag.alipay {
  background: rgba(22, 119, 255, 0.15);
  color: #1677ff;
}

@media (max-width: 1024px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .dash-model-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }

  .dash-model-grid {
    grid-template-columns: 1fr;
  }

  .search-input {
    display: none;
  }
}
</style>
