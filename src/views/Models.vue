<template>
  <div class="page">
    <AppHeader variant="dark" />

    <section class="page-hero">
      <h1>模型列表</h1>
      <p>接入全球 30+ 顶尖 AI 模型，持续更新扩展</p>
    </section>

    <section class="page-content">
      <div class="filter-bar">
        <el-input v-model="search" placeholder="搜索模型..." prefix-icon="Search" clearable />
        <div class="filter-tags">
          <span
            v-for="tag in typeFilters"
            :key="tag.value"
            class="filter-tag"
            :class="{ active: activeType === tag.value }"
            @click="activeType = tag.value"
          >
            {{ tag.label }}
          </span>
        </div>
      </div>

      <div class="models-table-wrap">
        <el-table :data="filteredModels" style="width: 100%">
          <el-table-column prop="name" label="模型名称" width="220">
            <template #default="{ row }">
              <div class="model-name-cell">
                <span class="model-name">{{ row.name }}</span>
                <el-tag v-if="row.hot" size="small" effect="dark" type="warning">热门</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="provider" label="提供商" width="140" />
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <span class="type-badge" :class="row.typeKey">{{ row.type }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="context" label="上下文" width="120" />
          <el-table-column prop="price" label="价格" width="160" />
          <el-table-column prop="desc" label="描述" />
          <el-table-column label="状态" width="100">
            <template #default>
              <span class="status-dot online">在线</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </section>

    <AppFooter />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import { publicModels } from '@/data/models.js'

const search = ref('')
const activeType = ref('all')

const typeFilters = [
  { label: '全部', value: 'all' },
  { label: '对话', value: 'chat' },
  { label: '图像', value: 'image' },
  { label: '视频', value: 'video' },
  { label: '音频', value: 'audio' },
]

const filteredModels = computed(() => {
  return publicModels.value.filter(m => {
    const matchType = activeType.value === 'all' || m.typeKey === activeType.value
    const matchSearch = !search.value || m.name.toLowerCase().includes(search.value.toLowerCase())
    return matchType && matchSearch
  })
})
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
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px 80px;
}

.filter-bar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.filter-bar .el-input {
  max-width: 400px;
}

.filter-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-tag {
  padding: 6px 16px;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  font-size: 13px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}

.filter-tag:hover,
.filter-tag.active {
  background: var(--bg-card);
  color: var(--text-primary);
  border-color: var(--border-hover);
}

.models-table-wrap {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 8px;
  overflow: hidden;
}

.model-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.model-name {
  font-weight: 500;
}

.type-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
}

.type-badge.chat { color: #60a5fa; }
.type-badge.image { color: #c084fc; }
.type-badge.video { color: #f472b6; }
.type-badge.audio { color: #4ade80; }

.status-dot {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4ade80;
}
</style>
