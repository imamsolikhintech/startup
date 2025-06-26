<template>
<div class="chat-widget" :class="{ 'minimized': chatStore.isMinimized }">
    <!-- Minimized State -->
    <n-card
      v-if="chatStore.isMinimized"
      class="chat-toggle"
      @click="chatStore.minimizeChat()"
    >
      <div class="pa-3">
        <n-badge
          :value="unreadCount"
          :show="unreadCount > 0"
          type="error"
        >
          <n-icon :component="getChatIcon" color="#1976d2" size="24" />
        </n-badge>
      </div>
    </n-card>

    <!-- Expanded State -->
    <n-card
      v-else
      class="chat-card"
      :class="{ 'expanded': !chatStore.isMinimized }"
    >
      <!-- Chat Header -->
      <div class="chat-header">
        <div class="chat-title">
          <n-icon :component="getChatIcon" color="#1976d2" size="20" class="mr-2" />
          <span v-if="chatStore.activeChat">{{ chatStore.activeChat.name }}</span>
          <span v-else>Chat</span>
        </div>
        <div class="chat-actions">
          <n-button
            text
            size="small"
            @click="chatStore.minimizeChat()"
          >
            <template #icon>
              <n-icon size="16">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M19,13H5V11H19V13Z"/>
                </svg>
              </n-icon>
            </template>
          </n-button>
          <n-button
            text
            size="small"
            @click="chatStore.closeChat()"
          >
            <template #icon>
              <n-icon size="16">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                </svg>
              </n-icon>
            </template>
          </n-button>
        </div>
      </div>

      <n-divider class="my-0" />

      <!-- Chat Content -->
      <div class="chat-content">
        <!-- Active Chat View -->
        <div v-if="chatStore.activeChat" class="active-chat">
          <!-- Messages Area -->
          <div class="messages-area" ref="messagesContainer">
            <div
              v-for="message in chatStore.messages"
              :key="message.id"
              class="message"
              :class="{
                'own-message': message.sender_id === authStore.user?.id,
                'other-message': message.sender_id !== authStore.user?.id
              }"
            >
              <div class="message-content">
                <div class="message-text">{{ message.content }}</div>
                <div class="message-time">{{ formatTime(message.created_at) }}</div>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div class="message-input">
            <n-input
              v-model:value="newMessage"
              placeholder="Type a message..."
              @keyup.enter="sendMessage"
              :disabled="chatStore.loading"
            >
              <template #suffix>
                <n-button
                  text
                  size="small"
                  @click="sendMessage"
                  :disabled="!newMessage.trim() || chatStore.loading"
                >
                  <template #icon>
                    <n-icon size="16">
                      <svg viewBox="0 0 24 24">
                        <path fill="currentColor" d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
                      </svg>
                    </n-icon>
                  </template>
                </n-button>
              </template>
            </n-input>
          </div>
        </div>

        <!-- User List (when no active chat) -->
        <n-dropdown
          v-if="!chatStore.activeChat"
          :show="showUserList"
          @update:show="showUserList = $event"
          placement="top"
          trigger="click"
        >
          <template #trigger>
            <n-card
              class="chat-toggle"
              @click="showUserList = !showUserList"
            >
              <div class="pa-3">
                <n-icon :component="getChatIcon" color="#1976d2" size="24" />
              </div>
            </n-card>
          </template>

          <template #default>
            <n-card style="min-width: 250px;">
              <div class="text-subtitle-1 pa-3">Start a conversation</div>
              <n-list>
                <n-list-item
                  v-for="user in chatStore.users"
                  :key="user.id"
                  clickable
                  @click="startChat(user)"
                >
                  <template #prefix>
                    <n-avatar
                      size="small"
                      :src="user.avatar"
                    />
                  </template>
                  <div>
                    <div class="font-weight-medium">{{ user.name }}</div>
                    <div class="text-caption text-grey">{{ user.email }}</div>
                  </div>
                </n-list-item>
              </n-list>
            </n-card>
          </template>
        </n-dropdown>

        <!-- No Chat Selected State -->
        <div v-if="!chatStore.activeChat && !showUserList" class="no-chat-state">
          <div class="text-center pa-4">
            <n-icon size="48" color="#ccc" class="mb-3">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,3C17.5,3 22,6.58 22,11C22,15.42 17.5,19 12,19C10.76,19 9.57,18.82 8.47,18.5C5.55,21 2,21 2,21C4.33,18.67 4.7,17.1 4.75,16.5C3.05,15.07 2,13.13 2,11C2,6.58 6.5,3 12,3Z"/>
              </svg>
            </n-icon>
            <div class="text-subtitle-2 mb-2">No conversation selected</div>
            <div class="text-caption text-grey">Choose a user to start chatting</div>
            <n-button
              type="primary"
              size="small"
              class="mt-3"
              @click="showUserList = true"
            >
              Start Chat
            </n-button>
          </div>
        </div>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, watch, h } from 'vue'
import { useChatStore } from '@/stores/chat'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types/auth'
import type { ChatMessage } from '@/types/chat'

const chatStore = useChatStore()
const authStore = useAuthStore()

const newMessage = ref('')
const showUserList = ref(false)
const messagesContainer = ref<HTMLElement>()

const unreadCount = computed(() => {
  return chatStore.unreadCount
})

const getChatIcon = computed(() => {
  return () => h('svg', {
    viewBox: '0 0 24 24',
    fill: 'currentColor'
  }, [
    h('path', {
      d: 'M12,3C6.5,3 2,6.58 2,11C2.05,13.15 3.06,15.17 4.75,16.5C4.75,17.1 4.33,18.67 2,21C4.37,20.89 6.64,20 8.47,18.5C9.61,18.83 10.81,19 12,19C17.5,19 22,15.42 22,11C22,6.58 17.5,3 12,3M8.5,9.5A1.5,1.5 0 0,1 10,11A1.5,1.5 0 0,1 8.5,12.5A1.5,1.5 0 0,1 7,11A1.5,1.5 0 0,1 8.5,9.5M12,9.5A1.5,1.5 0 0,1 13.5,11A1.5,1.5 0 0,1 12,12.5A1.5,1.5 0 0,1 10.5,11A1.5,1.5 0 0,1 12,9.5M15.5,9.5A1.5,1.5 0 0,1 17,11A1.5,1.5 0 0,1 15.5,12.5A1.5,1.5 0 0,1 14,11A1.5,1.5 0 0,1 15.5,9.5Z'
    })
  ])
})

const sendMessage = async () => {
  if (!newMessage.value.trim() || !chatStore.activeChat) return
  
  await chatStore.sendMessage({
    content: newMessage.value.trim(),
    receiver_id: chatStore.activeChat.id
  })
  
  newMessage.value = ''
  await nextTick()
  scrollToBottom()
}

const startChat = async (user: User) => {
  await chatStore.startChat(user)
  showUserList.value = false
}

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

onMounted(() => {
  scrollToBottom()
})

onUnmounted(() => {
  // Cleanup if needed
})
</script>

<style scoped>
.chat-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  transition: all 0.3s ease;
}

.chat-widget.minimized {
  width: auto;
  height: auto;
}

.chat-toggle {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.chat-toggle:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.chat-card {
  width: 350px;
  height: 500px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  overflow: hidden;
}

.chat-card.expanded {
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--n-color);
  border-bottom: 1px solid var(--n-border-color);
}

.chat-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: var(--n-text-color);
}

.chat-actions {
  display: flex;
  gap: 4px;
}

.chat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.active-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
  max-width: 80%;
}

.message.own-message {
  align-self: flex-end;
}

.message.other-message {
  align-self: flex-start;
}

.message-content {
  background: var(--n-color);
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid var(--n-border-color);
}

.message.own-message .message-content {
  background: var(--n-primary-color);
  color: white;
}

.message-text {
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 4px;
}

.message-time {
  font-size: 11px;
  opacity: 0.7;
}

.message-input {
  padding: 16px;
  border-top: 1px solid var(--n-border-color);
  background: var(--n-color);
}

.no-chat-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Scrollbar styling */
.messages-area::-webkit-scrollbar {
  width: 4px;
}

.messages-area::-webkit-scrollbar-track {
  background: transparent;
}

.messages-area::-webkit-scrollbar-thumb {
  background: var(--n-scrollbar-color);
  border-radius: 2px;
}

.messages-area::-webkit-scrollbar-thumb:hover {
  background: var(--n-scrollbar-color-hover);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .chat-widget {
    bottom: 16px;
    right: 16px;
  }
  
  .chat-card {
    width: 300px;
    height: 400px;
  }
}

@media (max-width: 480px) {
  .chat-widget {
    bottom: 12px;
    right: 12px;
  }
  
  .chat-card {
    width: 280px;
    height: 350px;
  }
}
</style>