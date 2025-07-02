<template>
  <n-config-provider :theme="theme">
    <n-global-style />
    <n-message-provider>
      <router-view />
      <notification-system />
      <chat-widget v-if="authStore.isAuthenticated" />
      <session-timeout-warning />
      <page-loader :loading="pageLoaderStore.isLoading" />
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
  import { darkTheme } from 'naive-ui'
  import { computed, onMounted, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import SessionTimeoutWarning from '@/components/auth/SessionTimeoutWarning.vue'
  import ChatWidget from '@/components/chat/ChatWidget.vue'
  import PageLoader from '@/components/common/PageLoader.vue'
  import NotificationSystem from '@/components/notifications/NotificationSystem.vue'
  import { useAuthStore } from '@/stores/auth'
  import { useNotificationStore } from '@/stores/notifications'
  import { usePageLoaderStore } from '@/stores/pageLoader'
  import { useThemeStore } from '@/stores/theme'

  const route = useRoute()
  const authStore = useAuthStore()
  const notificationStore = useNotificationStore()
  const pageLoaderStore = usePageLoaderStore()
  const themeStore = useThemeStore()

  // Computed theme for Naive UI
  const theme = computed(() => {
    return themeStore.getEffectiveTheme() === 'dark' ? darkTheme : null
  })

  // Watch for route changes to show loading (for auth pages)
  watch(
    () => route.path,
    (newPath, oldPath) => {
      if (newPath !== oldPath && newPath.startsWith('/auth')) {
        pageLoaderStore.startLoading('Loading...')
        setTimeout(() => {
          pageLoaderStore.stopLoading()
        }, 600)
      }
    },
  )

  onMounted(() => {
    // Initialize theme system
    themeStore.initializeTheme()

    // Initialize notification system
    notificationStore.initNotifications()

    // Setup auto-refresh for authenticated users
    if (authStore.isAuthenticated) {
      authStore.setupAutoRefresh()
    }
  })

  // Watch for authentication changes to setup auto-refresh
  watch(
    () => authStore.isAuthenticated,
    (isAuthenticated) => {
      if (isAuthenticated) {
        authStore.setupAutoRefresh()
      }
    },
  )
</script>
