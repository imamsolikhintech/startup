<template>
  <div
    class="action-buttons"
    :class="{ 'dense': dense }">
    <n-button
      v-for="action in actions"
      v-if="action.icon"
      :key="action.key"
      :size="action.size || (dense ? 'small' : 'medium')"
      :type="getButtonType(action.color)"
      :secondary="action.variant === 'outlined'"
      :text="action.variant === 'text'"
      :disabled="action.disabled"
      :loading="action.loading"
      :title="action.title"
      :class="action.class"
      circle
      @click="$emit('action', action.key)">
      <template #icon>
        <n-icon>
          <component :is="getIconComponent(action.icon)" />
        </n-icon>
      </template>
    </n-button>
    <n-button
      v-for="action in actions"
      v-else-if="action.label"
      :key="action.key + '-text'"
      :size="action.size || (dense ? 'small' : 'medium')"
      :type="getButtonType(action.color)"
      :secondary="action.variant === 'outlined'"
      :text="action.variant === 'text'"
      :disabled="action.disabled"
      :loading="action.loading"
      :title="action.title"
      :class="action.class"
      @click="$emit('action', action.key)">
      {{ action.label }}
    </n-button>
  </div>
</template>

<script setup lang="ts">
  import { NButton, NIcon } from 'naive-ui'
  import { h } from 'vue'

  interface Action {
    key: string,
    icon?: string,
    label?: string,
    color: string,
    variant?: string,
    size?: string,
    title?: string,
    disabled?: boolean,
    loading?: boolean,
    class?: string,
  }

  interface Props {
    actions: Action[],
    dense?: boolean,
  }

  withDefaults(defineProps<Props>(), {
    dense: false,
  })

  defineEmits<{
    action: [key: string],
  }>()

  const getButtonType = (color: string) => {
    switch (color) {
    case 'primary': return 'primary'
    case 'success': return 'success'
    case 'warning': return 'warning'
    case 'error': return 'error'
    case 'info': return 'info'
    default: return 'default'
    }
  }

  const getIconComponent = (iconName?: string) => {
    if (!iconName) return null

    // Map common MDI icons to SVG paths
    const iconMap: Record<string, string> = {
      'mdi-pencil': 'M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z',
      'mdi-delete': 'M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z',
      'mdi-eye': 'M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z',
      'mdi-dots-vertical': 'M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z',
    }

    const path = iconMap[iconName] || iconMap['mdi-dots-vertical']

    return h('svg', {
      viewBox: '0 0 24 24',
      fill: 'currentColor',
    }, [
      h('path', { d: path }),
    ])
  }
</script>

<style scoped>
.action-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-buttons.dense {
  gap: 0.25rem;
}
</style>
