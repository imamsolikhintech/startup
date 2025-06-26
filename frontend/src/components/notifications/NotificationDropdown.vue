<template>
  <v-card min-width="400" max-width="500" max-height="500">
    <v-card-title class="d-flex align-center justify-space-between">
      <span>Notifications</span>
      <v-btn
        v-if="notificationStore.unreadCount > 0"
        variant="text"
        size="small"
        @click="notificationStore.markAllAsRead()"
      >
        Mark all read
      </v-btn>
    </v-card-title>

    <v-divider />

    <div v-if="notificationStore.notifications.length === 0" class="pa-6 text-center">
      <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-bell-off</v-icon>
      <div class="text-subtitle-1 text-medium-emphasis">No notifications</div>
    </div>

    <v-list v-else class="notification-list" max-height="400">
      <v-list-item
        v-for="notification in notificationStore.notifications.slice(0, 10)"
        :key="notification.id"
        class="notification-item"
        :class="{ 'unread': !notification.read }"
        @click="markAsRead(notification.id)"
      >
        <template #prepend>
          <v-avatar
            :color="notification.type"
            size="32"
            variant="tonal"
          >
            <v-icon size="18">
              {{ getNotificationIcon(notification.type) }}
            </v-icon>
          </v-avatar>
        </template>

        <div class="notification-content">
          <div class="d-flex align-center justify-space-between mb-1">
            <span class="font-weight-medium text-subtitle-2">
              {{ notification.title }}
            </span>
            <span class="text-caption text-medium-emphasis">
              {{ formatTime(notification.timestamp) }}
            </span>
          </div>
          <div class="text-body-2 text-medium-emphasis">
            {{ notification.message }}
          </div>
        </div>

        <template #append>
          <div class="d-flex flex-column align-center">
            <v-icon
              v-if="!notification.read"
              color="primary"
              size="8"
              class="mb-2"
            >
              mdi-circle
            </v-icon>
            <v-btn
              icon="mdi-close"
              size="x-small"
              variant="text"
              @click.stop="notificationStore.removeNotification(notification.id)"
            />
          </div>
        </template>
      </v-list-item>
    </v-list>

    <v-divider v-if="notificationStore.notifications.length > 0" />

    <v-card-actions v-if="notificationStore.notifications.length > 10">
      <v-btn variant="text" block>
        View all notifications
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { useNotificationStore } from '@/stores/notifications'

const notificationStore = useNotificationStore()

const getNotificationIcon = (type: string) => {
  const icons = {
    success: 'mdi-check-circle',
    error: 'mdi-alert-circle',
    warning: 'mdi-alert',
    info: 'mdi-information'
  }
  return icons[type as keyof typeof icons] || 'mdi-information'
}

const formatTime = (timestamp: Date) => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'Just now'
}

const markAsRead = (id: string) => {
  notificationStore.markAsRead(id)
}
</script>