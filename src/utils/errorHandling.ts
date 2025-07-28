// src/utils/errorHandling.ts

export class AuthError extends Error {
    constructor(
      message: string,
      public code: string,
      public status: number,
      public originalError?: any
    ) {
      super(message);
      this.name = 'AuthError';
    }
  }
  
  export const AUTH_ERROR_CODES = {
    INVALID_CREDENTIALS: 'AUTH_001',
    TOKEN_EXPIRED: 'AUTH_002',
    INVALID_TOKEN: 'AUTH_003',
    NETWORK_ERROR: 'AUTH_004',
    GOOGLE_AUTH_FAILED: 'AUTH_005',
    USER_NOT_FOUND: 'AUTH_007',
    SERVER_ERROR: 'AUTH_008',
    INACTIVE_USER: 'AUTH_009',
    INVALID_ROLE: 'AUTH_010',
    AUTH_PROVIDER_MISMATCH: 'AUTH_014',
  } as const;
  
  // Safe error messages that don't expose internal details
  const ERROR_MESSAGES = {
    [AUTH_ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid email or password',
    [AUTH_ERROR_CODES.TOKEN_EXPIRED]: 'Your session has expired. Please sign in again.',
    [AUTH_ERROR_CODES.INVALID_TOKEN]: 'Invalid authentication. Please sign in again.',
    [AUTH_ERROR_CODES.NETWORK_ERROR]: 'Connection error. Please check your internet connection.',
    [AUTH_ERROR_CODES.GOOGLE_AUTH_FAILED]: 'Google authentication failed. Please try again.',
    [AUTH_ERROR_CODES.USER_NOT_FOUND]: 'Account not found.',
    [AUTH_ERROR_CODES.SERVER_ERROR]: 'An unexpected error occurred. Please try again.',
    [AUTH_ERROR_CODES.INACTIVE_USER]: 'This account is currently inactive.',
    [AUTH_ERROR_CODES.INVALID_ROLE]: 'You do not have permission to perform this action.',
    [AUTH_ERROR_CODES.AUTH_PROVIDER_MISMATCH]: 'Please use the correct sign-in method for your account.',
  } as const;
  
  export const handleAuthError = (error: any): AuthError => {
    // Handle network errors
    if (!navigator.onLine) {
      return new AuthError(
        ERROR_MESSAGES[AUTH_ERROR_CODES.NETWORK_ERROR],
        AUTH_ERROR_CODES.NETWORK_ERROR,
        0
      );
    }
  
    if (error instanceof AuthError) {
      return error;
    }
  
    // Axios errors
    if (error.isAxiosError) {
      const status = error.response?.status || 500;
      
      switch (status) {
        case 401:
          return new AuthError(
            ERROR_MESSAGES[AUTH_ERROR_CODES.INVALID_CREDENTIALS],
            AUTH_ERROR_CODES.INVALID_CREDENTIALS,
            status
          );
        case 403:
          return new AuthError(
            ERROR_MESSAGES[AUTH_ERROR_CODES.TOKEN_EXPIRED],
            AUTH_ERROR_CODES.TOKEN_EXPIRED,
            status
          );
        default:
          return new AuthError(
            ERROR_MESSAGES[AUTH_ERROR_CODES.SERVER_ERROR],
            AUTH_ERROR_CODES.SERVER_ERROR,
            status
          );
      }
    }
  
    // Default error
    return new AuthError(
      ERROR_MESSAGES[AUTH_ERROR_CODES.SERVER_ERROR],
      AUTH_ERROR_CODES.SERVER_ERROR,
      500
    );
  };
  
  // Logger for development that doesn't expose sensitive data
  const logError = (error: any) => {
    if (import.meta.env.DEV) {
      console.error('Auth Error:', {
        timestamp: new Date().toISOString(),
        code: error.code,
        status: error.status,
        message: error.message,
        type: error.name,
      });
    }
  };
  
  // Response wrapper for consistent error structure
  export const createErrorResponse = (error: any) => {
    const authError = handleAuthError(error);
    logError(authError);  // Log error safely in development
  
    return {
      status: 'error',
      code: authError.code,
      message: authError.message,
      // No internal error details exposed, even in development
    };
  };
  
  
  // Response wrapper for success
  export const createSuccessResponse = (data: any) => {
    return {
      status: 'success',
      data
    };
  };
  
  // Type guard for checking if an error is an AuthError
  export const isAuthError = (error: any): error is AuthError => {
    return error instanceof AuthError;
  };