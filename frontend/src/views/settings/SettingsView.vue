<template>
  <div class="settings-view">
    <v-row class="mb-6">
      <v-col cols="12">
        <h1 class="text-h4 font-weight-bold mb-2">Settings</h1>
        <p class="text-subtitle-1 text-medium-emphasis">
          Manage your application preferences and configuration
        </p>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="8">
        <v-card rounded="lg" elevation="2">
          <v-card-text class="pa-0">
            <v-tabs v-model="activeTab" class="border-b">
              <v-tab value="general">General</v-tab>
              <v-tab value="appearance">Appearance</v-tab>
              <v-tab value="notifications">Notifications</v-tab>
              <v-tab value="security">Security</v-tab>
            </v-tabs>

            <v-tabs-window v-model="activeTab">
              <!-- General Settings -->
              <v-tabs-window-item value="general" class="pa-6">
                <h3 class="text-h6 mb-4">General Settings</h3>
                
                <v-form>
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="settings.general.siteName"
                        label="Site Name"
                        variant="outlined"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-text-field
                        v-model="settings.general.adminEmail"
                        label="Admin Email"
                        type="email"
                        variant="outlined"
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-textarea
                        v-model="settings.general.description"
                        label="Site Description"
                        variant="outlined"
                        rows="3"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-select
                        v-model="settings.general.timezone"
                        :items="timezones"
                        label="Timezone"
                        variant="outlined"
                      />
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-select
                        v-model="settings.general.language"
                        :items="languages"
                        label="Default Language"
                        variant="outlined"
                      />
                    </v-col>
                  </v-row>
                </v-form>
              </v-tabs-window-item>

              <!-- Appearance Settings -->
              <v-tabs-window-item value="appearance" class="pa-6">
                <h3 class="text-h6 mb-4">Appearance Settings</h3>
                
                <v-row>
                  <v-col cols="12" md="6">
                    <v-card variant="outlined" class="pa-4">
                      <h4 class="text-subtitle-1 mb-3">Theme</h4>
                      <v-radio-group v-model="settings.appearance.theme">
                        <v-radio label="Light" value="light" />
                        <v-radio label="Dark" value="dark" />
                        <v-radio label="System" value="system" />
                      </v-radio-group>
                    </v-card>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-card variant="outlined" class="pa-4">
                      <h4 class="text-subtitle-1 mb-3">Color Scheme</h4>
                      <div class="d-flex flex-wrap gap-2">
                        <v-btn
                          v-for="color in colorSchemes"
                          :key="color.name"
                          :color="color.value"
                          size="small"
                          variant="tonal"
                          @click="settings.appearance.primaryColor = color.value"
                          :class="{ 'v-btn--active': settings.appearance.primaryColor === color.value }"
                        >
                          {{ color.name }}
                        </v-btn>
                      </div>
                    </v-card>
                  </v-col>
                  <v-col cols="12">
                    <v-switch
                      v-model="settings.appearance.compactMode"
                      label="Compact Mode"
                      color="primary"
                      hide-details
                    />
                    <v-switch
                      v-model="settings.appearance.animations"
                      label="Enable Animations"
                      color="primary"
                      hide-details
                      class="mt-2"
                    />
                  </v-col>
                </v-row>
              </v-tabs-window-item>

              <!-- Notification Settings -->
              <v-tabs-window-item value="notifications" class="pa-6">
                <h3 class="text-h6 mb-4">Notification Settings</h3>
                
                <v-row>
                  <v-col cols="12">
                    <h4 class="text-subtitle-1 mb-3">Email Notifications</h4>
                    <v-switch
                      v-for="emailNotif in emailNotifications"
                      :key="emailNotif.key"
                      v-model="settings.notifications.email[emailNotif.key]"
                      :label="emailNotif.label"
                      :hint="emailNotif.description"
                      persistent-hint
                      color="primary"
                      class="mb-2"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-divider class="my-4" />
                    <h4 class="text-subtitle-1 mb-3">Push Notifications</h4>
                    <v-switch
                      v-for="pushNotif in pushNotifications"
                      :key="pushNotif.key"
                      v-model="settings.notifications.push[pushNotif.key]"
                      :label="pushNotif.label"
                      :hint="pushNotif.description"
                      persistent-hint
                      color="primary"
                      class="mb-2"
                    />
                  </v-col>
                </v-row>
              </v-tabs-window-item>

              <!-- Security Settings -->
              <v-tabs-window-item value="security" class="pa-6">
                <h3 class="text-h6 mb-4">Security Settings</h3>
                
                <v-row>
                  <v-col cols="12">
                    <v-card variant="outlined" class="pa-4 mb-4">
                      <h4 class="text-subtitle-1 mb-3">Two-Factor Authentication</h4>
                      <p class="text-body-2 text-medium-emphasis mb-3">
                        Add an extra layer of security to your account
                      </p>
                      <v-switch
                        v-model="settings.security.twoFactorEnabled"
                        label="Enable 2FA"
                        color="primary"
                        hide-details
                      />
                    </v-card>
                  </v-col>
                  <v-col cols="12">
                    <v-card variant="outlined" class="pa-4 mb-4">
                      <h4 class="text-subtitle-1 mb-3">Session Management</h4>
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="settings.security.sessionTimeout"
                            label="Session Timeout (minutes)"
                            type="number"
                            variant="outlined"
                          />
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-select
                            v-model="settings.security.maxConcurrentSessions"
                            :items="[1, 2, 3, 5, 10]"
                            label="Max Concurrent Sessions"
                            variant="outlined"
                          />
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>
                  <v-col cols="12">
                    <v-card variant="outlined" class="pa-4">
                      <h4 class="text-subtitle-1 mb-3">Password Policy</h4>
                      <v-switch
                        v-for="policy in passwordPolicies"
                        :key="policy.key"
                        v-model="settings.security.passwordPolicy[policy.key]"
                        :label="policy.label"
                        :hint="policy.description"
                        persistent-hint
                        color="primary"
                        class="mb-2"
                      />
                    </v-card>
                  </v-col>
                </v-row>
              </v-tabs-window-item>
            </v-tabs-window>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Settings Actions -->
      <v-col cols="12" lg="4">
        <v-card rounded="lg" elevation="2" class="mb-4">
          <v-card-title>Actions</v-card-title>
          <v-card-text>
            <v-btn
              color="primary"
              variant="flat"
              block
              class="mb-3"
              @click="saveSettings"
              :loading="saving"
            >
              Save Changes
            </v-btn>
            <v-btn
              variant="outlined"
              block
              class="mb-3"
              @click="resetSettings"
            >
              Reset to Defaults
            </v-btn>
            <v-btn
              variant="outlined"
              block
              @click="exportSettings"
            >
              Export Settings
            </v-btn>
          </v-card-text>
        </v-card>

        <v-card rounded="lg" elevation="2">
          <v-card-title>System Information</v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title>Version</v-list-item-title>
                <template #append>
                  <span class="text-caption">v1.0.0</span>
                </template>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Last Updated</v-list-item-title>
                <template #append>
                  <span class="text-caption">Jan 15, 2024</span>
                </template>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>Database</v-list-item-title>
                <template #append>
                  <v-chip color="success" size="x-small">Connected</v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useTheme } from 'vuetify'
import { useNotificationStore } from '@/stores/notifications'
import { useThemeStore } from '@/stores/theme'

interface PasswordPolicy {
  requireUppercase: boolean
  requireNumbers: boolean
  requireSymbols: boolean
  minLength: number
}

interface EmailNotifications {
  newUsers: boolean
  systemUpdates: boolean
  securityAlerts: boolean
  reports: boolean
}

interface PushNotifications {
  realTime: boolean
  mentions: boolean
  reminders: boolean
  marketing: boolean
}

interface PolicyItem {
  key: keyof PasswordPolicy
  label: string
  description: string
}

interface EmailNotificationItem {
  key: keyof EmailNotifications
  label: string
  description: string
}

interface PushNotificationItem {
  key: keyof PushNotifications
  label: string
  description: string
}

const notificationStore = useNotificationStore()
const themeStore = useThemeStore()
const theme = useTheme()

const activeTab = ref('general')
const saving = ref(false)

const settings = ref({
  general: {
    siteName: 'Vue Admin Dashboard',
    adminEmail: 'admin@example.com',
    description: 'A modern Vue 3 admin dashboard',
    timezone: 'UTC',
    language: 'en'
  },
  appearance: {
    theme: 'light',
    primaryColor: 'primary',
    compactMode: false,
    animations: true
  },
  notifications: {
    email: {
      newUsers: true,
      systemUpdates: true,
      securityAlerts: true,
      reports: false
    },
    push: {
      realTime: true,
      mentions: true,
      reminders: true,
      marketing: false
    }
  },
  security: {
    twoFactorEnabled: false,
    sessionTimeout: 60,
    maxConcurrentSessions: 3,
    passwordPolicy: {
      requireUppercase: true,
      requireNumbers: true,
      requireSymbols: false,
      minLength: 8
    }
  }
})

const timezones = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo'
]

const languages = [
  { title: 'English', value: 'en' },
  { title: 'Spanish', value: 'es' },
  { title: 'French', value: 'fr' },
  { title: 'German', value: 'de' }
]

const colorSchemes = [
  { name: 'Blue', value: 'primary' },
  { name: 'Green', value: 'success' },
  { name: 'Orange', value: 'warning' },
  { name: 'Red', value: 'error' },
  { name: 'Purple', value: 'secondary' }
]

const emailNotifications: EmailNotificationItem[] = [
  {
    key: 'newUsers',
    label: 'New User Registrations',
    description: 'Get notified when new users sign up'
  },
  {
    key: 'systemUpdates',
    label: 'System Updates',
    description: 'Receive notifications about system maintenance'
  },
  {
    key: 'securityAlerts',
    label: 'Security Alerts',
    description: 'Important security notifications'
  },
  {
    key: 'reports',
    label: 'Weekly Reports',
    description: 'Automated weekly analytics reports'
  }
]

const pushNotifications: PushNotificationItem[] = [
  {
    key: 'realTime',
    label: 'Real-time Updates',
    description: 'Instant notifications for important events'
  },
  {
    key: 'mentions',
    label: 'Mentions',
    description: 'When someone mentions you'
  },
  {
    key: 'reminders',
    label: 'Reminders',
    description: 'Task and event reminders'
  },
  {
    key: 'marketing',
    label: 'Marketing Updates',
    description: 'Product updates and promotions'
  }
]

const passwordPolicies: PolicyItem[] = [
  {
    key: 'requireUppercase',
    label: 'Require Uppercase Letters',
    description: 'Password must contain at least one uppercase letter'
  },
  {
    key: 'requireNumbers',
    label: 'Require Numbers',
    description: 'Password must contain at least one number'
  },
  {
    key: 'requireSymbols',
    label: 'Require Symbols',
    description: 'Password must contain at least one special character'
  },
  {
    key: 'minLength',
    label: 'Minimum Length (8 characters)',
    description: 'Password must be at least 8 characters long'
  }
]

const saveSettings = async () => {
  saving.value = true
  
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    notificationStore.showSuccess('Your settings have been updated successfully', 'Settings Saved')
  } catch (error) {
    notificationStore.showError('Failed to save settings')
  } finally {
    saving.value = false
  }
}

const resetSettings = () => {
  if (confirm('Are you sure you want to reset all settings to defaults?')) {
    // Reset logic would go here
    notificationStore.showInfo('All settings have been reset to defaults', 'Settings Reset')
  }
}

const exportSettings = () => {
  const dataStr = JSON.stringify(settings.value, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'settings.json'
  link.click()
  
  notificationStore.showSuccess('Your settings have been exported successfully', 'Settings Exported')
}

// Watch for theme changes and sync with theme store
watch(
  () => settings.value.appearance.theme,
  (newTheme) => {
    if (newTheme && ['light', 'dark', 'system'].includes(newTheme)) {
      themeStore.setTheme(newTheme as 'light' | 'dark' | 'system', theme)
    }
  }
)

// Initialize settings with current theme from store
onMounted(() => {
  settings.value.appearance.theme = themeStore.mode
})
</script>

