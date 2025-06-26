// Export main CustomDialog component
export { default as CustomDialog } from '../dialog/CustomDialog.vue'

// Export demo component (for development/testing)
export { default as CustomDialogDemo } from '../dialog/CustomDialogDemo.vue'

// Export types and interfaces
export type {
  DialogAction,
  DialogConfig,
  DialogEmits,
  DialogSlots,
  DialogColor,
  DialogVariant,
  DialogSize
} from './types'

// Export utility functions and presets
export {
  DialogPresets,
  DialogSizes,
  DialogIcons,
  createDialogConfig,
  useDialogPreset,
  isValidDialogColor,
  isValidDialogVariant,
  isValidDialogSize
} from './types'

// Export composables
export {
  useDialog,
  useConfirmationDialog,
  useDeleteConfirmationDialog,
  useFormDialog,
  useInfoDialog,
  useErrorDialog,
  useSuccessDialog,
  useWarningDialog,
  useDialogManager,
  dialogService
} from './useDialog'

// Export dialog plugin
export { default as DialogPlugin } from './useDialog'

// Export other common components
export { default as ActionButtons } from './ActionButtons.vue'
export { default as DataTable } from '../datatable/DataTable.vue'
export { default as PageHeader } from './PageHeader.vue'
export { default as PageLoader } from './PageLoader.vue'
export { default as SearchFilters } from './SearchFilters.vue'
export { default as StatsCards } from './StatsCards.vue'

// Re-export types for other common components if needed
export type {
  TableHeader,
  TableAction
} from '../datatable/DataTable.vue'

// Utility function to install all common components
export function installCommonComponents(app: any) {
  // Register CustomDialog globally
  app.component('CustomDialog', () => import('../dialog/CustomDialog.vue'))
  
  // Register other common components
  app.component('ActionButtons', () => import('./ActionButtons.vue'))
  app.component('DataTable', () => import('../datatable/DataTable.vue'))
  app.component('PageHeader', () => import('./PageHeader.vue'))
  app.component('PageLoader', () => import('./PageLoader.vue'))
  app.component('SearchFilters', () => import('./SearchFilters.vue'))
  app.component('StatsCards', () => import('./StatsCards.vue'))
  
  // Install dialog plugin
  const DialogPlugin = () => import('./useDialog')
  app.use(DialogPlugin)
}

// Default export for easy plugin installation
export default {
  install: installCommonComponents
}