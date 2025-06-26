import { ApiClient } from '@/api/endpoint/axios'
import type { ApiResponse, PaginatedResponse } from '@/api/types'

/**
 * Base API Service Class
 * 
 * Provides a standardized foundation for all API services.
 * Implements common CRUD operations and error handling patterns.
 */
export abstract class BaseApiService {
  protected apiClient: ApiClient
  protected baseEndpoint: string

  constructor(apiClient: ApiClient, baseEndpoint: string) {
    this.apiClient = apiClient
    this.baseEndpoint = baseEndpoint
  }

  /**
   * Get all items with pagination
   * @param page - Page number (1-based)
   * @param limit - Items per page
   * @param params - Additional query parameters
   * @returns Paginated response
   */
  protected async getAll<T>(
    page: number = 1,
    limit: number = 10,
    params: Record<string, any> = {}
  ): Promise<PaginatedResponse<T>> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...this.serializeParams(params)
    })

    return await this.apiClient.get<PaginatedResponse<T>>(
      `${this.baseEndpoint}?${queryParams}`
    )
  }

  /**
   * Get item by ID
   * @param id - Item ID
   * @returns API response with item
   */
  protected async getById<T>(id: string | number): Promise<ApiResponse<T>> {
    return await this.apiClient.get<ApiResponse<T>>(
      `${this.baseEndpoint}/${id}`
    )
  }

  /**
   * Create new item
   * @param data - Item data
   * @returns API response with created item
   */
  protected async create<T, D = any>(data: D): Promise<ApiResponse<T>> {
    return await this.apiClient.post<ApiResponse<T>>(
      this.baseEndpoint,
      data
    )
  }

  /**
   * Update existing item
   * @param id - Item ID
   * @param data - Updated item data
   * @returns API response with updated item
   */
  protected async update<T, D = any>(
    id: string | number,
    data: D
  ): Promise<ApiResponse<T>> {
    return await this.apiClient.put<ApiResponse<T>>(
      `${this.baseEndpoint}/${id}`,
      data
    )
  }

  /**
   * Partially update existing item
   * @param id - Item ID
   * @param data - Partial item data
   * @returns API response with updated item
   */
  protected async patch<T, D = any>(
    id: string | number,
    data: Partial<D>
  ): Promise<ApiResponse<T>> {
    return await this.apiClient.patch<ApiResponse<T>>(
      `${this.baseEndpoint}/${id}`,
      data
    )
  }

  /**
   * Delete item by ID
   * @param id - Item ID
   * @returns API response
   */
  protected async delete(id: string | number): Promise<ApiResponse<null>> {
    return await this.apiClient.delete<ApiResponse<null>>(
      `${this.baseEndpoint}/${id}`
    )
  }

  /**
   * Search items
   * @param query - Search query
   * @param params - Additional search parameters
   * @returns Search results
   */
  protected async search<T>(
    query: string,
    params: Record<string, any> = {}
  ): Promise<PaginatedResponse<T>> {
    const queryParams = new URLSearchParams({
      q: query,
      ...this.serializeParams(params)
    })

    return await this.apiClient.get<PaginatedResponse<T>>(
      `${this.baseEndpoint}/search?${queryParams}`
    )
  }

  /**
   * Bulk operations
   * @param operation - Operation type ('create', 'update', 'delete')
   * @param data - Bulk operation data
   * @returns API response
   */
  protected async bulk<T>(
    operation: 'create' | 'update' | 'delete',
    data: any[]
  ): Promise<ApiResponse<T[]>> {
    return await this.apiClient.post<ApiResponse<T[]>>(
      `${this.baseEndpoint}/bulk/${operation}`,
      { items: data }
    )
  }

  /**
   * Get statistics/summary
   * @param params - Filter parameters
   * @returns Statistics data
   */
  protected async getStats<T>(
    params: Record<string, any> = {}
  ): Promise<ApiResponse<T>> {
    const queryParams = new URLSearchParams(this.serializeParams(params))
    
    return await this.apiClient.get<ApiResponse<T>>(
      `${this.baseEndpoint}/stats?${queryParams}`
    )
  }

  /**
   * Export data
   * @param format - Export format ('csv', 'xlsx', 'json')
   * @param params - Filter parameters
   * @returns Export response
   */
  protected async export(
    format: 'csv' | 'xlsx' | 'json' = 'csv',
    params: Record<string, any> = {}
  ): Promise<Blob> {
    const queryParams = new URLSearchParams({
      format,
      ...this.serializeParams(params)
    })

    return await this.apiClient.getBlob(
      `${this.baseEndpoint}/export?${queryParams}`
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
    additionalData: Record<string, any> = {}
  ): Promise<ApiResponse<T>> {
    const formData = new FormData()
    formData.append('file', file)
    
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, String(value))
    })

    return await this.apiClient.post<ApiResponse<T>>(
      `${this.baseEndpoint}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
  }

  /**
   * Serialize parameters for URL query string
   * @param params - Parameters object
   * @returns Serialized parameters
   */
  private serializeParams(params: Record<string, any>): Record<string, string> {
    const serialized: Record<string, string> = {}
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (Array.isArray(value)) {
          serialized[key] = value.join(',')
        } else if (typeof value === 'object') {
          serialized[key] = JSON.stringify(value)
        } else {
          serialized[key] = String(value)
        }
      }
    })
    
    return serialized
  }

  /**
   * Handle API errors consistently
   * @param error - Error object
   * @param context - Error context
   * @throws Formatted error
   */
  protected handleError(error: any, context: string): never {
    console.error(`${context} failed:`, error)
    
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message)
    }
    
    if (error.message) {
      throw new Error(error.message)
    }
    
    throw new Error(`${context} failed with unknown error`)
  }

  /**
   * Validate required parameters
   * @param params - Parameters to validate
   * @param required - Required parameter names
   * @throws Error if required parameters are missing
   */
  protected validateRequired(
    params: Record<string, any>,
    required: string[]
  ): void {
    const missing = required.filter(key => 
      params[key] === null || params[key] === undefined || params[key] === ''
    )
    
    if (missing.length > 0) {
      throw new Error(`Missing required parameters: ${missing.join(', ')}`)
    }
  }

  /**
   * Build endpoint URL with path parameters
   * @param path - Path template with placeholders
   * @param params - Path parameters
   * @returns Built URL
   */
  protected buildEndpoint(path: string, params: Record<string, any>): string {
    let endpoint = `${this.baseEndpoint}${path}`
    
    Object.entries(params).forEach(([key, value]) => {
      endpoint = endpoint.replace(`{${key}}`, String(value))
    })
    
    return endpoint
  }
}

/**
 * Service configuration interface
 */
export interface ServiceConfig {
  baseURL: string
  timeout?: number
  retries?: number
  headers?: Record<string, string>
}

/**
 * Service factory for creating standardized API services
 */
export class ServiceFactory {
  private static instances = new Map<string, BaseApiService>()
  
  /**
   * Create or get service instance
   * @param ServiceClass - Service class constructor
   * @param config - Service configuration
   * @returns Service instance
   */
  static createService<T extends BaseApiService>(
    ServiceClass: new (apiClient: ApiClient, baseEndpoint: string) => T,
    config: ServiceConfig
  ): T {
    const key = `${ServiceClass.name}-${config.baseURL}`
    
    if (!this.instances.has(key)) {
      const apiClient = new ApiClient(config.baseURL)
      const instance = new ServiceClass(apiClient, '')
      this.instances.set(key, instance)
    }
    
    return this.instances.get(key) as T
  }
  
  /**
   * Clear all service instances
   */
  static clearInstances(): void {
    this.instances.clear()
  }
}