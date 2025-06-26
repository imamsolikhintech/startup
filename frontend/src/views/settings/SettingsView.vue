<template>
  <div class="settings-view">
    <div class="header-section mb-6">
      <h1 class="text-2xl font-bold mb-2">Settings</h1>
      <p class="text-gray-600">
        Manage your application preferences and configuration
      </p>
    </div>

    <div class="settings-layout">
      <div class="settings-main">
        <n-card>
          <n-tabs v-model:value="activeTab" type="line">
            <n-tab-pane name="general" tab="General">
              <div class="tab-content">
                <h3 class="text-lg font-semibold mb-4">General Settings</h3>
                
                <div class="form-grid">
                  <div class="form-row">
                    <n-form-item label="Site Name">
                      <n-input
                        v-model:value="settings.general.siteName"
                        placeholder="Enter site name"
                      />
                    </n-form-item>
                    <n-form-item label="Admin Email">
                      <n-input
                        v-model:value="settings.general.adminEmail"
                        type="email"
                        placeholder="Enter admin email"
                      />
                    </n-form-item>
                  </div>
                  <n-form-item label="Site Description">
                    <n-input
                      v-model:value="settings.general.description"
                      type="textarea"
                      :rows="3"
                      placeholder="Enter site description"
                    />
                  </n-form-item>
                  <div class="form-row">
                    <n-form-item label="Timezone">
                      <n-select
                        v-model:value="settings.general.timezone"
                        :options="timezoneOptions"
                        placeholder="Select timezone"
                      />
                    </n-form-item>
                    <n-form-item label="Default Language">
                      <n-select
                        v-model:value="settings.general.language"
                        :options="languages"
                        placeholder="Select language"
                      />
                    </n-form-item>
                  </div>
                </div>
              </div>
            </n-tab-pane>

            <n-tab-pane name="appearance" tab="Appearance">
              <div class="tab-content">
                <h3 class="text-lg font-semibold mb-4">Appearance Settings</h3>
                
                <div class="appearance-grid">
                  <n-card class="theme-card">
                    <div class="theme-header">
                      <h4 class="text-base font-medium mb-3">Theme</h4>
                      <ThemeToggle size="small" />
                    </div>
                    <n-radio-group v-model:value="themeStore.mode" @update:value="handleThemeChange">
                      <n-radio value="light" label="Light Theme" />
                      <n-radio value="dark" label="Dark Theme" />
                      <n-radio value="system" label="System Theme" />
                    </n-radio-group>
                    <div class="theme-preview mt-4">
                      <p class="text-sm text-gray-600">
                        Current theme: <strong>{{ currentThemeLabel }}</strong>
                      </p>
                    </div>
                  </n-card>
                  
                  <n-card class="color-card">
                    <h4 class="text-base font-medium mb-3">Color Scheme</h4>
                    <div class="color-buttons">
                      <n-button
                        v-for="color in colorSchemes"
                        :key="color.name"
                        :type="settings.appearance.primaryColor === color.value ? 'primary' : 'default'"
                        size="small"
                        @click="settings.appearance.primaryColor = color.value"
                        class="color-btn"
                      >
                        {{ color.name }}
                      </n-button>
                    </div>
                  </n-card>
                  
                  <div class="switches-section">
                    <n-switch
                      v-model:value="settings.appearance.compactMode"
                    >
                      <template #checked>Compact Mode</template>
                      <template #unchecked>Compact Mode</template>
                    </n-switch>
                    <n-switch
                      v-model:value="settings.appearance.animations"
                      class="mt-3"
                    >
                      <template #checked>Enable Animations</template>
                      <template #unchecked>Enable Animations</template>
                    </n-switch>
                  </div>
                </div>
              </div>
            </n-tab-pane>

            <n-tab-pane name="notifications" tab="Notifications">
              <div class="tab-content">
                <h3 class="text-lg font-semibold mb-4">Notification Settings</h3>
                
                <div class="notifications-section">
                  <h4 class="text-base font-medium mb-3">Email Notifications</h4>
                  <div class="notification-item" v-for="emailNotif in emailNotifications" :key="emailNotif.key">
                    <div class="notification-content">
                      <div class="notification-label">{{ emailNotif.label }}</div>
                      <div class="notification-description">{{ emailNotif.description }}</div>
                    </div>
                    <n-switch 
                      :value="settings.notifications.email[emailNotif.key]"
                      @update:value="(value) => settings.notifications.email[emailNotif.key] = value" 
                    />
                  </div>
                  
                  <n-divider class="my-6" />
                  
                  <h4 class="text-base font-medium mb-3">Push Notifications</h4>
                  <div class="notification-item" v-for="pushNotif in pushNotifications" :key="pushNotif.key">
                    <div class="notification-content">
                      <div class="notification-label">{{ pushNotif.label }}</div>
                      <div class="notification-description">{{ pushNotif.description }}</div>
                    </div>
                    <n-switch 
                      :value="settings.notifications.push[pushNotif.key]"
                      @update:value="(value) => settings.notifications.push[pushNotif.key] = value" 
                    />
                  </div>
                </div>
              </div>
            </n-tab-pane>

            <n-tab-pane name="security" tab="Security">
              <div class="tab-content">
                <h3 class="text-lg font-semibold mb-4">Security Settings</h3>
                
                <div class="security-sections">
                  <n-card class="security-card mb-4">
                    <h4 class="text-base font-medium mb-3">Two-Factor Authentication</h4>
                    <p class="text-sm text-gray-600 mb-3">
                      Add an extra layer of security to your account
                    </p>
                    <n-switch v-model:value="settings.security.twoFactorEnabled">
                      <template #checked>Enable 2FA</template>
                      <template #unchecked>Enable 2FA</template>
                    </n-switch>
                  </n-card>
                  
                  <n-card class="security-card mb-4">
                    <h4 class="text-base font-medium mb-3">Session Management</h4>
                    <div class="form-row">
                      <n-form-item label="Session Timeout (minutes)">
                        <n-input-number
                          v-model:value="settings.security.sessionTimeout"
                          :min="5"
                          :max="480"
                          placeholder="Enter timeout in minutes"
                        />
                      </n-form-item>
                      <n-form-item label="Max Concurrent Sessions">
                        <n-select
                          v-model:value="settings.security.maxConcurrentSessions"
                          :options="sessionOptions"
                          placeholder="Select max sessions"
                        />
                      </n-form-item>
                    </div>
                  </n-card>
                  
                  <n-card class="security-card">
                    <h4 class="text-base font-medium mb-3">Password Policy</h4>
                    <div class="policy-item" v-for="policy in passwordPolicies" :key="policy.key">
                    <div class="policy-content">
                      <div class="policy-label">{{ policy.label }}</div>
                      <div class="policy-description">{{ policy.description }}</div>
                    </div>
                    <n-switch 
                      v-if="policy.key !== 'minLength'"
                      :value="settings.security.passwordPolicy[policy.key]"
                      @update:value="(value) => settings.security.passwordPolicy[policy.key] = value" 
                    />
                    <n-input-number 
                      v-else
                      v-model:value="settings.security.passwordPolicy.minLength"
                      :min="6"
                      :max="20"
                      class="w-20"
                    />
                  </div>
                  </n-card>
                </div>
              </div>
            </n-tab-pane>
          </n-tabs>
        </n-card>
      </div>

      <!-- Settings Actions -->
      <div class="settings-sidebar">
        <n-card class="actions-card mb-4">
          <template #header>
            <span class="text-lg font-semibold">Actions</span>
          </template>
          <div class="actions-content">
            <n-button
              type="primary"
              block
              class="mb-3"
              @click="saveSettings"
              :loading="saving"
            >
              Save Changes
            </n-button>
            <n-button
              block
              class="mb-3"
              @click="resetSettings"
            >
              Reset to Defaults
            </n-button>
            <n-button
              block
              @click="exportSettings"
            >
              Export Settings
            </n-button>
          </div>
        </n-card>

        <n-card class="info-card">
          <template #header>
            <span class="text-lg font-semibold">System Information</span>
          </template>
          <div class="info-content">
            <div class="info-item">
              <span class="info-label">Version</span>
              <span class="info-value">v1.0.0</span>
            </div>
            <div class="info-item">
              <span class="info-label">Last Updated</span>
              <span class="info-value">Jan 15, 2024</span>
            </div>
            <div class="info-item">
              <span class="info-label">Database</span>
              <n-tag type="success" size="small">Connected</n-tag>
            </div>
          </div>
        </n-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notifications'
import { useThemeStore } from '@/stores/theme'
import ThemeToggle from '@/components/common/ThemeToggle.vue'

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

const timezoneOptions = [
  { label: 'UTC', value: 'UTC' },
  { label: 'America/New_York', value: 'America/New_York' },
  { label: 'America/Los_Angeles', value: 'America/Los_Angeles' },
  { label: 'Europe/London', value: 'Europe/London' },
  { label: 'Europe/Paris', value: 'Europe/Paris' },
  { label: 'Asia/Tokyo', value: 'Asia/Tokyo' }
]

const languages = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' }
]

const sessionOptions = [
  { label: '1 Session', value: 1 },
  { label: '2 Sessions', value: 2 },
  { label: '3 Sessions', value: 3 },
  { label: '5 Sessions', value: 5 },
  { label: '10 Sessions', value: 10 }
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

// Theme handling
const handleThemeChange = (value: string) => {
  themeStore.setTheme(value as 'light' | 'dark' | 'system')
  settings.value.appearance.theme = value
}

const currentThemeLabel = computed(() => {
  const labels = {
    light: 'Light Theme',
    dark: 'Dark Theme',
    system: 'System Theme (Auto)'
  }
  return labels[themeStore.mode] || 'Unknown'
})

// Watch for theme changes and sync with settings
watch(
  () => themeStore.mode,
  (newTheme) => {
    settings.value.appearance.theme = newTheme
  },
  { immediate: true }
)

// Initialize settings with current theme from store
onMounted(() => {
  settings.value.appearance.theme = themeStore.mode
})
</script>

<style scoped>
.settings-view {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.settings-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
}

.settings-main {
  min-width: 0;
}

.settings-sidebar {
  display: flex;
  flex-direction: column;
}

.tab-content {
  padding: 16px 0;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.appearance-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.theme-card {
  min-height: 160px;
}

.theme-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.theme-preview {
  padding: 0.75rem;
  background: rgba(var(--v-theme-surface-variant), 0.1);
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.color-card {
  min-height: 160px;
}

.color-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.color-btn {
  flex: 1;
  min-width: 80px;
}

.switches-section {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notifications-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--n-border-color);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-content {
  flex: 1;
}

.notification-label {
  font-weight: 500;
  margin-bottom: 4px;
}

.notification-description {
  font-size: 14px;
  color: var(--n-text-color-2);
}

.security-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.security-card {
  padding: 16px;
}

.policy-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--n-border-color);
}

.policy-item:last-child {
  border-bottom: none;
}

.policy-content {
  flex: 1;
}

.policy-label {
  font-weight: 500;
  margin-bottom: 4px;
}

.policy-description {
  font-size: 14px;
  color: var(--n-text-color-2);
}

.actions-card {
  position: sticky;
  top: 24px;
}

.actions-content {
  display: flex;
  flex-direction: column;
}

.info-card {
  position: sticky;
  top: 200px;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-weight: 500;
  color: var(--n-text-color);
}

.info-value {
  color: var(--n-text-color-2);
}

.settings-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.settings-header {
  margin-bottom: 24px;
}

.settings-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: var(--n-text-color);
  margin: 0;
}

.settings-tabs {
  margin-bottom: 24px;
}

.settings-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--n-text-color);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--n-border-color);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--n-text-color);
}

.switch-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--n-border-color);
}

.switch-item:last-child {
  border-bottom: none;
}

.switch-label {
  flex: 1;
}

.switch-label h4 {
  margin: 0 0 4px 0;
  font-weight: 500;
  color: var(--n-text-color);
}

.switch-label p {
  margin: 0;
  font-size: 14px;
  color: var(--n-text-color-2);
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.actions-section {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--n-border-color);
}

.system-info {
  background: var(--n-card-color);
  border: 1px solid var(--n-border-color);
  border-radius: 8px;
  padding: 16px;
  margin-top: 24px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--n-border-color);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: var(--n-text-color);
}

.info-value {
  color: var(--n-text-color-2);
}

/* Responsive Design */
@media (max-width: 768px) {
  .settings-container {
    padding: 16px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-section {
    flex-direction: column;
  }
  
  .actions-section .n-button {
    width: 100%;
  }
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .settings-container {
    background: var(--n-body-color);
  }
}
</style>

