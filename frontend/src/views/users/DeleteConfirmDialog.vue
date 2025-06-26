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
    <v-alert
      type="error"
      variant="tonal"
      class="mb-4"
      icon="mdi-alert-circle"
    >
      You are about to permanently delete this user. This action cannot be undone.
    </v-alert>
    
    <div class="text-body-1 mb-4">
      Are you sure you want to delete <strong>{{ userName }}</strong>?
    </div>
    
    <div class="text-body-2 text-medium-emphasis">
      All user data, including profile information and activity history, will be permanently removed.
    </div>
  </CustomDialog>
</template>

<script setup lang="ts">
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