// Type definitions for CustomDialog component

export interface DialogAction {
  key: string
  label: string
  icon?: string
  color?: string
  variant?: 'default' | 'tertiary' | 'primary' | 'info' | 'success' | 'warning' | 'error'
  size?: 'tiny' | 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  class?: string
}

export interface DialogConfig {
  // Dialog visibility and basic config
  show: boolean
  maxWidth?: string | number
  persistent?: boolean
  scrollable?: boolean
  fullscreen?: boolean
  transition?: string
  rounded?: string | number | boolean
  
  // Header configuration
  showHeader?: boolean
  title?: string
  subtitle?: string
  headerIcon?: string
  headerIconColor?: string
  headerIconSize?: string | number
  headerClass?: string
  showHeaderDivider?: boolean
  
  // Close button configuration
  showCloseButton?: boolean
  closeIcon?: string
  closeButtonTitle?: string
  
  // Content configuration
  contentClass?: string
  contentStyle?: string | Record<string, any>
  
  // Footer configuration
  showFooter?: boolean
  footerClass?: string
  showFooterDivider?: boolean
  footerJustifyStart?: boolean
  
  // Footer buttons configuration
  showCancelButton?: boolean
  cancelButtonText?: string
  cancelButtonColor?: string
  cancelButtonVariant?: string
  
  showConfirmButton?: boolean
  confirmButtonText?: string
  confirmButtonColor?: string
  confirmButtonVariant?: string
  
  buttonSize?: string
  loading?: boolean
}

export interface DialogEmits {
  'update:show': [value: boolean]
  'close': []
  'cancel': []
  'confirm': []
}

export interface DialogSlots {
  default: () => any
  'header-actions': () => any
  footer: () => any
}

// Predefined dialog configurations for common use cases
export const DialogPresets = {
  // Basic confirmation dialog
  confirmation: (title: string, message?: string): Partial<DialogConfig> => ({
    title,
    subtitle: message,
    headerIcon: 'mdi-help-circle',
    maxWidth: 400,
    confirmButtonText: 'Yes',
    cancelButtonText: 'No'
  }),
  
  // Delete confirmation dialog
  deleteConfirmation: (itemName?: string): Partial<DialogConfig> => ({
    title: 'Delete Confirmation',
    subtitle: itemName ? `Delete "${itemName}"?` : 'This action cannot be undone',
    headerIcon: 'mdi-alert-circle',
    headerIconColor: 'error',
    confirmButtonText: 'Delete',
    confirmButtonColor: 'error',
    cancelButtonText: 'Cancel',
    maxWidth: 400
  }),
  
  // Form dialog
  form: (title: string, subtitle?: string): Partial<DialogConfig> => ({
    title,
    subtitle,
    headerIcon: 'mdi-form-select',
    maxWidth: 600,
    confirmButtonText: 'Save',
    cancelButtonText: 'Cancel',
    persistent: true
  }),
  
  // Information dialog
  info: (title: string, subtitle?: string): Partial<DialogConfig> => ({
    title,
    subtitle,
    headerIcon: 'mdi-information',
    headerIconColor: 'info',
    showFooter: false,
    maxWidth: 500
  }),
  
  // Warning dialog
  warning: (title: string, message?: string): Partial<DialogConfig> => ({
    title,
    subtitle: message,
    headerIcon: 'mdi-alert',
    headerIconColor: 'warning',
    confirmButtonText: 'Understand',
    showCancelButton: false,
    maxWidth: 450
  }),
  
  // Error dialog
  error: (title: string, message?: string): Partial<DialogConfig> => ({
    title,
    subtitle: message,
    headerIcon: 'mdi-alert-circle',
    headerIconColor: 'error',
    confirmButtonText: 'OK',
    showCancelButton: false,
    maxWidth: 450
  }),
  
  // Success dialog
  success: (title: string, message?: string): Partial<DialogConfig> => ({
    title,
    subtitle: message,
    headerIcon: 'mdi-check-circle',
    headerIconColor: 'success',
    confirmButtonText: 'OK',
    showCancelButton: false,
    maxWidth: 450
  }),
  
  // Fullscreen dialog
  fullscreen: (title: string, subtitle?: string): Partial<DialogConfig> => ({
    title,
    subtitle,
    fullscreen: true,
    confirmButtonText: 'Save',
    cancelButtonText: 'Cancel'
  })
}

// Dialog size presets
export const DialogSizes = {
  xs: 300,
  sm: 400,
  md: 600,
  lg: 800,
  xl: 1000,
  xxl: 1200
} as const

// Common dialog icons
export const DialogIcons = {
  // Actions
  add: 'mdi-plus',
  edit: 'mdi-pencil',
  delete: 'mdi-delete',
  save: 'mdi-content-save',
  cancel: 'mdi-close',
  confirm: 'mdi-check',
  
  // Status
  success: 'mdi-check-circle',
  error: 'mdi-alert-circle',
  warning: 'mdi-alert',
  info: 'mdi-information',
  help: 'mdi-help-circle',
  
  // Content types
  user: 'mdi-account',
  users: 'mdi-account-group',
  settings: 'mdi-cog',
  file: 'mdi-file',
  folder: 'mdi-folder',
  image: 'mdi-image',
  document: 'mdi-file-document',
  
  // Actions specific
  upload: 'mdi-upload',
  download: 'mdi-download',
  share: 'mdi-share',
  copy: 'mdi-content-copy',
  print: 'mdi-printer',
  email: 'mdi-email',
  phone: 'mdi-phone',
  
  // Navigation
  back: 'mdi-arrow-left',
  forward: 'mdi-arrow-right',
  up: 'mdi-arrow-up',
  down: 'mdi-arrow-down',
  
  // UI
  close: 'mdi-close',
  minimize: 'mdi-minus',
  maximize: 'mdi-fullscreen',
  restore: 'mdi-fullscreen-exit'
} as const

// Utility type for dialog colors
export type DialogColor = 
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'surface'
  | string

// Utility type for dialog variants
export type DialogVariant = 
  | 'default'
  | 'tertiary'
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'

// Utility type for dialog sizes
export type DialogSize = 
  | 'tiny'
  | 'small'
  | 'medium'
  | 'large'

// Helper function to create dialog configuration
export function createDialogConfig(config: Partial<DialogConfig>): DialogConfig {
  return {
    show: false,
    maxWidth: 600,
    persistent: false,
    scrollable: true,
    fullscreen: false,
    transition: 'dialog-transition',
    rounded: 'lg',
    
    showHeader: true,
    title: '',
    subtitle: '',
    headerIcon: '',
    headerIconColor: 'primary',
    headerIconSize: 24,
    headerClass: '',
    showHeaderDivider: true,
    
    showCloseButton: true,
    closeIcon: 'mdi-close',
    closeButtonTitle: 'Close',
    
    contentClass: 'p-6',
    contentStyle: '',
    
    showFooter: true,
    footerClass: 'p-4',
    showFooterDivider: true,
    footerJustifyStart: false,
    
    showCancelButton: true,
    cancelButtonText: 'Cancel',
    cancelButtonColor: '',
    cancelButtonVariant: 'default',
    
    showConfirmButton: true,
    confirmButtonText: 'Confirm',
    confirmButtonColor: 'primary',
    confirmButtonVariant: 'primary',
    
    buttonSize: 'medium',
    loading: false,
    
    ...config
  }
}

// Helper function to merge dialog presets with custom config
export function useDialogPreset(
  preset: keyof typeof DialogPresets,
  customConfig: Partial<DialogConfig> = {},
  ...args: any[]
): DialogConfig {
  const presetFn = DialogPresets[preset];
  //@ts-ignore-line
  const presetConfig = presetFn.apply(null, args);
  return createDialogConfig({ ...presetConfig, ...customConfig })
}

// Type guard to check if a value is a valid dialog color
export function isValidDialogColor(color: string): color is DialogColor {
  const validColors = [
    'primary', 'secondary', 'success', 'error', 
    'warning', 'info', 'surface'
  ]
  return validColors.includes(color) || /^#[0-9A-F]{6}$/i.test(color)
}

// Type guard to check if a value is a valid dialog variant
export function isValidDialogVariant(variant: string): variant is DialogVariant {
  const validVariants = ['default', 'tertiary', 'primary', 'info', 'success', 'warning', 'error']
  return validVariants.includes(variant)
}

// Type guard to check if a value is a valid dialog size
export function isValidDialogSize(size: string): size is DialogSize {
  const validSizes = ['tiny', 'small', 'medium', 'large']
  return validSizes.includes(size)
}