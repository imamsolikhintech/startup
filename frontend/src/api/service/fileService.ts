import { BaseApiService } from './BaseApiService'
import type { ApiClient } from '../endpoint/axios'
import type {
  ApiResponse,
  PaginatedResponse,
  FileItem,
  FileMetadata,
  UploadOptions,
  FileFilters,
  FileStats,
  BulkFileOperation,
  FileUploadProgress,
  FolderItem
} from '../types'

/**
 * File Management Service
 *
 * Handles all file-related API operations including
 * upload, download, management, and organization.
 */
export class FileService extends BaseApiService {
  constructor(apiClient: ApiClient) {
    super(apiClient, '/files')
  }

  /**
   * Get all files with pagination and filters
   * @param page - Page number
   * @param limit - Items per page
   * @param filters - Filter criteria
   * @returns Paginated files
   */
  async getFiles(
    page: number = 1,
    limit: number = 10,
    filters: FileFilters = {}
  ): Promise<PaginatedResponse<FileItem>> {
    try {
      return await this.getAll<FileItem>(page, limit, filters)
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  /**
   * Get file by ID
   * @param fileId - File ID
   * @returns File data
   */
  async getFileById(fileId: string): Promise<ApiResponse<FileItem>> {
    try {
      return await this.getById<FileItem>(fileId)
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  /**
   * Upload single file
   * @param file - File to upload
   * @param options - Upload options
   * @returns Uploaded file data
   */
  async uploadFile(
    file: File,
    options: UploadOptions = {}
  ): Promise<ApiResponse<FileItem>> {
    try {
      // Validate file size
      if (options.maxSize && file.size > options.maxSize) {
        throw new Error(
          `File size exceeds maximum allowed size of ${options.maxSize} bytes`
        )
      }

      // Validate file type
      if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} is not allowed`)
      }

      return await this.upload<FileItem>(file, options)
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  /**
   * Upload multiple files
   * @param files - Files to upload
   * @param options - Upload options
   * @param onProgress - Progress callback
   * @returns Upload results
   */
  async uploadMultipleFiles(
    files: File[],
    options: UploadOptions = {},
    onProgress?: (progress: FileUploadProgress[]) => void
  ): Promise<ApiResponse<{ success: FileItem[]; failed: any[] }>> {
    try {
      if (!files.length) {
        throw new Error('At least one file is required')
      }

      const formData = new FormData()

      files.forEach((file, index) => {
        // Validate each file
        if (options.maxSize && file.size > options.maxSize) {
          throw new Error(
            `File ${file.name} exceeds maximum allowed size`
          )
        }

        if (
          options.allowedTypes &&
          !options.allowedTypes.includes(file.type)
        ) {
          throw new Error(
            `File type ${file.type} is not allowed for ${file.name}`
          )
        }

        formData.append(`files`, file)
      })

      // This part needs to be adapted to your ApiClient's multi-upload method
      // Assuming apiClient has a method like postFiles or similar
      return await this.apiClient.post<ApiResponse<{ success: FileItem[]; failed: any[] }>>(
        `${this.baseEndpoint}/upload-multiple`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent: import('axios').AxiosProgressEvent) => {
            if (onProgress) {
              // This is a simplified progress. You might need more complex logic
              // to track individual file progress if your backend supports it.
              const totalProgress = Math.round(
                (progressEvent.loaded * 100) / (progressEvent.total || 1)
              )
              onProgress([
                {
                  fileId: 'multi-upload',
                  fileName: 'Multiple Files',
                  progress: totalProgress,
                  status: totalProgress === 100 ? 'completed' : 'uploading'
                }
              ])
            }
          }
        }
      )
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  /**
   * Download file by ID
   * @param fileId - File ID
   * @param filename - Optional filename for download
   * @returns Blob of the file
   */
  async downloadFile(fileId: string, filename?: string): Promise<Blob> {
    try {
      const response = await this.apiClient.get(
        `${this.baseEndpoint}/${fileId}/download`
      )
      // Create a temporary URL and trigger download
      const url = window.URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = filename || fileId // Use provided filename or fileId
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      return response.data
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  /**
   * Delete file by ID
   * @param fileId - File ID
   * @returns API response
   */
  async deleteFile(fileId: string): Promise<ApiResponse<null>> {
    try {
      return await this.delete(fileId)
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  /**
   * Get file statistics
   * @param filters - Filter criteria for stats
   * @returns File statistics
   */
  async getFileStats(filters: FileFilters = {}): Promise<ApiResponse<FileStats>> {
    try {
      return await this.getStats<FileStats>(filters)
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  /**
   * Perform bulk file operations
   * @param operation - Type of bulk operation
   * @param fileIds - Array of file IDs
   * @param data - Additional data for operation (e.g., new folder for move)
   * @returns API response
   */
  async bulkFileOperation(
    operation: 'delete' | 'makePublic' | 'makePrivate' | 'move' | 'copy',
    fileIds: string[],
    data?: any
  ): Promise<ApiResponse<any>> {
    try {
      const endpoint = `${this.baseEndpoint}/bulk/${operation}`
      return await this.apiClient.post(endpoint, {
        ids: fileIds,
        ...data
      })
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  /**
   * Get all folders with pagination and filters
   * @param page - Page number
   * @param limit - Items per page
   * @param filters - Filter criteria
   * @returns Paginated folders
   */
  async getFolders(
    page: number = 1,
    limit: number = 10,
    filters: FileFilters = {}
  ): Promise<PaginatedResponse<FolderItem>> {
    try {
      return await this.getAll<FolderItem>(page, limit, filters)
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  /**
   * Get folder by ID
   * @param folderId - Folder ID
   * @returns Folder data
   */
  async getFolderById(folderId: string): Promise<ApiResponse<FolderItem>> {
    try {
      return await this.getById<FolderItem>(folderId)
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  /**
   * Create new folder
   * @param data - Folder data
   * @returns API response with created folder
   */
  async createFolder(data: Partial<FolderItem>): Promise<ApiResponse<FolderItem>> {
    try {
      return await this.create<FolderItem>(data)
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  /**
   * Update existing folder
   * @param folderId - Folder ID
   * @param data - Updated folder data
   * @returns API response with updated folder
   */
  async updateFolder(
    folderId: string,
    data: Partial<FolderItem>
  ): Promise<ApiResponse<FolderItem>> {
    try {
      return await this.update<FolderItem>(folderId, data)
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  /**
   * Delete folder by ID
   * @param folderId - Folder ID
   * @returns API response
   */
  async deleteFolder(folderId: string): Promise<ApiResponse<null>> {
    try {
      return await this.delete(folderId)
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }
}