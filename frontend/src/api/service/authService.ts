import { ApiClient } from '../endpoint/axios'
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User
} from '../types'

// Authentication Service
export class AuthService {
  private apiClient: ApiClient

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient
  }
  // Login user
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return await this.apiClient.post<ApiResponse<LoginResponse>>('/login', credentials)
  }

  // Register new user
  async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
    return await this.apiClient.post<ApiResponse<User>>('/register', userData)
  }

  // Logout user
  async logout(): Promise<ApiResponse<null>> {
    return await this.apiClient.post<ApiResponse<null>>('/logout')
  }

  // Refresh token
  async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string; refreshToken: string }>> {
    return await this.apiClient.post<ApiResponse<{ token: string; refreshToken: string }>>('/refresh', {
      refreshToken
    })
  }

  // Get current user profile
  async getProfile(): Promise<ApiResponse<User>> {
    return await this.apiClient.get<ApiResponse<User>>('/profile')
  }

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return await this.apiClient.put<ApiResponse<User>>('/profile', userData)
  }

  // Change password
  async changePassword(data: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  }): Promise<ApiResponse<null>> {
    return await this.apiClient.post<ApiResponse<null>>('/change-password', data)
  }

  // Forgot password
  async forgotPassword(email: string): Promise<ApiResponse<null>> {
    return await this.apiClient.post<ApiResponse<null>>('/forgot-password', { email })
  }

  // Reset password
  async resetPassword(data: {
    token: string
    password: string
    confirmPassword: string
  }): Promise<ApiResponse<null>> {
    return await this.apiClient.post<ApiResponse<null>>('/reset-password', data)
  }

  // Verify email
  async verifyEmail(token: string): Promise<ApiResponse<null>> {
    return await this.apiClient.post<ApiResponse<null>>('/verify-email', { token })
  }

  // Resend verification email
  async resendVerification(email: string): Promise<ApiResponse<null>> {
    return await this.apiClient.post<ApiResponse<null>>('/resend-verification', { email })
  }

  // Check if email exists
  async checkEmail(email: string): Promise<ApiResponse<{ exists: boolean }>> {
    return await this.apiClient.get<ApiResponse<{ exists: boolean }>>(`/check-email?email=${email}`)
  }

  // Get user permissions
  async getPermissions(): Promise<ApiResponse<string[]>> {
    return await this.apiClient.get<ApiResponse<string[]>>('/permissions')
  }

  // Upload avatar
  async uploadAvatar(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<{ avatarUrl: string }>> {
    return await this.apiClient.upload<ApiResponse<{ avatarUrl: string }>>(
      '/upload-avatar',
      file,
      (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      }
    )
  }

  // Delete avatar
  async deleteAvatar(): Promise<ApiResponse<null>> {
    return await this.apiClient.delete<ApiResponse<null>>('/avatar')
  }

  // Enable 2FA
  async enable2FA(): Promise<ApiResponse<{ qrCode: string; secret: string }>> {
    return await this.apiClient.post<ApiResponse<{ qrCode: string; secret: string }>>('/2fa/enable')
  }

  // Verify 2FA
  async verify2FA(code: string): Promise<ApiResponse<{ backupCodes: string[] }>> {
    return await this.apiClient.post<ApiResponse<{ backupCodes: string[] }>>('/2fa/verify', { code })
  }

  // Disable 2FA
  async disable2FA(password: string): Promise<ApiResponse<null>> {
    return await this.apiClient.post<ApiResponse<null>>('/2fa/disable', { password })
  }

  // Get login history
  async getLoginHistory(page: number = 1, limit: number = 10): Promise<ApiResponse<{
    data: Array<{
      id: string
      ipAddress: string
      userAgent: string
      location?: string
      loginAt: string
      success: boolean
    }>
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }>> {
    return await this.apiClient.getPaginated<PaginatedResponse<{
      id: string
      ip: string
      userAgent: string
      loginAt: string
      location?: string
    }>>('/login-history', page, limit)
  }

  // Revoke all sessions
  async revokeAllSessions(): Promise<ApiResponse<null>> {
    return await this.apiClient.post<ApiResponse<null>>('/revoke-sessions')
  }
}

// Export singleton instance
export const authServiceInstance = new AuthService()
export default authServiceInstance