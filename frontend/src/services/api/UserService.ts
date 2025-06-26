import { BaseApiService } from './BaseApiService'
import type { ApiClient } from '@/api/endpoint/axios'
import type { ApiResponse, PaginatedResponse } from '@/api/types'

/**
 * User related types
 */
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName?: string
  role: string
  avatar?: string
  isEmailVerified: boolean
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
  permissions?: string[]
  preferences?: UserPreferences
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto'
  language: string
  timezone: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends'
    showEmail: boolean
    showLastSeen: boolean
  }
}

export interface CreateUserData {
  email: string
  firstName: string
  lastName: string
  role: string
  password?: string
  sendInvitation?: boolean
}

export interface UpdateUserData {
  firstName?: string
  lastName?: string
  role?: string
  isActive?: boolean
  avatar?: string
}

export interface UserFilters {
  role?: string
  isActive?: boolean
  isEmailVerified?: boolean
  search?: string
  createdAfter?: string
  createdBefore?: string
}

export interface UserStats {
  total: number
  active: number
  inactive: number
  verified: number
  unverified: number
  byRole: Record<string, number>
  recentRegistrations: number
}

export interface BulkUserOperation {
  userIds: string[]
  operation: 'activate' | 'deactivate' | 'delete' | 'verify'
  data?: any
}

/**
 * User Management Service
 * 
 * Handles all user-related API operations including
 * user CRUD, preferences, bulk operations, and statistics.
 */
export class UserService extends BaseApiService {
  constructor(apiClient: ApiClient) {
    super(apiClient, '/users')
  }

  /**
   * Get all users with pagination and filters
   * @param page - Page number
   * @param limit - Items per page
   * @param filters - Filter criteria
   * @returns Paginated users
   */
  async getUsers(
    page: number = 1,
    limit: number = 10,
    filters: UserFilters = {}
  ): Promise<PaginatedResponse<User>> {
    try {
      return await this.getAll<User>(page, limit, filters)
    } catch (error) {
      this.handleError(error, 'Get users')
    }
  }

  /**
   * Get user by ID
   * @param userId - User ID
   * @returns User data
   */
  async getUserById(userId: string): Promise<ApiResponse<User>> {
    try {
      this.validateRequired({ userId }, ['userId'])
      return await this.getById<User>(userId)
    } catch (error) {
      this.handleError(error, 'Get user by ID')
    }
  }

  /**
   * Create new user
   * @param userData - User creation data
   * @returns Created user
   */
  async createUser(userData: CreateUserData): Promise<ApiResponse<User>> {
    try {
      this.validateRequired(userData, [
        'email',
        'firstName',
        'lastName',
        'role'
      ])
      
      return await this.create<User, CreateUserData>(userData)
    } catch (error) {
      this.handleError(error, 'Create user')
    }
  }

  /**
   * Update user
   * @param userId - User ID
   * @param userData - User update data
   * @returns Updated user
   */
  async updateUser(
    userId: string,
    userData: UpdateUserData
  ): Promise<ApiResponse<User>> {
    try {
      this.validateRequired({ userId }, ['userId'])
      return await this.update<User, UpdateUserData>(userId, userData)
    } catch (error) {
      this.handleError(error, 'Update user')
    }
  }

  /**
   * Delete user
   * @param userId - User ID
   * @returns Success response
   */
  async deleteUser(userId: string): Promise<ApiResponse<null>> {
    try {
      this.validateRequired({ userId }, ['userId'])
      return await this.delete(userId)
    } catch (error) {
      this.handleError(error, 'Delete user')
    }
  }

  /**
   * Search users
   * @param query - Search query
   * @param filters - Additional filters
   * @returns Search results
   */
  async searchUsers(
    query: string,
    filters: UserFilters = {}
  ): Promise<PaginatedResponse<User>> {
    try {
      this.validateRequired({ query }, ['query'])
      return await this.search<User>(query, filters)
    } catch (error) {
      this.handleError(error, 'Search users')
    }
  }

  /**
   * Get user statistics
   * @param filters - Filter criteria
   * @returns User statistics
   */
  async getUserStats(filters: UserFilters = {}): Promise<ApiResponse<UserStats>> {
    try {
      return await this.getStats<UserStats>(filters)
    } catch (error) {
      this.handleError(error, 'Get user statistics')
    }
  }

  /**
   * Activate user
   * @param userId - User ID
   * @returns Success response
   */
  async activateUser(userId: string): Promise<ApiResponse<User>> {
    try {
      this.validateRequired({ userId }, ['userId'])
      
      return await this.apiClient.post<ApiResponse<User>>(
        `${this.baseEndpoint}/${userId}/activate`
      )
    } catch (error) {
      this.handleError(error, 'Activate user')
    }
  }

  /**
   * Deactivate user
   * @param userId - User ID
   * @returns Success response
   */
  async deactivateUser(userId: string): Promise<ApiResponse<User>> {
    try {
      this.validateRequired({ userId }, ['userId'])
      
      return await this.apiClient.post<ApiResponse<User>>(
        `${this.baseEndpoint}/${userId}/deactivate`
      )
    } catch (error) {
      this.handleError(error, 'Deactivate user')
    }
  }

  /**
   * Verify user email
   * @param userId - User ID
   * @returns Success response
   */
  async verifyUserEmail(userId: string): Promise<ApiResponse<User>> {
    try {
      this.validateRequired({ userId }, ['userId'])
      
      return await this.apiClient.post<ApiResponse<User>>(
        `${this.baseEndpoint}/${userId}/verify-email`
      )
    } catch (error) {
      this.handleError(error, 'Verify user email')
    }
  }

  /**
   * Reset user password
   * @param userId - User ID
   * @param newPassword - New password (optional, will generate if not provided)
   * @returns Success response with new password if generated
   */
  async resetUserPassword(
    userId: string,
    newPassword?: string
  ): Promise<ApiResponse<{ password?: string }>> {
    try {
      this.validateRequired({ userId }, ['userId'])
      
      return await this.apiClient.post<ApiResponse<{ password?: string }>>(
        `${this.baseEndpoint}/${userId}/reset-password`,
        { newPassword }
      )
    } catch (error) {
      this.handleError(error, 'Reset user password')
    }
  }

  /**
   * Get user preferences
   * @param userId - User ID
   * @returns User preferences
   */
  async getUserPreferences(userId: string): Promise<ApiResponse<UserPreferences>> {
    try {
      this.validateRequired({ userId }, ['userId'])
      
      return await this.apiClient.get<ApiResponse<UserPreferences>>(
        `${this.baseEndpoint}/${userId}/preferences`
      )
    } catch (error) {
      this.handleError(error, 'Get user preferences')
    }
  }

  /**
   * Update user preferences
   * @param userId - User ID
   * @param preferences - Preferences data
   * @returns Updated preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<ApiResponse<UserPreferences>> {
    try {
      this.validateRequired({ userId }, ['userId'])
      
      return await this.apiClient.patch<ApiResponse<UserPreferences>>(
        `${this.baseEndpoint}/${userId}/preferences`,
        preferences
      )
    } catch (error) {
      this.handleError(error, 'Update user preferences')
    }
  }

  /**
   * Upload user avatar
   * @param userId - User ID
   * @param file - Avatar image file
   * @returns Updated user with new avatar
   */
  async uploadUserAvatar(
    userId: string,
    file: File
  ): Promise<ApiResponse<User>> {
    try {
      this.validateRequired({ userId }, ['userId'])
      
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image')
      }
      
      return await this.upload<User>(file, { userId })
    } catch (error) {
      this.handleError(error, 'Upload user avatar')
    }
  }

  /**
   * Remove user avatar
   * @param userId - User ID
   * @returns Updated user without avatar
   */
  async removeUserAvatar(userId: string): Promise<ApiResponse<User>> {
    try {
      this.validateRequired({ userId }, ['userId'])
      
      return await this.apiClient.delete<ApiResponse<User>>(
        `${this.baseEndpoint}/${userId}/avatar`
      )
    } catch (error) {
      this.handleError(error, 'Remove user avatar')
    }
  }

  /**
   * Get user activity log
   * @param userId - User ID
   * @param page - Page number
   * @param limit - Items per page
   * @returns User activity log
   */
  async getUserActivity(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<any>> {
    try {
      this.validateRequired({ userId }, ['userId'])
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      })
      
      return await this.apiClient.get<PaginatedResponse<any>>(
        `${this.baseEndpoint}/${userId}/activity?${queryParams}`
      )
    } catch (error) {
      this.handleError(error, 'Get user activity')
    }
  }

  /**
   * Bulk user operations
   * @param operation - Bulk operation data
   * @returns Operation results
   */
  async bulkUserOperation(
    operation: BulkUserOperation
  ): Promise<ApiResponse<{ success: string[]; failed: string[] }>> {
    try {
      this.validateRequired(operation, ['userIds', 'operation'])
      
      if (!operation.userIds.length) {
        throw new Error('At least one user ID is required')
      }
      
      return await this.apiClient.post<ApiResponse<{ success: string[]; failed: string[] }>>(
        `${this.baseEndpoint}/bulk/${operation.operation}`,
        {
          userIds: operation.userIds,
          data: operation.data
        }
      )
    } catch (error) {
      this.handleError(error, 'Bulk user operation')
    }
  }

  /**
   * Export users
   * @param format - Export format
   * @param filters - Filter criteria
   * @returns Export file
   */
  async exportUsers(
    format: 'csv' | 'xlsx' | 'json' = 'csv',
    filters: UserFilters = {}
  ): Promise<Blob> {
    try {
      return await this.export(format, filters)
    } catch (error) {
      this.handleError(error, 'Export users')
    }
  }

  /**
   * Import users from file
   * @param file - Import file (CSV or Excel)
   * @param options - Import options
   * @returns Import results
   */
  async importUsers(
    file: File,
    options: {
      skipDuplicates?: boolean
      sendInvitations?: boolean
      defaultRole?: string
    } = {}
  ): Promise<ApiResponse<{ imported: number; skipped: number; errors: any[] }>> {
    try {
      const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('File must be CSV or Excel format')
      }
      
      return await this.upload<{ imported: number; skipped: number; errors: any[] }>(
        file,
        options
      )
    } catch (error) {
      this.handleError(error, 'Import users')
    }
  }

  /**
   * Send invitation to user
   * @param userId - User ID
   * @param message - Optional invitation message
   * @returns Success response
   */
  async sendInvitation(
    userId: string,
    message?: string
  ): Promise<ApiResponse<null>> {
    try {
      this.validateRequired({ userId }, ['userId'])
      
      return await this.apiClient.post<ApiResponse<null>>(
        `${this.baseEndpoint}/${userId}/invite`,
        { message }
      )
    } catch (error) {
      this.handleError(error, 'Send invitation')
    }
  }

  /**
   * Get user roles
   * @returns Available user roles
   */
  async getUserRoles(): Promise<ApiResponse<string[]>> {
    try {
      return await this.apiClient.get<ApiResponse<string[]>>(
        `${this.baseEndpoint}/roles`
      )
    } catch (error) {
      this.handleError(error, 'Get user roles')
    }
  }

  /**
   * Get user permissions
   * @param userId - User ID
   * @returns User permissions
   */
  async getUserPermissions(userId: string): Promise<ApiResponse<string[]>> {
    try {
      this.validateRequired({ userId }, ['userId'])
      
      return await this.apiClient.get<ApiResponse<string[]>>(
        `${this.baseEndpoint}/${userId}/permissions`
      )
    } catch (error) {
      this.handleError(error, 'Get user permissions')
    }
  }
}