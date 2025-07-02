<template>
  <div class="not-found-view">
    <n-card class="not-found-card">
      <div class="not-found-content">
        <div class="error-illustration">
          <n-icon
            size="120"
            color="var(--n-color-primary)"
            class="error-icon">
            <svg viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M13,13H11V7H13M13,17H11V15H13Z" />
            </svg>
          </n-icon>
        </div>

        <h1 class="error-title">
          404
        </h1>
        <h2 class="error-subtitle">
          Page Not Found
        </h2>
        <p class="error-description">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <n-space
          class="action-buttons"
          justify="center">
          <n-button
            type="primary"
            size="large"
            @click="$router.push('/dashboard')">
            <template #icon>
              <n-icon>
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />
                </svg>
              </n-icon>
            </template>
            Go Home
          </n-button>
          <n-button
            secondary
            size="large"
            @click="$router.go(-1)">
            <template #icon>
              <n-icon>
                <svg viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
                </svg>
              </n-icon>
            </template>
            Go Back
          </n-button>
        </n-space>
      </div>
    </n-card>
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
  background: var(--n-color-base);
}

.not-found-card {
  max-width: 600px;
  width: 100%;
  text-align: center;
}

.not-found-content {
  padding: 2rem;
}

.error-illustration {
  margin-bottom: 2rem;
}

.error-icon {
  opacity: 0.8;
}

.error-title {
  font-size: 6rem;
  font-weight: 700;
  color: var(--n-text-color-base);
  margin: 0;
  line-height: 1;
  margin-bottom: 1rem;
}

.error-subtitle {
  font-size: 2rem;
  font-weight: 600;
  color: var(--n-text-color-base);
  margin: 0 0 1rem 0;
}

.error-description {
  font-size: 1.125rem;
  color: var(--n-text-color-placeholder);
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

.action-buttons {
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .not-found-content {
    padding: 1.5rem;
  }

  .error-title {
    font-size: 4rem;
  }

  .error-subtitle {
    font-size: 1.5rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>

