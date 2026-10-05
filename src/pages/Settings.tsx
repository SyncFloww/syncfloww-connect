import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useCurrentBrand } from '@/features/core/useCurrentBrand';
import { friendlyError } from './BrandWorkspace';
import api from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
interface Account { id: number; email: string; first_name: string; last_name: string; profile?: { full_name: string; provider: string } }
export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { brands, brandId, choose } = useCurrentBrand();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [exportConsent, setExportConsent] = useState(false);
  const account = useQuery({ queryKey: ['account-settings', user?.id], enabled: !!user, queryFn: async () => (await api.get<Account>('/api/auth/me/')).data });
  useEffect(() => { if (account.data) setName(account.data.profile?.full_name || [account.data.first_name, account.data.last_name].filter(Boolean).join(' ')); }, [account.data]);
  async function saveName(event: React.FormEvent) {
    event.preventDefault(); if (busy) return;
    setBusy(true); setError(''); setFeedback('');
    try { await api.patch('/api/auth/me/', { full_name: name.trim() }); await account.refetch(); window.dispatchEvent(new Event('auth-updated')); setFeedback('Display name saved.'); }
    catch (e) { setError(friendlyError(e)); } finally { setBusy(false); }
  }
  async function changePassword(event: React.FormEvent) {
    event.preventDefault(); if (busy) return;
    if (password !== confirm) { setError('The new passwords do not match.'); return; }
    setBusy(true); setError(''); setFeedback('');
    try { await api.post('/api/auth/change-password/', { old_password: oldPassword, new_password: password, new_password_confirmation: confirm }); setOldPassword(''); setPassword(''); setConfirm(''); localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token'); window.dispatchEvent(new Event('auth-updated')); toast({ title: 'Password changed', description: 'Sign in again with your new password.' }); navigate('/auth?mode=login'); }
    catch (e) { setError(friendlyError(e)); } finally { setBusy(false); }
  }
  async function exportBrand() {
    if (!brandId || !exportConsent || busy) return;
    setBusy(true); setError(''); setFeedback('');
    try {
      const { data } = await api.get<Blob>(`/api/social/brands/${brandId}/export/`, { responseType: 'blob' });
      const url = URL.createObjectURL(data); const link = document.createElement('a'); link.href = url; link.download = `syncflow-brand-${brandId}.ndjson`; document.body.appendChild(link); link.click(); link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setFeedback('Brand export downloaded. Store it securely; it may contain customer contact details.'); setExportConsent(false);
    } catch (e) { setError(friendlyError(e)); } finally { setBusy(false); }
  }
  return <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-6"><header><h1 className="text-3xl font-bold">Settings & data</h1><p className="text-muted-foreground mt-2">Manage your account, appearance and saved brand information.</p></header>{error && <p role="alert" className="border border-destructive rounded-lg p-4">{error}</p>}{feedback && <p role="status">{feedback}</p>}
    <Card><CardHeader><CardTitle>Your account</CardTitle></CardHeader><CardContent><form onSubmit={saveName} className="space-y-4 max-w-lg">{account.isLoading && <p role="status">Loading account…</p>}{account.isError && <p role="alert">Account details could not be loaded.</p>}<div><Label htmlFor="settings-email">Email</Label><Input id="settings-email" type="email" value={account.data?.email || user?.email || ''} disabled /></div><div><Label htmlFor="settings-name">Display name</Label><Input id="settings-name" maxLength={255} value={name} onChange={e => setName(e.target.value)} disabled={busy || !account.data} /></div><Button type="submit" disabled={busy || !account.data}>Save display name</Button></form></CardContent></Card>
    <Card><CardHeader><CardTitle>Appearance</CardTitle></CardHeader><CardContent><Label htmlFor="settings-theme">Theme</Label><select id="settings-theme" value={theme} onChange={e => setTheme(e.target.value as 'light' | 'dark' | 'system')} className="block border rounded-md p-2 mt-1 bg-background"><option value="system">Follow device setting</option><option value="light">Light</option><option value="dark">Dark</option></select><p className="text-sm text-muted-foreground mt-2">Saved on this device.</p></CardContent></Card>
    <Card><CardHeader><CardTitle>Change password</CardTitle></CardHeader><CardContent>{account.data?.profile?.provider && account.data.profile.provider !== 'email' ? <p className="text-muted-foreground">You use a social sign-in account. Manage that account’s password with its sign-in provider.</p> : <form onSubmit={changePassword} className="max-w-lg space-y-4">{[{id:'current-password',label:'Current password',value:oldPassword,set:setOldPassword,autocomplete:'current-password'},{id:'new-password',label:'New password',value:password,set:setPassword,autocomplete:'new-password'},{id:'confirm-password',label:'Confirm new password',value:confirm,set:setConfirm,autocomplete:'new-password'}].map(field => <div key={field.id}><Label htmlFor={field.id}>{field.label}</Label><Input id={field.id} type="password" required maxLength={128} autoComplete={field.autocomplete} value={field.value} onChange={e => field.set(e.target.value)} disabled={busy} /></div>)}<p className="text-sm text-muted-foreground">Changing your password ends refresh sessions. You will sign in again afterwards.</p><Button type="submit" disabled={busy || !account.data}>Change password</Button></form>}</CardContent></Card>
    <Card><CardHeader><CardTitle>Your brand data</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm text-muted-foreground">Saved profile details, recent conversation and reference excerpts are used by the configured AI service when you request suggestions. Original uploaded documents are not retained; extracted text is saved.</p><div><Label htmlFor="export-brand">Brand to export</Label><select id="export-brand" value={brandId} disabled={busy} onChange={e => { choose(e.target.value); setExportConsent(false); }} className="block border rounded-md p-2 mt-1 bg-background w-full">{!brands.length && <option value="">Set up a brand first</option>}{brands.map(b => <option key={b.id} value={String(b.id)}>{b.name}</option>)}</select></div><p className="text-sm text-muted-foreground">Brand managers can download the core profile, references, conversation, contacts, ideas, scripts and script versions. This export uses JSON records, one per line. It does not include social credentials or unrelated account data.</p><label className="flex items-start gap-3 text-sm"><input type="checkbox" checked={exportConsent} disabled={busy} onChange={e => setExportConsent(e.target.checked)} /><span>I understand this download can contain customer contact details and will keep it secure.</span></label><Button disabled={busy || !brandId || !exportConsent} onClick={() => void exportBrand()}>Download brand data</Button><div className="flex flex-wrap gap-3"><Button asChild variant="outline"><Link to="/assistant">Delete references or clear conversation</Link></Button><Button asChild variant="outline"><Link to="/customers">Manage contact records</Link></Button><Button asChild variant="outline"><Link to="/usage">View usage and limits</Link></Button></div></CardContent></Card>
  </div>;
}
