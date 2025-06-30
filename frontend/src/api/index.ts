// ============================================================================
// API LAYER - MAIN ENTRY POINT
// ============================================================================

// ============================================================================
// CORE EXPORTS
// ============================================================================

// Export endpoint configurations and utilities
export { 
  apiClient, 
  fileApiClient, 
  createApiInstance,
  createCancelToken,
  isCancel,
  cleanupPendingRequests
} from './endpoint/axios'

// Export request utilities and helpers
export * from './request/helpers'
export { 
  requestCache,
  createRequestConfig,
  createUploadConfig,
  createDownloadConfig,
  buildQueryParams,
  buildPaginationParams,
  handleApiResponse,
  handlePaginatedResponse,
  ApiError,
  createApiError,
  withRetry,
  debounce,
  throttle,
  createCacheKey,
  validateRequiredFields
} from './request/helpers'

// Export base service class
export { ApiRequest } from './request/ApiRequest'

// Export service instances
export {
  authService,
  userService,
  fileService,
  providerService,
  managementService,
  masterService,
  clinicService,
  purchaseService,
  salesService,
  warehouseService,
  financeService,
  serviceRegistry
} from './service'

// Export service classes for custom instantiation
export {
  AuthService,
  UserService,
  FileService
} from './service'

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Export all types
export * from './types'

// Export commonly used types explicitly for better IDE support
export type {
  ApiResponse,
  PaginatedResponse,
  ErrorResponse,
  BaseEntity,
  PaginationParams,
  BaseFilters,
  User,
  LoginCredentials,
  RegisterData,
  CreateUserData,
  UpdateUserData,
  UserPreferences,
  BulkUserOperation
} from './types'

// Export axios-related types
export type {
  ApiClient,
  ApiInstanceConfig,
  PendingRequest
} from './endpoint/axios'

// ============================================================================
// CONFIGURATION EXPORTS
// ============================================================================

export {
  DEFAULT_CONFIG,
  RETRYABLE_STATUS_CODES,
  ERROR_MESSAGES
} from './endpoint/axios'