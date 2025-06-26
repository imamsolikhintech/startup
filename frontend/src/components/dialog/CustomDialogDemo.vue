<template>
  <div class="pa-6">
    <v-row>
      <v-col cols="12">
        <h2 class="text-h4 mb-4">Custom Dialog Component Demo</h2>
        <p class="text-subtitle-1 mb-6">Berbagai contoh penggunaan CustomDialog component yang reusable</p>
      </v-col>
    </v-row>

    <v-row>
      <!-- Basic Dialog -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Basic Dialog</v-card-title>
          <v-card-text>
            Dialog sederhana dengan header dan footer default
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="basicDialog = true">
              Open Basic Dialog
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Confirmation Dialog -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Confirmation Dialog</v-card-title>
          <v-card-text>
            Dialog konfirmasi dengan icon dan styling khusus
          </v-card-text>
          <v-card-actions>
            <v-btn color="error" @click="confirmDialog = true">
              Delete Item
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Form Dialog -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Form Dialog</v-card-title>
          <v-card-text>
            Dialog dengan form dan validasi
          </v-card-text>
          <v-card-actions>
            <v-btn color="success" @click="formDialog = true">
              Add User
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Custom Content Dialog -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Custom Content</v-card-title>
          <v-card-text>
            Dialog dengan konten kustom menggunakan slots
          </v-card-text>
          <v-card-actions>
            <v-btn color="info" @click="customDialog = true">
              View Details
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- No Footer Dialog -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>No Footer Dialog</v-card-title>
          <v-card-text>
            Dialog tanpa footer, hanya close button di header
          </v-card-text>
          <v-card-actions>
            <v-btn color="warning" @click="noFooterDialog = true">
              Show Info
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Fullscreen Dialog -->
      <v-col cols="12" md="4">
        <v-card>
          <v-card-title>Fullscreen Dialog</v-card-title>
          <v-card-text>
            Dialog fullscreen untuk konten yang besar
          </v-card-text>
          <v-card-actions>
            <v-btn color="purple" @click="fullscreenDialog = true">
              Open Fullscreen
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Basic Dialog -->
    <CustomDialog
      v-model:show="basicDialog"
      title="Basic Dialog"
      subtitle="This is a basic dialog example"
      header-icon="mdi-information"
      @confirm="handleBasicConfirm"
      @cancel="handleBasicCancel"
    >
      <p>This is the content of a basic dialog. You can put any content here.</p>
      <p>The dialog has a header with title, subtitle, and icon, plus a footer with cancel and confirm buttons.</p>
    </CustomDialog>

    <!-- Confirmation Dialog -->
    <CustomDialog
      v-model:show="confirmDialog"
      title="Delete Confirmation"
      subtitle="This action cannot be undone"
      header-icon="mdi-alert-circle"
      header-icon-color="error"
      confirm-button-text="Delete"
      confirm-button-color="error"
      cancel-button-text="Keep"
      max-width="400"
      @confirm="handleDeleteConfirm"
      @cancel="handleDeleteCancel"
    >
      <div class="text-center py-4">
        <v-icon color="error" size="64" class="mb-4">mdi-delete-alert</v-icon>
        <p class="text-h6 mb-2">Are you sure you want to delete this item?</p>
        <p class="text-body-2 text-medium-emphasis">
          This action will permanently remove the item from your account.
        </p>
      </div>
    </CustomDialog>

    <!-- Form Dialog -->
    <CustomDialog
      v-model:show="formDialog"
      title="Add New User"
      subtitle="Fill in the user information"
      header-icon="mdi-account-plus"
      confirm-button-text="Save User"
      :loading="formLoading"
      max-width="600"
      @confirm="handleFormSubmit"
      @cancel="handleFormCancel"
    >
      <v-form ref="userForm" v-model="formValid">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="userForm.firstName"
              label="First Name"
              :rules="[rules.required]"
              variant="outlined"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="userForm.lastName"
              label="Last Name"
              :rules="[rules.required]"
              variant="outlined"
            />
          </v-col>
          <v-col cols="12">
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
        </v-row>
      </v-form>
    </CustomDialog>

    <!-- Custom Content Dialog -->
    <CustomDialog
      v-model:show="customDialog"
      title="User Profile"
      header-icon="mdi-account-circle"
      :show-footer="false"
      max-width="500"
    >
      <template #header-actions>
        <v-btn icon="mdi-pencil" size="small" variant="text" title="Edit" />
        <v-btn icon="mdi-share" size="small" variant="text" title="Share" />
      </template>

      <div class="text-center mb-4">
        <v-avatar size="80" class="mb-3">
          <v-img src="https://toppng.com/uploads/preview/avatar-png-115540218987bthtxfhls.png" alt="User Avatar" />
        </v-avatar>
        <h3 class="text-h5">John Doe</h3>
        <p class="text-subtitle-1 text-medium-emphasis">Software Developer</p>
      </div>

      <v-list>
        <v-list-item prepend-icon="mdi-email">
          <v-list-item-title>john.doe@example.com</v-list-item-title>
        </v-list-item>
        <v-list-item prepend-icon="mdi-phone">
          <v-list-item-title>+1 (555) 123-4567</v-list-item-title>
        </v-list-item>
        <v-list-item prepend-icon="mdi-map-marker">
          <v-list-item-title>San Francisco, CA</v-list-item-title>
        </v-list-item>
      </v-list>

      <template #footer>
        <v-card-actions class="pa-4">
          <v-btn color="primary" variant="flat" block @click="customDialog = false">
            Close Profile
          </v-btn>
        </v-card-actions>
      </template>
    </CustomDialog>

    <!-- No Footer Dialog -->
    <CustomDialog
      v-model:show="noFooterDialog"
      title="Information"
      subtitle="Important notice"
      header-icon="mdi-information"
      :show-footer="false"
      max-width="400"
    >
      <div class="text-center py-4">
        <v-icon color="info" size="64" class="mb-4">mdi-lightbulb-on</v-icon>
        <h4 class="text-h6 mb-3">Did you know?</h4>
        <p class="text-body-1">
          This dialog doesn't have a footer. You can only close it using the X button in the header.
        </p>
      </div>
    </CustomDialog>

    <!-- Fullscreen Dialog -->
    <CustomDialog
      v-model:show="fullscreenDialog"
      title="Fullscreen Content"
      subtitle="Expanded view for detailed information"
      header-icon="mdi-fullscreen"
      :fullscreen="true"
      confirm-button-text="Save Changes"
      cancel-button-text="Discard"
      @confirm="handleFullscreenConfirm"
      @cancel="handleFullscreenCancel"
    >
      <v-container fluid>
        <v-row>
          <v-col cols="12" md="8">
            <h3 class="text-h5 mb-4">Main Content Area</h3>
            <p class="text-body-1 mb-4">
              This is a fullscreen dialog that takes up the entire viewport. 
              It's perfect for detailed forms, data tables, or any content that needs more space.
            </p>
            
            <v-card class="mb-4">
              <v-card-title>Sample Data Table</v-card-title>
              <v-card-text>
                <v-data-table
                  :headers="tableHeaders"
                  :items="tableItems"
                  class="elevation-0"
                />
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="4">
            <h3 class="text-h5 mb-4">Sidebar Content</h3>
            <v-card>
              <v-card-title>Quick Actions</v-card-title>
              <v-card-text>
                <v-btn block class="mb-2" variant="outlined">Action 1</v-btn>
                <v-btn block class="mb-2" variant="outlined">Action 2</v-btn>
                <v-btn block variant="outlined">Action 3</v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </CustomDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import CustomDialog from './CustomDialog.vue'

// Dialog visibility states
const basicDialog = ref(false)
const confirmDialog = ref(false)
const formDialog = ref(false)
const customDialog = ref(false)
const noFooterDialog = ref(false)
const fullscreenDialog = ref(false)

// Form states
const formValid = ref(false)
const formLoading = ref(false)
const userForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  role: ''
})

// Form validation rules
const rules = {
  required: (value: string) => !!value || 'Field is required',
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'Invalid email format'
  }
}

// Role options
const roleOptions = [
  { title: 'Admin', value: 'admin' },
  { title: 'User', value: 'user' },
  { title: 'Viewer', value: 'viewer' }
]

// Table data for fullscreen dialog
const tableHeaders = [
  { title: 'Name', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Role', key: 'role' },
  { title: 'Status', key: 'status' }
]

const tableItems = [
  { name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
  { name: 'Bob Johnson', email: 'bob@example.com', role: 'Viewer', status: 'Inactive' }
]

// Event handlers
const handleBasicConfirm = () => {
  console.log('Basic dialog confirmed')
  basicDialog.value = false
}

const handleBasicCancel = () => {
  console.log('Basic dialog cancelled')
}

const handleDeleteConfirm = () => {
  console.log('Item deleted')
  confirmDialog.value = false
  // Add your delete logic here
}

const handleDeleteCancel = () => {
  console.log('Delete cancelled')
}

const handleFormSubmit = async () => {
  if (!formValid.value) return
  
  formLoading.value = true
  
  // Simulate API call
  setTimeout(() => {
    console.log('User saved:', userForm)
    formLoading.value = false
    formDialog.value = false
    
    // Reset form
    Object.assign(userForm, {
      firstName: '',
      lastName: '',
      email: '',
      role: ''
    })
  }, 2000)
}

const handleFormCancel = () => {
  console.log('Form cancelled')
  // Reset form
  Object.assign(userForm, {
    firstName: '',
    lastName: '',
    email: '',
    role: ''
  })
}

const handleFullscreenConfirm = () => {
  console.log('Fullscreen changes saved')
  fullscreenDialog.value = false
}

const handleFullscreenCancel = () => {
  console.log('Fullscreen changes discarded')
}
</script>

<style scoped>
/* Add any additional styling if needed */
</style>