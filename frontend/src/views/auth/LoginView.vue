<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h2 class="login-title">Welcome Back</h2>
        <p class="login-subtitle">
          Sign in to your account to continue
        </p>
      </div>

      <div class="login-form">
        <v-form @submit.prevent="handleLogin" ref="formRef" v-model="formValid">
          <v-text-field v-model="credentials.email" label="Email Address" type="email" prepend-inner-icon="mdi-email"
            variant="outlined" :rules="emailRules" class="mb-3" required clearable autocomplete="off" />

          <v-text-field v-model="credentials.password" label="Password" :type="showPassword ? 'text' : 'password'"
            prepend-inner-icon="mdi-lock" :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append-inner="showPassword = !showPassword" variant="outlined" :rules="passwordRules" class="mb-2"
            required autocomplete="off" />

          <div class="d-flex justify-space-between align-center mb-4">
            <v-checkbox v-model="rememberMe" label="Remember me" density="compact" hide-details />
            <v-btn variant="text" size="small" color="primary" class="text-none">
              Forgot password?
            </v-btn>
          </div>

          <v-btn type="submit" color="primary" variant="flat" size="large" :loading="authStore.loading"
            :disabled="!isFormValid" block class="mb-4 text-none" rounded>
            Sign In
          </v-btn>

          <v-alert v-if="authStore.error" type="error" variant="tonal" class="mb-4" closable @click:close="clearError">
            {{ authStore.error }}
          </v-alert>
        </v-form>

        <v-divider class="my-4">
          <span class="text-medium-emphasis px-4 text-body-2">or</span>
        </v-divider>

        <div class="social-login mb-4">
          <v-btn variant="outlined" size="large" block class="mb-3 text-none" prepend-icon="mdi-google"
            @click="handleSocialLogin('google')">
            Continue with Google
          </v-btn>
        </div>

        <div class="text-center mb-4">
          <span class="text-medium-emphasis text-body-2">Don't have an account?</span>
          <v-btn variant="text" color="primary" to="/auth/register" class="ml-1 text-none" size="small">
            Sign up
          </v-btn>
        </div>

        <!-- Demo Credentials Info -->
        <!-- <v-card variant="tonal" color="info" class="demo-card">
          <v-card-text class="text-center pa-3">
            <div class="text-subtitle-2 mb-2">Demo Credentials</div>
            <div class="text-caption">
              <strong>Email:</strong> admin@example.com<br>
              <strong>Password:</strong> password
            </div>
            <v-btn size="small" variant="text" color="primary" class="mt-2 text-none" @click="fillDemoCredentials">
              Use Demo Credentials
            </v-btn>
          </v-card-text>
        </v-card> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref()
const formValid = ref(false)
const credentials = ref({
  email: '',
  password: ''
})
const showPassword = ref(false)
const rememberMe = ref(false)

const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid'
]

const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 6 || 'Password must be at least 6 characters'
]

const isFormValid = computed(() => {
  return credentials.value.email &&
    credentials.value.password &&
    /.+@.+\..+/.test(credentials.value.email) &&
    credentials.value.password.length >= 6
})

const handleLogin = async () => {
  if (!isFormValid.value) {
    console.log('Form is not valid')
    return
  }

  console.log('Attempting login with:', credentials.value.email)

  try {
    // Set remember me preference before login
    authStore.setRememberMe(rememberMe.value)
    
    const success = await authStore.login(credentials.value.email, credentials.value.password)
    if (success) {
      console.log('Login successful, redirecting to dashboard')
      router.push('/dashboard')
    } else {
      console.log('Login failed')
    }
  } catch (error) {
    console.error('Login error:', error)
  }
}

const handleSocialLogin = (provider: string) => {
  if (provider === 'google') {
    // Get current URL for redirect after authentication
    const redirectUrl = `${window.location.origin}/auth/google/callback`

    // Redirect to backend Google OAuth endpoint
    const authServiceUrl = import.meta.env.VITE_API_SERVICE_AUTH
    const googleAuthUrl = `${authServiceUrl}/api/v1/auth/google/login?redirect_url=${encodeURIComponent(redirectUrl)}`

    console.log('Redirecting to Google OAuth:', googleAuthUrl)
    window.location.href = googleAuthUrl
  } else {
    console.log(`Social login with ${provider} - Feature coming soon`)
  }
}

const fillDemoCredentials = () => {
  credentials.value.email = 'admin@example.com'
  credentials.value.password = 'password'
}

const clearError = () => {
  authStore.error = null
}
</script>