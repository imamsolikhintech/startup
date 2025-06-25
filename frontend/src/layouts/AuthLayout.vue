<template>
  <v-container fluid class="auth-container pa-0">
    <v-row no-gutters class="fill-height">
      <!-- Left Panel - Branding -->
      <v-col cols="12" md="6" class="auth-brand-panel">
        <div class="brand-content">
          <v-icon size="64" color="white" class="mb-4">mdi-view-dashboard</v-icon>
          <h1 class="text-h3 font-weight-bold text-white mb-2">Vue Admin</h1>
          <p class="text-h6 text-white opacity-90 mb-8">
            Modern dashboard solution for your business needs
          </p>
          <div class="feature-list">
            <div class="feature-item" v-for="feature in features" :key="feature.icon">
              <v-icon color="white" class="mr-3" size="20">{{ feature.icon }}</v-icon>
              <span class="text-white">{{ feature.text }}</span>
            </div>
          </div>
        </div>
      </v-col>

      <!-- Right Panel - Forms -->
      <v-col cols="12" md="6" class="auth-form-panel">
        <div class="form-container">
          <router-view />
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const features = [
  { icon: 'mdi-chart-line', text: 'Advanced Analytics' },
  { icon: 'mdi-shield-check', text: 'Secure Authentication' },
  { icon: 'mdi-responsive', text: 'Responsive Design' },
  { icon: 'mdi-palette', text: 'Customizable Themes' }
]
</script>

<style scoped>
.auth-container {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.auth-brand-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.9), rgba(118, 75, 162, 0.9));
  position: relative;
  overflow: hidden;
  min-height: 100vh;
}

.auth-brand-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
}

.brand-content {
  text-align: center;
  z-index: 1;
  position: relative;
  max-width: 400px;
  padding: 2rem;
}

.feature-list {
  text-align: left;
  max-width: 300px;
  margin: 0 auto;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

.auth-form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  min-height: 100vh;
  padding: 2rem 1rem;
}

.form-container {
  width: 100%;
  max-width: 420px;
  padding: 2rem;
}

/* Mobile Responsive */
@media (max-width: 960px) {
  .auth-container {
    height: auto;
    min-height: 100vh;
  }
  
  .auth-brand-panel {
    min-height: 300px;
    padding: 2rem 1rem;
  }
  
  .brand-content {
    padding: 1rem;
  }
  
  .brand-content h1 {
    font-size: 2rem !important;
  }
  
  .brand-content p {
    font-size: 1.1rem !important;
  }
  
  .feature-list {
    display: none;
  }
  
  .auth-form-panel {
    min-height: auto;
    padding: 2rem 1rem;
  }
  
  .form-container {
    padding: 1rem;
    max-width: 100%;
  }
}

@media (max-width: 600px) {
  .auth-brand-panel {
    min-height: 250px;
  }
  
  .brand-content h1 {
    font-size: 1.75rem !important;
  }
  
  .brand-content p {
    font-size: 1rem !important;
  }
}
</style>