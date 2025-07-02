<template>
  <n-modal
    v-model:show="authStore.sessionTimeoutWarning"
    :mask-closable="false"
    :close-on-esc="false"
    preset="card"
    title="Session Expiring Soon"
    class="session-timeout-modal"
    style="width: 400px">
    <template #header-extra>
      <n-icon
        :size="20"
        color="#f0a020">
        <component :is="getClockAlertIcon()" />
      </n-icon>
    </template>

    <div class="modal-content">
      <p class="session-message">
        Your session will expire in <strong>{{ timeRemaining }}</strong> minutes.
        Would you like to extend your session?
      </p>

      <n-alert
        type="info"
        class="session-alert">
        Click "Extend Session" to continue working, or "Logout" to end your session now.
      </n-alert>
    </div>

    <template #action>
      <div class="modal-actions">
        <n-button
          secondary
          @click="handleLogout">
          Logout
        </n-button>
        <n-button
          type="primary"
          @click="handleExtendSession">
          Extend Session
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
  import { NAlert, NButton, NIcon, NModal } from 'naive-ui'
  import { computed, h, onMounted, onUnmounted, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'

  const authStore = useAuthStore()
  const router = useRouter()

  const timeRemaining = ref(5) // Default 5 minutes
  let countdownInterval: NodeJS.Timeout | null = null

  const startCountdown = () => {
    timeRemaining.value = 5 // 5 minutes warning

    countdownInterval = setInterval(() => {
      timeRemaining.value--

      if (timeRemaining.value <= 0) {
        // Auto logout when countdown reaches 0
        handleLogout()
      }
    }, 60000) // Update every minute
  }

  const stopCountdown = () => {
    if (countdownInterval) {
      clearInterval(countdownInterval)
      countdownInterval = null
    }
  }

  const handleExtendSession = async () => {
    try {
      // Attempt to refresh the token to extend session
      await authStore.refreshToken()
      authStore.hideSessionWarning()
      stopCountdown()
    } catch (error) {
      console.error('Failed to extend session:', error)
      handleLogout()
    }
  }

  const handleLogout = () => {
    stopCountdown()
    authStore.hideSessionWarning()
    authStore.logout()
    router.push('/auth/login')
  }

  // Watch for session warning changes
  const unwatchSessionWarning = computed(() => {
    if (authStore.sessionTimeoutWarning) {
      startCountdown()
    } else {
      stopCountdown()
    }
    return authStore.sessionTimeoutWarning
  })

  const getClockAlertIcon = () => {
    return h('svg', { viewBox: '0 0 24 24' }, [
      h('path', {
        fill: 'currentColor',
        d: 'M20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12M22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2A10,10 0 0,1 22,12M15.5,7L14.22,8.28L15.22,9.28L16.5,8L15.5,7M10.5,7L9.5,8L10.78,9.28L12.06,8L10.5,7M11,9H13V12.5L16,14L15,15.5L11,13V9Z',
      }),
    ])
  }

  onMounted(() => {
    // Start watching session warning
    unwatchSessionWarning.value
  })

  onUnmounted(() => {
    stopCountdown()
  })
</script>

<style scoped>
.session-timeout-modal {
  border-radius: 12px;
}

.modal-content {
  padding: 8px 0;
}

.session-message {
  margin-bottom: 16px;
  line-height: 1.6;
  color: var(--n-text-color);
}

.session-alert {
  margin-bottom: 0;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* Header styling */
:deep(.n-card-header) {
  background-color: var(--n-card-color);
  border-bottom: 1px solid var(--n-border-color);
  padding: 16px 20px;
}

:deep(.n-card-header .n-card-header__main) {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 18px;
}

/* Content styling */
:deep(.n-card__content) {
  padding: 20px;
}

/* Action styling */
:deep(.n-card__action) {
  padding: 16px 20px;
  border-top: 1px solid var(--n-border-color);
  background-color: var(--n-card-color);
}

/* Alert styling */
:deep(.n-alert) {
  border-radius: 8px;
}

/* Button styling */
:deep(.n-button) {
  border-radius: 6px;
  font-weight: 500;
}

/* Responsive design */
@media (max-width: 480px) {
  .session-timeout-modal {
    width: 90vw !important;
    max-width: 350px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions .n-button {
    width: 100%;
  }
}
</style>
