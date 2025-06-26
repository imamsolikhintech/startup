<template>
  <div class="not-found-view">
    <div class="container">
      <div class="content-wrapper">
        <div class="text-center">
          <div class="error-illustration mb-6">
            <n-icon size="120" color="#18a058" class="mb-4">
              <svg viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7A1,1 0 0,0 14,8H16A1,1 0 0,0 17,7V5.73C16.4,5.39 16,4.74 16,4A2,2 0 0,1 18,2A2,2 0 0,1 20,4C20,4.74 19.6,5.39 19,5.73V7A3,3 0 0,1 16,10V10.29C16.58,10.63 17,11.28 17,12A2,2 0 0,1 15,14A2,2 0 0,1 13,12A2,2 0 0,1 15,10A1,1 0 0,0 16,9V8H14A3,3 0 0,1 11,5V4.27C11.6,3.93 12,3.28 12,2.5A2,2 0 0,0 10,0.5A2,2 0 0,0 8,2.5C8,3.28 8.4,3.93 9,4.27V5A3,3 0 0,1 6,8H4A1,1 0 0,0 3,9V10A1,1 0 0,0 4,11A2,2 0 0,1 6,13A2,2 0 0,1 4,15A2,2 0 0,1 2,13C2,12.26 2.4,11.61 3,11.27V10A3,3 0 0,1 6,7H8A1,1 0 0,0 9,6V5.73C8.4,5.39 8,4.74 8,4A2,2 0 0,1 10,2A2,2 0 0,1 12,4Z"/>
              </svg>
            </n-icon>
          </div>
          
          <h1 class="error-title">404</h1>
          <h2 class="error-subtitle">Page Not Found</h2>
          <p class="error-description">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div class="action-buttons">
            <n-button
              type="primary"
              size="large"
              @click="$router.push('/dashboard')"
              class="mr-4"
            >
              <template #icon>
                <n-icon>
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z"/>
                  </svg>
                </n-icon>
              </template>
              Go Home
            </n-button>
            <n-button
              secondary
              size="large"
              @click="$router.go(-1)"
            >
              <template #icon>
                <n-icon>
                  <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
                  </svg>
                </n-icon>
              </template>
              Go Back
            </n-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton, NIcon } from 'naive-ui'
// Component logic can be added here if needed
</script>

<style scoped>
.not-found-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.container {
  width: 100%;
  max-width: 600px;
}

.content-wrapper {
  text-align: center;
}

.error-illustration {
  margin-bottom: 2rem;
}

.error-title {
  font-size: 4rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: var(--text-color-1);
}

.error-subtitle {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--text-color-2);
}

.error-description {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  color: var(--text-color-3);
  line-height: 1.6;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.mr-4 {
  margin-right: 1rem;
}

@media (max-width: 768px) {
  .error-title {
    font-size: 3rem;
  }
  
  .error-subtitle {
    font-size: 1.5rem;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .mr-4 {
    margin-right: 0;
    margin-bottom: 1rem;
  }
}
</style>

