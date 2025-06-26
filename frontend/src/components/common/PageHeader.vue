<template>
  <v-row class="mb-6">
    <v-col cols="12">
      <div class="d-flex align-center justify-space-between">
        <div>
          <h1 class="text-h4 font-weight-bold mb-2">{{ title }}</h1>
          <p class="text-subtitle-1 text-medium-emphasis" v-if="subtitle">
            {{ subtitle }}
          </p>
        </div>
        <div class="d-flex gap-2" v-if="actions && actions.length > 0">
          <v-btn
            v-for="action in actions"
            :key="action.key"
            :color="action.color || 'primary'"
            :size="action.size || 'large'"
            :prepend-icon="action.icon"
            :variant="action.variant || 'flat'"
            :class="action.class"
            @click="$emit('action', action.key)"
          >
            {{ action.label }}
          </v-btn>
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
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
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>