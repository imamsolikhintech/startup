<template>
  <CustomDialog
    :show="show"
    :max-width="500"
    :persistent="true"
    title="Reset Password"
    subtitle="Set a new password for this user"
    header-icon="mdi-lock-reset"
    header-icon-color="warning"
    :loading="loading"
    confirm-button-text="Reset Password"
    confirm-button-color="warning"
    cancel-button-text="Cancel"
    @update:show="$emit('update:show', $event)"
    @confirm="$emit('confirm')"
    @cancel="$emit('cancel')"
    @close="$emit('cancel')"
    header-class="bg-warning text-white"
  >
        <v-form ref="resetPasswordForm">
          <v-alert
            type="warning"
            variant="tonal"
            class="mb-4"
            icon="mdi-shield-alert"
          >
            The user will need to use this new password for their next login.
          </v-alert>
          
          <v-text-field
            :model-value="formData.newPassword"
            @update:model-value="updateField('newPassword', $event)"
            label="New Password"
            type="password"
            variant="outlined"
            prepend-inner-icon="mdi-lock"
            :rules="passwordRules"
            required
            color="warning"
            class="mb-4"
          />
          
          <v-text-field
            :model-value="formData.confirmPassword"
            @update:model-value="updateField('confirmPassword', $event)"
            label="Confirm New Password"
            type="password"
            variant="outlined"
            prepend-inner-icon="mdi-lock-check"
            :rules="confirmPasswordRules"
            required
            color="warning"
          />
        </v-form>
  </CustomDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CustomDialog from '@/components/dialog/CustomDialog.vue'

interface ResetPasswordData {
  userId: string
  newPassword: string
  confirmPassword: string
}

interface Props {
  show: boolean
  formData: ResetPasswordData
  loading?: boolean
}

const props = defineProps<Props>()

defineEmits<{
  'update:show': [value: boolean]
  'update:formData': [data: ResetPasswordData]
  confirm: []
  cancel: []
}>()

const updateField = (field: keyof ResetPasswordData, value: string) => {
  const updatedData = { ...props.formData, [field]: value }
  // Emit the updated form data
  // Note: Parent component should handle this emission
}

const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 6 || 'Password must be at least 6 characters',
  (v: string) => /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(v) || 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
]

const confirmPasswordRules = computed(() => [
  (v: string) => !!v || 'Please confirm your password',
  (v: string) => v === props.formData.newPassword || 'Passwords do not match'
])
</script>

<style scoped>
.bg-warning {
  background-color: rgb(var(--v-theme-warning)) !important;
}
</style>