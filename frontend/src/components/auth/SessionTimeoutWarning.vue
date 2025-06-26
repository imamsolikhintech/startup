<template>
  <v-dialog v-model="authStore.sessionTimeoutWarning" max-width="400" persistent>
    <v-card>
      <v-card-title class="text-h6 d-flex align-center">
        <v-icon color="warning" class="mr-2">mdi-clock-alert</v-icon>
        Session Expiring Soon
      </v-card-title>
      
      <v-card-text>
        <p class="mb-3">
          Your session will expire in <strong>{{ timeRemaining }}</strong> minutes.
          Would you like to extend your session?
        </p>
        
        <v-alert type="info" variant="tonal" class="mb-0">
          Click "Extend Session" to continue working, or "Logout" to end your session now.
        </v-alert>
      </v-card-text>
      
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn 
          color="grey" 
          variant="text" 
          @click="handleLogout"
          class="text-none"
        >
          Logout
        </v-btn>
        <v-btn 
          color="primary" 
          variant="flat" 
          @click="handleExtendSession"
          class="text-none"
        >
          Extend Session
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

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

onMounted(() => {
  // Start watching session warning
  unwatchSessionWarning.value
})

onUnmounted(() => {
  stopCountdown()
})
</script>

<style scoped>
.v-card-title {
  background-color: rgb(var(--v-theme-surface-variant));
}
</style>