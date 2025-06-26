<template>
  <div class="profile-view">
    <div class="mb-6">
      <div>
        <h1 class="text-2xl font-bold mb-2">Profile</h1>
        <p class="text-gray-600">
          Manage your personal information and preferences
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-4">
        <!-- Profile Card -->
        <n-card class="mb-4" :bordered="false">
          <div class="text-center p-6">
            <n-avatar
              :size="120"
              class="mb-4"
              :src="authStore.user?.avatar"
            />
            
            <h3 class="text-xl font-bold mb-1">{{ authStore.user?.name }}</h3>
            <p class="text-gray-600 mb-3">{{ authStore.user?.email }}</p>
            
            <n-tag
              :type="getRoleType(authStore.user?.role)"
              class="mb-4"
            >
              {{ authStore.user?.role }}
            </n-tag>
            
            <n-button
              type="primary"
              ghost
              @click="changeAvatar"
              block
            >
              <template #icon>
                <n-icon><Camera /></n-icon>
              </template>
              Change Photo
            </n-button>
          </div>
        </n-card>

        <!-- Quick Stats -->
        <n-card :bordered="false">
          <template #header>
            <span class="text-lg font-semibold">Activity Stats</span>
          </template>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <n-icon size="20" color="#18a058">
                  <LogIn />
                </n-icon>
                <span>Last Login</span>
              </div>
              <span class="text-sm text-gray-500">2 hours ago</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <n-icon size="20" color="#18a058">
                  <CheckCircle />
                </n-icon>
                <span>Tasks Completed</span>
              </div>
              <span class="text-sm text-gray-500">47</span>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <n-icon size="20" color="#2080f0">
                  <Calendar />
                </n-icon>
                <span>Member Since</span>
              </div>
              <span class="text-sm text-gray-500">Jan 2024</span>
            </div>
          </div>
        </n-card>
      </div>

      <div class="lg:col-span-8">
        <n-card :bordered="false">
          <n-tabs v-model:value="activeTab" type="line">
            <n-tab-pane name="personal" tab="Personal Info">
              <div class="p-6">
                <h3 class="text-lg font-semibold mb-4">Personal Information</h3>
                
                <n-form ref="personalForm" :model="profileData" :rules="formRules">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <n-form-item label="First Name" path="firstName">
                      <n-input
                        v-model:value="profileData.firstName"
                        placeholder="Enter first name"
                      />
                    </n-form-item>
                    <n-form-item label="Last Name" path="lastName">
                      <n-input
                        v-model:value="profileData.lastName"
                        placeholder="Enter last name"
                      />
                    </n-form-item>
                    <n-form-item label="Email Address" path="email">
                      <n-input
                        v-model:value="profileData.email"
                        type="email"
                        placeholder="Enter email address"
                      />
                    </n-form-item>
                    <n-form-item label="Phone Number">
                      <n-input
                        v-model:value="profileData.phone"
                        placeholder="Enter phone number"
                      />
                    </n-form-item>
                  </div>
                  <n-form-item label="Job Title">
                    <n-input
                      v-model:value="profileData.jobTitle"
                      placeholder="Enter job title"
                    />
                  </n-form-item>
                  <n-form-item label="Bio">
                    <n-input
                      v-model:value="profileData.bio"
                      type="textarea"
                      :rows="3"
                      :maxlength="500"
                      show-count
                      placeholder="Tell us about yourself"
                    />
                  </n-form-item>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <n-form-item label="Location">
                      <n-input
                        v-model:value="profileData.location"
                        placeholder="Enter location"
                      />
                    </n-form-item>
                    <n-form-item label="Website">
                      <n-input
                        v-model:value="profileData.website"
                        placeholder="Enter website URL"
                      />
                    </n-form-item>
                  </div>
                </n-form>
              </div>
            </n-tab-pane>

            <n-tab-pane name="security" tab="Security">
              <div class="p-6">
                <h3 class="text-lg font-semibold mb-4">Security Settings</h3>
                
                <n-card class="mb-4" :bordered="true">
                  <template #header>
                    <span class="text-base font-medium">Change Password</span>
                  </template>
                  <n-form ref="passwordForm" :model="passwordData">
                    <n-form-item label="Current Password" class="mb-4">
                      <n-input
                        v-model:value="passwordData.current"
                        type="password"
                        placeholder="Enter current password"
                        show-password-on="click"
                      />
                    </n-form-item>
                    <n-form-item label="New Password" class="mb-4">
                      <n-input
                        v-model:value="passwordData.new"
                        type="password"
                        placeholder="Enter new password"
                        show-password-on="click"
                      />
                    </n-form-item>
                    <n-form-item label="Confirm New Password" class="mb-4">
                      <n-input
                        v-model:value="passwordData.confirm"
                        type="password"
                        placeholder="Confirm new password"
                        show-password-on="click"
                      />
                    </n-form-item>
                  </n-form>
                  <n-button
                    type="primary"
                    @click="changePassword"
                    :loading="changingPassword"
                    class="mt-3"
                  >
                    Update Password
                  </n-button>
                </n-card>

                <n-card class="mb-4" :bordered="true">
                  <template #header>
                    <span class="text-base font-medium">Two-Factor Authentication</span>
                  </template>
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm mb-1">Secure your account with 2FA</p>
                      <p class="text-xs text-gray-500">
                        {{ twoFactorEnabled ? 'Two-factor authentication is enabled' : 'Add an extra layer of security' }}
                      </p>
                    </div>
                    <n-switch
                      v-model:value="twoFactorEnabled"
                      @update:value="toggle2FA"
                    />
                  </div>
                </n-card>

                <n-card :bordered="true">
                  <template #header>
                    <span class="text-base font-medium">Active Sessions</span>
                  </template>
                  <div class="space-y-4">
                    <div
                      v-for="session in activeSessions"
                      :key="session.id"
                      class="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div class="flex items-center space-x-3">
                        <n-icon
                          size="20"
                          :color="session.current ? '#18a058' : '#2080f0'"
                        >
                          <Monitor v-if="session.device === 'desktop'" />
                          <Phone v-else />
                        </n-icon>
                        <div>
                          <div class="font-medium">{{ session.location }}</div>
                          <div class="text-sm text-gray-500 flex items-center space-x-2">
                            <span>{{ session.device }} • {{ session.lastActive }}</span>
                            <n-tag v-if="session.current" type="success" size="small">
                              Current
                            </n-tag>
                          </div>
                        </div>
                      </div>
                      <n-button
                        v-if="!session.current"
                        quaternary
                        circle
                        type="error"
                        @click="terminateSession(session.id)"
                      >
                        <template #icon>
                          <n-icon><Close /></n-icon>
                        </template>
                      </n-button>
                    </div>
                  </div>
                </n-card>
              </div>
            </n-tab-pane>

            <n-tab-pane name="preferences" tab="Preferences">
              <div class="p-6">
                <h3 class="text-lg font-semibold mb-4">Preferences</h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <n-card :bordered="true" class="p-4">
                    <h4 class="text-base font-medium mb-3">Language & Region</h4>
                    <div class="space-y-4">
                      <n-form-item label="Language">
                        <n-select
                          v-model:value="preferences.language"
                          :options="languages"
                          placeholder="Select language"
                        />
                      </n-form-item>
                      <n-form-item label="Timezone">
                        <n-select
                          v-model:value="preferences.timezone"
                          :options="timezoneOptions"
                          placeholder="Select timezone"
                        />
                      </n-form-item>
                    </div>
                  </n-card>
                  <n-card :bordered="true" class="p-4">
                    <h4 class="text-base font-medium mb-3">Notifications</h4>
                    <div class="space-y-3">
                      <div class="flex items-center justify-between">
                        <span>Email Notifications</span>
                        <n-switch v-model:value="preferences.emailNotifications" />
                      </div>
                      <div class="flex items-center justify-between">
                        <span>Push Notifications</span>
                        <n-switch v-model:value="preferences.pushNotifications" />
                      </div>
                      <div class="flex items-center justify-between">
                        <span>Marketing Emails</span>
                        <n-switch v-model:value="preferences.marketingEmails" />
                      </div>
                    </div>
                  </n-card>
                </div>
                <n-card :bordered="true" class="p-4 mt-6">
                  <h4 class="text-base font-medium mb-3">Privacy</h4>
                  <div class="space-y-3">
                    <div class="flex items-center justify-between">
                      <span>Make profile public</span>
                      <n-switch v-model:value="preferences.profileVisibility" />
                    </div>
                    <div class="flex items-center justify-between">
                      <span>Allow activity tracking</span>
                      <n-switch v-model:value="preferences.activityTracking" />
                    </div>
                    <div class="flex items-center justify-between">
                      <span>Share usage data for improvements</span>
                      <n-switch v-model:value="preferences.dataSharing" />
                    </div>
                  </div>
                </n-card>
              </div>
            </n-tab-pane>
          </n-tabs>
        </n-card>

        <!-- Save Button -->
        <div class="text-right mt-4">
          <n-button
            type="primary"
            size="large"
            @click="saveProfile"
            :loading="saving"
          >
            Save Changes
          </n-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  NCard, 
  NAvatar, 
  NTag, 
  NButton, 
  NIcon, 
  NTabs, 
  NTabPane, 
  NForm, 
  NFormItem, 
  NInput, 
  NSelect, 
  NSwitch 
} from 'naive-ui'
import { 
  Camera, 
  LogIn, 
  CheckCircle, 
  Calendar, 
  Monitor, 
  Phone, 
  Close 
} from '@vicons/ionicons5'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'

const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const activeTab = ref('personal')
const saving = ref(false)
const changingPassword = ref(false)
const twoFactorEnabled = ref(false)

const profileData = ref({
  firstName: 'John',
  lastName: 'Doe',
  email: authStore.user?.email || '',
  phone: '+1 (555) 123-4567',
  jobTitle: 'Senior Developer',
  bio: 'Passionate developer with 5+ years of experience in Vue.js and modern web technologies.',
  location: 'San Francisco, CA',
  website: 'https://johndoe.dev'
})

const passwordData = ref({
  current: '',
  new: '',
  confirm: ''
})

const preferences = ref({
  language: 'en',
  timezone: 'America/Los_Angeles',
  emailNotifications: true,
  pushNotifications: true,
  marketingEmails: false,
  profileVisibility: true,
  activityTracking: true,
  dataSharing: false
})

const activeSessions = ref([
  {
    id: 1,
    location: 'San Francisco, CA',
    device: 'desktop',
    lastActive: '2 hours ago',
    current: true
  },
  {
    id: 2,
    location: 'New York, NY',
    device: 'mobile',
    lastActive: '1 day ago',
    current: false
  }
])

const languages = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' }
]

const timezoneOptions = [
  { label: 'Pacific Time (Los Angeles)', value: 'America/Los_Angeles' },
  { label: 'Eastern Time (New York)', value: 'America/New_York' },
  { label: 'Greenwich Mean Time (London)', value: 'Europe/London' },
  { label: 'Central European Time (Paris)', value: 'Europe/Paris' },
  { label: 'Japan Standard Time (Tokyo)', value: 'Asia/Tokyo' }
]

const formRules = {
  firstName: {
    required: true,
    message: 'First name is required',
    trigger: ['blur', 'input']
  },
  lastName: {
    required: true,
    message: 'Last name is required',
    trigger: ['blur', 'input']
  },
  email: [
    {
      required: true,
      message: 'Email is required',
      trigger: ['blur', 'input']
    },
    {
      type: 'email',
      message: 'Please enter a valid email',
      trigger: ['blur', 'input']
    }
  ]
}

const getRoleType = (role?: string) => {
  const types: Record<string, 'error' | 'warning' | 'info' | 'success'> = {
    admin: 'error',
    moderator: 'warning',
    user: 'info'
  }
  return types[role || 'user'] || 'info'
}

const changeAvatar = () => {
  notificationStore.showInfo('Avatar upload functionality will be available soon', 'Feature Coming Soon')
}

const changePassword = async () => {
  changingPassword.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    passwordData.value = { current: '', new: '', confirm: '' }
    
    notificationStore.showSuccess('Your password has been changed successfully', 'Password Updated')
  } catch (error) {
    notificationStore.showError('Failed to update password')
  } finally {
    changingPassword.value = false
  }
}

const toggle2FA = () => {
  notificationStore.showSuccess(`Two-factor authentication has been ${twoFactorEnabled.value ? 'enabled' : 'disabled'}`, twoFactorEnabled.value ? '2FA Enabled' : '2FA Disabled')
}

const terminateSession = (sessionId: number) => {
  const index = activeSessions.value.findIndex(s => s.id === sessionId)
  if (index > -1) {
    activeSessions.value.splice(index, 1)
    notificationStore.showSuccess('The session has been terminated successfully', 'Session Terminated')
  }
}

const saveProfile = async () => {
  saving.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    notificationStore.showSuccess('Your profile has been saved successfully', 'Profile Updated')
  } catch (error) {
    notificationStore.showError('Failed to save profile')
  } finally {
    saving.value = false
  }
}
</script>

