import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory('/RelayHub/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/Dashboard.vue'),
    },
    {
      path: '/studio',
      redirect: '/studio/image',
    },
    {
      path: '/studio/image',
      name: 'studio-image',
      component: () => import('@/views/Studio.vue'),
      meta: { studioMode: 'image' },
    },
    {
      path: '/studio/video',
      name: 'studio-video',
      component: () => import('@/views/Studio.vue'),
      meta: { studioMode: 'video' },
    },
    {
      path: '/studio/audio',
      name: 'studio-audio',
      component: () => import('@/views/AudioStudio.vue'),
    },
    // 新增页面（占位）
    {
      path: '/team',
      name: 'team',
      component: () => import('@/views/Team.vue'),
      meta: { title: '团队协作', subtitle: '企业级AI创作协作平台，为团队打造高效生产力', icon: 'UserFilled' },
    },
    {
      path: '/ecommerce',
      name: 'ecommerce',
      component: () => import('@/views/Ecommerce.vue'),
      meta: { title: '电商工作室', subtitle: '让商品自己开口', icon: 'ShoppingCart' },
    },
    {
      path: '/film',
      name: 'film',
      component: () => import('@/views/Film.vue'),
      meta: { title: '影视工作室', subtitle: '专业级影视创作平台', icon: 'VideoCamera' },
    },
    {
      path: '/digital-human',
      name: 'digital-human',
      component: () => import('@/views/Placeholder.vue'),
      meta: { title: 'AI数字人', subtitle: '打造你的专属数字分身', icon: 'User' },
    },
    {
      path: '/director',
      name: 'director',
      component: () => import('@/views/Director.vue'),
      meta: { title: '导演台', subtitle: '让镜头的一切，由你掌控', icon: 'Monitor' },
    },
    {
      path: '/comfyui',
      name: 'comfyui',
      component: () => import('@/views/ComfyUI.vue'),
      meta: { title: 'ComfyUI', subtitle: '无限组合，无限可能', icon: 'Grid' },
    },
    {
      path: '/templates',
      name: 'templates',
      component: () => import('@/views/Templates.vue'),
      meta: { title: '模板中心', subtitle: '零门槛快速创作', icon: 'Collection' },
    },
    {
      path: '/api',
      name: 'api',
      component: () => import('@/views/Placeholder.vue'),
      meta: { title: 'API', subtitle: '开发者 API 文档与密钥管理', icon: 'Connection' },
    },
    // 原有页面
    {
      path: '/models',
      name: 'models',
      component: () => import('@/views/Models.vue'),
    },
    {
      path: '/pricing',
      name: 'pricing',
      component: () => import('@/views/Pricing.vue'),
    },
    {
      path: '/docs',
      name: 'docs',
      component: () => import('@/views/Docs.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/Register.vue'),
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('@/views/ForgotPassword.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
