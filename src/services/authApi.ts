import api from '../utils/api';
import type {
  InvitationsResponse,
  SignupData,
  InvitationData,
  InvitationDetailsResponse,
  HouseholdsResponse,
  MembersResponse,
  AuthResponse,
  ApiResponse,
} from '../types/auth';
import { createSuccessResponse, createErrorResponse } from '../utils/apiHelpers';
import { AxiosError } from 'axios';

const handleApiError = (error: unknown, message: string) => ({
  message: error instanceof AxiosError ? error.response?.data?.message || message : message,
});

export const authApi = {
  async signIn(email: string, password: string) {
    try {
      const res = await api.post('/auth/signin', { email, password });
      return { status: 'success', data: res.data };
    } catch (error) {
      return { status: 'error', error: handleApiError(error, 'Sign in failed') };
    }
  },

  async googleSignIn(credential: string) {
    try {
      const res = await api.post('/auth/google', { credential });
      return { status: 'success', data: res.data };
    } catch (error) {
      return { status: 'error', error: handleApiError(error, 'Google sign in failed') };
    }
  },

  async signUp(data: SignupData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await api.post('/auth/signup', data);
      return createSuccessResponse(response.data);
    } catch (error) {
      return createErrorResponse(handleApiError(error, 'Sign up failed'));
    }
  },

  async googleAcceptInvitation(credential: string): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await api.post('/accept_invitation_signup_google', { credential });
      return createSuccessResponse(response.data);
    } catch (error) {
      return createErrorResponse(handleApiError(error, 'Google invitation sign in failed'));
    }
  },

  async inviteUser(data: InvitationData): Promise<ApiResponse<InvitationsResponse>> {
    try {
      const response = await api.post('/invitations', data);
      return createSuccessResponse(response.data);
    } catch (error) {
      return createErrorResponse(handleApiError(error, 'Failed to send invitation'));
    }
  },

  async getInvitations(): Promise<ApiResponse<InvitationsResponse>> {
    try {
      const response = await api.get('/invitations');
      return createSuccessResponse({
        sentInvitations: response.data.sentInvitations,
        receivedInvitations: response.data.receivedInvitations,
      });
    } catch (error) {
      return createErrorResponse(handleApiError(error, 'Failed to fetch invitations'));
    }
  },

  async getInvitationDetails(id: string): Promise<ApiResponse<InvitationDetailsResponse>> {
    try {
      const response = await api.get(`/invitations/${id}`);
      return createSuccessResponse(response.data);
    } catch (error) {
      return createErrorResponse(handleApiError(error, 'Failed to fetch invitation details'));
    }
  },

  async getInvitationPublicDetails(id: string): Promise<ApiResponse<InvitationDetailsResponse>> {
    try {
      const response = await api.get(`/invitations_public/${id}`);
      return createSuccessResponse(response.data);
    } catch (error) {
      return createErrorResponse(
        handleApiError(error, 'Failed to fetch public invitation details')
      );
    }
  },

  async acceptInvitation(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await api.post(`/invitations/${id}/accept`);
      return createSuccessResponse(response.data);
    } catch (error) {
      return createErrorResponse(handleApiError(error, 'Failed to accept invitation'));
    }
  },

  async rejectInvitation(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await api.post(`/invitations/${id}/reject`);
      return createSuccessResponse(response.data);
    } catch (error) {
      return createErrorResponse(handleApiError(error, 'Failed to reject invitation'));
    }
  },

  async acceptInvitationSignup(data: SignupData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await api.post('/accept_invitation_signup', data);
      return createSuccessResponse(response.data);
    } catch (error) {
      return createErrorResponse(handleApiError(error, 'Failed to accept invitation signup'));
    }
  },

  async getHouseholdsAdmin(): Promise<ApiResponse<HouseholdsResponse[]>> {
    try {
      const response = await api.get('/admin/households');
      return createSuccessResponse(response.data);
    } catch (error) {
      return createErrorResponse(handleApiError(error, 'Failed to get households'));
    }
  },

  async getMembers(): Promise<ApiResponse<MembersResponse[]>> {
    try {
      const response = await api.get('/members');
      return createSuccessResponse(response.data);
    } catch (error) {
      return createErrorResponse(handleApiError(error, 'Failed to get members'));
    }
  },
};

export const {
  signIn,
  signUp,
  googleSignIn,
  googleAcceptInvitation,
  inviteUser,
  getInvitations,
  getInvitationDetails,
  getInvitationPublicDetails,
  acceptInvitation,
  rejectInvitation,
  acceptInvitationSignup,
  getHouseholdsAdmin,
  getMembers,
} = authApi;
