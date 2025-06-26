<template>
  <div class="chat-widget" :class="{ 'minimized': chatStore.isMinimized }">
    <!-- Minimized State -->
    <v-card
      v-if="chatStore.isMinimized"
      class="chat-toggle"
      @click="chatStore.minimizeChat()"
      elevation="8"
      rounded="xl"
    >
      <!-- <v-card-text class="pa-3">
        <v-badge
          :content="unreadCount"
          :model-value="unreadCount > 0"
          color="error"
          offset-x="10"
          offset-y="10"
        > 
          <v-icon color="primary" size="24">mdi-chat</v-icon>
        </v-badge>
      </v-card-text> -->
    </v-card>

    <!-- Expanded State -->
    <v-card
      v-else
      class="chat-window"
      elevation="8"
      rounded="lg"
      width="350"
      height="500"
    >
      <!-- Header -->
      <v-card-title class="chat-header d-flex align-center justify-space-between pa-3">
        <div class="d-flex align-center">
          <v-avatar size="32" class="mr-3">
            <v-img :src="chatStore.activeUser?.avatar" />
          </v-avatar>
          <div>
            <div class="text-subtitle-2">{{ chatStore.activeUser?.name }}</div>
            <div class="text-caption text-success" v-if="chatStore.activeUser?.online">
              Online
            </div>
            <div class="text-caption text-medium-emphasis" v-else>
              Last seen {{ formatLastSeen(chatStore.activeUser?.lastSeen) }}
            </div>
          </div>
        </div>
        <div>
          <v-btn
            icon="mdi-minus"
            size="small"
            variant="text"
            @click="chatStore.minimizeChat()"
          />
          <v-btn
            icon="mdi-close"
            size="small"
            variant="text"
            @click="chatStore.closeChat()"
          />
        </div>
      </v-card-title>

      <v-divider />

      <!-- Messages -->
      <div class="chat-messages" ref="messagesContainer">
        <div
          v-for="message in chatStore.chatMessages"
          :key="message.id"
          class="message"
          :class="{ 'own-message': message.senderId === authStore.user?.id }"
        >
          <div class="message-content">
            <div class="message-bubble">
              {{ message.message }}
            </div>
            <div class="message-time">
              {{ formatMessageTime(message.timestamp) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Input -->
      <v-divider />
      <div class="chat-input pa-3">
        <v-text-field
          v-model="newMessage"
          placeholder="Type a message..."
          variant="outlined"
          density="compact"
          hide-details
          @keyup.enter="sendMessage"
        >
          <template #append-inner>
            <v-btn
              icon="mdi-send"
              size="small"
              variant="text"
              color="primary"
              @click="sendMessage"
              :disabled="!newMessage.trim()"
            />
          </template>
        </v-text-field>
      </div>
    </v-card>

    <!-- User List (when no active chat) -->
    <v-menu
      v-if="!chatStore.activeChat"
      v-model="showUserList"
      :close-on-content-click="false"
      location="top"
      offset="10"
    >
      <template #activator="{ props }">
        <v-card
          class="chat-toggle"
          @click="showUserList = !showUserList"
          v-bind="props"
          elevation="8"
          rounded="xl"
        >
          <v-card-text class="pa-3">
            <v-icon color="primary" size="24">mdi-chat</v-icon>
          </v-card-text>
        </v-card>
      </template>

      <v-card min-width="250">
        <v-card-title class="text-subtitle-1">Start a conversation</v-card-title>
        <v-list>
          <v-list-item
            v-for="user in chatStore.users"
            :key="user.id"
            @click="startChat(user.id)"
          >
            <template #prepend>
              <v-badge
                :model-value="user.online"
                color="success"
                dot
                offset-x="8"
                offset-y="8"
              >
                <v-avatar size="32">
                  <v-img :src="user.avatar" />
                </v-avatar>
              </v-badge>
            </template>
            <v-list-item-title>{{ user.name }}</v-list-item-title>
            <v-list-item-subtitle v-if="!user.online">
              Last seen {{ formatLastSeen(user.lastSeen) }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useChatStore } from '@/stores/chat'

const authStore = useAuthStore()
const chatStore = useChatStore()

const newMessage = ref('')
const messagesContainer = ref<HTMLElement>()
const showUserList = ref(false)

const unreadCount = computed(() => {
  // This would normally track unread messages
  return 0
})

const sendMessage = () => {
  if (newMessage.value.trim()) {
    chatStore.sendMessage(newMessage.value)
    newMessage.value = ''
    scrollToBottom()
  }
}

const startChat = (userId: string) => {
  chatStore.startChat(userId)
  showUserList.value = false
}

const formatMessageTime = (timestamp: Date) => {
  return timestamp.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  })
}

const formatLastSeen = (lastSeen?: Date) => {
  if (!lastSeen) return ''
  const now = new Date()
  const diff = now.getTime() - lastSeen.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)

  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'just now'
}

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

watch(() => chatStore.chatMessages.length, () => {
  scrollToBottom()
})
</script>