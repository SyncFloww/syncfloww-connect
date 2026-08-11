import { useState, useEffect } from 'react';
import {
  Plus,
  TrendingUp,
  BarChart3,
  CheckCircle,
  RefreshCw,
  Clock,
  Share2,
  Calendar,
  Star,
  MoreHorizontal,
  Building2,
  Layers,
  ArrowRight,
  Zap,
  Globe,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/lib/apiClient';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { usePublishing } from '@/hooks/usePublishing';
import { useSocialOAuth } from '@/hooks/useSocialOAuth';
import { useToast } from '@/hooks/use-toast';

interface Brand {
  id: string;
  name: string;
  industry?: string;
  logo_url?: string;
}

function BrandAvatar({ brand }: { brand: Brand }) {
  const letter = brand.name.charAt(0).toUpperCase();
  const colors = [
    'bg-violet-500', 'bg-blue-500', 'bg-emerald-500',
    'bg-amber-500', 'bg-rose-500', 'bg-cyan-500',
  ];
  const color = colors[brand.name.charCodeAt(0) % colors.length];
  if (brand.logo_url) {
    return (
      <img
        src={brand.logo_url}
        alt={brand.name}
        className="w-9 h-9 rounded-lg object-cover"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }
  return (
    <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center text-white font-bold text-sm`}>
      {letter}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { workspaces, currentWorkspace, loading: workspaceLoading, createWorkspace } = useWorkspace();

  const { dashboard, isLoadingDashboard, refreshMetrics, isRefreshing } = useAnalytics();
  const { posts } = usePublishing();
  const { handleAuthorize } = useSocialOAuth();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);

  // Workspace creation dialog
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [wsName, setWsName] = useState('');
  const [wsSlug, setWsSlug] = useState('');
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);

  const userName = user?.full_name || user?.email?.split('@')[0] || 'User';
  const scheduledCount = posts.filter(p => p.status === 'scheduled').length;

  useEffect(() => {
    if (!user || workspaceLoading) return;
    const fetchBrands = async () => {
      try {
        setBrandsLoading(true);
        const params = currentWorkspace ? { workspace: currentWorkspace.id } : {};
        const { data } = await apiClient.get('/api/social/brands/', { params });
        setBrands(Array.isArray(data) ? data : data?.results || []);
      } catch {
        // silently fail — dashboard should degrade gracefully
      } finally {
        setBrandsLoading(false);
      }
    };
    fetchBrands();
  }, [user, currentWorkspace, workspaceLoading]);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsName.trim()) return;
    setCreatingWorkspace(true);
    try {
      const slug = wsSlug.trim() || wsName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      await createWorkspace(wsName.trim(), slug);
      toast({ title: '🎉 Workspace created!', description: `"${wsName}" is ready to use.` });
      setShowCreateWorkspace(false);
      setWsName('');
      setWsSlug('');
    } catch (err: any) {
      toast({
        title: 'Failed to create workspace',
        description: err?.response?.data?.name?.[0] || err?.response?.data?.detail || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCreatingWorkspace(false);
    }
  };

  // ── NO WORKSPACE — full onboarding prompt ──────────────────────────────────
  if (!workspaceLoading && workspaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 px-4">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
          <Layers className="w-10 h-10 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Welcome, {userName}! 👋</h2>
          <p className="text-muted-foreground max-w-md text-sm">
            Let's get you set up. Create your first workspace to start managing brands,
            scheduling content, and growing your social presence.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button id="create-workspace-btn" size="lg" onClick={() => setShowCreateWorkspace(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Create Workspace
          </Button>
        </div>

        {/* Create Workspace Dialog */}
        <Dialog open={showCreateWorkspace} onOpenChange={setShowCreateWorkspace}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-primary" /> New Workspace
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateWorkspace} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label htmlFor="ws-name">Workspace Name <span className="text-destructive">*</span></Label>
                <Input
                  id="ws-name"
                  placeholder="e.g. Acme Marketing"
                  value={wsName}
                  onChange={e => {
                    setWsName(e.target.value);
                    setWsSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
                  }}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ws-slug">Slug (auto-generated)</Label>
                <Input
                  id="ws-slug"
                  placeholder="acme-marketing"
                  value={wsSlug}
                  onChange={e => setWsSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreateWorkspace(false)}>Cancel</Button>
                <Button type="submit" disabled={creatingWorkspace || !wsName.trim()} className="flex-1">
                  {creatingWorkspace ? 'Creating…' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back, {userName} 👋
          </h1>
          <p className="text-muted-foreground text-sm">
            {currentWorkspace ? `Overview for ${currentWorkspace.name}` : 'Select a workspace to start'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshMetrics()}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync Metrics
          </Button>
          <Button id="create-content-btn" onClick={() => navigate('/generate')} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Create Content
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Posts',
            value: dashboard?.total_posts ?? posts.length,
            icon: <BarChart3 className="w-5 h-5" />,
            bg: 'bg-primary/10 text-primary',
          },
          {
            label: 'Scheduled Posts',
            value: dashboard?.scheduled_posts ?? scheduledCount,
            icon: <Calendar className="w-5 h-5" />,
            bg: 'bg-violet-500/10 text-violet-500',
          },
          {
            label: 'Impressions',
            value: (dashboard?.total_impressions ?? 0).toLocaleString(),
            icon: <TrendingUp className="w-5 h-5" />,
            bg: 'bg-emerald-500/10 text-emerald-500',
          },
          {
            label: 'Engagement Rate',
            value: dashboard?.engagement_rate ? `${dashboard.engagement_rate}%` : '—',
            icon: <CheckCircle className="w-5 h-5" />,
            bg: 'bg-amber-500/10 text-amber-500',
          },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-1">{isLoadingDashboard ? <Skeleton className="h-7 w-16" /> : stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>{stat.icon}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Publishing Queue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Publishing Queue</CardTitle>
                <CardDescription>Upcoming scheduled posts across channels</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/calendar')}>View All</Button>
            </CardHeader>
            <CardContent>
              {posts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No scheduled posts yet.</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/generate')}>
                    Schedule a Post
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {posts.slice(0, 5).map(post => (
                    <div key={post.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                      <div className="space-y-1">
                        <p className="font-medium text-sm line-clamp-1">{post.title || post.content}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{post.scheduled_at ? new Date(post.scheduled_at).toLocaleString() : 'Draft'}</span>
                        </div>
                      </div>
                      <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                        {post.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Brands panel */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" /> Brands &amp; Profiles
                </CardTitle>
                <CardDescription>Brand identities in this workspace</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/brands')}>
                Manage Brands
              </Button>
            </CardHeader>
            <CardContent>
              {brandsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
                </div>
              ) : brands.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No brands created yet.</p>
                  <Button
                    id="dashboard-create-brand-btn"
                    variant="outline"
                    size="sm"
                    className="mt-3 gap-2"
                    onClick={() => navigate('/brands')}
                  >
                    <Plus className="w-3.5 h-3.5" /> Create Brand
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {brands.map(b => (
                    <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <BrandAvatar brand={b} />
                        <div>
                          <p className="font-medium text-sm">{b.name}</p>
                          {b.industry && <p className="text-xs text-muted-foreground">{b.industry}</p>}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => navigate('/brands')}>
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" /> Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2 text-sm" onClick={() => navigate('/generate')}>
                <Plus className="w-4 h-4" /> Generate Content
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 text-sm" onClick={() => navigate('/brands')}>
                <Building2 className="w-4 h-4" /> Manage Brands
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 text-sm" onClick={() => navigate('/campaigns')}>
                <Globe className="w-4 h-4" /> View Campaigns
              </Button>
            </CardContent>
          </Card>

          {/* Connect Social */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Share2 className="w-4 h-4 text-primary" /> Connect Social Accounts
              </CardTitle>
              <CardDescription className="text-xs">
                Authorize networks to publish &amp; track performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Twitter / X', platform: 'twitter' },
                { label: 'LinkedIn', platform: 'linkedin' },
                { label: 'Facebook', platform: 'facebook' },
                { label: 'Instagram', platform: 'instagram' },
              ].map(({ label, platform }) => (
                <Button
                  key={platform}
                  id={`connect-${platform}-btn`}
                  variant="outline"
                  className="w-full justify-start gap-2 text-xs"
                  onClick={() => handleAuthorize(platform)}
                >
                  Connect {label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Workspace creation dialog (accessible from dashboard header too) */}
      <Dialog open={showCreateWorkspace} onOpenChange={setShowCreateWorkspace}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" /> New Workspace
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateWorkspace} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="ws-name-inline">Workspace Name <span className="text-destructive">*</span></Label>
              <Input
                id="ws-name-inline"
                placeholder="e.g. Acme Marketing"
                value={wsName}
                onChange={e => {
                  setWsName(e.target.value);
                  setWsSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
                }}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ws-slug-inline">Slug</Label>
              <Input
                id="ws-slug-inline"
                placeholder="acme-marketing"
                value={wsSlug}
                onChange={e => setWsSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              />
            </div>
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreateWorkspace(false)}>Cancel</Button>
              <Button type="submit" disabled={creatingWorkspace || !wsName.trim()} className="flex-1">
                {creatingWorkspace ? 'Creating…' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
