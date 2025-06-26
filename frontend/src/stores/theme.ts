import { defineStore } from 'pinia'
import { useTheme } from 'vuetify'
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
  
  // Apply theme to Vuetify
  const applyTheme = (vuetifyTheme: ReturnType<typeof useTheme>) => {
    const effectiveTheme = getEffectiveTheme()
    vuetifyTheme.global.name.value = effectiveTheme
  }
  
  // Initialize theme from cookie or system preference
  const initializeTheme = (vuetifyTheme: ReturnType<typeof useTheme>) => {
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
    applyTheme(vuetifyTheme)
    
    // Listen for system theme changes
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        systemPreference.value = e.matches ? 'dark' : 'light'
        if (mode.value === 'system') {
          applyTheme(vuetifyTheme)
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
  const setTheme = (newMode: ThemeMode, vuetifyTheme: ReturnType<typeof useTheme>) => {
    mode.value = newMode
    setCookie('theme-mode', newMode)
    applyTheme(vuetifyTheme)
  }
  
  // Toggle between light and dark (ignores system)
  const toggleTheme = (vuetifyTheme: ReturnType<typeof useTheme>) => {
    const currentEffective = getEffectiveTheme()
    const newMode = currentEffective === 'light' ? 'dark' : 'light'
    setTheme(newMode, vuetifyTheme)
  }
  
  // Cycle through all theme modes
  const cycleTheme = (vuetifyTheme: ReturnType<typeof useTheme>) => {
    const modes: ThemeMode[] = ['light', 'dark', 'system']
    const currentIndex = modes.indexOf(mode.value)
    const nextIndex = (currentIndex + 1) % modes.length
    setTheme(modes[nextIndex], vuetifyTheme)
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