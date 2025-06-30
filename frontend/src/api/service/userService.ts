import { ApiClient } from '../endpoint/axios'
import * as base from '../endpoint/base'
import { ApiRequest } from '../request/ApiRequest'
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  CreateUserData,
  UpdateUserData,
  UserFilters,
  UserStats,
  UserPreferences,
  LoginHistory,
  UserActivity
} from '../types'

/**
 * User Management Service
 *
 * Handles all user-related API operations including
 * user CRUD, preferences, bulk operations, and statistics.
 */
export class UserService extends ApiRequest {
  constructor() {
    super(new ApiClient(base.BaseAuth()), "api/v1/users")
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
      //@ts-ignore
      return await this.getAll<User>({ page, limit, ...filters })
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  /**
   * Get user by ID
   * @param userId - User ID
   * @returns User data
   */
  async getUserById(userId: string): Promise<ApiResponse<User>> {
    try {
      //@ts-ignore
      return await this.getById<User>(userId)
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  /**
   * Create new user
   * @param userData - User creation data
   * @returns Created user
   */
  async createUser(userData: CreateUserData): Promise<ApiResponse<User>> {
    try {
      //@ts-ignore
      return await this.create<User, CreateUserData>(userData)
    } catch (error) {
      this.handleError(error)
      throw error
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
      //@ts-ignore
      return await this.update<User, UpdateUserData>(userId, userData)
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  /**
   * Delete user
   * @param userId - User ID
   * @returns Success response
   */
  async deleteUser(userId: string): Promise<ApiResponse<null>> {
    try {
      //@ts-ignore
      return await this.delete(userId)
    } catch (error) {
      this.handleError(error)
      throw error
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
      //@ts-ignore
      return await this.search<User>(query, filters)
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  /**
   * Get user statistics
   * @param filters - Filter criteria
   * @returns User statistics
   */
  async getUserStats(filters: UserFilters = {}): Promise<ApiResponse<UserStats>> {
    try {
      //@ts-ignore
      return await this.getStats<UserStats>(filters)
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  /**
   * Perform bulk user operations
   * @param operation - Type of bulk operation
   * @param userIds - Array of user IDs
   * @param data - Additional data for operation
   * @returns API response
   */
  async bulkUserOperation(
    operation: 'activate' | 'deactivate' | 'delete' | 'verify',
    userIds: string[],
    data?: any
  ): Promise<ApiResponse<any>> {
    try {
      const bulkOperation = operation === 'delete' ? 'delete' : 'update'
      //@ts-ignore
      return await this.bulk<any>(bulkOperation, userIds.map(id => ({ id, operation, ...data })))
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  /**
   * Update user preferences
   * @param userId - User ID
   * @param preferences - User preferences data
   * @returns Updated user
   */
  async updateUserPreferences(
    userId: string,
    preferences: UserPreferences
  ): Promise<ApiResponse<User>> {
    try {
      //@ts-ignore
      return await this.patch<User>(userId, { preferences })
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  /**
   * Get user login history
   * @param userId - User ID
   * @param page - Page number
   * @param limit - Items per page
   * @returns Paginated login history
   */
  async getLoginHistory(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<LoginHistory>> {
    try {
      //@ts-ignore
      //@ts-ignore
      return await this.apiClient.get<PaginatedResponse<LoginHistory>>(
        `${this.baseEndpoint}/${userId}/login-history?page=${page}&limit=${limit}`
      )
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  /**
   * Get user activity log
   * @param userId - User ID
   * @param page - Page number
   * @param limit - Items per page
   * @returns Paginated activity log
   */
  async getUserActivityLog(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<UserActivity>> {
    try {
      //@ts-ignore
      //@ts-ignore
      return await this.apiClient.get<PaginatedResponse<UserActivity>>(
        `${this.baseEndpoint}/${userId}/activity-log?page=${page}&limit=${limit}`
      )
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }
}

// Export singleton instance
export const userService = new UserService()
export default userService