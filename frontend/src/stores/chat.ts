import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './auth'

export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  message: string
  timestamp: Date
  type: 'text' | 'image' | 'file'
}

export interface ChatUser {
  id: string
  name: string
  avatar?: string
  online: boolean
  lastSeen?: Date
}

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([])
  const users = ref<ChatUser[]>([
    {
      id: '2',
      name: 'Alice Johnson',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
      online: true
    },
    {
      id: '3',
      name: 'Bob Smith',
      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
      online: false,
      lastSeen: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
    },
    {
      id: '4',
      name: 'Carol Wilson',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
      online: true
    }
  ])
  const activeChat = ref<string | null>(null)
  const isMinimized = ref(true)

  const authStore = useAuthStore()

  const activeUser = computed(() => {
    return activeChat.value ? users.value.find(u => u.id === activeChat.value) : null
  })

  const chatMessages = computed(() => {
    return messages.value.filter(m => 
      (m.senderId === authStore.user?.id && activeChat.value && m.senderId === activeChat.value) ||
      (m.senderId === activeChat.value)
    )
  })

  const sendMessage = (message: string) => {
    if (!authStore.user || !activeChat.value || !message.trim()) return

    const newMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: authStore.user.id,
      senderName: authStore.user.name,
      senderAvatar: authStore.user.avatar,
      message: message.trim(),
      timestamp: new Date(),
      type: 'text'
    }

    messages.value.push(newMessage)

    // Simulate response from other user
    setTimeout(() => {
      const activeUserData = activeUser.value
      if (activeUserData) {
        const responses = [
          "That's interesting! Tell me more.",
          "I see what you mean.",
          "Thanks for sharing that.",
          "Let me think about that.",
          "That makes sense to me."
        ]
        
        const responseMessage: ChatMessage = {
          id: Math.random().toString(36).substr(2, 9),
          senderId: activeUserData.id,
          senderName: activeUserData.name,
          senderAvatar: activeUserData.avatar,
          message: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date(),
          type: 'text'
        }
        
        messages.value.push(responseMessage)
      }
    }, 1000 + Math.random() * 2000)
  }

  const startChat = (userId: string) => {
    activeChat.value = userId
    isMinimized.value = false
  }

  const minimizeChat = () => {
    isMinimized.value = true
  }

  const closeChat = () => {
    activeChat.value = null
    isMinimized.value = true
  }

  return {
    messages,
    users,
    activeChat,
    activeUser,
    chatMessages,
    isMinimized,
    sendMessage,
    startChat,
    minimizeChat,
    closeChat
  }
})