<template>
  <div class="page-header">
    <div class="header-content">
      <div class="header-text">
        <h1 class="header-title">{{ title }}</h1>
        <p class="header-subtitle" v-if="subtitle">
          {{ subtitle }}
        </p>
      </div>
      <div class="header-actions" v-if="actions && actions.length > 0">
        <n-button
          v-for="action in actions"
          :key="action.key"
          :type="getButtonType(action.color || 'primary')"
          :size="action.size || 'large'"
          :secondary="action.variant === 'outlined'"
          :text="action.variant === 'text'"
          :class="action.class"
          @click="$emit('action', action.key)"
        >
          <template #icon v-if="action.icon">
            <n-icon>
              <component :is="getIconComponent(action.icon)" />
            </n-icon>
          </template>
          {{ action.label }}
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton, NIcon } from 'naive-ui'
import { h } from 'vue'

interface Action {
  key: string
  label: string
  icon?: string
  color?: string
  size?: string
  variant?: string
  class?: string
}

interface Props {
  title: string
  subtitle?: string
  actions?: Action[]
}

defineProps<Props>()
defineEmits<{
  action: [key: string]
}>()

const getButtonType = (color: string) => {
  switch (color) {
    case 'primary': return 'primary'
    case 'success': return 'success'
    case 'warning': return 'warning'
    case 'error': return 'error'
    case 'info': return 'info'
    default: return 'primary'
  }
}

const getIconComponent = (iconName?: string) => {
  if (!iconName) return null
  
  // Map common MDI icons to SVG paths
  const iconMap: Record<string, string> = {
    'mdi-plus': 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z',
    'mdi-pencil': 'M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z',
    'mdi-delete': 'M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z',
    'mdi-download': 'M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z',
    'mdi-refresh': 'M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z'
  }
  
  const path = iconMap[iconName] || iconMap['mdi-plus']
  
  return h('svg', {
    viewBox: '0 0 24 24',
    fill: 'currentColor'
  }, [
    h('path', { d: path })
  ])
}
</script>

<style scoped>
.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-text {
  flex: 1;
}

.header-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: var(--text-color-1);
}

.header-subtitle {
  font-size: 1.1rem;
  color: var(--text-color-3);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>