import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/api'
import type { User as ApiUser, LoginRequest } from '@/api/types'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)
  const token = computed(() => localStorage.getItem('auth_token'))

  const login = async (email: string, password: string) => {
    loading.value = true
    error.value = null

    console.log('Auth store login called with:', email)

    try {
      const credentials: LoginRequest = {
        email,
        password
      }
      
      const response = await authService.login(credentials)
      
      if (response.success && response.data) {
        const { user: apiUser, token } = response.data
        
        // Map API user to store user format
        const userData: User = {
          id: apiUser.id,
          email: apiUser.email,
          name: apiUser.name,
          avatar: apiUser.avatar,
          role: apiUser.role?.name || 'user'
        }
        
        user.value = userData
        
        // Store token and user data
        localStorage.setItem('auth_token', response.data.accessToken || token)
        if (response.data.refreshToken) {
          localStorage.setItem('refresh_token', response.data.refreshToken)
        }
        localStorage.setItem('auth_user', JSON.stringify(userData))
        
        console.log('Login successful, user data:', userData)
        return true
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      
      // Handle API error response
      if (err.response?.data?.message) {
        error.value = err.response.data.message
      } else if (err.message) {
        error.value = err.message
      } else {
        error.value = 'Login failed. Please try again.'
      }
      
      return false
    } finally {
      loading.value = false
    }
  }

  const register = async (email: string, password: string, name: string, confirmPassword: string) => {
    loading.value = true
    error.value = null

    try {
      const registerData = {
        email,
        password,
        confirmPassword,
        name,
        terms: true
      }
      
      const response = await authService.register(registerData)
      
      if (response.success && response.data) {
        const apiUser = response.data
        
        // Map API user to store user format
        const userData: User = {
          id: apiUser.id,
          email: apiUser.email,
          name: apiUser.name,
          avatar: apiUser.avatar,
          role: apiUser.role?.name || 'user'
        }
        
        user.value = userData
        localStorage.setItem('auth_user', JSON.stringify(userData))
        
        console.log('Registration successful, user data:', userData)
        return true
      } else {
        throw new Error(response.message || 'Registration failed')
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      
      // Handle API error response
      if (err.response?.data?.message) {
        error.value = err.response.data.message
      } else if (err.response?.data?.errors) {
        error.value = err.response.data.errors.join(', ')
      } else if (err.message) {
        error.value = err.message
      } else {
        error.value = 'Registration failed. Please try again.'
      }
      
      return false
    } finally {
      loading.value = false
    }
  }

  const logout = async (router?: any) => {
    let logoutResponse = null
    try {
      // Only call API logout if we have a refresh token
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        logoutResponse = await authService.logout()
      } else {
        console.log('No refresh token found, skipping API logout call')
      }
    } catch (err) {
      console.error('Logout API error:', err)
      // Continue with local logout even if API call fails
    } finally {
      // Clear local state and storage
      user.value = null
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      console.log('User logged out')
      
      // Show success notification with backend message if available
      const { useNotificationStore } = await import('@/stores/notifications')
      const notificationStore = useNotificationStore()
      
      const message = logoutResponse?.message || 'You have been successfully logged out'
      notificationStore.showSuccess(message, 'Logout Successful')
      
      // Redirect to login page if router is provided
      if (router) {
        router.push('/auth/login')
      } else {
        // Fallback: reload to login page
        window.location.href = '/auth/login'
      }
    }
  }

  const checkStoredAuth = async () => {
    const storedUser = localStorage.getItem('auth_user')
    const storedToken = localStorage.getItem('auth_token')
    
    if (storedUser && storedToken) {
      try {
        // Restore user from storage
        user.value = JSON.parse(storedUser)
        console.log('Restored user from storage:', user.value)
        
        // Verify token is still valid by getting fresh profile
        try {
          const response = await authService.getProfile()
          if (response.success && response.data) {
            const apiUser = response.data
            const userData: User = {
              id: apiUser.id,
              email: apiUser.email,
              name: apiUser.name,
              avatar: apiUser.avatar,
              role: apiUser.role?.name || 'user'
            }
            user.value = userData
            localStorage.setItem('auth_user', JSON.stringify(userData))
          }
        } catch (err) {
          console.error('Token validation failed:', err)
          // Clear invalid session
          user.value = null
          localStorage.removeItem('auth_user')
          localStorage.removeItem('auth_token')
        }
      } catch (err) {
        console.error('Error parsing stored user data:', err)
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_token')
      }
    }
  }
  
  const refreshToken = async () => {
    const storedRefreshToken = localStorage.getItem('refresh_token')
    
    if (!storedRefreshToken) {
      throw new Error('No refresh token available')
    }
    
    try {
      const response = await authService.refreshToken(storedRefreshToken)
      
      if (response.success && response.data) {
        localStorage.setItem('auth_token', response.data.accessToken)
        localStorage.setItem('refresh_token', response.data.refreshToken)
        return response.data.accessToken
      } else {
        throw new Error(response.message || 'Token refresh failed')
      }
    } catch (err: any) {
      console.error('Token refresh error:', err)
      // Clear invalid tokens and logout
      logout()
      throw err
    }
  }

  const updateProfile = async (profileData: Partial<User>) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await authService.updateProfile(profileData)
      
      if (response.success && response.data) {
        const apiUser = response.data
        const userData: User = {
          id: apiUser.id,
          email: apiUser.email,
          name: apiUser.name,
          avatar: apiUser.avatar,
          role: apiUser.role?.name || 'user'
        }
        
        user.value = userData
        localStorage.setItem('auth_user', JSON.stringify(userData))
        
        console.log('Profile updated successfully:', userData)
        return true
      } else {
        throw new Error(response.message || 'Profile update failed')
      }
    } catch (err: any) {
      console.error('Profile update error:', err)
      
      if (err.response?.data?.message) {
        error.value = err.response.data.message
      } else if (err.message) {
        error.value = err.message
      } else {
        error.value = 'Profile update failed. Please try again.'
      }
      
      return false
    } finally {
      loading.value = false
    }
  }

  const setGoogleAuth = (userData: User, accessToken: string, refreshToken: string) => {
    try {
      // Set user data
      user.value = userData
      
      // Store tokens
      localStorage.setItem('auth_token', accessToken)
      localStorage.setItem('refresh_token', refreshToken)
      localStorage.setItem('auth_user', JSON.stringify(userData))
      
      // Clear any errors
      error.value = null
      loading.value = false
      
      console.log('Google OAuth authentication set successfully')
      return true
    } catch (err) {
      console.error('Error setting Google auth:', err)
      error.value = 'Failed to set authentication data'
      loading.value = false
      return false
    }
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    token,
    login,
    register,
    logout,
    refreshToken,
    checkStoredAuth,
    updateProfile,
    setGoogleAuth
  }
})