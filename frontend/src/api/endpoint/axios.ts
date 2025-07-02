// ============================================================================
// AXIOS CONFIGURATION - HTTP CLIENT SETUP AND INTERCEPTORS
// ============================================================================

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

/**
 * Interface for tracking pending requests with deduplication
 */
interface PendingRequest {
  promise: Promise<any>,
  timestamp: number,
  url: string,
  method: string,
}

/**
 * Configuration options for API instance creation
 */
interface ApiInstanceConfig {
  baseURL: string,
  timeout?: number,
  retryAttempts?: number,
  retryDelay?: number,
  enableRequestDeduplication?: boolean,
}

/**
 * Extended axios config with metadata
 */
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  __isRetryRequest?: boolean,
  _retry?: boolean,
  _retryCount?: number,
  metadata?: {
    startTime: number,
    requestId: string,
  },
}

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

/**
 * Default axios configuration
 */
const DEFAULT_CONFIG: AxiosRequestConfig = {
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: false,
} as const

/**
 * HTTP status codes that should trigger automatic retry
 */
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504] as const

/**
 * Error messages for different HTTP status codes
 */
const ERROR_MESSAGES = {
  401: 'Please login again',
  403: 'You do not have permission to access this resource',
  404: 'The requested resource was not found',
  422: 'Please check your input',
  500: 'Internal server error occurred',
  NETWORK: 'Unable to connect to server',
  DEFAULT: 'An error occurred',
} as const

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate unique request ID for tracking
 */
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Create request key for deduplication
 */
const createRequestKey = (config: AxiosRequestConfig): string => {
  const { method = 'GET', url = '', data } = config
  const dataHash = data ? JSON.stringify(data) : ''
  return `${method.toUpperCase()}:${url}:${dataHash}`
}

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// ============================================================================
// API INSTANCE FACTORY
// ============================================================================

/**
 * Creates a configured axios instance with interceptors
 * Enhanced version with better error handling and retry logic
 */
export const createApiInstance = (baseURL: string, options: Partial<ApiInstanceConfig> = {}): AxiosInstance => {
  const {
    timeout = DEFAULT_CONFIG.timeout,
    retryAttempts = 3,
    retryDelay = 1000,
    enableRequestDeduplication = true,
  } = options

  const instance = axios.create({
    ...DEFAULT_CONFIG,
    baseURL,
    timeout,
  })

  // ============================================================================
  // REQUEST INTERCEPTOR
  // ============================================================================

  instance.interceptors.request.use(
    //@ts-ignore-line
    (config: ExtendedAxiosRequestConfig) => {
      try {
        const authStore = useAuthStore()
        const token = authStore.token

        // Add authentication token
        if (token) {
          config.headers = config.headers || {}
          config.headers.Authorization = `Bearer ${token}`
        }

        // Add request metadata for debugging and tracking
        config.metadata = {
          startTime: Date.now(),
          requestId: generateRequestId(),
        }

        // Log request in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
            requestId: config.metadata.requestId,
            data: config.data,
          })
        }

        return config
      } catch (error) {
        console.error('[API] Error in request interceptor:', error)
        return Promise.reject(error)
      }
    },
    (error) => {
      console.error('[API] Request interceptor error:', error)
      return Promise.reject(error)
    },
  )

  // ============================================================================
  // RESPONSE INTERCEPTOR
  // ============================================================================

  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      // Log response time in development
      if (process.env.NODE_ENV === 'development' && (response.config as ExtendedAxiosRequestConfig).metadata?.startTime) {
        const duration = Date.now() - ((response.config as ExtendedAxiosRequestConfig).metadata?.startTime || 0)
        console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`, {
          status: response.status, requestId: (response.config as ExtendedAxiosRequestConfig).metadata?.requestId,

        })
      }

      return response
    },
    async (error: AxiosError) => {
      const notificationStore = useNotificationStore()
      const authStore = useAuthStore()
      const originalRequest = error.config as ExtendedAxiosRequestConfig

      if (error.response) {
        const { status, data } = error.response

        // ============================================================================
        // TOKEN REFRESH LOGIC
        // ============================================================================
        if (status === 401 && originalRequest && !originalRequest.__isRetryRequest) {
          try {
            // Try to refresh the token
            const newToken = await authStore.refreshToken()

            // Retry the original request with new token
            originalRequest.headers = originalRequest.headers || {}
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            originalRequest.__isRetryRequest = true

            return instance(originalRequest)
          } catch (refreshError) {
            // If refresh token fails, logout and redirect to login
            authStore.logout()
            notificationStore.showError(ERROR_MESSAGES[401], 'Session Expired')
            return Promise.reject(error)
          }
        }

        // ============================================================================
        // RETRY LOGIC FOR RETRYABLE ERRORS
        // ============================================================================
        if (
          originalRequest &&
          !originalRequest._retry &&
          RETRYABLE_STATUS_CODES.includes(status as any)
        ) {
          originalRequest._retry = true
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1

          if (originalRequest._retryCount <= retryAttempts) {
            const delay = retryDelay * Math.pow(2, originalRequest._retryCount - 1)
            await sleep(delay)
            return instance(originalRequest)
          }
        }

        // ============================================================================
        // ERROR HANDLING BY STATUS CODE
        // ============================================================================
        switch (status) {
          case 401:
            // Only handle 401 here if token refresh failed or wasn't attempted
            if (!originalRequest || originalRequest.__isRetryRequest) {
              authStore.logout()
              notificationStore.showError(ERROR_MESSAGES[401], 'Session Expired')
            }
            break
          case 403:
            notificationStore.showError(ERROR_MESSAGES[403], 'Access Denied')
            break
          case 404:
            notificationStore.showError(ERROR_MESSAGES[404], 'Not Found')
            break
          case 422:
            const validationMessage = (data as any)?.message || ERROR_MESSAGES[422]
            notificationStore.showError(validationMessage, 'Validation Error')
            break
          case 500:
            notificationStore.showError(ERROR_MESSAGES[500], 'Server Error')
            break
          default:
            const defaultMessage = (data as any)?.message || ERROR_MESSAGES.DEFAULT
            notificationStore.showError(defaultMessage, 'Error')
        }
      } else if (error.request) {
        // Network error
        notificationStore.showError(ERROR_MESSAGES.NETWORK, 'Network Error')
      } else {
        // Something else happened
        notificationStore.showError(error.message || ERROR_MESSAGES.DEFAULT, 'Error')
      }

      return Promise.reject(error)
    },
  )

  return instance
}

// ============================================================================
// DEFAULT API CLIENT INSTANCES
// ============================================================================

/**
 * Default API client instance
 */
export const defaultApiClient = createApiInstance(
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  {
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    enableRequestDeduplication: true,
  },
)

/**
 * File upload API client with extended timeout
 */
export const fileApiClient = createApiInstance(
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  {
    timeout: 120000, // 2 minutes for file uploads
    retryAttempts: 1,
    retryDelay: 2000,
    enableRequestDeduplication: false,
  },
)

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates a cancel token for request cancellation
 * @returns Cancel token source
 */
export const createCancelToken = () => {
  return axios.CancelToken.source()
}

/**
 * Checks if an error is a cancel error
 * @param error - Error to check
 * @returns True if error is a cancel error
 */
export const isCancel = (error: any): boolean => {
  return axios.isCancel(error)
}

/**
 * Creates a request interceptor for adding custom headers
 * @param headers - Headers to add
 * @returns Interceptor function
 */
export const createHeaderInterceptor = (headers: Record<string, string>) => {
  return (config: AxiosRequestConfig) => {
    config.headers = {
      ...config.headers,
      ...headers,
    }
    return config
  }
}

/**
 * Cleans up all pending requests (useful for component unmounting)
 */
export const cleanupPendingRequests = (): void => {
  // This would be implemented if we had a global pending requests tracker
  console.log('[API] Cleaning up pending requests')
}

// ============================================================================
// API HELPER CLASS
// ============================================================================

// API Helper class
export class ApiClient extends axios.Axios {
  private pendingRequests: Map<string, PendingRequest> = new Map()
  private readonly REQUEST_TIMEOUT = 30000 // 30 seconds

  constructor (baseURL: string, options: Partial<ApiInstanceConfig> = {}) {
    const config = {
      ...DEFAULT_CONFIG,
      baseURL,
      timeout: options.timeout || 30000,
    }
    super(config)
    this.setupInterceptors()
  }

  private setupInterceptors (): void {
    // Request interceptor
    this.interceptors.request.use(
      //@ts-ignore-line
      (config: ExtendedAxiosRequestConfig) => {
        try {
          const authStore = useAuthStore()
          const token = authStore.token

          if (token) {
            config.headers = config.headers || {}
            config.headers.Authorization = `Bearer ${token}`
          }

          config.metadata = {
            startTime: Date.now(),
            requestId: generateRequestId(),
          }

          if (process.env.NODE_ENV === 'development') {
            console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
              requestId: config.metadata.requestId,
              data: config.data,
            })
          }

          return config
        } catch (error) {
          console.error('[API] Error in request interceptor:', error)
          return Promise.reject(error)
        }
      },
      (error) => {
        console.error('[API] Request interceptor error:', error)
        return Promise.reject(error)
      },
    )

    // Response interceptor
    this.interceptors.response.use(
      (response: AxiosResponse) => {
        if (process.env.NODE_ENV === 'development' && (response.config as ExtendedAxiosRequestConfig).metadata?.startTime) {
          const duration = Date.now() - ((response.config as ExtendedAxiosRequestConfig).metadata?.startTime || 0)
          console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`, {
            status: response.status,
            requestId: (response.config as ExtendedAxiosRequestConfig).metadata?.requestId,
          })
        }

        return response
      },
      async (error: AxiosError) => {
        const notificationStore = useNotificationStore()
        const authStore = useAuthStore()
        const originalRequest = error.config as ExtendedAxiosRequestConfig

        if (error.response) {
          const { status, data } = error.response

          if (status === 401 && originalRequest && !originalRequest.__isRetryRequest) {
            try {
              const newToken = await authStore.refreshToken()

              originalRequest.headers = originalRequest.headers || {}
              originalRequest.headers.Authorization = `Bearer ${newToken}`
              originalRequest.__isRetryRequest = true

              return this.request(originalRequest)
            } catch (refreshError) {
              authStore.logout()
              notificationStore.showError(ERROR_MESSAGES[401], 'Session Expired')
              return Promise.reject(error)
            }
          }

          if (
            originalRequest &&
            !originalRequest._retry &&
            RETRYABLE_STATUS_CODES.includes(status as any)
          ) {
            originalRequest._retry = true
            originalRequest._retryCount = (originalRequest._retryCount || 0) + 1

            if (originalRequest._retryCount <= 3) {
              const delay = 1000 * Math.pow(2, originalRequest._retryCount - 1)
              await sleep(delay)
              return this.request(originalRequest)
            }
          }

          switch (status) {
            case 401:
              if (!originalRequest || originalRequest.__isRetryRequest) {
                authStore.logout()
                notificationStore.showError(ERROR_MESSAGES[401], 'Session Expired')
              }
              break
            case 403:
              notificationStore.showError(ERROR_MESSAGES[403], 'Access Denied')
              break
            case 404:
              notificationStore.showError(ERROR_MESSAGES[404], 'Not Found')
              break
            case 422:
              const validationMessage = (data as any)?.message || ERROR_MESSAGES[422]
              notificationStore.showError(validationMessage, 'Validation Error')
              break
            case 500:
              notificationStore.showError(ERROR_MESSAGES[500], 'Server Error')
              break
            default:
              const defaultMessage = (data as any)?.message || ERROR_MESSAGES.DEFAULT
              notificationStore.showError(defaultMessage, 'Error')
          }
        } else if (error.request) {
          notificationStore.showError(ERROR_MESSAGES.NETWORK, 'Network Error')
        } else {
          notificationStore.showError(error.message || ERROR_MESSAGES.DEFAULT, 'Error')
        }

        return Promise.reject(error)
      },
    )
  }

  // Generate unique key for request deduplication
  private generateRequestKey (method: string, url: string, data?: any): string {
    const dataHash = data ? JSON.stringify(data) : ''
    return `${method.toUpperCase()}:${url}:${dataHash}`
  }

  // Clean up expired pending requests
  private cleanupExpiredRequests (): void {
    const now = Date.now()
    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > this.REQUEST_TIMEOUT) {
        this.pendingRequests.delete(key)
      }
    }
  }

  // Execute request with deduplication
  private async executeWithDeduplication<T>(
    requestKey: string,
    requestFn: () => Promise<T>,
  ): Promise<T> {
    // Clean up expired requests first
    this.cleanupExpiredRequests()

    // Check for existing pending request
    const pendingRequest = this.pendingRequests.get(requestKey)
    if (pendingRequest) {
      return pendingRequest.promise
    }

    // Create new request
    const promise = requestFn()
    this.pendingRequests.set(requestKey, {
      promise,
      timestamp: Date.now(),
      url: requestKey.split(':')[1],
      method: requestKey.split(':')[0],
    })

    try {
      const result = await promise
      this.pendingRequests.delete(requestKey)
      return result
    } catch (error) {
      this.pendingRequests.delete(requestKey)
      throw error
    }
  }

  // Make request with method
  // private async request<T>(
  //   method: string,
  //   url: string,
  //   data?: any,
  //   headers?: Record<string, string>
  // ): Promise<T> {
  //   const config: AxiosRequestConfig = {
  //     method,
  //     url,
  //     headers: {
  //       ...this.defaults.headers.common,
  //       ...headers
  //     }
  //   }

  //   if (data && ['POST', 'PUT', 'PATCH'].includes(method as any)) {
  //     config.data = data
  //   }

  //   const response = await super.request<T>(config)
  //   return response.data
  // }

  // Paginated GET request
  async getPaginated<T = any>(
    url: string,
    page: number = 1,
    limit: number = 10,
    params?: Record<string, any>,
  ): Promise<{
    data: T[],
    pagination: {
      page: number,
      limit: number,
      total: number,
      totalPages: number,
    },
  }> {
    const requestParams = { page, limit, ...params }
    const requestKey = this.generateRequestKey('GET', url, requestParams)
    return this.executeWithDeduplication(requestKey, async () => {
      const response = await super.get(url, {
        params: requestParams,
      })
      return response.data
    })
  }

  // Batch requests
  async batch<T = any>(requests: Array<() => Promise<any>>): Promise<T[]> {
    const results = await Promise.allSettled(requests.map(request => request()))
    return results.map(result => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        throw result.reason
      }
    })
  }

  // Clear all pending requests (useful for cleanup)
  clearPendingRequests (): void {
    this.pendingRequests.clear()
  }

  // Get pending requests count (for debugging)
  getPendingRequestsCount (): number {
    this.cleanupExpiredRequests()
    return this.pendingRequests.size
  }

  // HTTP Methods with deduplication
  // async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  //   const requestKey = this.generateRequestKey('GET', url)
  //   return this.executeWithDeduplication(requestKey, () => super.get<T>(url, config))
  // }

  // async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  //   const requestKey = this.generateRequestKey('POST', url, data)
  //   return this.executeWithDeduplication(requestKey, () => super.post<T>(url, data, config))
  // }

  // async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  //   const requestKey = this.generateRequestKey('PUT', url, data)
  //   return this.executeWithDeduplication(requestKey, () => super.put<T>(url, data, config))
  // }

  // async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  //   const requestKey = this.generateRequestKey('PATCH', url, data)
  //   return this.executeWithDeduplication(requestKey, () => super.patch<T>(url, data, config))
  // }

  // async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  //   const requestKey = this.generateRequestKey('DELETE', url)
  //   return this.executeWithDeduplication(requestKey, () => super.delete<T>(url, config))
  // }

  // File upload methods
  async upload<T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<AxiosResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    return super.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
  }

  async uploadMultiple<T = any>(
    url: string,
    files: File[],
    onProgress?: (progress: number) => void,
  ): Promise<AxiosResponse<T>> {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file)
    })

    return super.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
  }

  // Get raw axios instance for custom usage
  getInstance (): AxiosInstance {
    return this as any
  }
}

// ============================================================================
// DEFAULT INSTANCES AND EXPORTS
// ============================================================================

// Create default instance
export const apiClient = new ApiClient(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api')

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type { ApiInstanceConfig, ExtendedAxiosRequestConfig, PendingRequest }

// ============================================================================
// CONSTANTS EXPORT
// ============================================================================

export { DEFAULT_CONFIG, ERROR_MESSAGES, RETRYABLE_STATUS_CODES }

// Export default class
export default ApiClient
