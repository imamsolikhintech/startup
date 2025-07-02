import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { authService } from '@/api'
import { isTokenExpired, LoginRateLimit, SecureTokenStorage, shouldRefreshToken } from '@/utils/tokenUtils'
import { AUTH_CONSTANTS, ERROR_MESSAGES } from './constants'
import { AuthError, AuthErrorType } from './errors'

export interface User {
  id: string,
  email: string,
  name: string,
  avatar?: string,
  role: string,
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const initializing = ref(true)

  const isAuthenticated = computed(() => !!user.value)
  const token = computed(() => SecureTokenStorage.getToken(AUTH_CONSTANTS.TOKEN_KEY))
  const loginAttempts = ref(0)
  const isInCooldown = ref(false)

  const login = async (email: string, password: string) => {
    loading.value = true
    error.value = null

    // Check rate limiting
    if (LoginRateLimit.isInCooldown(email)) {
      const remainingTime = Math.ceil(LoginRateLimit.getCooldownTimeRemaining(email) / 60000)
      error.value = `${ERROR_MESSAGES.ACCOUNT_LOCKED} Try again in ${remainingTime} minutes.`
      loading.value = false
      isInCooldown.value = true
      return false
    }

    console.log('Auth store login called with:', email)

    try {
      const credentials = {
        email,
        password,
      }

      const response = await authService.login(credentials)

      if (response?.data) {
        const { user: apiUser } = response.data

        // Map API user to store user format
        const userData: User = {
          id: apiUser.id,
          email: apiUser.email,
          name: apiUser.name,
          avatar: apiUser.profile_picture,
          role: apiUser.role || 'guest',
        }

        user.value = userData

        // Store tokens and user data securely
        if (response.data?.tokens?.accessToken) {
          SecureTokenStorage.setToken(AUTH_CONSTANTS.TOKEN_KEY, response.data.tokens.accessToken)
        }
        if (response.data.tokens.refreshToken) {
          SecureTokenStorage.setToken(AUTH_CONSTANTS.REFRESH_TOKEN_KEY, response.data.tokens.refreshToken)
        }
        SecureTokenStorage.setToken(AUTH_CONSTANTS.USER_KEY, JSON.stringify(userData))

        // Reset login attempts on successful login
        LoginRateLimit.resetAttempts(email)
        loginAttempts.value = 0
        isInCooldown.value = false

        console.log('Login successful, user data:', userData)
        return true
      } else {
        throw new AuthError(response?.message || ERROR_MESSAGES.LOGIN_FAILED, AuthErrorType.INVALID_CREDENTIALS)
      }
    } catch (err: any) {
      console.error('Login error:', err)

      // Increment login attempts
      const attempts = LoginRateLimit.incrementAttempts(email)
      loginAttempts.value = attempts

      // Handle different error types
      const authError = err instanceof AuthError ? err : AuthError.fromApiError(err)
      error.value = authError.getUserFriendlyMessage()

      // Check if account is now in cooldown
      if (attempts >= AUTH_CONSTANTS.MAX_LOGIN_ATTEMPTS) {
        isInCooldown.value = true
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
        terms: true,
      }

      const response = await authService.register(registerData)

      if (response?.data) {
        const apiUser = response.data

        // Map API user to store user format
        const userData: User = {
          id: apiUser.id,
          email: apiUser.email,
          name: apiUser.name,
          avatar: apiUser.profile_picture,
          role: apiUser.role || 'user',
        }

        user.value = userData
        localStorage.setItem('auth_user', JSON.stringify(userData))

        console.log('Registration successful, user data:', userData)
        return true
      } else {
        throw new Error(response?.message || 'Registration failed')
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
      const refreshToken = SecureTokenStorage.getToken(AUTH_CONSTANTS.REFRESH_TOKEN_KEY)
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
      error.value = null
      loginAttempts.value = 0
      isInCooldown.value = false
      SecureTokenStorage.clearAllTokens()
      console.log('User logged out')

      // Show success notification with backend message if available
      try {
        const { useNotificationStore } = await import('@/stores/notifications')
        const notificationStore = useNotificationStore()

        const message = logoutResponse?.message || 'You have been successfully logged out'
        notificationStore.showSuccess(message, 'Logout Successful')
      } catch (notificationError) {
        console.warn('Could not show logout notification:', notificationError)
      }

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
    initializing.value = true
    try {
      const storedUser = SecureTokenStorage.getToken(AUTH_CONSTANTS.USER_KEY)
      const storedToken = SecureTokenStorage.getToken(AUTH_CONSTANTS.TOKEN_KEY)

      console.log('checkStoredAuth: Starting auth check', { hasUser: !!storedUser, hasToken: !!storedToken })

      if (storedUser && storedToken) {
        try {
          // Check if token is expired
          if (isTokenExpired(storedToken)) {
            console.log('Stored token is expired, attempting refresh')
            try {
              await refreshToken()
            } catch (refreshError) {
              console.error('Token refresh failed during auth check:', refreshError)
              SecureTokenStorage.clearAllTokens()
              return
            }
          }

          // Restore user from storage
          user.value = JSON.parse(storedUser)
          console.log('checkStoredAuth: Restored user from storage:', user.value)
          console.log('checkStoredAuth: isAuthenticated after restore:', isAuthenticated.value)

          // Verify token is still valid by getting fresh profile
          try {
            console.log('checkStoredAuth: Verifying token with API call')
            const response = await authService.getCurrentUser()
            if (response?.data) {
              const apiUser = response.data
              const userData: User = {
                id: apiUser.id,
                email: apiUser.email,
                name: apiUser.name,
                avatar: apiUser.profile_picture,
                role: apiUser.role || 'user',
              }
              user.value = userData
              SecureTokenStorage.setToken(AUTH_CONSTANTS.USER_KEY, JSON.stringify(userData))
              console.log('checkStoredAuth: Token validation successful, user updated')
            } else {
              console.log('checkStoredAuth: API response unsuccessful:', response)
              user.value = null
              // SecureTokenStorage.clearAllTokens()
            }
          } catch (err) {
            console.error('checkStoredAuth: Token validation failed:', err)
            // Clear invalid session
            user.value = null
            SecureTokenStorage.clearAllTokens()
          }
        } catch (err) {
          console.error('checkStoredAuth: Error parsing stored user data:', err)
          SecureTokenStorage.clearAllTokens()
        }
      } else {
        console.log('checkStoredAuth: No stored auth data found')
      }
    } finally {
      initializing.value = false
      console.log('checkStoredAuth: Initialization completed, isAuthenticated:', isAuthenticated.value)
    }
  }

  const refreshToken = async () => {
    const storedRefreshToken = SecureTokenStorage.getToken(AUTH_CONSTANTS.REFRESH_TOKEN_KEY)

    if (!storedRefreshToken) {
      throw new AuthError('No refresh token available', AuthErrorType.TOKEN_EXPIRED)
    }

    try {
      const response = await authService.refreshTokens(storedRefreshToken)

      if (response?.data) {
        SecureTokenStorage.setToken(AUTH_CONSTANTS.TOKEN_KEY, response.data.accessToken)
        SecureTokenStorage.setToken(AUTH_CONSTANTS.REFRESH_TOKEN_KEY, response.data.refreshToken)
        return response.data.accessToken
      } else {
        throw new AuthError(response?.message || ERROR_MESSAGES.TOKEN_EXPIRED, AuthErrorType.TOKEN_EXPIRED)
      }
    } catch (err: any) {
      console.error('Token refresh error:', err)
      // Clear invalid tokens and logout
      const authError = err instanceof AuthError ? err : AuthError.fromApiError(err)
      error.value = authError.getUserFriendlyMessage()
      logout()
      throw authError
    }
  }

  // Auto-refresh token when it's about to expire
  const setupAutoRefresh = () => {
    const currentToken = SecureTokenStorage.getToken(AUTH_CONSTANTS.TOKEN_KEY)
    if (!currentToken || !user.value) return

    if (shouldRefreshToken(currentToken)) {
      refreshToken().catch(err => {
        console.error('Auto-refresh failed:', err)
      })
    }

    // Set up periodic check for token refresh
    const refreshInterval = setInterval(() => {
      const token = SecureTokenStorage.getToken(AUTH_CONSTANTS.TOKEN_KEY)
      if (!token || !user.value) {
        clearInterval(refreshInterval)
        return
      }

      if (shouldRefreshToken(token)) {
        refreshToken().catch(err => {
          console.error('Auto-refresh failed:', err)
          clearInterval(refreshInterval)
        })
      }
    }, 60000) // Check every minute

    return refreshInterval
  }

  const updateProfile = async (profileData: Partial<User>) => {
    loading.value = true
    error.value = null

    try {
      const response = await authService.updateProfile(profileData)
      console.log(response?.data)
      if (response?.data) {
        const apiUser = response.data
        const userData: User = {
          id: apiUser.id,
          email: apiUser.email,
          name: apiUser.name,
          avatar: apiUser.profile_picture,
          role: apiUser.role || 'user',
        }

        user.value = userData
        localStorage.setItem('auth_user', JSON.stringify(userData))

        console.log('Profile updated successfully:', userData)
        return true
      } else {
        throw new Error(response?.message || 'Profile update failed')
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

  // Session timeout warning
  const sessionTimeoutWarning = ref(false)
  const showSessionWarning = () => {
    sessionTimeoutWarning.value = true
  }
  const hideSessionWarning = () => {
    sessionTimeoutWarning.value = false
  }

  // Remember me functionality
  const rememberMe = ref(false)
  const setRememberMe = (remember: boolean) => {
    rememberMe.value = remember
    localStorage.setItem(AUTH_CONSTANTS.REMEMBER_ME_KEY, remember.toString())
  }

  // Initialize remember me from storage
  const initRememberMe = () => {
    const stored = localStorage.getItem(AUTH_CONSTANTS.REMEMBER_ME_KEY)
    rememberMe.value = stored === 'true'
  }

  // Initialize on store creation
  initRememberMe()

  return {
    user,
    loading,
    error,
    initializing,
    isAuthenticated,
    token,
    loginAttempts,
    isInCooldown,
    sessionTimeoutWarning,
    rememberMe,
    login,
    register,
    logout,
    refreshToken,
    checkStoredAuth,
    updateProfile,
    setGoogleAuth,
    setupAutoRefresh,
    showSessionWarning,
    hideSessionWarning,
    setRememberMe,
  }
})
