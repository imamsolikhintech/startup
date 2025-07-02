// Export main CustomDialog component
export { default as CustomDialog } from '../dialog/CustomDialog.vue'

// Export demo component (for development/testing)
export { default as CustomDialogDemo } from '../dialog/CustomDialogDemo.vue'

// Export types and interfaces
export type {
  DialogAction,
  DialogColor,
  DialogConfig,
  DialogEmits,
  DialogSize,
  DialogSlots,
  DialogVariant } from './types'

// Export utility functions and presets
export {
  createDialogConfig,
  DialogIcons,
  DialogPresets,
  DialogSizes,
  isValidDialogColor,
  isValidDialogSize,
  isValidDialogVariant,
  useDialogPreset } from './types'

// Export composables
export {
  dialogService,
  useConfirmationDialog,
  useDeleteConfirmationDialog,
  useDialog,
  useDialogManager,
  useErrorDialog,
  useFormDialog,
  useInfoDialog,
  useSuccessDialog,
  useWarningDialog } from './useDialog'

// Export dialog plugin
export { default as DialogPlugin } from './useDialog'

// Export other common components
export { default as StatsCards } from '../base/StatsCard.vue'
export { default as PageHeader } from '../common/PageHeader.vue'
export { default as DataTable } from '../datatable/DataTable.vue'
export { default as ActionButtons } from './ActionButtons.vue'
export { default as PageLoader } from './PageLoader.vue'
export { default as SearchFilters } from './SearchFilters.vue'

// Re-export types for other common components if needed
export type {
  TableAction,
  TableHeader } from '../datatable/DataTable.vue'

// Utility function to install all common components
export function installCommonComponents (app: any) {
  // Register CustomDialog globally
  app.component('CustomDialog', () => import('../dialog/CustomDialog.vue'))

  // Register other common components
  app.component('ActionButtons', () => import('./ActionButtons.vue'))
  app.component('DataTable', () => import('../datatable/DataTable.vue'))
  app.component('PageHeader', () => import('../common/PageHeader.vue'))
  app.component('PageLoader', () => import('./PageLoader.vue'))
  app.component('SearchFilters', () => import('./SearchFilters.vue'))
  app.component('StatsCards', () => import('../base/StatsCard.vue'))

  // Install dialog plugin
  const DialogPlugin = () => import('./useDialog')
  app.use(DialogPlugin)
}

// Default export for easy plugin installation
export default {
  install: installCommonComponents,
}
