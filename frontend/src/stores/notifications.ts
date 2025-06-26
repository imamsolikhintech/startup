import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
  read: boolean
  actions?: Array<{
    label: string
    action: () => void
  }>
}

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])
  const unreadCount = ref(0)

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    }
    
    notifications.value.unshift(newNotification)
    unreadCount.value++

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.png'
      })
    }

    return newNotification.id
  }

  const markAsRead = (id: string) => {
    const notification = notifications.value.find(n => n.id === id)
    if (notification && !notification.read) {
      notification.read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  const markAllAsRead = () => {
    notifications.value.forEach(n => n.read = true)
    unreadCount.value = 0
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      const notification = notifications.value[index]
      if (!notification.read) {
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
      notifications.value.splice(index, 1)
    }
  }

  const initNotifications = async () => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }

    // Simulate some initial notifications
    // setTimeout(() => {
    //   addNotification({
    //     title: 'Welcome!',
    //     message: 'Your dashboard is ready to use.',
    //     type: 'success'
    //   })
    // }, 2000)
  }

  // Helper methods for common notification types
  const showSuccess = (message: string, title: string = 'Success') => {
    return addNotification({
      title,
      message,
      type: 'success'
    })
  }

  const showError = (message: string, title: string = 'Error') => {
    return addNotification({
      title,
      message,
      type: 'error'
    })
  }

  const showWarning = (message: string, title: string = 'Warning') => {
    return addNotification({
      title,
      message,
      type: 'warning'
    })
  }

  const showInfo = (message: string, title: string = 'Info') => {
    return addNotification({
      title,
      message,
      type: 'info'
    })
  }

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    initNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
})