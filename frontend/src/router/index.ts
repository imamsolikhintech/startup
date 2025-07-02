import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: (to) => {
        const authStore = useAuthStore()
        return authStore.isAuthenticated ? '/dashboard' : '/auth/login'
      },
    },
    {
      path: '/auth',
      component: () => import('@/layouts/AuthLayout.vue'),
      children: [
        {
          path: 'login',
          name: 'Login',
          component: () => import('@/views/auth/LoginView.vue'),
        },
        {
          path: 'register',
          name: 'Register',
          component: () => import('@/views/auth/RegisterView.vue'),
        },
        {
          path: 'google/callback',
          name: 'GoogleCallback',
          component: () => import('@/views/auth/GoogleCallbackView.vue'),
        },
      ],
      meta: { requiresGuest: true },
    },
    {
      path: '/',
      component: () => import('@/layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/dashboard/DashboardView.vue'),
        },
        {
          path: 'users',
          name: 'Users',
          component: () => import('@/views/users/UsersView.vue'),
        },
        {
          path: 'analytics',
          name: 'Analytics',
          component: () => import('@/views/analytics/AnalyticsView.vue'),
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('@/views/settings/SettingsView.vue'),
        },
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('@/views/profile/ProfileView.vue'),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  console.log('Router guard - navigating to:', to.path)
  console.log('Router guard - initializing:', authStore.initializing)
  console.log('Router guard - authenticated:', authStore.isAuthenticated)

  // Wait for auth initialization to complete
  if (authStore.initializing) {
    console.log('Router guard: Waiting for auth initialization...')
    // Wait for initialization to complete with a timeout
    let attempts = 0
    const maxAttempts = 10 // 5 seconds max wait
    while (authStore.initializing && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 50))
      attempts++
    }

    console.log('AFTER Router guard - navigating to:', to.path)
    console.log('AFTER Router guard - initializing:', authStore.initializing)
    console.log('AFTER Router guard - authenticated:', authStore.isAuthenticated)
    if (attempts >= maxAttempts) {
      console.warn('Router guard: Auth initialization timeout, proceeding anyway')
    } else {
      console.log('Router guard: Auth initialization completed, authenticated:', authStore.isAuthenticated)
    }
  }

  // Check if route requires authentication (check both current route and parent route meta)
  const requiresAuth = to.meta.requiresAuth || to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.meta.requiresGuest || to.matched.some(record => record.meta.requiresGuest)

  console.log('requiresAuth: ' + requiresAuth)
  console.log('isAuthenticated: ' + authStore.isAuthenticated)
  if (requiresAuth && !authStore.isAuthenticated) {
    console.log('Router guard: Redirecting to login - auth required but not authenticated')
    console.log('Router guard: Route meta:', to.meta)
    console.log('Router guard: User state:', authStore.user)
    next('/auth/login')
  } else if (requiresGuest && authStore.isAuthenticated) {
    console.log('Router guard: Redirecting to dashboard - guest route but authenticated')
    next('/dashboard')
  } else {
    console.log('Router guard: Allowing navigation to:', to.path)
    next()
  }
})

export default router
