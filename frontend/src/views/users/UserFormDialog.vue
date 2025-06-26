<template>
  <CustomDialog :show="show" :max-width="800" :persistent="true"
    :title="isEditing ? 'Edit User Profile' : 'Create New User'"
    :subtitle="isEditing ? 'Update user information and settings' : 'Add a new user to the system'"
    :header-icon="isEditing ? 'mdi-account-edit' : 'mdi-account-plus'" header-icon-color="primary" :loading="loading"
    confirm-button-text="Save User" cancel-button-text="Cancel" @update:show="$emit('update:show', $event)"
    @confirm="$emit('save')" @cancel="$emit('cancel')" @close="$emit('cancel')"
    header-class="bg-gradient-primary text-white">
    <n-form ref="userForm">
      <!-- Profile Picture Section -->
      <div class="profile-section">
        <n-avatar size="large" class="profile-avatar">
          <img :src="formData.profile_picture || getDefaultAvatar(formData.name)" :alt="formData.name" />
        </n-avatar>
        <div class="profile-input">
          <n-input
            :value="formData.profile_picture"
            @update:value="updateField('profile_picture', $event)"
            placeholder="https://example.com/avatar.jpg"
            class="mb-2"
          >
            <template #prefix>
              <n-icon><component :is="ImageIcon" /></n-icon>
            </template>
          </n-input>
          <p class="input-hint">
            Enter a valid image URL for the user's profile picture
          </p>
        </div>
      </div>

      <n-divider class="section-divider" />

      <!-- Basic Information -->
      <h3 class="section-title">
        <n-icon class="section-icon"><component :is="PersonIcon" /></n-icon>
        Basic Information
      </h3>

      <div class="form-row">
        <n-form-item label="Full Name" required>
          <n-input
            :value="formData.name"
            @update:value="updateField('name', $event)"
            placeholder="Enter full name"
          >
            <template #prefix>
              <n-icon><component :is="PersonIcon" /></n-icon>
            </template>
          </n-input>
        </n-form-item>
        <n-form-item label="Email Address" required>
          <n-input
            :value="formData.email"
            @update:value="updateField('email', $event)"
            type="email"
            placeholder="Enter email address"
            :disabled="isEditing"
          >
            <template #prefix>
              <n-icon><component :is="MailIcon" /></n-icon>
            </template>
          </n-input>
          <template #feedback v-if="isEditing">
            Email cannot be changed after user creation
          </template>
        </n-form-item>
      </div>

      <n-divider class="section-divider" />

      <!-- Role & Status -->
      <h3 class="section-title">
        <n-icon class="section-icon"><component :is="ShieldIcon" /></n-icon>
        Role & Permissions
      </h3>

      <div class="form-row">
        <n-form-item label="User Role" required>
          <n-select
            :value="formData.role"
            @update:value="updateField('role', $event)"
            :options="roles"
            placeholder="Select user role"
          />
        </n-form-item>
        <n-form-item label="Account Status" required>
          <n-select
            :value="formData.status"
            @update:value="updateField('status', $event)"
            :options="statuses"
            placeholder="Select account status"
          />
        </n-form-item>
        <n-form-item label="Email Verified">
          <n-switch
            :value="formData.verified"
            @update:value="updateField('verified', $event)"
          >
            <template #checked>
              Verified
            </template>
            <template #unchecked>
              Unverified
            </template>
          </n-switch>
        </n-form-item>
      </div>

      <n-divider class="section-divider" />

      <!-- Password Section -->
      <h3 class="section-title">
        <n-icon class="section-icon"><component :is="LockIcon" /></n-icon>
        Security Settings
      </h3>

      <div v-if="!isEditing" class="form-row">
        <n-form-item label="Password" required>
          <n-input
            :value="formData.password"
            @update:value="updateField('password', $event)"
            type="password"
            placeholder="Enter password"
            show-password-on="click"
          >
            <template #prefix>
              <n-icon><component :is="LockIcon" /></n-icon>
            </template>
          </n-input>
        </n-form-item>
        <n-form-item label="Confirm Password" required>
          <n-input
            :value="formData.confirmPassword"
            @update:value="updateField('confirmPassword', $event)"
            type="password"
            placeholder="Confirm password"
            show-password-on="click"
          >
            <template #prefix>
              <n-icon><component :is="LockIcon" /></n-icon>
            </template>
          </n-input>
        </n-form-item>
      </div>

      <div v-else>
        <n-card class="password-management">
          <div class="password-reset-section">
            <n-icon size="48" class="reset-icon"><component :is="LockIcon" /></n-icon>
            <h4 class="reset-title">Password Management</h4>
            <n-button v-if="isEditing" type="warning" ghost @click="$emit('reset-password')">
              <template #icon>
                <n-icon><component :is="LockIcon" /></n-icon>
              </template>
              Reset Password
            </n-button>
          </div>
        </n-card>
      </div>
    </n-form>
  </CustomDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NForm, NFormItem, NInput, NSelect, NSwitch, NAvatar, NIcon, NCard, NButton, NDivider } from 'naive-ui'
import { Person as PersonIcon, Mail as MailIcon, Shield as ShieldIcon, LockClosed as LockIcon, Image as ImageIcon } from '@vicons/ionicons5'
import CustomDialog from '@/components/dialog/CustomDialog.vue'

interface UserFormData {
  name: string
  email: string
  role: string
  status: string
  password: string
  profile_picture: string
  verified: boolean
  confirmPassword: string
}

interface Props {
  show: boolean
  formData: UserFormData
  isEditing: boolean
  roles: { label: string; value: string }[]
  statuses: { label: string; value: string }[]
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  'update:formData': [data: UserFormData]
  save: []
  cancel: []
  'reset-password': []
}>()

const getDefaultAvatar = (name: string) => {
  const initial = name ? name.charAt(0).toUpperCase() : 'U'
  return `https://toppng.com/uploads/preview/avatar-png-115540218987bthtxfhls.png?text=${initial}`
}

const updateField = (field: keyof UserFormData, value: any) => {
  const updatedData = { ...props.formData, [field]: value }
  // Emit the updated form data
  emit('update:formData', updatedData)
}

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
  (v: string) => /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(v) || 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
]

const confirmPasswordRules = computed(() => [
  (v: string) => !!v || 'Please confirm your password',
  (v: string) => v === props.formData.password || 'Passwords do not match'
])
</script>

<style scoped>
.profile-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.profile-avatar {
  margin-bottom: 16px;
}

.profile-input {
  width: 100%;
  max-width: 400px;
}

.input-hint {
  font-size: 12px;
  color: var(--n-text-color-3);
  margin-top: 4px;
  text-align: center;
}

.section-divider {
  margin: 24px 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--n-text-color);
}

.section-icon {
  color: var(--n-color-primary);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.password-management {
  padding: 24px;
  text-align: center;
}

.password-reset-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.reset-icon {
  color: var(--n-text-color-3);
}

.reset-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  color: var(--n-text-color);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .profile-section {
    padding: 0 16px;
  }
}
</style>