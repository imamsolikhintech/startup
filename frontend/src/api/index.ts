// Export all API configurations and services
export * from './endpoint/base'
export * from './endpoint/axios'
export * from './request/helpers'
export * from './service'
export * from './types'

// Export specific instances for easy access
export { apiClient } from './endpoint/axios'
export { requestCache } from './request/helpers'

// Export service instances
export {
  authService,
  fileService,
  providerService,
  managementService,
  masterService,
  clinicService,
  purchaseService,
  salesService,
  warehouseService,
  financeService
} from './service'

// Export commonly used types
export type {
  ApiResponse,
  PaginatedResponse,
  ErrorResponse,
  LoginRequest,
  LoginResponse,
  User,
  FileUploadResponse,
  Provider,
  Clinic,
  PurchaseOrder,
  SalesOrder,
  Product,
  InventoryItem,
  Warehouse,
  FinanceRecord,
  DashboardStats,
  Notification,
  SystemConfig
} from './types'