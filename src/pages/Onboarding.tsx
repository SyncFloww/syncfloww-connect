import api from '@/lib/apiClient';
import { VoiceInput } from '@/features/core/VoiceInput';
import { friendlyError } from './BrandWorkspace';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, MessageCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { brandsApi, type Brand } from '@/features/brands/api';
import { brandInterview, type InterviewState } from '@/features/brands/onboarding';

export default function Onboarding() {
  const navigate = useNavigate();
  const { currentWorkspace, workspaces, selectWorkspace, createWorkspace, loading: workspaceLoading } = useWorkspace();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandId, setBrandId] = useState('');
  const [name, setName] = useState('');
  const [interview, setInterview] = useState<InterviewState | null>(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [review, setReview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);
  const [helping, setHelping] = useState(false);
  const [help, setHelp] = useState<{ reply: string; suggested_answer: string } | null>(null);
  useEffect(() => { setHelp(null); }, [brandId, index]);
  async function askForHelp() {
    if (!interview || helping) return;
    setHelping(true); setError('');
    try { const { data } = await api.post(`/api/social/brands/${brandId}/assistant/`, { message: 'Help me answer this brand interview question. Offer concrete options and ask a follow-up if needed.', mode: 'question', question: interview.questions[index].key, draft: answer }); setHelp(data); }
    catch (e) { setError(friendlyError(e)); } finally { setHelping(false); }
  }

  useEffect(() => {
    let cancelled = false;
    setInterview(null); setBrandId(''); setBrands([]); setError('');
    if (!currentWorkspace) { setLoading(false); return; }
    setLoading(true);
    brandsApi.list(String(currentWorkspace.id)).then((items) => {
      if (!cancelled) { setBrands(items); setBrandId(items.length ? String(items[0].id) : ''); }
    }).catch(() => { if (!cancelled) setError('We could not load your brands. Try again.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [currentWorkspace?.id, reload]);

  useEffect(() => {
    let cancelled = false;
    setInterview(null);
    if (!brandId) return;
    setLoading(true); setError('');
    brandInterview.get(brandId).then((state) => {
      if (cancelled) return;
      const next = state.questions.findIndex((q) => state.missing.includes(q.key));
      const start = next < 0 ? 0 : next;
      setInterview(state); setIndex(start);
      setAnswer(state.answers[state.questions[start].key] || '');
      setReview(state.completed || next < 0);
    }).catch(() => { if (!cancelled) setError('We could not load your interview. Your saved answers are safe. Try again.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [brandId]);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || saving) return;
    setSaving(true); setError('');
    try {
      if (!currentWorkspace) {
        await createWorkspace(name.trim(), name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
      } else {
        const brand = await brandsApi.create({ name: name.trim(), workspace: String(currentWorkspace.id) });
        setBrands([brand]); setBrandId(String(brand.id));
      }
      setName('');
    } catch { setError('We could not save this name. Please try again.'); }
    finally { setSaving(false); }
  };

  const saveAnswer = async (next: number) => {
    if (!interview || saving) return;
    const question = interview.questions[index];
    if (question.required && !answer.trim()) { setError('Please add a starting answer before continuing. You can refine it later.'); return; }
    setSaving(true); setError('');
    try {
      const state = await brandInterview.save(brandId, { [question.key]: answer.trim() });
      setInterview(state);
      if (next === state.questions.length) setReview(true);
      else { setIndex(next); setAnswer(state.answers[state.questions[next].key] || ''); }
    } catch { setError('Your answer could not be saved. Try again before continuing.'); }
    finally { setSaving(false); }
  };

  const finish = async () => {
    if (saving || !currentWorkspace) return;
    setSaving(true); setError('');
    try {
      setInterview(await brandInterview.save(brandId, {}, true));
      localStorage.setItem('current_workspace_id', String(currentWorkspace.id));
      localStorage.setItem('syncflow-active-brand-' + currentWorkspace.id, brandId);
      navigate('/ai-studio?tab=script');
    } catch { setError('We could not finish setup. Check all required answers and try again.'); }
    finally { setSaving(false); }
  };

  const busy = saving || loading || workspaceLoading || helping;
  const question = interview?.questions[index];
  return <main className="min-h-screen bg-background px-4 py-10"><div className="mx-auto max-w-2xl space-y-6">
    <header className="space-y-3 text-center"><img src="/Icon.png" alt="Syncflow" className="mx-auto h-12 w-12" /><h1 className="text-3xl font-bold">Let’s get to know your brand</h1><p className="text-muted-foreground">A guided conversation to give your content direction. Your answers save as you continue.</p></header>
    {error && <div role="alert" className="rounded-lg border border-destructive p-4"><p>{error}</p>{!saving && <Button className="mt-2" variant="outline" onClick={() => setReload((v) => v + 1)}>Reload saved setup</Button>}</div>}
    {currentWorkspace && <div className="grid gap-3 sm:grid-cols-2">
      <div><Label htmlFor="workspace">Workspace</Label><select id="workspace" disabled={busy} className="mt-1 w-full rounded-md border bg-background p-2" value={String(currentWorkspace.id)} onChange={(e) => { const workspace = workspaces.find((w) => String(w.id) === e.target.value); if (workspace) selectWorkspace(workspace); }}>{workspaces.map((w) => <option key={w.id} value={String(w.id)}>{w.name}</option>)}</select></div>
      {brands.length > 0 && <div><Label htmlFor="brand">Brand</Label><select id="brand" disabled={busy} className="mt-1 w-full rounded-md border bg-background p-2" value={brandId} onChange={(e) => setBrandId(e.target.value)}>{brands.map((b) => <option key={b.id} value={String(b.id)}>{b.name}</option>)}</select></div>}
    </div>}
    {(loading || workspaceLoading) && <p role="status" className="text-center">Loading your saved setup…</p>}
    {!workspaceLoading && !loading && !interview && !error && (!currentWorkspace || !brands.length) && <Card><CardHeader><CardTitle>{currentWorkspace ? 'Your first brand' : 'Your workspace'}</CardTitle></CardHeader><CardContent><form onSubmit={create} className="space-y-4"><Label htmlFor="setup-name">{currentWorkspace ? 'What is your brand’s name?' : 'What should we call your workspace?'}</Label><Input id="setup-name" required maxLength={255} value={name} onChange={(e) => setName(e.target.value)} />{currentWorkspace && <p className="text-sm text-muted-foreground">We’ll save this brand in {currentWorkspace.name}.</p>}<Button disabled={busy} type="submit">{saving ? 'Saving…' : 'Continue'}</Button></form></CardContent></Card>}
    {interview && !loading && !review && question && <Card><CardHeader><p className="text-sm text-muted-foreground">Question {index + 1} of {interview.questions.length} · Guided brand setup</p><CardTitle className="flex items-start gap-3"><MessageCircle aria-hidden="true" className="h-5 w-5 shrink-0 text-primary" />{question.title}</CardTitle></CardHeader><CardContent><form className="space-y-5" onSubmit={(e) => { e.preventDefault(); void saveAnswer(index + 1); }}>
      <p id="answer-hint" className="text-sm text-muted-foreground">{question.hint}</p><Label htmlFor="brand-answer">Your answer {question.required ? '(required)' : '(optional)'}</Label><Textarea key={question.key} id="brand-answer" autoFocus rows={6} aria-describedby="answer-hint" required={question.required} maxLength={['tone', 'goal'].includes(question.key) ? 255 : 2000} value={answer} onChange={(e) => setAnswer(e.target.value)} disabled={busy} /><VoiceInput key={brandId + question.key} disabled={busy} onText={text => setAnswer(old => (old + " " + text).trim().slice(0, ["tone", "goal"].includes(question.key) ? 255 : 2000))} /><Button type="button" variant="outline" disabled={busy} onClick={() => void askForHelp()}>{helping ? "Thinking…" : "Help me shape this answer"}</Button>{help && <div className="rounded-lg border p-4 space-y-3"><p className="whitespace-pre-wrap text-sm">{help.reply}</p>{help.suggested_answer && <><p className="whitespace-pre-wrap text-sm text-muted-foreground">Suggested answer: {help.suggested_answer}</p><Button type="button" disabled={busy} onClick={() => { setAnswer(help.suggested_answer); setHelp(null); }}>Use this draft</Button></>}<p className="text-xs text-muted-foreground">Review any suggested facts before saving. Your saved brand details and this draft are shared with the AI provider.</p></div>}<p className="text-sm text-muted-foreground">Not sure yet? Write your best starting point. You can edit it before finishing.</p>
      <div className="flex justify-between gap-3"><Button type="button" variant="outline" disabled={busy || index === 0} onClick={() => void saveAnswer(index - 1)}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button><Button type="submit" disabled={busy}>{saving ? 'Saving…' : index === interview.questions.length - 1 ? 'Review brand' : 'Save and continue'}<ArrowRight className="ml-2 h-4 w-4" /></Button></div>
    </form></CardContent></Card>}
    {interview && !loading && review && <Card><CardHeader><CardTitle className="flex items-center gap-2"><Check className="h-5 w-5 text-primary" />Review your brand</CardTitle><p className="text-sm text-muted-foreground">Your scripts will use these details. Check that everything is accurate.</p></CardHeader><CardContent className="space-y-5">{interview.questions.map((q, i) => <section key={q.key} className="border-b pb-4"><div className="flex justify-between gap-3"><h2 className="font-medium">{q.title}</h2><Button size="sm" variant="ghost" disabled={busy} aria-label={`Edit: ${q.title}`} onClick={() => { setIndex(i); setAnswer(interview.answers[q.key] || ''); setReview(false); setError(''); }}>Edit</Button></div><p className="whitespace-pre-wrap text-sm text-muted-foreground">{interview.answers[q.key] || (q.required ? 'An answer is needed.' : 'Not specified')}</p></section>)}<Button className="w-full" disabled={busy || interview.missing.length > 0} onClick={() => void finish()}><Sparkles className="mr-2 h-4 w-4" />{saving ? 'Saving…' : 'Save brand and create a script'}</Button></CardContent></Card>}
    <footer className="text-center text-xs text-muted-foreground">Share business information you want used in content. Avoid passwords and private customer details.</footer>
  </div></main>;
}
