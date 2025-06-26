import { ApiClient } from '@/api/endpoint/axios'
import { AuthService } from './AuthService'
import { UserService } from './UserService'
import { FileService } from './FileService'
import { BaseApiService, ServiceFactory } from './BaseApiService'

/**
 * API Services Configuration
 */
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 30000,
  retries: 3
}

/**
 * Create API client instance
 */
const apiClient = new ApiClient(API_CONFIG.baseURL)

/**
 * Service instances
 * 
 * Centralized service instances for consistent API communication.
 * All services extend BaseApiService for standardized functionality.
 */
export const authService = new AuthService(apiClient)
export const userService = new UserService(apiClient)
export const fileService = new FileService(apiClient)

/**
 * Service registry for dynamic service creation
 */
export const serviceRegistry = {
  auth: authService,
  user: userService,
  file: fileService
} as const

/**
 * Get service by name
 * @param serviceName - Name of the service
 * @returns Service instance
 */
export function getService<T extends keyof typeof serviceRegistry>(
  serviceName: T
): typeof serviceRegistry[T] {
  const service = serviceRegistry[serviceName]
  if (!service) {
    throw new Error(`Service '${serviceName}' not found`)
  }
  return service
}

/**
 * Create custom service instance
 * @param ServiceClass - Service class constructor
 * @param endpoint - API endpoint
 * @returns Service instance
 */
export function createCustomService<T extends BaseApiService>(
  ServiceClass: new (apiClient: ApiClient, endpoint: string) => T,
  endpoint: string
): T {
  return new ServiceClass(apiClient, endpoint)
}

/**
 * Service health check
 * @returns Health status of all services
 */
export async function checkServicesHealth(): Promise<{
  status: 'healthy' | 'unhealthy'
  services: Record<string, boolean>
}> {
  const results: Record<string, boolean> = {}
  
  try {
    // Test auth service
    try {
      await apiClient.get('/auth/health')
      results.auth = true
    } catch {
      results.auth = false
    }
    
    // Test user service
    try {
      await apiClient.get('/users/health')
      results.user = true
    } catch {
      results.user = false
    }
    
    // Test file service
    try {
      await apiClient.get('/files/health')
      results.file = true
    } catch {
      results.file = false
    }
    
    const allHealthy = Object.values(results).every(status => status)
    
    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      services: results
    }
  } catch (error) {
    console.error('Health check failed:', error)
    return {
      status: 'unhealthy',
      services: results
    }
  }
}

/**
 * Initialize services
 * @returns Promise that resolves when services are ready
 */
export async function initializeServices(): Promise<void> {
  try {
    console.log('Initializing API services...')
    
    // Check if API is reachable
    await apiClient.get('/health')
    
    console.log('API services initialized successfully')
  } catch (error) {
    console.error('Failed to initialize API services:', error)
    throw new Error('API services initialization failed')
  }
}

/**
 * Cleanup services
 */
export function cleanupServices(): void {
  // Clear any cached data or ongoing requests
  ServiceFactory.clearInstances()
  console.log('API services cleaned up')
}

// Re-export types and classes for external use
export type { ApiResponse, PaginatedResponse } from '@/api/types'
export { BaseApiService, ServiceFactory } from './BaseApiService'
export { AuthService } from './AuthService'
export { UserService } from './UserService'
export { FileService } from './FileService'

// Re-export specific types
export type {
  LoginCredentials,
  RegisterData,
  User,
  AuthTokens,
  LoginResponse
} from './AuthService'

export type {
  User as UserType,
  UserPreferences,
  CreateUserData,
  UpdateUserData,
  UserFilters,
  UserStats
} from './UserService'

export type {
  FileItem,
  FileMetadata,
  UploadOptions,
  FileFilters,
  FileStats,
  FolderItem
} from './FileService'

/**
 * Default export for convenience
 */
export default {
  auth: authService,
  user: userService,
  file: fileService,
  getService,
  createCustomService,
  checkServicesHealth,
  initializeServices,
  cleanupServices
}