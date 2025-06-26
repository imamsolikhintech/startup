// Authentication constants
export const AUTH_CONSTANTS = {  
  TOKEN_KEY: 'auth_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  USER_KEY: 'auth_user',
  REMEMBER_ME_KEY: 'remember_me',
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutes in milliseconds
  MAX_LOGIN_ATTEMPTS: 5,
  COOLDOWN_DURATION: 15 * 60 * 1000, // 15 minutes in milliseconds
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
} as const

// Error messages
export const ERROR_MESSAGES = {
  LOGIN_FAILED: 'Login failed. Please check your credentials.',
  REGISTRATION_FAILED: 'Registration failed. Please try again.',
  TOKEN_EXPIRED: 'Your session has expired. Please login again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_LOCKED: 'Account temporarily locked due to multiple failed attempts.',
  PROFILE_UPDATE_FAILED: 'Profile update failed. Please try again.',
  LOGOUT_FAILED: 'Logout failed. Please try again.',
} as const

// API endpoints
export const API_ENDPOINTS = {
  LOGIN: '/api/v1/auth/login',
  REGISTER: '/api/v1/auth/register',
  LOGOUT: '/api/v1/auth/logout',
  REFRESH: '/api/v1/auth/refresh',
  PROFILE: '/api/v1/auth/profile',
  GOOGLE_LOGIN: '/api/v1/auth/google/login',
} as const