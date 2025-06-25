<template>
  <div class="not-found-view">
    <v-container class="fill-height">
      <v-row align="center" justify="center">
        <v-col cols="12" md="6" class="text-center">
          <div class="error-illustration mb-6">
            <v-icon size="120" color="primary" class="mb-4">mdi-robot-confused</v-icon>
          </div>
          
          <h1 class="text-h2 font-weight-bold mb-4">404</h1>
          <h2 class="text-h4 mb-4">Page Not Found</h2>
          <p class="text-subtitle-1 text-medium-emphasis mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div class="action-buttons">
            <v-btn
              color="primary"
              size="large"
              to="/dashboard"
              prepend-icon="mdi-home"
              class="mr-4"
            >
              Go Home
            </v-btn>
            <v-btn
              variant="outlined"
              size="large"
              @click="$router.go(-1)"
              prepend-icon="mdi-arrow-left"
            >
              Go Back
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
// Component logic can be added here if needed
</script>

<style scoped>
.not-found-view {
  min-height: 100vh;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-secondary), 0.05) 100%);
}

.error-illustration {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.action-buttons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
}

@media (max-width: 600px) {
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .action-buttons .v-btn {
    width: 200px;
  }
}
</style>