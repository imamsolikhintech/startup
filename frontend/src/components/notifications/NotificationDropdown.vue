<template>
<n-card class="notification-dropdown">
    <div class="notification-header">
      <span class="notification-title">Notifications</span>
      <n-button
        v-if="notificationStore.unreadCount > 0"
        text
        size="small"
        @click="notificationStore.markAllAsRead()"
      >
        Mark all read
      </n-button>
    </div>

    <n-divider />

    <div v-if="notificationStore.notifications.length === 0" class="empty-state">
      <n-icon :size="48" class="empty-icon">
        <component :is="getBellOffIcon()" />
      </n-icon>
      <div class="empty-text">No notifications</div>
    </div>

    <div v-else class="notification-list">
      <div
        v-for="notification in notificationStore.notifications.slice(0, 10)"
        :key="notification.id"
        class="notification-item"
        :class="{ 'unread': !notification.read }"
        @click="markAsRead(notification.id)"
      >
        <div class="notification-avatar">
          <n-avatar
            :size="32"
            :class="`avatar--${notification.type}`"
          >
            <n-icon :size="18">
              <component :is="getNotificationIcon(notification.type)" />
            </n-icon>
          </n-avatar>
        </div>

        <div class="notification-content">
          <div class="notification-meta">
            <span class="notification-item-title">
              {{ notification.title }}
            </span>
            <span class="notification-time">
              {{ formatTime(notification.timestamp) }}
            </span>
          </div>
          <div class="notification-message">
            {{ notification.message }}
          </div>
        </div>

        <div class="notification-actions">
          <div
            v-if="!notification.read"
            class="unread-indicator"
          ></div>
          <n-button
            quaternary
            circle
            size="tiny"
            @click.stop="notificationStore.removeNotification(notification.id)"
          >
            <template #icon>
              <n-icon :size="14">
                <component :is="getCloseIcon()" />
              </n-icon>
            </template>
          </n-button>
        </div>
      </div>
    </div>

    <n-divider v-if="notificationStore.notifications.length > 0" />

    <div v-if="notificationStore.notifications.length > 10" class="notification-footer">
      <n-button text block>
        View all notifications
      </n-button>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { NCard, NButton, NDivider, NIcon, NAvatar } from 'naive-ui'
import { h } from 'vue'
import { useNotificationStore } from '@/stores/notifications'

const notificationStore = useNotificationStore()

const getNotificationIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    success: () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.41,10.09L6,11.5L11,16.5Z' })
    ]),
    error: () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z' })
    ]),
    warning: () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z' })
    ]),
    info: () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z' })
    ])
  }
  return iconMap[type] || iconMap.info
}

const getBellOffIcon = () => {
  return () => h('svg', { viewBox: '0 0 24 24' }, [
    h('path', { fill: 'currentColor', d: 'M10,21H14A2,2 0 0,1 12,23A2,2 0 0,1 10,21M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M2,17.5L4.5,15V11A7.5,7.5 0 0,1 12,3.5A7.5,7.5 0 0,1 19.5,11V15L22,17.5V19.5H2V17.5Z' })
  ])
}

const getCloseIcon = () => {
  return () => h('svg', { viewBox: '0 0 24 24' }, [
    h('path', { fill: 'currentColor', d: 'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z' })
  ])
}

const markAsRead = (id: string) => {
  notificationStore.markAsRead(id)
}

const formatTime = (timestamp: Date) => {
  const now = new Date()
  const diff = now.getTime() - new Date(timestamp).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}
</script>

<style scoped>
.notification-dropdown {
  width: 380px;
  max-height: 500px;
  overflow: hidden;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0;
}

.notification-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--n-text-color);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
}

.empty-icon {
  color: var(--n-text-color-disabled);
  margin-bottom: 1rem;
}

.empty-text {
  color: var(--n-text-color-disabled);
  font-size: 14px;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-radius: 6px;
  margin: 0 -12px;
  padding-left: 12px;
  padding-right: 12px;
}

.notification-item:hover {
  background-color: var(--n-color-hover);
}

.notification-item.unread {
  background-color: var(--n-color-target);
}

.notification-avatar {
  flex-shrink: 0;
}

.avatar--success {
  background-color: var(--n-success-color);
  color: white;
}

.avatar--error {
  background-color: var(--n-error-color);
  color: white;
}

.avatar--warning {
  background-color: var(--n-warning-color);
  color: white;
}

.avatar--info {
  background-color: var(--n-info-color);
  color: white;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.notification-item-title {
  font-weight: 500;
  color: var(--n-text-color);
  font-size: 14px;
}

.notification-time {
  font-size: 12px;
  color: var(--n-text-color-disabled);
  margin-left: 8px;
  flex-shrink: 0;
}

.notification-message {
  font-size: 13px;
  color: var(--n-text-color-disabled);
  line-height: 1.4;
  word-break: break-word;
}

.notification-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.unread-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--n-primary-color);
}

.notification-footer {
  padding-top: 8px;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .notification-dropdown {
    width: 320px;
  }
  
  .notification-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .notification-time {
    margin-left: 0;
  }
}
</style>