import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useCurrentBrand } from '@/features/core/useCurrentBrand';
import api from '@/lib/apiClient';
import { friendlyError } from './BrandWorkspace';
import { VoiceInput } from '@/features/core/VoiceInput';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
interface Idea { id: number; title: string; hook: string; angle: string; cta: string; platform: string; approved_at: string | null; updated_at: string }
const platforms = ['instagram', 'tiktok', 'youtube', 'linkedin', 'facebook', 'x'];
export default function Ideas() {
  const { currentWorkspace } = useWorkspace();
  return <IdeaLibrary key={currentWorkspace?.id || 'none'} />;
}
function IdeaLibrary() {
  const { brandId, brands, choose, workspaceId, isError } = useCurrentBrand();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [mode, setMode] = useState('generate');
  const [hook, setHook] = useState('');
  const [angle, setAngle] = useState('');
  const [cta, setCta] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [search, setSearch] = useState('');
  const base = `/api/social/brands/${brandId}/ideas/`;
  const refresh = () => qc.invalidateQueries({ queryKey: ['brand-ideas', workspaceId, brandId] });
  const ideas = useQuery({ queryKey: ['brand-ideas', workspaceId, brandId], enabled: !!brandId, queryFn: async () => (await api.get<Idea[]>(base)).data });
  async function create(event: React.FormEvent) {
    event.preventDefault(); if (busy || !brandId) return;
    setBusy(true); setError(''); setFeedback('');
    try {
      if (mode === 'generate') await api.post(base + 'generate/', { topic, platform });
      else await api.post(base, { title: topic, platform, hook, angle, cta });
      setFeedback(mode === 'generate' ? 'Five ideas saved as drafts. Review them before approval.' : 'Your idea was saved as a draft.');
      await refresh();
    } catch (e) { setError(friendlyError(e)); } finally { setBusy(false); }
  }
  return <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-6"><header><h1 className="text-3xl font-bold">Ideas & approval</h1><p className="text-muted-foreground mt-2">Explore an angle, make it accurate, and approve it before turning it into a script.</p></header>
    <div><Label htmlFor="ideas-brand">Brand</Label><select id="ideas-brand" value={brandId} disabled={busy} onChange={e => { choose(e.target.value); setError(''); setFeedback(''); }} className="block border rounded-md p-2 mt-1 bg-background w-full">{!brands.length && <option value="">Set up a brand first</option>}{brands.map(b => <option key={b.id} value={String(b.id)}>{b.name}</option>)}</select></div>
    {(error || isError || ideas.isError) && <p role="alert" className="border border-destructive rounded-lg p-4">{error || 'Could not load your ideas. Refresh to try again.'}</p>}{feedback && <p role="status">{feedback}</p>}
    <Card><CardHeader><CardTitle>Start an idea</CardTitle></CardHeader><CardContent><form onSubmit={create} className="space-y-4 max-w-2xl"><div><Label htmlFor="idea-mode">How would you like to start?</Label><select id="idea-mode" value={mode} onChange={e => setMode(e.target.value)} disabled={busy} className="block border rounded-md p-2 mt-1 bg-background"><option value="generate">Generate five ideas with AI</option><option value="manual">Write my own idea</option></select></div><div><Label htmlFor="idea-topic">{mode === 'generate' ? 'Topic or content objective' : 'Idea title'}</Label><Input id="idea-topic" required maxLength={255} value={topic} disabled={busy} onChange={e => setTopic(e.target.value)} /></div><VoiceInput key={brandId} disabled={busy} onText={text => setTopic(old => (old + ' ' + text).trim().slice(0, 255))} /><div><Label htmlFor="idea-platform">Platform</Label><select id="idea-platform" value={platform} disabled={busy} onChange={e => setPlatform(e.target.value)} className="block border rounded-md p-2 mt-1 bg-background">{platforms.map(p => <option key={p} value={p}>{p}</option>)}</select></div>{mode === 'manual' && <>{[{key:'hook',label:'Opening hook',value:hook,set:setHook,max:2000},{key:'angle',label:'Angle and key points',value:angle,set:setAngle,max:2000},{key:'cta',label:'Call to action',value:cta,set:setCta,max:1000}].map(field => <div key={field.key}><Label htmlFor={'new-'+field.key}>{field.label}</Label><Textarea id={'new-'+field.key} required maxLength={field.max} value={field.value} onChange={e => field.set(e.target.value)} disabled={busy} /></div>)}</>}<Button type="submit" disabled={busy || !brandId}>{busy ? 'Working…' : mode === 'generate' ? 'Generate and save ideas' : 'Save my idea'}</Button>{mode === 'generate' && <p className="text-xs text-muted-foreground">Uses your saved brand details and reference excerpts through the configured AI provider. Suggestions need review.</p>}</form></CardContent></Card>
    <div><Label htmlFor="idea-search">Search loaded ideas</Label><Input id="idea-search" value={search} onChange={e => setSearch(e.target.value)} /></div>{ideas.isLoading && <p role="status">Loading ideas…</p>}{ideas.data?.length === 0 && <p className="text-muted-foreground">Your saved ideas will appear here.</p>}
    <div className="grid md:grid-cols-2 gap-5">{ideas.data?.filter(i => (i.title + ' ' + i.angle).toLowerCase().includes(search.toLowerCase())).map(idea => <IdeaCard key={brandId + ':' + idea.id + ':' + idea.updated_at} idea={idea} base={base} disabled={busy} onBusy={setBusy} onError={setError} refresh={refresh} createScript={async () => {
      setBusy(true); setError('');
      try { const { data } = await api.post('/api/ai/scripts/generate/', { topic: idea.title, idea_id: idea.id, brand: Number(brandId), workspace: Number(workspaceId), platform: idea.platform, duration: 30 }); navigate('/ai-studio?script=' + data.id); }
      catch (e) { setError(friendlyError(e)); } finally { setBusy(false); }
    }} />)}</div>{ideas.data?.length === 200 && <p className="text-sm text-muted-foreground">Showing the most recently updated 200 ideas.</p>}
  </div>;
}
function IdeaCard({ idea, base, disabled, onBusy, onError, refresh, createScript }: { idea: Idea; base: string; disabled: boolean; onBusy: (value: boolean) => void; onError: (value: string) => void; refresh: () => Promise<unknown>; createScript: () => Promise<void> }) {
  const [draft, setDraft] = useState(idea);
  const [dirty, setDirty] = useState(false);
  const [removing, setRemoving] = useState(false);
  async function action(kind: 'save' | 'approve' | 'delete') {
    if (disabled) return;
    onBusy(true); onError('');
    try {
      if (kind === 'save') await api.patch(base + idea.id + '/', { title: draft.title, hook: draft.hook, angle: draft.angle, cta: draft.cta, platform: draft.platform });
      else if (kind === 'approve') await api.post(base + idea.id + '/approve/');
      else await api.delete(base + idea.id + '/');
      await refresh(); setDirty(false);
    } catch (e) { onError(friendlyError(e)); } finally { onBusy(false); }
  }
  return <Card><CardHeader><CardTitle className="text-lg">{idea.title}</CardTitle><p className="text-sm text-muted-foreground">{dirty ? 'Unsaved edits' : idea.approved_at ? 'Approved for script development' : 'Draft · needs review'}</p></CardHeader><CardContent className="space-y-4">{(['title','hook','angle','cta'] as const).map(key => <div key={key}><Label htmlFor={`idea-${idea.id}-${key}`}>{({title:'Title',hook:'Opening hook',angle:'Angle and key points',cta:'Call to action'})[key]}</Label><Textarea id={`idea-${idea.id}-${key}`} required disabled={disabled} maxLength={key === 'title' ? 255 : key === 'cta' ? 1000 : 2000} value={draft[key]} onChange={e => { setDraft({...draft, [key]:e.target.value}); setDirty(true); }} /></div>)}<div><Label htmlFor={`idea-${idea.id}-platform`}>Platform</Label><select id={`idea-${idea.id}-platform`} value={draft.platform} disabled={disabled} className="block border rounded-md p-2 bg-background mt-1" onChange={e => { setDraft({...draft, platform:e.target.value}); setDirty(true); }}>{platforms.map(p => <option key={p} value={p}>{p}</option>)}</select></div><p className="text-xs text-muted-foreground">Check product facts, claims and offers. Saving changes clears approval and requires a fresh review.</p><div className="flex flex-wrap gap-2"><Button disabled={disabled || !dirty} onClick={() => void action('save')}>Save edits</Button><Button variant="outline" disabled={disabled || !dirty} onClick={() => { setDraft(idea); setDirty(false); }}>Discard edits</Button>{!idea.approved_at && <Button variant="outline" disabled={disabled || dirty} onClick={() => void action('approve')}>Approve idea</Button>}<Button disabled={disabled || dirty || !idea.approved_at} onClick={() => void createScript()}>Create 30-second script</Button></div>{!removing ? <Button variant="ghost" disabled={disabled} onClick={() => setRemoving(true)}>Delete idea</Button> : <div className="flex gap-2"><Button variant="destructive" disabled={disabled} onClick={() => void action('delete')}>Confirm delete</Button><Button variant="outline" onClick={() => setRemoving(false)}>Cancel</Button></div>}</CardContent></Card>;
}
