// src/services/rulesApi.ts
import api from '../utils/api';
import { ApiError } from '../utils/types';
import { AxiosError } from 'axios';

export type Rule = {
  id: number;
  label: string;
  nickname: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

type RulesResponse = {
  status: 'success' | 'error';
  data?: Rule[];
  error?: ApiError;
};

export const rulesApi = {
  async getAll(): Promise<RulesResponse> {
    try {
      const response = await api.get("/rules");
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error("Error fetching rules:", error);
      const apiError: ApiError = {
        message: error instanceof AxiosError 
          ? error.response?.data?.error?.message || 'Failed to fetch rules'
          : 'Failed to fetch rules',
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
  },

  async delete(ruleId: number): Promise<RulesResponse> {
    try {
      const response = await api.delete(`/rules/${ruleId}`);
      return {
        status: 'success',
        data: response.data
      };
    } catch (error) {
      console.error("Error deleting rule:", error);
      const apiError: ApiError = {
        message: error instanceof AxiosError 
          ? error.response?.data?.error?.message || 'Failed to delete rule'
          : 'Failed to delete rule',
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
  }
};