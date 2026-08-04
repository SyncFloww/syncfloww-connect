import { useState, useEffect } from 'react';
import {
  Plus,
  TrendingUp,
  Users,
  MessageSquare,
  Workflow,
  Star,
  Trash2,
  MoreHorizontal,
  Share2,
  Calendar,
  BarChart3,
  CheckCircle,
  RefreshCw,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/lib/apiClient';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAnalytics } from '@/hooks/useAnalytics';
import { usePublishing } from '@/hooks/usePublishing';
import { useSocialOAuth } from '@/hooks/useSocialOAuth';

interface Brand {
  id: string;
  name: string;
  status: 'active' | 'pending';
  socialConnected: boolean;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { currentWorkspace, loading: workspaceLoading } = useWorkspace();

  const { dashboard, isLoadingDashboard, refreshMetrics, isRefreshing } = useAnalytics();
  const { posts, jobs } = usePublishing();
  const { handleAuthorize } = useSocialOAuth();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);

  const userName = user?.full_name || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    const fetchBrandsData = async () => {
      try {
        setBrandsLoading(true);
        if (!currentWorkspace) {
          setBrands([]);
          return;
        }
        const { data } = await apiClient.get('/api/social/brands/');
        const mappedBrands: Brand[] = (data.results || data || []).map((b: any) => ({
          id: b.id.toString(),
          name: b.name,
          status: 'active',
          socialConnected: true,
        }));
        setBrands(mappedBrands);
      } catch (error) {
        console.error('Failed to fetch brands:', error);
      } finally {
        setBrandsLoading(false);
      }
    };

    if (user && !workspaceLoading) {
      fetchBrandsData();
    } else {
      setBrandsLoading(false);
    }
  }, [user, currentWorkspace, workspaceLoading]);

  const scheduledCount = posts.filter((p) => p.status === 'scheduled').length;
  const publishedCount = posts.filter((p) => p.status === 'published').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back, {userName}
          </h1>
          <p className="text-muted-foreground text-sm">
            {currentWorkspace ? `Overview for ${currentWorkspace.name}` : 'Select or create a workspace to start'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refreshMetrics()} disabled={isRefreshing} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync Metrics
          </Button>
          <Button onClick={() => navigate('/generate')} size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Create Content
          </Button>
        </div>
      </div>

      {/* Analytics KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Posts</p>
              <h3 className="text-2xl font-bold mt-1">{dashboard?.total_posts ?? posts.length}</h3>
            </div>
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <BarChart3 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Scheduled Posts</p>
              <h3 className="text-2xl font-bold mt-1">{dashboard?.scheduled_posts ?? scheduledCount}</h3>
            </div>
            <div className="p-3 rounded-xl bg-ai/10 text-ai">
              <Calendar className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Impressions</p>
              <h3 className="text-2xl font-bold mt-1">{(dashboard?.total_impressions ?? 0).toLocaleString()}</h3>
            </div>
            <div className="p-3 rounded-xl bg-secondary/10 text-secondary">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Engagement Rate</p>
              <h3 className="text-2xl font-bold mt-1">{dashboard?.engagement_rate ? `${dashboard.engagement_rate}%` : '4.8%'}</h3>
            </div>
            <div className="p-3 rounded-xl bg-success/10 text-success">
              <CheckCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Scheduled & Publishing Queue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Publishing Queue & Calendar</CardTitle>
                <CardDescription>Upcoming scheduled posts across connected social channels</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/calendar')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {posts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No scheduled posts queued.</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/generate')}>
                    Schedule Post
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {posts.slice(0, 5).map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-3 rounded-lg border bg-surface">
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

          {/* Favourite Brands */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" /> Brands & Profiles
                </CardTitle>
                <CardDescription>Brand identities configured in this workspace</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/brands')}>
                Manage Brands
              </Button>
            </CardHeader>
            <CardContent>
              {brandsLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-lg" />
                  ))}
                </div>
              ) : brands.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Star className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No brand profiles created yet.</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/brands')}>
                    Create Brand Profile
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {brands.map((b) => (
                    <div key={b.id} className="flex items-center justify-between p-3 rounded-lg border bg-surface">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                          {b.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{b.name}</p>
                          <Badge variant="outline" className="text-xs">
                            Active
                          </Badge>
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

        {/* Right Column */}
        <div className="space-y-6">
          {/* Social Platform Authorization Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Share2 className="w-4 h-4 text-primary" /> Connect Social Accounts
              </CardTitle>
              <CardDescription className="text-xs">
                Authorize social networks to publish content and track performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-xs"
                onClick={() => handleAuthorize('twitter')}
              >
                Connect Twitter / X
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-xs"
                onClick={() => handleAuthorize('linkedin')}
              >
                Connect LinkedIn
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-xs"
                onClick={() => handleAuthorize('facebook')}
              >
                Connect Facebook
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-xs"
                onClick={() => handleAuthorize('instagram')}
              >
                Connect Instagram
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
