import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/apiClient';

interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  email_confirmed: boolean;
  created_at: string;
}

interface AuthTokens {
  access: string;
  refresh: string;
}

interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const response = await apiClient.get('/api/users/auth/me/');
        setUser(response.data);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();

    // Re-check auth when AuthCallback stores tokens after social login
    const handleAuthUpdate = () => checkAuth();
    window.addEventListener('auth-updated', handleAuthUpdate);
    // Also re-check on storage changes (multi-tab support)
    window.addEventListener('storage', handleAuthUpdate);

    return () => {
      window.removeEventListener('auth-updated', handleAuthUpdate);
      window.removeEventListener('storage', handleAuthUpdate);
    };
  }, [checkAuth]);


  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const response = await apiClient.post<AuthResponse>('/api/users/auth/register/', {
        email,
        password,
        password_confirm: password,
        full_name: fullName || '',
      });

      const { user, tokens } = response.data;

      // Store tokens
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);

      setUser(user);

      return { error: null };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.email?.[0] || error.response?.data?.password?.[0] || 'Registration failed'
        }
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.post<AuthResponse>('/api/users/auth/login/', {
        email,
        password,
      });

      const { user, tokens } = response.data;

      // Store tokens
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);

      setUser(user);

      return { error: null };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.error || 'Login failed'
        }
      };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const response = await apiClient.get('/api/users/auth/google/');
      if (response.data?.redirect_url) {
        window.location.href = response.data.redirect_url;
        return { error: null };
      }
      // If the backend returns tokens directly
      if (response.data?.tokens) {
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
        setUser(response.data.user);
        return { error: null };
      }
      return { error: { message: 'Google sign-in is not configured on the server.' } };
    } catch (error: any) {
      return {
        error: { message: error.response?.data?.error || 'Google sign-in failed' }
      };
    }
  };

  const signInWithFacebook = async () => {
    try {
      const response = await apiClient.get('/api/users/auth/facebook/');
      if (response.data?.redirect_url) {
        window.location.href = response.data.redirect_url;
        return { error: null };
      }
      if (response.data?.tokens) {
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
        setUser(response.data.user);
        return { error: null };
      }
      return { error: { message: 'Facebook sign-in is not configured on the server.' } };
    } catch (error: any) {
      return {
        error: { message: error.response?.data?.error || 'Facebook sign-in failed' }
      };
    }
  };

  const signInWithApple = async () => {
    try {
      const response = await apiClient.get('/api/users/auth/apple/');
      if (response.data?.redirect_url) {
        window.location.href = response.data.redirect_url;
        return { error: null };
      }
      if (response.data?.tokens) {
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
        setUser(response.data.user);
        return { error: null };
      }
      return { error: { message: 'Apple sign-in is not configured on the server.' } };
    } catch (error: any) {
      return {
        error: { message: error.response?.data?.error || 'Apple sign-in failed' }
      };
    }
  };

  const signOut = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');

      if (refreshToken) {
        await apiClient.post('/api/users/auth/logout/', {
          refresh_token: refreshToken,
        });
      }

      // Clear tokens and user state
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);

      return { error: null };
    } catch (error: any) {
      // Even if logout fails on server, clear local state
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);

      return {
        error: {
          message: error.response?.data?.error || 'Logout failed'
        }
      };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await apiClient.post('/api/users/auth/password-reset/', {
        email,
      });

      return { error: null };
    } catch (error: any) {
      return {
        error: {
          message: error.response?.data?.error || 'Password reset failed'
        }
      };
    }
  };

  return {
    user,
    session: user ? { user } : null,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithFacebook,
    signInWithApple,
    signOut,
    resetPassword,
  };
};
