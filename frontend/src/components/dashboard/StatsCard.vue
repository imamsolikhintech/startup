<template>
  <v-card
    :color="color"
    variant="tonal"
    rounded="lg"
    elevation="2"
    class="stats-card"
  >
    <v-card-text class="pa-4">
      <div class="d-flex align-center justify-space-between mb-3">
        <v-icon :color="color" size="32">{{ icon }}</v-icon>
        <v-chip
          :color="trend === 'up' ? 'success' : 'error'"
          size="small"
          variant="tonal"
        >
          <v-icon
            :icon="trend === 'up' ? 'mdi-trending-up' : 'mdi-trending-down'"
            size="16"
            class="mr-1"
          />
          {{ change }}
        </v-chip>
      </div>
      
      <div class="text-h4 font-weight-bold mb-1">{{ value }}</div>
      <div class="text-subtitle-2 text-medium-emphasis">{{ title }}</div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface Props {
  title: string
  value: string
  icon: string
  color: string
  trend: 'up' | 'down'
  change: string
}

defineProps<Props>()
</script>