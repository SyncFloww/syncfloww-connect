import apiClient from '@/lib/apiClient';

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  email_confirmed: boolean;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export const authApi = {
  me: async (): Promise<AuthUser> => {
    const { data } = await apiClient.get('/api/auth/me/');
    return data;
  },
  profile: async (): Promise<AuthUser> => {
    const { data } = await apiClient.get('/api/auth/profile/');
    return data;
  },
  updateProfile: async (payload: Partial<AuthUser>): Promise<AuthUser> => {
    const { data } = await apiClient.put('/api/auth/profile/', payload);
    return data;
  },
  changePassword: async (current_password: string, new_password: string) => {
    const { data } = await apiClient.post('/api/auth/change-password/', {
      current_password,
      new_password,
    });
    return data;
  },
  verifyEmail: async (token: string) => {
    const { data } = await apiClient.post('/api/auth/verify-email/', { token });
    return data;
  },
  passwordResetRequest: async (email: string) => {
    const { data } = await apiClient.post('/api/auth/password-reset/', { email });
    return data;
  },
  passwordResetConfirm: async (payload: {
    token: string;
    uid?: string;
    new_password: string;
  }) => {
    const { data } = await apiClient.post('/api/auth/password-reset/confirm/', payload);
    return data;
  },
  deleteAccount: async () => {
    const { data } = await apiClient.delete('/api/auth/account/');
    return data;
  },
  referralStats: async () => {
    const { data } = await apiClient.get('/api/auth/referral/stats/');
    return data;
  },
  referralValidate: async (code: string) => {
    const { data } = await apiClient.get(`/api/auth/referral/validate/?code=${encodeURIComponent(code)}`);
    return data;
  },
};
