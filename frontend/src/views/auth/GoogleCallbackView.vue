<template>
  <div class="callback-view">
    <div class="callback-container">
      <n-card class="callback-card" size="large">
        <div class="callback-content">
          <div v-if="!error" class="loading-content">
            <n-spin size="large" class="callback-icon" />
            <h3 class="callback-title">Processing Google Authentication</h3>
            <p class="callback-message">Please wait while we complete your sign-in...</p>
          </div>

          <div v-else class="error-content">
            <n-icon size="48" class="error-icon">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.58L19 8l-9 9z"/>
              </svg>
            </n-icon>
            <h3 class="error-title">Authentication Error</h3>
            <p class="error-message">{{ error }}</p>
            
            <n-button
              type="primary"
              @click="router.push('/auth/login')"
              class="retry-button"
            >
              Try Again
            </n-button>
          </div>
        </div>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { NSpin, NButton, NCard, NIcon } from 'naive-ui'

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
.callback-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--n-color-base);
  padding: 2rem;
}

.callback-container {
  width: 100%;
  max-width: 450px;
}

.callback-card {
  text-align: center;
  padding: 3rem 2rem;
}

.callback-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-content,
.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.callback-icon {
  color: var(--n-color-primary);
}

.callback-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--n-text-color-base);
  margin: 0;
}

.callback-message {
  color: var(--n-text-color-placeholder);
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
}

.error-icon {
  color: var(--n-color-error);
}

.error-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--n-color-error);
  margin: 0;
}

.error-message {
  color: var(--n-text-color-placeholder);
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
  text-align: center;
}

.retry-button {
  min-width: 120px;
}

@media (max-width: 768px) {
  .callback-view {
    padding: 1rem;
  }
  
  .callback-card {
    padding: 2rem 1.5rem;
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
</style>

