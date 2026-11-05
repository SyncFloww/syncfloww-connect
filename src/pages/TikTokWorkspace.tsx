import SocialReadiness from '@/components/SocialReadiness';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/apiClient';
import { useCurrentBrand } from '@/features/core/useCurrentBrand';
import { friendlyError } from './BrandWorkspace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
type Account = { id: number; name: string };
type Creator = { creator_nickname: string; privacy_level_options: string[]; comment_disabled: boolean; duet_disabled: boolean; stitch_disabled: boolean; max_video_post_duration_sec: number; public_posting_approved: boolean };
type Post = { id: number; caption: string; status: string; provider_publish_id: string; remote_id: string; scheduled_at: string | null };
const privacyNames: Record<string, string> = { SELF_ONLY: 'Only me', PUBLIC_TO_EVERYONE: 'Everyone', MUTUAL_FOLLOW_FRIENDS: 'Friends', FOLLOWER_OF_CREATOR: 'Followers' };

export function TikTokCallback() {
  const [params] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState(params.get('error') ? 'TikTok authorization was declined. Return and reconnect when ready.' : 'Finish connecting the TikTok account you authorised.');
  async function finish() {
    setBusy(true);
    try {
      const { data } = await api.post('/api/social/tiktok/callback/', { code: params.get('code'), state: params.get('state') });
      setMessage(`Connected ${data.account.name}. Return to TikTok publishing.`); setDone(true);
      window.history.replaceState({}, '', '/social/tiktok/callback');
    } catch (e) { setMessage(friendlyError(e)); } finally { setBusy(false); }
  }
  return <main className="max-w-xl mx-auto p-8 space-y-5"><img src="/Icon.png" alt="Syncflow" className="h-12" /><h1 className="text-2xl font-bold">Connect TikTok</h1><p role="status">{message}</p>{!done && params.get('code') && <Button disabled={busy} onClick={() => void finish()}>{busy ? 'Connecting…' : 'Finish connection'}</Button>}<Button asChild variant="outline"><Link to="/social/tiktok">Return to TikTok</Link></Button></main>;
}

export default function TikTokWorkspace() {
  const selection = useCurrentBrand();
  return <TikTokBrands key={selection.workspaceId + ':' + selection.brandId} selection={selection} />;
}
function TikTokBrands({ selection }: { selection: ReturnType<typeof useCurrentBrand> }) {
  const { brands, brandId, workspaceId, choose } = selection;
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const accounts = useQuery({ queryKey: ['tiktok-accounts', workspaceId, brandId], enabled: !!brandId, queryFn: async () => (await api.get<Account[]>(`/api/social/tiktok/brands/${brandId}/accounts/`)).data });
  const account = accounts.data?.find(a => String(a.id) === selected);
  async function connect() {
    setBusy(true); setError('');
    try { const { data } = await api.post(`/api/social/tiktok/brands/${brandId}/accounts/`); window.location.assign(data.url); }
    catch (e) { setError(friendlyError(e)); setBusy(false); }
  }
  return <div className="max-w-4xl mx-auto space-y-6"><nav className="flex gap-3"><Button asChild variant="outline"><Link to="/social">Facebook</Link></Button><Button asChild><Link to="/social/tiktok">TikTok</Link></Button></nav><header><h1 className="text-3xl font-bold">TikTok publishing</h1><p className="text-muted-foreground mt-2">Connect your creator account, review a video, and publish or queue it for later.</p></header><SocialReadiness /><Label htmlFor="tiktok-brand">Brand</Label><select id="tiktok-brand" className="w-full border rounded-md p-2 bg-background" disabled={busy} value={brandId} onChange={e => choose(e.target.value)}>{brands.map(b => <option key={b.id} value={String(b.id)}>{b.name}</option>)}</select>{selection.isError && <p role="alert">Brands could not load. Refresh to retry.</p>}{!brands.length && !selection.isLoading && <Button asChild><Link to="/onboarding">Set up a brand</Link></Button>}
    {error && <p role="alert">{error}</p>}<Card><CardHeader><CardTitle>TikTok accounts</CardTitle></CardHeader><CardContent className="space-y-3"><Button disabled={busy || !brandId} onClick={() => void connect()}>Connect TikTok</Button>{accounts.isLoading && <p>Loading accounts…</p>}{accounts.isError && <p role="alert">{friendlyError(accounts.error)}</p>}{accounts.data?.map(a => <div className="flex gap-3 items-center border rounded-lg p-3" key={a.id}><span className="flex-1">{a.name}</span><Button variant="outline" disabled={busy} onClick={() => setSelected(String(a.id))}>Select</Button><Button variant="ghost" disabled={busy} onClick={async () => { if (!window.confirm(`Disconnect ${a.name} and cancel queued posts?`)) return; setBusy(true); try { await api.delete(`/api/social/tiktok/accounts/${a.id}/`); setSelected(''); await accounts.refetch(); } catch (e) { setError(friendlyError(e)); } finally { setBusy(false); } }}>Disconnect</Button></div>)}{accounts.data?.length === 0 && <p>No TikTok account connected.</p>}</CardContent></Card>
    {account && <TikTokComposer key={account.id} account={account} workspaceId={workspaceId} />}
    <Card><CardHeader><CardTitle>Comments & inbox access</CardTitle></CardHeader><CardContent><p className="text-muted-foreground">TikTok publishing authorization does not grant comment-management or inbox access. These require separate TikTok API for Business approvals and a business account connection. Those connections are not implemented in this release; no automatic replies will be sent on TikTok.</p></CardContent></Card>
  </div>;
}

function TikTokComposer({ account, workspaceId }: { account: Account; workspaceId: string }) {
  const [caption, setCaption] = useState('');
  const [url, setUrl] = useState('');
  const [preview, setPreview] = useState('');
  const [duration, setDuration] = useState(0);
  const [privacy, setPrivacy] = useState('');
  const [comments, setComments] = useState(false);
  const [duet, setDuet] = useState(false);
  const [stitch, setStitch] = useState(false);
  const [commercial, setCommercial] = useState(false);
  const [ownBrand, setOwnBrand] = useState(false);
  const [branded, setBranded] = useState(false);
  const [aigc, setAigc] = useState(false);
  const [consent, setConsent] = useState(false);
  const [music, setMusic] = useState(false);
  const [schedule, setSchedule] = useState('');
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const [locked, setLocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const creator = useQuery({ queryKey: ['tiktok-creator', workspaceId, account.id], staleTime: 0, retry: false, queryFn: async () => (await api.get<Creator>(`/api/social/tiktok/accounts/${account.id}/creator/`)).data });
  const posts = useQuery({ queryKey: ['tiktok-posts', workspaceId, account.id], queryFn: async () => (await api.get<Post[]>(`/api/social/tiktok/accounts/${account.id}/posts/`)).data });
  const pending = posts.data?.find(p => p.status === 'processing' && p.provider_publish_id);
  useQuery({ queryKey: ['tiktok-progress', workspaceId, account.id, pending?.id], enabled: !!pending, retry: false, refetchInterval: 15000, refetchIntervalInBackground: false, queryFn: async () => { const { data } = await api.post(`/api/social/tiktok/posts/${pending!.id}/status/`); await posts.refetch(); return data; } });
  useEffect(() => { setPrivacy(''); setComments(false); setDuet(false); setStitch(false); setConsent(false); setMusic(false); }, [creator.dataUpdatedAt]);
  const info = creator.data;
  const frozen = busy || locked;
  const valid = !!info && !creator.isFetching && duration > 0 && duration <= info.max_video_post_duration_sec && !!privacy && preview === url && consent && music && (!commercial || ownBrand || branded) && (!branded || ['PUBLIC_TO_EVERYONE', 'MUTUAL_FOLLOW_FRIENDS'].includes(privacy));
  async function run(action: () => Promise<void>) { setBusy(true); setError(''); setNotice(''); try { await action(); } catch (e) { setError(friendlyError(e)); } finally { setBusy(false); } }
  function change() { setConsent(false); setMusic(false); }
  async function publish() {
    await run(async () => {
      setLocked(true);
      try {
        const { data } = await api.post(`/api/social/tiktok/accounts/${account.id}/posts/`, { caption, video_url: url, duration_seconds: duration, privacy_level: privacy, allow_comment: comments, allow_duet: duet, allow_stitch: stitch, commercial, brand_organic_toggle: ownBrand, brand_content_toggle: branded, is_aigc: aigc, confirm: consent, music_consent: music, request_id: requestId, scheduled_at: schedule ? new Date(schedule).toISOString() : null });
        setNotice(data.status === 'scheduled' ? 'Queued. A worker check after the scheduled time will send this approved video.' : `TikTok status: ${data.status}. Processing can take several minutes. Check status below.`);
      } catch (e: any) { if (e.response?.status && e.response.status < 500) setLocked(false); throw e; }
      finally { await posts.refetch(); }
    });
  }
  return <><Card><CardHeader><CardTitle>Publish to {info?.creator_nickname || account.name}</CardTitle></CardHeader><CardContent className="space-y-4">{creator.isLoading && <p>Loading TikTok creator options…</p>}{creator.isError && <p role="alert">{friendlyError(creator.error)}</p>}<Button variant="outline" disabled={frozen} onClick={() => void creator.refetch()}>Reload creator options</Button>{info && <><p className="text-sm text-muted-foreground">Maximum video length: {info.max_video_post_duration_sec} seconds.</p>{!info.public_posting_approved && <p className="border rounded-lg p-3">This app is in private testing. Use a private TikTok account and select Only me. Public posting requires TikTok’s audit.</p>}
      <Label htmlFor="tiktok-video">Video URL</Label><Input id="tiktok-video" type="url" maxLength={2000} disabled={frozen} value={url} onChange={e => { setUrl(e.target.value); setPreview(''); setDuration(0); change(); }} /><p className="text-sm text-muted-foreground">Use an MP4 video hosted under Syncflow’s TikTok-verified media domain. Local file upload and photo posts are not included in this release.</p><Button variant="outline" disabled={frozen || !url.startsWith('https://')} onClick={() => { setDuration(0); setPreview(url); change(); }}>Load video preview</Button>{preview && <video className="w-full max-h-96 rounded-lg" controls preload="metadata" src={preview} onLoadedMetadata={e => { const value = e.currentTarget.duration; setDuration(Number.isFinite(value) ? value : 0); }} onError={() => { setDuration(0); setError('Video preview could not load. Use a publicly reachable video URL.'); }} />}{duration > 0 && <p>{Math.ceil(duration)} seconds{duration > info.max_video_post_duration_sec ? ' — too long for this account' : ''}</p>}
      <Label htmlFor="tiktok-caption">Caption</Label><Textarea id="tiktok-caption" maxLength={2200} disabled={frozen} rows={4} value={caption} onChange={e => { setCaption(e.target.value); change(); }} />
      <Label htmlFor="tiktok-privacy">Who can watch?</Label><select id="tiktok-privacy" className="w-full rounded-md border p-2 bg-background" disabled={frozen} value={privacy} onChange={e => { setPrivacy(e.target.value); change(); }}><option value="">Choose visibility</option>{info.privacy_level_options.filter(x => info.public_posting_approved || x === 'SELF_ONLY').map(x => <option key={x} value={x} disabled={branded && !['PUBLIC_TO_EVERYONE', 'MUTUAL_FOLLOW_FRIENDS'].includes(x)}>{privacyNames[x] || x}</option>)}</select>
      <div className="space-y-2">{([{ key: 'comments', label: 'Allow comments', value: comments, set: setComments, disabled: info.comment_disabled }, { key: 'duet', label: 'Allow Duet', value: duet, set: setDuet, disabled: info.duet_disabled }, { key: 'stitch', label: 'Allow Stitch', value: stitch, set: setStitch, disabled: info.stitch_disabled }]).map(x => <label key={x.key} className={`flex gap-2 ${x.disabled ? 'opacity-50' : ''}`}><input type="checkbox" disabled={frozen || x.disabled} checked={x.value && !x.disabled} onChange={e => { x.set(e.target.checked); change(); }} />{x.label}{x.disabled ? ' (disabled in TikTok)' : ''}</label>)}</div>
      <label className="flex gap-2"><input type="checkbox" disabled={frozen} checked={commercial} onChange={e => { setCommercial(e.target.checked); setOwnBrand(false); setBranded(false); change(); }} />This content promotes a brand, product or service</label>{commercial && <div className="space-y-2 border rounded-lg p-3"><label className="flex gap-2"><input type="checkbox" disabled={frozen} checked={ownBrand} onChange={e => { setOwnBrand(e.target.checked); change(); }} />Your brand</label><label className="flex gap-2"><input type="checkbox" disabled={frozen || privacy === 'SELF_ONLY' || !info.public_posting_approved} checked={branded} onChange={e => { setBranded(e.target.checked); change(); }} />Branded content / paid partnership</label><p className="text-sm">{branded ? "Your video will be labeled as 'Paid partnership'." : ownBrand ? "Your video will be labeled as 'Promotional content'." : 'Choose whether the content promotes your brand or another brand.'}</p><p className="text-sm text-muted-foreground">Paid partnerships cannot use private visibility.</p></div>}
      <label className="flex gap-2"><input type="checkbox" checked={aigc} disabled={frozen} onChange={e => { setAigc(e.target.checked); change(); }} />Label this video as AI-generated content</label><Label htmlFor="tiktok-schedule">Schedule time (optional, device timezone)</Label><Input id="tiktok-schedule" type="datetime-local" disabled={frozen} value={schedule} onChange={e => { setSchedule(e.target.value); change(); }} /><p className="text-sm text-muted-foreground">The current worker checks daily and handles one action per run. This is not exact-time scheduling. Status and creator settings are checked again before sending.</p>
      <label className="flex gap-2"><input type="checkbox" checked={music} disabled={frozen} onChange={e => setMusic(e.target.checked)} /><span>By posting, you agree to TikTok’s {branded && <><a className="underline" href="https://www.tiktok.com/legal/page/global/bc-policy/en" target="_blank" rel="noreferrer">Branded Content Policy</a> and </>}<a className="underline" href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en" target="_blank" rel="noreferrer">Music Usage Confirmation</a>.</span></label><label className="flex gap-2"><input type="checkbox" checked={consent} disabled={frozen} onChange={e => setConsent(e.target.checked)} />I reviewed this video, caption, account and post settings. I authorise Syncflow to send it now or at the selected time.</label><div className="flex gap-3"><Button disabled={frozen || !valid} onClick={() => void publish()}>{busy ? 'Working…' : schedule ? 'Queue approved video' : 'Post to TikTok'}</Button><Button variant="outline" disabled={busy} onClick={() => { if (window.confirm('Start a new publish request? If a previous send was uncertain, check TikTok first to avoid duplicates.')) { setLocked(false); setRequestId(crypto.randomUUID()); change(); } }}>New publish request</Button></div></>}{error && <p role="alert" className="border border-destructive p-3 rounded-lg">{error}</p>}{notice && <p role="status">{notice}</p>}</CardContent></Card>
    <Card><CardHeader><CardTitle>TikTok publish history</CardTitle></CardHeader><CardContent className="space-y-3"><Button variant="outline" disabled={busy} onClick={() => void posts.refetch()}>Refresh history</Button><Button variant="outline" disabled={busy} onClick={() => void run(async () => { const { data } = await api.post(`/api/social/tiktok/accounts/${account.id}/worker/`); setNotice(`Worker: ${data.status}`); await posts.refetch(); })}>Run scheduled-post check</Button>{posts.isError && <p role="alert">{friendlyError(posts.error)}</p>}{posts.data?.map(p => <article key={p.id} className="border rounded-lg p-4 space-y-3"><p className="whitespace-pre-wrap">{p.caption || 'No caption'}</p><p>Status: {p.status}</p>{p.scheduled_at && <p>Scheduled after {new Date(p.scheduled_at).toLocaleString()}</p>}{p.provider_publish_id && <Button variant="outline" disabled={busy} onClick={() => void run(async () => { const { data } = await api.post(`/api/social/tiktok/posts/${p.id}/status/`); setNotice(`TikTok: ${data.provider_status || data.status}`); await posts.refetch(); })}>Check TikTok status</Button>}{p.status === 'scheduled' && <Button variant="outline" disabled={busy} onClick={() => { if (window.confirm('Cancel this queued TikTok post?')) void run(async () => { await api.post(`/api/social/meta/posts/${p.id}/cancel/`); await posts.refetch(); }); }}>Cancel queued post</Button>}</article>)}{posts.data?.length === 0 && <p>No TikTok publish requests yet.</p>}</CardContent></Card></>;
}
