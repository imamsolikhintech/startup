<template>
  <v-container fluid class="auth-container pa-0">
    <v-row no-gutters class="fill-height" style="background-image: url('https://png.pngtree.com/background/20210714/original/pngtree-abstract-system-technology-background-picture-image_1229183.jpg'); background-size: cover; background-position: center;">
      <!-- Left Panel - Branding -->
      <v-col cols="12" md="6" class="auth-brand-panel d-none d-md-flex align-center justify-center">
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

