// Token utility functions for better security and management
import { AUTH_CONSTANTS } from '@/stores/constants'

export interface TokenPayload {
  exp: number
  iat: number
  sub: string
  email: string
  role: string
}

/**
 * Decode JWT token without verification (for client-side use only)
 */
export function decodeToken(token: string): TokenPayload | null {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

/**
 * Check if token is expired or will expire soon
 */
export function isTokenExpired(token: string, bufferTime: number = AUTH_CONSTANTS.TOKEN_EXPIRY_BUFFER): boolean {
  const payload = decodeToken(token)
  if (!payload) return true

  const currentTime = Date.now()
  const expiryTime = payload.exp * 1000 // Convert to milliseconds
  
  return currentTime >= (expiryTime - bufferTime)
}

/**
 * Get token expiry time in milliseconds
 */
export function getTokenExpiry(token: string): number | null {
  const payload = decodeToken(token)
  return payload ? payload.exp * 1000 : null
}

/**
 * Check if token needs refresh (expires within buffer time)
 */
export function shouldRefreshToken(token: string): boolean {
  return isTokenExpired(token, AUTH_CONSTANTS.TOKEN_EXPIRY_BUFFER)
}

/**
 * Secure token storage with encryption (basic implementation)
 */
export class SecureTokenStorage {
  private static encrypt(data: string): string {
    // Basic encryption - in production, use a proper encryption library
    return btoa(data)
  }

  private static decrypt(data: string): string {
    try {
      return atob(data)
    } catch {
      return data // Fallback for non-encrypted data
    }
  }

  static setToken(key: string, token: string): void {
    try {
      const encrypted = this.encrypt(token)
      localStorage.setItem(key, encrypted)
    } catch (error) {
      console.error('Error storing token:', error)
      // Fallback to regular storage
      localStorage.setItem(key, token)
    }
  }

  static getToken(key: string): string | null {
    try {
      const stored = localStorage.getItem(key)
      return stored ? this.decrypt(stored) : null
    } catch (error) {
      console.error('Error retrieving token:', error)
      return localStorage.getItem(key)
    }
  }

  static removeToken(key: string): void {
    localStorage.removeItem(key)
  }

  static clearAllTokens(): void {
    this.removeToken(AUTH_CONSTANTS.TOKEN_KEY)
    this.removeToken(AUTH_CONSTANTS.REFRESH_TOKEN_KEY)
    this.removeToken(AUTH_CONSTANTS.USER_KEY)
  }
}

/**
 * Rate limiting for login attempts
 */
export class LoginRateLimit {
  private static getAttemptKey(email: string): string {
    return `login_attempts_${email}`
  }

  private static getCooldownKey(email: string): string {
    return `login_cooldown_${email}`
  }

  static getAttempts(email: string): number {
    const attempts = localStorage.getItem(this.getAttemptKey(email))
    return attempts ? parseInt(attempts, 10) : 0
  }

  static incrementAttempts(email: string): number {
    const current = this.getAttempts(email)
    const newCount = current + 1
    localStorage.setItem(this.getAttemptKey(email), newCount.toString())
    
    if (newCount >= AUTH_CONSTANTS.MAX_LOGIN_ATTEMPTS) {
      this.setCooldown(email)
    }
    
    return newCount
  }

  static resetAttempts(email: string): void {
    localStorage.removeItem(this.getAttemptKey(email))
    localStorage.removeItem(this.getCooldownKey(email))
  }

  static setCooldown(email: string): void {
    const cooldownUntil = Date.now() + AUTH_CONSTANTS.COOLDOWN_DURATION
    localStorage.setItem(this.getCooldownKey(email), cooldownUntil.toString())
  }

  static isInCooldown(email: string): boolean {
    const cooldownUntil = localStorage.getItem(this.getCooldownKey(email))
    if (!cooldownUntil) return false
    
    const now = Date.now()
    const cooldownTime = parseInt(cooldownUntil, 10)
    
    if (now >= cooldownTime) {
      this.resetAttempts(email)
      return false
    }
    
    return true
  }

  static getCooldownTimeRemaining(email: string): number {
    const cooldownUntil = localStorage.getItem(this.getCooldownKey(email))
    if (!cooldownUntil) return 0
    
    const now = Date.now()
    const cooldownTime = parseInt(cooldownUntil, 10)
    
    return Math.max(0, cooldownTime - now)
  }
}