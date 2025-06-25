# API Configuration Documentation

Dokumentasi lengkap untuk konfigurasi API yang telah dibuat dalam proyek ini.

## 📁 Struktur Direktori

```
src/api/
├── endpoint/
│   ├── base.ts          # Konfigurasi endpoint dasar
│   └── axios.ts         # Konfigurasi Axios client
├── service/
│   ├── index.ts         # Export semua service
│   ├── authService.ts   # Service autentikasi
│   └── fileService.ts   # Service manajemen file
├── request/
│   └── helpers.ts       # Helper functions untuk request
├── types/
│   └── index.ts         # Type definitions
├── examples/
│   └── usage.ts         # Contoh penggunaan
├── index.ts             # Main export file
└── README.md            # Dokumentasi ini
```

## 🚀 Quick Start

### Import API Client

```typescript
import { apiClient, authService, fileService } from '@/api'
```

### Basic Usage

```typescript
// GET request
const users = await apiClient.get('/users')

// POST request
const newUser = await apiClient.post('/users', userData)

// Authentication
const loginResponse = await authService.login({ email, password })

// File upload
const uploadResponse = await fileService.upload(file)
```

## 🔧 Konfigurasi

### Environment Variables

Pastikan file `.env` sudah dikonfigurasi dengan benar:

```env
# API Endpoints
VITE_API_SERVICE_AUTH=http://localhost:3001/api/auth
VITE_API_SERVICE_FILE=http://localhost:3002/api/files
VITE_API_SERVICE_FINANCE=http://localhost:3003/api/finance
# ... dan seterusnya

# App Configuration
VITE_APP_TITLE=My Application
VITE_APP_VERSION=1.0.0
```

### Axios Configuration

Konfigurasi Axios sudah include:
- ✅ JWT Bearer Token otomatis
- ✅ Request/Response interceptors
- ✅ Error handling
- ✅ Timeout configuration
- ✅ Retry mechanism
- ✅ Loading state management

## 📡 API Services

### Authentication Service

```typescript
import { authService } from '@/api'

// Login
const response = await authService.login({
  email: 'user@example.com',
  password: 'password123'
})

// Register
const newUser = await authService.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123'
})

// Logout
await authService.logout()

// Refresh token
const newTokens = await authService.refreshToken()

// Get profile
const profile = await authService.getProfile()
```

### File Service

```typescript
import { fileService } from '@/api'

// Upload single file
const uploadResponse = await fileService.upload(file, {
  folder: 'documents',
  public: false
})

// Upload multiple files
const multipleResponse = await fileService.uploadMultiple(files)

// Download file
const blob = await fileService.download(fileId)

// Get file list
const fileList = await fileService.getFiles({
  page: 1,
  limit: 10,
  folder: 'documents'
})

// Delete file
await fileService.delete(fileId)
```

## 🛠 Helper Functions

### Request Configuration

```typescript
import { createRequestConfig, createUploadConfig } from '@/api'

// Basic request config
const config = createRequestConfig({
  timeout: 10000,
  headers: { 'X-Custom-Header': 'value' },
  params: { active: true }
})

// Upload config with progress
const uploadConfig = createUploadConfig(
  (progress) => console.log(`Upload: ${progress}%`)
)
```

### Error Handling

```typescript
import { ApiError, createApiError } from '@/api'

try {
  const response = await apiClient.get('/users')
} catch (error) {
  const apiError = createApiError(error)
  
  if (apiError.status === 401) {
    // Handle unauthorized
  } else if (apiError.status === 404) {
    // Handle not found
  }
}
```

### Caching

```typescript
import { withCache, requestCache } from '@/api'

// Cache request for 5 minutes
const cachedData = await withCache(
  'user-list',
  () => apiClient.get('/users'),
  300000
)

// Manual cache operations
requestCache.set('key', data, 60000)
const cached = requestCache.get('key')
requestCache.delete('key')
requestCache.clear()
```

### Retry Mechanism

```typescript
import { withRetry } from '@/api'

// Retry failed requests
const data = await withRetry(
  () => apiClient.get('/unstable-endpoint'),
  3, // max retries
  1000 // initial delay
)
```

### Pagination

```typescript
import { buildPaginationParams } from '@/api'

const params = buildPaginationParams(
  1, // page
  10, // limit
  'created_at', // sortBy
  'desc', // sortOrder
  { search: 'john' } // filters
)

const response = await apiClient.get('/users', { params })
```

## 🔒 Authentication

### JWT Token Management

Token JWT otomatis dikelola oleh sistem:

1. **Auto-attach**: Token otomatis ditambahkan ke header `Authorization`
2. **Auto-refresh**: Token di-refresh otomatis saat expired
3. **Auto-logout**: User di-logout otomatis jika refresh gagal

### Token Storage

```typescript
// Token disimpan di localStorage dengan key:
// - 'access_token': JWT access token
// - 'refresh_token': JWT refresh token
// - 'user': User data
```

## 📤 File Upload

### Single File Upload

```typescript
const handleFileUpload = async (file: File) => {
  try {
    const response = await fileService.upload(file, {
      folder: 'uploads',
      public: true,
      onProgress: (progress) => {
        console.log(`Upload progress: ${progress}%`)
      }
    })
    
    console.log('File uploaded:', response.url)
  } catch (error) {
    console.error('Upload failed:', error)
  }
}
```

### Multiple Files Upload

```typescript
const handleMultipleUpload = async (files: File[]) => {
  try {
    const responses = await fileService.uploadMultiple(files, {
      folder: 'batch-uploads',
      public: false
    })
    
    responses.forEach((response, index) => {
      console.log(`File ${index + 1}:`, response.url)
    })
  } catch (error) {
    console.error('Batch upload failed:', error)
  }
}
```

## 📥 File Download

```typescript
const handleFileDownload = async (fileId: string, filename: string) => {
  try {
    const blob = await fileService.download(fileId)
    
    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Download failed:', error)
  }
}
```

## 🔄 Real-time Updates

### Polling

```typescript
import { pollUserStatus } from '@/api/examples/usage'

// Poll user status every 5 seconds
const stopPolling = pollUserStatus(
  userId,
  (status) => {
    console.log('Status updated:', status)
  },
  5000
)

// Stop polling when component unmounts
onUnmounted(() => {
  stopPolling()
})
```

## 🎯 Best Practices

### 1. Error Handling

```typescript
// ✅ Good
try {
  const response = await apiClient.get('/users')
  return handleApiResponse(response.data)
} catch (error) {
  if (error instanceof ApiError) {
    // Handle API errors
    notificationStore.showError(error.message)
  } else {
    // Handle network errors
    notificationStore.showError('Network error occurred')
  }
  throw error
}

// ❌ Bad
const response = await apiClient.get('/users') // No error handling
```

### 2. Loading States

```typescript
// ✅ Good
const isLoading = ref(false)

const fetchUsers = async () => {
  isLoading.value = true
  try {
    const users = await apiClient.get('/users')
    return users
  } finally {
    isLoading.value = false
  }
}
```

### 3. Caching Strategy

```typescript
// ✅ Good - Cache static data
const getCountries = () => withCache(
  'countries',
  () => apiClient.get('/countries'),
  3600000 // 1 hour
)

// ✅ Good - Don't cache dynamic data
const getCurrentUser = () => apiClient.get('/user/profile')
```

### 4. Request Optimization

```typescript
// ✅ Good - Use pagination
const getUsers = (page = 1, limit = 10) => {
  const params = buildPaginationParams(page, limit)
  return apiClient.get('/users', { params })
}

// ❌ Bad - Load all data
const getAllUsers = () => apiClient.get('/users/all')
```

## 🐛 Debugging

### Enable Debug Mode

```typescript
// Set in .env for development
VITE_API_DEBUG=true
```

### Console Logs

Dalam mode debug, sistem akan log:
- 📤 Request details
- 📥 Response details
- ⚠️ Error details
- 🔄 Retry attempts
- 💾 Cache operations

## 🔧 Customization

### Custom Interceptors

```typescript
import { apiClient } from '@/api'

// Add custom request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add custom logic
    return config
  },
  (error) => Promise.reject(error)
)

// Add custom response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Add custom logic
    return response
  },
  (error) => Promise.reject(error)
)
```

### Custom Error Handler

```typescript
import { apiClient } from '@/api'

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Custom error handling logic
    if (error.response?.status === 403) {
      // Handle forbidden
      router.push('/unauthorized')
    }
    return Promise.reject(error)
  }
)
```

## 📚 Type Definitions

Semua type definitions tersedia di `@/api/types`:

```typescript
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  LoginRequest,
  FileUploadResponse
} from '@/api'
```

## 🤝 Contributing

Untuk menambahkan service baru:

1. Buat file service di `src/api/service/`
2. Export service di `src/api/service/index.ts`
3. Tambahkan types di `src/api/types/index.ts`
4. Update dokumentasi ini

## 📄 License

MIT License - lihat file LICENSE untuk detail.