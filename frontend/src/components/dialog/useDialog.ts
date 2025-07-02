import { computed, reactive, type Ref, ref } from 'vue'
import type { DialogConfig, DialogEmits } from './types'
import { createDialogConfig, DialogPresets, useDialogPreset } from './types'

// Interface for dialog state management
interface DialogState {
  visible: Ref<boolean>,
  loading: Ref<boolean>,
  config: DialogConfig,
}

// Interface for dialog actions
interface DialogActions {
  show: () => void,
  hide: () => void,
  toggle: () => void,
  setLoading: (loading: boolean) => void,
  updateConfig: (newConfig: Partial<DialogConfig>) => void,
  resetConfig: () => void,
}

// Interface for dialog handlers
interface DialogHandlers {
  onConfirm: () => void | Promise<void>,
  onCancel: () => void,
  onClose: () => void,
}

// Main composable for dialog management
export function useDialog (
  initialConfig: Partial<DialogConfig> = {},
  handlers: Partial<DialogHandlers> = {},
) {
  // Reactive state
  const visible = ref(false)
  const loading = ref(false)
  const config = reactive(createDialogConfig(initialConfig))
  const originalConfig = { ...config }

  // Computed properties
  const isVisible = computed(() => visible.value)
  const isLoading = computed(() => loading.value)
  const canConfirm = computed(() => !loading.value && config.showConfirmButton)
  const canCancel = computed(() => !loading.value && config.showCancelButton)

  // Actions
  const show = () => {
    visible.value = true
  }

  const hide = () => {
    visible.value = false
    loading.value = false
  }

  const toggle = () => {
    visible.value = !visible.value
  }

  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }

  const updateConfig = (newConfig: Partial<DialogConfig>) => {
    Object.assign(config, newConfig)
  }

  const resetConfig = () => {
    Object.assign(config, originalConfig)
  }

  // Event handlers
  const handleConfirm = async () => {
    if (handlers.onConfirm) {
      try {
        setLoading(true)
        await handlers.onConfirm()
        hide()
      } catch (error) {
        console.error('Dialog confirm error:', error)
      } finally {
        setLoading(false)
      }
    } else {
      hide()
    }
  }

  const handleCancel = () => {
    if (handlers.onCancel) {
      handlers.onCancel()
    }
    hide()
  }

  const handleClose = () => {
    if (handlers.onClose) {
      handlers.onClose()
    }
    hide()
  }

  const handleUpdateShow = (value: boolean) => {
    visible.value = value
  }

  // Dialog state and actions object
  const state: DialogState = {
    visible,
    loading,
    config,
  }

  const actions: DialogActions = {
    show,
    hide,
    toggle,
    setLoading,
    updateConfig,
    resetConfig,
  }

  // Event handlers for template
  const events = {
    'update:show': handleUpdateShow,
    confirm: handleConfirm,
    cancel: handleCancel,
    close: handleClose,
  }

  return {
    // State
    ...state,
    isVisible,
    isLoading,
    canConfirm,
    canCancel,

    // Actions
    ...actions,

    // Event handlers
    events,
    handleConfirm,
    handleCancel,
    handleClose,
    handleUpdateShow,
  }
}

// Specialized composable for confirmation dialogs
export function useConfirmationDialog (
  title: string,
  message?: string,
  onConfirm?: () => void | Promise<void>,
) {
  const config = useDialogPreset('confirmation', {}, title, message)

  return useDialog(config, {
    onConfirm,
  })
}

// Specialized composable for delete confirmation dialogs
export function useDeleteConfirmationDialog (
  itemName?: string,
  onDelete?: () => void | Promise<void>,
) {
  const config = useDialogPreset('deleteConfirmation', {}, itemName)

  return useDialog(config, {
    onConfirm: onDelete,
  })
}

// Specialized composable for form dialogs
export function useFormDialog (
  title: string,
  subtitle?: string,
  onSave?: () => void | Promise<void>,
) {
  const config = useDialogPreset('form', {}, title, subtitle)

  return useDialog(config, {
    onConfirm: onSave,
  })
}

// Specialized composable for info dialogs
export function useInfoDialog (
  title: string,
  message?: string,
) {
  const config = useDialogPreset('info', {}, title, message)

  return useDialog(config)
}

// Specialized composable for error dialogs
export function useErrorDialog (
  title: string = 'Error',
  message?: string,
) {
  const config = useDialogPreset('error', {}, title, message)

  return useDialog(config)
}

// Specialized composable for success dialogs
export function useSuccessDialog (
  title: string = 'Success',
  message?: string,
) {
  const config = useDialogPreset('success', {}, title, message)

  return useDialog(config)
}

// Specialized composable for warning dialogs
export function useWarningDialog (
  title: string = 'Warning',
  message?: string,
) {
  const config = useDialogPreset('warning', {}, title, message)

  return useDialog(config)
}

// Utility composable for multiple dialogs management
export function useDialogManager () {
  const dialogs = reactive<Record<string, ReturnType<typeof useDialog>>>({})

  const createDialog = (
    key: string,
    config: Partial<DialogConfig> = {},
    handlers: Partial<DialogHandlers> = {},
  ) => {
    dialogs[key] = useDialog(config, handlers)
    return dialogs[key]
  }

  const getDialog = (key: string) => {
    return dialogs[key]
  }

  const showDialog = (key: string) => {
    if (dialogs[key]) {
      dialogs[key].show()
    }
  }

  const hideDialog = (key: string) => {
    if (dialogs[key]) {
      dialogs[key].hide()
    }
  }

  const hideAllDialogs = () => {
    Object.values(dialogs).forEach(dialog => dialog.hide())
  }

  const removeDialog = (key: string) => {
    delete dialogs[key]
  }

  const hasDialog = (key: string) => {
    return key in dialogs
  }

  const getVisibleDialogs = () => {
    return Object.entries(dialogs)
      .filter(([_, dialog]) => dialog.isVisible.value)
      .map(([key, dialog]) => ({ key, dialog }))
  }

  return {
    dialogs,
    createDialog,
    getDialog,
    showDialog,
    hideDialog,
    hideAllDialogs,
    removeDialog,
    hasDialog,
    getVisibleDialogs,
  }
}

// Global dialog service for app-wide dialog management
class DialogService {
  private manager = useDialogManager()

  // Quick methods for common dialogs
  confirm (
    title: string,
    message?: string,
    onConfirm?: () => void | Promise<void>,
  ) {
    const key = `confirm_${Date.now()}`
    const dialog = this.manager.createDialog(
      key,
      useDialogPreset('confirmation', {}, title, message),
      { onConfirm },
    )
    dialog.show()
    return dialog
  }

  deleteConfirm (
    itemName?: string,
    onDelete?: () => void | Promise<void>,
  ) {
    const key = `delete_${Date.now()}`
    const dialog = this.manager.createDialog(
      key,
      useDialogPreset('deleteConfirmation', {}, itemName),
      { onConfirm: onDelete },
    )
    dialog.show()
    return dialog
  }

  info (title: string, message?: string) {
    const key = `info_${Date.now()}`
    const dialog = this.manager.createDialog(
      key,
      useDialogPreset('info', {}, title, message),
    )
    dialog.show()
    return dialog
  }

  error (title: string = 'Error', message?: string) {
    const key = `error_${Date.now()}`
    const dialog = this.manager.createDialog(
      key,
      useDialogPreset('error', {}, title, message),
    )
    dialog.show()
    return dialog
  }

  success (title: string = 'Success', message?: string) {
    const key = `success_${Date.now()}`
    const dialog = this.manager.createDialog(
      key,
      useDialogPreset('success', {}, title, message),
    )
    dialog.show()
    return dialog
  }

  warning (title: string = 'Warning', message?: string) {
    const key = `warning_${Date.now()}`
    const dialog = this.manager.createDialog(
      key,
      useDialogPreset('warning', {}, title, message),
    )
    dialog.show()
    return dialog
  }

  // Custom dialog
  custom (
    config: Partial<DialogConfig>,
    handlers?: Partial<DialogHandlers>,
  ) {
    const key = `custom_${Date.now()}`
    const dialog = this.manager.createDialog(key, config, handlers)
    dialog.show()
    return dialog
  }

  // Manager methods
  hideAll () {
    this.manager.hideAllDialogs()
  }

  getVisible () {
    return this.manager.getVisibleDialogs()
  }
}

// Export singleton instance
export const dialogService = new DialogService()

// Plugin for Vue app
export default {
  install (app: any) {
    app.config.globalProperties.$dialog = dialogService
    app.provide('dialog', dialogService)
  },
}
