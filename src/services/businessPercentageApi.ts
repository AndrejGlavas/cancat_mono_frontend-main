// src/services/businessPercentageApi.ts
import api from '../utils/api';
import { BusinessPercentageResponse, UpdateBusinessPercentageRequest } from '../utils/types';

export const businessPercentageApi = {
  async get(): Promise<BusinessPercentageResponse> {
    try {
      const response = await api.get("/business-percentage");
      return response.data;
    } catch (error) {
      console.error("Error fetching business percentage:", error);
      throw error;
    }
  },

  async update(businessPercentage: number): Promise<BusinessPercentageResponse> {
    if (businessPercentage < 1 || businessPercentage > 100) {
      throw new Error("Business percentage must be between 1 and 100");
    }

    try {
      const response = await api.post("/business-percentage", { 
        businessPercentage 
      } as UpdateBusinessPercentageRequest);
      return response.data;
    } catch (error) {
      console.error("Error updating business percentage:", error);
      throw error;
    }
  }
};