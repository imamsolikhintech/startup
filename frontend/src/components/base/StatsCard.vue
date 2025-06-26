<template>
  <div v-if="multiple || stats.length > 0" :class="`stats-cards stats-cards--${layout} stats-cards--gap-${gap}`">
    <div 
      v-for="(stat, index) in stats" 
      :key="stat.id || index"
      :class="[
        'stats-card',
        `stats-card--${size}`,
        `stats-card--${stat.variant || variant}`,
        { 'stats-card--loading': loading }
      ]"
    >
      <!-- Header -->
      <div class="stats-card__header">
        <div class="stats-card__icon" v-if="stat.icon">
          <component 
            :is="iconService.getIconComponent(stat.icon)" 
            :style="{ color: stat.iconColor || 'var(--color-primary-500)' }"
          />
        </div>
        <h3 class="stats-card__title">{{ stat.title }}</h3>
      </div>
      
      <!-- Content -->
      <div class="stats-card__content">
        <div class="stats-card__value">{{ formatValue(stat.value) }}</div>
        <div v-if="stat.subtitle" class="stats-card__subtitle">{{ stat.subtitle }}</div>
      </div>
      
      <!-- Progress -->
      <div v-if="stat.progress !== undefined" class="stats-card__progress">
        <div 
          class="stats-card__progress-bar"
          :style="{ 
            width: `${Math.min(Math.max(stat.progress, 0), 100)}%`,
            backgroundColor: stat.progressColor || 'var(--color-primary-500)'
          }"
        ></div>
      </div>
      
      <!-- Footer with trend -->
      <div v-if="stat.trend" class="stats-card__footer">
        <div :class="`stats-card__trend stats-card__trend--${stat.trend}`">
          <component :is="iconService.getTrendIconComponent(stat.trend)" />
          <span v-if="stat.change">{{ stat.change }}</span>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Single stat card -->
  <div v-else :class="[
    'stats-card',
    `stats-card--${size}`,
    `stats-card--${variant}`,
    { 'stats-card--loading': loading }
  ]">
    <!-- Header -->
    <div class="stats-card__header">
      <div class="stats-card__icon" v-if="icon">
        <component 
          :is="iconService.getIconComponent(icon)" 
          :style="{ color: iconColor || 'var(--color-primary-500)' }"
        />
      </div>
      <h3 class="stats-card__title">{{ title }}</h3>
    </div>
    
    <!-- Content -->
    <div class="stats-card__content">
      <div class="stats-card__value">{{ formattedValue }}</div>
      <div v-if="subtitle" class="stats-card__subtitle">{{ subtitle }}</div>
    </div>
    
    <!-- Progress -->
    <div v-if="progress !== undefined" class="stats-card__progress">
      <div 
        class="stats-card__progress-bar"
        :style="{ 
          width: `${Math.min(Math.max(progress, 0), 100)}%`,
          backgroundColor: progressColor
        }"
      ></div>
    </div>
    
    <!-- Footer with trend -->
    <div v-if="trend" class="stats-card__footer">
      <div :class="`stats-card__trend stats-card__trend--${trend}`">
        <component :is="iconService.getTrendIconComponent(trend)" />
        <span v-if="change">{{ change }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import { useIconService } from '@/services/icons/iconService'
import { useNumberFormatter } from '@/services/formatting/numberFormatter'

// Types
export interface StatItem {
  id?: string | number
  title: string
  value: number | string
  subtitle?: string
  icon?: string
  iconColor?: string
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'
  progress?: number
  progressColor?: string
  trend?: 'up' | 'down' | 'neutral'
  change?: string
}

// Props
const props = defineProps({
  // Single stat mode
  title: {
    type: String,
    default: ''
  },
  value: {
    type: [Number, String],
    default: 0
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  iconColor: {
    type: String,
    default: ''
  },
  progress: {
    type: Number,
    default: undefined
  },
  progressColor: {
    type: String,
    default: 'var(--color-primary-500)'
  },
  trend: {
    type: String as PropType<'up' | 'down' | 'neutral'>,
    default: undefined
  },
  change: {
    type: String,
    default: ''
  },
  
  // Multiple stats mode
  stats: {
    type: Array as PropType<StatItem[]>,
    default: () => []
  },
  multiple: {
    type: Boolean,
    default: false
  },
  
  // Layout options
  layout: {
    type: String as PropType<'grid' | 'row' | 'column' | 'grid-1' | 'grid-2' | 'grid-3' | 'grid-4'>,
    default: 'grid'
  },
  gap: {
    type: String as PropType<'small' | 'medium' | 'large'>,
    default: 'medium'
  },
  size: {
    type: String as PropType<'small' | 'medium' | 'large'>,
    default: 'medium'
  },
  variant: {
    type: String as PropType<'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'>,
    default: 'default'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Services
const iconService = useIconService()
const numberFormatter = useNumberFormatter()

// Computed
const formattedValue = computed(() => {
  return formatValue(props.value)
})

// Methods
const formatValue = (value: number | string): string => {
  if (typeof value === 'string') return value
  if (typeof value === 'number') {
    return numberFormatter.formatNumber(value)
  }
  return String(value)
}
</script>

<style scoped>
/* Container Styles */
.stats-card-container {
  width: 100%;
}

.stats-card-container--grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(v-bind(minWidth), 1fr));
}

.stats-card-container--row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.stats-card-container--column {
  display: flex;
  flex-direction: column;
}

/* Gap Styles */
.stats-card-container--gap-small {
  gap: 0.5rem;
}

.stats-card-container--gap-medium {
  gap: 1rem;
}

.stats-card-container--gap-large {
  gap: 1.5rem;
}

/* Card Styles */
.stats-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  height: 100%;
}

.stats-card--hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stats-card--small .stats-card__content {
  padding: 1rem;
}

.stats-card--medium .stats-card__content {
  padding: 1.25rem;
}

.stats-card--large .stats-card__content {
  padding: 1.5rem;
}

/* Content Styles */
.stats-card__content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.stats-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.stats-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-card__body {
  flex: 1;
}

.stats-card__value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 0.25rem;
}

.stats-card--small .stats-card__value {
  font-size: 1.5rem;
}

.stats-card--large .stats-card__value {
  font-size: 2.5rem;
}

.stats-card__title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--n-text-color);
  margin-bottom: 0.25rem;
}

.stats-card__subtitle {
  font-size: 0.75rem;
  color: var(--n-text-color-disabled);
}

.stats-card__progress {
  margin-top: 1rem;
}

.stats-card__footer {
  margin-top: 0.5rem;
}

.stats-card__period {
  font-size: 0.75rem;
  color: var(--n-text-color-disabled);
}

/* Responsive Design */
@media (max-width: 768px) {
  .stats-card-container--grid {
    grid-template-columns: 1fr;
  }
  
  .stats-card-container--row {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .stats-card__value {
    font-size: 1.5rem;
  }
  
  .stats-card--large .stats-card__value {
    font-size: 2rem;
  }
}
</style>