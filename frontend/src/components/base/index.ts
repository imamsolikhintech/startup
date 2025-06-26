// Base components - Optimized and reusable UI components

// Export the unified StatsCard component
export { default as StatsCard } from './StatsCard.vue'

// Re-export types
export type {
  StatItem
} from './StatsCard.vue'

// Utility function to install base components
export function installBaseComponents(app: any) {
  app.component('StatsCard', () => import('./StatsCard.vue'))
}

// Component registry for dynamic imports
export const baseComponents = {
  StatsCard: () => import('./StatsCard.vue')
}