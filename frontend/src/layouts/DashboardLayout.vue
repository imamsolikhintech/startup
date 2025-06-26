<template>
  <n-layout has-sider class="dashboard-layout">
    <!-- Navigation Drawer -->
    <n-layout-sider :collapsed="!drawer" @update:collapsed="(value: boolean) => drawer = !value" :collapsed-width="0"
      :width="280" :native-scrollbar="false" class="dashboard-drawer" show-trigger="bar" collapse-mode="width" bordered>
      <!-- Brand Header -->
      <div class="drawer-header">
        <div class="brand-container">
          <n-icon size="32" color="#1976D2" class="brand-icon">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M13,3V9H21V3M13,21H21V11H13M3,21H11V15H3M3,13H11V3H3V13Z" />
            </svg>
          </n-icon>
          <span class="brand-text">OFFICE</span>
        </div>
      </div>

      <!-- User Profile Section -->
      <div class="user-profile-section">
        <n-card class="user-profile-card" size="small">
          <div class="user-profile-content">
            <n-avatar size="medium" class="user-avatar" :src="authStore.user?.avatar"
              fallback-src="/default-avatar.png" />
            <div class="user-info">
              <div class="user-name">{{ authStore.user?.name || 'Guest User' }}</div>
              <div class="user-role">{{ authStore.user?.role || 'User' }}</div>
            </div>
          </div>
        </n-card>
      </div>

      <!-- Navigation Menu -->
      <div class="navigation-section">
        <n-menu :options="menuOptions" :value="currentRoute" @update:value="handleMenuSelect" class="navigation-menu"
          :indent="24" />
      </div>
    </n-layout-sider>

    <n-layout class="main-layout">
      <!-- App Bar -->
      <n-layout-header class="dashboard-appbar" :class="{ 'scrolled': scrolled }">
        <div class="appbar-content">
          <!-- Mobile Menu Toggle -->
          <n-button v-if="isMobile" text circle @click="drawer = !drawer" class="mobile-menu-btn">
            <template #icon>
              <n-icon size="20">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z" />
                </svg>
              </n-icon>
            </template>
          </n-button>

          <!-- Page Title -->
          <div class="page-title-section">
            <h1 class="page-title">{{ currentPageTitle }}</h1>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <!-- Theme Toggle -->
            <ThemeToggle />
                                                                        
            <!-- Notifications -->
            <!-- <n-dropdown trigger="click" placement="bottom-end" :show-arrow="false">
              <template #trigger>
                <n-button text circle class="action-btn">
                  <template #icon>
                    <n-badge :value="notificationStore.unreadCount" :max="99" show-zero="false">
                      <n-icon size="20">
                        <svg viewBox="0 0 24 24">
                          <path fill="currentColor"
                            d="M12,2A2,2 0 0,1 14,4V4.29C16.97,5.17 19,7.9 19,11V17L21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29V4A2,2 0 0,1 12,2M10,21A2,2 0 0,0 12,23A2,2 0 0,0 14,21" />
                        </svg>
                      </n-icon>
                    </n-badge>
                  </template>
                </n-button>
              </template>
              <template #default>
                <NotificationDropdown />
              </template>
            </n-dropdown> -->

            <!-- User Menu -->
            <UserMenu />
          </div>
        </div>
      </n-layout-header>

      <!-- Main Content -->
      <n-layout-content class="dashboard-main">
        <div class="main-content">
          <router-view />
        </div>
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, h } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import { usePageLoaderStore } from '@/stores/pageLoader'
import { useThemeStore } from '@/stores/theme'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import UserMenu from '@/components/common/UserMenu.vue'
// import NotificationDropdown from '@/components/notifications/NotificationDropdown.vue'
import type { MenuOption } from 'naive-ui'

const router = useRouter()
const route = useRoute()

const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const pageLoaderStore = usePageLoaderStore()
const themeStore = useThemeStore()

const drawer = ref(true)
const searchQuery = ref('')
const scrolled = ref(false)

// Mobile detection
const isMobile = computed(() => {
  if (typeof window !== 'undefined') {
    return window.innerWidth < 768
  }
  return false
})

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

// Current route for menu selection
const currentRoute = computed(() => route.path)

// Menu options for Naive UI
const menuOptions = computed((): MenuOption[] => [
  {
    label: 'Dashboard',
    key: '/dashboard',
    icon: () => h('svg', { viewBox: '0 0 24 24' }, h('path', { fill: 'currentColor', d: 'M13,3V9H21V3M13,21H21V11H13M3,21H11V15H3M3,13H11V3H3V13Z' }))
  },
  {
    label: 'Users',
    key: '/users',
    icon: () => h('svg', { viewBox: '0 0 24 24' }, h('path', { fill: 'currentColor', d: 'M16,4C18.21,4 20,5.79 20,8C20,10.21 18.21,12 16,12C13.79,12 12,10.21 12,8C12,5.79 13.79,4 16,4M16,14C20.42,14 24,15.79 24,18V20H8V18C8,15.79 11.58,14 16,14M6,6H10V8H6V6M6,10H10V12H6V10M6,14H10V16H6V14Z' }))
  },
  {
    label: 'Analytics',
    key: '/analytics',
    icon: () => h('svg', { viewBox: '0 0 24 24' }, h('path', { fill: 'currentColor', d: 'M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z' }))
  },
  {
    label: 'Settings',
    key: '/settings',
    icon: () => h('svg', { viewBox: '0 0 24 24' }, h('path', { fill: 'currentColor', d: 'M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z' }))
  }
])



// Event handlers
const handleMenuSelect = (key: string) => {
  router.push(key)
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
  themeStore.initializeTheme()
  // Set initial drawer state based on screen size
  drawer.value = !isMobile.value

  // Add some demo notifications for testing
  // setTimeout(() => {
  //   notificationStore.showSuccess('Welcome to your dashboard!', 'Welcome')
  //   notificationStore.showInfo('Your profile has been updated successfully', 'Profile Update')
  //   notificationStore.showWarning('Please update your password for better security', 'Security Alert')
  //   notificationStore.showError('Failed to sync data. Please try again.', 'Sync Error')
  // }, 1000)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* CSS Custom Properties for Layout Configuration */
:root {
  /* Content Width Variables */
  --content-max-width-xs: 100%;
  --content-max-width-sm: 100%;
  --content-max-width-md: 100%;
  --content-max-width-lg: 1200px;
  --content-max-width-xl: 1400px;
  --content-max-width-2xl: 1600px;
  
  /* Content Padding Variables */
  --content-padding-xs: 12px;
  --content-padding-sm: 16px;
  --content-padding-md: 20px;
  --content-padding-lg: 24px;
  --content-padding-xl: 32px;
  --content-padding-2xl: 40px;
  
  /* Responsive Breakpoints */
  --breakpoint-xs: 480px;
  --breakpoint-sm: 768px;
  --breakpoint-md: 1024px;
  --breakpoint-lg: 1280px;
  --breakpoint-xl: 1440px;
  --breakpoint-2xl: 1920px;
}

/* Layout Structure */
.dashboard-layout {
  height: 100vh;
  overflow: hidden;
}

.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Sidebar Styling */
.dashboard-drawer {
  background: var(--n-color);
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Brand Header */
.drawer-header {
  padding: 20px;
  border-bottom: 1px solid var(--n-border-color);
  background: var(--n-color);
}

.brand-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-icon {
  flex-shrink: 0;
}

.brand-text {
  font-size: 18px;
  font-weight: 700;
  color: var(--n-text-color);
  letter-spacing: 0.5px;
}

/* User Profile Section */
.user-profile-section {
  padding: 16px;
}

.user-profile-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--n-border-color);
}

.user-profile-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
}

.user-avatar {
  flex-shrink: 0;
  border: 2px solid var(--n-border-color);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--n-text-color);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: var(--n-text-color-disabled);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Navigation Section */
.navigation-section {
  flex: 1;
  padding: 0 16px 16px;
}

.navigation-menu {
  border-radius: 8px;
}

/* App Bar */
.dashboard-appbar {
  background: var(--n-color);
  border-bottom: 1px solid var(--n-border-color);
  transition: all 0.2s ease;
  height: 56px;
  flex-shrink: 0;
  z-index: 100;
}

.dashboard-appbar.scrolled {
  box-shadow: 0 1px 8px rgba(0, 0, 0, 0.04);
}

.appbar-content {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 20px;
  gap: 12px;
  max-width: 100%;
}

.mobile-menu-btn {
  flex-shrink: 0;
}

.page-title-section {
  flex: 1;
  min-width: 0;
}

.page-title {
  font-size: 18px;
  font-weight: 500;
  color: var(--n-text-color);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.action-btn {
  transition: all 0.15s ease;
}

.action-btn:hover {
  background: var(--n-color-hover);
}



/* Main Content */
.dashboard-main {
  background: var(--n-body-color);
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.main-content {
  padding: var(--content-padding-lg);
  max-width: var(--content-max-width-lg);
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  
  /* Smooth transitions for responsive changes */
  transition: max-width 0.3s ease, padding 0.3s ease;
}

/* Menu Item Styling */
:deep(.n-menu .n-menu-item) {
  margin: 4px 0;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.n-menu .n-menu-item:hover) {
  background: var(--n-color-hover);
  transform: translateX(4px);
}

:deep(.n-menu .n-menu-item.n-menu-item--selected) {
  background: var(--n-color-target);
  color: var(--n-text-color);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Card Styling */
:deep(.n-card) {
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.n-card:hover) {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* Badge Styling */
:deep(.n-badge) {
  font-weight: 600;
}

/* Dropdown Styling */
:deep(.n-dropdown-menu) {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid var(--n-border-color);
  backdrop-filter: blur(12px);
}

/* Enhanced Responsive Design with CSS Custom Properties */

/* Extra Small Devices (phones, less than 480px) */
@media (max-width: 479px) {
  .dashboard-drawer {
    position: fixed;
    z-index: 1000;
    top: 0;
    left: 0;
    height: 100vh;
  }

  .appbar-content {
    padding: 0 var(--content-padding-xs);
    gap: 8px;
  }

  .main-content {
    max-width: var(--content-max-width-xs);
    padding: var(--content-padding-xs);
  }

  .page-title {
    font-size: 14px;
  }

  .action-buttons {
    gap: 2px;
  }
}

/* Small Devices (phones, 480px to 767px) */
@media (min-width: 480px) and (max-width: 767px) {
  .dashboard-drawer {
    position: fixed;
    z-index: 1000;
    top: 0;
    left: 0;
    height: 100vh;
  }

  .appbar-content {
    padding: 0 var(--content-padding-sm);
    gap: 8px;
  }

  .main-content {
    max-width: var(--content-max-width-sm);
    padding: var(--content-padding-sm);
  }

  .page-title {
    font-size: 16px;
  }

  .action-buttons {
    gap: 4px;
  }
}

/* Medium Devices (tablets, 768px to 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .appbar-content {
    padding: 0 var(--content-padding-md);
  }

  .main-content {
    max-width: var(--content-max-width-md);
    padding: var(--content-padding-md);
  }
}

/* Large Devices (desktops, 1024px to 1279px) */
@media (min-width: 1024px) and (max-width: 1279px) {
  .main-content {
    max-width: var(--content-max-width-lg);
    padding: var(--content-padding-lg);
  }
}

/* Extra Large Devices (large desktops, 1280px to 1439px) */
@media (min-width: 1280px) and (max-width: 1439px) {
  .main-content {
    max-width: var(--content-max-width-xl);
    padding: var(--content-padding-xl);
  }
}

/* 2X Large Devices (very large desktops, 1440px and up) */
@media (min-width: 1440px) {
  .main-content {
    max-width: var(--content-max-width-2xl);
    padding: var(--content-padding-2xl);
  }
}

/* Ultra Wide Displays (2560px and up) */
@media (min-width: 2560px) {
  .main-content {
    max-width: 1800px; /* Fixed max for ultra-wide displays */
    padding: 48px;
  }
}

/* Content Width Utility Classes */
.content-narrow {
  --content-max-width-lg: 800px;
  --content-max-width-xl: 1000px;
  --content-max-width-2xl: 1200px;
}

.content-wide {
  --content-max-width-lg: 1400px;
  --content-max-width-xl: 1600px;
  --content-max-width-2xl: 1800px;
}

.content-full {
  --content-max-width-xs: 100%;
  --content-max-width-sm: 100%;
  --content-max-width-md: 100%;
  --content-max-width-lg: 100%;
  --content-max-width-xl: 100%;
  --content-max-width-2xl: 100%;
}

/* Compact Padding Utility */
.content-compact {
  --content-padding-xs: 8px;
  --content-padding-sm: 12px;
  --content-padding-md: 16px;
  --content-padding-lg: 20px;
  --content-padding-xl: 24px;
  --content-padding-2xl: 28px;
}

/* Spacious Padding Utility */
.content-spacious {
  --content-padding-xs: 16px;
  --content-padding-sm: 20px;
  --content-padding-md: 28px;
  --content-padding-lg: 36px;
  --content-padding-xl: 44px;
  --content-padding-2xl: 52px;
}

/* Animation Classes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Content Container Variants */
.main-content.centered {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-content.full-height {
  min-height: calc(100vh - 56px); /* Subtract header height */
}

/* Print Styles */
@media print {
  .main-content {
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
  }
}

/* Scrollbar Styling */
.dashboard-drawer::-webkit-scrollbar {
  width: 4px;
}

.dashboard-drawer::-webkit-scrollbar-track {
  background: transparent;
}

.dashboard-drawer::-webkit-scrollbar-thumb {
  background: var(--n-scrollbar-color);
  border-radius: 2px;
}

.dashboard-drawer::-webkit-scrollbar-thumb:hover {
  background: var(--n-scrollbar-color-hover);
}

.dashboard-main::-webkit-scrollbar {
  width: 6px;
}

.dashboard-main::-webkit-scrollbar-track {
  background: var(--n-body-color);
}

.dashboard-main::-webkit-scrollbar-thumb {
  background: var(--n-scrollbar-color);
  border-radius: 3px;
}

.dashboard-main::-webkit-scrollbar-thumb:hover {
  background: var(--n-scrollbar-color-hover);
}
</style>
