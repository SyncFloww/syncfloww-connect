import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, Activity } from 'lucide-react';
import apiClient from '@/lib/apiClient';

interface ConnectedAccountInfo {
  id: number;
  platform: string;
  username: string;
  display_name: string;
  profile_image_url: string;
  brand_name: string;
  status: string;
  capabilities: string[];
}

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const handledRef = useRef(false);

  const [isLoading, setIsLoading] = useState(true);
  const [socialSuccess, setSocialSuccess] = useState<ConnectedAccountInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const provider = searchParams.get('provider') || 'instagram';

    const access = searchParams.get('access');
    const refresh = searchParams.get('refresh');
    const error = searchParams.get('error');

    // Scenario 1: Social Account OAuth Callback (Code + State)
    if (code && state) {
      apiClient.post(`/api/social/oauth/${provider}/callback/`, {
        code,
        state,
        provider,
        redirect_uri: window.location.origin + window.location.pathname,
      })
      .then(({ data }) => {
        setSocialSuccess(data);
        setIsLoading(false);
        toast({
          title: 'Account Connected! 🎉',
          description: `Successfully linked ${data.username} to ${data.brand_name || 'your Brand'}.`,
        });
      })
      .catch((err: any) => {
        const msg = err.response?.data?.error || 'Failed to complete social account authorization.';
        setErrorMessage(msg);
        setIsLoading(false);
        toast({
          title: 'Connection Failed',
          description: msg,
          variant: 'destructive',
        });
      });
      return;
    }

    // Scenario 2: User Authentication Login Callback
    if (error) {
      setErrorMessage(error);
      setIsLoading(false);
      navigate('/auth', { replace: true });
      return;
    }

    if (access && refresh) {
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      window.dispatchEvent(new Event('auth-updated'));

      apiClient.get('/api/auth/me/')
        .then(() => navigate('/dashboard', { replace: true }))
        .catch(() => navigate('/dashboard', { replace: true }));
      return;
    }

    setIsLoading(false);
  }, [searchParams, navigate, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-base text-foreground font-semibold">Completing OAuth Security Exchange…</p>
          <p className="text-xs text-muted-foreground">Validating cryptographically signed state token & exchanging authorization code.</p>
        </div>
      </div>
    );
  }

  if (socialSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full p-6 rounded-2xl border bg-card shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Social Account Connected!</h2>
            <p className="text-xs text-muted-foreground">
              Your account has been verified and encrypted for <span className="font-semibold text-foreground">{socialSuccess.brand_name || 'Brand'}</span>.
            </p>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-xl border bg-muted/30">
            {socialSuccess.profile_image_url ? (
              <img src={socialSuccess.profile_image_url} alt={socialSuccess.display_name} className="w-12 h-12 rounded-full object-cover border" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                {socialSuccess.username[0]?.toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-sm text-foreground truncate">{socialSuccess.display_name || socialSuccess.username}</h4>
              <p className="text-xs text-muted-foreground truncate">@{socialSuccess.username} · {socialSuccess.platform.toUpperCase()}</p>
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600">
                <Activity className="w-3 h-3" /> Connection Active
              </span>
            </div>
          </div>

          {socialSuccess.capabilities && socialSuccess.capabilities.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Granted Capabilities
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {socialSuccess.capabilities.map((cap) => (
                  <span key={cap} className="px-2.5 py-1 rounded-md border bg-background text-[11px] font-medium text-foreground">
                    {cap.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-col gap-2">
            <Button onClick={() => navigate('/brands')} className="w-full gap-2">
              View Connected Brand <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="w-full text-xs">
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full p-6 rounded-2xl border bg-card shadow-xl space-y-6 text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">Connection Error</h2>
            <p className="text-xs text-destructive bg-destructive/10 p-3 rounded-lg leading-relaxed">{errorMessage}</p>
          </div>
          <Button onClick={() => navigate('/brands')} className="w-full">
            Return to Brand Management
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
