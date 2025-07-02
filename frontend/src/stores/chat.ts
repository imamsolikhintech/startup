import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useAuthStore } from './auth'

export interface ChatMessage {
  id: string,
  sender_id: string,
  receiver_id: string,
  content: string,
  created_at: string,
  updated_at?: string,
  type: 'text' | 'image' | 'file',
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed',
}

export interface ChatUser {
  id: string,
  name: string,
  email: string,
  avatar?: string,
  online: boolean,
  lastSeen?: Date,
}

export interface ChatRoom {
  id: string,
  name: string,
  participants: ChatUser[],
  lastMessage?: ChatMessage,
  unreadCount: number,
  created_at: string,
  updated_at: string,
}

export const useChatStore = defineStore('chat', () => {
  const messages = ref<ChatMessage[]>([])
  const rooms = ref<ChatRoom[]>([])
  const users = ref<ChatUser[]>([
    {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      online: true,
    },
    {
      id: '2',
      name: 'Bob Smith',
      email: 'bob@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      online: false,
      lastSeen: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
      id: '3',
      name: 'Carol Davis',
      email: 'carol@example.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      online: true,
    },
  ])
  const activeChat = ref<string | null>(null)
  const isMinimized = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isConnected = ref(false)

  const authStore = useAuthStore()

  const activeUser = computed(() => {
    return activeChat.value ? users.value.find(u => u.id === activeChat.value) : null
  })

  const chatMessages = computed(() => {
    return messages.value.filter(m =>
      (m.sender_id === authStore.user?.id && m.receiver_id === activeChat.value) ||
      (m.sender_id === activeChat.value && m.receiver_id === authStore.user?.id),
    )
  })

  const sendMessage = async (content: string, receiverId: string): Promise<boolean> => {
    if (!content.trim() || isLoading.value) return false

    const authStore = useAuthStore()
    const currentUser = authStore.user

    if (!currentUser) {
      error.value = 'User not authenticated'
      return false
    }

    isLoading.value = true
    error.value = null

    const tempId = `temp_${Date.now()}`
    const newMessage: ChatMessage = {
      id: tempId,
      sender_id: currentUser.id,
      receiver_id: receiverId,
      content: content.trim(),
      created_at: new Date().toISOString(),
      type: 'text',
      status: 'sending',
    }

    messages.value.push(newMessage)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      // Update message status to sent
      const messageIndex = messages.value.findIndex(m => m.id === tempId)
      if (messageIndex !== -1) {
        messages.value[messageIndex] = {
          ...newMessage,
          id: Date.now().toString(),
          status: 'sent',
        }
      }

      // Simulate response from other user
      setTimeout(() => {
        const receiver = users.value.find(u => u.id === receiverId)
        if (receiver && receiver.online) {
          const responses = [
            'Thanks for your message!',
            'I\'ll get back to you soon.',
            'That sounds great!',
            'Let me think about it.',
            'Sure, no problem!',
          ]

          const responseMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender_id: receiverId,
            receiver_id: currentUser.id,
            content: responses[Math.floor(Math.random() * responses.length)],
            created_at: new Date().toISOString(),
            type: 'text',
            status: 'sent',
          }

          messages.value.push(responseMessage)
        }
      }, Math.random() * 1000 + 1000)

      isLoading.value = false
      return true
    } catch (err) {
      // Update message status to failed
      const messageIndex = messages.value.findIndex(m => m.id === tempId)
      if (messageIndex !== -1) {
        messages.value[messageIndex].status = 'failed'
      }

      error.value = 'Failed to send message'
      isLoading.value = false
      return false
    }
  }

  const retryMessage = async (messageId: string): Promise<boolean> => {
    const messageIndex = messages.value.findIndex(m => m.id === messageId)
    if (messageIndex === -1) return false

    const message = messages.value[messageIndex]
    if (message.status !== 'failed') return false

    message.status = 'sending'
    return await sendMessage(message.content, message.receiver_id)
  }

  const clearError = () => {
    error.value = null
  }

  const connect = () => {
    isConnected.value = true
    error.value = null
  }

  const disconnect = () => {
    isConnected.value = false
  }

  const startChat = (userId: string) => {
    activeChat.value = userId
    isMinimized.value = false
  }

  const minimizeChat = () => {
    isMinimized.value = !isMinimized.value
  }

  const closeChat = () => {
    activeChat.value = null
    isMinimized.value = false
  }

  const markAsRead = (messageId: string) => {
    const messageIndex = messages.value.findIndex(m => m.id === messageId)
    if (messageIndex !== -1) {
      messages.value[messageIndex].status = 'read'
    }
  }

  return {
    messages,
    rooms,
    users,
    activeChat,
    isMinimized,
    isLoading,
    error,
    isConnected,
    activeUser,
    chatMessages,
    sendMessage,
    retryMessage,
    clearError,
    connect,
    disconnect,
    startChat,
    minimizeChat,
    closeChat,
    markAsRead,
  }
})
