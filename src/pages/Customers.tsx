import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useCurrentBrand } from '@/features/core/useCurrentBrand';
import api from '@/lib/apiClient';
import { friendlyError } from './BrandWorkspace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
interface Lead { id: number; name: string; email: string; source: string; note: string; consent_at: string }
export default function Customers() {
  const { currentWorkspace } = useWorkspace();
  return <CustomerList key={currentWorkspace?.id || 'none'} />;
}
function CustomerList() {
  const { brands, brandId, choose } = useCurrentBrand();
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState('');
  const [note, setNote] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [remove, setRemove] = useState<number | null>(null);
  const base = `/api/social/brands/${brandId}/leads/`;
  const leads = useQuery({ queryKey: ['brand-leads', brandId], enabled: !!brandId, queryFn: async () => (await api.get<Lead[]>(base)).data });
  async function save(event: React.FormEvent) {
    event.preventDefault(); if (!consent || busy || !brandId) return;
    setBusy(true); setError(''); setFeedback('');
    try { await api.post(base, { name, email, source, note, consent }); setName(''); setEmail(''); setSource(''); setNote(''); setConsent(false); setFeedback('Contact saved. No message has been sent.'); await qc.invalidateQueries({ queryKey: ['brand-leads', brandId] }); }
    catch (e) { setError(friendlyError(e)); } finally { setBusy(false); }
  }
  return <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6"><header><h1 className="text-3xl font-bold">Customers & leads</h1><p className="text-muted-foreground mt-2">Keep contacts who have agreed to hear from your brand, with a record of where they came from.</p></header>
    <div><Label htmlFor="customer-brand">Brand</Label><select id="customer-brand" className="block w-full border rounded-md p-2 bg-background mt-1" value={brandId} disabled={busy} onChange={e => { choose(e.target.value); setRemove(null); setConsent(false); setError(''); setFeedback(''); }}>{!brands.length && <option value="">Set up a brand first</option>}{brands.map(b => <option key={b.id} value={String(b.id)}>{b.name}</option>)}</select></div>
    {(error || leads.isError) && <p role="alert" className="border border-destructive rounded-lg p-4">{error || 'Contacts could not be loaded. Brand managers can access this list.'}</p>}{feedback && <p role="status">{feedback}</p>}
    <div className="grid lg:grid-cols-[320px_1fr] gap-6"><Card><CardHeader><CardTitle>Add a contact</CardTitle></CardHeader><CardContent><form onSubmit={save} className="space-y-4"><div><Label htmlFor="lead-name">Name</Label><Input id="lead-name" required maxLength={255} value={name} onChange={e => setName(e.target.value)} disabled={busy} /></div><div><Label htmlFor="lead-email">Email</Label><Input id="lead-email" required type="email" maxLength={254} value={email} onChange={e => setEmail(e.target.value)} disabled={busy} /></div><div><Label htmlFor="lead-source">Source and consent details</Label><Input id="lead-source" required maxLength={255} value={source} onChange={e => setSource(e.target.value)} disabled={busy} placeholder="Website signup, 4 October; agreed to product follow-up" /></div><div><Label htmlFor="lead-note">Notes</Label><Textarea id="lead-note" maxLength={2000} value={note} onChange={e => setNote(e.target.value)} disabled={busy} /></div><label className="flex gap-3 text-sm"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} disabled={busy} /><span>This person agreed to be contacted by this brand for the purpose recorded above.</span></label><Button type="submit" disabled={busy || !brandId || !consent}>{busy ? 'Saving…' : 'Save contact'}</Button><p className="text-xs text-muted-foreground">Adding a contact does not send an email or start an automated campaign.</p></form></CardContent></Card>
    <Card><CardHeader><CardTitle>Saved contacts</CardTitle></CardHeader><CardContent className="space-y-4">{leads.isLoading && <p role="status">Loading…</p>}{leads.data?.length === 0 && <p className="text-muted-foreground">Contacts you save will appear here.</p>}{leads.data?.map(lead => <article key={lead.id} className="border rounded-lg p-4 space-y-2"><h2 className="font-semibold">{lead.name}</h2><p className="break-all">{lead.email}</p><p className="text-sm text-muted-foreground">Source: {lead.source}</p><p className="text-xs text-muted-foreground">Consent recorded: {new Date(lead.consent_at).toLocaleString()}</p>{lead.note && <p className="text-sm whitespace-pre-wrap">{lead.note}</p>}{remove !== lead.id ? <Button variant="ghost" disabled={busy} onClick={() => setRemove(lead.id)}>Delete contact</Button> : <div className="flex gap-2"><Button variant="destructive" disabled={busy} onClick={async () => { setBusy(true); try { await api.delete(base + lead.id + '/'); setRemove(null); await qc.invalidateQueries({ queryKey: ['brand-leads', brandId] }); } catch (e) { setError(friendlyError(e)); } finally { setBusy(false); } }}>Confirm delete</Button><Button variant="outline" onClick={() => setRemove(null)}>Cancel</Button></div>}</article>)}{leads.data?.length === 500 && <p className="text-sm">Showing the most recent 500 contacts.</p>}</CardContent></Card></div>
  </div>;
}
