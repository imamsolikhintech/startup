import type { ApiResponse, PaginatedResponse } from '@/api/types'
import type { ApiClient } from '../endpoint/axios'

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

    return await this.apiClient.get(
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
   * Helper to serialize parameters for URLSearchParams
   * Handles arrays and objects correctly.
   */
  protected serializeParams(params: Record<string, any>): Record<string, string> {
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
  protected handleError(error: any): Promise<never> {
    console.error('API call failed:', error)
    // You might want to throw a custom error or return a specific error structure
    throw error
  }
}

// Define ApiClient interface or import it if it exists elsewhere
// This is a placeholder, replace with your actual API client definition
// interface ApiClient {
//   get<T>(url: string, config?: any): Promise<T>
//   post<T>(url: string, data?: any, config?: any): Promise<T>
//   put<T>(url: string, data?: any, config?: any): Promise<T>
//   patch<T>(url: string, data?: any, config?: any): Promise<T>
//   delete<T>(url: string, config?: any): Promise<T>
//   getBlob(url: string, config?: any): Promise<Blob>
// }