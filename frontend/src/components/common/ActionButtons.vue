<template>
  <div class="d-flex align-center" :class="{ 'gap-1': dense, 'gap-2': !dense }">
    <v-btn
      v-for="action in actions"
      :key="action.key"
      :icon="action.icon"
      :size="action.size || (dense ? 'small' : 'default')"
      :color="action.color"
      :variant="action.variant || 'text'"
      :disabled="action.disabled"
      :loading="action.loading"
      @click="$emit('action', action.key)"
      :title="action.title"
      :class="action.class"
    >
      <template v-if="!action.icon && action.label">
        {{ action.label }}
      </template>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
interface Action {
  key: string
  icon?: string
  label?: string
  color: string
  variant?: string
  size?: string
  title?: string
  disabled?: boolean
  loading?: boolean
  class?: string
}

interface Props {
  actions: Action[]
  dense?: boolean
}

withDefaults(defineProps<Props>(), {
  dense: false
})

defineEmits<{
  action: [key: string]
}>()
</script>

<style scoped>
.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}
</style>