import { ApiClient } from '../endpoint/axios'
import type { ApiResponse, PaginatedResponse, User, UserRole, Permission } from '../types'

export interface CreateUserRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
  roleId?: string
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  roleId?: string
  isActive?: boolean
}

export interface CreateRoleRequest {
  name: string
  description?: string
  permissions: string[]
}

export interface UpdateRoleRequest {
  name?: string
  description?: string
  permissions?: string[]
}

export class UserService {
  constructor(private apiClient: ApiClient) {}

  // User Management
  async getUsers(page: number = 1, limit: number = 10, search?: string): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    })
    return await this.apiClient.get<PaginatedResponse<User>>(`/api/v1/users?${params}`)
  }

  async getUserById(id: string): Promise<ApiResponse<User>> {
    return await this.apiClient.get<ApiResponse<User>>(`/api/v1/users/${id}`)
  }

  async createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
    return await this.apiClient.post<ApiResponse<User>>('/api/v1/users', userData)
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<ApiResponse<User>> {
    return await this.apiClient.put<ApiResponse<User>>(`/api/v1/users/${id}`, userData)
  }

  async deleteUser(id: string): Promise<ApiResponse<null>> {
    return await this.apiClient.delete<ApiResponse<null>>(`/api/v1/users/${id}`)
  }

  async toggleUserStatus(id: string): Promise<ApiResponse<User>> {
    return await this.apiClient.patch<ApiResponse<User>>(`/api/v1/users/${id}/toggle-status`)
  }

  // Role Management
  async getRoles(page: number = 1, limit: number = 10): Promise<PaginatedResponse<UserRole>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    })
    return await this.apiClient.get<PaginatedResponse<UserRole>>(`/api/v1/roles?${params}`)
  }

  async getAllRoles(): Promise<ApiResponse<UserRole[]>> {
    return await this.apiClient.get<ApiResponse<UserRole[]>>('/api/v1/roles/all')
  }

  async getRoleById(id: string): Promise<ApiResponse<UserRole>> {
    return await this.apiClient.get<ApiResponse<UserRole>>(`/api/v1/roles/${id}`)
  }

  async createRole(roleData: CreateRoleRequest): Promise<ApiResponse<UserRole>> {
    return await this.apiClient.post<ApiResponse<UserRole>>('/api/v1/roles', roleData)
  }

  async updateRole(id: string, roleData: UpdateRoleRequest): Promise<ApiResponse<UserRole>> {
    return await this.apiClient.put<ApiResponse<UserRole>>(`/api/v1/roles/${id}`, roleData)
  }

  async deleteRole(id: string): Promise<ApiResponse<null>> {
    return await this.apiClient.delete<ApiResponse<null>>(`/api/v1/roles/${id}`)
  }

  // Permission Management
  async getPermissions(): Promise<ApiResponse<Permission[]>> {
    return await this.apiClient.get<ApiResponse<Permission[]>>('/api/v1/permissions')
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<ApiResponse<User>> {
    return await this.apiClient.post<ApiResponse<User>>(`/api/v1/users/${userId}/assign-role`, { roleId })
  }

  async removeRoleFromUser(userId: string): Promise<ApiResponse<User>> {
    return await this.apiClient.delete<ApiResponse<User>>(`/api/v1/users/${userId}/remove-role`)
  }
}

// Export singleton instance will be created in index.ts
export default UserService