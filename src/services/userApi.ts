import api from '../utils/api';
import { AxiosError } from 'axios';
import { User } from '../types/auth';

interface ApiError {
  message: string;
  details?: any;
  code?: string;
}

interface ApiResponse {
  status: 'success' | 'error';
  data?: User;
  error?: ApiError;
}

const fetchUser = async (): Promise<ApiResponse> => {
  try {
    const response = await api.get("/users/profile");
    return {
      status: 'success',
      data: response.data
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    const apiError: ApiError = {
      message: error instanceof AxiosError 
        ? error.response?.data?.message || 'Failed to fetch user data'
        : 'Failed to fetch user data',
      details: error instanceof AxiosError 
        ? error.response?.data?.error?.details 
        : undefined,
      code: error instanceof AxiosError 
        ? error.response?.data?.code 
        : undefined
    };
    return {
      status: 'error',
      error: apiError
    };
  }
};

const updateUser = async (name: string | null, picture: string | null): Promise<ApiResponse> => {
  try {
    const response = await api.put("/users/profile", { name, picture });
    return {
      status: 'success',
      data: response.data
    };
  } catch (error) {
    console.error("Error updating user:", error);
    const apiError: ApiError = {
      message: error instanceof AxiosError 
        ? error.response?.data?.error?.message || 'Failed to update user'
        : 'Failed to update user',
      details: error instanceof AxiosError 
        ? error.response?.data?.error?.details 
        : undefined,
      code: error instanceof AxiosError 
        ? error.response?.data?.code 
        : undefined
    };
    return {
      status: 'error',
      error: apiError
    };
  }
};

const updateTerms = async (terms: 'YES' | 'TALK'): Promise<ApiResponse> => {
  try {
    const response = await api.post("/users/terms", { terms });
    return {
      status: 'success',
      data: response.data
    };
  } catch (error) {
    console.error("Error API updating terms details:", error);
    if (error instanceof AxiosError && error.response?.status === 500) {
      return {
        status: 'error',
        error: {
          message: 'Internal server error',
          details: error.response.data,
          code: 'SERVER_ERROR'
        }
      };
    }
    return {
      status: 'error',
      error: {
        message: 'Failed to update terms',
        details: error,
        code: 'UNKNOWN_ERROR'
      }
    };
  }
};

export { fetchUser, updateUser, updateTerms };