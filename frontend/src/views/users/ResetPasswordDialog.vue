<template>
  <custom-dialog
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
    header-class="bg-warning text-white"
    @update:show="$emit('update:show', $event)"
    @confirm="$emit('confirm')"
    @cancel="$emit('cancel')"
    @close="$emit('cancel')">
    <n-form ref="resetPasswordForm">
      <n-alert
        type="warning"
        class="mb-4">
        <template #icon>
          <n-icon>
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.4 16,13V16C16,17.4 15.4,18 14.8,18H9.2C8.6,18 8,17.4 8,16V13C8,12.4 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z" />
            </svg>
          </n-icon>
        </template>
        The user will need to use this new password for their next login.
      </n-alert>

      <n-form-item
        label="New Password"
        class="mb-4">
        <n-input
          :value="formData.newPassword"
          type="password"
          placeholder="Enter new password"
          show-password-on="click"
          @update:value="updateField('newPassword', $event)">
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
      </n-form-item>

      <n-form-item label="Confirm New Password">
        <n-input
          :value="formData.confirmPassword"
          type="password"
          placeholder="Confirm new password"
          show-password-on="click"
          @update:value="updateField('confirmPassword', $event)">
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
      </n-form-item>
    </n-form>
  </custom-dialog>
</template>

<script setup lang="ts">
  import { NAlert, NForm, NFormItem, NIcon, NInput } from 'naive-ui'
  import { computed } from 'vue'
  import CustomDialog from '@/components/dialog/CustomDialog.vue'

  interface ResetPasswordData {
    userId: string,
    newPassword: string,
    confirmPassword: string,
  }

  interface Props {
    show: boolean,
    formData: ResetPasswordData,
    loading?: boolean,
  }

  const props = defineProps<Props>()

  defineEmits<{
    'update:show': [value: boolean],
    'update:formData': [data: ResetPasswordData],
    confirm: [],
    cancel: [],
  }>()

  const updateField = (field: keyof ResetPasswordData, value: string) => {
    const updatedData = { ...props.formData, [field]: value }
  // Emit the updated form data
  // Note: Parent component should handle this emission
  }

  const passwordRules = [
    (v: string) => !!v || 'Password is required',
    (v: string) => v.length >= 6 || 'Password must be at least 6 characters',
    (v: string) => /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(v) || 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  ]

  const confirmPasswordRules = computed(() => [
    (v: string) => !!v || 'Please confirm your password',
    (v: string) => v === props.formData.newPassword || 'Passwords do not match',
  ])
</script>

