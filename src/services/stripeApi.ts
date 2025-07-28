// src/services/stripeApi.ts
import api from '../utils/api';

type PrePurchaseResponse = {
  status: 'success';
}

type SessionResponse = {
  url: string;
  sessionId: string;
}

type SessionStatusResponse = {
  status: string;
  paymentRecord: {
    paymentStatus: string;
    amount: number;
    currency: string;
    paymentDate: string;
  };
}

export const stripeApi = {
  async prePurchase(): Promise<PrePurchaseResponse> {
    try {
      const response = await api.post("/stripe/pre-purchase");
      return response.data;
    } catch (error) {
      console.error("Error in stripe pre-purchase:", error);
      throw error;
    }
  },

  async createSession(): Promise<SessionResponse> {
    try {
      const response = await api.post("/stripe/create-session");
      return response.data;
    } catch (error) {
      console.error("Error creating stripe session:", error);
      throw error;
    }
  },

  async getSessionStatus(sessionId: string): Promise<SessionStatusResponse> {
    try {
      const response = await api.get(`/stripe/session/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting stripe session status:", error);
      throw error;
    }
  }
};