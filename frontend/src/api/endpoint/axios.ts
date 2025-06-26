import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'

// Request deduplication interface
interface PendingRequest {
  promise: Promise<any>
  timestamp: number
}

// Base configuration
const baseConfig: AxiosRequestConfig = {
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}

// Create axios instances for different services
export const createApiInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    ...baseConfig,
    baseURL
  })

  // Request interceptor - Add JWT token
  instance.interceptors.request.use(
    (config) => {
      const authStore = useAuthStore()
      const token = authStore.token
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor - Handle errors
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response
    },
    async (error) => {
      const notificationStore = useNotificationStore()
      const authStore = useAuthStore()
      
      if (error.response) {
        const { status, data } = error.response
        
        // Handle token expiration
        if (status === 401 && error.config && !error.config.__isRetryRequest) {
          try {
            // Try to refresh the token
            const newToken = await authStore.refreshToken()
            
            // Retry the original request with new token
            error.config.headers.Authorization = `Bearer ${newToken}`
            error.config.__isRetryRequest = true
            return axios(error.config)
          } catch (refreshError) {
            // If refresh token fails, logout and redirect to login
            authStore.logout()
            notificationStore.showError('Please login again', 'Session Expired')
          }
        }
        
        switch (status) {
          case 401:
            // Only handle 401 here if token refresh failed or wasn't attempted
            if (!error.config || error.config.__isRetryRequest) {
              authStore.logout()
              notificationStore.showError('Please login again', 'Session Expired')
            }
            break
          case 403:
            notificationStore.showError('You do not have permission to access this resource', 'Access Denied')
            break
          case 404:
            notificationStore.showError('The requested resource was not found', 'Not Found')
            break
          case 422:
            notificationStore.showError(data.message || 'Please check your input', 'Validation Error')
            break
          case 500:
            notificationStore.showError('Internal server error occurred', 'Server Error')
            break
          default:
            notificationStore.showError(data.message || 'An error occurred', 'Error')
        }
      } else if (error.request) {
        // Network error
        notificationStore.showError('Unable to connect to server', 'Network Error')
      }
      
      return Promise.reject(error)
    }
  )

  return instance
}

// API Helper class
export class ApiClient {
  private instance: AxiosInstance
  private pendingRequests: Map<string, PendingRequest> = new Map()
  private readonly REQUEST_TIMEOUT = 30000 // 30 seconds

  constructor(baseURL: string) {
    this.instance = createApiInstance(baseURL)
  }

  // Generate unique key for request deduplication
  private generateRequestKey(method: string, url: string, data?: any): string {
    const dataHash = data ? JSON.stringify(data) : ''
    return `${method.toUpperCase()}:${url}:${dataHash}`
  }

  // Clean up expired pending requests
  private cleanupExpiredRequests(): void {
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
    requestFn: () => Promise<T>
  ): Promise<T> {
    // Clean up expired requests first
    this.cleanupExpiredRequests()

    // Check if same request is already pending
    const existingRequest = this.pendingRequests.get(requestKey)
    if (existingRequest) {
      console.log(`Deduplicating request: ${requestKey}`)
      return existingRequest.promise as Promise<T>
    }

    // Create new request
    const promise = requestFn().finally(() => {
      // Remove from pending requests when completed
      this.pendingRequests.delete(requestKey)
    })

    // Store pending request
    this.pendingRequests.set(requestKey, {
      promise,
      timestamp: Date.now()
    })

    return promise
  }

  // Standard GET request
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const requestKey = this.generateRequestKey('GET', url)
    return this.executeWithDeduplication(requestKey, async () => {
      const response = await this.instance.get<T>(url, config)
      return response.data
    })
  }

  // Standard POST request
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const requestKey = this.generateRequestKey('POST', url, data)
    return this.executeWithDeduplication(requestKey, async () => {
      const response = await this.instance.post<T>(url, data, config)
      return response.data
    })
  }

  // Standard PUT request
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const requestKey = this.generateRequestKey('PUT', url, data)
    return this.executeWithDeduplication(requestKey, async () => {
      const response = await this.instance.put<T>(url, data, config)
      return response.data
    })
  }

  // Standard PATCH request
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const requestKey = this.generateRequestKey('PATCH', url, data)
    return this.executeWithDeduplication(requestKey, async () => {
      const response = await this.instance.patch<T>(url, data, config)
      return response.data
    })
  }

  // Standard DELETE request
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const requestKey = this.generateRequestKey('DELETE', url)
    return this.executeWithDeduplication(requestKey, async () => {
      const response = await this.instance.delete<T>(url, config)
      return response.data
    })
  }

  // File upload with progress
  async upload<T = any>(
    url: string,
    file: File,
    onUploadProgress?: (progressEvent: any) => void,
    additionalData?: Record<string, any>
  ): Promise<T> {
    const formData = new FormData()
    formData.append('file', file)
    
    // Add additional data if provided
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key])
      })
    }

    const response = await this.instance.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    })
    return response.data
  }

  // Multiple file upload
  async uploadMultiple<T = any>(
    url: string,
    files: File[],
    onUploadProgress?: (progressEvent: any) => void,
    additionalData?: Record<string, any>
  ): Promise<T> {
    const formData = new FormData()
    
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file)
    })
    
    // Add additional data if provided
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key])
      })
    }

    const response = await this.instance.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    })
    return response.data
  }

  // Download file
  async download(
    url: string,
    filename?: string,
    onDownloadProgress?: (progressEvent: any) => void
  ): Promise<void> {
    const response = await this.instance.get(url, {
      responseType: 'blob',
      onDownloadProgress
    })

    // Create download link
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }

  // Request with custom headers
  async requestWithHeaders<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<T> {
    const config: AxiosRequestConfig = {
      method,
      url,
      headers: {
        ...this.instance.defaults.headers.common,
        ...headers
      }
    }

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      config.data = data
    }

    const response = await this.instance.request<T>(config)
    return response.data
  }

  // Paginated GET request
  async getPaginated<T = any>(
    url: string,
    page: number = 1,
    limit: number = 10,
    params?: Record<string, any>
  ): Promise<{
    data: T[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }> {
    const requestParams = { page, limit, ...params }
    const requestKey = this.generateRequestKey('GET', url, requestParams)
    return this.executeWithDeduplication(requestKey, async () => {
      const response = await this.instance.get(url, {
        params: requestParams
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
  clearPendingRequests(): void {
    this.pendingRequests.clear()
  }

  // Get pending requests count (for debugging)
  getPendingRequestsCount(): number {
    this.cleanupExpiredRequests()
    return this.pendingRequests.size
  }

  // Get raw axios instance for custom usage
  getInstance(): AxiosInstance {
    return this.instance
  }
}

// Create default instance
export const apiClient = new ApiClient('')

// Export default class
export default ApiClient