import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'

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
    (error) => {
      const notificationStore = useNotificationStore()
      const authStore = useAuthStore()
      
      if (error.response) {
        const { status, data } = error.response
        
        switch (status) {
          case 401:
            // Unauthorized - redirect to login
            authStore.logout()
            notificationStore.addNotification({
              id: Date.now().toString(),
              type: 'error',
              title: 'Session Expired',
              message: 'Please login again',
              timestamp: new Date()
            })
            break
          case 403:
            notificationStore.addNotification({
              id: Date.now().toString(),
              type: 'error',
              title: 'Access Denied',
              message: 'You do not have permission to access this resource',
              timestamp: new Date()
            })
            break
          case 404:
            notificationStore.addNotification({
              id: Date.now().toString(),
              type: 'error',
              title: 'Not Found',
              message: 'The requested resource was not found',
              timestamp: new Date()
            })
            break
          case 422:
            notificationStore.addNotification({
              id: Date.now().toString(),
              type: 'error',
              title: 'Validation Error',
              message: data.message || 'Please check your input',
              timestamp: new Date()
            })
            break
          case 500:
            notificationStore.addNotification({
              id: Date.now().toString(),
              type: 'error',
              title: 'Server Error',
              message: 'Internal server error occurred',
              timestamp: new Date()
            })
            break
          default:
            notificationStore.addNotification({
              id: Date.now().toString(),
              type: 'error',
              title: 'Error',
              message: data.message || 'An error occurred',
              timestamp: new Date()
            })
        }
      } else if (error.request) {
        // Network error
        notificationStore.addNotification({
          id: Date.now().toString(),
          type: 'error',
          title: 'Network Error',
          message: 'Unable to connect to server',
          timestamp: new Date()
        })
      }
      
      return Promise.reject(error)
    }
  )

  return instance
}

// API Helper class
export class ApiClient {
  private instance: AxiosInstance

  constructor(baseURL: string) {
    this.instance = createApiInstance(baseURL)
  }

  // Standard GET request
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config)
    return response.data
  }

  // Standard POST request
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config)
    return response.data
  }

  // Standard PUT request
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config)
    return response.data
  }

  // Standard PATCH request
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config)
    return response.data
  }

  // Standard DELETE request
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config)
    return response.data
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
    const response = await this.instance.get(url, {
      params: {
        page,
        limit,
        ...params
      }
    })
    return response.data
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

  // Get raw axios instance for custom usage
  getInstance(): AxiosInstance {
    return this.instance
  }
}

// Create default instance
export const apiClient = new ApiClient('')

// Export default class
export default ApiClient