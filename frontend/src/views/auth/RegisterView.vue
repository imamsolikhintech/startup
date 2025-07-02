<template>
  <div class="register-view">
    <div class="register-container">
      <n-card class="register-card">
        <div class="register-header">
          <h1 class="register-title">
            Create Account
          </h1>
          <p class="register-subtitle">
            Join us today and get started
          </p>
        </div>

        <n-form
          ref="formRef"
          :model="form"
          :rules="rules"
          class="register-form"
          @submit.prevent="handleRegister">
          <n-form-item
            path="name"
            class="mb-1">
            <n-input
              v-model:value="form.name"
              placeholder="Full Name"
              size="large"
              clearable>
              <template #prefix>
                <n-icon>
                  <person />
                </n-icon>
              </template>
            </n-input>
          </n-form-item>

          <n-form-item
            path="email"
            class="mb-1">
            <n-input
              v-model:value="form.email"
              placeholder="Email Address"
              type="text"
              size="large"
              clearable>
              <template #prefix>
                <n-icon>
                  <mail />
                </n-icon>
              </template>
            </n-input>
          </n-form-item>

          <n-form-item
            path="password"
            class="mb-1">
            <n-input
              v-model:value="form.password"
              placeholder="Password"
              type="password"
              size="large"
              show-password-on="click">
              <template #prefix>
                <n-icon>
                  <lock-closed />
                </n-icon>
              </template>
            </n-input>
          </n-form-item>

          <n-form-item
            path="confirmPassword"
            class="mb-1">
            <n-input
              v-model:value="form.confirmPassword"
              placeholder="Confirm Password"
              type="password"
              size="large"
              show-password-on="click">
              <template #prefix>
                <n-icon>
                  <lock-closed />
                </n-icon>
              </template>
            </n-input>
          </n-form-item>

          <n-form-item
            path="acceptTerms"
            class="mb-4">
            <n-checkbox v-model:checked="form.acceptTerms">
              <span class="text-sm">
                I agree to the
                <n-button
                  text
                  class="p-0">
                  Terms of Service
                </n-button>
                and
                <n-button
                  text
                  class="p-0">
                  Privacy Policy
                </n-button>
              </span>
            </n-checkbox>
          </n-form-item>

          <n-button
            attr-type="submit"
            type="primary"
            size="large"
            :loading="loading"
            block
            class="mb-4"
            round>
            Create Account
          </n-button>
        </n-form>

        <n-divider class="my-4">
          <span class="text-sm text-gray-500">or</span>
        </n-divider>

        <div class="social-login mb-4">
          <n-button
            secondary
            size="large"
            block
            class="mb-1">
            <template #icon>
              <n-icon>
                <svg
                  viewBox="0 0 24 24"
                  width="1em"
                  height="1em">
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
            Sign up with Google
          </n-button>
        </div>

        <div class="text-center">
          <span class="text-sm">Already have an account?</span>
          <n-button
            text
            class="ml-1"
            @click="$router.push('/auth/login')">
            Sign In
          </n-button>
        </div>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { LockClosed, Mail, Person } from '@vicons/ionicons5'
  import type { FormInst, FormRules } from 'naive-ui'
  import { NAlert, NButton, NCard, NCheckbox, NDivider, NForm, NFormItem, NIcon, NInput, useMessage } from 'naive-ui'
  import { reactive, ref } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()
  const message = useMessage()
  const formRef = ref<FormInst | null>(null)
  const loading = ref(false)

  const form = reactive({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  })

  // Validation rules for Naive UI
  const rules: FormRules = {
    name: [
      {
        required: true,
        message: 'Please enter your full name',
        trigger: ['input', 'blur'],
      },
      {
        min: 2,
        message: 'Name must be at least 2 characters',
        trigger: ['input', 'blur'],
      },
    ],
    email: [
      {
        required: true,
        message: 'Please enter your email',
        trigger: ['input', 'blur'],
      },
      {
        type: 'email',
        message: 'Please enter a valid email address',
        trigger: ['input', 'blur'],
      },
    ],
    password: [
      {
        required: true,
        message: 'Please enter your password',
        trigger: ['input', 'blur'],
      },
      {
        min: 8,
        message: 'Password must be at least 8 characters',
        trigger: ['input', 'blur'],
      },
    ],
    confirmPassword: [
      {
        required: true,
        message: 'Please confirm your password',
        trigger: ['input', 'blur'],
      },
      {
        validator: (rule: any, value: string) => {
          return value === form.password
        },
        message: 'Passwords do not match',
        trigger: ['input', 'blur'],
      },
    ],
    acceptTerms: [
      {
        required: true,
        message: 'You must accept the terms and conditions',
        trigger: ['change'],
      },
    ],
  }

  const handleRegister = async () => {
    try {
      await formRef.value?.validate()
      loading.value = true

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      message.success('Account created successfully!')
      router.push('/auth/login')
    } catch (error) {
      message.error('Please fix the form errors')
    } finally {
      loading.value = false
    }
  }
</script>

<style scoped>
.register-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--n-color-base);
  padding: 2rem;
}

.register-container {
  width: 100%;
  max-width: 450px;
}

.register-card {
  padding: 2.5rem;
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--n-text-color-base);
  margin-bottom: 0.5rem;
}

.register-subtitle {
  color: var(--n-text-color-placeholder);
  font-size: 1rem;
  margin: 0;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.terms-checkbox {
  margin: 1rem 0;
}

.terms-text {
  font-size: 0.875rem;
  color: var(--n-text-color-placeholder);
}

.terms-link {
  color: var(--n-color-primary);
  text-decoration: none;
}

.terms-link:hover {
  text-decoration: underline;
}

.register-actions {
  margin-top: 1.5rem;
}

.divider-container {
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  gap: 1rem;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: var(--n-border-color);
}

.divider-text {
  color: var(--n-text-color-placeholder);
  font-size: 0.875rem;
}

.google-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--n-border-color);
  border-radius: 8px;
  background: var(--n-color-base);
  color: var(--n-text-color-base);
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
}

.google-button:hover {
  background: var(--n-color-hover);
  border-color: var(--n-border-color-hover);
}

.login-link {
  text-align: center;
  margin-top: 1.5rem;
  color: var(--n-text-color-placeholder);
  font-size: 0.875rem;
}

.login-link a {
  color: var(--n-color-primary);
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .register-view {
    padding: 1rem;
  }

  .register-card {
    padding: 2rem;
  }

  .register-title {
    font-size: 1.75rem;
  }
}
</style>
