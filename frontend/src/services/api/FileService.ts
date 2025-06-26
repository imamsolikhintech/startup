import { BaseApiService } from './BaseApiService'
import type { ApiClient } from '@/api/endpoint/axios'
import type { ApiResponse, PaginatedResponse } from '@/api/types'

/**
 * File related types
 */
export interface FileItem {
  id: string
  name: string
  originalName: string
  path: string
  url: string
  mimeType: string
  size: number
  extension: string
  isPublic: boolean
  uploadedBy: string
  uploadedAt: string
  updatedAt: string
  metadata?: FileMetadata
  tags?: string[]
}

export interface FileMetadata {
  width?: number
  height?: number
  duration?: number
  bitrate?: number
  codec?: string
  thumbnail?: string
  description?: string
  alt?: string
}

export interface UploadOptions {
  isPublic?: boolean
  folder?: string
  tags?: string[]
  metadata?: Partial<FileMetadata>
  maxSize?: number
  allowedTypes?: string[]
}

export interface FileFilters {
  mimeType?: string
  extension?: string
  folder?: string
  isPublic?: boolean
  uploadedBy?: string
  tags?: string[]
  sizeMin?: number
  sizeMax?: number
  uploadedAfter?: string
  uploadedBefore?: string
}

export interface FileStats {
  total: number
  totalSize: number
  byType: Record<string, number>
  byExtension: Record<string, number>
  publicFiles: number
  privateFiles: number
  recentUploads: number
}

export interface BulkFileOperation {
  fileIds: string[]
  operation: 'delete' | 'makePublic' | 'makePrivate' | 'move' | 'copy'
  data?: {
    folder?: string
    tags?: string[]
  }
}

export interface FileUploadProgress {
  fileId: string
  fileName: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
}

export interface FolderItem {
  id: string
  name: string
  path: string
  parentId?: string
  isPublic: boolean
  fileCount: number
  size: number
  createdBy: string
  createdAt: string
  updatedAt: string
}

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
      this.handleError(error, 'Get files')
    }
  }

  /**
   * Get file by ID
   * @param fileId - File ID
   * @returns File data
   */
  async getFileById(fileId: string): Promise<ApiResponse<FileItem>> {
    try {
      this.validateRequired({ fileId }, ['fileId'])
      return await this.getById<FileItem>(fileId)
    } catch (error) {
      this.handleError(error, 'Get file by ID')
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
        throw new Error(`File size exceeds maximum allowed size of ${options.maxSize} bytes`)
      }
      
      // Validate file type
      if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} is not allowed`)
      }
      
      return await this.upload<FileItem>(file, options)
    } catch (error) {
      this.handleError(error, 'Upload file')
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
          throw new Error(`File ${file.name} exceeds maximum allowed size`)
        }
        
        if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
          throw new Error(`File type ${file.type} is not allowed for ${file.name}`)
        }
        
        formData.append(`files`, file)
      })
      
      // Add options to form data
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value))
        }
      })
      
      return await this.apiClient.post<ApiResponse<{ success: FileItem[]; failed: any[] }>>(
        `${this.baseEndpoint}/upload/multiple`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              // Simplified progress tracking - in real implementation, you'd track individual files
              const fileProgress: FileUploadProgress[] = files.map((file, index) => ({
                fileId: `temp-${index}`,
                fileName: file.name,
                progress,
                status: progress === 100 ? 'completed' : 'uploading'
              }))
              onProgress(fileProgress)
            }
          }
        }
      )
    } catch (error) {
      this.handleError(error, 'Upload multiple files')
    }
  }

  /**
   * Download file
   * @param fileId - File ID
   * @returns File blob
   */
  async downloadFile(fileId: string): Promise<Blob> {
    try {
      this.validateRequired({ fileId }, ['fileId'])
      
      return await this.apiClient.getBlob(
        `${this.baseEndpoint}/${fileId}/download`
      )
    } catch (error) {
      this.handleError(error, 'Download file')
    }
  }

  /**
   * Get file download URL
   * @param fileId - File ID
   * @param expiresIn - URL expiration time in seconds
   * @returns Download URL
   */
  async getDownloadUrl(
    fileId: string,
    expiresIn: number = 3600
  ): Promise<ApiResponse<{ url: string; expiresAt: string }>> {
    try {
      this.validateRequired({ fileId }, ['fileId'])
      
      return await this.apiClient.get<ApiResponse<{ url: string; expiresAt: string }>>(
        `${this.baseEndpoint}/${fileId}/download-url?expiresIn=${expiresIn}`
      )
    } catch (error) {
      this.handleError(error, 'Get download URL')
    }
  }

  /**
   * Update file metadata
   * @param fileId - File ID
   * @param data - Update data
   * @returns Updated file
   */
  async updateFile(
    fileId: string,
    data: {
      name?: string
      isPublic?: boolean
      tags?: string[]
      metadata?: Partial<FileMetadata>
    }
  ): Promise<ApiResponse<FileItem>> {
    try {
      this.validateRequired({ fileId }, ['fileId'])
      return await this.update<FileItem>(fileId, data)
    } catch (error) {
      this.handleError(error, 'Update file')
    }
  }

  /**
   * Delete file
   * @param fileId - File ID
   * @returns Success response
   */
  async deleteFile(fileId: string): Promise<ApiResponse<null>> {
    try {
      this.validateRequired({ fileId }, ['fileId'])
      return await this.delete(fileId)
    } catch (error) {
      this.handleError(error, 'Delete file')
    }
  }

  /**
   * Search files
   * @param query - Search query
   * @param filters - Additional filters
   * @returns Search results
   */
  async searchFiles(
    query: string,
    filters: FileFilters = {}
  ): Promise<PaginatedResponse<FileItem>> {
    try {
      this.validateRequired({ query }, ['query'])
      return await this.search<FileItem>(query, filters)
    } catch (error) {
      this.handleError(error, 'Search files')
    }
  }

  /**
   * Get file statistics
   * @param filters - Filter criteria
   * @returns File statistics
   */
  async getFileStats(filters: FileFilters = {}): Promise<ApiResponse<FileStats>> {
    try {
      return await this.getStats<FileStats>(filters)
    } catch (error) {
      this.handleError(error, 'Get file statistics')
    }
  }

  /**
   * Generate thumbnail for image/video
   * @param fileId - File ID
   * @param options - Thumbnail options
   * @returns Thumbnail data
   */
  async generateThumbnail(
    fileId: string,
    options: {
      width?: number
      height?: number
      quality?: number
      format?: 'jpeg' | 'png' | 'webp'
    } = {}
  ): Promise<ApiResponse<{ thumbnailUrl: string }>> {
    try {
      this.validateRequired({ fileId }, ['fileId'])
      
      const queryParams = new URLSearchParams(this.serializeParams(options))
      
      return await this.apiClient.post<ApiResponse<{ thumbnailUrl: string }>>(
        `${this.baseEndpoint}/${fileId}/thumbnail?${queryParams}`
      )
    } catch (error) {
      this.handleError(error, 'Generate thumbnail')
    }
  }

  /**
   * Copy file
   * @param fileId - File ID
   * @param destination - Destination folder
   * @param newName - New file name (optional)
   * @returns Copied file
   */
  async copyFile(
    fileId: string,
    destination?: string,
    newName?: string
  ): Promise<ApiResponse<FileItem>> {
    try {
      this.validateRequired({ fileId }, ['fileId'])
      
      return await this.apiClient.post<ApiResponse<FileItem>>(
        `${this.baseEndpoint}/${fileId}/copy`,
        { destination, newName }
      )
    } catch (error) {
      this.handleError(error, 'Copy file')
    }
  }

  /**
   * Move file
   * @param fileId - File ID
   * @param destination - Destination folder
   * @param newName - New file name (optional)
   * @returns Moved file
   */
  async moveFile(
    fileId: string,
    destination: string,
    newName?: string
  ): Promise<ApiResponse<FileItem>> {
    try {
      this.validateRequired({ fileId, destination }, ['fileId', 'destination'])
      
      return await this.apiClient.post<ApiResponse<FileItem>>(
        `${this.baseEndpoint}/${fileId}/move`,
        { destination, newName }
      )
    } catch (error) {
      this.handleError(error, 'Move file')
    }
  }

  /**
   * Bulk file operations
   * @param operation - Bulk operation data
   * @returns Operation results
   */
  async bulkFileOperation(
    operation: BulkFileOperation
  ): Promise<ApiResponse<{ success: string[]; failed: string[] }>> {
    try {
      this.validateRequired(operation, ['fileIds', 'operation'])
      
      if (!operation.fileIds.length) {
        throw new Error('At least one file ID is required')
      }
      
      return await this.bulk<{ success: string[]; failed: string[] }>(
        operation.operation as any,
        operation.fileIds.map(id => ({ id, ...operation.data }))
      )
    } catch (error) {
      this.handleError(error, 'Bulk file operation')
    }
  }

  /**
   * Get folders
   * @param parentId - Parent folder ID (optional)
   * @returns Folders list
   */
  async getFolders(parentId?: string): Promise<ApiResponse<FolderItem[]>> {
    try {
      const queryParams = parentId ? `?parentId=${parentId}` : ''
      
      return await this.apiClient.get<ApiResponse<FolderItem[]>>(
        `${this.baseEndpoint}/folders${queryParams}`
      )
    } catch (error) {
      this.handleError(error, 'Get folders')
    }
  }

  /**
   * Create folder
   * @param name - Folder name
   * @param parentId - Parent folder ID (optional)
   * @param isPublic - Whether folder is public
   * @returns Created folder
   */
  async createFolder(
    name: string,
    parentId?: string,
    isPublic: boolean = false
  ): Promise<ApiResponse<FolderItem>> {
    try {
      this.validateRequired({ name }, ['name'])
      
      return await this.apiClient.post<ApiResponse<FolderItem>>(
        `${this.baseEndpoint}/folders`,
        { name, parentId, isPublic }
      )
    } catch (error) {
      this.handleError(error, 'Create folder')
    }
  }

  /**
   * Update folder
   * @param folderId - Folder ID
   * @param data - Update data
   * @returns Updated folder
   */
  async updateFolder(
    folderId: string,
    data: { name?: string; isPublic?: boolean }
  ): Promise<ApiResponse<FolderItem>> {
    try {
      this.validateRequired({ folderId }, ['folderId'])
      
      return await this.apiClient.patch<ApiResponse<FolderItem>>(
        `${this.baseEndpoint}/folders/${folderId}`,
        data
      )
    } catch (error) {
      this.handleError(error, 'Update folder')
    }
  }

  /**
   * Delete folder
   * @param folderId - Folder ID
   * @param force - Force delete even if not empty
   * @returns Success response
   */
  async deleteFolder(
    folderId: string,
    force: boolean = false
  ): Promise<ApiResponse<null>> {
    try {
      this.validateRequired({ folderId }, ['folderId'])
      
      return await this.apiClient.delete<ApiResponse<null>>(
        `${this.baseEndpoint}/folders/${folderId}?force=${force}`
      )
    } catch (error) {
      this.handleError(error, 'Delete folder')
    }
  }

  /**
   * Get file sharing settings
   * @param fileId - File ID
   * @returns Sharing settings
   */
  async getFileSharing(fileId: string): Promise<ApiResponse<any>> {
    try {
      this.validateRequired({ fileId }, ['fileId'])
      
      return await this.apiClient.get<ApiResponse<any>>(
        `${this.baseEndpoint}/${fileId}/sharing`
      )
    } catch (error) {
      this.handleError(error, 'Get file sharing')
    }
  }

  /**
   * Update file sharing settings
   * @param fileId - File ID
   * @param settings - Sharing settings
   * @returns Updated sharing settings
   */
  async updateFileSharing(
    fileId: string,
    settings: {
      isPublic?: boolean
      allowedUsers?: string[]
      expiresAt?: string
      password?: string
    }
  ): Promise<ApiResponse<any>> {
    try {
      this.validateRequired({ fileId }, ['fileId'])
      
      return await this.apiClient.patch<ApiResponse<any>>(
        `${this.baseEndpoint}/${fileId}/sharing`,
        settings
      )
    } catch (error) {
      this.handleError(error, 'Update file sharing')
    }
  }
}