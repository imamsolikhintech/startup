// ============================================================================
// REQUEST HELPERS - UTILITY FUNCTIONS FOR API REQUESTS
// ============================================================================

import type { AxiosRequestConfig } from 'axios'
import type { ApiResponse, PaginatedResponse } from '../types'

// ============================================================================
// REQUEST CONFIGURATION BUILDERS
// ============================================================================

/**
 * Default request configuration
 */
const DEFAULT_CONFIG: Partial<AxiosRequestConfig> = {
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false
} as const

/**
 * Creates a standardized request configuration
 * @param options - Configuration options
 * @returns Axios request configuration
 */
export const createRequestConfig = (
  options: {
    timeout?: number
    headers?: Record<string, string>
    params?: Record<string, any>
    withCredentials?: boolean
  } = {}
): AxiosRequestConfig => {
  return {
    ...DEFAULT_CONFIG,
    ...options,
    headers: {
      ...DEFAULT_CONFIG.headers,
      ...options.headers
    }
  }
}

/**
 * Creates configuration for file upload requests
 * @param onProgress - Progress callback function
 * @param additionalHeaders - Additional headers to include
 * @returns Upload-specific axios configuration
 */
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

/**
 * Creates configuration for file download requests
 * @param onProgress - Progress callback function
 * @returns Download-specific axios configuration
 */
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

// ============================================================================
// QUERY PARAMETER UTILITIES
// ============================================================================

/**
 * Builds URL query parameters from an object
 * Handles arrays, null/undefined values, and empty strings
 * @param params - Parameters object
 * @returns URL-encoded query string
 */
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

/**
 * Builds standardized pagination parameters
 * @param page - Page number (1-based)
 * @param limit - Items per page
 * @param sortBy - Field to sort by
 * @param sortOrder - Sort direction
 * @param filters - Additional filter parameters
 * @returns Combined pagination and filter parameters
 */
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

// ============================================================================
// RESPONSE HANDLERS
// ============================================================================

/**
 * Handles standard API responses
 * @param response - API response object
 * @returns Response data if successful
 * @throws ApiError if response indicates failure
 */
export const handleApiResponse = <T>(
  response: ApiResponse<T>
): T => {
  if (response.success) {
    return response.data
  }
  throw new ApiError(response.message || 'API request failed', 400)
}

/**
 * Handles paginated API responses
 * @param response - Paginated response object
 * @returns Full paginated response if successful
 * @throws ApiError if response indicates failure
 */
export const handlePaginatedResponse = <T>(
  response: PaginatedResponse<T>
): PaginatedResponse<T> => {
  if ('success' in response && response.success) {
    return response
  }
  throw new ApiError('Paginated API request failed', 400)
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Custom API Error class with enhanced error information
 */
export class ApiError extends Error {
  public readonly status: number
  public readonly code?: string
  public readonly details?: any
  public readonly timestamp: Date

  constructor(
    message: string,
    status: number = 500,
    code?: string,
    details?: any
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
    this.timestamp = new Date()

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError)
    }
  }

  /**
   * Returns a formatted error message for logging
   */
  toLogString(): string {
    return `[${this.timestamp.toISOString()}] ApiError ${this.status}: ${this.message}${this.code ? ` (${this.code})` : ''}`
  }
}

/**
 * Creates a standardized ApiError from various error types
 * @param error - Error object from axios or other sources
 * @param defaultMessage - Fallback error message
 * @returns Standardized ApiError instance
 */
export const createApiError = (
  error: any,
  defaultMessage: string = 'An error occurred'
): ApiError => {
  // Handle axios response errors
  if (error.response) {
    return new ApiError(
      error.response.data?.message || defaultMessage,
      error.response.status,
      error.response.data?.code,
      error.response.data
    )
  }

  // Handle network errors
  if (error.request) {
    return new ApiError('Network error - no response received', 0, 'NETWORK_ERROR')
  }

  // Handle other errors
  return new ApiError(error.message || defaultMessage, 500, 'UNKNOWN_ERROR')
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Retry mechanism with exponential backoff
 * @param fn - Function to retry
 * @param maxRetries - Maximum number of retry attempts
 * @param delay - Initial delay in milliseconds
 * @param shouldRetry - Optional function to determine if error should trigger retry
 * @returns Promise that resolves with function result or rejects with last error
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  shouldRetry?: (error: any) => boolean
): Promise<T> => {
  let lastError: Error

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // Check if we should retry this error
      if (shouldRetry && !shouldRetry(error)) {
        throw lastError
      }

      if (i === maxRetries) {
        throw lastError
      }

      // Exponential backoff with jitter
      const jitter = Math.random() * 0.1 * delay
      const backoffDelay = delay * Math.pow(2, i) + jitter
      await new Promise(resolve => setTimeout(resolve, backoffDelay))
    }
  }

  throw lastError!
}

/**
 * Debounce function for search/filter operations
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
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

/**
 * Throttle function for frequent operations
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
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

/**
 * Creates a cache key from request parameters
 * @param endpoint - API endpoint
 * @param params - Request parameters
 * @returns Cache key string
 */
export const createCacheKey = (
  endpoint: string,
  params?: Record<string, any>
): string => {
  const paramString = params ? JSON.stringify(params, Object.keys(params).sort()) : ''
  return `${endpoint}:${paramString}`
}

/**
 * Validates required fields in an object
 * @param data - Object to validate
 * @param requiredFields - Array of required field names
 * @throws ApiError if validation fails
 */
export const validateRequiredFields = (
  data: Record<string, any>,
  requiredFields: string[]
): void => {
  const missingFields = requiredFields.filter(field =>
    data[field] === undefined || data[field] === null || data[field] === ''
  )

  if (missingFields.length > 0) {
    throw new ApiError(
      `Missing required fields: ${missingFields.join(', ')}`,
      400,
      'VALIDATION_ERROR',
      { missingFields }
    )
  }
}

// ============================================================================
// REQUEST CACHING
// ============================================================================

/**
 * Interface for cache items
 */
interface CacheItem<T = any> {
  data: T
  timestamp: number
  ttl: number
  accessCount: number
  lastAccessed: number
}

/**
 * Request cache with TTL and LRU-like features
 */
export class RequestCache {
  private cache = new Map<string, CacheItem>()
  private readonly maxSize: number
  private readonly defaultTtl: number

  constructor(maxSize: number = 100, defaultTtl: number = 300000) { // 5 minutes default
    this.maxSize = maxSize
    this.defaultTtl = defaultTtl
  }

  /**
   * Sets a value in the cache
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time to live in milliseconds
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTtl): void {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictOldest()
    }

    const now = Date.now()
    this.cache.set(key, {
      data,
      timestamp: now,
      ttl,
      accessCount: 0,
      lastAccessed: now
    })
  }

  /**
   * Gets a value from the cache
   * @param key - Cache key
   * @returns Cached data or null if not found/expired
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null

    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    // Update access statistics
    item.accessCount++
    item.lastAccessed = now

    return item.data as T
  }

  /**
   * Checks if a key exists and is not expired
   * @param key - Cache key
   * @returns True if key exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Deletes a specific key from cache
   * @param key - Cache key
   * @returns True if key was deleted
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clears all cache entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Gets current cache size
   * @returns Number of items in cache
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Removes expired entries from cache
   * @returns Number of entries removed
   */
  cleanup(): number {
    const now = Date.now()
    let removed = 0

    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
        removed++
      }
    }

    return removed
  }

  /**
   * Gets cache statistics
   * @returns Cache statistics object
   */
  getStats() {
    const now = Date.now()
    let expired = 0
    let totalAccess = 0

    for (const item of this.cache.values()) {
      if (now - item.timestamp > item.ttl) {
        expired++
      }
      totalAccess += item.accessCount
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      expired,
      totalAccess,
      hitRate: totalAccess > 0 ? (this.cache.size - expired) / this.cache.size : 0
    }
  }

  /**
   * Evicts the oldest or least accessed item
   * @private
   */
  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }
}

/**
 * Global cache instance
 */
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
    return cached as T
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