import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabaseClient'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/historique',
      name: 'historique',
      component: () => import('@/views/HistoriqueView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/seuils',
      name: 'seuils',
      component: () => import('@/views/SeuilsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/'
    }
  ]
})

// Protection des routes (redirection si non connecté)
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession()

  if (to.meta.requiresAuth && !session) {
    next({ name: 'login' })
  } else if (to.name === 'login' && session) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router