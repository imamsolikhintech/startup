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

<style scoped>
.page-loader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  transition: all 0.3s ease;
}

.page-loader-content {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 200px;
}

.loader-animation {
  margin-bottom: 1.5rem;
}

.loader-text h3 {
  color: rgba(var(--v-theme-on-surface));
}

.loader-text p {
  color: rgba(var(--v-theme-on-surface), 0.6);
}

/* Dark theme support */
.v-theme--dark .page-loader-overlay {
  background: rgba(18, 18, 18, 0.9);
}

.v-theme--dark .page-loader-content {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>