import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/apiClient';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential?: string }) => void; auto_select?: boolean; cancel_on_tap_outside?: boolean }) => void;
          prompt: (listener?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
        };
      };
    };
  }
}

const GOOGLE_IDENTITY_SCRIPT = 'https://accounts.google.com/gsi/client';

function loadGoogleIdentity(): Promise<void> {
  if (window.google?.accounts.id) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_IDENTITY_SCRIPT}"]`);
    const script = existingScript ?? document.createElement('script');
    script.src = GOOGLE_IDENTITY_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = () => window.google?.accounts.id ? resolve() : reject(new Error('Google Identity Services did not load.'));
    script.onerror = () => reject(new Error('Unable to load Google Identity Services.'));
    if (!existingScript) document.head.appendChild(script);
  });
}

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
        const response = await apiClient.get('/api/auth/me/');
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


  const signUp = async (
    email: string,
    password: string,
    confirmPassword: string,
    firstName: string,
    lastName: string,
    referralCode?: string,
  ) => {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/register/', {
        email,
        password,
        confirm_password: confirmPassword,
        first_name: firstName,
        last_name: lastName,
        referral_code: referralCode || '',
      });

      const { user, tokens } = response.data;

      // Store tokens
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      window.dispatchEvent(new Event('auth-updated'));

      setUser(user);

      return { error: null };
    } catch (error: any) {
      const data = error.response?.data;
      const message =
        data?.first_name?.[0] ||
        data?.last_name?.[0] ||
        data?.email?.[0] ||
        data?.password?.[0] ||
        data?.confirm_password?.[0] ||
        data?.referral_code?.[0] ||
        data?.detail ||
        'Registration failed';
      return { error: { message } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.post<AuthResponse>('/api/auth/login/', {
        email,
        password,
      });

      const { user, tokens } = response.data;

      // Store tokens
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      window.dispatchEvent(new Event('auth-updated'));

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

  const signInWithGoogle = async (_referralCode?: string) => {
    try {
      // The client ID is public. Prefer an explicit frontend setting, then use
      // the backend configuration so deployments only need to manage it once.
      let clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        const { data } = await apiClient.get('/api/auth/google/');
        clientId = data.client_id;
      }
      if (!clientId) {
        return { error: { message: 'Google sign-in is not configured for this site.' } };
      }

      await loadGoogleIdentity();
      const result = await new Promise<{ token: string }>((resolve, reject) => {
        window.google!.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => response.credential
            ? resolve({ token: response.credential })
            : reject(new Error('Google did not return a sign-in token.')),
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        window.google!.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            reject(new Error('Google sign-in prompt was not displayed.'));
          }
        });
      });

      const { data } = await apiClient.post('/api/auth/google/', result);
      localStorage.setItem('access_token', data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh);
      window.dispatchEvent(new Event('auth-updated'));
      setUser(data.user);
      return { error: null };
    } catch (error: any) {
      return {
        error: { message: error.response?.data?.message || error.response?.data?.error || error.message || 'Google sign-in failed' }
      };
    }
  };

  const signInWithFacebook = async (referralCode?: string) => {
    try {
      const refParam = referralCode ? `&ref=${encodeURIComponent(referralCode)}` : '';
      const response = await apiClient.get(`/api/auth/facebook/?origin=${encodeURIComponent(window.location.origin)}${refParam}`);
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
      const response = await apiClient.get('/api/auth/apple/');
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
        await apiClient.post('/api/auth/logout/', {
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
      await apiClient.post('/api/auth/password-reset/', {
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
