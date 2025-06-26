import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeState {
  mode: ThemeMode
  systemPreference: 'light' | 'dark'
}

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>('light')
  const systemPreference = ref<'light' | 'dark'>('light')
  
  // Cookie helpers
  const setCookie = (name: string, value: string, days: number = 365) => {
    const expires = new Date()
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
  }
  
  const getCookie = (name: string): string | null => {
    const nameEQ = name + "="
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
  }
  
  // Detect system theme preference
  const detectSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }
  
  // Get effective theme (resolves 'system' to actual theme)
  const getEffectiveTheme = (): 'light' | 'dark' => {
    if (mode.value === 'system') {
      return systemPreference.value
    }
    return mode.value as 'light' | 'dark'
  }
  
  // Apply theme to document
  const applyTheme = () => {
    const effectiveTheme = getEffectiveTheme()
    const isDark = effectiveTheme === 'dark'
    
    // Set data attribute for CSS selectors
    document.documentElement.setAttribute('data-theme', effectiveTheme)
    
    // Toggle dark class for compatibility
    document.documentElement.classList.toggle('dark', isDark)
    document.documentElement.classList.toggle('v-theme--dark', isDark)
    document.documentElement.classList.toggle('v-theme--light', !isDark)
    
    // Set body class for Naive UI compatibility
    document.body.classList.toggle('dark-theme', isDark)
    document.body.classList.toggle('light-theme', !isDark)
  }
  
  // Initialize theme from cookie or system preference
  const initializeTheme = () => {
    // Get saved theme from cookie
    const savedTheme = getCookie('theme-mode') as ThemeMode
    
    // Detect system preference
    systemPreference.value = detectSystemTheme()
    
    // Set initial theme
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      mode.value = savedTheme
    } else {
      mode.value = 'system'
    }
    
    // Apply theme
    applyTheme()
    
    // Listen for system theme changes
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        systemPreference.value = e.matches ? 'dark' : 'light'
        if (mode.value === 'system') {
          applyTheme()
        }
      }
      
      // Modern browsers
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSystemThemeChange)
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleSystemThemeChange)
      }
    }
  }
  
  // Set theme mode
  const setTheme = (newMode: ThemeMode) => {
    mode.value = newMode
    setCookie('theme-mode', newMode)
    applyTheme()
  }
  
  // Toggle between light and dark (ignores system)
  const toggleTheme = () => {
    const currentEffective = getEffectiveTheme()
    const newMode = currentEffective === 'light' ? 'dark' : 'light'
    setTheme(newMode)
  }
  
  // Cycle through all theme modes
  const cycleTheme = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'system']
    const currentIndex = modes.indexOf(mode.value)
    const nextIndex = (currentIndex + 1) % modes.length
    setTheme(modes[nextIndex])
  }
  
  return {
    // State
    mode,
    systemPreference,
    
    // Getters
    getEffectiveTheme,
    
    // Actions
    initializeTheme,
    setTheme,
    toggleTheme,
    cycleTheme,
    applyTheme
  }
})