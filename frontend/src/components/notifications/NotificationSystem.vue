<template>
  <v-snackbar
    v-for="notification in displayNotifications"
    :key="notification.id"
    v-model="notification.show"
    :color="notification.type"
    :timeout="1000"
    location="top right"
    class="notification-snackbar"
    :style="{ 'z-index': 9999 + displayNotifications.indexOf(notification) }"
  >
    <div class="d-flex align-center">
      <v-icon class="mr-3">
        {{ getNotificationIcon(notification.type) }}
      </v-icon>
      <div class="flex-grow-1">
        <div class="font-weight-medium">{{ notification.title }}</div>
        <div class="text-caption">{{ notification.message }}</div>
      </div>
    </div>
    
    <template #actions>
      <v-btn
        icon="mdi-close"
        size="small"
        variant="text"
        @click="removeNotification(notification.id)"
      />
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useNotificationStore } from '@/stores/notifications'

const notificationStore = useNotificationStore()

const displayNotifications = ref<Array<any>>([])

const visibleNotifications = computed(() => 
  notificationStore.notifications.slice(0, 5) // Show max 5 notifications
)

const getNotificationIcon = (type: string) => {
  const icons = {
    success: 'mdi-check-circle',
    error: 'mdi-alert-circle',
    warning: 'mdi-alert',
    info: 'mdi-information'
  }
  return icons[type as keyof typeof icons] || 'mdi-information'
}

const removeNotification = (id: string) => {
  notificationStore.removeNotification(id)
  displayNotifications.value = displayNotifications.value.filter(n => n.id !== id)
}

watch(visibleNotifications, (newNotifications) => {
  newNotifications.forEach(notification => {
    if (!displayNotifications.value.find(n => n.id === notification.id)) {
      displayNotifications.value.push({
        ...notification,
        show: true
      })
    }
  })
}, { immediate: true, deep: true })
</script>

