<template>
  <n-button
    quaternary
    circle
    :size="size"
    class="theme-toggle-btn"
    :title="`Switch to ${nextThemeLabel} theme`"
    @click="toggleTheme">
    <template #icon>
      <n-icon :size="iconSize">
        <component :is="currentThemeIcon" />
      </n-icon>
    </template>
  </n-button>
</template>

<script setup lang="ts">
  import { computed, h } from 'vue'
  import { useThemeStore } from '@/stores/theme'

  interface Props {
    size?: 'tiny' | 'small' | 'medium' | 'large',
    showLabel?: boolean,
  }

  const props = withDefaults(defineProps<Props>(), {
    size: 'medium',
    showLabel: false,
  })

  const themeStore = useThemeStore()

  // Icon size based on button size
  const iconSize = computed(() => {
    const sizeMap = {
      tiny: 14,
      small: 16,
      medium: 18,
      large: 20,
    }
    return sizeMap[props.size]
  })

  // Theme icons
  const LightIcon = () => h('svg', { viewBox: '0 0 24 24' }, [
    h('path', {
      fill: 'currentColor',
      d: 'M12,18C11.11,18 10.26,17.8 9.5,17.45C11.56,16.5 13,14.42 13,12C13,9.58 11.56,7.5 9.5,6.55C10.26,6.2 11.11,6 12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M20,8.69V4H15.31L12,0.69L8.69,4H4V8.69L0.69,12L4,15.31V20H8.69L12,23.31L15.31,20H20V15.31L23.31,12L20,8.69Z',
    }),
  ])

  const DarkIcon = () => h('svg', { viewBox: '0 0 24 24' }, [
    h('path', {
      fill: 'currentColor',
      d: 'M17.75,4.09L15.22,6.03L16.13,9.09L13.5,7.28L10.87,9.09L11.78,6.03L9.25,4.09L12.44,4L13.5,1L14.56,4L17.75,4.09M21.25,11L19.61,12.25L20.2,14.23L18.5,13.06L16.8,14.23L17.39,12.25L15.75,11L17.81,10.95L18.5,9L19.19,10.95L21.25,11M18.97,15.95C19.8,15.87 20.69,17.05 20.16,17.8C19.84,18.25 19.5,18.67 19.08,19.07C15.17,23 8.84,23 4.94,19.07C1.03,15.17 1.03,8.83 4.94,4.93C5.34,4.53 5.76,4.17 6.21,3.85C6.96,3.32 8.14,4.21 8.06,5.04C7.79,7.9 8.75,10.87 10.95,13.06C13.14,15.26 16.1,16.22 18.97,15.95M17.33,17.97C14.5,17.81 11.7,16.64 9.53,14.5C7.36,12.31 6.2,9.5 6.04,6.68C3.23,9.82 3.34,14.4 6.35,17.41C9.37,20.43 14,20.54 17.33,17.97Z',
    }),
  ])

  const SystemIcon = () => h('svg', { viewBox: '0 0 24 24' }, [
    h('path', {
      fill: 'currentColor',
      d: 'M4,6H20V16H4M20,18A2,2 0 0,0 22,16V6C22,4.89 21.1,4 20,4H4C2.89,4 2,4.89 2,6V16A2,2 0 0,0 4,18H0V20H24V18H20Z',
    }),
  ])

  // Current theme icon
  const currentThemeIcon = computed(() => {
    switch (themeStore.mode) {
    case 'light':
      return LightIcon
    case 'dark':
      return DarkIcon
    case 'system':
      return SystemIcon
    default:
      return SystemIcon
    }
  })

  // Current theme label
  const currentThemeLabel = computed(() => {
    const labels = {
      light: 'Light',
      dark: 'Dark',
      system: 'System',
    }
    return labels[themeStore.mode]
  })

  // Next theme label for tooltip
  const nextThemeLabel = computed(() => {
    return themeStore.mode === 'dark' ? 'light' : 'dark'
  })

  // Toggle between light and dark theme
  const toggleTheme = () => {
    const newTheme = themeStore.mode === 'dark' ? 'light' : 'dark'
    themeStore.setTheme(newTheme)
  }
</script>

<style scoped>
.theme-toggle-btn {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-toggle-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

</style>
