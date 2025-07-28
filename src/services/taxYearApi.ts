// src/services/taxYearApi.ts
import api from '../utils/api';

type TaxYearResponse = {
 taxYear: number;
}

export const taxYearApi = {
 async get(): Promise<TaxYearResponse> {
   try {
     const response = await api.get("/household/taxYear");
     return response.data;
   } catch (error) {
     console.error("Error fetching tax year:", error);
     throw error;
   }
 },

 async update(taxYear: number): Promise<TaxYearResponse> {
   try {
     const response = await api.post("/household/taxyear", { taxYear });
     return response.data;
   } catch (error) {
     console.error("Error updating tax year:", error);
     throw error;
   }
 }
};