<template>
  <div v-if="loading" class="page-loader-overlay">
    <div class="page-loader-content">
      <div class="loader-animation">
        <v-progress-circular
          :size="60"
          :width="4"
          color="primary"
          indeterminate
        />
      </div>
      <div class="loader-text">
        <h3 class="text-h6 font-weight-medium mb-1">Loading...</h3>
        <p class="text-caption text-medium-emphasis">Please wait while we load the content</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  loading: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false
})
</script>