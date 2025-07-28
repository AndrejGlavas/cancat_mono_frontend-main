import api from '../utils/api';
import { 
  SampleDataStatus,
  UploadTestDataResponse,
  UploadFile,
  UploadCSVResponse 
} from '../utils/types';
import { ApiError, ApiResponse } from '../types/auth';
import { AxiosError } from 'axios';

export const uploadApi = {
  async uploadCSV(
    file: File,
    bankId: number,
    accountType: string,
    transactionType: string
  ): Promise<ApiResponse<UploadCSVResponse>> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bankId", bankId.toString());
      formData.append("accountType", accountType);
      formData.append("transactionType", transactionType);
      
      const response = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return { status: 'success', data: response.data, user: response.data.user };
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof AxiosError 
          ? error.response?.data?.error?.message || 'Failed to upload CSV'
          : 'Failed to upload CSV',
        details: error instanceof AxiosError 
          ? error.response?.data?.error?.details 
          : undefined,
        code: error instanceof AxiosError 
          ? error.response?.data?.code 
          : undefined
      };

      return { status: 'error', error: apiError };
    }
  },

  validateCSVFile(file: File): string | null {
    if (!file) return 'No file selected';
    if (!file.name.toLowerCase().endsWith('.csv')) return 'Only CSV files are allowed';
    if (file.size > 10 * 1024 * 1024) return 'File size must be less than 10MB';
    return null;
  },

  async loadTestData(): Promise<ApiResponse<UploadTestDataResponse>> {
    try {
      const response = await api.post('/upload/load-test-data');
      return { status: 'success', data: response.data, user: response.data.user };
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof AxiosError 
          ? error.response?.data?.error?.message || 'Failed to load test data'
          : 'Failed to load test data',
        details: error instanceof AxiosError 
          ? error.response?.data?.error?.details 
          : undefined,
        code: error instanceof AxiosError 
          ? error.response?.data?.code 
          : undefined
      };
      return { status: 'error', error: apiError };
    }
  },

  async clearTestData(): Promise<ApiResponse<UploadTestDataResponse>> {
    try {
      const response = await api.post('/upload/clear-test-data');
      return { status: 'success', data: response.data, user: response.data.user };
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof AxiosError 
          ? error.response?.data?.error?.message || 'Failed to clear test data'
          : 'Failed to clear test data',
        details: error instanceof AxiosError 
          ? error.response?.data?.error?.details 
          : undefined,
        code: error instanceof AxiosError 
          ? error.response?.data?.code 
          : undefined
      };
      return { status: 'error', error: apiError };
    }
  },

  async getSampleDataStatus(): Promise<ApiResponse<SampleDataStatus>> {
    try {
      const response = await api.get('/upload/sample-data-status');
      return { status: 'success', data: response.data, user: response.data.user };
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof AxiosError 
          ? error.response?.data?.error?.message || 'Failed to check sample data status'
          : 'Failed to check sample data status',
        details: error instanceof AxiosError 
          ? error.response?.data?.error?.details 
          : undefined,
        code: error instanceof AxiosError 
          ? error.response?.data?.code 
          : undefined
      };
      return { status: 'error', error: apiError };
    }
  },

  async delete(id: number): Promise<ApiResponse<null>> {
    try {
      await api.delete(`/uploadslist/${id}`);
      return { status: 'success', data: null };
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof AxiosError 
          ? error.response?.data?.error?.message || 'Failed to delete upload'
          : 'Failed to delete upload',
        details: error instanceof AxiosError 
          ? error.response?.data?.error?.details 
          : undefined,
        code: error instanceof AxiosError 
          ? error.response?.data?.code 
          : undefined
      };
      return { status: 'error', error: apiError };
    }
  },

  async getAll(): Promise<ApiResponse<UploadFile[]>> {
    try {
      const response = await api.get('/uploadslist');
      return { status: 'success', data: response.data.data };
    } catch (error) {
      const apiError: ApiError = {
        message: error instanceof AxiosError 
          ? error.response?.data?.error?.message || 'Failed to fetch uploads'
          : 'Failed to fetch uploads',
        details: error instanceof AxiosError 
          ? error.response?.data?.error?.details 
          : undefined,
        code: error instanceof AxiosError 
          ? error.response?.data?.code 
          : undefined
      };
      return { status: 'error', error: apiError };
    }
  }
};
