// src/services/feedbackApi.ts
import api from '../utils/api';

type FeedbackResponse = {
  message: string;
}

type FeedbackData = {
  name: string | undefined;
  accountId: string | undefined;
  feedback: string;
}

export const feedbackApi = {
  async submit(data: FeedbackData): Promise<FeedbackResponse> {
    try {
      const response = await api.post("/feedback", data);
      return response.data;
    } catch (error) {
      console.error("Error submitting feedback:", error);
      throw error;
    }
  }
};