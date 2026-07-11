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
  Phone
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api.ts';

interface Brand {
  id: string;
  name: string;
  status: 'active' | 'pending';
  socialConnected: boolean;
}

interface WorkflowItem {
  id: string;
  title: string;
  type: string;
  status: 'active' | 'draft' | 'completed';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [workflows] = useState<WorkflowItem[]>([]);
  const [showConnectSocial, setShowConnectSocial] = useState(true);

  const userName = user?.full_name || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    const fetchBrandsData = async () => {
      try {
        setBrandsLoading(true);
        const data = await api.getBrands();
        const mappedBrands: Brand[] = data.map((b: any) => ({
          id: b.id.toString(),
          name: b.name,
          status: b.is_active ? 'active' : 'pending',
          socialConnected: false
        }));
        setBrands(mappedBrands);
      } catch (error) {
        console.error('Failed to fetch brands:', error);
      } finally {
        setBrandsLoading(false);
      }
    };

    if (user) {
      fetchBrandsData();
    } else {
      setBrandsLoading(false);
    }
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome {userName}
          </h1>
          <p className="text-muted-foreground">
            Manage your brands and workflows
          </p>
        </div>
        <Button onClick={() => navigate('/generate')} className="gap-2">
          <Plus className="w-4 h-4" />
          Create a Workflow
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1" onClick={() => navigate('/generate')}>
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <Workflow className="w-6 h-6 text-primary" />
                </div>
                <span className="text-sm font-medium">Workflow</span>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <span className="text-sm font-medium">Customers</span>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-lg bg-ai/10 flex items-center justify-center mb-3">
                  <Calendar className="w-6 h-6 text-ai" />
                </div>
                <span className="text-sm font-medium">Schedule</span>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mb-3">
                  <Phone className="w-6 h-6 text-success" />
                </div>
                <span className="text-sm font-medium">Business Calling</span>
              </CardContent>
            </Card>
          </div>

          {/* Favourite Brands */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-highlight" />
                  Favourite Brands
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {brandsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-10 h-10 rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                      <Skeleton className="w-8 h-8 rounded" />
                    </div>
                  ))}
                </div>
              ) : brands.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>There are no brands yet</p>
                  <Button variant="outline" className="mt-4" onClick={() => navigate('/settings')}>
                    Create Your First Brand
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {brands.map((brand) => (
                    <div key={brand.id} className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                          <span className="text-white font-bold">{brand.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{brand.name}</p>
                          <Badge variant={brand.socialConnected ? 'default' : 'secondary'} className="text-xs">
                            {brand.socialConnected ? 'Connected' : 'Not Connected'}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Workflows */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Workflows</CardTitle>
              <CardDescription>Your latest marketing workflows</CardDescription>
            </CardHeader>
            <CardContent>
              {workflows.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Workflow className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>There are no workflows yet</p>
                  <Button className="mt-4" onClick={() => navigate('/generate')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Workflow
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {workflows.map((workflow) => (
                    <div key={workflow.id} className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-secondary flex items-center justify-center">
                          <Workflow className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{workflow.title}</p>
                          <p className="text-sm text-muted-foreground">{workflow.type}</p>
                        </div>
                      </div>
                      <Badge>{workflow.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Connect Social Accounts */}
          {showConnectSocial && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-primary" />
                  Connect Social Accounts
                </CardTitle>
                <CardDescription>
                  Connect your social media handles to this brand to have access to all tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <svg className="w-5 h-5 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                  Twitter/X
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <svg className="w-5 h-5 text-[#E4405F]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                  </svg>
                  Instagram
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                  </svg>
                  TikTok
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4 text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No new messages</p>
              </div>
            </CardContent>
          </Card>

          {/* Recycle Bin */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Recycle Bin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4 text-muted-foreground">
                <Trash2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Recycle bin is empty</p>
              </div>
            </CardContent>
          </Card>

          {/* Upgrade Card */}
          <Card className="bg-gradient-primary text-primary-foreground">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-6 h-6" />
                <span className="font-semibold">Upgrade to Pro</span>
              </div>
              <p className="text-sm opacity-90 mb-4">
                Unlock all features and connect unlimited social accounts
              </p>
              <Button variant="secondary" size="sm" className="w-full">
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
