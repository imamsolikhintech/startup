<template>
  <div
    v-if="loading"
    class="page-loader-overlay">
    <div class="page-loader-content">
      <div class="loader-animation">
        <n-spin size="large" />
      </div>
      <div class="loader-text">
        <h3 class="loader-title">
          Loading...
        </h3>
        <p class="loader-subtitle">
          Please wait while we load the content
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { NSpin } from 'naive-ui'

  interface Props {
    loading: boolean,
  }

  withDefaults(defineProps<Props>(), {
    loading: false,
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
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.page-loader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loader-animation {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loader-text {
  text-align: center;
}

.loader-title {
  font-size: 1.25rem;
  font-weight: 500;
  margin: 0 0 0.25rem 0;
  color: var(--text-color-1);
}

.loader-subtitle {
  font-size: 0.875rem;
  color: var(--text-color-3);
  margin: 0;
}
</style>
