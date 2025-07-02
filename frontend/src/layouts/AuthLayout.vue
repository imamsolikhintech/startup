<template>
  <div class="auth-container">
    <!-- Theme Toggle -->
    <div class="theme-toggle-wrapper">
      <ThemeToggle size="medium" />
    </div>

    <div class="auth-layout">
      <!-- Left Panel - Branding -->
      <div class="auth-brand-panel">
        <div class="brand-content">
          <n-icon :size="64" class="brand-icon">
            <component :is="getDashboardIcon()" />
          </n-icon>
          <h1 class="brand-title">Vue Admin</h1>
          <p class="brand-subtitle">
            Modern dashboard solution for your business needs
          </p>
          <div class="feature-list">
            <div class="feature-item" v-for="feature in features" :key="feature.icon">
              <n-icon :size="20" class="feature-icon">
                <component :is="getFeatureIcon(feature.icon)" />
              </n-icon>
              <span class="feature-text">{{ feature.text }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel - Forms -->
      <div class="auth-form-panel">
        <div class="form-container">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { h } from 'vue'
import ThemeToggle from '@/components/common/ThemeToggle.vue'

const features = [
  { icon: 'mdi-chart-line', text: 'Advanced Analytics' },
  { icon: 'mdi-shield-check', text: 'Secure Authentication' },
  { icon: 'mdi-responsive', text: 'Responsive Design' },
  { icon: 'mdi-palette', text: 'Customizable Themes' }
]

const getDashboardIcon = () => {
  return () => h('svg', { viewBox: '0 0 24 24' }, [
    h('path', { fill: 'currentColor', d: 'M13,3V9H21V3M13,21H21V11H13M3,21H11V15H3M3,13H11V3H3V13Z' })
  ])
}

const getFeatureIcon = (iconName: string) => {
  const iconMap: Record<string, any> = {
    'mdi-chart-line': () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z' })
    ]),
    'mdi-shield-check': () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1Z' })
    ]),
    'mdi-responsive': () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M4,6H20V16H4M20,18A2,2 0 0,0 22,16V6C22,4.89 21.1,4 20,4H4C2.89,4 2,4.89 2,6V16A2,2 0 0,0 4,18H0V20H24V18H20Z' })
    ]),
    'mdi-palette': () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M17.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,9A1.5,1.5 0 0,1 19,10.5A1.5,1.5 0 0,1 17.5,12M14.5,8A1.5,1.5 0 0,1 13,6.5A1.5,1.5 0 0,1 14.5,5A1.5,1.5 0 0,1 16,6.5A1.5,1.5 0 0,1 14.5,8M9.5,8A1.5,1.5 0 0,1 8,6.5A1.5,1.5 0 0,1 9.5,5A1.5,1.5 0 0,1 11,6.5A1.5,1.5 0 0,1 9.5,8M6.5,12A1.5,1.5 0 0,1 5,10.5A1.5,1.5 0 0,1 6.5,9A1.5,1.5 0 0,1 8,10.5A1.5,1.5 0 0,1 6.5,12M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A1.5,1.5 0 0,0 13.5,19.5C13.5,19.11 13.35,18.76 13.11,18.5C12.88,18.23 12.73,17.88 12.73,17.5A1.5,1.5 0 0,1 14.23,16H16A5,5 0 0,0 21,11C21,6.58 16.97,3 12,3Z' })
    ])
  }

  return iconMap[iconName] || (() => h('svg', { viewBox: '0 0 24 24' }, [
    h('path', { fill: 'currentColor', d: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z' })
  ]))
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  background-image: url('https://png.pngtree.com/background/20210714/original/pngtree-abstract-system-technology-background-picture-image_1229183.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}


.auth-layout {
  display: flex;
  min-height: 100vh;
}

.auth-brand-panel {
  flex: 1;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
}

.theme-toggle-wrapper {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  padding: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.theme-toggle-wrapper:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

/* Dark theme for toggle wrapper */
[data-theme="dark"] .theme-toggle-wrapper,
.dark .theme-toggle-wrapper {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

[data-theme="dark"] .theme-toggle-wrapper:hover,
.dark .theme-toggle-wrapper:hover {
  background: rgba(0, 0, 0, 0.3);
}

.brand-content {
  text-align: center;
  max-width: 400px;
}

.brand-icon {
  color: white;
  margin-bottom: 1.5rem;
  display: block;
}

.brand-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: white;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.brand-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
  line-height: 1.4;
}

.feature-list {
  text-align: left;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem 0;
}

.feature-icon {
  color: white;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.feature-text {
  color: white;
  font-size: 1rem;
  font-weight: 500;
}

.auth-form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  /* background: rgba(255, 255, 255, 0.95); */
  backdrop-filter: blur(10px);
}

.form-container {
  width: 100%;
  max-width: 400px;
}

/* Responsive Design */
@media (min-width: 768px) {
  .auth-brand-panel {
    display: flex;
  }

  .auth-form-panel {
    /* background: rgba(255, 255, 255, 0.98); */
  }
}

@media (max-width: 767px) {
  .auth-layout {
    flex-direction: column;
  }

  .auth-form-panel {
    min-height: 100vh;
    /* background: rgba(255, 255, 255, 0.95); */
  }

  .brand-title {
    font-size: 2rem;
  }

  .brand-subtitle {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .auth-form-panel {
    padding: 1rem;
  }

  .brand-content {
    max-width: 300px;
  }

  .brand-title {
    font-size: 1.75rem;
  }

  .feature-text {
    font-size: 0.9rem;
  }
}
</style>
