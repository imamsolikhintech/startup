<template>
  <v-layout>
    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :permanent="!isMobile"
      :temporary="isMobile"
      class="dashboard-drawer"
      width="280"
    >
      <!-- Header -->
      <div class="drawer-header">
        <v-icon size="32" color="primary" class="mr-3">mdi-view-dashboard</v-icon>
        <span class="text-h6 font-weight-bold">Vue Admin</span>
      </div>

      <!-- User Profile Section -->
      <v-card class="mx-4 mb-4" variant="outlined" rounded="lg">
        <v-card-text class="pa-3">
          <div class="d-flex align-center">
            <v-avatar size="40" class="mr-3">
              <v-img :src="authStore.user?.avatar" alt="User Avatar" />
            </v-avatar>
            <div class="flex-grow-1">
              <div class="text-subtitle-2 font-weight-medium">{{ authStore.user?.name }}</div>
              <div class="text-caption text-medium-emphasis">{{ authStore.user?.role }}</div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Navigation Menu -->
      <v-list nav density="compact" class="px-2">
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          rounded="xl"
          class="mb-1"
        >
          <template v-if="item.badge" #append>
            <v-badge :content="item.badge" color="error" inline />
          </template>
        </v-list-item>
      </v-list>

      <!-- Logout Button -->
      <!-- <template #append>
        <v-divider class="mx-4 mb-2" />
        <v-list-item
          prepend-icon="mdi-logout"
          title="Logout"
          @click="handleLogout"
          class="mx-2 mb-2"
          rounded="xl"
        />
      </template> -->
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar
      elevation="1"
      class="dashboard-appbar"
      :class="{ 'blur-background': scrolled }"
    >
      <v-app-bar-nav-icon
        v-if="isMobile"
        @click="drawer = !drawer"
      />
      
      <v-app-bar-title class="font-weight-bold">
        {{ currentPageTitle }}
      </v-app-bar-title>

      <v-spacer />

      <!-- Search -->
      <!-- <v-text-field
        v-model="searchQuery"
        hide-details
        placeholder="Search..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        style="max-width: 300px"
        class="mr-4 d-none d-sm-flex"
        rounded
      /> -->

      <!-- Theme Toggle -->
      <v-btn
        icon="mdi-theme-light-dark"
        variant="text"
        @click="toggleTheme"
        class="mr-2"
      />

      <!-- Notifications -->
      <v-menu offset-y>
        <template #activator="{ props }">
          <v-btn
            icon
            variant="text"
            v-bind="props"
            class="mr-2"
          >
            <v-badge
              :content="notificationStore.unreadCount"
              :model-value="notificationStore.unreadCount > 0"
              color="error"
            >
              <v-icon>mdi-bell</v-icon>
            </v-badge>
          </v-btn>
        </template>
        <NotificationDropdown />
      </v-menu>

      <!-- User Menu -->
      <v-menu offset-y>
        <template #activator="{ props }">
          <v-btn variant="text" v-bind="props">
            <v-avatar size="32" class="mr-2">
              <v-img :src="authStore.user?.avatar" alt="User Avatar" />
            </v-avatar>
            <span class="d-none d-sm-inline">{{ authStore.user?.name }}</span>
            <v-icon>mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        
        <v-card min-width="200">
          <v-list>
            <v-list-item to="/profile" prepend-icon="mdi-account">
              <v-list-item-title>Profile</v-list-item-title>
            </v-list-item>
            <v-list-item to="/settings" prepend-icon="mdi-cog">
              <v-list-item-title>Settings</v-list-item-title>
            </v-list-item>
            <v-divider />
            <v-list-item @click="handleLogout" prepend-icon="mdi-logout">
              <v-list-item-title>Logout</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </v-app-bar>

    <!-- Main Content -->
    <v-main class="dashboard-main">
      <v-container fluid class="pa-4">
        <router-view />
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDisplay, useTheme } from 'vuetify'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import { usePageLoaderStore } from '@/stores/pageLoader'
import { useThemeStore } from '@/stores/theme'
import NotificationDropdown from '@/components/notifications/NotificationDropdown.vue'

const router = useRouter()
const route = useRoute()
const { mobile } = useDisplay()
const theme = useTheme()

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const pageLoaderStore = usePageLoaderStore()
const themeStore = useThemeStore()

const drawer = ref(!mobile.value)
const searchQuery = ref('')
const scrolled = ref(false)

const isMobile = computed(() => mobile.value)

const currentPageTitle = computed(() => {
  const titles: Record<string, string> = {
    'Dashboard': 'Dashboard Overview',
    'Users': 'User Management',
    'Analytics': 'Analytics & Reports',
    'Settings': 'Application Settings',
    'Profile': 'User Profile'
  }
  return titles[route.name as string] || 'Dashboard'
})

const menuItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/dashboard' },
  { title: 'Users', icon: 'mdi-account-multiple', to: '/users', badge: '12' },
  { title: 'Analytics', icon: 'mdi-chart-line', to: '/analytics' },
  { title: 'Settings', icon: 'mdi-cog', to: '/settings' },
]

const handleLogout = () => {
  authStore.logout(router)
}

const toggleTheme = () => {
  themeStore.toggleTheme(theme)
}

const handleScroll = () => {
  scrolled.value = window.scrollY > 10
}

// Watch for route changes to show loading (for dashboard pages)
watch(
  () => route.path,
  (newPath, oldPath) => {
    if (newPath !== oldPath && !newPath.startsWith('/auth')) {
      pageLoaderStore.startLoading('Loading page...')
      // Simulate loading time for better UX
      setTimeout(() => {
        pageLoaderStore.stopLoading()
      }, 800)
    }
  }
)

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  // Initialize theme from cookies
  themeStore.initializeTheme(theme)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.dashboard-drawer {
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.drawer-header {
  display: flex;
  align-items: center;
  padding: 1.5rem 1rem;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  margin-bottom: 1rem;
}

.dashboard-appbar {
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.blur-background {
  background-color: rgba(var(--v-theme-surface), 0.8) !important;
}

.dashboard-main {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.02) 0%, rgba(var(--v-theme-secondary), 0.02) 100%);
  min-height: 100vh;
}

:deep(.v-list-item--active) {
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgba(var(--v-theme-primary));
}

:deep(.v-list-item--active .v-icon) {
  color: rgba(var(--v-theme-primary));
}
</style>