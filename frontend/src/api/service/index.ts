// ============================================================================
// SERVICE LAYER - CENTRALIZED API SERVICE MANAGEMENT
// ============================================================================

import { AuthService } from './authService'
import { FileService } from './fileService'
import { UserService } from './userService'
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

// ============================================================================
// SERVICE FACTORY
// ============================================================================

/**
 * Creates an API client instance with proper configuration
 */
const createApiClient = (baseUrl: string): ApiClient => {
  return new ApiClient(baseUrl)
}

/**
 * Default service URLs with fallbacks
 */
const SERVICE_URLS = {
  auth: BaseAuth() || 'http://localhost:8080',
  file: BaseFile() || 'http://localhost:8081/api/file',
  provider: BaseProvider() || 'http://localhost:8082/api/provider',
  management: BaseManagement() || 'http://localhost:8083/api/management',
  master: BaseMaster() || 'http://localhost:8084/api/master',
  clinic: BaseClinic() || 'http://localhost:8085/api/clinic',
  purchase: BasePurchase() || 'http://localhost:8086/api/purchase',
  sales: BaseSales() || 'http://localhost:8087/api/sales',
  warehouse: BaseWarehouse() || 'http://localhost:8088/api/warehouse',
  finance: BaseFinance() || 'http://localhost:8089/api/finance'
} as const

// ============================================================================
// SERVICE INSTANCES
// ============================================================================

// Core services with proper typing
export const authService = new AuthService(createApiClient(SERVICE_URLS.auth))
export const userService = new UserService(createApiClient(SERVICE_URLS.auth))
export const fileService = new FileService(createApiClient(SERVICE_URLS.file))

// Domain-specific API clients
export const providerService = createApiClient(SERVICE_URLS.provider)
export const managementService = createApiClient(SERVICE_URLS.management)
export const masterService = createApiClient(SERVICE_URLS.master)
export const clinicService = createApiClient(SERVICE_URLS.clinic)
export const purchaseService = createApiClient(SERVICE_URLS.purchase)
export const salesService = createApiClient(SERVICE_URLS.sales)
export const warehouseService = createApiClient(SERVICE_URLS.warehouse)
export const financeService = createApiClient(SERVICE_URLS.finance)

// ============================================================================
// SERVICE REGISTRY
// ============================================================================

/**
 * Centralized service registry for easy access
 * Provides a single point of access to all API services
 */
export const serviceRegistry = {
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
} as const

/**
 * Default export for backward compatibility
 */
export default serviceRegistry

// ============================================================================
// RE-EXPORTS
// ============================================================================

// Export base service class for extending
export { ApiRequest } from '../request/ApiRequest'

// Export individual service classes
export { AuthService } from './authService'
export { UserService } from './userService'
export { FileService } from './fileService'

// Export types from centralized types file
export type {
  ApiResponse,
  PaginatedResponse,
  ErrorResponse,
  LoginCredentials,
  LoginResponse,
  RegisterData,
  User,
  UserFilters,
  UserStats,
  CreateUserData,
  UpdateUserData,
  AuthTokens
} from '../types'