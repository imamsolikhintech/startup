<template>
  <CustomDialog
    :show="show"
    :max-width="400"
    :persistent="true"
    title="Delete User"
    subtitle="This action cannot be undone"
    header-icon="mdi-delete"
    header-icon-color="error"
    :loading="loading"
    confirm-button-text="Delete"
    confirm-button-color="error"
    cancel-button-text="Cancel"
    @update:show="$emit('update:show', $event)"
    @confirm="$emit('confirm')"
    @cancel="$emit('cancel')"
    @close="$emit('cancel')"
    header-class="bg-error text-white"
  >
    <n-alert
      type="error"
      class="mb-4"
    >
      <template #icon>
        <n-icon>
          <svg viewBox="0 0 24 24">
            <path fill="currentColor" d="M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"/>
          </svg>
        </n-icon>
      </template>
      You are about to permanently delete this user. This action cannot be undone.
    </n-alert>
    
    <div class="text-body-1 mb-4">
      Are you sure you want to delete <strong>{{ userName }}</strong>?
    </div>
    
    <div class="text-body-2 text-medium-emphasis">
      All user data, including profile information and activity history, will be permanently removed.
    </div>
  </CustomDialog>
</template>

<script setup lang="ts">
import { NAlert, NIcon } from 'naive-ui'

interface Props {
  show: boolean
  userName: string
  loading?: boolean
}

interface Emits {
  'update:show': [value: boolean]
  confirm: []
  cancel: []
}

defineProps<Props>()
defineEmits<Emits>()
</script>

<script lang="ts">
import CustomDialog from '@/components/dialog/CustomDialog.vue'

export default {
  name: 'DeleteConfirmDialog',
  components: {
    CustomDialog
  }
}
</script>