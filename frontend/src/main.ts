// Import all styles
import '@/assets/styles/index.css'
import naive from 'naive-ui'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Service Worker Registration removed - sw.js file not found

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(naive)

// Initialize auth store after pinia is set up
import { useAuthStore } from './stores/auth'
const authStore = useAuthStore()

// Wait for auth initialization before mounting the app
authStore.checkStoredAuth().then(() => {
  app.mount('#app')
}).catch((error) => {
  console.error('Auth initialization failed:', error)
  app.mount('#app')
})
