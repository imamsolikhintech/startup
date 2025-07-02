import { Component, h } from 'vue'

// Icon map interface
interface IconMap {
  [key: string]: () => Component,
}

/**
 * Icon Service - Centralized icon management system
 *
 * This service provides a unified way to handle icons across the application.
 * It maps icon names (like 'mdi-account') to SVG path components.
 *
 * Usage:
 * ```
 * const { getIconComponent } = useIconService()
 * const iconComponent = getIconComponent('mdi-account')
 * ```
 */
export function useIconService () {
  // Material Design Icons (MDI) map
  const mdiIconMap: IconMap = {
    // User & Account Icons
    'mdi-account': () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' }),
    ]),
    'mdi-account-plus': () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M15,14C12.33,14 7,15.33 7,18V20H23V18C23,15.33 17.67,14 15,14M6,10V7H4V10H1V12H4V15H6V12H9V10M15,12A4,4 0 0,0 19,8A4,4 0 0,0 15,4A4,4 0 0,0 11,8A4,4 0 0,0 15,12Z' }),
    ]),
    'mdi-account-group': () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z' }),
    ]),
    'mdi-account-check': () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M21.1,12.5L22.5,13.91L15.97,20.5L12.5,17L13.9,15.59L15.97,17.67L21.1,12.5M10,17L3,17V18C3,19.66 6.34,21 10,21C10.95,21 11.84,20.88 12.62,20.67C11.1,19.76 10,18.18 10,16.5V17M10,4A4,4 0 0,1 14,8A4,4 0 0,1 10,12A4,4 0 0,1 6,8A4,4 0 0,1 10,4Z' }),
    ]),
    'mdi-account-edit': () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M21.7,13.35L20.7,14.35L18.65,12.3L19.65,11.3C19.86,11.09 20.21,11.09 20.42,11.3L21.7,12.58C21.91,12.79 21.91,13.14 21.7,13.35M12,18.94L18.06,12.88L20.11,14.93L14.06,21H12V18.94M12,14C7.58,14 4,15.79 4,18V20H10V18.11L14,14.11C13.34,14.03 12.67,14 12,14M12,4A4,4 0 0,0 8,8A4,4 0 0,0 12,12A4,4 0 0,0 16,8A4,4 0 0,0 12,4Z' }),
    ]),

    // Action Icons
    'mdi-plus': () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z' }),
    ]),
    'mdi-pencil': () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z' }),
    ]),
    'mdi-delete': () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z' }),
    ]),
    'mdi-eye': () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z' }),
    ]),
    'mdi-key-outline': () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M21,18H15V15H13.3C12.2,17.4 9.7,19 7,19C3.1,19 0,15.9 0,12C0,8.1 3.1,5 7,5C9.7,5 12.2,6.6 13.3,9H24V15H21V18M19,16V13H17V16H19M7,7C4.2,7 2,9.2 2,12C2,14.8 4.2,17 7,17C9.8,17 12,14.8 12,12C12,9.2 9.8,7 7,7M7,15C5.3,15 4,13.7 4,12C4,10.3 5.3,9 7,9C8.7,9 10,10.3 10,12C10,13.7 8.7,15 7,15M7,11C6.4,11 6,11.4 6,12C6,12.6 6.4,13 7,13C7.6,13 8,12.6 8,12C8,11.4 7.6,11 7,11Z' }),
    ]),

    // Chart & Data Icons
    'mdi-chart-line': () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.5,8L16,11.78Z' }),
    ]),
    'mdi-file-chart': () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M13,9H18.5L13,3.5V9M6,2H14L20,8V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V4C4,2.89 4.89,2 6,2M7,20H9V14H7V20M11,20H13V12H11V20M15,20H17V16H15V20Z' }),
    ]),
    'mdi-currency-usd': () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z' }),
    ]),

    // Communication Icons
    'mdi-bell-plus': () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M17,11H15V9H17M13,11H11V9H13M9,11H7V9H9M19,13V7H21V13H19M19,17V15H21V17H19M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3Z' }),
    ]),
    'mdi-chat': () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M12,3C17.5,3 22,6.58 22,11C22,15.42 17.5,19 12,19C10.76,19 9.57,18.82 8.47,18.5C5.55,21 2,21 2,21C4.33,18.67 4.7,17.1 4.75,16.5C3.05,15.07 2,13.13 2,11C2,6.58 6.5,3 12,3Z' }),
    ]),

    // Security Icons
    'mdi-lock-reset': () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M12.63,2C18.16,2 22.64,6.5 22.64,12C22.64,17.5 18.16,22 12.63,22C9.12,22 6.05,20.18 4.26,17.43L5.84,16.18C7.25,18.47 9.76,20 12.64,20A8,8 0 0,0 20.64,12A8,8 0 0,0 12.64,4C8.56,4 5.2,7.06 4.71,11H7.47L3.73,14.73L0,11H2.69C3.19,5.95 7.45,2 12.63,2M15.59,10.24C16.35,10.74 16.35,11.76 15.59,12.26L12.64,14.04A1,1 0 0,1 11.64,13.04V9.44C11.64,8.84 12.34,8.54 12.84,8.84L15.59,10.24Z' }),
    ]),

    // Trend Icons
    'mdi-trending-up': () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z' }),
    ]),
    'mdi-trending-down': () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M16,18L18.29,15.71L13.41,10.83L9.41,14.83L2,7.41L3.41,6L9.41,12L13.41,8L19.71,14.29L22,12V18H16Z' }),
    ]),
    'mdi-trending-neutral': () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M22,12L18,8V11H3V13H18V16L22,12Z' }),
    ]),

    // Fallback icon for unknown icon names
    'default': () => h('svg', { viewBox: '0 0 24 24' }, [
      h('path', { fill: 'currentColor', d: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z' }),
    ]),
  }

  /**
   * Get icon component by name
   * @param iconName - The name of the icon (e.g., 'mdi-account')
   * @returns Vue component for the icon
   */
  const getIconComponent = (iconName?: string): Component => {
    if (!iconName) return mdiIconMap['default']
    return mdiIconMap[iconName] || mdiIconMap['default']
  }

  /**
   * Get trend icon component by direction
   * @param direction - The trend direction ('up', 'down', or 'neutral')
   * @returns Vue component for the trend icon
   */
  const getTrendIconComponent = (direction: 'up' | 'down' | 'neutral'): Component => {
    switch (direction) {
      case 'up': return mdiIconMap['mdi-trending-up']
      case 'down': return mdiIconMap['mdi-trending-down']
      case 'neutral': return mdiIconMap['mdi-trending-neutral']
      default: return mdiIconMap['mdi-trending-neutral']
    }
  }

  /**
   * Register a new icon
   * @param iconName - The name of the icon to register
   * @param iconComponent - The icon component function
   */
  const registerIcon = (iconName: string, iconComponent: () => Component): void => {
    mdiIconMap[iconName] = iconComponent
  }

  return {
    getIconComponent,
    getTrendIconComponent,
    registerIcon,
  }
}
