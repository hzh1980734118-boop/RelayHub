<template>
  <div class="team">
    <div class="team-bg">
      <div class="bg-glow"></div>
    </div>

    <!-- Header -->
    <header class="team-header">
      <router-link to="/" class="logo">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 12h5l2-3 2 6 2-3h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span>RelayHub</span>
      </router-link>
      <nav class="team-nav">
        <button :class="{ active: teamTab === 'projects' }" @click="teamTab = 'projects'">项目</button>
        <button :class="{ active: teamTab === 'members' }" @click="teamTab = 'members'">成员</button>
        <button :class="{ active: teamTab === 'assets' }" @click="teamTab = 'assets'">资产库</button>
      </nav>
      <div class="header-right">
        <span class="plan-badge">团队版</span>
        <router-link to="/dashboard">
          <el-button plain size="small">控制台</el-button>
        </router-link>
      </div>
    </header>

    <!-- Projects -->
    <template v-if="teamTab === 'projects'">
      <main class="team-main">
        <div class="projects-header">
          <div>
            <h2>我的项目</h2>
            <p>{{ projects.length }} 个项目</p>
          </div>
          <div class="projects-actions">
            <el-input v-model="projectSearch" placeholder="搜索项目..." prefix-icon="Search" size="default" clearable class="project-search" />
            <el-button type="primary" size="large" @click="showCreateDialog = true">
              <el-icon><Plus /></el-icon>
              新建项目
            </el-button>
          </div>
        </div>

        <div class="project-grid">
          <!-- New project card -->
          <button type="button" class="project-card project-card--new" @click="showCreateDialog = true">
            <div class="project-card-new-inner">
              <el-icon :size="40"><Plus /></el-icon>
              <span>新建项目</span>
            </div>
          </button>

          <div
            v-for="project in filteredProjects"
            :key="project.id"
            class="project-card"
          >
            <div class="project-preview" :style="{ background: project.gradient }">
              <span class="project-type-badge">{{ project.type }}</span>
            </div>
            <div class="project-body">
              <h3>{{ project.name }}</h3>
              <div class="project-meta">
                <span>{{ project.members }} 人</span>
                <span>{{ project.updated }}</span>
              </div>
              <div class="project-avatars">
                <span
                  v-for="n in Math.min(project.members, 4)"
                  :key="n"
                  class="project-avatar"
                  :style="{ background: avatarColors[n - 1] }"
                >{{ avatarLetters[n - 1] }}</span>
                <span v-if="project.members > 4" class="project-avatar-more">+{{ project.members - 4 }}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </template>

    <!-- Members -->
    <template v-if="teamTab === 'members'">
      <main class="team-main">
        <div class="members-header">
          <div>
            <h2>团队成员</h2>
            <p>共 8 位成员</p>
          </div>
          <el-button type="primary" size="default">
            <el-icon><Plus /></el-icon>
            邀请成员
          </el-button>
        </div>
        <div class="members-grid">
          <div v-for="m in members" :key="m.name" class="member-card">
            <div class="member-avatar" :style="{ background: m.gradient }">{{ m.name.charAt(0) }}</div>
            <div class="member-info">
              <span class="member-name">{{ m.name }}</span>
              <span class="member-role">{{ m.role }}</span>
            </div>
            <span class="member-status" :class="m.online ? 'online' : ''">{{ m.online ? '在线' : '离线' }}</span>
          </div>
        </div>
      </main>
    </template>

    <!-- Assets -->
    <template v-if="teamTab === 'assets'">
      <main class="team-main">
        <div class="assets-header">
          <h2>团队资产库</h2>
          <el-button type="primary" size="default">
            <el-icon><Upload /></el-icon>
            上传资产
          </el-button>
        </div>
        <div class="assets-placeholder">
          <el-icon :size="64"><Folder /></el-icon>
          <h3>暂无团队资产</h3>
          <p>上传图片、视频、音频等素材，团队成员可共同使用</p>
        </div>
      </main>
    </template>

    <!-- Create Project Dialog -->
    <el-dialog v-model="showCreateDialog" title="新建项目" width="480px" align-center class="create-dialog">
      <el-form label-position="top" class="create-form">
        <el-form-item label="项目名称">
          <el-input v-model="newProjectName" placeholder="输入项目名称..." size="large" />
        </el-form-item>
        <el-form-item label="项目类型">
          <div class="type-select">
            <button
              v-for="t in projectTypes"
              :key="t.value"
              type="button"
              class="type-opt"
              :class="{ active: newProjectType === t.value }"
              @click="newProjectType = t.value"
            >
              <el-icon :size="18"><component :is="t.icon" /></el-icon>
              <span>{{ t.label }}</span>
            </button>
          </div>
        </el-form-item>
        <el-form-item label="描述（可选）">
          <el-input v-model="newProjectDesc" type="textarea" :rows="2" placeholder="简要描述项目内容..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" :disabled="!newProjectName.trim()" @click="createProject">创建项目</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const teamTab = ref('projects')
const projectSearch = ref('')
const showCreateDialog = ref(false)
const newProjectName = ref('')
const newProjectType = ref('video')
const newProjectDesc = ref('')

const avatarColors = ['#f97316', '#38bdf8', '#a855f7', '#4ade80']
const avatarLetters = ['A', 'B', 'C', 'D']

const projectTypes = [
  { value: 'video', label: '视频', icon: 'VideoCamera' },
  { value: 'image', label: '图像', icon: 'Picture' },
  { value: 'audio', label: '音频', icon: 'Microphone' },
  { value: 'other', label: '其他', icon: 'More' },
]

const projects = ref([
  { id: 1, name: '春季新品宣传片', type: '视频', members: 5, updated: '2 小时前', gradient: 'linear-gradient(135deg, #1a2a3a, #0d151f)' },
  { id: 2, name: '品牌形象海报系列', type: '图像', members: 3, updated: '昨天', gradient: 'linear-gradient(135deg, #3a1a2a, #1f0d15)' },
  { id: 3, name: '产品配音合集', type: '音频', members: 2, updated: '3 天前', gradient: 'linear-gradient(135deg, #1a3a2a, #0d1f15)' },
  { id: 4, name: '618 电商主图', type: '图像', members: 4, updated: '1 周前', gradient: 'linear-gradient(135deg, #2a2a1a, #15150d)' },
  { id: 5, name: '夏日专题短视频', type: '视频', members: 6, updated: '1 周前', gradient: 'linear-gradient(135deg, #2a1a3a, #150d1f)' },
])

const members = ref([
  { name: '张小明', role: '管理员', online: true, gradient: 'linear-gradient(135deg, #f97316, #ea580c)' },
  { name: '李设计', role: '设计师', online: true, gradient: 'linear-gradient(135deg, #38bdf8, #0ea5e9)' },
  { name: '王导演', role: '导演', online: true, gradient: 'linear-gradient(135deg, #a855f7, #9333ea)' },
  { name: '赵音频', role: '音频师', online: false, gradient: 'linear-gradient(135deg, #4ade80, #22c55e)' },
  { name: '陈文案', role: '文案', online: true, gradient: 'linear-gradient(135deg, #f472b6, #ec4899)' },
  { name: '刘运营', role: '运营', online: false, gradient: 'linear-gradient(135deg, #fbbf24, #f59e0b)' },
  { name: '周技术', role: '技术', online: true, gradient: 'linear-gradient(135deg, #34d399, #10b981)' },
  { name: '吴编辑', role: '编辑', online: true, gradient: 'linear-gradient(135deg, #fb923c, #f97316)' },
])

const filteredProjects = computed(() => {
  if (!projectSearch.value) return projects.value
  const q = projectSearch.value.toLowerCase()
  return projects.value.filter(p => p.name.toLowerCase().includes(q) || p.type.includes(q))
})

function createProject() {
  const name = newProjectName.value.trim()
  if (!name) return
  const typeLabel = projectTypes.find(t => t.value === newProjectType.value)?.label || '其他'
  projects.value.unshift({
    id: Date.now(),
    name,
    type: typeLabel,
    members: 1,
    updated: '刚刚',
    gradient: `linear-gradient(135deg, #${Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0')}22, #${Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0')}11)`,
  })
  showCreateDialog.value = false
  newProjectName.value = ''
  newProjectDesc.value = ''
  newProjectType.value = 'video'
  ElMessage.success('项目创建成功')
}
</script>

<style scoped>
.team {
  min-height: 100vh;
  background: #080808;
}

.team-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.bg-glow {
  position: absolute;
  top: -200px;
  right: -200px;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.06) 0%, transparent 70%);
}

/* Header */
.team-header {
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

.team-nav {
  display: flex;
  gap: 4px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 999px;
  padding: 4px;
}

.team-nav button {
  padding: 8px 20px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255,255,255,0.55);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.team-nav button:hover { color: #fff; }
.team-nav button.active {
  background: rgba(255,255,255,0.1);
  color: #fff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.plan-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(245,158,11,0.15);
  color: #f59e0b;
  border: 1px solid rgba(245,158,11,0.25);
}

/* Main */
.team-main {
  position: relative;
  z-index: 5;
  max-width: 1280px;
  margin: 0 auto;
  padding: 32px 24px 80px;
}

/* Projects */
.projects-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;
}

.projects-header h2 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 6px;
}

.projects-header p {
  font-size: 14px;
  color: rgba(255,255,255,0.4);
}

.projects-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.project-search { width: 220px; }

.project-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.project-card {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
  text-align: left;
  color: inherit;
}

.project-card:hover {
  border-color: rgba(255,255,255,0.12);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0,0,0,0.3);
}

.project-card--new {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  border-style: dashed;
  border-color: rgba(255,255,255,0.08);
  background: transparent;
}

.project-card--new:hover {
  border-color: rgba(245,158,11,0.35);
  background: rgba(245,158,11,0.03);
}

.project-card-new-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: rgba(255,255,255,0.3);
  font-size: 14px;
}

.project-card-new-inner:hover { color: #f59e0b; }

.project-preview {
  aspect-ratio: 16 / 10;
  position: relative;
}

.project-type-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 6px;
  background: rgba(0,0,0,0.5);
  color: rgba(255,255,255,0.8);
  backdrop-filter: blur(4px);
}

.project-body {
  padding: 16px;
}

.project-body h3 {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
}

.project-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: rgba(255,255,255,0.35);
  margin-bottom: 12px;
}

.project-avatars {
  display: flex;
  gap: -6px;
}

.project-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  border: 2px solid #080808;
  margin-right: -8px;
}

.project-avatar-more {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: rgba(255,255,255,0.5);
  background: rgba(255,255,255,0.06);
  border: 2px solid #080808;
  margin-right: -8px;
}

/* Members */
.members-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.members-header h2 {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 6px;
}

.members-header p {
  font-size: 14px;
  color: rgba(255,255,255,0.4);
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 14px;
}

.member-avatar {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  flex-shrink: 0;
}

.member-info { flex: 1; min-width: 0; }

.member-name {
  display: block;
  font-size: 14px;
  font-weight: 600;
}

.member-role {
  display: block;
  font-size: 12px;
  color: rgba(255,255,255,0.4);
  margin-top: 2px;
}

.member-status {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.3);
}

.member-status.online {
  background: rgba(74,222,128,0.12);
  color: #4ade80;
}

/* Assets */
.assets-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 48px;
}

.assets-header h2 { font-size: 28px; font-weight: 700; }

.assets-placeholder {
  text-align: center;
  padding: 80px 24px;
  color: rgba(255,255,255,0.2);
}

.assets-placeholder h3 {
  font-size: 18px;
  color: rgba(255,255,255,0.35);
  margin: 16px 0 8px;
}

.assets-placeholder p {
  font-size: 14px;
  color: rgba(255,255,255,0.25);
}

/* Create dialog */
.create-form :deep(.el-form-item__label) {
  color: rgba(255,255,255,0.5);
  font-size: 13px;
}

.type-select {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.type-opt {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px;
  color: rgba(255,255,255,0.65);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.type-opt:hover { color: #fff; border-color: rgba(255,255,255,0.15); }
.type-opt.active {
  background: rgba(245,158,11,0.1);
  border-color: rgba(245,158,11,0.35);
  color: #f59e0b;
}

@media (max-width: 768px) {
  .project-grid { grid-template-columns: 1fr; }
  .members-grid { grid-template-columns: repeat(2, 1fr); }
  .projects-header { flex-direction: column; }
  .projects-actions { width: 100%; }
  .project-search { flex: 1; }
}
</style>
