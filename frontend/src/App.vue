<template>
  <v-app>
    <router-view />
    <NotificationSystem />
    <ChatWidget v-if="authStore.isAuthenticated" />
    <SessionTimeoutWarning />
    <PageLoader :loading="pageLoaderStore.isLoading" />
  </v-app>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import { usePageLoaderStore } from '@/stores/pageLoader'
import NotificationSystem from '@/components/notifications/NotificationSystem.vue'
import ChatWidget from '@/components/chat/ChatWidget.vue'
import SessionTimeoutWarning from '@/components/auth/SessionTimeoutWarning.vue'
import PageLoader from '@/components/common/PageLoader.vue'

const route = useRoute()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const pageLoaderStore = usePageLoaderStore()

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