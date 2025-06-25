# Frontend-Backend Integration Guide

This document describes the integration between the Vue.js frontend and Go auth-service backend.

## Overview

The frontend (`d:\rnd\startup\frontend`) has been integrated with the backend auth-service (`d:\rnd\backend\auth-service`) to provide a complete authentication system with user and role management.

## Integration Changes

### 1. API Endpoint Configuration

**Frontend Configuration:**
- Updated `src/api/endpoint/base.ts` to include `BaseAuth` export
- Configured `.env` file with correct auth service URL: `http://localhost:8080`
- Updated `authService.ts` endpoints to match backend API routes:
  - `/api/v1/auth/login`
  - `/api/v1/auth/register`
  - `/api/v1/auth/logout`
  - `/api/v1/auth/refresh`
  - `/api/v1/auth/me`
  - And other auth-related endpoints

### 2. Authentication Flow

**JWT Token Handling:**
- Added refresh token support in auth store
- Implemented automatic token refresh in axios interceptors
- Store both access token and refresh token in localStorage
- Handle token expiration gracefully with automatic retry

**Auth Store Updates:**
- Added `refreshToken()` method
- Updated login to handle both access and refresh tokens
- Enhanced logout to clear all tokens
- Improved token validation and error handling

### 3. User Management Integration

**New UserService:**
- Created `src/api/service/userService.ts` for user and role management
- Supports CRUD operations for users and roles
- Integrated with backend endpoints:
  - `/api/v1/users` - User management
  - `/api/v1/roles` - Role management
  - `/api/v1/permissions` - Permission management

### 4. API Client Enhancements

**Axios Interceptors:**
- Request interceptor adds JWT token to headers
- Response interceptor handles 401 errors with token refresh
- Automatic retry of failed requests after token refresh
- Comprehensive error handling and notifications

## Backend Compatibility

The frontend is now compatible with the backend auth-service features:

### Authentication Features
- ✅ User login/logout
- ✅ User registration
- ✅ JWT with refresh tokens
- ✅ Password reset flow
- ✅ Email verification
- ✅ Profile management

### User Management Features
- ✅ User CRUD operations
- ✅ Role-based access control (RBAC)
- ✅ Permission management
- ✅ User status management

### Security Features
- ✅ JWT token validation
- ✅ Automatic token refresh
- ✅ Secure token storage
- ✅ CORS handling

## Running the Integrated System

### 1. Start Backend Auth Service
```bash
cd d:\rnd\backend\auth-service
go run cmd/api/main.go
```
The backend will run on `http://localhost:8080`

### 2. Start Frontend Development Server
```bash
cd d:\rnd\startup\frontend
npm run dev
```
The frontend will run on `http://localhost:5173`

### 3. Database Setup
Ensure PostgreSQL is running and migrations are applied:
```bash
cd d:\rnd\backend\auth-service
make migrate
```

## API Endpoints Mapping

| Frontend Service | Backend Endpoint | Description |
|-----------------|------------------|-------------|
| `authService.login()` | `POST /api/v1/auth/login` | User authentication |
| `authService.register()` | `POST /api/v1/auth/register` | User registration |
| `authService.logout()` | `POST /api/v1/auth/logout` | User logout |
| `authService.refreshToken()` | `POST /api/v1/auth/refresh` | Token refresh |
| `authService.getProfile()` | `GET /api/v1/auth/me` | Get user profile |
| `userService.getUsers()` | `GET /api/v1/users` | List users |
| `userService.createUser()` | `POST /api/v1/users` | Create user |
| `userService.getRoles()` | `GET /api/v1/roles` | List roles |
| `userService.createRole()` | `POST /api/v1/roles` | Create role |

## Environment Variables

**Frontend (.env):**
```env
VITE_API_SERVICE_AUTH=http://localhost:8080
```

**Backend:**
Refer to `d:\rnd\backend\auth-service\.env.example` for required environment variables.

## Testing the Integration

1. **Authentication Flow:**
   - Register a new user via frontend
   - Login with credentials
   - Verify JWT token is stored
   - Test automatic token refresh

2. **User Management:**
   - Access user management features
   - Create/edit users and roles
   - Test permission-based access

3. **Error Handling:**
   - Test invalid credentials
   - Test expired token scenarios
   - Verify error notifications

## Next Steps

1. Implement role-based UI components
2. Add user management pages
3. Create role and permission management interface
4. Add comprehensive error handling
5. Implement loading states and user feedback
6. Add unit and integration tests

## Troubleshooting

**Common Issues:**

1. **CORS Errors:**
   - Ensure backend CORS is configured for frontend URL
   - Check if both services are running on correct ports

2. **Token Issues:**
   - Clear localStorage if tokens are corrupted
   - Check token expiration settings in backend

3. **API Connection:**
   - Verify backend is running on port 8080
   - Check network connectivity
   - Ensure database is accessible

**Debug Steps:**
1. Check browser console for errors
2. Verify API responses in Network tab
3. Check backend logs for errors
4. Validate environment variables