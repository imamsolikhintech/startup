// ============================================================================
// BASE API SERVICE - ABSTRACT CLASS FOR ALL API SERVICES
// ============================================================================

import type { AxiosRequestConfig } from 'axios'
import { ApiClient } from '../endpoint/axios'
import type { ApiResponse, BaseFilters, PaginatedResponse, PaginationParams } from '../types'
import { createApiError, createCacheKey, requestCache, validateRequiredFields } from './helpers'

/**
 * Abstract base class for all API services
 * Provides common CRUD operations and utilities
 */
export abstract class ApiRequest {
  protected readonly apiClient: ApiClient
  protected readonly baseEndpoint: string
  protected readonly serviceName: string

  constructor (apiClient: ApiClient, baseEndpoint: string, serviceName?: string) {
    this.apiClient = apiClient
    this.baseEndpoint = baseEndpoint.replace(/\/$/, '') // Remove trailing slash
    this.serviceName = serviceName || this.constructor.name
  }

  // ============================================================================
  // COMMON CRUD OPERATIONS
  // ============================================================================

  /**
   * Retrieves all items with optional pagination and filtering
   * @param params - Query parameters including pagination and filters
   * @param config - Additional axios configuration
   * @returns Paginated response with items
   */
  protected async getAll<T>(
    params?: PaginationParams & BaseFilters,
    config?: AxiosRequestConfig,
  ): Promise<PaginatedResponse<T[]>> {
    try {
      const cacheKey = createCacheKey(`${this.baseEndpoint}/getAll`, params)
      const cached = requestCache.get<PaginatedResponse<T[]>>(cacheKey)

      if (cached) {
        return cached
      }

      const response = await this.apiClient.get<PaginatedResponse<T[]>>(
        this.baseEndpoint,
        { ...config, params },
      )

      const result = response.data
      requestCache.set(cacheKey, result, 60000) // Cache for 1 minute

      return result
    } catch (error) {
      throw createApiError(error, `Failed to fetch ${this.serviceName} list`)
    }
  }

  /**
   * Retrieves a single item by ID
   * @param id - Item identifier
   * @param config - Additional axios configuration
   * @returns API response with item data
   */
  protected async getById<T>(id: string | number, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      validateRequiredFields({ id }, ['id'])

      const cacheKey = createCacheKey(`${this.baseEndpoint}/${id}`)
      const cached = requestCache.get<ApiResponse<T>>(cacheKey)

      if (cached) {
        return cached
      }

      const response = await this.apiClient.get<ApiResponse<T>>(
        `${this.baseEndpoint}/${id}`,
        config,
      )

      const result = response.data
      requestCache.set(cacheKey, result, 300000) // Cache for 5 minutes

      return result
    } catch (error) {
      throw createApiError(error, `Failed to fetch ${this.serviceName} with ID: ${id}`)
    }
  }

  /**
   * Creates a new item
   * @param data - Item data to create
   * @param config - Additional axios configuration
   * @returns API response with created item
   */
  protected async create<T, U = T>(
    data: Partial<T>,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<U>> {
    try {
      const response = await this.apiClient.post<ApiResponse<U>>(
        this.baseEndpoint,
        data,
        config,
      )

      // Invalidate list cache after creation
      this.invalidateListCache()

      return response.data
    } catch (error) {
      throw createApiError(error, `Failed to create ${this.serviceName}`)
    }
  }

  /**
   * Updates an existing item (full update)
   * @param id - Item identifier
   * @param data - Updated item data
   * @param config - Additional axios configuration
   * @returns API response with updated item
   */
  protected async update<T, U = T>(
    id: string | number,
    data: Partial<T>,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<U>> {
    try {
      validateRequiredFields({ id }, ['id'])

      const response = await this.apiClient.put<ApiResponse<U>>(
        `${this.baseEndpoint}/${id}`,
        data,
        config,
      )

      // Invalidate caches after update
      this.invalidateItemCache(id)
      this.invalidateListCache()

      return response.data
    } catch (error) {
      throw createApiError(error, `Failed to update ${this.serviceName} with ID: ${id}`)
    }
  }

  /**
   * Partially updates an existing item
   * @param id - Item identifier
   * @param data - Partial item data to update
   * @param config - Additional axios configuration
   * @returns API response with updated item
   */
  protected async patch<T, U = T>(
    id: string | number,
    data: Partial<T>,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<U>> {
    try {
      validateRequiredFields({ id }, ['id'])

      const response = await this.apiClient.patch<ApiResponse<U>>(
        `${this.baseEndpoint}/${id}`,
        data,
        config,
      )

      // Invalidate caches after patch
      this.invalidateItemCache(id)
      this.invalidateListCache()

      return response.data
    } catch (error) {
      throw createApiError(error, `Failed to patch ${this.serviceName} with ID: ${id}`)
    }
  }

  /**
   * Deletes an item by ID
   * @param id - Item identifier
   * @param config - Additional axios configuration
   * @returns API response confirming deletion
   */
  protected async delete (id: string | number, config?: AxiosRequestConfig): Promise<ApiResponse<void>> {
    try {
      validateRequiredFields({ id }, ['id'])

      const response = await this.apiClient.delete<ApiResponse<void>>(
        `${this.baseEndpoint}/${id}`,
        config,
      )

      // Invalidate caches after deletion
      this.invalidateItemCache(id)
      this.invalidateListCache()

      return response.data
    } catch (error) {
      throw createApiError(error, `Failed to delete ${this.serviceName} with ID: ${id}`)
    }
  }

  /**
   * Bulk delete multiple items
   * @param ids - Array of item identifiers
   * @param config - Additional axios configuration
   * @returns API response with deletion results
   */
  protected async bulkDelete (
    ids: (string | number)[],
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<{ deleted: number, failed: number }>> {
    try {
      validateRequiredFields({ ids }, ['ids'])

      const response = await this.apiClient.delete<ApiResponse<{ deleted: number, failed: number }>>(
        `${this.baseEndpoint}/bulk`,
        { ...config, data: { ids } },
      )

      // Invalidate all caches after bulk deletion
      this.invalidateAllCaches()

      return response.data
    } catch (error) {
      throw createApiError(error, `Failed to bulk delete ${this.serviceName} items`)
    }
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  /**
   * Invalidates cache for a specific item
   * @param id - Item identifier
   * @protected
   */
  protected invalidateItemCache (id: string | number): void {
    const cacheKey = createCacheKey(`${this.baseEndpoint}/${id}`)
    requestCache.delete(cacheKey)
  }

  /**
   * Invalidates list cache for this service
   * @protected
   */
  protected invalidateListCache (): void {
    // Clear all cache entries that start with the base endpoint
    const keys = Array.from((requestCache as any).cache.keys())
    keys.forEach(key => {
      if (typeof key === 'string' && key.startsWith(`${this.baseEndpoint}/getAll`)) {
        requestCache.delete(key)
      }
    })
  }

  /**
   * Invalidates all caches for this service
   * @protected
   */
  protected invalidateAllCaches (): void {
    const keys = Array.from((requestCache as any).cache.keys())
    keys.forEach(key => {
      if (typeof key === 'string' && key.startsWith(this.baseEndpoint)) {
        requestCache.delete(key)
      }
    })
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Gets the full endpoint URL for a given path
   * @param path - Relative path
   * @returns Full endpoint URL
   * @protected
   */
  protected getEndpoint (path: string = ''): string {
    const cleanPath = path.replace(/^\//, '') // Remove leading slash
    return cleanPath ? `${this.baseEndpoint}/${cleanPath}` : this.baseEndpoint
  }

  /**
   * Creates a custom request with the service's base configuration
   * @param method - HTTP method
   * @param path - Relative path
   * @param data - Request data
   * @param config - Additional axios configuration
   * @returns Promise with response data
   * @protected
   */
  protected async customRequest<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string = '',
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const endpoint = this.getEndpoint(path)
      const response = await this.apiClient.request<T>({
        method,
        url: endpoint,
        data,
        ...config,
      })

      return response.data
    } catch (error) {
      throw createApiError(error, `Failed to execute ${method} request to ${this.serviceName}`)
    }
  }

  /**
   * Logs service activity for debugging
   * @param action - Action being performed
   * @param details - Additional details
   * @protected
   */
  protected log (action: string, details?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${this.serviceName}] ${action}`, details || '')
    }
  }

  /**
   * Search items
   * @param query - Search query
   * @param params - Additional search parameters
   * @returns Search results
   */
  protected async search<T>(
    query: string,
    params: Record<string, any> = {},
  ): Promise<PaginatedResponse<T>> {
    const queryParams = new URLSearchParams({
      q: query,
      ...this.serializeParams(params),
    })

    const response = await this.apiClient.get<PaginatedResponse<T>>(
      `${this.baseEndpoint}/search?${queryParams}`,
    )
    return response.data
  }

  /**
   * Bulk operations
   * @param operation - Operation type ('create', 'update', 'delete')
   * @param data - Bulk operation data
   * @returns API response
   */
  protected async bulk<T>(
    operation: 'create' | 'update' | 'delete',
    data: any[],
  ): Promise<ApiResponse<T[]>> {
    const response = await this.apiClient.post<ApiResponse<T[]>>(
      `${this.baseEndpoint}/bulk/${operation}`,
      { items: data },
    )
    return response.data
  }

  /**
   * Get statistics/summary
   * @param params - Filter parameters
   * @returns Statistics data
   */
  protected async getStats<T>(
    params: Record<string, any> = {},
  ): Promise<ApiResponse<T>> {
    const queryParams = new URLSearchParams(this.serializeParams(params))

    const response = await this.apiClient.get<ApiResponse<T>>(
      `${this.baseEndpoint}/stats?${queryParams}`,
    )
    return response.data
  }

  /**
   * Export data
   * @param format - Export format ('csv', 'xlsx', 'json')
   * @param params - Filter parameters
   * @returns Export response
   */
  protected async export (
    format: 'csv' | 'xlsx' | 'json' = 'csv',
    params: Record<string, any> = {},
  ): Promise<Blob> {
    const queryParams = new URLSearchParams({
      format,
      ...this.serializeParams(params),
    })

    return await this.apiClient.get(
      `${this.baseEndpoint}/export?${queryParams}`,
    )
  }

  /**
   * Upload file
   * @param file - File to upload
   * @param additionalData - Additional form data
   * @returns Upload response
   */
  protected async upload<T>(
    file: File,
    additionalData: Record<string, any> = {},
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)

    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, String(value))
    })

    const response = await this.apiClient.post<ApiResponse<T>>(
      `${this.baseEndpoint}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )
    return response.data
  }

  /**
   * Helper to serialize parameters for URLSearchParams
   * Handles arrays and objects correctly.
   */
  protected serializeParams (params: Record<string, any>): Record<string, string> {
    const serialized: Record<string, string> = {}
    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        const value = params[key]
        if (Array.isArray(value)) {
          serialized[key] = value.join(',')
        } else if (typeof value === 'object' && value !== null) {
          serialized[key] = JSON.stringify(value)
        } else {
          serialized[key] = String(value)
        }
      }
    }
    return serialized
  }

  /**
   * Handle API errors centrally
   * @param error - The error object
   * @returns A rejected promise with a standardized error format
   */
  protected handleError (error: any): Promise<never> {
    console.error('API call failed:', error)
    // You might want to throw a custom error or return a specific error structure
    throw error
  }
}
