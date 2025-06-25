# Request Deduplication Implementation

## Overview
The API client now includes automatic request deduplication to prevent duplicate requests to the same URL while a previous request is still pending.

## How it Works

### Key Generation
Each request generates a unique key based on:
- HTTP method (GET, POST, PUT, PATCH, DELETE)
- URL
- Request data (for POST, PUT, PATCH)

Example keys:
```
GET:/api/v1/users:
POST:/api/v1/users:{"name":"John","email":"john@example.com"}
GET:/api/v1/users:{"page":1,"limit":10}
```

### Deduplication Logic
1. When a request is made, the system checks if an identical request is already pending
2. If found, it returns the existing promise instead of making a new request
3. If not found, it creates a new request and stores it in the pending requests map
4. When the request completes (success or failure), it's automatically removed from pending requests
5. Expired requests (older than 30 seconds) are automatically cleaned up

## Benefits

1. **Prevents Duplicate API Calls**: Eliminates unnecessary network requests
2. **Improves Performance**: Reduces server load and bandwidth usage
3. **Better User Experience**: Prevents race conditions and inconsistent UI states
4. **Automatic Cleanup**: Expired requests are automatically removed

## Usage Examples

### Basic Usage
```typescript
// These calls will be deduplicated if made simultaneously
const users1 = await apiClient.get('/api/v1/users')
const users2 = await apiClient.get('/api/v1/users') // Returns same promise as users1
```

### With Parameters
```typescript
// These will be treated as different requests
const page1 = await apiClient.get('/api/v1/users', { params: { page: 1 } })
const page2 = await apiClient.get('/api/v1/users', { params: { page: 2 } })

// These will be deduplicated
const page1a = await apiClient.get('/api/v1/users', { params: { page: 1 } })
const page1b = await apiClient.get('/api/v1/users', { params: { page: 1 } }) // Same as page1a
```

### POST Requests
```typescript
// These will be deduplicated if data is identical
const user1 = await apiClient.post('/api/v1/users', { name: 'John', email: 'john@example.com' })
const user2 = await apiClient.post('/api/v1/users', { name: 'John', email: 'john@example.com' }) // Deduplicated

// These will be treated as different requests
const user3 = await apiClient.post('/api/v1/users', { name: 'Jane', email: 'jane@example.com' })
```

## Debugging

### Check Pending Requests
```typescript
const pendingCount = apiClient.getPendingRequestsCount()
console.log(`Currently pending requests: ${pendingCount}`)
```

### Clear Pending Requests
```typescript
// Useful for cleanup during component unmount or route changes
apiClient.clearPendingRequests()
```

### Console Logging
When a request is deduplicated, you'll see a console log:
```
Deduplicating request: GET:/api/v1/users:
```

## Configuration

- **Request Timeout**: 30 seconds (configurable via `REQUEST_TIMEOUT`)
- **Automatic Cleanup**: Expired requests are cleaned up on each new request
- **Memory Management**: Completed requests are automatically removed from memory

## Best Practices

1. **Component Cleanup**: Clear pending requests when components unmount to prevent memory leaks
2. **Route Changes**: Consider clearing pending requests on route changes
3. **Error Handling**: Deduplication works with both successful and failed requests
4. **Monitoring**: Use `getPendingRequestsCount()` to monitor request patterns in development

## Implementation Details

- Uses `Map<string, PendingRequest>` for efficient storage and lookup
- Automatic cleanup prevents memory leaks
- Works with all HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Compatible with existing axios interceptors and error handling
- Thread-safe for concurrent requests