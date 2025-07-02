<template>
  <div class="login-view">
    <div class="login-container">
      <n-card class="login-card">
        <div class="login-header">
          <h1 class="login-title">
            Welcome Back
          </h1>
          <p class="login-subtitle">
            Sign in to your account to continue
          </p>
        </div>

        <n-form
          ref="formRef"
          :model="credentials"
          class="login-form"
          @submit.prevent="handleLogin">
          <n-input
            v-model:value="credentials.email"
            placeholder="Email Address"
            type="text"
            size="large"
            clearable
            :status="emailError ? 'error' : undefined"
            class="mb-2">
            <template #prefix>
              <n-icon>
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,6.89 21.1,4 20,4Z" />
                </svg>
              </n-icon>
            </template>
          </n-input>
          <div
            v-if="emailError"
            class="error-message">
            {{ emailError }}
          </div>

          <n-input
            v-model:value="credentials.password"
            placeholder="Password"
            :type="showPassword ? 'text' : 'password'"
            size="large"
            show-password-on="click"
            :status="passwordError ? 'error' : undefined"
            class="mb-2">
            <template #prefix>
              <n-icon>
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z" />
                </svg>
              </n-icon>
            </template>
          </n-input>
          <div
            v-if="passwordError"
            class="error-message">
            {{ passwordError }}
          </div>

          <div class="form-options mb-4">
            <n-checkbox
              v-model:checked="rememberMe"
              label="Remember me" />
            <n-button text>
              Forgot password?
            </n-button>
          </div>

          <n-button
            type="primary"
            size="large"
            :loading="authStore.loading"
            :disabled="!isFormValid"
            block
            class="mb-4"
            attr-type="submit">
            Sign In
          </n-button>

          <n-alert
            v-if="authStore.error"
            type="error"
            class="mb-4"
            closable
            @close="clearError">
            {{ authStore.error }}
          </n-alert>
        </n-form>

        <n-divider class="my-4">
          <span class="divider-text">or</span>
        </n-divider>

        <div class="social-login mb-4">
          <n-button
            secondary
            size="large"
            block
            class="mb-3"
            @click="handleSocialLogin('google')">
            <template #icon>
              <n-icon>
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </n-icon>
            </template>
            Continue with Google
          </n-button>
        </div>

        <div class="text-center">
          <span class="signup-text">Don't have an account?</span>
          <n-button
            text
            class="ml-1"
            @click="$router.push('/auth/register')">
            Sign up
          </n-button>
        </div>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { FormInst } from 'naive-ui'
  import { NAlert, NButton, NCard, NCheckbox, NDivider, NForm, NFormItem, NIcon, NInput } from 'naive-ui'
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/stores/auth'

  const router = useRouter()
  const authStore = useAuthStore()

  const formRef = ref<FormInst | null>(null)
  const credentials = ref({
    email: '',
    password: '',
  })
  const showPassword = ref(false)
  const rememberMe = ref(false)

  // Validation errors
  const emailError = ref('')
  const passwordError = ref('')

  // Validation functions
  const validateEmail = (email: string): string => {
    if (!email) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email must be valid'
    return ''
  }

  const validatePassword = (password: string): string => {
    if (!password) return 'Password is required'
    if (password.length < 6) return 'Password must be at least 6 characters'
    return ''
  }

  const isFormValid = computed(() => {
    const emailValid = validateEmail(credentials.value.email) === ''
    const passwordValid = validatePassword(credentials.value.password) === ''
    return emailValid && passwordValid
  })

  const handleLogin = async () => {
    // Validate form
    emailError.value = validateEmail(credentials.value.email)
    passwordError.value = validatePassword(credentials.value.password)

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

  const clearError = () => {
    authStore.error = null
  }
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--n-color-base);
  padding: 2rem;
}

.login-container {
  width: 100%;
}

.login-card {
  padding: 0;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--n-text-color-base);
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: var(--n-text-color-placeholder);
  font-size: 1rem;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
}

.error-message {
  color: var(--n-color-error);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 0;
}

.divider-text {
  color: var(--n-text-color-placeholder);
  font-size: 0.875rem;
}

.social-login {
  margin: 1.5rem 0;
}

.signup-text {
  color: var(--n-text-color-placeholder);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .login-view {
    padding: 1rem;
  }

  .login-card {
    padding: 2rem;
  }

  .login-title {
    font-size: 1.75rem;
  }
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.my-4 {
  margin-top: 1rem;
  margin-bottom: 1rem;
}

@media (max-width: 480px) {
  .login-card {
    padding: 1.5rem;
    margin: 0.5rem;
  }

  .login-title {
    font-size: 1.5rem;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

/* Dark Theme */
[data-theme="dark"] .login-container,
.dark .login-container {
  /* background: rgba(30, 30, 30, 0.95); */
  backdrop-filter: blur(10px);
}

[data-theme="dark"] .login-card,
.dark .login-card {
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .login-title,
.dark .login-title {
  color: #ffffff;
}

[data-theme="dark"] .login-subtitle,
.dark .login-subtitle {
  color: #a1a1aa;
}

[data-theme="dark"] .social-login,
.dark .social-login {
  border-top-color: #374151;
}

[data-theme="dark"] .social-login-title,
.dark .social-login-title {
  color: #a1a1aa;
}

[data-theme="dark"] .register-link,
.dark .register-link {
  color: #60a5fa;
}

[data-theme="dark"] .register-link:hover,
.dark .register-link:hover {
  color: #93c5fd;
}
</style>
