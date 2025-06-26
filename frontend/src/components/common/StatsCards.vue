<template>
  <v-row>
    <v-col
      v-for="stat in stats"
      :key="stat.title"
      :cols="cols"
      :sm="sm"
      :md="md"
      :lg="lg"
    >
      <v-card
        class="stats-card"
        :color="stat.color || 'surface'"
        variant="tonal"
        rounded="lg"
        height="120"
      >
        <v-card-text class="d-flex align-center justify-space-between pa-4">
          <div>
            <div class="text-h4 font-weight-bold mb-1">
              {{ formatValue(stat.value) }}
            </div>
            <div class="text-subtitle-2 text-medium-emphasis">
              {{ stat.title }}
            </div>
            <div v-if="stat.subtitle" class="text-caption text-disabled mt-1">
              {{ stat.subtitle }}
            </div>
          </div>
          <v-avatar
            :color="stat.iconColor || stat.color || 'primary'"
            size="56"
            variant="tonal"
          >
            <v-icon :icon="stat.icon" size="28" />
          </v-avatar>
        </v-card-text>
        
        <!-- Progress indicator if provided -->
        <v-progress-linear
          v-if="stat.progress !== undefined"
          :model-value="stat.progress"
          :color="stat.progressColor || stat.color || 'primary'"
          height="4"
          class="mx-4 mb-2"
        />
        
        <!-- Trend indicator -->
        <div v-if="stat.trend" class="px-4 pb-2">
          <v-chip
            :color="getTrendColor(stat.trend.direction)"
            size="x-small"
            variant="tonal"
            :prepend-icon="getTrendIcon(stat.trend.direction)"
          >
            {{ stat.trend.value }}{{ stat.trend.unit || '%' }}
          </v-chip>
          <span class="text-caption text-disabled ml-2">
            {{ stat.trend.period || 'vs last period' }}
          </span>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
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
  cols?: number
  sm?: number
  md?: number
  lg?: number
}

withDefaults(defineProps<Props>(), {
  cols: 12,
  sm: 6,
  md: 3,
  lg: 3
})

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

const getTrendColor = (direction: string): string => {
  switch (direction) {
    case 'up': return 'success'
    case 'down': return 'error'
    default: return 'info'
  }
}

const getTrendIcon = (direction: string): string => {
  switch (direction) {
    case 'up': return 'mdi-trending-up'
    case 'down': return 'mdi-trending-down'
    default: return 'mdi-trending-neutral'
  }
}
</script>

<style scoped>
.stats-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.stats-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15) !important;
}
</style>