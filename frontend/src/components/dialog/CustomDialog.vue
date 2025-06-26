<template>
  <v-dialog :model-value="show" @update:model-value="$emit('update:show', $event)" :max-width="maxWidth"
    :persistent="persistent" :scrollable="scrollable" :fullscreen="fullscreen" :transition="transition">
    <v-card :rounded="rounded">
      <!-- Header Section -->
      <v-card-title v-if="showHeader" class="custom-dialog-header" :class="headerClass">
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center">
            <v-icon v-if="headerIcon" :icon="headerIcon" :color="headerIconColor" class="mr-3" :size="headerIconSize" />
            <div>
              <div class="text-h6 font-weight-medium">{{ title }}</div>
              <div v-if="subtitle" class="text-caption text-medium-emphasis mt-1">
                {{ subtitle }}
              </div>
            </div>
          </div>

          <!-- Header Actions Slot -->
          <div class="d-flex align-center gap-2">
            <slot name="header-actions"></slot>

            <v-btn v-if="showCloseButton" :icon="closeIcon" size="small" variant="text" @click="handleClose"
              :title="closeButtonTitle" />
          </div>
        </div>
      </v-card-title>

      <v-divider v-if="showHeader && showHeaderDivider" />

      <!-- Content Section -->
      <v-card-text :class="contentClass" :style="contentStyle">
        <slot></slot>
      </v-card-text>

      <!-- Footer Section -->
      <template v-if="showFooter">
        <v-divider v-if="showFooterDivider" />

        <v-card-actions class="custom-dialog-footer" :class="footerClass">
          <slot name="footer">
            <!-- Default Footer Actions -->
            <v-spacer v-if="!footerJustifyStart" />

            <v-btn v-if="showCancelButton" :variant="cancelButtonVariant" :color="cancelButtonColor" :size="buttonSize"
              @click="handleCancel" :disabled="loading">
              {{ cancelButtonText }}
            </v-btn>

            <v-btn v-if="showConfirmButton" :variant="confirmButtonVariant" :color="confirmButtonColor"
              :size="buttonSize" :loading="loading" @click="handleConfirm">
              {{ confirmButtonText }}
            </v-btn>
          </slot>
        </v-card-actions>
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

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
  contentClass?: string
  contentStyle?: string | object

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
  cancelButtonVariant: 'text',

  showConfirmButton: true,
  confirmButtonText: 'Confirm',
  confirmButtonColor: 'primary',
  confirmButtonVariant: 'flat',

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