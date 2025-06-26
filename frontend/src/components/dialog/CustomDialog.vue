<template>
  <n-modal :show="show" @update:show="$emit('update:show', $event)" :mask-closable="!persistent"
    :close-on-esc="!persistent" :style="{ maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth }"
    :transform-origin="'center'">
    <n-card :style="{ width: '100%', maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth }"
      :title="showHeader ? title : undefined" :closable="showCloseButton" @close="handleClose" role="dialog">
      <!-- Header Section -->
      <template v-if="showHeader" #header>
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center">
            <n-icon v-if="headerIcon" :component="getIconComponent(headerIcon)" :color="headerIconColor"
              :size="headerIconSize" class="mr-3" />
            <div>
              <div class="text-lg font-medium">{{ title }}</div>
              <div v-if="subtitle" class="text-sm text-gray-500 mt-1">
                {{ subtitle }}
              </div>
            </div>
          </div>
          <!-- Header Actions Slot -->
          <div class="flex items-center gap-2">
            <slot name="header-actions"></slot>
          </div>
        </div>
      </template>

      <!-- Content Section -->
      <div :class="contentClass" :style="contentStyle">
        <slot></slot>
      </div>

      <!-- Footer Section -->
      <template v-if="showFooter" #footer>
        <div class="custom-dialog-footer" :class="footerClass">
          <slot name="footer">
            <!-- Default Footer Actions -->
            <div :class="footerJustifyStart ? 'flex justify-start gap-2' : 'flex justify-end gap-2'">
              <n-button v-if="showCancelButton" :type="cancelButtonVariant" :size="buttonSize" @click="handleCancel"
                :disabled="loading">
                {{ cancelButtonText }}
              </n-button>

              <n-button v-if="showConfirmButton" :type="confirmButtonVariant" :loading="loading"
                @click="handleConfirm">
                {{ confirmButtonText }}
              </n-button>
            </div>
          </slot>
        </div>
      </template>
    </n-card>
  </n-modal>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'

interface Props {
  // Dialog visibility
  show: boolean

  // Dialog configuration
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
  contentClass?: any
  contentStyle?: any

  // Footer configuration
  showFooter?: boolean
  footerClass?: string
  showFooterDivider?: boolean
  footerJustifyStart?: boolean

  // Footer buttons configuration
  showCancelButton?: boolean
  cancelButtonText?: string
  cancelButtonColor?: string
  cancelButtonVariant?: 'default' | 'tertiary' | 'primary' | 'info' | 'success' | 'warning' | 'error'

  showConfirmButton?: boolean
  confirmButtonText?: string
  confirmButtonColor?: string
  confirmButtonVariant?: 'default' | 'tertiary' | 'primary' | 'info' | 'success' | 'warning' | 'error'

  buttonSize?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
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

  contentClass: 'pa-6',
  contentStyle: '',

  showFooter: true,
  footerClass: 'pa-4',
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

  buttonSize: 'default',
  loading: false
})

interface Emits {
  'update:show': [value: boolean]
  'close': []
  'cancel': []
  'confirm': []
}

const emit = defineEmits<Emits>()

// Icon component mapper
const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, () => any> = {
    'mdi-account-edit': () => h('svg', {
      viewBox: '0 0 24 24',
      fill: 'currentColor'
    }, [
      h('path', {
        d: 'M21.7,13.35L20.7,14.35L18.65,12.3L19.65,11.3C19.86,11.09 20.21,11.09 20.42,11.3L21.7,12.58C21.91,12.79 21.91,13.14 21.7,13.35M12,18.94L18.06,12.88L20.11,14.93L14.06,21H12V18.94M12,14C7.58,14 4,15.79 4,18V20H10V18.94L12,16.94V14M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4Z'
      })
    ]),
    'mdi-account-plus': () => h('svg', {
      viewBox: '0 0 24 24',
      fill: 'currentColor'
    }, [
      h('path', {
        d: 'M15,14C12.33,14 7,15.33 7,18V20H23V18C23,15.33 17.67,14 15,14M6,10V7H4V10H1V12H4V15H6V12H9V10M15,12A4,4 0 0,0 19,8A4,4 0 0,0 15,4A4,4 0 0,0 11,8A4,4 0 0,0 15,12Z'
      })
    ]),
    'mdi-close': () => h('svg', {
      viewBox: '0 0 24 24',
      fill: 'currentColor'
    }, [
      h('path', {
        d: 'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z'
      })
    ])
  }

  return iconMap[iconName] || (() => h('svg', {
    viewBox: '0 0 24 24',
    fill: 'currentColor'
  }, [
    h('path', {
      d: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z'
    })
  ]))
}

// Computed properties
const dialogVisible = computed({
  get: () => props.show,
  set: (value: boolean) => emit('update:show', value)
})

// Event handlers
const handleClose = () => {
  emit('close')
  emit('update:show', false)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:show', false)
}

const handleConfirm = () => {
  emit('confirm')
}
</script>