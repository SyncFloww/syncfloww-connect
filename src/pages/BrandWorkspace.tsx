import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/apiClient';
import { useCurrentBrand } from '@/features/core/useCurrentBrand';
import { VoiceInput } from '@/features/core/VoiceInput';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
interface Message { id: number; role: string; content: string }
interface Reference { id: number; title: string; content: string }
export default function BrandWorkspace() {
  const { currentWorkspace } = useWorkspace();
  return <BrandWorkspaceContent key={currentWorkspace?.id || "none"} />;
}
function BrandWorkspaceContent() {
  const { brands, brand, brandId, choose, isError } = useCurrentBrand();
  const qc = useQueryClient();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [consent, setConsent] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [removeId, setRemoveId] = useState<number | null>(null);
  const [clearChat, setClearChat] = useState(false);
  const base = `/api/social/brands/${brandId}`;
  const chat = useQuery({ queryKey: ['conversation', brandId], enabled: !!brandId, queryFn: async () => (await api.get<Message[]>(base + '/assistant/')).data });
  const docs = useQuery({ queryKey: ['references', brandId], enabled: !!brandId, queryFn: async () => (await api.get<Reference[]>(base + '/knowledge/')).data });
  async function send(mode = 'conversation') {
    if (busy || !brandId || (mode === 'conversation' && !message.trim())) return;
    setBusy(true); setError('');
    try {
      await api.post(base + '/assistant/', { message: mode === 'strategy' ? 'Create a practical seven-day content plan for my saved brand and goal. Ask for missing information when necessary.' : message, mode });
      setMessage(''); await qc.invalidateQueries({ queryKey: ['conversation', brandId] });
    } catch (e: unknown) { setError(friendlyError(e)); } finally { setBusy(false); }
  }
  async function upload(event: React.FormEvent) {
    event.preventDefault(); if (!file || !consent || busy) return;
    if (file.size > 2 * 1024 * 1024) { setError('Choose a document no larger than 2 MB.'); return; }
    setBusy(true); setError('');
    try {
      const data = new FormData(); data.append('file', file); data.append('consent', 'true');
      await api.post(base + '/documents/', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFile(null); await qc.invalidateQueries({ queryKey: ['references', brandId] });
    } catch (e: unknown) { setError(friendlyError(e)); } finally { setBusy(false); }
  }
  async function remove() {
    if (removeId === null || busy) return;
    setBusy(true); setError('');
    try { await api.delete(base + '/documents/' + removeId + '/'); setRemoveId(null); await qc.invalidateQueries({ queryKey: ['references', brandId] }); }
    catch (e: unknown) { setError(friendlyError(e)); } finally { setBusy(false); }
  }
  return <div className="mx-auto max-w-6xl p-4 sm:p-8 space-y-6">
    <header><p className="text-sm text-primary font-medium">Your brand, understood</p><h1 className="text-3xl font-bold mt-2">Brand assistant</h1><p className="mt-2 text-muted-foreground">Explore ideas, clarify your positioning, and build a plan from your saved brand knowledge.</p></header>
    <div className="flex flex-wrap items-end gap-3"><div className="flex-1"><Label htmlFor="assistant-brand">Brand</Label><select id="assistant-brand" className="block w-full border rounded-md bg-background p-2 mt-1" value={brandId} disabled={busy} onChange={e => { choose(e.target.value); setMessage(''); setError(''); setFile(null); setRemoveId(null); setClearChat(false); setConsent(false); }}>{!brands.length && <option value="">Choose a brand</option>}{brands.map(b => <option key={b.id} value={String(b.id)}>{b.name}</option>)}</select></div><Button asChild variant="outline"><Link to="/onboarding">{brandId ? 'Edit brand profile' : 'Set up your brand'}</Link></Button></div>
    {(error || isError || chat.isError || docs.isError) && <p role="alert" className="border border-destructive rounded-lg p-4">{error || 'Some brand information could not load. Refresh to try again.'}</p>}
    {brandId && <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <Card><CardHeader><CardTitle>Talk to Syncflow about {brand?.name}</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="max-h-[480px] min-h-36 overflow-y-auto space-y-4" aria-live="polite" aria-busy={busy}>
          {chat.isLoading && <p>Loading conversation…</p>}
          {!chat.isLoading && !chat.data?.length && <p className="text-muted-foreground">Tell me what you want to achieve, or ask for help defining your audience and brand voice.</p>}
          {chat.data?.map(m => <article key={m.id} className={`rounded-xl p-4 ${m.role === 'user' ? 'bg-primary/10 ml-6' : 'bg-muted mr-6'}`}><p className="text-xs font-semibold mb-2">{m.role === 'user' ? 'You' : 'Syncflow'}</p><p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p></article>)}
          {busy && <p role="status">Working…</p>}
        </div>
        <form className="space-y-3" onSubmit={e => { e.preventDefault(); void send(); }}><Label htmlFor="brand-message">Your message</Label><Textarea id="brand-message" value={message} onChange={e => setMessage(e.target.value)} rows={4} maxLength={4000} disabled={busy} required placeholder="Help me find the right content angle for my business…" /><VoiceInput key={brandId} disabled={busy} onText={text => setMessage(old => (old + ' ' + text).trim().slice(0, 4000))} /><div className="flex flex-wrap gap-2"><Button disabled={busy || !message.trim()} type="submit">Send message</Button><Button disabled={busy} type="button" variant="outline" onClick={() => void send('strategy')}>Build a seven-day plan</Button></div></form>
        <p className="text-xs text-muted-foreground">Saved brand details, recent conversation and reference excerpts are shared with the configured AI provider. Suggestions need your review; they do not publish or change your profile automatically.</p>
        {!clearChat ? <Button variant="ghost" size="sm" disabled={busy || !chat.data?.length} onClick={() => setClearChat(true)}>Clear conversation</Button> : <div className="flex gap-2"><Button variant="destructive" disabled={busy} onClick={async () => { setBusy(true); try { await api.delete(base + '/assistant/'); await qc.invalidateQueries({ queryKey: ['conversation', brandId] }); setClearChat(false); } catch (e) { setError(friendlyError(e)); } finally { setBusy(false); } }}>Confirm delete conversation</Button><Button variant="outline" onClick={() => setClearChat(false)}>Cancel</Button></div>}
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Brand references</CardTitle></CardHeader><CardContent className="space-y-5"><p className="text-sm text-muted-foreground">Add product notes, FAQs or a brand guide. We store extracted text; the original file is not retained. Up to 20 references, 2 MB each.</p>
        <form onSubmit={upload} className="space-y-3"><Label htmlFor="brand-document">TXT, Markdown, PDF or DOCX</Label><input id="brand-document" type="file" accept=".txt,.md,.pdf,.docx" disabled={busy} onChange={e => setFile(e.target.files?.[0] || null)} className="block w-full text-sm" /><label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />I have permission to use this document as AI brand context.</label><Button disabled={busy || !file || !consent} type="submit">Upload and save reference</Button></form>
        {docs.data?.map(d => <details key={d.id} className="rounded-lg border p-3"><summary className="cursor-pointer font-medium">{d.title}</summary><p className="text-xs whitespace-pre-wrap mt-3 max-h-48 overflow-y-auto">{d.content}</p><Button size="sm" variant="ghost" disabled={busy} onClick={() => setRemoveId(d.id)}>Delete reference</Button></details>)}
        {removeId !== null && <div role="alert"><p className="text-sm">Delete this saved reference? Existing generated content will remain.</p><Button variant="destructive" size="sm" disabled={busy} onClick={() => void remove()}>Delete</Button><Button variant="ghost" size="sm" onClick={() => setRemoveId(null)}>Cancel</Button></div>}
      </CardContent></Card>
    </div>}
  </div>;
}
export function friendlyError(error: unknown): string {
  const value = error as { response?: { status?: number; data?: { detail?: string } | string[] } };
  const data = value.response?.data;
  if (Array.isArray(data)) return data.join(' ');
  if (data && typeof data === 'object' && typeof data.detail === 'string') return data.detail;
  return value.response?.status === 403 ? 'Your role does not allow this action.' : 'This request could not be completed. Please try again.';
}
