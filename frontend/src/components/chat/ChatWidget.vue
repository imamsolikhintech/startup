<template>
  <div
    class="chat-widget"
    :class="{ 'minimized': chatStore.isMinimized }">
    <!-- Minimized State -->
    <n-card
      v-if="chatStore.isMinimized"
      class="chat-toggle"
      @click="chatStore.minimizeChat()">
      <div class="pa-3">
        <n-badge
          :value="unreadCount"
          :show="unreadCount > 0"
          type="error">
          <n-icon
            :component="getChatIcon"
            color="white"
            size="24" />
        </n-badge>
      </div>
    </n-card>

    <!-- Expanded State -->
    <n-card
      v-else
      class="chat-card"
      :class="{ 'expanded': !chatStore.isMinimized }">
      <!-- Chat Header -->
      <div class="chat-header">
        <div class="chat-title">
          <div
            v-if="chatStore.activeChat"
            class="chat-user-info">
            <n-avatar
              size="small"
              :src="chatStore.activeUser?.avatar"
              class="mr-2">
              {{ chatStore.activeUser?.name?.charAt(0) }}
            </n-avatar>
            <div class="user-details">
              <div class="user-name">
                {{ chatStore.activeUser?.name }}
              </div>
              <div
                class="user-status"
                :class="{ 'online': chatStore.activeUser?.online }">
                {{ chatStore.activeUser?.online ? 'Online' : 'Offline' }}
              </div>
            </div>
          </div>
          <div
            v-else
            class="default-title">
            <n-icon
              :component="getChatIcon"
              color="#1976d2"
              size="20"
              class="mr-2" />
            <span>Chat</span>
          </div>
        </div>
        <div class="chat-actions">
          <n-button
            text
            size="small"
            @click="chatStore.minimizeChat()">
            <template #icon>
              <n-icon size="16">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M19,13H5V11H19V13Z" />
                </svg>
              </n-icon>
            </template>
          </n-button>
          <n-button
            text
            size="small"
            @click="chatStore.closeChat()">
            <template #icon>
              <n-icon size="16">
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
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
        <div
          v-if="chatStore.activeChat"
          class="active-chat">
          <!-- Error Message -->
          <div
            v-if="chatStore.error"
            class="error-banner">
            <n-alert
              type="error"
              :show-icon="false"
              closable
              @close="chatStore.clearError()">
              {{ chatStore.error }}
            </n-alert>
          </div>

          <!-- Messages Area -->
          <div
            ref="messagesContainer"
            class="messages-area">
            <div
              v-for="msg in chatStore.chatMessages"
              :key="msg.id"
              class="message-wrapper"
              :class="{
                'own-message': msg.sender_id === authStore.user?.id,
                'other-message': msg.sender_id !== authStore.user?.id
              }">
              <div
                class="message-bubble"
                :class="{
                  'message-failed': msg.status === 'failed',
                  'message-sending': msg.status === 'sending'
                }">
                <div class="message-text">
                  {{ msg.content }}
                </div>
                <div class="message-footer">
                  <span class="message-time">{{ formatTime(msg.created_at) }}</span>
                  <div
                    v-if="msg.sender_id === authStore.user?.id"
                    class="message-status">
                    <n-icon
                      v-if="msg.status === 'sending'"
                      size="14"
                      class="status-sending">
                      <svg viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                      </svg>
                    </n-icon>
                    <n-icon
                      v-else-if="msg.status === 'sent'"
                      size="14"
                      class="status-sent">
                      <svg viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                      </svg>
                    </n-icon>
                    <n-icon
                      v-else-if="msg.status === 'read'"
                      size="14"
                      class="status-read">
                      <svg viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M18,7L16.59,5.59L10.25,11.93L11.66,13.34L18,7M22.24,5.59L11.66,16.17L7.48,12L6.07,13.41L11.66,19L23.66,7L22.24,5.59Z" />
                      </svg>
                    </n-icon>
                    <n-button
                      v-else-if="msg.status === 'failed'"
                      text
                      size="tiny"
                      type="error"
                      class="retry-button"
                      @click="retryMessage(msg.id)">
                      <template #icon>
                        <n-icon size="12">
                          <svg viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
                          </svg>
                        </n-icon>
                      </template>
                    </n-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Typing indicator -->
            <div
              v-if="isTyping && newMessage.trim()"
              class="typing-indicator">
              <span>You are typing</span>
              <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
              </div>
            </div>

            <!-- Loading indicator -->
            <div
              v-if="chatStore.isLoading"
              class="loading-indicator">
              <n-spin size="small" />
              <span class="ml-2">Sending...</span>
            </div>
          </div>

          <!-- Message Input -->
          <div class="message-input">
            <n-input
              v-model:value="newMessage"
              placeholder="Type a message..."
              :disabled="chatStore.isLoading"
              :loading="chatStore.isLoading"
              @keyup.enter="sendMessage">
              <template #suffix>
                <n-button
                  text
                  size="small"
                  :disabled="!newMessage.trim() || chatStore.isLoading"
                  :loading="chatStore.isLoading"
                  @click="sendMessage">
                  <template #icon>
                    <n-icon size="16">
                      <svg viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
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
          placement="top"
          trigger="click"
          @update:show="showUserList = $event">
          <template #trigger>
            <n-card
              class="chat-toggle"
              @click="showUserList = !showUserList">
              <div class="pa-3">
                <n-icon
                  :component="getChatIcon"
                  color="#1976d2"
                  size="24" />
              </div>
            </n-card>
          </template>

          <template #default>
            <n-card style="min-width: 250px;">
              <div class="text-subtitle-1 pa-3">
                Start a conversation
              </div>
              <n-list>
                <n-list-item
                  v-for="user in chatStore.users"
                  :key="user.id"
                  clickable
                  @click="startChat(user)">
                  <template #prefix>
                    <n-avatar
                      size="small"
                      :src="user.avatar" />
                  </template>
                  <div>
                    <div class="font-weight-medium">
                      {{ user.name }}
                    </div>
                    <div class="text-caption text-grey">
                      {{ user.email }}
                    </div>
                  </div>
                </n-list-item>
              </n-list>
            </n-card>
          </template>
        </n-dropdown>

        <!-- No Chat Selected State -->
        <div
          v-if="!chatStore.activeChat && !showUserList"
          class="no-chat-state">
          <div class="text-center pa-4">
            <n-icon
              size="48"
              color="#ccc"
              class="mb-3">
              <svg viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12,3C17.5,3 22,6.58 22,11C22,15.42 17.5,19 12,19C10.76,19 9.57,18.82 8.47,18.5C5.55,21 2,21 2,21C4.33,18.67 4.7,17.1 4.75,16.5C3.05,15.07 2,13.13 2,11C2,6.58 6.5,3 12,3Z" />
              </svg>
            </n-icon>
            <div class="text-subtitle-2 mb-2">
              No conversation selected
            </div>
            <div class="text-caption text-grey">
              Choose a user to start chatting
            </div>
            <n-button
              type="primary"
              size="small"
              class="mt-3"
              @click="showUserList = true">
              Start Chat
            </n-button>
          </div>
        </div>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
  import { createDiscreteApi } from 'naive-ui'
  import { computed, h, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
  import { useAuthStore } from '@/stores/auth'
  import type { ChatUser } from '@/stores/chat'
  import { useChatStore } from '@/stores/chat'

  const chatStore = useChatStore()
  const authStore = useAuthStore()
  const { message } = createDiscreteApi(['message'])

  const newMessage = ref('')
  const showUserList = ref(false)
  const messagesContainer = ref<HTMLElement>()
  const isTyping = ref(false)

  const unreadCount = computed(() => {
    return chatStore.chatMessages.filter(msg =>
      msg.receiver_id === authStore.user?.id &&
      msg.status !== 'read',
    ).length
  })

  const getChatIcon = computed(() => {
    return () => h('svg', {
      viewBox: '0 0 24 24',
      fill: 'currentColor',
    }, [
      h('path', {
        d: 'M12,3C6.5,3 2,6.58 2,11C2.05,13.15 3.06,15.17 4.75,16.5C4.75,17.1 4.33,18.67 2,21C4.37,20.89 6.64,20 8.47,18.5C9.61,18.83 10.81,19 12,19C17.5,19 22,15.42 22,11C22,6.58 17.5,3 12,3M8.5,9.5A1.5,1.5 0 0,1 10,11A1.5,1.5 0 0,1 8.5,12.5A1.5,1.5 0 0,1 7,11A1.5,1.5 0 0,1 8.5,9.5M12,9.5A1.5,1.5 0 0,1 13.5,11A1.5,1.5 0 0,1 12,12.5A1.5,1.5 0 0,1 10.5,11A1.5,1.5 0 0,1 12,9.5M15.5,9.5A1.5,1.5 0 0,1 17,11A1.5,1.5 0 0,1 15.5,12.5A1.5,1.5 0 0,1 14,11A1.5,1.5 0 0,1 15.5,9.5Z',
      }),
    ])
  })

  const sendMessage = async () => {
    if (!newMessage.value.trim() || !chatStore.activeChat || chatStore.isLoading) return

    const messageContent = newMessage.value.trim()
    newMessage.value = ''
    isTyping.value = false

    try {
      const success = await chatStore.sendMessage(messageContent, chatStore.activeChat)
      if (!success) {
        message.error('Failed to send message. Please try again.')
        newMessage.value = messageContent // Restore message on failure
      }
    } catch (error) {
      console.error('Error sending message:', error)
      message.error('An error occurred while sending the message.')
      newMessage.value = messageContent // Restore message on error
    }

    await nextTick()
    scrollToBottom()
  }

  const retryMessage = async (messageId: string) => {
    try {
      const success = await chatStore.retryMessage(messageId)
      if (success) {
        message.success('Message sent successfully!')
      } else {
        message.error('Failed to retry message.')
      }
    } catch (error) {
      console.error('Error retrying message:', error)
      message.error('An error occurred while retrying the message.')
    }
  }

  const startChat = async (user: ChatUser) => {
    try {
      chatStore.startChat(user.id)
      showUserList.value = false
      await nextTick()
      scrollToBottom()
    } catch (error) {
      console.error('Error starting chat:', error)
      message.error('Failed to start chat with user.')
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const scrollToBottom = () => {
    if (messagesContainer.value) {
      // Force scroll to bottom with smooth behavior
      messagesContainer.value.scrollTo({
        top: messagesContainer.value.scrollHeight,
        behavior: 'smooth',
      })
      // Fallback for immediate scroll
      setTimeout(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      }, 100)
    }
  }

  // Watch for new messages and auto-scroll
  watch(() => chatStore.chatMessages.length, () => {
    nextTick(() => {
      scrollToBottom()
    })
  })

  // Watch for active chat changes
  watch(() => chatStore.activeChat, (newChat) => {
    if (newChat) {
      nextTick(() => {
        scrollToBottom()
      })
    }
  }, { immediate: true })

  // Watch for typing indicator
  watch(newMessage, (value) => {
    isTyping.value = value.length > 0
  })

  // Initialize component
  onMounted(() => {
    chatStore.isMinimized = true
    chatStore.clearError()
    nextTick(() => {
      scrollToBottom()
    })
  })

  onUnmounted(() => {
    // Clear any pending states
    chatStore.clearError()
  })
</script>

<style scoped>
.chat-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: bottom right;
}

.chat-widget.minimized {
  width: auto;
  height: auto;
}

.chat-toggle {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 25px rgba(25, 118, 210, 0.3);
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  border: none;
}

.chat-toggle:hover {
  transform: scale(1.1) translateY(-2px);
  box-shadow: 0 12px 35px rgba(25, 118, 210, 0.4);
  background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
}

.chat-toggle:active {
  transform: scale(1.05) translateY(-1px);
}

@keyframes pulse {
  0% {
    box-shadow: 0 6px 20px rgba(25, 118, 210, 0.3);
  }
  50% {
    box-shadow: 0 6px 20px rgba(25, 118, 210, 0.5), 0 0 0 10px rgba(25, 118, 210, 0.1);
  }
  100% {
    box-shadow: 0 6px 20px rgba(25, 118, 210, 0.3);
  }
}

.chat-card {
  width: 380px;
  height: 520px;
  max-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15), 0 8px 25px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
}

.chat-card.expanded {
  animation: slideUpBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

@keyframes slideUpBounce {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.8);
  }
  60% {
    opacity: 0.8;
    transform: translateY(-5px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
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

.chat-user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--n-text-color);
  line-height: 1.2;
}

.user-status {
  font-size: 11px;
  color: var(--n-text-color-disabled);
  line-height: 1;
}

.user-status.online {
  color: #10b981;
  font-weight: 500;
}

.default-title {
  display: flex;
  align-items: center;
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
  min-height: 20rem;
  max-height: 20rem;
  padding: 20px 16px;
  overflow-y: auto;
  overflow-x: hidden;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  flex-direction: column;
  gap: 16px;
  scroll-behavior: smooth;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 transparent;
}

.message-wrapper {
  display: flex;
  margin-bottom: 16px;
  animation: messageSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
  animation-fill-mode: forwards;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.message-wrapper.own-message {
  align-self: flex-end;
  margin-left: auto;
  justify-content: flex-end;
}

.message-wrapper.other-message {
  align-self: flex-start;
  margin-right: auto;
  justify-content: flex-start;
}

.message-bubble {
  max-width: 75%;
  padding: 14px 18px 8px 18px;
  border-radius: 20px;
  position: relative;
  word-wrap: break-word;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
  min-width: 120px;
}

.message-bubble:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.message-wrapper.own-message .message-bubble {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
  border: none;
  border-bottom-right-radius: 8px;
}

.message-wrapper.other-message .message-bubble {
  background: white;
  color: #2c3e50;
  border-bottom-left-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.message-text {
  line-height: 1.5;
  font-size: 15px;
  margin-bottom: 6px;
  word-break: break-word;
  font-weight: 400;
  white-space: pre-wrap;
}

.message-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 12px;
  opacity: 0.8;
  gap: 8px;
}

.message-wrapper.own-message .message-footer {
  flex-direction: row-reverse;
}

.message-time {
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.message-input {
  padding: 20px 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  display: flex;
  gap: 12px;
  align-items: flex-end;
  flex-shrink: 0;
  backdrop-filter: blur(10px);
}

.message-input .n-input {
  flex: 1;
  border-radius: 24px;
}

.send-button {
  flex-shrink: 0;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  transition: all 0.2s ease;
}

.send-button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
}

.message-input :deep(.n-input) {
  border-radius: 25px;
  transition: all 0.3s ease;
}

.message-input :deep(.n-input:focus-within) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(25, 118, 210, 0.2);
}

.no-chat-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Scrollbar styling */
.messages-area::-webkit-scrollbar {
  width: 8px;
}

.messages-area::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.messages-area::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #cbd5e0, #a0aec0);
  border-radius: 4px;
  transition: background 0.2s ease;
}

.messages-area::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #a0aec0, #718096);
}

/* Error banner */
.error-banner {
  padding: 8px 16px;
  border-bottom: 1px solid var(--n-border-color);
}

/* Message status and meta */
.message-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 4px;
}

.message-status {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

.status-sending {
  animation: spin 1.2s linear infinite;
  color: rgba(255, 255, 255, 0.9);
  filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.3));
}

.status-sent {
  color: rgba(255, 255, 255, 0.95);
  transition: all 0.2s ease;
}

.status-read {
  color: #10b981;
  filter: drop-shadow(0 0 2px rgba(16, 185, 129, 0.3));
  transition: all 0.2s ease;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0% {
    box-shadow: 0 8px 25px rgba(25, 118, 210, 0.3);
  }
  50% {
    box-shadow: 0 8px 25px rgba(25, 118, 210, 0.5), 0 0 0 8px rgba(25, 118, 210, 0.1);
  }
  100% {
    box-shadow: 0 8px 25px rgba(25, 118, 210, 0.3);
  }
}

.chat-toggle {
  animation: pulse 3s infinite;
}

.chat-toggle:hover {
  animation: none;
}

/* Message states */
.message-failed {
  opacity: 0.8;
  border: 2px solid #ef4444;
  animation: shake 0.5s ease-in-out;
}

.message-sending {
  opacity: 0.9;
  position: relative;
}

.message-sending::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: shimmer 1.5s infinite;
  border-radius: inherit;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.retry-button {
  font-size: 11px;
  padding: 4px 8px;
  margin-left: 6px;
  border-radius: 12px;
  transition: all 0.2s ease;
  height: auto;
  min-height: auto;
}

.retry-button:hover {
  transform: scale(1.05);
}

/* Loading indicator */
.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  color: var(--n-text-color-disabled);
  font-size: 12px;
}

/* Connection status */
.connection-status {
  padding: 4px 16px;
  background: var(--n-warning-color-suppl);
  color: var(--n-warning-color);
  font-size: 12px;
  text-align: center;
  border-bottom: 1px solid var(--n-border-color);
}

.connection-status.connected {
  background: var(--n-success-color-suppl);
  color: var(--n-success-color);
}

/* Enhanced message styling */
.message-bubble:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.message-status {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  color: var(--n-text-color-disabled);
  font-size: 12px;
  font-style: italic;
}

.typing-dots {
  display: flex;
  gap: 2px;
}

.typing-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--n-text-color-disabled);
  animation: typingDot 1.4s infinite;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typingDot {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-8px);
    opacity: 1;
  }
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

  .message {
    max-width: 90%;
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

  .message {
    max-width: 95%;
  }

  .message-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
