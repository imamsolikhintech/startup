<template>
  <div class="stats-grid">
    <div
      v-for="stat in stats"
      :key="stat.title"
      class="stats-grid-item"
    >
      <n-card
        class="stats-card"
        :style="{ height: '120px' }"
      >
        <div class="stats-content">
          <div class="stats-info">
            <div class="stats-value">
              {{ formatValue(stat.value) }}
            </div>
            <div class="stats-title">
              {{ stat.title }}
            </div>
            <div v-if="stat.subtitle" class="stats-subtitle">
              {{ stat.subtitle }}
            </div>
          </div>
          <div class="stats-icon">
            <n-icon
              :component="getIconComponent(stat.icon)"
              :color="stat.iconColor || '#1976d2'"
              size="28"
            />
          </div>
        </div>
        
        <!-- Progress indicator if provided -->
        <n-progress
          v-if="stat.progress !== undefined"
          :percentage="stat.progress"
          :color="stat.progressColor || '#1976d2'"
          :height="4"
          :show-indicator="false"
          class="stats-progress"
        />
        
        <!-- Trend indicator -->
        <div v-if="stat.trend" class="stats-trend">
          <n-tag
            :type="getTrendTagType(stat.trend.direction)"
            size="small"
          >
            <template #icon>
              <n-icon :component="getTrendIconComponent(stat.trend.direction)" />
            </template>
            {{ stat.trend.value }}{{ stat.trend.unit || '%' }}
          </n-tag>
          <span class="trend-period">
            {{ stat.trend.period || 'vs last period' }}
          </span>
        </div>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { NCard, NIcon, NProgress, NTag } from 'naive-ui'

interface StatTrend {
  direction: 'up' | 'down' | 'neutral'
  value: number | string
  unit?: string
  period?: string
}

interface Stat {
  title: string
  value: number | string
  subtitle?: string
  icon: string
  color?: string
  iconColor?: string
  progress?: number
  progressColor?: string
  trend?: StatTrend
}

interface Props {
  stats: Stat[]
}

defineProps<Props>()

const formatValue = (value: number | string): string => {
  if (typeof value === 'number') {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M'
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K'
    }
    return value.toLocaleString()
  }
  return String(value)
}

const getTrendTagType = (direction: string): 'success' | 'error' | 'info' => {
  switch (direction) {
    case 'up': return 'success'
    case 'down': return 'error'
    default: return 'info'
  }
}

const getTrendIconComponent = (direction: string) => {
  switch (direction) {
    case 'up': 
      return () => h('svg', {
        viewBox: '0 0 24 24',
        fill: 'currentColor'
      }, [
        h('path', {
          d: 'M15,20H9V12H4.16L12,4.16L19.84,12H15V20Z'
        })
      ])
    case 'down':
      return () => h('svg', {
        viewBox: '0 0 24 24',
        fill: 'currentColor'
      }, [
        h('path', {
          d: 'M9,4H15V12H19.84L12,19.84L4.16,12H9V4Z'
        })
      ])
    default:
      return () => h('svg', {
        viewBox: '0 0 24 24',
        fill: 'currentColor'
      }, [
        h('path', {
          d: 'M22,12L18,8V11H6V8L2,12L6,16V13H18V16L22,12Z'
        })
      ])
  }
}

// Map common Material Design icons to SVG
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, () => any> = {
    'mdi-account': () => h('svg', {
      viewBox: '0 0 24 24',
      fill: 'currentColor'
    }, [
      h('path', {
        d: 'M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z'
      })
    ]),
    'mdi-currency-usd': () => h('svg', {
      viewBox: '0 0 24 24',
      fill: 'currentColor'
    }, [
      h('path', {
        d: 'M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z'
      })
    ]),
    'mdi-chart-line': () => h('svg', {
      viewBox: '0 0 24 24',
      fill: 'currentColor'
    }, [
      h('path', {
        d: 'M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z'
      })
    ]),
    'mdi-eye': () => h('svg', {
      viewBox: '0 0 24 24',
      fill: 'currentColor'
    }, [
      h('path', {
        d: 'M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z'
      })
    ])
  }
  
  return iconMap[iconName] || (() => h('svg', {
    viewBox: '0 0 24 24',
    fill: 'currentColor'
  }, [
    h('path', {
      d: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z'
    })
  ]))
}
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  width: 100%;
}

.stats-grid-item {
  min-width: 0;
}

.stats-card {
  height: 120px;
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stats-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  height: calc(100% - 32px);
}

.stats-info {
  flex: 1;
  min-width: 0;
}

.stats-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 4px;
  color: #1a1a1a;
}

.stats-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #666;
  margin-bottom: 2px;
}

.stats-subtitle {
  font-size: 0.75rem;
  color: #999;
  margin-top: 4px;
}

.stats-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(25, 118, 210, 0.1);
  margin-left: 16px;
}

.stats-progress {
  margin: 0 16px 8px 16px;
}

.stats-trend {
  display: flex;
  align-items: center;
  padding: 0 16px 12px 16px;
  gap: 8px;
}

.trend-period {
  font-size: 0.75rem;
  color: #999;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .stats-content {
    padding: 12px;
  }
  
  .stats-value {
    font-size: 1.5rem;
  }
  
  .stats-icon {
    width: 48px;
    height: 48px;
    margin-left: 12px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1025px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>