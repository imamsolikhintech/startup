<template>
  <div class="notification-container">
    <transition-group name="notification" tag="div">
      <div
        v-for="notification in displayNotifications"
        :key="notification.id"
        :class="[
          'notification-item',
          `notification-item--${notification.type}`
        ]"
        :style="{ 'z-index': 9999 + displayNotifications.indexOf(notification) }"
      >
        <div class="notification-content">
          <n-icon :size="20" class="notification-icon">
            <component :is="getNotificationIcon(notification.type)" />
          </n-icon>
          <div class="notification-text">
            <div class="notification-title">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
          </div>
          <n-button
            quaternary
            circle
            size="small"
            class="notification-close"
            @click="removeNotification(notification.id)"
          >
            <template #icon>
              <n-icon :size="16">
                <component :is="getCloseIcon()" />
              </n-icon>
            </template>
          </n-button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { NIcon, NButton } from 'naive-ui'
import { h } from 'vue'
import { useNotificationStore } from '@/stores/notifications'

const notificationStore = useNotificationStore()

const displayNotifications = ref<Array<any>>([])

const visibleNotifications = computed(() => 
  notificationStore.notifications.slice(0, 5) // Show max 5 notifications
)

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

const getCloseIcon = () => {
  return () => h('svg', { viewBox: '0 0 24 24' }, [
    h('path', { fill: 'currentColor', d: 'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z' })
  ])
}

const removeNotification = (id: string) => {
  notificationStore.removeNotification(id)
  displayNotifications.value = displayNotifications.value.filter(n => n.id !== id)
}

// Auto remove notifications after timeout
const autoRemoveNotification = (notification: any) => {
  setTimeout(() => {
    removeNotification(notification.id)
  }, 5000) // 5 seconds timeout
}

watch(visibleNotifications, (newNotifications) => {
  newNotifications.forEach(notification => {
    if (!displayNotifications.value.find(n => n.id === notification.id)) {
      const newNotif = {
        ...notification,
        show: true
      }
      displayNotifications.value.push(newNotif)
      autoRemoveNotification(newNotif)
    }
  })
}, { immediate: true, deep: true })
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
  pointer-events: none;
}

.notification-item {
  margin-bottom: 0.75rem;
  pointer-events: auto;
  min-width: 320px;
  max-width: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.notification-content {
  display: flex;
  align-items: flex-start;
  padding: 0.5rem;
  gap: 0.75rem;
}

.notification-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.notification-text {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 1.25;
  margin-bottom: 0.25rem;
}

.notification-message {
  font-size: 0.8125rem;
  line-height: 1.4;
  opacity: 0.9;
}

.notification-close {
  flex-shrink: 0;
  margin-top: -0.25rem;
  margin-right: -0.25rem;
}

/* Type-specific styles */
.notification-item--success {
  background: linear-gradient(135deg, rgba(82, 196, 26, 0.95), rgba(82, 196, 26, 0.85));
  color: white;
}

.notification-item--success .notification-icon {
  color: rgba(255, 255, 255, 0.9);
}

.notification-item--error {
  background: linear-gradient(135deg, rgba(255, 77, 79, 0.95), rgba(255, 77, 79, 0.85));
  color: white;
}

.notification-item--error .notification-icon {
  color: rgba(255, 255, 255, 0.9);
}

.notification-item--warning {
  background: linear-gradient(135deg, rgba(250, 173, 20, 0.95), rgba(250, 173, 20, 0.85));
  color: white;
}

.notification-item--warning .notification-icon {
  color: rgba(255, 255, 255, 0.9);
}

.notification-item--info {
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.95), rgba(24, 144, 255, 0.85));
  color: white;
}

.notification-item--info .notification-icon {
  color: rgba(255, 255, 255, 0.9);
}

/* Transition animations */
.notification-enter-active {
  transition: all 0.3s ease-out;
}

.notification-leave-active {
  transition: all 0.3s ease-in;
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.notification-move {
  transition: transform 0.3s ease;
}

/* Responsive design */
@media (max-width: 768px) {
  .notification-container {
    top: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
  }
  
  .notification-item {
    min-width: auto;
    max-width: none;
  }
  
  .notification-content {
    padding: 0.875rem;
  }
  
  .notification-title {
    font-size: 0.8125rem;
  }
  
  .notification-message {
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .notification-content {
    padding: 0.75rem;
    gap: 0.5rem;
  }
}
</style>

