import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/apiClient';

/**
 * AuthCallback — handles the redirect from the backend after social OAuth.
 *
 * The Django backend redirects here with:
 *   /auth/callback?access=<jwt>&refresh=<jwt>
 * or on error:
 *   /auth?error=<code>
 *
 * This page stores the tokens, fetches the user profile, then sends
 * the browser to /dashboard.
 */
export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const handledRef = useRef(false); // prevent double-run in React strict mode

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const access = searchParams.get('access');
    const refresh = searchParams.get('refresh');
    const error = searchParams.get('error');

    if (error) {
      const messages: Record<string, string> = {
        google_auth_denied: 'Google sign-in was cancelled.',
        google_token_exchange_failed: 'Google sign-in failed. Please try again.',
        google_profile_fetch_failed: 'Could not retrieve your Google profile.',
        google_no_email: 'Your Google account has no accessible email.',
        facebook_auth_denied: 'Facebook sign-in was cancelled.',
        facebook_token_exchange_failed: 'Facebook sign-in failed. Please try again.',
        facebook_no_email: 'Facebook did not share your email. Please allow email access in Facebook settings.',
        apple_auth_denied: 'Apple sign-in was cancelled.',
        apple_token_decode_failed: 'Apple sign-in failed. Please try again.',
        apple_no_email: 'Apple did not share your email.',
        google_not_configured: 'Google sign-in is not yet set up.',
        facebook_not_configured: 'Facebook sign-in is not yet set up.',
        apple_not_configured: 'Apple sign-in is not yet set up.',
      };

      toast({
        title: 'Sign-In Failed',
        description: messages[error] || 'An unknown error occurred. Please try again.',
        variant: 'destructive',
      });
      navigate('/auth', { replace: true });
      return;
    }

    if (!access || !refresh) {
      toast({
        title: 'Sign-In Failed',
        description: 'Authentication tokens were not received. Please try again.',
        variant: 'destructive',
      });
      navigate('/auth', { replace: true });
      return;
    }

    // Store tokens
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    // Notify useAuth that tokens are now available
    window.dispatchEvent(new Event('auth-updated'));

    // Fetch the user profile to confirm tokens work, then redirect
    apiClient.get('/api/users/auth/me/')
      .then(() => {
        navigate('/dashboard', { replace: true });
      })
      .catch(() => {
        // Tokens were accepted but /me failed — still redirect, app will recover
        navigate('/dashboard', { replace: true });
      });
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <img src="/Icon.png" alt="SyncFloww" className="w-16 h-16 mx-auto animate-pulse" />
        <p className="text-lg text-foreground font-medium">Signing you in…</p>
        <p className="text-sm text-muted-foreground">Please wait a moment</p>
      </div>
    </div>
  );
}
