import { ApiClient } from '../endpoint/axios'
import type {
  ApiResponse,
  LoginCredentials,
  LoginResponse,
  RegisterData,
  User,
  AuthTokens,
  ResetPasswordData,
  ChangePasswordData,
  UpdateProfileData
} from '../types'
import { BaseApiService } from './BaseApiService'

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
   * Request password reset (send email with reset link)
   * @param data - Email for password reset
   * @returns Success response
   */
  async forgotPassword(data: ResetPasswordData): Promise<ApiResponse<null>> {
    try {
      this.validateRequired(data, ['email'])

      return await this.apiClient.post<ApiResponse<null>>(
        `${this.baseEndpoint}/forgot-password`,
        data
      )
    } catch (error) {
      this.handleError(error, 'Forgot password')
    }
  }

  /**
   * Reset password using token from email
   * @param token - Reset token
   * @param data - New password data
   * @returns Success response
   */
  async resetPassword(token: string, data: ChangePasswordData): Promise<ApiResponse<null>> {
    try {
      this.validateRequired(data, ['newPassword', 'confirmPassword'])

      if (data.newPassword !== data.confirmPassword) {
        throw new Error('New passwords do not match')
      }

      return await this.apiClient.post<ApiResponse<null>>(
        `${this.baseEndpoint}/reset-password/${token}`,
        data
      )
    } catch (error) {
      this.handleError(error, 'Reset password')
    }
  }

  /**
   * Verify user email with token
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
   * Resend email verification link
   * @param email - User email
   * @returns Success response
   */
  async resendVerificationEmail(email: string): Promise<ApiResponse<null>> {
    try {
      this.validateRequired({ email }, ['email'])

      return await this.apiClient.post<ApiResponse<null>>(
        `${this.baseEndpoint}/resend-verification-email`,
        { email }
      )
    } catch (error) {
      this.handleError(error, 'Resend verification email')
    }
  }

  /**
   * Check if email exists
   * @param email - Email to check
   * @returns Response indicating if email exists
   */
  async checkEmail(email: string): Promise<ApiResponse<{ exists: boolean }>> {
    try {
      this.validateRequired({ email }, ['email'])

      return await this.apiClient.get<ApiResponse<{ exists: boolean }>>(
        `${this.baseEndpoint}/check-email?email=${email}`
      )
    } catch (error) {
      this.handleError(error, 'Check email')
    }
  }

  /**
   * Get user permissions
   * @returns Array of permissions
   */
  async getPermissions(): Promise<ApiResponse<string[]>> {
    try {
      return await this.apiClient.get<ApiResponse<string[]>>(
        `${this.baseEndpoint}/permissions`
      )
    } catch (error) {
      this.handleError(error, 'Get permissions')
    }
  }

  /**
   * Upload user avatar
   * @param file - Avatar file to upload
   * @param onProgress - Progress callback
   * @returns Upload response with avatar URL
   */
  async uploadAvatar(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<{ avatarUrl: string }>> {
    try {
      return await this.apiClient.upload<ApiResponse<{ avatarUrl: string }>>(
        `${this.baseEndpoint}/upload-avatar`,
        file,
        (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(progress)
          }
        }
      )
    } catch (error) {
      this.handleError(error, 'Upload avatar')
    }
  }

  /**
   * Delete user avatar
   * @returns Success response
   */
  async deleteAvatar(): Promise<ApiResponse<null>> {
    try {
      return await this.apiClient.delete<ApiResponse<null>>(
        `${this.baseEndpoint}/avatar`
      )
    } catch (error) {
      this.handleError(error, 'Delete avatar')
    }
  }

  /**
   * Enable Two-Factor Authentication (2FA)
   * @returns QR code and secret for 2FA setup
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
   * Verify Two-Factor Authentication (2FA) setup
   * @param code - 2FA code from authenticator app
   * @returns Backup codes
   */
  async verify2FA(code: string): Promise<ApiResponse<{ backupCodes: string[] }>> {
    try {
      this.validateRequired({ code }, ['code'])

      return await this.apiClient.post<ApiResponse<{ backupCodes: string[] }>>(
        `${this.baseEndpoint}/2fa/verify`,
        { code }
      )
    } catch (error) {
      this.handleError(error, 'Verify 2FA')
    }
  }

  /**
   * Disable Two-Factor Authentication (2FA)
   * @param password - User's current password
   * @returns Success response
   */
  async disable2FA(password: string): Promise<ApiResponse<null>> {
    try {
      this.validateRequired({ password }, ['password'])

      return await this.apiClient.post<ApiResponse<null>>(
        `${this.baseEndpoint}/2fa/disable`,
        { password }
      )
    } catch (error) {
      this.handleError(error, 'Disable 2FA')
    }
  }

  /**
   * Get user login history
   * @param page - Page number
   * @param limit - Items per page
   * @returns Paginated login history
   */
  async getLoginHistory(page: number = 1, limit: number = 10): Promise<ApiResponse<any>> {
    try {
      return await this.apiClient.get<ApiResponse<any>>(
        `${this.baseEndpoint}/login-history?page=${page}&limit=${limit}`
      )
    } catch (error) {
      this.handleError(error, 'Get login history')
    }
  }

  /**
   * Revoke all user sessions (logout from all devices)
   * @returns Success response
   */
  async revokeAllSessions(): Promise<ApiResponse<null>> {
    try {
      return await this.apiClient.post<ApiResponse<null>>(
        `${this.baseEndpoint}/revoke-sessions`
      )
    } catch (error) {
      this.handleError(error, 'Revoke all sessions')
    }
  }
}

// Export singleton instance
export const authServiceInstance = new AuthService()
export default authServiceInstance