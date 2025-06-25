<template>
  <div class="register-form">
    <div class="text-center mb-6">
      <h2 class="text-h4 font-weight-bold mb-2">Create Account</h2>
      <p class="text-subtitle-1 text-medium-emphasis">
        Join us and start managing your dashboard
      </p>
    </div>

    <v-form @submit.prevent="handleRegister" ref="formRef">
      <v-text-field
        v-model="form.name"
        label="Full Name"
        prepend-inner-icon="mdi-account"
        variant="outlined"
        :rules="nameRules"
        class="mb-3"
        required
      />

      <v-text-field
        v-model="form.email"
        label="Email Address"
        type="email"
        prepend-inner-icon="mdi-email"
        variant="outlined"
        :rules="emailRules"
        class="mb-3"
        required
      />

      <v-text-field
        v-model="form.password"
        label="Password"
        :type="showPassword ? 'text' : 'password'"
        prepend-inner-icon="mdi-lock"
        :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append-inner="showPassword = !showPassword"
        variant="outlined"
        :rules="passwordRules"
        class="mb-3"
        required
      />

      <v-text-field
        v-model="form.confirmPassword"
        label="Confirm Password"
        :type="showConfirmPassword ? 'text' : 'password'"
        prepend-inner-icon="mdi-lock-check"
        :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
        @click:append-inner="showConfirmPassword = !showConfirmPassword"
        variant="outlined"
        :rules="confirmPasswordRules"
        class="mb-3"
        required
      />

      <v-checkbox
        v-model="form.acceptTerms"
        :rules="termsRules"
        class="mb-4"
        density="compact"
      >
        <template #label>
          <span class="text-body-2">
            I agree to the 
            <v-btn variant="text" size="small" color="primary" class="pa-0 text-none">
              Terms of Service
            </v-btn>
            and
            <v-btn variant="text" size="small" color="primary" class="pa-0 text-none">
              Privacy Policy
            </v-btn>
          </span>
        </template>
      </v-checkbox>

      <v-btn
        type="submit"
        color="primary"
        variant="flat"
        size="large"
        :loading="authStore.loading"
        :disabled="!isFormValid"
        block
        class="mb-4 text-none"
        rounded
      >
        Create Account
      </v-btn>

      <v-alert
        v-if="authStore.error"
        type="error"
        variant="tonal"
        class="mb-4"
        closable
        @click:close="authStore.error = null"
      >
        {{ authStore.error }}
      </v-alert>
    </v-form>

    <v-divider class="my-4">
      <span class="text-medium-emphasis px-4 text-body-2">or</span>
    </v-divider>

    <div class="social-login mb-4">
      <v-btn
        variant="outlined"
        size="large"
        block
        class="mb-3 text-none"
        prepend-icon="mdi-google"
      >
        Sign up with Google
      </v-btn>
      <v-btn
        variant="outlined"
        size="large"
        block
        class="text-none"
        prepend-icon="mdi-github"
      >
        Sign up with GitHub
      </v-btn>
    </div>

    <div class="text-center">
      <span class="text-medium-emphasis text-body-2">Already have an account?</span>
      <v-btn
        variant="text"
        color="primary"
        to="/auth/login"
        class="ml-1 text-none"
        size="small"
      >
        Sign in
      </v-btn>
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
const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const nameRules = [
  (v: string) => !!v || 'Name is required',
  (v: string) => v.length >= 2 || 'Name must be at least 2 characters'
]

const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid'
]

const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 6 || 'Password must be at least 6 characters',
  (v: string) => /(?=.*[a-z])/.test(v) || 'Password must contain at least one lowercase letter',
  (v: string) => /(?=.*[A-Z])/.test(v) || 'Password must contain at least one uppercase letter',
  (v: string) => /(?=.*\d)/.test(v) || 'Password must contain at least one number'
]

const confirmPasswordRules = [
  (v: string) => !!v || 'Please confirm your password',
  (v: string) => v === form.value.password || 'Passwords do not match'
]

const termsRules = [
  (v: boolean) => !!v || 'You must accept the terms and conditions'
]

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
.register-form {
  width: 100%;
}

.social-login .v-btn {
  text-transform: none;
}

:deep(.v-checkbox .v-label) {
  opacity: 1;
}

@media (max-width: 600px) {
  .register-form {
    padding: 0;
  }
}
</style>