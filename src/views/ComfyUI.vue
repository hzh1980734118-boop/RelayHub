<template>
  <div class="comfyui">
    <!-- Top menu bar -->
    <header class="comfy-header">
      <div class="header-left">
        <router-link to="/" class="logo">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 12h5l2-3 2 6 2-3h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span>RelayHub</span>
        </router-link>
        <span class="sep">/</span>
        <span class="workflow-name">ComfyUI 工作流</span>
      </div>

      <div class="header-center">
        <button type="button" class="toolbar-btn" title="Queue Prompt">
          <el-icon><VideoPlay /></el-icon>
          <span>Queue</span>
        </button>
        <button type="button" class="toolbar-btn" title="Queue Front">
          <el-icon><CaretRight /></el-icon>
        </button>
        <span class="queue-info">Queue size: 0</span>
      </div>

      <div class="header-right">
        <button type="button" class="toolbar-btn" @click="autoArrange">
          <el-icon><Grid /></el-icon>
          <span>整理</span>
        </button>
        <button type="button" class="toolbar-btn">
          <el-icon><RefreshRight /></el-icon>
        </button>
        <router-link to="/dashboard">
          <el-button plain size="small">控制台</el-button>
        </router-link>
      </div>
    </header>

    <div class="comfy-body">
      <!-- Left node panel -->
      <aside class="node-panel">
        <div class="panel-search">
          <el-input v-model="nodeSearch" placeholder="搜索节点..." prefix-icon="Search" size="small" clearable />
        </div>
        <div class="panel-categories">
          <div v-for="cat in filteredCategories" :key="cat.name" class="node-category">
            <button type="button" class="cat-header" @click="cat.expanded = !cat.expanded">
              <el-icon :size="12"><component :is="cat.expanded ? 'ArrowDown' : 'ArrowRight'" /></el-icon>
              {{ cat.name }}
            </button>
            <div v-if="cat.expanded" class="cat-items">
              <button
                v-for="node in cat.nodes"
                :key="node"
                type="button"
                class="cat-item"
                @click="addNode(node, cat.color)"
              >{{ node }}</button>
            </div>
          </div>
        </div>
      </aside>

      <!-- Canvas -->
      <div class="canvas-area" ref="canvasRef" @mousedown="onCanvasMouseDown" @mousemove="onCanvasMouseMove" @mouseup="onCanvasMouseUp">
        <svg class="connections-svg" v-if="connections.length > 0">
          <line
            v-for="(conn, i) in connections"
            :key="i"
            :x1="conn.x1" :y1="conn.y1"
            :x2="conn.x2" :y2="conn.y2"
            stroke="#556677" stroke-width="2"
            stroke-linecap="round"
          />
        </svg>

        <!-- Nodes -->
        <div
          v-for="node in nodes"
          :key="node.id"
          class="comfy-node"
          :style="{ left: node.x + 'px', top: node.y + 'px', '--node-color': node.color }"
          :class="{ selected: selectedNodeId === node.id }"
          @mousedown.stop="onNodeMouseDown($event, node.id)"
          @click.stop="selectedNodeId = node.id"
        >
          <div class="node-header">
            <span class="node-title">{{ node.title }}</span>
          </div>
          <div class="node-body">
            <div class="node-ports">
              <div v-for="input in node.inputs" :key="input.name" class="node-port input-port">
                <span class="port-dot"></span>
                <span class="port-label">{{ input.name }}</span>
                <div v-if="input.type === 'text'" class="port-widget">
                  <input type="text" class="node-input" :placeholder="input.placeholder" />
                </div>
                <div v-else-if="input.type === 'select'" class="port-widget">
                  <select class="node-select">
                    <option v-for="o in input.options" :key="o">{{ o }}</option>
                  </select>
                </div>
                <div v-else-if="input.type === 'slider'" class="port-widget port-widget--slider">
                  <input type="range" :min="input.min" :max="input.max" :value="input.default" class="node-slider" />
                  <span class="slider-val">{{ input.default }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="node-outputs">
            <div v-for="output in node.outputs" :key="output" class="node-port output-port">
              <span class="port-label">{{ output }}</span>
              <span class="port-dot out"></span>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="nodes.length === 0" class="canvas-empty">
          <el-icon :size="48"><Grid /></el-icon>
          <h3>无限组合，无限可能</h3>
          <p>从左侧面板拖拽节点到画布，或双击画布添加节点</p>
        </div>
      </div>
    </div>

    <!-- Bottom status bar -->
    <footer class="comfy-status">
      <span>节点: {{ nodes.length }}</span>
      <span>工作流就绪</span>
      <span class="status-dot"></span>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const nodeSearch = ref('')
const selectedNodeId = ref(null)
const canvasRef = ref(null)

// Dragging state
let dragging = ref(false)
let dragNodeId = ref(null)
let dragOffset = { x: 0, y: 0 }

const categories = ref([
  {
    name: '加载器', expanded: true,
    nodes: ['Load Checkpoint', 'Load VAE', 'Load LoRA', 'Load ControlNet', 'Load Image', 'Load Video'],
    color: '#3b82f6',
  },
  {
    name: '条件', expanded: false,
    nodes: ['CLIP Text Encode', 'CLIP Vision Encode', 'ConditioningCombine', 'ConditioningAverage'],
    color: '#f59e0b',
  },
  {
    name: '采样', expanded: false,
    nodes: ['KSampler', 'KSampler Advanced', 'SamplerCustom', 'VAE Encode', 'VAE Decode'],
    color: '#ef4444',
  },
  {
    name: '图像', expanded: false,
    nodes: ['Preview Image', 'Save Image', 'Image Scale', 'Image Composite', 'Image Blend', 'Image Invert'],
    color: '#a855f7',
  },
  {
    name: '视频', expanded: false,
    nodes: ['Video Combine', 'Frame Interpolation', 'Video Upscale', 'Save Video', 'Preview Video'],
    color: '#38bdf8',
  },
  {
    name: '高级', expanded: false,
    nodes: ['ControlNet Apply', 'IPAdapter Apply', 'AnimateDiff Loader', 'Upscale Model Loader', 'Face Detailer'],
    color: '#4ade80',
  },
])

const filteredCategories = computed(() => {
  if (!nodeSearch.value) return categories.value
  const q = nodeSearch.value.toLowerCase()
  return categories.value
    .map(cat => ({
      ...cat,
      nodes: cat.nodes.filter(n => n.toLowerCase().includes(q)),
    }))
    .filter(cat => cat.nodes.length > 0)
})

// Pre-built workflow nodes
const nodes = ref([
  { id: 1, title: 'Load Checkpoint', x: 40, y: 80, color: '#3b82f6',
    inputs: [{ name: 'ckpt_name', type: 'select', options: ['SDXL Base 1.0', 'SD 1.5', 'DreamShaper', 'RealisticVision'] }],
    outputs: ['MODEL', 'CLIP', 'VAE'] },
  { id: 2, title: 'CLIP Text Encode (正向)', x: 40, y: 260, color: '#f59e0b',
    inputs: [
      { name: 'text', type: 'text', placeholder: '输入正向提示词...' },
      { name: 'clip', type: 'wire' },
    ],
    outputs: ['CONDITIONING'] },
  { id: 3, title: 'CLIP Text Encode (负向)', x: 40, y: 440, color: '#f59e0b',
    inputs: [
      { name: 'text', type: 'text', placeholder: '输入负向提示词...' },
      { name: 'clip', type: 'wire' },
    ],
    outputs: ['CONDITIONING'] },
  { id: 4, title: 'KSampler', x: 360, y: 240, color: '#ef4444',
    inputs: [
      { name: 'seed', type: 'text', placeholder: '随机' },
      { name: 'steps', type: 'slider', min: 1, max: 100, default: 20 },
      { name: 'cfg', type: 'slider', min: 1, max: 30, default: 7 },
      { name: 'sampler_name', type: 'select', options: ['euler', 'euler_ancestral', 'dpmpp_2m', 'dpm_2', 'lcm'] },
      { name: 'scheduler', type: 'select', options: ['normal', 'karras', 'exponential', 'sgm_uniform'] },
      { name: 'denoise', type: 'slider', min: 0, max: 1, default: 1 },
    ],
    outputs: ['LATENT'] },
  { id: 5, title: 'VAE Decode', x: 640, y: 340, color: '#ef4444',
    inputs: [{ name: 'vae', type: 'wire' }, { name: 'samples', type: 'wire' }],
    outputs: ['IMAGE'] },
  { id: 6, title: 'Save Image', x: 880, y: 420, color: '#a855f7',
    inputs: [{ name: 'filename_prefix', type: 'text', placeholder: 'ComfyUI' }, { name: 'images', type: 'wire' }],
    outputs: [] },
])

// Pre-defined connections between nodes (visual only)
const connections = [
  { x1: 300, y1: 100, x2: 360, y2: 260 },
  { x1: 300, y1: 110, x2: 40, y2: 280 },
  { x1: 300, y1: 110, x2: 40, y2: 460 },
  { x1: 300, y1: 280, x2: 360, y2: 400 },
  { x1: 300, y1: 460, x2: 360, y2: 420 },
  { x1: 620, y1: 260, x2: 640, y2: 360 },
  { x1: 620, y1: 380, x2: 640, y2: 380 },
  { x1: 840, y1: 360, x2: 880, y2: 440 },
]

// Use approximate positions based on node positions for connections
function autoArrange() {
  nodes.value.forEach((node, i) => {
    node.x = 40 + (i % 3) * 340
    node.y = 60 + Math.floor(i / 3) * 220
  })
}

// Drag handling
function onNodeMouseDown(e, nodeId) {
  dragNodeId.value = nodeId
  const node = nodes.value.find(n => n.id === nodeId)
  if (node) {
    dragOffset.x = e.clientX - node.x
    dragOffset.y = e.clientY - node.y
  }
  dragging.value = true
}

function onCanvasMouseMove(e) {
  if (dragging.value && dragNodeId.value !== null) {
    const node = nodes.value.find(n => n.id === dragNodeId.value)
    if (node) {
      // Clamp to stay mostly within view
      node.x = Math.max(0, Math.min(e.clientX - dragOffset.x - 260, 2000))
      node.y = Math.max(0, e.clientY - dragOffset.y - 64)
    }
  }
}

function onCanvasMouseUp() {
  dragging.value = false
  dragNodeId.value = null
}

function onCanvasMouseDown(e) {
  selectedNodeId.value = null
}

function addNode(name, color) {
  const id = Date.now()
  nodes.value.push({
    id,
    title: name,
    x: 200 + Math.random() * 200,
    y: 100 + Math.random() * 300,
    color,
    inputs: [{ name: 'input', type: 'text', placeholder: '值...' }],
    outputs: ['OUTPUT'],
  })
}
</script>

<style scoped>
.comfyui {
  height: 100vh;
  background: #0d0d14;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header */
.comfy-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: #12121a;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  z-index: 20;
  flex-shrink: 0;
  gap: 16px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
}

.logo-icon {
  width: 28px; height: 28px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
}
.logo-icon svg { width: 16px; height: 16px; }

.sep { color: rgba(255,255,255,0.2); }
.workflow-name { font-size: 13px; color: rgba(255,255,255,0.5); }

.header-center {
  display: flex;
  align-items: center;
  gap: 6px;
}

.toolbar-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 12px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px;
  color: rgba(255,255,255,0.7); font-size: 12px;
  cursor: pointer; transition: all 0.2s;
}
.toolbar-btn:hover { background: rgba(255,255,255,0.08); color: #fff; }

.queue-info { font-size: 11px; color: rgba(255,255,255,0.3); margin-left: 8px; }

.header-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }

/* Body */
.comfy-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* Node panel */
.node-panel {
  width: 240px;
  background: #101018;
  border-right: 1px solid rgba(255,255,255,0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
  z-index: 10;
}

.panel-search { padding: 10px; }
.panel-search :deep(.el-input__wrapper) {
  border-radius: 8px;
  background: rgba(255,255,255,0.04) !important;
  border-color: rgba(255,255,255,0.06) !important;
}

.panel-categories {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px 16px;
}

.node-category { margin-bottom: 2px; }

.cat-header {
  display: flex; align-items: center; gap: 6px;
  width: 100%; padding: 8px 10px;
  background: none; border: none; border-radius: 6px;
  font-size: 13px; font-weight: 600;
  color: rgba(255,255,255,0.5);
  cursor: pointer; text-align: left;
  transition: all 0.15s;
}
.cat-header:hover { color: #fff; background: rgba(255,255,255,0.03); }

.cat-items {
  padding: 2px 0 4px 22px;
}

.cat-item {
  display: block;
  width: 100%; padding: 5px 10px;
  background: none; border: none; border-radius: 4px;
  font-size: 12px; color: rgba(255,255,255,0.45);
  cursor: pointer; text-align: left;
  transition: all 0.15s;
}
.cat-item:hover { color: #fff; background: rgba(255,255,255,0.04); }

/* Canvas */
.canvas-area {
  flex: 1;
  position: relative;
  overflow: auto;
  background:
    radial-gradient(circle, rgba(255,255,255,0.015) 1px, transparent 1px);
  background-size: 20px 20px;
  cursor: default;
}

.connections-svg {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
}

.canvas-empty {
  position: absolute;
  top: 50%; left: 50%; transform: translate(-50%, -50%);
  text-align: center; color: rgba(255,255,255,0.15);
}
.canvas-empty h3 { font-size: 20px; color: rgba(255,255,255,0.25); margin: 12px 0 6px; }
.canvas-empty p { font-size: 13px; }

/* Nodes */
.comfy-node {
  position: absolute;
  min-width: 240px;
  background: #161622;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  overflow: hidden;
  cursor: move;
  transition: box-shadow 0.2s, border-color 0.2s;
  user-select: none;
}

.comfy-node:hover { border-color: rgba(255,255,255,0.15); }
.comfy-node.selected {
  border-color: var(--node-color, #3b82f6);
  box-shadow: 0 0 0 1px var(--node-color, #3b82f6);
}

.node-header {
  padding: 8px 12px;
  background: var(--node-color, #3b82f6);
  font-size: 12px; font-weight: 600; color: #fff;
}

.node-body { padding: 6px 0; }

.node-ports { display: flex; flex-direction: column; }

.node-port {
  display: flex; align-items: center; gap: 8px;
  padding: 4px 10px;
  font-size: 11px; color: rgba(255,255,255,0.5);
}

.port-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: rgba(255,255,255,0.3);
  border: 1px solid rgba(255,255,255,0.5);
  flex-shrink: 0;
}
.port-dot.out { margin-left: auto; }

.port-label { flex-shrink: 0; min-width: 30px; font-size: 10px; }

.port-widget { flex: 1; min-width: 0; }
.port-widget--slider { display: flex; align-items: center; gap: 6px; }

.node-input {
  width: 100%; padding: 3px 6px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 4px;
  font-size: 11px; color: #fff; outline: none;
  font-family: monospace;
}
.node-input:focus { border-color: var(--node-color, #3b82f6); }

.node-select {
  width: 100%; padding: 3px 6px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 4px;
  font-size: 11px; color: #fff; outline: none;
  cursor: pointer;
}

.node-slider {
  flex: 1; height: 4px;
  -webkit-appearance: none; appearance: none;
  background: rgba(255,255,255,0.1);
  border-radius: 2px; outline: none;
  cursor: pointer;
}
.node-slider::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none;
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--node-color, #3b82f6); cursor: pointer;
}

.slider-val {
  font-size: 10px; color: rgba(255,255,255,0.5);
  min-width: 24px; text-align: right; font-family: monospace;
}

.node-outputs {
  padding: 4px 0;
  border-top: 1px solid rgba(255,255,255,0.04);
}
.output-port { justify-content: flex-end; }

/* Status bar */
.comfy-status {
  display: flex; align-items: center; gap: 16px;
  padding: 6px 16px;
  background: #12121a;
  border-top: 1px solid rgba(255,255,255,0.06);
  font-size: 11px; color: rgba(255,255,255,0.3);
  flex-shrink: 0;
  z-index: 20;
}

.status-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 6px rgba(74,222,128,0.4);
  margin-left: auto;
}
</style>
