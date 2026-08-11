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
        oauth2: {
          initCodeClient: (config: {
            client_id: string;
            scope: string;
            ux_mode: 'popup';
            callback: (response: { code?: string; error?: string }) => void;
          }) => { requestCode: () => void };
        };
      };
    };
    FB?: {
      init: (config: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void;
      login: (callback: (response: { authResponse?: { accessToken: string } }) => void, options: { scope: string }) => void;
    };
  }
}

const GOOGLE_IDENTITY_SCRIPT = 'https://accounts.google.com/gsi/client';
const FACEBOOK_SDK_SCRIPT = 'https://connect.facebook.net/en_US/sdk.js';
let configuredFacebookAppId: string | undefined;

function loadGoogleIdentity(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_IDENTITY_SCRIPT}"]`);
    const script = existingScript ?? document.createElement('script');
    script.src = GOOGLE_IDENTITY_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = () =>
      window.google?.accounts?.oauth2
        ? resolve()
        : reject(new Error('Google Identity Services did not load.'));
    script.onerror = () => reject(new Error('Unable to load Google Identity Services.'));
    if (!existingScript) document.head.appendChild(script);
  });
}

function loadFacebookSdk(appId: string): Promise<void> {
  const initialize = () => {
    if (!window.FB) {
      throw new Error('Facebook Login did not load.');
    }
    if (configuredFacebookAppId !== appId) {
      window.FB.init({ appId, cookie: true, xfbml: false, version: 'v23.0' });
      configuredFacebookAppId = appId;
    }
  };

  if (window.FB) {
    try {
      initialize();
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${FACEBOOK_SDK_SCRIPT}"]`);
    const script = existingScript ?? document.createElement('script');
    script.src = FACEBOOK_SDK_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      try {
        initialize();
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    script.onerror = () => reject(new Error('Unable to load Facebook Login.'));
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
  tokens?: AuthTokens;
  access?: string;
  refresh?: string;
}

function getAuthTokens(response: AuthResponse): AuthTokens {
  const tokens = response.tokens ?? (
    response.access && response.refresh
      ? { access: response.access, refresh: response.refresh }
      : undefined
  );

  if (!tokens) {
    throw new Error('The server did not return authentication tokens.');
  }

  return tokens;
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

      const { user } = response.data;
      const tokens = getAuthTokens(response.data);

      // Store tokens
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      window.dispatchEvent(new Event('auth-updated'));

      setUser(user);

      return { error: null };
    } catch (error: any) {
      const data = error.response?.data;
      const message =
        data?.error ||
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

      const { user } = response.data;
      const tokens = getAuthTokens(response.data);

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
      // Get client_id from backend if not set in env
      let clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        const { data } = await apiClient.get('/api/auth/google/');
        clientId = data.client_id;
      }
      if (!clientId) {
        return { error: { message: 'Google sign-in is not configured for this site.' } };
      }

      await loadGoogleIdentity();

      // Use the OAuth 2.0 Code flow (popup mode) — works in Edge, incognito,
      // and all browsers that block Google One Tap (which needs 3rd-party cookies).
      const authCode = await new Promise<string>((resolve, reject) => {
        const client = window.google!.accounts.oauth2.initCodeClient({
          client_id: clientId,
          scope: 'openid email profile',
          ux_mode: 'popup',
          callback: (response) => {
            if (response.code) {
              resolve(response.code);
            } else {
              reject(new Error(response.error || 'Google sign-in was cancelled.'));
            }
          },
        });
        client.requestCode();
      });

      // Exchange the auth code for tokens on the backend
      const { data } = await apiClient.post('/api/auth/google/', { code: authCode });
      const tokens = getAuthTokens(data);
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      window.dispatchEvent(new Event('auth-updated'));
      setUser(data.user);
      return { error: null };
    } catch (error: any) {
      return {
        error: { message: error.response?.data?.message || error.response?.data?.error || error.message || 'Google sign-in failed' }
      };
    }
  };

  const signInWithFacebook = async (_referralCode?: string) => {
    try {
      const { data: configuration } = await apiClient.get('/api/auth/facebook/');
      if (!configuration.app_id) {
        return { error: { message: 'Facebook sign-in is not configured for this site.' } };
      }

      await loadFacebookSdk(configuration.app_id);
      const accessToken = await new Promise<string>((resolve, reject) => {
        window.FB!.login((response) => {
          const token = response.authResponse?.accessToken;
          if (token) resolve(token);
          else reject(new Error('Facebook sign-in was cancelled or did not return a token.'));
        }, { scope: 'public_profile,email' });
      });

      const { data } = await apiClient.post('/api/auth/facebook/', { access_token: accessToken });
      const tokens = getAuthTokens(data);
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      window.dispatchEvent(new Event('auth-updated'));
      setUser(data.user);
      return { error: null };
    } catch (error: any) {
      return {
        error: { message: error.response?.data?.message || error.response?.data?.error || error.message || 'Facebook sign-in failed' }
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
        const tokens = getAuthTokens(response.data);
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
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
