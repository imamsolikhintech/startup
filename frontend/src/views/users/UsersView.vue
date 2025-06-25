<template>
  <div class="users-view">
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">User Management</h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              Manage your application users and their permissions
            </p>
          </div>
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            size="large"
            @click="showAddDialog = true"
          >
            Add User
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Filters and Search -->
    <v-card class="mb-6" rounded="lg">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Search users..."
              variant="outlined"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="roleFilter"
              :items="roles"
              label="Filter by role"
              variant="outlined"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="statusFilter"
              :items="statuses"
              label="Filter by status"
              variant="outlined"
              hide-details
              clearable
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-btn
              color="primary"
              variant="outlined"
              block
              @click="exportUsers"
            >
              Export
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Users Table -->
    <v-card rounded="lg">
      <v-data-table
        :headers="headers"
        :items="filteredUsers"
        :search="search"
        :loading="loading"
        class="elevation-0"
        item-value="id"
      >
        <template #item.profile_picture="{ item }">
          <v-avatar size="40">
            <v-img :src="item.profile_picture" :alt="item.name" />
          </v-avatar>
        </template>

        <template #item.active="{ item }">
          <v-chip
            :color="item.active ? 'success' : 'error'"
            size="small"
            variant="tonal"
          >
            {{ item.active ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>

        <template #item.role="{ item }">
          <v-chip
            :color="getRoleColor(item.role)"
            size="small"
            variant="tonal"
          >
            {{ item.role }}
          </v-chip>
        </template>

        <template #item.last_login="{ item }">
          {{ formatDate(item.last_login) }}
        </template>

        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-chart-line"
            size="small"
            color="info"
            variant="text"
            @click="viewUserActivity(item)"
            title="View Activity"
          />
          <v-btn
            icon="mdi-pencil"
            size="small"
            color="primary"
            variant="text"
            @click="editUser(item)"
            title="Edit User"
          />
          <v-btn
            icon="mdi-delete"
            size="small"
            color="error"
            variant="text"
            @click="deleteUser(item)"
            title="Delete User"
          />
        </template>
      </v-data-table>
    </v-card>

    <!-- Add/Edit User Dialog -->
    <v-dialog v-model="showAddDialog" max-width="600">
      <v-card rounded="lg">
        <v-card-title>
          {{ editingUser ? 'Edit User' : 'Add New User' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="userForm">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="userFormData.name"
                  label="Full Name"
                  variant="outlined"
                  :rules="nameRules"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="userFormData.email"
                  label="Email"
                  type="email"
                  variant="outlined"
                  :rules="emailRules"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="userFormData.role"
                  :items="roles"
                  label="Role"
                  variant="outlined"
                  :rules="[v => !!v || 'Role is required']"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="userFormData.status"
                  :items="statuses"
                  label="Status"
                  variant="outlined"
                  :rules="[v => !!v || 'Status is required']"
                  required
                />
              </v-col>
              <v-col cols="12" v-if="!editingUser">
                <v-text-field
                  v-model="userFormData.password"
                  label="Password"
                  type="password"
                  variant="outlined"
                  :rules="passwordRules"
                  required
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showAddDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="saveUser"
            :loading="saving"
          >
            {{ editingUser ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- User Activity Dialog -->
    <v-dialog v-model="activityDialog" max-width="1200px">
      <v-card>
        <v-card-title class="text-h5">
          User Activity & Login History
        </v-card-title>
        
        <v-card-text>
          <v-progress-linear v-if="activityLoading" indeterminate></v-progress-linear>
          
          <div v-else-if="selectedUserActivity">
            <!-- Activity Statistics -->
            <v-row class="mb-4">
              <v-col cols="12">
                <h3 class="mb-3">Activity Statistics</h3>
                <v-row>
                  <v-col cols="6" md="3">
                    <v-card class="pa-3 text-center">
                      <div class="text-h4 text-primary">{{ selectedUserActivity.statistics.total_logins }}</div>
                      <div class="text-caption">Total Logins</div>
                    </v-card>
                  </v-col>
                  <v-col cols="6" md="3">
                    <v-card class="pa-3 text-center">
                      <div class="text-h4 text-success">{{ selectedUserActivity.statistics.unique_ips }}</div>
                      <div class="text-caption">Unique IPs</div>
                    </v-card>
                  </v-col>
                  <v-col cols="6" md="3">
                    <v-card class="pa-3 text-center">
                      <div class="text-h4 text-info">{{ selectedUserActivity.statistics.total_days }}</div>
                      <div class="text-caption">Active Days</div>
                    </v-card>
                  </v-col>
                  <v-col cols="6" md="3">
                    <v-card class="pa-3 text-center">
                      <div class="text-h4 text-warning">{{ selectedUserActivity.statistics.average_per_day?.toFixed(1) || '0.0' }}</div>
                      <div class="text-caption">Avg/Day</div>
                    </v-card>
                  </v-col>
                </v-row>
                <v-row class="mt-2">
                  <v-col cols="6" md="3">
                    <v-card class="pa-3 text-center">
                      <div class="text-h4 text-purple">{{ selectedUserActivity.statistics.most_active_day || 'N/A' }}</div>
                      <div class="text-caption">Most Active Day</div>
                    </v-card>
                  </v-col>
                  <v-col cols="6" md="3">
                    <v-card class="pa-3 text-center">
                      <div class="text-h4 text-indigo">{{ formatDate(selectedUserActivity.statistics.last_login) }}</div>
                      <div class="text-caption">Last Login</div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>

            <!-- Activity Chart -->
            <v-row class="mb-4">
              <v-col cols="12">
                <h3 class="mb-3">Daily Activity (Last 30 Days)</h3>
                <v-card class="pa-4">
                  <div v-if="selectedUserActivity.activity_log && selectedUserActivity.activity_log.length > 0">
                    <v-row class="mb-2 font-weight-bold">
                      <v-col cols="4">Date</v-col>
                      <v-col cols="4">Logins</v-col>
                      <v-col cols="4">Unique IPs</v-col>
                    </v-row>
                    <v-divider class="mb-2"></v-divider>
                    <v-row v-for="activity in selectedUserActivity.activity_log.slice(0, 10)" :key="activity.date" class="mb-2">
                      <v-col cols="4">{{ formatDate(activity.date) }}</v-col>
                      <v-col cols="4">{{ activity.login_count }} logins</v-col>
                      <v-col cols="4">{{ activity.unique_ips }} unique IPs</v-col>
                    </v-row>
                  </div>
                  <div v-else class="text-center text-grey">
                    No activity data available
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <!-- Login History -->
            <v-row>
              <v-col cols="12">
                <h3 class="mb-3">Recent Login Sessions</h3>
                <v-data-table
                  :headers="[
                    { title: 'Date/Time', key: 'login_time' },
                    { title: 'IP Address', key: 'ip' },
                    { title: 'Location', key: 'location' },
                    { title: 'Device', key: 'device_info' },
                    { title: 'Status', key: 'success' }
                  ]"
                  :items="selectedUserLoginHistory"
                  :items-per-page="10"
                  class="elevation-1"
                >
                  <template #item.login_time="{ item }">
                    {{ formatDateTime(item.login_time) }}
                  </template>
                  
                  <template #item.location="{ item }">
                    <span v-if="item.city || item.country">
                      {{ item.city }}{{ item.city && item.country ? ', ' : '' }}{{ item.country }}
                    </span>
                    <span v-else class="text-grey">Unknown</span>
                  </template>
                  
                  <template #item.device_info="{ item }">
                    <div>
                      <div class="text-body-2">{{ item.browser || 'Unknown Browser' }}</div>
                      <div class="text-caption text-grey">{{ item.os || 'Unknown OS' }}</div>
                    </div>
                  </template>
                  
                  <template #item.success="{ item }">
                    <v-chip
                      :color="item.success ? 'success' : 'error'"
                      size="small"
                      variant="flat"
                    >
                      {{ item.success ? 'Success' : 'Failed' }}
                    </v-chip>
                    <div v-if="!item.success && item.failure_reason" class="text-caption text-error mt-1">
                      {{ item.failure_reason }}
                    </div>
                  </template>
                </v-data-table>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="activityDialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notifications'
import { userService } from '@/api/service'
import type { User, UserStats, UserActivityResponse, LoginHistory } from '@/api/types'

const notificationStore = useNotificationStore()

// Refs
const userForm = ref()

// Data
const search = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const loading = ref(false)
const showAddDialog = ref(false)
const editingUser = ref<User | null>(null)
const activityDialog = ref(false)
const selectedUserActivity = ref<UserActivityResponse | null>(null)
const selectedUserLoginHistory = ref<LoginHistory[]>([])
const activityLoading = ref(false)
const saving = ref(false)

// Form data
const userFormData = ref({
  name: '',
  email: '',
  role: '',
  status: 'active',
  password: ''
})

// API Data
const users = ref<User[]>([])
const userStats = ref<UserStats | null>(null)
const roles = ref(['admin', 'user', 'moderator']) // Will be loaded from API

const statuses = ['active', 'inactive']

const headers = [
  { title: 'Avatar', key: 'profile_picture', sortable: false },
  { title: 'Name', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Role', key: 'role' },
  { title: 'Status', key: 'active', sortable: false },
  { title: 'Last Login', key: 'last_login' },
  { title: 'Actions', key: 'actions', sortable: false }
]

const filteredUsers = computed(() => {
  return users.value.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(search.value.toLowerCase()) ||
                         user.email?.toLowerCase().includes(search.value.toLowerCase())
    const matchesRole = roleFilter.value === '' || user.role === roleFilter.value
    const matchesStatus = statusFilter.value === '' || 
                         (statusFilter.value === 'active' && user.active) ||
                         (statusFilter.value === 'inactive' && !user.active)
    
    return matchesSearch && matchesRole && matchesStatus
  })
})

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
  (v: string) => v.length >= 6 || 'Password must be at least 6 characters'
]

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    admin: 'error',
    moderator: 'warning',
    user: 'primary',
    viewer: 'info'
  }
  return colors[role] || 'primary'
}

const formatDate = (date: string | Date) => {
  if (!date) return 'Never'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDateTime = (dateTime: string | Date) => {
  return new Date(dateTime).toLocaleString()
}

// API Methods
const loadUsers = async () => {
  loading.value = true
  try {
    const response = await userService.getUsers()
    // if (response.success === 200) {
      users.value = response.data
    // }
    console.log(users.value)
  } catch (error) {
    notificationStore.addNotification({
      type: 'error',
      title: 'Error',
      message: 'Failed to load users'
    })
  } finally {
    loading.value = false
  }
}

const loadUserStats = async () => {
  try {
    const response = await userService.getUserStats()
    if (response.success) {
      userStats.value = response.data
    }
  } catch (error) {
    console.error('Failed to load user stats:', error)
  }
}

const loadRoles = async () => {
  try {
    const response = await userService.getAllRoles()
    if (response.success) {
      roles.value = response.data.map(role => role.name)
    }
  } catch (error) {
    console.error('Failed to load roles:', error)
  }
}

// User Activity Methods
const viewUserActivity = async (user: User) => {
  activityLoading.value = true
  activityDialog.value = true
  
  try {
    const [activityResponse, historyResponse] = await Promise.all([
      userService.getUserActivity(user.id, 30),
      userService.getLoginHistory(user.id, 50)
    ])
    
    if (activityResponse.status === 200) {
      selectedUserActivity.value = activityResponse.data
    }
    
    if (historyResponse.status === 200) {
      selectedUserLoginHistory.value = historyResponse.data
    }
  } catch (error) {
    notificationStore.addNotification({
      type: 'error',
      title: 'Error',
      message: 'Failed to load user activity'
    })
  } finally {
    activityLoading.value = false
  }
}

// Methods
const editUser = (user: User) => {
  editingUser.value = user
  userFormData.value = {
    name: user.name || '',
    email: user.email || '',
    role: user.role || '',
    status: user.active ? 'active' : 'inactive',
    password: ''
  }
  showAddDialog.value = true
}

const deleteUser = async (user: User) => {
  if (confirm(`Are you sure you want to delete ${user.name}?`)) {
    try {
      const response = await userService.deleteUser(user.id)
      if (response.success) {
        await loadUsers() // Reload users
        notificationStore.addNotification({
          type: 'success',
          title: 'User Deleted',
          message: `${user.name} has been deleted successfully`
        })
      }
    } catch (error) {
      notificationStore.addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete user'
      })
    }
  }
}

const saveUser = async () => {
  saving.value = true
  try {
    let response
    
    if (editingUser.value) {
      // Update existing user
      response = await userService.updateUser(editingUser.value.id, {
        name: userFormData.value.name,
        email: userFormData.value.email,
        role: userFormData.value.role,
        active: userFormData.value.status === 'active'
      })
      
      if (response.success) {
        notificationStore.addNotification({
          type: 'success',
          title: 'User Updated',
          message: `${userFormData.value.name} has been updated successfully`
        })
      }
    } else {
      // Create new user
      response = await userService.createUser({
        name: userFormData.value.name,
        email: userFormData.value.email,
        password: userFormData.value.password,
        role: userFormData.value.role,
        active: userFormData.value.status === 'active'
      })
      
      if (response.success) {
        notificationStore.addNotification({
          type: 'success',
          title: 'User Created',
          message: `${userFormData.value.name} has been created successfully`
        })
      }
    }
    
    if (response.success) {
      await loadUsers() // Reload users
      showAddDialog.value = false
      editingUser.value = null
      userFormData.value = {
        name: '',
        email: '',
        role: '',
        status: 'active',
        password: ''
      }
    }
  } catch (error) {
    notificationStore.addNotification({
      type: 'error',
      title: 'Error',
      message: 'Failed to save user'
    })
  } finally {
    saving.value = false
  }
}

const exportUsers = () => {
  // Export functionality
  const csvContent = users.value.map(user => 
    `${user.name},${user.email},${user.role},${user.active ? 'Active' : 'Inactive'},${user.last_login || ''}`
  ).join('\n')
  
  const blob = new Blob([`Name,Email,Role,Status,Last Login\n${csvContent}`], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'users.csv'
  a.click()
  window.URL.revokeObjectURL(url)
  
  notificationStore.addNotification({
    type: 'success',
    title: 'Export Complete',
    message: 'User data has been exported successfully'
  })
}

onMounted(async () => {
  await Promise.all([
    loadUsers(),
    loadUserStats(),
    loadRoles()
  ])
})
</script>

<style scoped>
.users-view {
  max-width: 100%;
}

:deep(.v-data-table) {
  border-radius: 12px;
}

:deep(.v-data-table__wrapper) {
  border-radius: 12px;
}
</style>