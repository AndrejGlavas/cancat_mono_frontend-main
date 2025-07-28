import { AxiosError } from 'axios';
import { ApiError, ApiResponse } from '../types/auth';

export const handleApiError = (error: unknown, defaultMessage: string): ApiError => ({
    message: error instanceof AxiosError 
      ? error.response?.data?.error?.message || defaultMessage
      : defaultMessage,
    details: error instanceof AxiosError ? error.response?.data?.error?.details : undefined,
    code: error instanceof AxiosError ? error.response?.data?.code : undefined
  });
  
  export const createSuccessResponse = <T>(data: any): ApiResponse<T> => ({
    status: 'success',
    data,
    user: data.user
  });
  
  export const createErrorResponse = (error: ApiError): ApiResponse<any> => ({
    status: 'error',
    error,
    user: undefined
  });