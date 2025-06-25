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
        <template #item.avatar="{ item }">
          <v-avatar size="40">
            <v-img :src="item.avatar" :alt="item.name" />
          </v-avatar>
        </template>

        <template #item.status="{ item }">
          <v-chip
            :color="item.status === 'active' ? 'success' : 'error'"
            size="small"
            variant="tonal"
          >
            {{ item.status }}
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

        <template #item.lastLogin="{ item }">
          {{ formatDate(item.lastLogin) }}
        </template>

        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="text"
            @click="editUser(item)"
          />
          <v-btn
            icon="mdi-delete"
            size="small"
            variant="text"
            color="error"
            @click="deleteUser(item)"
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notifications'

const notificationStore = useNotificationStore()

const search = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const loading = ref(false)
const saving = ref(false)
const showAddDialog = ref(false)
const editingUser = ref<any>(null)

const userForm = ref()
const userFormData = ref({
  name: '',
  email: '',
  role: '',
  status: 'active',
  password: ''
})

const roles = ['admin', 'user', 'moderator', 'viewer']
const statuses = ['active', 'inactive']

const headers = [
  { title: 'Avatar', key: 'avatar', sortable: false },
  { title: 'Name', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'Role', key: 'role' },
  { title: 'Status', key: 'status' },
  { title: 'Last Login', key: 'lastLogin' },
  { title: 'Actions', key: 'actions', sortable: false }
]

const users = ref([
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    status: 'active',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
    lastLogin: new Date('2024-01-15T10:30:00')
  },
  {
    id: 2,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    role: 'user',
    status: 'active',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
    lastLogin: new Date('2024-01-14T15:45:00')
  },
  {
    id: 3,
    name: 'Bob Smith',
    email: 'bob@example.com',
    role: 'moderator',
    status: 'inactive',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1',
    lastLogin: new Date('2024-01-10T09:15:00')
  }
])

const filteredUsers = computed(() => {
  let filtered = users.value

  if (roleFilter.value) {
    filtered = filtered.filter(user => user.role === roleFilter.value)
  }

  if (statusFilter.value) {
    filtered = filtered.filter(user => user.status === statusFilter.value)
  }

  return filtered
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

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const editUser = (user: any) => {
  editingUser.value = user
  userFormData.value = { ...user, password: '' }
  showAddDialog.value = true
}

const deleteUser = (user: any) => {
  if (confirm(`Are you sure you want to delete ${user.name}?`)) {
    const index = users.value.findIndex(u => u.id === user.id)
    if (index > -1) {
      users.value.splice(index, 1)
      notificationStore.addNotification({
        title: 'User Deleted',
        message: `${user.name} has been removed`,
        type: 'success'
      })
    }
  }
}

const saveUser = async () => {
  const { valid } = await userForm.value.validate()
  if (!valid) return

  saving.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (editingUser.value) {
      // Update existing user
      const index = users.value.findIndex(u => u.id === editingUser.value.id)
      if (index > -1) {
        users.value[index] = { ...users.value[index], ...userFormData.value }
      }
      notificationStore.addNotification({
        title: 'User Updated',
        message: `${userFormData.value.name} has been updated`,
        type: 'success'
      })
    } else {
      // Add new user
      const newUser = {
        ...userFormData.value,
        id: Math.max(...users.value.map(u => u.id)) + 1,
        avatar: `https://images.pexels.com/photos/${Math.floor(Math.random() * 1000000)}/pexels-photo-${Math.floor(Math.random() * 1000000)}.jpeg?auto=compress&cs=tinysrgb&w=64&h=64&dpr=1`,
        lastLogin: new Date()
      }
      users.value.push(newUser)
      notificationStore.addNotification({
        title: 'User Created',
        message: `${userFormData.value.name} has been added`,
        type: 'success'
      })
    }

    showAddDialog.value = false
    editingUser.value = null
    userFormData.value = {
      name: '',
      email: '',
      role: '',
      status: 'active',
      password: ''
    }
  } catch (error) {
    notificationStore.addNotification({
      title: 'Error',
      message: 'Failed to save user',
      type: 'error'
    })
  } finally {
    saving.value = false
  }
}

const exportUsers = () => {
  notificationStore.addNotification({
    title: 'Export Started',
    message: 'User data is being exported...',
    type: 'info'
  })
}

onMounted(() => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
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