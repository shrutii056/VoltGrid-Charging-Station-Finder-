import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/login',    name: 'Login',    component: () => import('../views/LoginView.vue'),    meta: { public: true } },
  { path: '/register', name: 'Register', component: () => import('../views/RegisterView.vue'), meta: { public: true } },
  { path: '/',         name: 'Stations', component: () => import('../views/StationsView.vue'), meta: { public: false } },
  { path: '/map',      name: 'Map',      component: () => import('../views/MapView.vue'),       meta: { public: false } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isAuthenticated) return { name: 'Login' }
  if (to.meta.public && auth.isAuthenticated && (to.name === 'Login' || to.name === 'Register')) return { name: 'Stations' }
})

export default router
