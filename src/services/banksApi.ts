// src/services/banksApi.ts
import api from '../utils/api';
import { BankResponse, BanksListResponse, AddBankRequest } from '../utils/types';

export const banksApi = {
  async getAll(): Promise<BanksListResponse> {
    try {
      const response = await api.get("/banks");
      return response.data;
    } catch (error) {
      console.error("Error fetching banks:", error);
      throw error;
    }
  },

  async add(bankName: string, isCustomBank: boolean): Promise<BankResponse> {
    try {
      const response = await api.post("/banks", {
        bankName,
        isCustomBank
      } as AddBankRequest);
      return response.data;
    } catch (error) {
      console.error("Error adding bank:", error);
      throw error;
    }
  },

  async delete(bankId: number): Promise<BankResponse> {
    try {
      const response = await api.delete(`/banks/${bankId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting bank:", error);
      throw error;
    }
  }
};