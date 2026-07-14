import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/features/auth/api';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';
import logoBlue from '@/assets/logo-blue.png';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = params.get('token') || '';
  const uid = params.get('uid') || undefined;

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast({ title: 'Invalid link', description: 'This reset link is missing a token.', variant: 'destructive' });
      return;
    }
    if (password !== confirm) {
      toast({ title: 'Passwords don\'t match', variant: 'destructive' });
      return;
    }
    if (password.length < 8) {
      toast({ title: 'Password too short', description: 'Use at least 8 characters.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await authApi.passwordResetConfirm({ token, uid, new_password: password });
      toast({ title: 'Password updated', description: 'You can now sign in with your new password.' });
      navigate('/auth/login', { replace: true });
    } catch (err: any) {
      toast({
        title: 'Reset failed',
        description: err?.response?.data?.error || err?.response?.data?.detail || 'The reset link may be expired.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <img src={logoBlue} alt="SyncFloww" className="h-10 mx-auto mb-6" />
          <h1 className="text-2xl font-semibold">Set a new password</h1>
          <p className="mt-1 text-sm text-muted-foreground">Choose a strong password you haven't used before.</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            <PasswordStrengthIndicator password={password} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Updating…' : 'Update password'}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <Link to="/auth/login" className="text-primary hover:underline">Back to sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
