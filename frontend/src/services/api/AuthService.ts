import { BaseApiService } from './BaseApiService'
import type { ApiClient } from '@/api/endpoint/axios'
import type { ApiResponse } from '@/api/types'

/**
 * Authentication related types
 */
export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  acceptTerms: boolean
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  avatar?: string
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface LoginResponse {
  user: User
  tokens: AuthTokens
}

export interface ResetPasswordData {
  email: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface UpdateProfileData {
  firstName?: string
  lastName?: string
  avatar?: string
}

/**
 * Authentication Service
 * 
 * Handles all authentication-related API operations including
 * login, registration, password management, and profile updates.
 */
export class AuthService extends BaseApiService {
  constructor(apiClient: ApiClient) {
    super(apiClient, '/auth')
  }

  /**
   * Login user with credentials
   * @param credentials - User login credentials
   * @returns Login response with user data and tokens
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    try {
      this.validateRequired(credentials, ['email', 'password'])
      
      return await this.apiClient.post<ApiResponse<LoginResponse>>(
        `${this.baseEndpoint}/login`,
        credentials
      )
    } catch (error) {
      this.handleError(error, 'Login')
    }
  }

  /**
   * Register new user
   * @param data - User registration data
   * @returns Registration response
   */
  async register(data: RegisterData): Promise<ApiResponse<LoginResponse>> {
    try {
      this.validateRequired(data, [
        'email',
        'password',
        'confirmPassword',
        'firstName',
        'lastName'
      ])
      
      if (data.password !== data.confirmPassword) {
        throw new Error('Passwords do not match')
      }
      
      if (!data.acceptTerms) {
        throw new Error('You must accept the terms and conditions')
      }
      
      return await this.apiClient.post<ApiResponse<LoginResponse>>(
        `${this.baseEndpoint}/register`,
        data
      )
    } catch (error) {
      this.handleError(error, 'Registration')
    }
  }

  /**
   * Logout user
   * @returns Logout response
   */
  async logout(): Promise<ApiResponse<null>> {
    try {
      return await this.apiClient.post<ApiResponse<null>>(
        `${this.baseEndpoint}/logout`
      )
    } catch (error) {
      this.handleError(error, 'Logout')
    }
  }

  /**
   * Refresh authentication tokens
   * @param refreshToken - Refresh token
   * @returns New tokens
   */
  async refreshTokens(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
    try {
      this.validateRequired({ refreshToken }, ['refreshToken'])
      
      return await this.apiClient.post<ApiResponse<AuthTokens>>(
        `${this.baseEndpoint}/refresh`,
        { refreshToken }
      )
    } catch (error) {
      this.handleError(error, 'Token refresh')
    }
  }

  /**
   * Get current user profile
   * @returns Current user data
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      return await this.apiClient.get<ApiResponse<User>>(
        `${this.baseEndpoint}/me`
      )
    } catch (error) {
      this.handleError(error, 'Get current user')
    }
  }

  /**
   * Update user profile
   * @param data - Profile update data
   * @returns Updated user data
   */
  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<User>> {
    try {
      return await this.apiClient.patch<ApiResponse<User>>(
        `${this.baseEndpoint}/me`,
        data
      )
    } catch (error) {
      this.handleError(error, 'Update profile')
    }
  }

  /**
   * Change user password
   * @param data - Password change data
   * @returns Success response
   */
  async changePassword(data: ChangePasswordData): Promise<ApiResponse<null>> {
    try {
      this.validateRequired(data, [
        'currentPassword',
        'newPassword',
        'confirmPassword'
      ])
      
      if (data.newPassword !== data.confirmPassword) {
        throw new Error('New passwords do not match')
      }
      
      return await this.apiClient.post<ApiResponse<null>>(
        `${this.baseEndpoint}/change-password`,
        data
      )
    } catch (error) {
      this.handleError(error, 'Change password')
    }
  }

  /**
   * Request password reset
   * @param data - Reset password data
   * @returns Success response
   */
  async requestPasswordReset(data: ResetPasswordData): Promise<ApiResponse<null>> {
    try {
      this.validateRequired(data, ['email'])
      
      return await this.apiClient.post<ApiResponse<null>>(
        `${this.baseEndpoint}/forgot-password`,
        data
      )
    } catch (error) {
      this.handleError(error, 'Password reset request')
    }
  }

  /**
   * Reset password with token
   * @param token - Reset token
   * @param newPassword - New password
   * @param confirmPassword - Password confirmation
   * @returns Success response
   */
  async resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<ApiResponse<null>> {
    try {
      this.validateRequired(
        { token, newPassword, confirmPassword },
        ['token', 'newPassword', 'confirmPassword']
      )
      
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match')
      }
      
      return await this.apiClient.post<ApiResponse<null>>(
        `${this.baseEndpoint}/reset-password`,
        { token, newPassword, confirmPassword }
      )
    } catch (error) {
      this.handleError(error, 'Password reset')
    }
  }

  /**
   * Verify email address
   * @param token - Verification token
   * @returns Success response
   */
  async verifyEmail(token: string): Promise<ApiResponse<null>> {
    try {
      this.validateRequired({ token }, ['token'])
      
      return await this.apiClient.post<ApiResponse<null>>(
        `${this.baseEndpoint}/verify-email`,
        { token }
      )
    } catch (error) {
      this.handleError(error, 'Email verification')
    }
  }

  /**
   * Resend email verification
   * @returns Success response
   */
  async resendEmailVerification(): Promise<ApiResponse<null>> {
    try {
      return await this.apiClient.post<ApiResponse<null>>(
        `${this.baseEndpoint}/resend-verification`
      )
    } catch (error) {
      this.handleError(error, 'Resend email verification')
    }
  }

  /**
   * Check if email is available
   * @param email - Email to check
   * @returns Availability status
   */
  async checkEmailAvailability(email: string): Promise<ApiResponse<{ available: boolean }>> {
    try {
      this.validateRequired({ email }, ['email'])
      
      return await this.apiClient.get<ApiResponse<{ available: boolean }>>(
        `${this.baseEndpoint}/check-email?email=${encodeURIComponent(email)}`
      )
    } catch (error) {
      this.handleError(error, 'Check email availability')
    }
  }

  /**
   * Enable two-factor authentication
   * @returns 2FA setup data
   */
  async enable2FA(): Promise<ApiResponse<{ qrCode: string; secret: string }>> {
    try {
      return await this.apiClient.post<ApiResponse<{ qrCode: string; secret: string }>>(
        `${this.baseEndpoint}/2fa/enable`
      )
    } catch (error) {
      this.handleError(error, 'Enable 2FA')
    }
  }

  /**
   * Verify and confirm 2FA setup
   * @param code - 2FA verification code
   * @returns Success response
   */
  async verify2FA(code: string): Promise<ApiResponse<null>> {
    try {
      this.validateRequired({ code }, ['code'])
      
      return await this.apiClient.post<ApiResponse<null>>(
        `${this.baseEndpoint}/2fa/verify`,
        { code }
      )
    } catch (error) {
      this.handleError(error, 'Verify 2FA')
    }
  }

  /**
   * Disable two-factor authentication
   * @param code - 2FA verification code
   * @returns Success response
   */
  async disable2FA(code: string): Promise<ApiResponse<null>> {
    try {
      this.validateRequired({ code }, ['code'])
      
      return await this.apiClient.post<ApiResponse<null>>(
        `${this.baseEndpoint}/2fa/disable`,
        { code }
      )
    } catch (error) {
      this.handleError(error, 'Disable 2FA')
    }
  }

  /**
   * Get user sessions
   * @returns Active sessions
   */
  async getSessions(): Promise<ApiResponse<any[]>> {
    try {
      return await this.apiClient.get<ApiResponse<any[]>>(
        `${this.baseEndpoint}/sessions`
      )
    } catch (error) {
      this.handleError(error, 'Get sessions')
    }
  }

  /**
   * Revoke specific session
   * @param sessionId - Session ID to revoke
   * @returns Success response
   */
  async revokeSession(sessionId: string): Promise<ApiResponse<null>> {
    try {
      this.validateRequired({ sessionId }, ['sessionId'])
      
      return await this.apiClient.delete<ApiResponse<null>>(
        `${this.baseEndpoint}/sessions/${sessionId}`
      )
    } catch (error) {
      this.handleError(error, 'Revoke session')
    }
  }

  /**
   * Revoke all sessions except current
   * @returns Success response
   */
  async revokeAllSessions(): Promise<ApiResponse<null>> {
    try {
      return await this.apiClient.post<ApiResponse<null>>(
        `${this.baseEndpoint}/sessions/revoke-all`
      )
    } catch (error) {
      this.handleError(error, 'Revoke all sessions')
    }
  }
}