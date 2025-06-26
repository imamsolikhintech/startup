<template>
  <n-card class="stats-card" :class="`stats-card--${color}`">
    <div class="stats-content">
      <div class="stats-header">
        <n-icon :size="32" :class="`icon--${color}`">
          <component :is="getIconComponent(icon)" />
        </n-icon>
        <n-tag
          :type="trend === 'up' ? 'success' : 'error'"
          size="small"
          round
        >
          <template #icon>
            <n-icon :size="16">
              <component :is="getTrendIcon(trend)" />
            </n-icon>
          </template>
          {{ change }}
        </n-tag>
      </div>
      
      <div class="stats-value">{{ value }}</div>
      <div class="stats-title">{{ title }}</div>
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { NCard, NIcon, NTag } from 'naive-ui'
import { h } from 'vue'

interface Props {
  title: string
  value: string
  icon: string
  color: string
  trend: 'up' | 'down'
  change: string
}

defineProps<Props>()

const getIconComponent = (iconName: string) => {
  // Map common Material Design icons to SVG
  const iconMap: Record<string, any> = {
    'mdi-account-group': () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z' })
    ]),
    'mdi-currency-usd': () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z' })
    ]),
    'mdi-chart-line': () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z' })
    ]),
    'mdi-eye': () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z' })
    ])
  }
  
  return iconMap[iconName] || (() => h('svg', { viewBox: '0 0 24 24' }, [
    h('path', { fill: 'currentColor', d: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z' })
  ]))
}

const getTrendIcon = (trend: 'up' | 'down') => {
  if (trend === 'up') {
    return () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M15,20H9V12H4.16L12,4.16L19.84,12H15V20Z' })
    ])
  } else {
    return () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M9,4H15V12H19.84L12,19.84L4.16,12H9V4Z' })
    ])
  }
}
</script>

<style scoped>
.stats-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  height: 100%;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stats-content {
  padding: 1.5rem;
}

.stats-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.stats-value {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
  color: var(--text-color-1);
}

.stats-title {
  font-size: 0.875rem;
  color: var(--text-color-3);
  font-weight: 500;
}

/* Color variants */
.stats-card--primary {
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.1), rgba(24, 144, 255, 0.05));
  border: 1px solid rgba(24, 144, 255, 0.2);
}

.stats-card--success {
  background: linear-gradient(135deg, rgba(82, 196, 26, 0.1), rgba(82, 196, 26, 0.05));
  border: 1px solid rgba(82, 196, 26, 0.2);
}

.stats-card--warning {
  background: linear-gradient(135deg, rgba(250, 173, 20, 0.1), rgba(250, 173, 20, 0.05));
  border: 1px solid rgba(250, 173, 20, 0.2);
}

.stats-card--error {
  background: linear-gradient(135deg, rgba(255, 77, 79, 0.1), rgba(255, 77, 79, 0.05));
  border: 1px solid rgba(255, 77, 79, 0.2);
}

.stats-card--info {
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.1), rgba(24, 144, 255, 0.05));
  border: 1px solid rgba(24, 144, 255, 0.2);
}

/* Icon colors */
.icon--primary {
  color: #1890ff;
}

.icon--success {
  color: #52c41a;
}

.icon--warning {
  color: #faad14;
}

.icon--error {
  color: #ff4d4f;
}

.icon--info {
  color: #1890ff;
}

@media (max-width: 768px) {
  .stats-content {
    padding: 1rem;
  }
  
  .stats-value {
    font-size: 1.5rem;
  }
  
  .stats-header {
    margin-bottom: 0.75rem;
  }
}
</style>