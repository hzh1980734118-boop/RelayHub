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
