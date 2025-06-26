<template>
  <div class="profile-view">
    <v-row class="mb-6">
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-2">Profile</h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          Manage your personal information and preferences
        </p>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="4">
        <!-- Profile Card -->
        <v-card rounded="lg" elevation="2" class="mb-4">
          <v-card-text class="text-center pa-6">
            <v-avatar size="120" class="mb-4">
              <v-img :src="authStore.user?.avatar" alt="Profile Picture" />
            </v-avatar>
            
            <h3 class="text-h5 font-weight-bold mb-1">{{ authStore.user?.name }}</h3>
            <p class="text-subtitle-1 text-medium-emphasis mb-3">{{ authStore.user?.email }}</p>
            
            <v-chip
              :color="getRoleColor(authStore.user?.role)"
              variant="tonal"
              class="mb-4"
            >
              {{ authStore.user?.role }}
            </v-chip>
            
            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="mdi-camera"
              @click="changeAvatar"
              block
            >
              Change Photo
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- Quick Stats -->
        <v-card rounded="lg" elevation="2">
          <v-card-title>Activity Stats</v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item>
                <template #prepend>
                  <v-icon color="primary">mdi-login</v-icon>
                </template>
                <v-list-item-title>Last Login</v-list-item-title>
                <template #append>
                  <span class="text-caption">2 hours ago</span>
                </template>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon color="success">mdi-check-circle</v-icon>
                </template>
                <v-list-item-title>Tasks Completed</v-list-item-title>
                <template #append>
                  <span class="text-caption">47</span>
                </template>
              </v-list-item>
              <v-list-item>
                <template #prepend>
                  <v-icon color="info">mdi-calendar</v-icon>
                </template>
                <v-list-item-title>Member Since</v-list-item-title>
                <template #append>
                  <span class="text-caption">Jan 2024</span>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" lg="8">
        <v-card rounded="lg" elevation="2">
          <v-card-text class="pa-0">
            <v-tabs v-model="activeTab" class="border-b">
              <v-tab value="personal">Personal Info</v-tab>
              <v-tab value="security">Security</v-tab>
              <v-tab value="preferences">Preferences</v-tab>
            </v-tabs>

            <v-tabs-window v-model="activeTab">
              <!-- Personal Information -->
              <v-tabs-window-item value="personal" class="pa-6">
                <h3 class="text-h6 mb-4">Personal Information</h3>
                
                <v-form ref="personalForm">
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="profileData.firstName"
                        label="First Name"
                        variant="outlined"
                        :rules="nameRules"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="profileData.lastName"
                        label="Last Name"
                        variant="outlined"
                        :rules="nameRules"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="profileData.email"
                        label="Email Address"
                        type="email"
                        variant="outlined"
                        :rules="emailRules"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="profileData.phone"
                        label="Phone Number"
                        variant="outlined"
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-text-field
                        v-model="profileData.jobTitle"
                        label="Job Title"
                        variant="outlined"
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-textarea
                        v-model="profileData.bio"
                        label="Bio"
                        variant="outlined"
                        rows="3"
                        counter="500"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="profileData.location"
                        label="Location"
                        variant="outlined"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="profileData.website"
                        label="Website"
                        variant="outlined"
                      />
                    </v-col>
                  </v-row>
                </v-form>
              </v-tabs-window-item>

              <!-- Security Settings -->
              <v-tabs-window-item value="security" class="pa-6">
                <h3 class="text-h6 mb-4">Security Settings</h3>
                
                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="text-subtitle-1">Change Password</v-card-title>
                  <v-card-text>
                    <v-form ref="passwordForm">
                      <v-text-field
                        v-model="passwordData.current"
                        label="Current Password"
                        type="password"
                        variant="outlined"
                        class="mb-3"
                        :rules="[v => !!v || 'Current password is required']"
                      />
                      <v-text-field
                        v-model="passwordData.new"
                        label="New Password"
                        type="password"
                        variant="outlined"
                        class="mb-3"
                        :rules="passwordRules"
                      />
                      <v-text-field
                        v-model="passwordData.confirm"
                        label="Confirm New Password"
                        type="password"
                        variant="outlined"
                        :rules="confirmPasswordRules"
                      />
                    </v-form>
                    <v-btn
                      color="primary"
                      @click="changePassword"
                      :loading="changingPassword"
                      class="mt-3"
                    >
                      Update Password
                    </v-btn>
                  </v-card-text>
                </v-card>

                <v-card variant="outlined" class="mb-4">
                  <v-card-title class="text-subtitle-1">Two-Factor Authentication</v-card-title>
                  <v-card-text>
                    <div class="d-flex align-center justify-space-between">
                      <div>
                        <p class="text-body-2 mb-1">Secure your account with 2FA</p>
                        <p class="text-caption text-medium-emphasis">
                          {{ twoFactorEnabled ? 'Two-factor authentication is enabled' : 'Add an extra layer of security' }}
                        </p>
                      </div>
                      <v-switch
                        v-model="twoFactorEnabled"
                        color="primary"
                        hide-details
                        @change="toggle2FA"
                      />
                    </div>
                  </v-card-text>
                </v-card>

                <v-card variant="outlined">
                  <v-card-title class="text-subtitle-1">Active Sessions</v-card-title>
                  <v-card-text>
                    <v-list>
                      <v-list-item
                        v-for="session in activeSessions"
                        :key="session.id"
                      >
                        <template #prepend>
                          <v-icon :color="session.current ? 'success' : 'primary'">
                            {{ session.device === 'desktop' ? 'mdi-monitor' : 'mdi-cellphone' }}
                          </v-icon>
                        </template>
                        <v-list-item-title>{{ session.location }}</v-list-item-title>
                        <v-list-item-subtitle>
                          {{ session.device }} • {{ session.lastActive }}
                          <v-chip v-if="session.current" size="x-small" color="success" class="ml-2">
                            Current
                          </v-chip>
                        </v-list-item-subtitle>
                        <template #append v-if="!session.current">
                          <v-btn
                            icon="mdi-close"
                            size="small"
                            variant="text"
                            @click="terminateSession(session.id)"
                          />
                        </template>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>
              </v-tabs-window-item>

              <!-- Preferences -->
              <v-tabs-window-item value="preferences" class="pa-6">
                <h3 class="text-h6 mb-4">Preferences</h3>
                
                <v-row>
                  <v-col cols="12" md="6">
                    <v-card variant="outlined" class="pa-4">
                      <h4 class="text-subtitle-1 mb-3">Language & Region</h4>
                      <v-select
                        v-model="preferences.language"
                        :items="languages"
                        label="Language"
                        variant="outlined"
                        class="mb-3"
                      />
                      <v-select
                        v-model="preferences.timezone"
                        :items="timezones"
                        label="Timezone"
                        variant="outlined"
                      />
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-card variant="outlined" class="pa-4">
                      <h4 class="text-subtitle-1 mb-3">Notifications</h4>
                      <v-switch
                        v-model="preferences.emailNotifications"
                        label="Email Notifications"
                        color="primary"
                        hide-details
                        class="mb-2"
                      />
                      <v-switch
                        v-model="preferences.pushNotifications"
                        label="Push Notifications"
                        color="primary"
                        hide-details
                        class="mb-2"
                      />
                      <v-switch
                        v-model="preferences.marketingEmails"
                        label="Marketing Emails"
                        color="primary"
                        hide-details
                      />
                    </v-card>
                  </v-col>
                  <v-col cols="12">
                    <v-card variant="outlined" class="pa-4">
                      <h4 class="text-subtitle-1 mb-3">Privacy</h4>
                      <v-switch
                        v-model="preferences.profileVisibility"
                        label="Make profile public"
                        color="primary"
                        hide-details
                        class="mb-2"
                      />
                      <v-switch
                        v-model="preferences.activityTracking"
                        label="Allow activity tracking"
                        color="primary"
                        hide-details
                        class="mb-2"
                      />
                      <v-switch
                        v-model="preferences.dataSharing"
                        label="Share usage data for improvements"
                        color="primary"
                        hide-details
                      />
                    </v-card>
                  </v-col>
                </v-row>
              </v-tabs-window-item>
            </v-tabs-window>
          </v-card-text>
        </v-card>

        <!-- Save Button -->
        <div class="text-right mt-4">
          <v-btn
            color="primary"
            size="large"
            @click="saveProfile"
            :loading="saving"
          >
            Save Changes
          </v-btn>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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
  { title: 'English', value: 'en' },
  { title: 'Spanish', value: 'es' },
  { title: 'French', value: 'fr' },
  { title: 'German', value: 'de' }
]

const timezones = [
  'America/Los_Angeles',
  'America/New_York',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo'
]

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
  (v: string) => v.length >= 8 || 'Password must be at least 8 characters'
]

const confirmPasswordRules = [
  (v: string) => !!v || 'Please confirm your password',
  (v: string) => v === passwordData.value.new || 'Passwords do not match'
]

const getRoleColor = (role?: string) => {
  const colors: Record<string, string> = {
    admin: 'error',
    moderator: 'warning',
    user: 'primary'
  }
  return colors[role || 'user'] || 'primary'
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

<style scoped>
.profile-view {
  max-width: 100%;
}

:deep(.v-tabs-window-item) {
  padding: 0;
}

:deep(.v-switch) {
  margin-bottom: 8px;
}
</style>