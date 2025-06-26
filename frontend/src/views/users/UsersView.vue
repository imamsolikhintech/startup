<template>
  <div class="users-view">
    <!-- Header Section -->
    <PageHeader title="User Management" subtitle="Manage users, roles, and permissions" :actions="[
      {
        key: 'add',
        label: 'Add User',
        icon: 'mdi-plus',
        color: 'primary',
        variant: 'elevated'
      }
    ]" @action="handleHeaderAction" />

    <!-- Stats Cards -->
    <StatsCards :stats="statsData" class="mb-6" />

    <!-- Search and Filters -->
    <SearchFilters 
      v-model:search="search" 
      :filters="[
        {
          key: 'role',
          label: 'Filter by Role',
          items: roles.map(role => ({ 
            title: role.label, 
            value: role.value 
          })),
          value: roleFilter
        },
        {
          key: 'status',
          label: 'Filter by Status', 
          items: statuses.map(status => ({ 
            title: status.label, 
            value: status.value 
          })),
          value: statusFilter
        }
      ]"
      :show-export="true"
      @update:filter="handleFilterChange"
      @export="exportUsers"
      class="mb-6"
    />
    <!-- Users Table -->
    <DataTable :headers="headers" :items="filteredUsers" :search="search" :loading="loading" :actions="tableActions"
      @action="handleTableAction" />

    <!-- Add/Edit User Dialog -->
    <UserFormDialog :show="showAddDialog" :form-data="userFormData" :is-editing="!!editingUser" :roles="roles"
      :statuses="statuses" :loading="saving" @update:show="showAddDialog = $event"
      @update:form-data="userFormData = $event" @save="saveUser" @cancel="closeDialog"
      @reset-password="openResetPasswordDialog" />

    <!-- Reset Password Dialog -->
    <ResetPasswordDialog :show="showResetPasswordDialog" :form-data="resetPasswordData" :loading="resetPasswordLoading"
      @update:show="showResetPasswordDialog = $event" @confirm="confirmResetPassword"
      @cancel="closeResetPasswordDialog" />

    <!-- User Activity Dialog -->
    <UserActivityDialog :show="activityDialog" :activity-data="selectedUserActivity"
      :login-history="selectedUserLoginHistory" :loading="activityLoading" @update:show="activityDialog = $event"
      @close="activityDialog = false" />

    <!-- Delete Confirmation Dialog -->
    <DeleteConfirmDialog :show="showDeleteDialog" :user-name="userToDelete?.name || ''" :loading="deleteLoading"
      @update:show="showDeleteDialog = $event" @confirm="confirmDeleteUser" @cancel="closeDeleteDialog" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { userService } from '@/api/service'
import { useNotificationStore } from '@/stores/notifications'
import PageHeader from '@/components/common/PageHeader.vue'
import SearchFilters from '@/components/common/SearchFilters.vue'
import StatsCards from '@/components/common/StatsCards.vue'
import DataTable from '@/components/datatable/DataTable.vue'
import UserFormDialog from './UserFormDialog.vue'
import ResetPasswordDialog from './ResetPasswordDialog.vue'
import UserActivityDialog from './UserActivityDialog.vue'
import DeleteConfirmDialog from './DeleteConfirmDialog.vue'
import type { User, UserStats, UserActivityResponse, LoginHistory } from '@/api/types'

const { showSuccess, showError } = useNotificationStore()

// Refs
// const userForm = ref()

// Data
const search = ref('')
const roleFilter = ref(null)
const statusFilter = ref(null)
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
  password: '',
  profile_picture: '',
  verified: false,
  confirmPassword: ''
})

// Additional refs for form
const showResetPasswordDialog = ref(false)
const resetPasswordData = ref({
  userId: '',
  newPassword: '',
  confirmPassword: ''
})
const resetPasswordLoading = ref(false)

// Delete confirmation dialog
const showDeleteDialog = ref(false)
const userToDelete = ref<User | null>(null)
const deleteLoading = ref(false)

// API Data
const users = ref<User[]>([])
const filteredUsers = ref<User[]>([])
const userStats = ref<UserStats | null>(null)
const roles = ref([
  { label: 'Admin', value: 'admin' },
  { label: 'User', value: 'user' },
  { label: 'Moderator', value: 'moderator' }
]) // Will be loaded from API

const statuses = ref([
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
])

const headers = [
  { title: 'Avatar', key: 'profile_picture', sortable: false },
  { title: 'Name', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Role', key: 'role' },
  { title: 'Status', key: 'active', sortable: false },
  { title: 'Verified', key: 'verified', sortable: false },
  { title: 'Last Login', key: 'last_login' },
  { title: 'Actions', key: 'actions', sortable: false }
]

// Removed computed filteredUsers - now using API-based filtering

// Stats data for StatsCards component
const statsData = computed(() => [
  {
    title: 'Total Users',
    value: userStats.value?.total_users || 0,
    icon: 'mdi-account-group',
    color: 'primary'
  },
  {
    title: 'Active Users',
    value: userStats.value?.active_users || 0,
    icon: 'mdi-account-check',
    color: 'success'
  },
  {
    title: 'Verification',
    value: userStats.value?.verified_users || 0,
    icon: 'mdi-clock-outline',
    color: 'warning'
  },
  {
    title: 'New This Month',
    value: userStats.value?.new_users_this_month || 0,
    icon: 'mdi-account-plus',
    color: 'info'
  }
])

// Table actions for DataTable component
const tableActions = [
  {
    key: 'activity',
    icon: 'mdi-chart-line',
    color: 'info',
    title: 'View Activity'
  },
  {
    key: 'edit',
    icon: 'mdi-pencil',
    color: 'primary',
    title: 'Edit User'
  },
  {
    key: 'reset',
    icon: 'mdi-lock-reset',
    color: 'warning',
    title: 'Reset Password'
  },
  {
    key: 'delete',
    icon: 'mdi-delete',
    color: 'error',
    title: 'Delete User'
  }
]

// API Methods
const loadUsers = async (searchQuery?: string, roleQuery?: string, statusQuery?: string) => {
  try {
    loading.value = true
    const response = await userService.getUsers(1, 100, searchQuery, roleQuery, statusQuery)
    users.value = response.data
    filteredUsers.value = response.data
  } catch (error) {
    console.error('Error loading users:', error)
    showError('Failed to load users')
  } finally {
    loading.value = false
  }
}

const loadUserStats = async () => {
  try {
    const response = await userService.getUserStats()
    userStats.value = response.data
  } catch (error) {
    console.error('Error loading user stats:', error)
  }
}

const loadRoles = async () => {
  try {
    const response = await userService.getRoles()
    roles.value = response.data.map(role => ({
      label: role.name.charAt(0).toUpperCase() + role.name.slice(1),
      value: role.name
    }))
  } catch (error) {
    console.error('Error loading roles:', error)
  }
}

// Event handlers for new components
const handleHeaderAction = (action: string) => {
  if (action === 'add') {
    showAddDialog.value = true
  }
}

const handleFilterChange = async (payload: { key: string; value: any }) => {
  if (payload.key === 'role') {
    roleFilter.value = payload.value
  } else if (payload.key === 'status') {
    statusFilter.value = payload.value
  }

  // Reload users with current filters
  await loadUsers(search.value, roleFilter.value, statusFilter.value)
}

const handleTableAction = (payload: { action: string; item: any }) => {
  const { action, item } = payload

  switch (action) {
    case 'activity':
      viewUserActivity(item)
      break
    case 'edit':
      editUser(item)
      break
    case 'reset':
      resetPassword(item)
      break
    case 'delete':
      deleteUser(item)
      break
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
    showError('Failed to load user activity')
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
    password: '',
    profile_picture: user.profile_picture || '',
    verified: user.verified || false,
    confirmPassword: ''
  }
  showAddDialog.value = true
}

const resetPassword = (user: User) => {
  resetPasswordData.value = {
    userId: user.id,
    newPassword: '',
    confirmPassword: ''
  }
  showResetPasswordDialog.value = true
}

const openResetPasswordDialog = () => {
  if (editingUser.value) {
    resetPasswordData.value = {
      userId: editingUser.value.id,
      newPassword: '',
      confirmPassword: ''
    }
    showResetPasswordDialog.value = true
  }
}

const closeDialog = () => {
  showAddDialog.value = false
  editingUser.value = null
  userFormData.value = {
    name: '',
    email: '',
    role: '',
    status: 'active',
    password: '',
    profile_picture: '',
    verified: false,
    confirmPassword: ''
  }
}

const closeResetPasswordDialog = () => {
  showResetPasswordDialog.value = false
  resetPasswordData.value = {
    userId: '',
    newPassword: '',
    confirmPassword: ''
  }
}

const confirmResetPassword = async () => {
  resetPasswordLoading.value = true
  try {
    const response = await userService.resetPassword(resetPasswordData.value.userId, {
      password: resetPasswordData.value.newPassword
    })

    if (response.success) {
      showSuccess('User password has been reset successfully')
      closeResetPasswordDialog()
    }
  } catch (error) {
    showError('Failed to reset password')
  } finally {
    resetPasswordLoading.value = false
  }
}

const deleteUser = (user: User) => {
  userToDelete.value = user
  showDeleteDialog.value = true
}

const confirmDeleteUser = async () => {
  if (!userToDelete.value) return

  deleteLoading.value = true
  try {
    const response = await userService.deleteUser(userToDelete.value.id)
    if (response.success) {
      await loadUsers() // Reload users
      showSuccess(`${userToDelete.value.name} has been deleted successfully`)
      closeDeleteDialog()
    }
  } catch (error) {
    showError('Failed to delete user')
  } finally {
    deleteLoading.value = false
  }
}

const closeDeleteDialog = () => {
  showDeleteDialog.value = false
  userToDelete.value = null
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
        active: userFormData.value.status === 'active',
        profile_picture: userFormData.value.profile_picture,
        verified: userFormData.value.verified
      })

      if (response.success) {
        showSuccess(`${userFormData.value.name} has been updated successfully`)
      }
    } else {
      // Create new user
      response = await userService.createUser({
        name: userFormData.value.name,
        email: userFormData.value.email,
        password: userFormData.value.password,
        role: userFormData.value.role,
        active: userFormData.value.status === 'active',
        profile_picture: userFormData.value.profile_picture,
        verified: userFormData.value.verified
      })

      if (response.success) {
        showSuccess(`${userFormData.value.name} has been created successfully`)
      }
    }

    if (response.success) {
      await loadUsers() // Reload users
      closeDialog()
    }
  } catch (error) {
    showError('Failed to save user')
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

  showSuccess('User data has been exported successfully')
}

// Watchers
let searchTimeout: NodeJS.Timeout
watch(search, async (newSearch) => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(async () => {
    await loadUsers(newSearch, roleFilter.value, statusFilter.value)
  }, 300)
})

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadUsers(),
    loadUserStats(),
    loadRoles()
  ])
})
</script>
