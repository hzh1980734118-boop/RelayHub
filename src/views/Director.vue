<template>
  <div class="director">
    <!-- Top toolbar -->
    <header class="dir-header">
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
        <span class="project-name">3D 创作工作台</span>
      </div>

      <div class="header-tools">
        <button class="tool-btn" :class="{ active: activeTool === 'select' }" @click="activeTool = 'select'" title="选择">
          <el-icon><Pointer /></el-icon>
        </button>
        <button class="tool-btn" :class="{ active: activeTool === 'move' }" @click="activeTool = 'move'" title="移动">
          <el-icon><Rank /></el-icon>
        </button>
        <button class="tool-btn" :class="{ active: activeTool === 'rotate' }" @click="activeTool = 'rotate'" title="旋转">
          <el-icon><Refresh /></el-icon>
        </button>
        <button class="tool-btn" :class="{ active: activeTool === 'scale' }" @click="activeTool = 'scale'" title="缩放">
          <el-icon><FullScreen /></el-icon>
        </button>
        <span class="tool-sep"></span>
        <button class="tool-btn" title="撤销">
          <el-icon><RefreshLeft /></el-icon>
        </button>
        <button class="tool-btn" title="重做">
          <el-icon><RefreshRight /></el-icon>
        </button>
      </div>

      <div class="header-right">
        <el-button type="primary" size="small">渲染</el-button>
        <el-button size="small">导出</el-button>
        <router-link to="/dashboard">
          <el-button plain size="small">控制台</el-button>
        </router-link>
      </div>
    </header>

    <div class="dir-body">
      <!-- Left: Scene hierarchy + assets -->
      <aside class="dir-left">
        <div class="panel-tabs">
          <button :class="{ active: leftTab === 'scene' }" @click="leftTab = 'scene'">场景</button>
          <button :class="{ active: leftTab === 'library' }" @click="leftTab = 'library'">模型库</button>
        </div>

        <!-- Scene hierarchy -->
        <div v-if="leftTab === 'scene'" class="scene-panel">
          <div class="scene-tree">
            <div
              v-for="obj in sceneObjects"
              :key="obj.id"
              class="scene-node"
              :class="{ active: activeObjectId === obj.id }"
              @click="activeObjectId = obj.id"
            >
              <el-icon :size="12"><ArrowRight v-if="!obj.collapsed" /><ArrowDown v-else /></el-icon>
              <el-icon :size="14" class="node-icon"><component :is="obj.icon" /></el-icon>
              <span>{{ obj.name }}</span>
              <span class="node-eye" @click.stop="obj.visible = !obj.visible">
                <el-icon :size="12"><component :is="obj.visible ? 'View' : 'Hide'" /></el-icon>
              </span>
            </div>
          </div>
          <button class="panel-add-btn" @click="addSceneObject">
            <el-icon><Plus /></el-icon>
            添加对象
          </button>
        </div>

        <!-- Model library -->
        <div v-if="leftTab === 'library'" class="library-panel">
          <el-input v-model="libSearch" placeholder="搜索模型..." prefix-icon="Search" size="small" clearable class="lib-search" />
          <div class="lib-grid">
            <div
              v-for="m in filteredModels"
              :key="m.id"
              class="lib-item"
              draggable="true"
              @click="addModelToScene(m)"
            >
              <div class="lib-preview" :style="{ background: m.gradient }">
                <el-icon :size="22"><component :is="m.icon" /></el-icon>
              </div>
              <span>{{ m.name }}</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Center: 3D Viewport -->
      <main class="dir-viewport" ref="viewportRef">
        <canvas ref="canvas3DRef" class="viewport-canvas"></canvas>

        <!-- Viewport overlays -->
        <div class="viewport-grid-label">
          <span class="grid-label active">透视</span>
          <span class="grid-label">顶</span>
          <span class="grid-label">前</span>
          <span class="grid-label">右</span>
        </div>

        <div class="viewport-gizmo">
          <div class="gizmo-axis x">X</div>
          <div class="gizmo-axis y">Y</div>
          <div class="gizmo-axis z">Z</div>
        </div>

        <div class="viewport-info">
          <span>{{ activeToolLabel }}</span>
          <span>顶点: {{ vertexCount }}</span>
          <span>面: {{ faceCount }}</span>
          <span>{{ fps }} FPS</span>
        </div>
      </main>

      <!-- Right: Properties -->
      <aside class="dir-right">
        <!-- Object properties -->
        <div class="props-panel">
          <h4>变换</h4>
          <div class="props-vec3">
            <div class="vec-row">
              <span class="vec-label x">X</span>
              <input type="number" class="vec-input" step="0.1" :value="activeObj?.x" />
              <span class="vec-label y">Y</span>
              <input type="number" class="vec-input" step="0.1" :value="activeObj?.y" />
              <span class="vec-label z">Z</span>
              <input type="number" class="vec-input" step="0.1" :value="activeObj?.z" />
            </div>
          </div>
          <div class="props-row-label">位置</div>

          <div class="props-vec3">
            <div class="vec-row">
              <span class="vec-label x">X</span>
              <input type="number" class="vec-input" step="1" value="0" />
              <span class="vec-label y">Y</span>
              <input type="number" class="vec-input" step="1" value="0" />
              <span class="vec-label z">Z</span>
              <input type="number" class="vec-input" step="1" value="0" />
            </div>
          </div>
          <div class="props-row-label">旋转</div>

          <div class="props-vec3">
            <div class="vec-row">
              <span class="vec-label x">X</span>
              <input type="number" class="vec-input" step="0.1" value="1" />
              <span class="vec-label y">Y</span>
              <input type="number" class="vec-input" step="0.1" value="1" />
              <span class="vec-label z">Z</span>
              <input type="number" class="vec-input" step="0.1" value="1" />
            </div>
          </div>
          <div class="props-row-label">缩放</div>
        </div>

        <!-- Material -->
        <div class="props-panel">
          <h4>材质</h4>
          <div class="prop-row">
            <label>颜色</label>
            <input type="color" value="#6366f1" class="color-input" />
          </div>
          <div class="prop-row">
            <label>金属</label>
            <input type="range" min="0" max="1" step="0.01" value="0.3" class="prop-slider" />
          </div>
          <div class="prop-row">
            <label>粗糙</label>
            <input type="range" min="0" max="1" step="0.01" value="0.5" class="prop-slider" />
          </div>
          <div class="prop-row">
            <label>自发光</label>
            <input type="color" value="#000000" class="color-input" />
          </div>
        </div>

        <!-- Lighting -->
        <div class="props-panel">
          <h4>环境</h4>
          <div class="prop-row">
            <label>背景</label>
            <input type="color" value="#0a0a14" class="color-input" />
          </div>
          <div class="prop-row">
            <label>强度</label>
            <input type="range" min="0" max="5" step="0.1" value="1.5" class="prop-slider" />
          </div>
          <div class="prop-row">
            <label>阴影</label>
            <el-switch :model-value="true" size="small" />
          </div>
        </div>
      </aside>
    </div>

    <!-- Bottom status -->
    <footer class="dir-status">
      <span>{{ sceneObjects.length }} 个对象</span>
      <span class="status-sep">|</span>
      <span>选中: {{ activeObj?.name || '无' }}</span>
      <span class="status-sep">|</span>
      <span class="status-dot"></span>
      <span>已保存</span>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const viewportRef = ref(null)
const canvas3DRef = ref(null)
const activeTool = ref('select')
const leftTab = ref('scene')
const activeObjectId = ref(1)
const libSearch = ref('')
const fps = ref(0)

let renderer, scene, camera, controls, clock
let animationId, lastFpsTime = 0, frameCount = 0
const meshMap = new Map() // id → THREE.Mesh

const vertexCount = ref(0)
const faceCount = ref(0)

const activeToolLabel = computed(() => {
  const map = { select: '选择', move: '移动', rotate: '旋转', scale: '缩放' }
  return map[activeTool.value] || '选择'
})

// Scene objects
const sceneObjects = ref([
  { id: 1, name: '主体模型', icon: 'Box', visible: true, collapsed: false, x: 0, y: 1.5, z: 0 },
  { id: 2, name: '底座', icon: 'Box', visible: true, collapsed: false, x: 0, y: 0.2, z: 0 },
  { id: 3, name: '摄像机', icon: 'VideoCamera', visible: true, collapsed: true, x: 5, y: 3, z: 8 },
  { id: 4, name: '灯光组', icon: 'Sunny', visible: true, collapsed: true, x: 0, y: 6, z: 0 },
])

const activeObj = computed(() => sceneObjects.value.find(o => o.id === activeObjectId.value))

// Model library
const modelLib = ref([
  { id: 'cube', name: '立方体', icon: 'Box', gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)' },
  { id: 'sphere', name: '球体', icon: 'Box', gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)' },
  { id: 'cylinder', name: '圆柱', icon: 'Box', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { id: 'torus', name: '圆环', icon: 'Box', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
  { id: 'cone', name: '锥体', icon: 'Box', gradient: 'linear-gradient(135deg, #4ade80, #22c55e)' },
  { id: 'plane', name: '平面', icon: 'Box', gradient: 'linear-gradient(135deg, #a855f7, #9333ea)' },
  { id: 'dodecahedron', name: '多面体', icon: 'Box', gradient: 'linear-gradient(135deg, #ec4899, #db2777)' },
  { id: 'torusKnot', name: '环结', icon: 'Box', gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)' },
  { id: 'lathe', name: '旋转体', icon: 'Box', gradient: 'linear-gradient(135deg, #f97316, #ea580c)' },
])

const filteredModels = computed(() => {
  if (!libSearch.value) return modelLib.value
  const q = libSearch.value.toLowerCase()
  return modelLib.value.filter(m => m.name.toLowerCase().includes(q))
})

function addSceneObject() {
  const id = Date.now()
  sceneObjects.value.push({
    id, name: `新对象 ${sceneObjects.value.length + 1}`,
    icon: 'Box', visible: true, collapsed: false,
    x: (Math.random() - 0.5) * 4, y: 1.5, z: (Math.random() - 0.5) * 4,
  })
  addGeometryToScene(id, 'box')
}

function addModelToScene(m) {
  const id = Date.now()
  sceneObjects.value.push({
    id, name: m.name,
    icon: 'Box', visible: true, collapsed: false,
    x: (Math.random() - 0.5) * 3, y: 1.5, z: (Math.random() - 0.5) * 3,
  })
  addGeometryToScene(id, m.id)
}

// ── Three.js ──
function addGeometryToScene(id, type) {
  let geo
  switch (type) {
    case 'sphere': geo = new THREE.SphereGeometry(0.8, 32, 32); break
    case 'cylinder': geo = new THREE.CylinderGeometry(0.5, 0.5, 2, 32); break
    case 'torus': geo = new THREE.TorusGeometry(0.6, 0.2, 16, 32); break
    case 'cone': geo = new THREE.ConeGeometry(0.6, 1.6, 32); break
    case 'plane': geo = new THREE.PlaneGeometry(2, 2); break
    case 'dodecahedron': geo = new THREE.DodecahedronGeometry(0.7); break
    case 'torusKnot': geo = new THREE.TorusKnotGeometry(0.5, 0.15, 64, 16); break
    case 'lathe': {
      const pts = [new THREE.Vector2(0, 0), new THREE.Vector2(0.3, 0.4), new THREE.Vector2(0.5, 0.8), new THREE.Vector2(0.2, 1.4)]
      geo = new THREE.LatheGeometry(pts, 32); break
    }
    default: geo = new THREE.BoxGeometry(1.2, 1.2, 1.2)
  }
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(Math.random(), 0.4, 0.55),
    roughness: 0.4,
    metalness: 0.3,
  })
  const mesh = new THREE.Mesh(geo, mat)
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.position.set((Math.random() - 0.5) * 3, 1.5, (Math.random() - 0.5) * 3)
  scene.add(mesh)
  meshMap.set(id, mesh)

  // Update vertex/face counts
  let verts = 0, faces = 0
  geo.attributes.position && (verts += geo.attributes.position.count)
  geo.index ? (faces += geo.index.count / 3) : (faces += verts / 3)
  vertexCount.value += verts
  faceCount.value += faces
}

function initThree() {
  const vp = viewportRef.value
  const canvas = canvas3DRef.value
  if (!vp || !canvas) return

  clock = new THREE.Clock()

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
  renderer.setSize(vp.clientWidth, vp.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1
  renderer.setClearColor('#0a0a14')

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(50, vp.clientWidth / vp.clientHeight, 0.2, 80)
  camera.position.set(6, 4.5, 9)
  camera.lookAt(0, 1.5, 0)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 1.5, 0)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minDistance = 3
  controls.maxDistance = 20
  controls.maxPolarAngle = Math.PI * 0.7
  controls.update()

  // Lights
  const ambient = new THREE.AmbientLight('#445566', 1.5)
  scene.add(ambient)

  const keyLight = new THREE.DirectionalLight('#ffe8cc', 4)
  keyLight.position.set(8, 12, 5)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.set(2048, 2048)
  keyLight.shadow.camera.near = 0.5
  keyLight.shadow.camera.far = 50
  keyLight.shadow.camera.left = -10
  keyLight.shadow.camera.right = 10
  keyLight.shadow.camera.top = 10
  keyLight.shadow.camera.bottom = -5
  keyLight.shadow.bias = -0.0003
  scene.add(keyLight)

  const rimLight = new THREE.DirectionalLight('#6688cc', 2.5)
  rimLight.position.set(-4, 5, -6)
  scene.add(rimLight)

  const fillLight = new THREE.DirectionalLight('#ffcc99', 2)
  fillLight.position.set(0, 3, 8)
  scene.add(fillLight)

  // Grid floor
  const grid = new THREE.PolarGridHelper(10, 32, 20, 128, '#222236', '#181828')
  grid.position.y = 0.005
  scene.add(grid)

  const floorGeo = new THREE.PlaneGeometry(30, 30)
  const floorMat = new THREE.MeshStandardMaterial({ color: '#111118', roughness: 0.6, metalness: 0.1 })
  const floor = new THREE.Mesh(floorGeo, floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -0.01
  floor.receiveShadow = true
  scene.add(floor)

  // Initial objects
  // Center platform
  const platGeo = new THREE.CylinderGeometry(1.8, 2.2, 0.3, 64)
  const platMat = new THREE.MeshStandardMaterial({ color: '#1e1e2c', roughness: 0.25, metalness: 0.6 })
  const platform = new THREE.Mesh(platGeo, platMat)
  platform.position.y = 0.15
  platform.castShadow = true
  platform.receiveShadow = true
  scene.add(platform)
  meshMap.set(2, platform)

  // Main model on platform
  const mainGeo = new THREE.TorusKnotGeometry(0.55, 0.18, 100, 20)
  const mainMat = new THREE.MeshStandardMaterial({
    color: '#6688cc',
    roughness: 0.15,
    metalness: 0.7,
    emissive: '#112244',
    emissiveIntensity: 0.3,
  })
  const mainMesh = new THREE.Mesh(mainGeo, mainMat)
  mainMesh.position.y = 1.5
  mainMesh.castShadow = true
  mainMesh.receiveShadow = true
  scene.add(mainMesh)
  meshMap.set(1, mainMesh)

  // Ring around main
  const ringGeo = new THREE.TorusGeometry(1, 0.04, 16, 80)
  const ringMat = new THREE.MeshStandardMaterial({
    color: '#8899cc',
    roughness: 0.1,
    metalness: 0.9,
    emissive: '#334466',
    emissiveIntensity: 0.5,
  })
  const ring = new THREE.Mesh(ringGeo, ringMat)
  ring.rotation.x = Math.PI / 3
  ring.position.y = 1.5
  ring.castShadow = true
  scene.add(ring)

  // Orbiting spheres
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2
    const radius = 1.5
    const sphereGeo = new THREE.SphereGeometry(0.12, 16, 16)
    const sphereMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(i * 0.2, 0.6, 0.6),
      roughness: 0.1,
      metalness: 0.3,
      emissive: new THREE.Color().setHSL(i * 0.2, 0.5, 0.3),
      emissiveIntensity: 0.5,
    })
    const sphere = new THREE.Mesh(sphereGeo, sphereMat)
    sphere.position.set(Math.cos(angle) * radius, 1.5, Math.sin(angle) * radius)
    sphere.userData = { orbitAngle: angle, orbitRadius: radius, orbitSpeed: 0.3 + i * 0.1, orbitY: 1.5 }
    scene.add(sphere)
    sphere.name = 'orbitSphere'
  }

  // Particles
  const pGeo = new THREE.BufferGeometry()
  const pCount = 150
  const pPos = new Float32Array(pCount * 3)
  for (let i = 0; i < pCount; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 20
    pPos[i * 3 + 1] = Math.random() * 8 + 0.5
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 20
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: '#8899cc', size: 0.025, transparent: true, opacity: 0.5,
    depthWrite: false, blending: THREE.AdditiveBlending,
  }))
  particles.name = 'particles'
  scene.add(particles)

  // Update counts
  vertexCount.value = 5000
  faceCount.value = 4800

  // Animate
  function animate() {
    animationId = requestAnimationFrame(animate)
    const dt = Math.min(clock.getDelta(), 0.1)
    controls.update()

    // FPS counter
    frameCount++
    const now = performance.now()
    if (now - lastFpsTime >= 500) {
      fps.value = Math.round(frameCount / ((now - lastFpsTime) / 1000))
      frameCount = 0
      lastFpsTime = now
    }

    // Animate orbiting spheres
    scene.children.forEach(child => {
      if (child.name === 'orbitSphere') {
        child.userData.orbitAngle += child.userData.orbitSpeed * dt
        const a = child.userData.orbitAngle
        const r = child.userData.orbitRadius
        child.position.x = Math.cos(a) * r
        child.position.z = Math.sin(a) * r
      }
      if (child.name === 'particles') {
        child.rotation.y += dt * 0.03
      }
    })

    renderer.render(scene, camera)
  }
  animate()

  // Resize
  const ro = new ResizeObserver(() => {
    if (!viewportRef.value) return
    const w = viewportRef.value.clientWidth
    const h = viewportRef.value.clientHeight
    renderer.setSize(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  })
  ro.observe(vp)
}

onMounted(() => initThree())
onUnmounted(() => {
  cancelAnimationFrame(animationId)
  renderer?.dispose()
})
</script>

<style scoped>
.director {
  height: 100vh;
  background: #0a0a14;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Header ── */
.dir-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 16px;
  background: #12121a;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  z-index: 30; flex-shrink: 0; gap: 16px;
}

.header-left { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

.logo { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: #fff; }

.logo-icon {
  width: 28px; height: 28px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
}
.logo-icon svg { width: 16px; height: 16px; }

.sep { color: rgba(255,255,255,0.2); }
.project-name { font-size: 13px; color: rgba(255,255,255,0.45); }

.header-tools { display: flex; align-items: center; gap: 3px; }

.tool-btn {
  display: flex; align-items: center; justify-content: center;
  width: 34px; height: 34px;
  background: transparent; border: none; border-radius: 8px;
  color: rgba(255,255,255,0.5); cursor: pointer;
  transition: all 0.15s; font-size: 16px;
}

.tool-btn:hover { background: rgba(255,255,255,0.06); color: #fff; }
.tool-btn.active { background: rgba(99,102,241,0.15); color: #818cf8; }

.tool-sep { width: 1px; height: 20px; background: rgba(255,255,255,0.08); margin: 0 6px; }

.header-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

/* ── Body ── */
.dir-body { flex: 1; display: flex; overflow: hidden; }

/* Left */
.dir-left {
  width: 220px; background: #101018;
  border-right: 1px solid rgba(255,255,255,0.06);
  display: flex; flex-direction: column; flex-shrink: 0; overflow: hidden;
}

.panel-tabs {
  display: flex; border-bottom: 1px solid rgba(255,255,255,0.06);
}

.panel-tabs button {
  flex: 1; padding: 10px;
  background: none; border: none;
  font-size: 12px; font-weight: 600;
  color: rgba(255,255,255,0.35);
  cursor: pointer; transition: all 0.2s;
  border-bottom: 2px solid transparent;
}

.panel-tabs button.active {
  color: #fff;
  border-bottom-color: #6366f1;
}

/* Scene tree */
.scene-panel { flex: 1; overflow-y: auto; padding: 8px; }

.scene-node {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 10px; border-radius: 6px;
  font-size: 12px; color: rgba(255,255,255,0.65);
  cursor: pointer; transition: all 0.15s;
}

.scene-node:hover { background: rgba(255,255,255,0.03); }
.scene-node.active { background: rgba(99,102,241,0.1); color: #fff; }

.node-icon { color: rgba(255,255,255,0.3); }
.node-eye { margin-left: auto; color: rgba(255,255,255,0.25); cursor: pointer; }

.panel-add-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%; padding: 10px; margin-top: 8px;
  background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.08);
  border-radius: 8px; color: rgba(255,255,255,0.3); font-size: 12px;
  cursor: pointer; transition: all 0.2s;
}

.panel-add-btn:hover { border-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.5); }

/* Library */
.library-panel { flex: 1; display: flex; flex-direction: column; padding: 8px; overflow: hidden; }

.lib-search { margin-bottom: 10px; }

.lib-grid {
  flex: 1; overflow-y: auto;
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 6px; align-content: start;
}

.lib-item {
  padding: 10px 8px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.04);
  border-radius: 8px; cursor: pointer;
  transition: all 0.2s; text-align: center;
}

.lib-item:hover { border-color: rgba(99,102,241,0.25); background: rgba(99,102,241,0.05); }

.lib-preview {
  width: 100%; aspect-ratio: 1;
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.3); margin-bottom: 6px;
}

.lib-item span { font-size: 10px; color: rgba(255,255,255,0.4); }

/* Viewport */
.dir-viewport {
  flex: 1; position: relative;
  background: #080810; overflow: hidden;
}

.viewport-canvas {
  position: absolute; inset: 0;
}

.viewport-grid-label {
  position: absolute; top: 12px; right: 16px;
  display: flex; gap: 4px;
}

.grid-label {
  font-size: 10px; padding: 3px 10px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 4px; color: rgba(255,255,255,0.3);
  cursor: pointer;
}

.grid-label.active { border-color: rgba(99,102,241,0.3); color: #818cf8; }

.viewport-gizmo {
  position: absolute; bottom: 60px; right: 16px;
  display: flex; flex-direction: column; gap: 2px;
}

.gizmo-axis {
  width: 22px; height: 22px; border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: 700;
  background: rgba(20,20,30,0.8); cursor: pointer;
}

.gizmo-axis.x { color: #ef4444; }
.gizmo-axis.y { color: #4ade80; }
.gizmo-axis.z { color: #3b82f6; }

.viewport-info {
  position: absolute; bottom: 12px; left: 16px;
  display: flex; gap: 16px;
  font-size: 10px; color: rgba(255,255,255,0.25);
  font-family: monospace;
}

/* Right */
.dir-right {
  width: 240px; background: #101018;
  border-left: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0; overflow-y: auto; padding: 16px;
}

.props-panel { margin-bottom: 20px; }

.props-panel h4 {
  font-size: 11px; font-weight: 600; letter-spacing: 0.05em;
  color: rgba(255,255,255,0.3); margin-bottom: 10px;
  padding-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.04);
}

.props-row-label {
  font-size: 10px; color: rgba(255,255,255,0.25);
  margin: 8px 0 4px; padding-left: 2px;
}

.props-vec3 { margin-bottom: 2px; }

.vec-row {
  display: flex; align-items: center; gap: 4px;
}

.vec-label {
  width: 12px; text-align: center; font-size: 10px; font-weight: 600; flex-shrink: 0;
}

.vec-label.x { color: #ef4444; }
.vec-label.y { color: #4ade80; }
.vec-label.z { color: #3b82f6; }

.vec-input {
  flex: 1; padding: 4px 6px; width: 0;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 4px; font-size: 11px; color: #fff; outline: none;
  font-family: monospace; text-align: center;
}

.vec-input:focus { border-color: rgba(99,102,241,0.4); }

.prop-row {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 8px;
}

.prop-row label {
  font-size: 11px; color: rgba(255,255,255,0.35);
  width: 40px; flex-shrink: 0;
}

.prop-slider { flex: 1; accent-color: #6366f1; height: 4px; }
.prop-row :deep(.el-switch) { margin-left: auto; }

.color-input {
  width: 32px; height: 22px; border: none; border-radius: 4px;
  background: none; cursor: pointer; padding: 0;
}

/* Status */
.dir-status {
  display: flex; align-items: center; gap: 10px;
  padding: 5px 16px;
  background: #12121a;
  border-top: 1px solid rgba(255,255,255,0.06);
  font-size: 11px; color: rgba(255,255,255,0.25);
  flex-shrink: 0; z-index: 30;
}

.status-sep { color: rgba(255,255,255,0.08); }

.status-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 6px rgba(74,222,128,0.4);
}
</style>
