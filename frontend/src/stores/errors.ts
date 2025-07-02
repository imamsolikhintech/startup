// Custom error types for better error handling

export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class AuthError extends Error {
  public readonly type: AuthErrorType
  public readonly statusCode?: number
  public readonly details?: any
  public readonly timestamp: Date

  constructor (
    message: string,
    type: AuthErrorType = AuthErrorType.UNKNOWN_ERROR,
    statusCode?: number,
    details?: any,
  ) {
    super(message)
    this.name = 'AuthError'
    this.type = type
    this.statusCode = statusCode
    this.details = details
    this.timestamp = new Date()
  }

  static fromApiError (error: any): AuthError {
    const statusCode = error.response?.status
    const message = error.response?.data?.message || error.message
    const details = error.response?.data

    let type: AuthErrorType

    switch (statusCode) {
      case 401:
        type = AuthErrorType.INVALID_CREDENTIALS
        break
      case 403:
        type = AuthErrorType.ACCOUNT_LOCKED
        break
      case 422:
        type = AuthErrorType.VALIDATION_ERROR
        break
      case 500:
        type = AuthErrorType.SERVER_ERROR
        break
      default:
        if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
          type = AuthErrorType.NETWORK_ERROR
        } else {
          type = AuthErrorType.UNKNOWN_ERROR
        }
    }

    return new AuthError(message, type, statusCode, details)
  }

  isRetryable (): boolean {
    return [
      AuthErrorType.NETWORK_ERROR,
      AuthErrorType.SERVER_ERROR,
    ].includes(this.type)
  }

  getUserFriendlyMessage (): string {
    switch (this.type) {
      case AuthErrorType.INVALID_CREDENTIALS:
        return 'Invalid email or password. Please try again.'
      case AuthErrorType.NETWORK_ERROR:
        return 'Network error. Please check your connection and try again.'
      case AuthErrorType.TOKEN_EXPIRED:
        return 'Your session has expired. Please login again.'
      case AuthErrorType.ACCOUNT_LOCKED:
        return 'Account temporarily locked. Please try again later.'
      case AuthErrorType.VALIDATION_ERROR:
        return this.details?.errors?.join(', ') || 'Please check your input and try again.'
      case AuthErrorType.SERVER_ERROR:
        return 'Server error. Please try again later.'
      default:
        return this.message || 'An unexpected error occurred. Please try again.'
    }
  }
}
