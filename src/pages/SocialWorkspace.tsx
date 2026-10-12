import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/apiClient';
import { useCurrentBrand } from '@/features/core/useCurrentBrand';
import { friendlyError } from './BrandWorkspace';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
type Account = { id: number; name: string; platform: string };
type Post = { id: number; caption: string; status: string; remote_id: string };
type Comment = { id: string; text: string };

export function SocialCallback() {
  const [params] = useSearchParams();
  const [message, setMessage] = useState(params.get('error') ? 'Authorization was declined. Return to social accounts and try again.' : 'Finish connecting the accounts you selected in Meta.');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  async function finish() {
    setBusy(true);
    try {
      const { data } = await api.post('/api/social/meta/callback/', { code: params.get('code'), state: params.get('state') });
      setDone(true); setMessage(`${data.accounts.length} accounts connected. Return to your social workspace.`);
      window.history.replaceState({}, '', '/social/callback');
    } catch (e) { setMessage(friendlyError(e)); } finally { setBusy(false); }
  }
  return <main className="max-w-xl mx-auto p-8 space-y-5"><img src="/Icon.png" alt="Syncflow" className="h-12" /><h1 className="text-2xl font-bold">Connect social accounts</h1><p role="status">{message}</p>{!done && params.get('code') && <Button disabled={busy} onClick={() => void finish()}>{busy ? 'Connecting…' : 'Finish connection'}</Button>}<Button asChild variant="outline"><Link to="/social">Return to social accounts</Link></Button></main>;
}

export default function SocialWorkspace() {
  const brand = useCurrentBrand();
  return <SocialPanel key={brand.workspaceId + ':' + brand.brandId} selection={brand} />;
}
function SocialPanel({ selection }: { selection: ReturnType<typeof useCurrentBrand> }) {
  const { brandId, brands, choose, workspaceId } = selection;
  const [accountId, setAccountId] = useState('');
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const [postId, setPostId] = useState('');
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const accounts = useQuery({ queryKey: ['meta-accounts', workspaceId, brandId], enabled: !!brandId, queryFn: async () => (await api.get<Account[]>(`/api/social/meta/brands/${brandId}/accounts/`)).data });
  const selected = accounts.data?.find(a => String(a.id) === accountId);
  const posts = useQuery({ queryKey: ['meta-posts', workspaceId, brandId, accountId], enabled: !!selected, queryFn: async () => (await api.get<Post[]>(`/api/social/meta/accounts/${accountId}/posts/`)).data });
  const comments = useQuery({ queryKey: ['meta-comments', workspaceId, brandId, postId], enabled: !!postId, retry: false, queryFn: async () => (await api.get<Comment[]>(`/api/social/meta/posts/${postId}/comments/`)).data });
  async function run(action: () => Promise<void>) {
    setBusy(true); setError(''); setNotice('');
    try { await action(); } catch (e) { setError(friendlyError(e)); } finally { setBusy(false); }
  }
  function newDraft() { setCaption(''); setImage(''); setConfirmed(false); setRequestId(crypto.randomUUID()); }
  return <div className="max-w-4xl mx-auto space-y-6"><header><h1 className="text-3xl font-bold">Social accounts & posts</h1><p className="text-muted-foreground mt-2">Connect Facebook Pages and linked Instagram professional accounts. Review each post and reply before sending.</p></header>
    <Label htmlFor="social-brand">Brand</Label><select id="social-brand" disabled={busy} className="border rounded-md p-2 bg-background w-full" value={brandId} onChange={e => choose(e.target.value)}>{brands.map(b => <option key={b.id} value={String(b.id)}>{b.name}</option>)}</select>
    {selection.isError && <p role="alert">Brands could not load. Refresh to retry.</p>}{!brands.length && !selection.isLoading && <Button asChild><Link to="/onboarding">Set up a brand</Link></Button>}
    {error && <p role="alert" className="border border-destructive rounded-lg p-4">{error}</p>}{notice && <p role="status" className="border rounded-lg p-4">{notice}</p>}
    <Card><CardHeader><CardTitle>Connected accounts</CardTitle></CardHeader><CardContent className="space-y-4"><p className="text-sm text-muted-foreground">Meta will ask which Pages to authorise. All authorised Pages and their linked Instagram professional accounts are attached to this brand. A personal Facebook profile is not a publishing target.</p><Button disabled={busy || !brandId} onClick={() => void run(async () => { const { data } = await api.post(`/api/social/meta/brands/${brandId}/accounts/`); window.location.assign(data.url); })}>Connect with Meta</Button>
    {accounts.isError && <p role="alert">{friendlyError(accounts.error)}</p>}{accounts.isLoading && <p>Loading accounts…</p>}{accounts.data?.map(a => <div key={a.id} className="flex flex-wrap items-center gap-3 border rounded-lg p-3"><span className="flex-1">{a.name} · {a.platform}</span><Button variant="outline" disabled={busy} onClick={() => { setAccountId(String(a.id)); setPostId(''); newDraft(); }}>Select</Button><Button variant="ghost" disabled={busy} onClick={() => { if (window.confirm(`Disconnect ${a.name} from this brand?`)) void run(async () => { await api.delete(`/api/social/meta/accounts/${a.id}/`); setAccountId(''); setPostId(''); await accounts.refetch(); }); }}>Disconnect</Button></div>)}{accounts.data?.length === 0 && <p>No accounts connected.</p>}</CardContent></Card>
    {selected && <><Card><CardHeader><CardTitle>Publish to {selected.name}</CardTitle></CardHeader><CardContent className="space-y-4"><Label htmlFor="post-caption">Caption</Label><Textarea id="post-caption" maxLength={2200} rows={5} value={caption} disabled={busy} onChange={e => { setCaption(e.target.value); setConfirmed(false); }} /><Label htmlFor="post-image">Public HTTPS image URL {selected.platform === 'instagram' ? '(required)' : '(optional)'}</Label><Input id="post-image" value={image} disabled={busy} onChange={e => { setImage(e.target.value); setConfirmed(false); }} /><p className="text-sm text-muted-foreground">This release supports Facebook text/image posts and Instagram single-image posts. Videos, scheduling and automatic replies are not enabled.</p><label className="flex gap-2"><input type="checkbox" checked={confirmed} disabled={busy} onChange={e => setConfirmed(e.target.checked)} />I reviewed this content and want it published now.</label><div className="flex gap-3"><Button disabled={busy || !confirmed || !caption.trim()} onClick={() => void run(async () => { const { data } = await api.post(`/api/social/meta/accounts/${accountId}/posts/`, { caption, image_url: image, request_id: requestId, confirm: true }); setNotice(data.status === 'published' ? `Published. Meta post ID: ${data.remote_id}` : 'Sending has not been confirmed. Check the social account before starting a new draft.'); await posts.refetch(); })}>{busy ? 'Working…' : 'Publish now'}</Button><Button variant="outline" disabled={busy} onClick={() => { if (window.confirm('Start a new draft? If the previous send was uncertain, check your social account first.')) newDraft(); }}>New draft</Button></div></CardContent></Card>
    <Card><CardHeader><CardTitle>Posts & comments</CardTitle></CardHeader><CardContent className="space-y-4">{posts.isError && <p role="alert">{friendlyError(posts.error)}</p>}{posts.data?.map(p => <div key={p.id} className="border rounded-lg p-3 space-y-2"><p className="whitespace-pre-wrap">{p.caption}</p><p className="text-sm text-muted-foreground">{p.status} · {p.remote_id || 'No confirmed receipt'}</p>{p.status === 'published' && <Button variant="outline" disabled={busy} onClick={() => { setPostId(String(p.id)); setReplies({}); setSent({}); }}>View comments</Button>}</div>)}{postId && <><Button variant="outline" disabled={busy || comments.isFetching} onClick={() => void comments.refetch()}>Refresh comments</Button><p className="text-sm text-muted-foreground">Shows the first 50 comments on the selected post. AI drafts share comment text with your configured AI provider. Review before sending.</p>{comments.isError && <p role="alert">{friendlyError(comments.error)}</p>}{comments.data?.length === 0 && <p>No comments found.</p>}{comments.data?.map(c => <div key={c.id} className="border rounded-lg p-4 space-y-3"><p>{c.text}</p><Label htmlFor={`reply-${c.id}`}>Your reply</Label><Textarea id={`reply-${c.id}`} maxLength={2000} value={replies[c.id] || ''} disabled={busy || sent[c.id]} onChange={e => setReplies(old => ({ ...old, [c.id]: e.target.value }))} /><div className="flex gap-3"><Button variant="outline" disabled={busy || sent[c.id]} onClick={() => void run(async () => { const { data } = await api.post(`/api/social/brands/${brandId}/assistant/`, { mode: 'conversation', message: `Draft a concise public reply to this comment. Return only the proposed reply. Do not invent facts or promise actions. Comment: ${c.text.slice(0, 2000)}` }); setReplies(old => ({ ...old, [c.id]: data.reply.slice(0, 2000) })); })}>Draft with AI</Button><Button disabled={busy || sent[c.id] || !replies[c.id]?.trim()} onClick={() => { if (window.confirm('Send this reviewed reply publicly?')) void run(async () => { await api.post(`/api/social/meta/posts/${postId}/comments/`, { comment_id: c.id, text: replies[c.id], confirm: true }); setSent(old => ({ ...old, [c.id]: true })); setNotice('Reply sent.'); }); }}>{sent[c.id] ? 'Sent' : 'Send reviewed reply'}</Button></div></div>)}</>}</CardContent></Card></>}
  </div>;
}
