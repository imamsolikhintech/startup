# Google OAuth Integration Guide

## Overview
This document describes the implementation of Google OAuth authentication integration between the Vue.js frontend and Go auth-service backend.

## Implementation Details

### Frontend Changes

#### 1. LoginView.vue Updates
- **File**: `d:\rnd\startup\frontend\src\views\auth\LoginView.vue`
- **Changes**: Updated `handleSocialLogin` function to redirect to backend Google OAuth endpoint
- **Flow**: 
  1. User clicks "Continue with Google" button
  2. Frontend redirects to `{VITE_API_SERVICE_AUTH}/api/v1/auth/google/login?redirect_url={frontend_callback_url}`
  3. Backend handles Google OAuth flow

```javascript
const handleSocialLogin = (provider: string) => {
  if (provider === 'google') {
    const redirectUrl = `${window.location.origin}/auth/google/callback`
    const authServiceUrl = import.meta.env.VITE_API_SERVICE_AUTH
    const googleAuthUrl = `${authServiceUrl}/api/v1/auth/google/login?redirect_url=${encodeURIComponent(redirectUrl)}`
    window.location.href = googleAuthUrl
  }
}
```

#### 2. GoogleCallbackView.vue (New Component)
- **File**: `d:\rnd\startup\frontend\src\views\auth\GoogleCallbackView.vue`
- **Purpose**: Handles the OAuth callback and processes authentication tokens
- **Flow**:
  1. Receives tokens from URL parameters (access_token, refresh_token, token_type)
  2. Validates tokens are present
  3. Fetches user profile from backend using access token
  4. Maps backend user data to frontend format
  5. Uses auth store to set authentication state
  6. Redirects to dashboard on success

#### 3. Router Configuration
- **File**: `d:\rnd\startup\frontend\src\router\index.ts`
- **Addition**: Added Google OAuth callback route
```javascript
{
  path: 'google/callback',
  name: 'GoogleCallback',
  component: () => import('@/views/auth/GoogleCallbackView.vue')
}
```

#### 4. Auth Store Enhancement
- **File**: `d:\rnd\startup\frontend\src\stores\auth.ts`
- **Addition**: Added `setGoogleAuth` method for handling Google OAuth authentication
```javascript
const setGoogleAuth = (userData: User, accessToken: string, refreshToken: string) => {
  // Set user data and store tokens
  user.value = userData
  localStorage.setItem('auth_token', accessToken)
  localStorage.setItem('refresh_token', refreshToken)
  localStorage.setItem('auth_user', JSON.stringify(userData))
  // Clear errors and loading state
}
```

### Backend Configuration

#### Environment Variables Update
- **File**: `d:\rnd\startup\backend\auth-service\.env`
- **Change**: Updated Google OAuth redirect URL to correct port
```env
GOOGLE_REDIRECT_URL=http://localhost:8080/api/v1/auth/google/callback
```

### Authentication Flow

1. **Initiation**:
   - User clicks "Continue with Google" on login page
   - Frontend redirects to backend Google OAuth endpoint with callback URL

2. **Google OAuth**:
   - Backend redirects user to Google OAuth consent screen
   - User authorizes application
   - Google redirects back to backend callback endpoint with authorization code

3. **Token Exchange**:
   - Backend exchanges authorization code for access/refresh tokens
   - Backend retrieves user profile from Google
   - Backend creates or updates user in database
   - Backend generates JWT tokens

4. **Frontend Callback**:
   - Backend redirects to frontend callback URL with tokens as query parameters
   - Frontend processes tokens and fetches user profile
   - Frontend updates authentication state and redirects to dashboard

## API Endpoints

### Backend Endpoints
- `GET /api/v1/auth/google/login?redirect_url={url}` - Initiate Google OAuth
- `GET /api/v1/auth/google/callback` - Handle Google OAuth callback
- `GET /api/v1/auth/me` - Get current user profile

### Frontend Routes
- `/auth/login` - Login page with Google OAuth button
- `/auth/google/callback` - OAuth callback handler

## Environment Configuration

### Frontend (.env)
```env
VITE_API_SERVICE_AUTH=http://localhost:8080
```

### Backend (.env)
```env
GOOGLE_CLIENT_ID=902438616375-4dioe2o7sagp4kh0fdpjg1foan4obmip.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URL=http://localhost:8080/api/v1/auth/google/callback
```

## Testing Instructions

### Prerequisites
1. Ensure MySQL and Redis are running
2. Backend auth-service is configured with Google OAuth credentials
3. Frontend development server is running

### Steps to Test

1. **Start Backend Service**:
   ```bash
   cd d:\rnd\startup\backend\auth-service
   go run cmd/api/main.go
   # or
   make run
   ```

2. **Start Frontend Development Server**:
   ```bash
   cd d:\rnd\startup\frontend
   npm run dev
   ```

3. **Test Google OAuth Flow**:
   - Navigate to `http://localhost:5173/auth/login`
   - Click "Continue with Google" button
   - Complete Google OAuth consent flow
   - Verify successful authentication and redirect to dashboard

### Expected Behavior

1. **Successful Flow**:
   - User is redirected to Google OAuth consent screen
   - After consent, user is redirected back to frontend
   - User profile is loaded and displayed
   - User is authenticated and can access protected routes

2. **Error Handling**:
   - Missing tokens: Error message displayed with retry option
   - Invalid tokens: User redirected to login page
   - Network errors: Appropriate error messages shown

## Security Considerations

1. **Token Storage**: Tokens are stored in localStorage (consider httpOnly cookies for production)
2. **HTTPS**: Ensure HTTPS is used in production for secure token transmission
3. **State Validation**: Backend validates OAuth state parameter to prevent CSRF attacks
4. **Token Expiration**: Implement proper token refresh mechanism

## Troubleshooting

### Common Issues

1. **Redirect URL Mismatch**:
   - Ensure Google OAuth app configuration matches backend redirect URL
   - Check that `GOOGLE_REDIRECT_URL` in backend .env is correct

2. **CORS Issues**:
   - Verify CORS configuration in backend allows frontend origin
   - Check that frontend is making requests to correct backend URL

3. **Token Issues**:
   - Verify tokens are being passed correctly in callback URL
   - Check that user profile endpoint is accessible with provided token

4. **Environment Variables**:
   - Ensure all required environment variables are set
   - Verify Google OAuth credentials are valid

## Next Steps

1. **Production Deployment**:
   - Update Google OAuth app configuration for production URLs
   - Implement secure token storage (httpOnly cookies)
   - Add proper error logging and monitoring

2. **Enhanced Security**:
   - Implement PKCE (Proof Key for Code Exchange)
   - Add rate limiting for OAuth endpoints
   - Implement proper session management

3. **User Experience**:
   - Add loading states during OAuth flow
   - Implement proper error handling and user feedback
   - Add option to link/unlink Google account

## Files Modified/Created

### Modified Files
- `d:\rnd\startup\frontend\src\views\auth\LoginView.vue`
- `d:\rnd\startup\frontend\src\router\index.ts`
- `d:\rnd\startup\frontend\src\stores\auth.ts`
- `d:\rnd\startup\backend\auth-service\.env`

### Created Files
- `d:\rnd\startup\frontend\src\views\auth\GoogleCallbackView.vue`
- `d:\rnd\startup\GOOGLE_OAUTH_INTEGRATION.md` (this file)

This implementation provides a complete Google OAuth integration that securely handles user authentication between the frontend and backend services.