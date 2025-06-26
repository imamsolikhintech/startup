<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h2 class="register-title">Create Account</h2>
        <p class="register-subtitle">
          Join us and start managing your dashboard
        </p>
      </div>

      <div class="register-form">
        <n-form @submit.prevent="handleRegister" ref="formRef" :model="form" :rules="formRules">
          <n-form-item path="name" class="mb-1">
            <n-input v-model:value="form.name" placeholder="Full Name" size="large" clearable>
              <template #prefix>
                <n-icon>
                  <Person />
                </n-icon>
              </template>
            </n-input>
          </n-form-item>

          <n-form-item path="email" class="mb-1">
            <n-input v-model:value="form.email" placeholder="Email Address" type="email" size="large" clearable>
              <template #prefix>
                <n-icon>
                  <Mail />
                </n-icon>
              </template>
            </n-input>
          </n-form-item>

          <n-form-item path="password" class="mb-1">
            <n-input v-model:value="form.password" placeholder="Password" type="password" size="large"
              show-password-on="click">
              <template #prefix>
                <n-icon>
                  <LockClosed />
                </n-icon>
              </template>
            </n-input>
          </n-form-item>

          <n-form-item path="confirmPassword" class="mb-1">
            <n-input v-model:value="form.confirmPassword" placeholder="Confirm Password" type="password" size="large"
              show-password-on="click">
              <template #prefix>
                <n-icon>
                  <LockClosed />
                </n-icon>
              </template>
            </n-input>
          </n-form-item>

          <n-form-item path="acceptTerms" class="mb-4">
            <n-checkbox v-model:checked="form.acceptTerms">
              <span class="text-sm">
                I agree to the
                <n-button text class="p-0">
                  Terms of Service
                </n-button>
                and
                <n-button text class="p-0">
                  Privacy Policy
                </n-button>
              </span>
            </n-checkbox>
          </n-form-item>

          <n-button attr-type="submit" type="primary" size="large" :loading="authStore.loading" :disabled="!isFormValid"
            block class="mb-4" round>
            Create Account
          </n-button>

          <n-alert v-if="authStore.error" type="error" class="mb-4" closable @close="authStore.error = null">
            {{ authStore.error }}
          </n-alert>
        </n-form>

        <n-divider class="my-4">
          <span class="text-sm text-gray-500">or</span>
        </n-divider>

        <div class="social-login mb-4">
          <n-button secondary size="large" block class="mb-1">
            <template #icon>
              <n-icon>
                <svg viewBox="0 0 24 24" width="1em" height="1em">
                  <path fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </n-icon>
            </template>
            Sign up with Google
          </n-button>
        </div>

        <div class="text-center">
          <span class="text-sm">Already have an account?</span>
          <n-button text class="ml-1" @click="$router.push('/auth/login')">
            Sign In
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import { NForm, NFormItem, NInput, NCheckbox, NButton, NAlert, NDivider, NIcon } from 'naive-ui'
import { Person, Mail, LockClosed } from '@vicons/ionicons5'

const router = useRouter()
const authStore = useAuthStore()

const formRef = ref()
const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Validation rules for Naive UI
const formRules = {
  name: {
    required: true,
    message: 'Name is required',
    trigger: ['input', 'blur']
  },
  email: {
    required: true,
    message: 'Email is required',
    trigger: ['input', 'blur']
  },
  password: {
    required: true,
    message: 'Password is required',
    trigger: ['input', 'blur']
  },
  confirmPassword: {
    required: true,
    message: 'Please confirm your password',
    trigger: ['input', 'blur']
  },
  acceptTerms: {
    required: true,
    message: 'You must accept the terms and conditions',
    trigger: ['change']
  }
}

const isFormValid = computed(() => {
  return form.value.name &&
    form.value.email &&
    form.value.password &&
    form.value.confirmPassword &&
    form.value.acceptTerms &&
    /.+@.+\..+/.test(form.value.email) &&
    form.value.password.length >= 6 &&
    form.value.password === form.value.confirmPassword
})

const handleRegister = async () => {
  if (!isFormValid.value) return

  const success = await authStore.register(
    form.value.email,
    form.value.password,
    form.value.name,
    form.value.confirmPassword
  )

  if (success) {
    router.push('/dashboard')
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  /* background: rgba(255, 255, 255, 0.95); */
  /* backdrop-filter: blur(10px); */
}

.register-card {
  width: 100%;
  max-width: 450px;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.register-subtitle {
  color: #666;
  font-size: 1rem;
  line-height: 1.5;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .n-form-item {
  flex: 1;
}

.error-message {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  text-align: center;
}

.register-button {
  width: 100%;
  height: 48px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.form-options {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.5rem;
  gap: 0.5rem;
}

.login-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.login-link:hover {
  color: #2563eb;
  text-decoration: underline;
}

.social-register {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.social-register-title {
  text-align: center;
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.social-buttons {
  display: flex;
  gap: 1rem;
}

.social-button {
  flex: 1;
  height: 44px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

/* Dark Theme */
[data-theme="dark"] .register-card,
.dark .register-card {
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .register-title,
.dark .register-title {
  color: #ffffff;
}

[data-theme="dark"] .register-subtitle,
.dark .register-subtitle {
  color: #a1a1aa;
}

[data-theme="dark"] .social-register,
.dark .social-register {
  border-top-color: #374151;
}

[data-theme="dark"] .social-register-title,
.dark .social-register-title {
  color: #a1a1aa;
}

[data-theme="dark"] .login-link,
.dark .login-link {
  color: #60a5fa;
}

[data-theme="dark"] .login-link:hover,
.dark .login-link:hover {
  color: #93c5fd;
}

/* Responsive Design */
@media (max-width: 480px) {
  .register-container {
    padding: 0.5rem;
  }

  .register-card {
    padding: 2rem 1.5rem;
    max-width: 100%;
  }

  .register-title {
    font-size: 1.75rem;
  }

  .form-row {
    flex-direction: column;
    gap: 1rem;
  }

  .social-buttons {
    flex-direction: column;
  }
}

@media (max-width: 360px) {
  .register-card {
    padding: 1.5rem 1rem;
  }

  .register-title {
    font-size: 1.5rem;
  }
}
</style>
