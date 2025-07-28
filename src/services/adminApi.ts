import api from '../utils/api';
import {  HouseholdsResponse, User } from '../types/auth';

interface DeleteUserResponse {
  status: 'success' | 'error';
  message?: string;
}

interface ToggleAdminResponse {
  status: 'success' | 'error';
  data?: User;
  message?: string;
}

interface RecentActivityResponse {
  id: number;
  name: string;
  email: string;
  updatedAt: string;
  transactions: Array<{
    id: number;
    date: string;
    transLogs: Array<{
      id: number;
      timestamp: string;
      action: string;
    }>;
  }>;
}

export const adminApi = {
  async getHouseholds(): Promise<HouseholdsResponse[]> {
    try {
      const response = await api.get("/admin/households");
      return response.data;
    } catch (error) {
      console.error("Error getting households as admin:", error);
      throw error;
    }
  },

  async deleteUser(userId: string | number): Promise<DeleteUserResponse> {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  },

  async toggleAdmin(
    userId: string | number, 
    currentIsAdmin: boolean
  ): Promise<ToggleAdminResponse> {
    try {
      const response = await api.patch(
        `/admin/users/${userId}/toggle-admin`,
        { currentIsAdmin }
      );
      return response.data;
    } catch (error) {
      console.error('Toggle admin failed:', error);
      throw error;
    }
  },

  async getRecentActivity(): Promise<RecentActivityResponse[]> {
    try {
      const response = await api.get("/admin/recent-activity");
      return response.data;
    } catch (error) {
      console.error("Error getting recent activity:", error);
      throw error;
    }
  }
};

export default adminApi;