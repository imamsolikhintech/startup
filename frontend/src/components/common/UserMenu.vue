<template>
  <n-dropdown 
    :options="userMenuOptions" 
    @select="handleUserMenuSelect"
    trigger="click"
    placement="bottom-end"
  >
    <n-button 
      circle 
      quaternary 
      class="user-menu-btn"
      :class="{ 'mobile-hidden-info': isMobile }"
    >
      <template #icon>
        <n-avatar 
          :size="32" 
          :src="currentUser.avatar" 
          :fallback-src="'/default-avatar.png'"
        >
          {{ currentUser.name?.charAt(0)?.toUpperCase() || 'U' }}
        </n-avatar>
      </template>
      <template v-if="!isMobile">
        <div class="user-info">
          <div class="user-name">{{ currentUser.name || 'User' }}</div>
          <div class="user-role">{{ currentUser.role || 'Member' }}</div>
        </div>
        <n-icon class="dropdown-arrow" :class="{ 'mobile-hidden': isMobile }">
          <ChevronDownOutline />
        </n-icon>
      </template>
    </n-button>
  </n-dropdown>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { NIcon, NAvatar, NButton, NDropdown } from 'naive-ui'
import { 
  PersonCircleOutline, 
  SettingsOutline, 
  LogOutOutline,
  ChevronDownOutline 
} from '@vicons/ionicons5'
import type { DropdownOption, Component } from 'naive-ui'

const router = useRouter()
const authStore = useAuthStore()

// Responsive detection
const isMobile = computed(() => {
  if (typeof window !== 'undefined') {
    return window.innerWidth < 768
  }
  return false
})

// Safe user data with fallbacks
const currentUser = computed(() => {
  const user = authStore.user
  return {
    name: user?.name || 'User',
    email: user?.email || '',
    role: user?.role || 'Member',
    avatar: user?.avatar || ''
  }
})

// Icon renderer function
function renderIcon(icon: Component) {
  return () => {
    return h(NIcon, null, {
      default: () => h(icon)
    })
  }
}

// User menu options
const userMenuOptions = computed((): DropdownOption[] => [
  {
    label: 'Profile',
    key: 'profile',
    icon: renderIcon(PersonCircleOutline)
  },
  {
    label: 'Edit Profile',
    key: 'editProfile',
    icon: renderIcon(SettingsOutline)
  },
  {
    type: 'divider',
    key: 'divider'
  },
  {
    label: 'Logout',
    key: 'logout',
    icon: renderIcon(LogOutOutline)
  }
])

// Handle menu selection
const handleUserMenuSelect = (key: string) => {
  switch (key) {
    case 'profile':
      router.push('/profile')
      break
    case 'editProfile':
      router.push('/profile/edit')
      break
    case 'logout':
      handleLogout()
      break
  }
}

// Handle logout
const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>

<style scoped>
.user-menu-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  height: auto;
  min-height: 40px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 8px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
}

.user-role {
  font-size: 12px;
  opacity: 0.7;
  line-height: 1.2;
}

.dropdown-arrow {
  margin-left: 4px;
  transition: transform 0.2s ease;
}

@media (max-width: 768px) {
  .mobile-hidden {
    display: none;
  }
  
  .mobile-hidden-info .user-info {
    display: none;
  }
  
  .user-menu-btn {
    padding: 4px;
    min-height: 40px;
    width: 40px;
    height: 40px;
  }
}
</style>