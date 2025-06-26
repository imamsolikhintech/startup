<template>
  <div class="callback-container">
    <div class="callback-content">
      <div class="callback-icon">
        <n-spin size="large" />
      </div>
      
      <h3 class="callback-title">Processing Google Authentication</h3>
      <p class="callback-message">Please wait while we complete your sign-in...</p>

      <div v-if="error" class="callback-error">
        <div class="callback-error-title">Authentication Error</div>
        <div class="callback-error-message">{{ error }}</div>
        
        <n-button
          secondary
          size="small"
          @click="router.push('/auth/login')"
          class="mt-3"
        >
          Try Again
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { NSpin, NButton } from 'naive-ui'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const error = ref<string | null>(null)

const processGoogleCallback = async () => {
  try {
    // Get tokens from URL parameters
    const accessToken = route.query.access_token as string
    const refreshToken = route.query.refresh_token as string
    const tokenType = route.query.token_type as string
    
    if (!accessToken || !refreshToken) {
      throw new Error('Missing authentication tokens from Google callback')
    }
    
    console.log('Processing Google OAuth callback with tokens')
    
    // Get user profile using the access token
    const authServiceUrl = import.meta.env.VITE_API_SERVICE_AUTH
    const response = await fetch(`${authServiceUrl}/api/v1/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to get user profile')
    }
    
    const userData = await response.json()
    
    console.log(userData.data)
    if (userData.data) {
      // Map backend user data to frontend format
      const user = {
        id: userData.data.id,
        email: userData.data.email,
        name: userData.data.name,
        role: userData.data.role,
        avatar: userData.data.profile_picture
      }
      
      // Use auth store method to set Google authentication
      const success = authStore.setGoogleAuth(user, accessToken, refreshToken)
      
      if (success) {
        console.log('Google OAuth authentication successful')
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        throw new Error('Failed to set authentication data')
      }
    } else {
      throw new Error('Invalid user data received')
    }
  } catch (err) {
    console.error('Google OAuth callback error:', err)
    error.value = err instanceof Error ? err.message : 'Authentication failed'
    
    // Clear any stored tokens on error
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('auth_user')
    
    authStore.loading = false
    authStore.error = error.value
  }
}

const redirectToLogin = () => {
  router.push('/auth/login')
}

onMounted(() => {
  processGoogleCallback()
})
</script>

<style scoped>
.callback-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  /* background: rgba(255, 255, 255, 0.95); */
  /* backdrop-filter: blur(10px); */
}

.callback-card {
  width: 100%;
  max-width: 400px;
  padding: 3rem 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
  transition: all 0.3s ease;
}

.callback-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.callback-icon {
  color: #3b82f6;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.callback-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.callback-message {
  color: #666;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
}

.callback-progress {
  width: 100%;
  margin-top: 1rem;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.error-icon {
  color: #ef4444;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ef4444;
  margin: 0;
}

.error-message {
  color: #666;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
  text-align: center;
}

.retry-button {
  margin-top: 1rem;
  min-width: 120px;
}

/* Dark Theme */
[data-theme="dark"] .callback-card,
.dark .callback-card {
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .callback-title,
.dark .callback-title {
  color: #ffffff;
}

[data-theme="dark"] .callback-message,
.dark .callback-message,
[data-theme="dark"] .error-message,
.dark .error-message {
  color: #a1a1aa;
}

[data-theme="dark"] .callback-icon,
.dark .callback-icon {
  color: #60a5fa;
}

/* Responsive Design */
@media (max-width: 480px) {
  .callback-container {
    padding: 1rem;
  }

  .callback-card {
    padding: 2rem 1.5rem;
    max-width: 100%;
  }

  .callback-title,
  .error-title {
    font-size: 1.25rem;
  }

  .callback-message,
  .error-message {
    font-size: 0.9rem;
  }
}

@media (max-width: 360px) {
  .callback-card {
    padding: 1.5rem 1rem;
  }
}
</style>

