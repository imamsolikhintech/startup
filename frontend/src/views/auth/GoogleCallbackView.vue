<template>
  <div class="callback-container">
    <div class="callback-content">
      <div class="callback-icon">
        <v-progress-circular
          indeterminate
          color="primary"
          size="64"
        />
      </div>
      
      <h3 class="callback-title">Processing Google Authentication</h3>
      <p class="callback-message">Please wait while we complete your sign-in...</p>

      <div v-if="error" class="callback-error">
        <div class="callback-error-title">Authentication Error</div>
        <div class="callback-error-message">{{ error }}</div>
        
        <v-btn
          variant="outlined"
          size="small"
          @click="router.push('/auth/login')"
          class="mt-3"
        >
          Try Again
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

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

