// Examples of how to use the API configuration

import {
  apiClient,
  authService,
  fileService,
  createRequestConfig,
  createUploadConfig,
  withRetry,
  withCache,
  buildPaginationParams,
  handleApiResponse,
  ApiError
} from '../index'

// Example 1: Basic GET request
export const getUsers = async () => {
  try {
    const config = createRequestConfig({
      timeout: 10000,
      params: { active: true }
    })
    
    const response = await apiClient.get('/users', config)
    return handleApiResponse(response.data)
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

// Example 2: POST request with data
export const createUser = async (userData: any) => {
  try {
    const config = createRequestConfig({
      headers: {
        'X-Custom-Header': 'value'
      }
    })
    
    const response = await apiClient.post('/users', userData, config)
    return handleApiResponse(response.data)
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('API Error:', error.message, error.status)
    }
    throw error
  }
}

// Example 3: Request Deduplication Demo
export const demonstrateRequestDeduplication = async () => {
  console.log('Starting request deduplication demo...')
  
  // These requests will be deduplicated automatically
  const startTime = Date.now()
  
  // Make multiple identical requests simultaneously
  const promises = [
    apiClient.get('/users'),
    apiClient.get('/users'),
    apiClient.get('/users')
  ]
  
  try {
    const results = await Promise.all(promises)
    const endTime = Date.now()
    
    console.log(`Completed ${promises.length} requests in ${endTime - startTime}ms`)
    console.log('All results are identical:', results.every(r => JSON.stringify(r) === JSON.stringify(results[0])))
    console.log('Pending requests count:', apiClient.getPendingRequestsCount())
    
    return results[0] // All results are the same due to deduplication
  } catch (error) {
    console.error('Request deduplication demo failed:', error)
    throw error
  }
}

// Example 4: Different requests (not deduplicated)
export const demonstrateDifferentRequests = async () => {
  console.log('Making different requests (will not be deduplicated)...')
  
  const promises = [
    apiClient.get('/users', { params: { page: 1 } }),
    apiClient.get('/users', { params: { page: 2 } }),
    apiClient.get('/users', { params: { active: true } })
  ]
  
  try {
    const results = await Promise.all(promises)
    console.log('Different requests completed:', results.length)
    return results
  } catch (error) {
    console.error('Different requests demo failed:', error)
    throw error
  }
}

// Example 5: Cleanup pending requests
export const cleanupExample = () => {
  console.log('Pending requests before cleanup:', apiClient.getPendingRequestsCount())
  apiClient.clearPendingRequests()
  console.log('Pending requests after cleanup:', apiClient.getPendingRequestsCount())
}

// Example 3: File upload with progress
export const uploadFile = async (
  file: File,
  onProgress?: (progress: number) => void
) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    const config = createUploadConfig(onProgress)
    
    const response = await apiClient.post('/files/upload', formData, config)
    return handleApiResponse(response.data)
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

// Example 4: Using authentication service
export const loginExample = async (email: string, password: string) => {
  try {
    const response = await authService.login({ email, password })
    
    // Token will be automatically stored and used for subsequent requests
    console.log('Login successful:', response.user)
    return response
  } catch (error) {
    console.error('Login failed:', error)
    throw error
  }
}

// Example 5: Using file service
export const uploadMultipleFiles = async (files: File[]) => {
  try {
    const response = await fileService.uploadMultiple(files, {
      folder: 'documents',
      public: false
    })
    
    console.log('Files uploaded:', response)
    return response
  } catch (error) {
    console.error('Error uploading files:', error)
    throw error
  }
}

// Example 6: Paginated request
export const getUsersPaginated = async (
  page: number = 1,
  limit: number = 10,
  search?: string
) => {
  try {
    const params = buildPaginationParams(
      page,
      limit,
      'created_at',
      'desc',
      { search }
    )
    
    const config = createRequestConfig({ params })
    const response = await apiClient.get('/users', config)
    
    return response.data // Already paginated response
  } catch (error) {
    console.error('Error fetching paginated users:', error)
    throw error
  }
}

// Example 7: Request with retry mechanism
export const getUserWithRetry = async (userId: string) => {
  return withRetry(
    async () => {
      const response = await apiClient.get(`/users/${userId}`)
      return handleApiResponse(response.data)
    },
    3, // max retries
    1000 // initial delay
  )
}

// Example 8: Cached request
export const getCachedUserProfile = async (userId: string) => {
  return withCache(
    `user-profile-${userId}`,
    async () => {
      const response = await apiClient.get(`/users/${userId}/profile`)
      return handleApiResponse(response.data)
    },
    300000 // 5 minutes cache
  )
}

// Example 9: Download file
export const downloadFile = async (fileId: string, filename: string) => {
  try {
    const response = await fileService.download(fileId)
    
    // Create download link
    const url = window.URL.createObjectURL(response)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading file:', error)
    throw error
  }
}

// Example 10: Error handling with custom logic
export const handleApiCall = async <T>(
  apiCall: () => Promise<T>
): Promise<T | null> => {
  try {
    return await apiCall()
  } catch (error) {
    if (error instanceof ApiError) {
      switch (error.status) {
        case 401:
          // Redirect to login
          console.log('Unauthorized - redirecting to login')
          break
        case 403:
          // Show permission denied message
          console.log('Permission denied')
          break
        case 404:
          // Show not found message
          console.log('Resource not found')
          break
        case 500:
          // Show server error message
          console.log('Server error - please try again later')
          break
        default:
          console.log('API Error:', error.message)
      }
    } else {
      console.error('Unexpected error:', error)
    }
    return null
  }
}

// Example 11: Bulk operations
export const bulkUpdateUsers = async (userUpdates: Array<{ id: string; data: any }>) => {
  try {
    const promises = userUpdates.map(({ id, data }) =>
      apiClient.put(`/users/${id}`, data)
    )
    
    const responses = await Promise.allSettled(promises)
    
    const results = responses.map((response, index) => {
      if (response.status === 'fulfilled') {
        return {
          id: userUpdates[index].id,
          success: true,
          data: handleApiResponse(response.value.data)
        }
      } else {
        return {
          id: userUpdates[index].id,
          success: false,
          error: response.reason
        }
      }
    })
    
    return results
  } catch (error) {
    console.error('Error in bulk update:', error)
    throw error
  }
}

// Example 12: Real-time data with polling
export const pollUserStatus = (
  userId: string,
  onUpdate: (status: any) => void,
  interval: number = 5000
) => {
  const poll = async () => {
    try {
      const response = await apiClient.get(`/users/${userId}/status`)
      const status = handleApiResponse(response.data)
      onUpdate(status)
    } catch (error) {
      console.error('Error polling user status:', error)
    }
  }
  
  // Initial poll
  poll()
  
  // Set up interval
  const intervalId = setInterval(poll, interval)
  
  // Return cleanup function
  return () => clearInterval(intervalId)
}

// Example 13: Conditional requests
export const getDataIfModified = async (
  url: string,
  lastModified?: string
) => {
  try {
    const config = createRequestConfig({
      headers: lastModified ? {
        'If-Modified-Since': lastModified
      } : {}
    })
    
    const response = await apiClient.get(url, config)
    
    if (response.status === 304) {
      // Not modified
      return null
    }
    
    return {
      data: handleApiResponse(response.data),
      lastModified: response.headers['last-modified']
    }
  } catch (error) {
    console.error('Error fetching conditional data:', error)
    throw error
  }
}