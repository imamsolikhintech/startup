<template>
  <CustomDialog :show="show" :max-width="800" :persistent="true"
    :title="isEditing ? 'Edit User Profile' : 'Create New User'"
    :subtitle="isEditing ? 'Update user information and settings' : 'Add a new user to the system'"
    :header-icon="isEditing ? 'mdi-account-edit' : 'mdi-account-plus'" header-icon-color="primary" :loading="loading"
    confirm-button-text="Save User" cancel-button-text="Cancel" @update:show="$emit('update:show', $event)"
    @confirm="$emit('save')" @cancel="$emit('cancel')" @close="$emit('cancel')"
    header-class="bg-gradient-primary text-white">
    <v-form ref="userForm">
      <!-- Profile Picture Section -->
      <div class="text-center mb-6">
        <v-avatar size="120" class="mb-4 elevation-4">
          <v-img :src="formData.profile_picture || getDefaultAvatar(formData.name)" :alt="formData.name" />
        </v-avatar>
        <div>
          <v-text-field :model-value="formData.profile_picture"
            @update:model-value="updateField('profile_picture', $event)" label="Profile Picture URL" variant="outlined"
            prepend-inner-icon="mdi-image" placeholder="https://example.com/avatar.jpg" hide-details class="mb-2" />
          <p class="text-caption text-medium-emphasis">
            Enter a valid image URL for the user's profile picture
          </p>
        </div>
      </div>

      <v-divider class="mb-6"></v-divider>

      <!-- Basic Information -->
      <h3 class="text-h6 mb-4 text-primary">
        <v-icon class="me-2">mdi-account-details</v-icon>
        Basic Information
      </h3>

      <v-row>
        <v-col cols="12" md="6">
          <v-text-field :model-value="formData.name" @update:model-value="updateField('name', $event)" label="Full Name"
            variant="outlined" prepend-inner-icon="mdi-account" :rules="nameRules" required color="primary" />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field :model-value="formData.email" @update:model-value="updateField('email', $event)"
            label="Email Address" type="email" variant="outlined" prepend-inner-icon="mdi-email" :rules="emailRules"
            :disabled="isEditing"
            :hint="isEditing ? 'Email cannot be changed after user creation' : 'Enter a valid email address'"
            persistent-hint required color="primary" />
        </v-col>
      </v-row>

      <v-divider class="my-6"></v-divider>

      <!-- Role & Status -->
      <h3 class="text-h6 mb-4 text-primary">
        <v-icon class="me-2">mdi-shield-account</v-icon>
        Role & Permissions
      </h3>

      <v-row>
        <v-col cols="12" md="4">
          <v-select :model-value="formData.role" @update:model-value="updateField('role', $event)" :items="roles"
            label="User Role" variant="outlined" prepend-inner-icon="mdi-account-key"
            :rules="[v => !!v || 'Role is required']" required color="primary" />
        </v-col>
        <v-col cols="12" md="4">
          <v-select :model-value="formData.status" @update:model-value="updateField('status', $event)" :items="statuses"
            label="Account Status" variant="outlined" prepend-inner-icon="mdi-account-check"
            :rules="[v => !!v || 'Status is required']" required color="primary" />
        </v-col>
        <v-col cols="12" md="4">
          <v-switch :model-value="formData.verified" @update:model-value="updateField('verified', $event)"
            label="Email Verified" color="success" inset
            :prepend-icon="formData.verified ? 'mdi-check-circle' : 'mdi-clock-outline'" hide-details />
        </v-col>
      </v-row>

      <v-divider class="my-6"></v-divider>

      <!-- Password Section -->
      <h3 class="text-h6 mb-4 text-primary">
        <v-icon class="me-2">mdi-lock</v-icon>
        Security Settings
      </h3>

      <div v-if="!isEditing">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field :model-value="formData.password" @update:model-value="updateField('password', $event)"
              label="Password" type="password" variant="outlined" prepend-inner-icon="mdi-lock" :rules="passwordRules"
              required color="primary" />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field :model-value="formData.confirmPassword"
              @update:model-value="updateField('confirmPassword', $event)" label="Confirm Password" type="password"
              variant="outlined" prepend-inner-icon="mdi-lock-check" :rules="confirmPasswordRules" required
              color="primary" />
          </v-col>
        </v-row>
      </div>

      <div v-else>
        <v-card variant="outlined" class="pa-4">
          <div class="text-center">
            <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-lock</v-icon>
            <h4 class="text-subtitle-1 mb-1">Password Management</h4>
            <v-btn v-if="isEditing" color="warning" variant="outlined" prepend-icon="mdi-lock-reset"
              @click="$emit('reset-password')">
              Reset Password
            </v-btn>
            <v-spacer />
          </div>
        </v-card>
      </div>
    </v-form>

    <template #footer>
      <v-card-actions class="pa-4">
        <v-btn variant="outlined" @click="$emit('cancel')" size="large">
          Cancel
        </v-btn>
        <v-btn color="primary" @click="$emit('save')" :loading="loading" size="large" class="px-8">
          <v-icon class="me-2">
            {{ isEditing ? 'mdi-content-save' : 'mdi-plus' }}
          </v-icon>
          {{ isEditing ? 'Update User' : 'Create User' }}
        </v-btn>
      </v-card-actions>
    </template>
  </CustomDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
  roles: string[]
  statuses: string[]
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
.bg-gradient-primary {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%);
}
</style>