<template>
  <n-config-provider :theme="theme">
    <n-global-style />
    <n-message-provider>
      <router-view />
      <NotificationSystem />
      <ChatWidget v-if="authStore.isAuthenticated" />
      <SessionTimeoutWarning />
      <PageLoader :loading="pageLoaderStore.isLoading" />
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { darkTheme } from 'naive-ui'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import { usePageLoaderStore } from '@/stores/pageLoader'
import { useThemeStore } from '@/stores/theme'
import NotificationSystem from '@/components/notifications/NotificationSystem.vue'
import ChatWidget from '@/components/chat/ChatWidget.vue'
import SessionTimeoutWarning from '@/components/auth/SessionTimeoutWarning.vue'
import PageLoader from '@/components/common/PageLoader.vue'

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
  }
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
  }
)
</script>