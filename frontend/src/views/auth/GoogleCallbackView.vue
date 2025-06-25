<template>
  <div class="google-callback">
    <div class="text-center">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
        class="mb-4"
      />
      <h3 class="text-h5 mb-2">Processing Google Authentication...</h3>
      <p class="text-body-1 text-medium-emphasis">
        Please wait while we complete your sign-in.
      </p>
      
      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        class="mt-4"
      >
        {{ error }}
        <template #append>
          <v-btn
            variant="text"
            size="small"
            @click="redirectToLogin"
          >
            Try Again
          </v-btn>
        </template>
      </v-alert>
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

<style scoped>
.google-callback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
}
</style>