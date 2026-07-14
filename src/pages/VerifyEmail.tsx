import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '@/features/auth/api';
import logoBlue from '@/assets/logo-blue.png';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState<string>('');
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the link.');
      return;
    }
    authApi
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setMessage(
          err?.response?.data?.error ||
            err?.response?.data?.detail ||
            'This verification link is invalid or has expired.',
        );
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center space-y-6">
        <img src={logoBlue} alt="SyncFloww" className="h-10 mx-auto" />
        {status === 'pending' && (
          <div className="space-y-3">
            <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
            <h1 className="text-xl font-semibold">Verifying your email…</h1>
          </div>
        )}
        {status === 'success' && (
          <div className="space-y-3">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
            <h1 className="text-2xl font-semibold">Email verified</h1>
            <p className="text-sm text-muted-foreground">Your email has been confirmed. You can now sign in.</p>
            <Button asChild className="w-full">
              <Link to="/auth/login">Continue to sign in</Link>
            </Button>
          </div>
        )}
        {status === 'error' && (
          <div className="space-y-3">
            <XCircle className="h-12 w-12 mx-auto text-destructive" />
            <h1 className="text-2xl font-semibold">Verification failed</h1>
            <p className="text-sm text-muted-foreground">{message}</p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/auth/login">Back to sign in</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
