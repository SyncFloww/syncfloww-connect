import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/apiClient';
import { useCurrentBrand } from '@/features/core/useCurrentBrand';
import { VoiceInput } from '@/features/core/VoiceInput';
import { friendlyError } from './BrandWorkspace';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { AIScript } from '@/services/aiStudioService';
export default function ScriptWorkspace() {
  const { currentWorkspace } = useWorkspace();
  return <ScriptWorkspaceContent key={currentWorkspace?.id || "none"} />;
}
function ScriptWorkspaceContent() {
  const { brands, brandId, workspaceId, choose, isError } = useCurrentBrand();
  const qc = useQueryClient();
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [duration, setDuration] = useState('30');
  const [script, setScript] = useState<AIScript | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const scripts = useQuery({ queryKey: ['scripts', workspaceId, brandId], enabled: !!brandId, queryFn: async () => {
    const { data } = await api.get('/api/ai/scripts/', { params: { workspace: workspaceId, brand: brandId } });
    return (Array.isArray(data) ? data : data.results) as AIScript[];
  } });
  async function generate(event: React.FormEvent) {
    event.preventDefault(); if (busy || !brandId || !topic.trim()) return;
    setBusy(true); setError(''); setFeedback('');
    try { const { data } = await api.post<AIScript>('/api/ai/scripts/generate/', { topic, platform, duration: Number(duration), brand: Number(brandId), workspace: Number(workspaceId) }); setScript(data); setDirty(false); setFeedback('Script generated and saved. Review it before using it.'); await qc.invalidateQueries({ queryKey: ['scripts', workspaceId, brandId] }); }
    catch (e) { setError(friendlyError(e)); } finally { setBusy(false); }
  }
  async function save() {
    if (!script || busy) return;
    setBusy(true); setError('');
    try { const { data } = await api.patch<AIScript>(`/api/ai/scripts/${script.id}/`, { title: script.title, hook: script.hook, body: script.body, cta: script.cta, visual_directions: script.visual_directions, voiceover_text: script.voiceover_text }); setScript(data); setDirty(false); setFeedback('Changes saved as a new version.'); await qc.invalidateQueries({ queryKey: ['scripts', workspaceId, brandId] }); }
    catch (e) { setError(friendlyError(e)); } finally { setBusy(false); }
  }
  const change = (key: keyof AIScript, value: string) => { if (script) { setScript({ ...script, [key]: value }); setDirty(true); setFeedback(''); } };
  const selectClass = 'block w-full rounded-md border bg-background p-2 mt-1';
  return <div className="mx-auto max-w-7xl p-4 sm:p-8 space-y-6">
    <header><p className="text-sm text-primary font-medium">From brand knowledge to content</p><h1 className="text-3xl font-bold mt-2">Scripts & library</h1><p className="text-muted-foreground mt-2">Create a script, refine it, and keep your approved content together.</p></header>
    <div className="flex flex-wrap items-end gap-3"><div className="flex-1"><Label htmlFor="script-brand">Brand</Label><select id="script-brand" className={selectClass} value={brandId} disabled={busy || dirty} onChange={e => { choose(e.target.value); setScript(null); setDeleting(false); setError(''); setFeedback(''); }}>{!brands.length && <option value="">Set up a brand first</option>}{brands.map(b => <option key={b.id} value={String(b.id)}>{b.name}</option>)}</select></div><Button asChild variant="outline"><Link to="/onboarding">Edit brand profile</Link></Button></div>
    {(error || isError || scripts.isError) && <p role="alert" className="border border-destructive rounded-lg p-4">{error || 'Could not load your saved content. Refresh to try again.'}</p>}
    {feedback && <p role="status" className="rounded-lg border p-3">{feedback}</p>}
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="space-y-6"><Card><CardHeader><CardTitle>Create a script</CardTitle></CardHeader><CardContent><form onSubmit={generate} className="space-y-4">
        <div><Label htmlFor="script-topic">What should this script cover?</Label><Textarea id="script-topic" required maxLength={255} rows={4} value={topic} onChange={e => setTopic(e.target.value)} disabled={busy} placeholder="Introduce our new product and invite customers to ask questions…" /></div><VoiceInput key={brandId} disabled={busy} onText={text => setTopic(old => (old + ' ' + text).trim().slice(0, 255))} />
        <div><Label htmlFor="script-platform">Platform</Label><select id="script-platform" value={platform} onChange={e => setPlatform(e.target.value)} className={selectClass}>{['instagram', 'tiktok', 'youtube', 'linkedin', 'facebook'].map(p => <option key={p} value={p}>{p}</option>)}</select></div>
        <div><Label htmlFor="script-duration">Duration</Label><select id="script-duration" value={duration} onChange={e => setDuration(e.target.value)} className={selectClass}>{[15, 30, 60, 120, 240].map(n => <option key={n} value={n}>{n} seconds</option>)}</select></div>
        <p className="text-xs text-muted-foreground">Uses your saved audience, brand voice, goal and reference excerpts. AI output needs review.</p><Button className="w-full" type="submit" disabled={busy || !brandId || dirty}>{busy ? 'Working…' : 'Generate and save'}</Button>
      </form></CardContent></Card>
      <Card><CardHeader><CardTitle>Saved scripts</CardTitle></CardHeader><CardContent className="space-y-3"><Label htmlFor="script-search">Search loaded scripts</Label><Input id="script-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title" />{scripts.isLoading && <p role="status">Loading…</p>}{scripts.data?.filter(s => s.title.toLowerCase().includes(search.toLowerCase())).map(s => <Button key={s.id} className="w-full justify-start truncate" variant={script?.id === s.id ? 'secondary' : 'ghost'} disabled={busy || dirty} onClick={() => { setScript(s); setDeleting(false); setFeedback(''); }}>{s.title}</Button>)}{scripts.data?.length === 0 && <p className="text-sm text-muted-foreground">Your first generated script will appear here.</p>}</CardContent></Card></div>
      <Card><CardHeader><CardTitle>{script ? 'Review and refine' : 'Your next idea starts here'}</CardTitle></CardHeader><CardContent className="space-y-5">{!script ? <p className="text-muted-foreground py-12">Generate a script or select one from your library. You can edit its hook, body, call to action, and visual directions.</p> : <>
        {(['title', 'hook', 'body', 'cta', 'visual_directions', 'voiceover_text'] as const).map(key => <div key={key}><Label htmlFor={'edit-' + key}>{({ title: 'Title', hook: 'Opening hook', body: 'Script body', cta: 'Call to action', visual_directions: 'Visual directions', voiceover_text: 'Voiceover' })[key]}</Label><Textarea id={'edit-' + key} value={script[key] || ''} maxLength={key === 'title' ? 255 : 16000} rows={key === 'body' || key === 'voiceover_text' ? 6 : 2} onChange={e => change(key, e.target.value)} disabled={busy} /></div>)}
        {dirty && <p role="status" className="text-sm">You have unsaved edits. Save or discard them before selecting another script.</p>}
        <div className="flex flex-wrap gap-2"><Button disabled={busy || !dirty} onClick={() => void save()}>Save edits</Button><Button variant="outline" disabled={busy || !dirty} onClick={() => { const saved = scripts.data?.find(s => s.id === script.id); if (saved) setScript(saved); setDirty(false); }}>Discard edits</Button><Button variant="outline" onClick={async () => { try { await navigator.clipboard.writeText(`${script.hook}\n\n${script.body}\n\n${script.cta}`); setFeedback('Copied to clipboard.'); } catch { setError('Clipboard unavailable. Select and copy the text manually.'); } }}>Copy script</Button></div>
        <details><summary className="cursor-pointer text-sm font-medium">Version history ({script.versions?.length || 0})</summary>{script.versions?.map(v => <article key={v.id} className="border rounded-lg p-3 mt-2 text-sm"><strong>Version {v.version_number}</strong><p>{v.change_summary}</p><p className="whitespace-pre-wrap text-muted-foreground">{v.body}</p></article>)}</details>
        {!deleting ? <Button variant="ghost" disabled={busy} onClick={() => setDeleting(true)}>Delete script</Button> : <div className="space-y-2"><p>Delete this script and its version history?</p><Button variant="destructive" disabled={busy} onClick={async () => { setBusy(true); try { await api.delete(`/api/ai/scripts/${script.id}/`); setScript(null); setDirty(false); setDeleting(false); await qc.invalidateQueries({ queryKey: ['scripts', workspaceId, brandId] }); } catch (e) { setError(friendlyError(e)); } finally { setBusy(false); } }}>Confirm delete</Button><Button variant="ghost" onClick={() => setDeleting(false)}>Cancel</Button></div>}
      </>}</CardContent></Card>
    </div>
  </div>;
}
