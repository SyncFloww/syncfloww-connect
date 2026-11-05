import { useQuery } from '@tanstack/react-query';
import api from '@/lib/apiClient';
import { Card, CardContent } from '@/components/ui/card';
type Readiness = { facebook: { configured: boolean; messenger_requested: boolean }; tiktok: { configured: boolean; media_prefix_configured: boolean; public_posting_approved: boolean } };
export default function SocialReadiness() {
  const query = useQuery({ queryKey: ['social-readiness'], retry: false, queryFn: async () => (await api.get<Readiness>('/api/social/readiness/')).data });
  if (!query.data) return query.isError ? <p className="text-sm text-muted-foreground">Platform readiness could not be checked. Connection requests will show any setup error.</p> : null;
  const { facebook, tiktok } = query.data;
  return <Card><CardContent className="p-4 grid gap-3 sm:grid-cols-2"><div><p className="font-medium">Facebook</p><p className="text-sm text-muted-foreground">{facebook.configured ? 'App credentials configured. Connect a Page to verify access.' : 'An administrator needs to finish Facebook app setup.'}</p><p className="text-sm text-muted-foreground">{facebook.messenger_requested ? 'Messenger permission will be requested on connection.' : 'Messenger is not enabled in app setup yet.'}</p></div><div><p className="font-medium">TikTok</p><p className="text-sm text-muted-foreground">{tiktok.configured ? 'App credentials configured. Connect to verify access.' : 'An administrator needs to finish TikTok app setup.'}</p><p className="text-sm text-muted-foreground">{tiktok.public_posting_approved ? 'App configured for audited posting.' : 'Private testing until the app passes TikTok’s audit.'}{!tiktok.media_prefix_configured ? ' A verified media domain must also be configured.' : ''}</p></div></CardContent></Card>;
}
