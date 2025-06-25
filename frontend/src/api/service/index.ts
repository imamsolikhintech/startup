import { ApiClient } from '../endpoint/axios'
import { AuthService } from './authService'
import { FileService } from './fileService'
import UserService from './userService'
import { ApiClient } from '../endpoint/axios'
import {
  BaseAuth,
  BaseFile,
  BaseProvider,
  BaseManagement,
  BaseMaster,
  BaseClinic,
  BasePurchase,
  BaseSales,
  BaseWarehouse,
  BaseFinance
} from '../endpoint/base'

// Create service instances
export const authService = new AuthService(new ApiClient(BaseAuth() || 'http://localhost:8080'))
export const userService = new UserService(new ApiClient(BaseAuth() || 'http://localhost:8080'))
export const fileService = new FileService(new ApiClient(BaseFile() || 'http://localhost:8081/api/file'))
export const providerService = new ApiClient(BaseProvider() || 'http://localhost:8082/api/provider')
export const managementService = new ApiClient(BaseManagement() || 'http://localhost:8083/api/management')
export const masterService = new ApiClient(BaseMaster() || 'http://localhost:8084/api/master')
export const clinicService = new ApiClient(BaseClinic() || 'http://localhost:8085/api/clinic')
export const purchaseService = new ApiClient(BasePurchase() || 'http://localhost:8086/api/purchase')
export const salesService = new ApiClient(BaseSales() || 'http://localhost:8087/api/sales')
export const warehouseService = new ApiClient(BaseWarehouse() || 'http://localhost:8088/api/warehouse')
export const financeService = new ApiClient(BaseFinance() || 'http://localhost:8089/api/finance')

// Export all services as default
export default {
  auth: authService,
  user: userService,
  file: fileService,
  provider: providerService,
  management: managementService,
  master: masterService,
  clinic: clinicService,
  purchase: purchaseService,
  sales: salesService,
  warehouse: warehouseService,
  finance: financeService
}

// Types for common API responses
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
  errors?: string[]
}

export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user: {
    id: string
    email: string
    name: string
    role: string
    avatar?: string
  }
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface FileUploadResponse {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  uploadedAt: string
}