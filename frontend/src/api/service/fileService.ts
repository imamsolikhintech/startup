import type {
  ApiResponse,
  PaginatedResponse,
  FileUploadResponse
} from '../types'
import type { ApiClient } from '../endpoint/axios'

// File Management Service
export class FileService {
  constructor(private apiClient: ApiClient) {}
  // Upload single file
  async uploadFile(
    file: File,
    folder?: string,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<FileUploadResponse>> {
    const additionalData = folder ? { folder } : undefined
    
    return await this.apiClient.upload<ApiResponse<FileUploadResponse>>(
      '/upload',
      file,
      (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
      additionalData
    )
  }

  // Upload multiple files
  async uploadMultiple(
    files: File[],
    options?: {
      folder?: string
      onProgress?: (progress: number) => void
      onFileProgress?: (fileIndex: number, progress: number) => void
    }
  ): Promise<ApiResponse<FileUploadResponse[]>> {
    return await this.apiClient.uploadMultiple<ApiResponse<FileUploadResponse[]>>(
      '/upload-multiple',
      files,
      (progressEvent) => {
        if (options?.onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          options.onProgress(progress)
        }
      },
      options?.folder ? { folder: options.folder } : undefined
    )
  }

  // Get file list with pagination
  async getFiles(
    page: number = 1,
    limit: number = 20,
    filters?: {
      folder?: string
      mimeType?: string
      search?: string
      sortBy?: 'name' | 'size' | 'createdAt'
      sortOrder?: 'asc' | 'desc'
    }
  ): Promise<PaginatedResponse<FileUploadResponse>> {
    return await this.apiClient.getPaginated<PaginatedResponse<FileUploadResponse>>('/files', page, limit, filters)
  }

  // Get file by ID
  async getFile(fileId: string): Promise<ApiResponse<FileUploadResponse>> {
    return await this.apiClient.get<ApiResponse<FileUploadResponse>>(`/files/${fileId}`)
  }

  // Download file
  async downloadFile(
    fileId: string,
    filename?: string,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    return await this.apiClient.download(
      `/files/${fileId}/download`,
      filename,
      (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      }
    )
  }

  // Get file URL for preview
  async getFileUrl(fileId: string): Promise<ApiResponse<{ url: string }>> {
    return await this.apiClient.get<ApiResponse<{ url: string }>>(`/files/${fileId}/url`)
  }

  // Delete file
  async deleteFile(fileId: string): Promise<ApiResponse<null>> {
    return await this.apiClient.delete<ApiResponse<null>>(`/files/${fileId}`)
  }

  // Delete multiple files
  async deleteMultipleFiles(fileIds: string[]): Promise<ApiResponse<null>> {
    return await this.apiClient.post<ApiResponse<null>>('/files/delete-multiple', { fileIds })
  }

  // Rename file
  async renameFile(fileId: string, newName: string): Promise<ApiResponse<FileUploadResponse>> {
    return await this.apiClient.put<ApiResponse<FileUploadResponse>>(`/files/${fileId}/rename`, {
      name: newName
    })
  }

  // Move file to folder
  async moveFile(fileId: string, targetFolder: string): Promise<ApiResponse<FileUploadResponse>> {
    return await this.apiClient.put<ApiResponse<FileUploadResponse>>(`/files/${fileId}/move`, {
      folder: targetFolder
    })
  }

  // Copy file
  async copyFile(fileId: string, targetFolder?: string): Promise<ApiResponse<FileUploadResponse>> {
    return await this.apiClient.post<ApiResponse<FileUploadResponse>>(`/files/${fileId}/copy`, {
      folder: targetFolder
    })
  }

  // Get file metadata
  async getFileMetadata(fileId: string): Promise<ApiResponse<{
    id: string
    filename: string
    originalName: string
    mimeType: string
    size: number
    folder: string
    checksum: string
    createdAt: string
    updatedAt: string
    downloadCount: number
    lastDownloadAt?: string
  }>> {
    return await this.apiClient.get(`/files/${fileId}/metadata`)
  }

  // Create folder
  async createFolder(
    name: string,
    parentFolder?: string
  ): Promise<ApiResponse<{
    id: string
    name: string
    path: string
    parentId?: string
  }>> {
    return await this.apiClient.post('/folders', {
      name,
      parentFolder
    })
  }

  // List folders
  async getFolders(
    parentFolder?: string
  ): Promise<ApiResponse<Array<{
    id: string
    name: string
    path: string
    parentId?: string
    fileCount: number
    size: number
  }>>> {
    const params = parentFolder ? { parent: parentFolder } : {}
    return await this.apiClient.get('/folders', { params })
  }

  // Delete folder
  async deleteFolder(folderId: string, force = false): Promise<ApiResponse<null>> {
    return await this.apiClient.delete(`/folders/${folderId}?force=${force}`)
  }

  // Rename folder
  async renameFolder(
    folderId: string,
    newName: string
  ): Promise<ApiResponse<{
    id: string
    name: string
    path: string
  }>> {
    return await this.apiClient.put(`/folders/${folderId}/rename`, {
      name: newName
    })
  }

  // Get storage statistics
  async getStorageStats(): Promise<ApiResponse<{
    totalSize: number
    usedSize: number
    availableSize: number
    fileCount: number
    folderCount: number
  }>> {
    return await this.apiClient.get('/storage/stats')
  }

  // Search files
  async searchFiles(
    query: string,
    filters?: {
      mimeType?: string
      folder?: string
      dateFrom?: string
      dateTo?: string
      sizeMin?: number
      sizeMax?: number
    },
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<FileUploadResponse>> {
    return await this.apiClient.getPaginated<PaginatedResponse<FileUploadResponse>>('/files/search', page, limit, {
      q: query,
      ...filters
    })
  }

  // Generate shareable link
  async generateShareLink(
    fileId: string,
    options?: {
      expiresAt?: string
      password?: string
      downloadLimit?: number
    }
  ): Promise<ApiResponse<{
    shareId: string
    url: string
    expiresAt?: string
    downloadLimit?: number
  }>> {
    return await this.apiClient.post(`/files/${fileId}/share`, options)
  }

  // Revoke share link
  async revokeShareLink(shareId: string): Promise<ApiResponse<null>> {
    return await this.apiClient.delete(`/shares/${shareId}`)
  }

  // Get file versions (if versioning is enabled)
  async getFileVersions(fileId: string): Promise<ApiResponse<Array<{
    id: string
    version: number
    size: number
    checksum: string
    createdAt: string
    comment?: string
  }>>> {
    return await this.apiClient.get(`/files/${fileId}/versions`)
  }

  // Restore file version
  async restoreFileVersion(fileId: string, versionId: string): Promise<ApiResponse<FileUploadResponse>> {
    return await this.apiClient.post(`/files/${fileId}/versions/${versionId}/restore`)
  }
}

// Export singleton instance
export const fileServiceInstance = new FileService()
export default fileServiceInstance