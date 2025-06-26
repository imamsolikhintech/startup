import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import router from './router'
import App from './App.vue'

// Vuetify styles
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

// Import all styles
import '@/assets/styles/index.css'

// Service Worker Registration removed - sw.js file not found
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi }
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1976D2',
          secondary: '#424242',
          accent: '#FF5722',
          error: '#F44336',
          warning: '#FF9800',
          info: '#2196F3',
          success: '#4CAF50',
          surface: '#FFFFFF',
          background: '#F5F5F5'
        }
      },
      dark: {
        colors: {
          primary: '#2196F3',
          secondary: '#616161',
          accent: '#FF7043',
          error: '#EF5350',
          warning: '#FFA726',
          info: '#42A5F5',
          success: '#66BB6A',
          surface: '#1E1E1E',
          background: '#121212'
        }
      }
    }
  }
})

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(vuetify)

// Initialize auth store after pinia is set up
import { useAuthStore } from './stores/auth'
const authStore = useAuthStore()
authStore.checkStoredAuth()

app.mount('#app')