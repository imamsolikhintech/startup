import type { AxiosRequestConfig } from 'axios'
import type { ApiResponse, PaginatedResponse } from '../types'

// Request configuration helpers
export const createRequestConfig = (
  options: {
    timeout?: number
    headers?: Record<string, string>
    params?: Record<string, any>
    withCredentials?: boolean
  } = {}
): AxiosRequestConfig => {
  return {
    timeout: options.timeout || 30000,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    params: options.params,
    withCredentials: options.withCredentials || false
  }
}

// File upload configuration
export const createUploadConfig = (
  onProgress?: (progress: number) => void,
  additionalHeaders?: Record<string, string>
): AxiosRequestConfig => {
  return {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...additionalHeaders
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(progress)
      }
    }
  }
}

// Download configuration
export const createDownloadConfig = (
  onProgress?: (progress: number) => void
): AxiosRequestConfig => {
  return {
    responseType: 'blob',
    onDownloadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(progress)
      }
    }
  }
}

// Query parameter builders
export const buildQueryParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, item.toString()))
      } else {
        searchParams.append(key, value.toString())
      }
    }
  })
  
  return searchParams.toString()
}

// Pagination helpers
export const buildPaginationParams = (
  page: number = 1,
  limit: number = 10,
  sortBy?: string,
  sortOrder: 'asc' | 'desc' = 'asc',
  filters?: Record<string, any>
) => {
  return {
    page,
    limit,
    ...(sortBy && { sortBy, sortOrder }),
    ...filters
  }
}

// Response handlers
export const handleApiResponse = <T>(
  response: ApiResponse<T>
): T => {
  if (!response.success) {
    throw new Error(response.message || 'API request failed')
  }
  return response.data
}

export const handlePaginatedResponse = <T>(
  response: PaginatedResponse<T>
): PaginatedResponse<T> => {
  return response
}

// Error handling
export class ApiError extends Error {
  public status: number
  public code?: string
  public details?: Record<string, any>
  public errors?: string[]

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: Record<string, any>,
    errors?: string[]
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
    this.errors = errors
  }
}

export const createApiError = (
  error: any
): ApiError => {
  if (error.response) {
    const { status, data } = error.response
    return new ApiError(
      data.message || 'API request failed',
      status,
      data.code,
      data.details,
      data.errors
    )
  } else if (error.request) {
    return new ApiError(
      'Network error - unable to connect to server',
      0
    )
  } else {
    return new ApiError(
      error.message || 'Unknown error occurred',
      0
    )
  }
}

// Retry mechanism
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      
      if (i === maxRetries) {
        throw lastError
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)))
    }
  }
  
  throw lastError!
}

// Request debouncing
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Request throttling
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Cache helpers
export class RequestCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  
  set(key: string, data: any, ttl: number = 300000): void { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }
  
  delete(key: string): void {
    this.cache.delete(key)
  }
  
  clear(): void {
    this.cache.clear()
  }
  
  has(key: string): boolean {
    const item = this.cache.get(key)
    
    if (!item) {
      return false
    }
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }
}

// Create cache instance
export const requestCache = new RequestCache()

// Cached request wrapper
export const withCache = async <T>(
  key: string,
  fn: () => Promise<T>,
  ttl?: number
): Promise<T> => {
  // Check cache first
  const cached = requestCache.get(key)
  if (cached) {
    return cached
  }
  
  // Execute request and cache result
  const result = await fn()
  requestCache.set(key, result, ttl)
  
  return result
}

// URL helpers
export const buildUrl = (baseUrl: string, path: string, params?: Record<string, any>): string => {
  const url = new URL(path, baseUrl)
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString())
      }
    })
  }
  
  return url.toString()
}

// File helpers
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || ''
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Validation helpers
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  return value !== null && value !== undefined
}

// Date helpers
export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD'): string => {
  const d = new Date(date)
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

export const isDateInRange = (
  date: string | Date,
  startDate: string | Date,
  endDate: string | Date
): boolean => {
  const d = new Date(date)
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  return d >= start && d <= end
}