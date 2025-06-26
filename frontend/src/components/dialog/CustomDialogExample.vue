<template>
  <div class="pa-6">
    <v-row>
      <v-col cols="12">
        <h2 class="text-h4 mb-4">CustomDialog dengan useDialog Composable</h2>
        <p class="text-subtitle-1 mb-6">
          Contoh penggunaan CustomDialog dengan composable untuk state management yang lebih mudah
        </p>
      </v-col>
    </v-row>

    <v-row>
      <!-- Quick Actions -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Quick Dialog Actions</v-card-title>
          <v-card-text>
            <p class="mb-4">Menggunakan dialogService untuk dialog cepat:</p>
            
            <div class="d-flex flex-wrap gap-2">
              <v-btn color="info" @click="showInfoDialog">
                Show Info
              </v-btn>
              
              <v-btn color="success" @click="showSuccessDialog">
                Show Success
              </v-btn>
              
              <v-btn color="error" @click="showErrorDialog">
                Show Error
              </v-btn>
              
              <v-btn color="warning" @click="showWarningDialog">
                Show Warning
              </v-btn>
              
              <v-btn color="primary" @click="showConfirmDialog">
                Show Confirm
              </v-btn>
              
              <v-btn color="red" @click="showDeleteDialog">
                Delete Item
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Composable Examples -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Composable Examples</v-card-title>
          <v-card-text>
            <p class="mb-4">Menggunakan composable untuk kontrol yang lebih detail:</p>
            
            <div class="d-flex flex-wrap gap-2">
              <v-btn color="primary" @click="userFormDialog.show()">
                Add User
              </v-btn>
              
              <v-btn color="orange" @click="settingsDialog.show()">
                Settings
              </v-btn>
              
              <v-btn color="purple" @click="customDialog.show()">
                Custom Dialog
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- User Form Dialog -->
    <CustomDialog
      v-bind="userFormDialog.config"
      :show="userFormDialog.visible.value"
      :loading="userFormDialog.loading.value"
      v-on="userFormDialog.events"
    >
      <v-form ref="userFormRef" v-model="userFormValid">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="userForm.name"
              label="Full Name"
              :rules="[rules.required]"
              variant="outlined"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="userForm.email"
              label="Email"
              type="email"
              :rules="[rules.required, rules.email]"
              variant="outlined"
            />
          </v-col>
          <v-col cols="12">
            <v-select
              v-model="userForm.role"
              label="Role"
              :items="roleOptions"
              :rules="[rules.required]"
              variant="outlined"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="userForm.bio"
              label="Bio (Optional)"
              variant="outlined"
              rows="3"
            />
          </v-col>
        </v-row>
      </v-form>
    </CustomDialog>

    <!-- Settings Dialog -->
    <CustomDialog
      v-bind="settingsDialog.config"
      :show="settingsDialog.visible.value"
      v-on="settingsDialog.events"
    >
      <template #header-actions>
        <v-btn icon="mdi-refresh" size="small" variant="text" @click="resetSettings" />
      </template>

      <v-row>
        <v-col cols="12">
          <h4 class="text-h6 mb-3">Application Settings</h4>
        </v-col>
        
        <v-col cols="12">
          <v-switch
            v-model="settings.darkMode"
            label="Dark Mode"
            color="primary"
          />
        </v-col>
        
        <v-col cols="12">
          <v-switch
            v-model="settings.notifications"
            label="Enable Notifications"
            color="primary"
          />
        </v-col>
        
        <v-col cols="12">
          <v-select
            v-model="settings.language"
            label="Language"
            :items="languageOptions"
            variant="outlined"
          />
        </v-col>
        
        <v-col cols="12">
          <v-slider
            v-model="settings.autoSaveInterval"
            label="Auto-save Interval (minutes)"
            min="1"
            max="60"
            step="1"
            thumb-label
          />
        </v-col>
      </v-row>
    </CustomDialog>

    <!-- Custom Dialog with Advanced Features -->
    <CustomDialog
      v-bind="customDialog.config"
      :show="customDialog.visible.value"
      v-on="customDialog.events"
    >
      <template #header-actions>
        <v-btn icon="mdi-help" size="small" variant="text" @click="showHelp" />
        <v-btn icon="mdi-fullscreen" size="small" variant="text" @click="toggleFullscreen" />
      </template>

      <v-tabs v-model="activeTab" class="mb-4">
        <v-tab value="general">General</v-tab>
        <v-tab value="advanced">Advanced</v-tab>
        <v-tab value="preview">Preview</v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <v-window-item value="general">
          <v-card variant="outlined">
            <v-card-text>
              <h4 class="text-h6 mb-3">General Configuration</h4>
              <v-text-field
                v-model="customConfig.title"
                label="Title"
                variant="outlined"
              />
              <v-textarea
                v-model="customConfig.description"
                label="Description"
                variant="outlined"
                rows="3"
              />
            </v-card-text>
          </v-card>
        </v-window-item>

        <v-window-item value="advanced">
          <v-card variant="outlined">
            <v-card-text>
              <h4 class="text-h6 mb-3">Advanced Options</h4>
              <v-switch
                v-model="customConfig.enabled"
                label="Enable Feature"
                color="primary"
              />
              <v-select
                v-model="customConfig.priority"
                label="Priority"
                :items="priorityOptions"
                variant="outlined"
              />
            </v-card-text>
          </v-card>
        </v-window-item>

        <v-window-item value="preview">
          <v-card variant="outlined">
            <v-card-text>
              <h4 class="text-h6 mb-3">Preview</h4>
              <pre class="text-body-2">{{ JSON.stringify(customConfig, null, 2) }}</pre>
            </v-card-text>
          </v-card>
        </v-window-item>
      </v-window>

      <template #footer>
        <v-card-actions class="pa-4">
          <v-btn @click="customDialog.hide()">Cancel</v-btn>
          <v-spacer />
          <v-btn color="secondary" variant="outlined" @click="saveAsDraft">
            Save as Draft
          </v-btn>
          <v-btn color="primary" @click="saveCustomConfig">
            Save & Apply
          </v-btn>
        </v-card-actions>
      </template>
    </CustomDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import CustomDialog from './CustomDialog.vue'
import {
  useFormDialog,
  dialogService,
  useDialog,
  DialogPresets
} from './useDialog'

// Form validation
const userFormRef = ref()
const userFormValid = ref(false)

// User form data
const userForm = reactive({
  name: '',
  email: '',
  role: '',
  bio: ''
})

// Settings data
const settings = reactive({
  darkMode: false,
  notifications: true,
  language: 'en',
  autoSaveInterval: 5
})

// Custom config data
const customConfig = reactive({
  title: '',
  description: '',
  enabled: true,
  priority: 'medium'
})

// Tab state
const activeTab = ref('general')

// Form options
const roleOptions = [
  { title: 'Administrator', value: 'admin' },
  { title: 'User', value: 'user' },
  { title: 'Viewer', value: 'viewer' }
]

const languageOptions = [
  { title: 'English', value: 'en' },
  { title: 'Bahasa Indonesia', value: 'id' },
  { title: 'Español', value: 'es' }
]

const priorityOptions = [
  { title: 'High', value: 'high' },
  { title: 'Medium', value: 'medium' },
  { title: 'Low', value: 'low' }
]

// Validation rules
const rules = {
  required: (value: string) => !!value || 'Field is required',
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Invalid email format'
  }
}

// Dialog composables
const userFormDialog = useFormDialog(
  'Add New User',
  'Fill in the user information below',
  async () => {
    if (!userFormValid.value) {
      throw new Error('Please fill in all required fields')
    }
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('User saved:', userForm)
    
    // Reset form
    Object.assign(userForm, {
      name: '',
      email: '',
      role: '',
      bio: ''
    })
    
    // Show success message
    dialogService.success('User Created', 'User has been successfully created!')
  }
)

const settingsDialog = useDialog({
  title: 'Application Settings',
  subtitle: 'Configure your application preferences',
  headerIcon: 'mdi-cog',
  maxWidth: 600,
  confirmButtonText: 'Save Settings',
  cancelButtonText: 'Cancel'
}, {
  onConfirm: async () => {
    // Simulate saving settings
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Settings saved:', settings)
    dialogService.success('Settings Saved', 'Your settings have been updated!')
  }
})

const customDialog = useDialog({
  title: 'Advanced Configuration',
  subtitle: 'Configure advanced options',
  headerIcon: 'mdi-tune',
  maxWidth: 800,
  showFooter: false // We'll use custom footer
})

// Quick dialog methods using dialogService
const showInfoDialog = () => {
  dialogService.info(
    'Information',
    'This is an informational message using the dialog service.'
  )
}

const showSuccessDialog = () => {
  dialogService.success(
    'Operation Successful',
    'Your operation has been completed successfully!'
  )
}

const showErrorDialog = () => {
  dialogService.error(
    'Error Occurred',
    'Something went wrong. Please try again later.'
  )
}

const showWarningDialog = () => {
  dialogService.warning(
    'Warning',
    'Please review your settings before proceeding.'
  )
}

const showConfirmDialog = () => {
  dialogService.confirm(
    'Confirm Action',
    'Are you sure you want to proceed with this action?',
    () => {
      console.log('Action confirmed!')
      dialogService.success('Confirmed', 'Action has been executed!')
    }
  )
}

const showDeleteDialog = () => {
  dialogService.deleteConfirm(
    'Important Document',
    async () => {
      // Simulate delete operation
      await new Promise(resolve => setTimeout(resolve, 1500))
      console.log('Item deleted!')
      dialogService.success('Deleted', 'Item has been permanently deleted.')
    }
  )
}

// Custom dialog methods
const resetSettings = () => {
  Object.assign(settings, {
    darkMode: false,
    notifications: true,
    language: 'en',
    autoSaveInterval: 5
  })
}

const showHelp = () => {
  dialogService.info(
    'Help',
    'This dialog demonstrates advanced features like tabs, custom footers, and complex layouts.'
  )
}

const toggleFullscreen = () => {
  customDialog.updateConfig({
    fullscreen: !customDialog.config.fullscreen
  })
}

const saveAsDraft = () => {
  console.log('Saved as draft:', customConfig)
  dialogService.info('Draft Saved', 'Your configuration has been saved as a draft.')
}

const saveCustomConfig = () => {
  console.log('Custom config saved:', customConfig)
  customDialog.hide()
  dialogService.success('Configuration Saved', 'Your advanced configuration has been applied!')
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}

pre {
  background: rgba(var(--v-theme-surface-variant), 0.1);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
}
</style>