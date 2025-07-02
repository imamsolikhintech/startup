// ============================================================================
// API LAYER - MAIN ENTRY POINT
// ============================================================================

// ============================================================================
// CORE EXPORTS
// ============================================================================

// Export endpoint configurations and utilities
export {
  apiClient,
  cleanupPendingRequests,
  createApiInstance,
  createCancelToken,
  fileApiClient,
  isCancel } from './endpoint/axios'

// Export request utilities and helpers
export * from './request/helpers'
export {
  ApiError,
  buildPaginationParams,
  buildQueryParams,
  createApiError,
  createCacheKey,
  createDownloadConfig,
  createRequestConfig,
  createUploadConfig,
  debounce,
  handleApiResponse,
  handlePaginatedResponse,
  requestCache,
  throttle,
  validateRequiredFields,
  withRetry } from './request/helpers'

// Export base service class
export { ApiRequest } from './request/ApiRequest'

// Export service instances
export {
  authService,
  clinicService,
  fileService,
  financeService,
  managementService,
  masterService,
  providerService,
  purchaseService,
  salesService,
  serviceRegistry,
  userService,
  warehouseService } from './service'

// Export service classes for custom instantiation
export {
  AuthService,
  FileService,
  UserService } from './service'

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Export all types
export * from './types'

// Export commonly used types explicitly for better IDE support
export type {
  ApiResponse,
  BaseEntity,
  BaseFilters,
  BulkUserOperation,
  CreateUserData,
  ErrorResponse,
  LoginCredentials,
  PaginatedResponse,
  PaginationParams,
  RegisterData,
  UpdateUserData,
  User,
  UserPreferences } from './types'

// Export axios-related types
export type {
  ApiClient,
  ApiInstanceConfig,
  PendingRequest,
} from './endpoint/axios'

// ============================================================================
// CONFIGURATION EXPORTS
// ============================================================================

export {
  DEFAULT_CONFIG,
  ERROR_MESSAGES,
  RETRYABLE_STATUS_CODES } from './endpoint/axios'
