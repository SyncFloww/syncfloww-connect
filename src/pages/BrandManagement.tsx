import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Plus, Building2, Link as LinkIcon, Edit2, Trash2,
  BarChart3, UploadCloud, CalendarDays, Globe, Users,
  Megaphone, Layers, AlertCircle, ArrowRight,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import apiClient from '@/lib/apiClient';
import BrandAnalyticsPanel from '@/components/BrandAnalyticsPanel';
import BrandContentUpload from '@/components/BrandContentUpload';
import BrandScheduleCalendar from '@/components/BrandScheduleCalendar';

interface Brand {
  id: string;
  workspace: string;
  workspace_name?: string;
  name: string;
  slug?: string;
  description?: string;
  website?: string;
  industry?: string;
  logo_url?: string;
  voice?: string;
  target_audience?: string;
  niche?: string;
  is_active?: boolean;
  created_at?: string;
}

const INDUSTRY_OPTIONS = [
  'Technology', 'E-Commerce', 'Health & Wellness', 'Fashion & Apparel',
  'Food & Beverage', 'Education', 'Finance', 'Real Estate', 'Entertainment',
  'Travel & Hospitality', 'Automotive', 'Sports & Fitness', 'Beauty & Cosmetics',
  'Non-Profit', 'Media & Publishing', 'Other',
];

const VOICE_OPTIONS = [
  'Professional', 'Casual & Friendly', 'Humorous', 'Inspirational',
  'Bold & Confident', 'Empathetic', 'Educational', 'Luxury & Sophisticated',
];

function BrandAvatar({ brand }: { brand: Brand }) {
  const letter = brand.name.charAt(0).toUpperCase();
  const colors = [
    'bg-violet-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500',
    'bg-rose-500', 'bg-cyan-500', 'bg-fuchsia-500', 'bg-orange-500',
  ];
  // Stable colour based on name
  const color = colors[brand.name.charCodeAt(0) % colors.length];
  if (brand.logo_url) {
    return (
      <img
        src={brand.logo_url}
        alt={brand.name}
        className="w-12 h-12 rounded-xl object-cover"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }
  return (
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white font-bold text-lg`}>
      {letter}
    </div>
  );
}

export default function BrandManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { workspaces, currentWorkspace, loading: workspaceLoading } = useWorkspace();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analyticsBrand, setAnalyticsBrand] = useState<Brand | null>(null);
  const [uploadBrand, setUploadBrand] = useState<Brand | null>(null);
  const [calendarBrand, setCalendarBrand] = useState<Brand | null>(null);

  const defaultForm = {
    name: '',
    description: '',
    website: '',
    industry: '',
    logo_url: '',
    voice: '',
    target_audience: '',
    niche: '',
  };
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!workspaceLoading) fetchBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate, workspaceLoading, currentWorkspace]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const params = currentWorkspace ? { workspace: currentWorkspace.id } : {};
      const { data } = await apiClient.get('/api/social/brands/', { params });
      setBrands(Array.isArray(data) ? data : data?.results || []);
    } catch (error: any) {
      toast({ title: 'Unable to load brands', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(defaultForm);
    setEditingBrand(null);
  };

  const handleOpenDialog = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name,
        description: brand.description || '',
        website: brand.website || '',
        industry: brand.industry || '',
        logo_url: brand.logo_url || '',
        voice: brand.voice || '',
        target_audience: brand.target_audience || '',
        niche: brand.niche || '',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!editingBrand && !currentWorkspace) {
      toast({ title: 'No workspace selected', description: 'Please select or create a workspace first.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = editingBrand
        ? formData
        : { ...formData, workspace: currentWorkspace!.id };

      if (editingBrand) {
        const { data } = await apiClient.patch(`/api/social/brands/${editingBrand.id}/`, payload);
        setBrands(prev => prev.map(b => b.id === editingBrand.id ? { ...b, ...data } : b));
        toast({ title: '✅ Brand updated!' });
      } else {
        const { data } = await apiClient.post('/api/social/brands/', payload);
        setBrands(prev => [data, ...prev]);
        toast({ title: '🎉 Brand created!' });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      const msg = error.response?.data?.detail
        || error.response?.data?.workspace?.[0]
        || error.response?.data?.name?.[0]
        || 'Something went wrong. Please try again.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (brandId: string, brandName: string) => {
    if (!confirm(`Delete "${brandName}"? This cannot be undone.`)) return;
    try {
      await apiClient.delete(`/api/social/brands/${brandId}/`);
      setBrands(prev => prev.filter(b => b.id !== brandId));
      toast({ title: 'Brand deleted.' });
    } catch {
      toast({ title: 'Error', description: 'Unable to delete brand.', variant: 'destructive' });
    }
  };

  // ── No workspace state ───────────────────────────────────────────────────────
  if (!workspaceLoading && workspaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 px-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Building2 className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold">Create a workspace first</h2>
        <p className="text-muted-foreground max-w-sm text-sm">
          Brands live inside workspaces. Create your first workspace to get started.
        </p>
        <Button onClick={() => navigate('/dashboard')} className="gap-2">
          <ArrowRight className="w-4 h-4" /> Go to Dashboard
        </Button>
      </div>
    );
  }

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading || workspaceLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent><Skeleton className="h-4 w-full" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Brand Management</h1>
          <p className="text-muted-foreground text-sm">
            {currentWorkspace
              ? `Brands for ${currentWorkspace.name}`
              : 'Manage your brand identities'}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button
              id="create-brand-btn"
              onClick={() => handleOpenDialog()}
              disabled={!currentWorkspace}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              New Brand
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                {editingBrand ? 'Edit Brand' : 'Create New Brand'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 mt-2">
              {/* Workspace badge */}
              {!editingBrand && currentWorkspace && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                  <Layers className="w-4 h-4" />
                  Creating in workspace: <span className="font-medium text-foreground">{currentWorkspace.name}</span>
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="brand-name">Brand Name <span className="text-destructive">*</span></Label>
                <Input
                  id="brand-name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Acme Co."
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="brand-description">Description</Label>
                <Textarea
                  id="brand-description"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What does your brand do?"
                  rows={2}
                />
              </div>

              {/* Website */}
              <div className="space-y-1.5">
                <Label htmlFor="brand-website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="brand-website"
                    type="url"
                    value={formData.website}
                    onChange={e => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Logo URL */}
              <div className="space-y-1.5">
                <Label htmlFor="brand-logo">Logo URL</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="brand-logo"
                    value={formData.logo_url}
                    onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="https://cdn.example.com/logo.png"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Industry */}
              <div className="space-y-1.5">
                <Label htmlFor="brand-industry">Industry</Label>
                <select
                  id="brand-industry"
                  value={formData.industry}
                  onChange={e => setFormData({ ...formData, industry: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select industry…</option>
                  {INDUSTRY_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Niche */}
              <div className="space-y-1.5">
                <Label htmlFor="brand-niche">Niche / Sub-category</Label>
                <Input
                  id="brand-niche"
                  value={formData.niche}
                  onChange={e => setFormData({ ...formData, niche: e.target.value })}
                  placeholder="e.g. Sustainable sportswear"
                />
              </div>

              {/* Target Audience */}
              <div className="space-y-1.5">
                <Label htmlFor="brand-audience">
                  <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Target Audience</span>
                </Label>
                <Input
                  id="brand-audience"
                  value={formData.target_audience}
                  onChange={e => setFormData({ ...formData, target_audience: e.target.value })}
                  placeholder="e.g. Millennial professionals aged 25–40"
                />
              </div>

              {/* Brand Voice */}
              <div className="space-y-1.5">
                <Label htmlFor="brand-voice">
                  <span className="flex items-center gap-1"><Megaphone className="w-3.5 h-3.5" /> Brand Voice</span>
                </Label>
                <select
                  id="brand-voice"
                  value={formData.voice}
                  onChange={e => setFormData({ ...formData, voice: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select voice…</option>
                  {VOICE_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setIsDialogOpen(false); resetForm(); }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Saving…' : editingBrand ? 'Save Changes' : 'Create Brand'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* No workspace selected */}
      {!currentWorkspace && workspaces.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Select a workspace from the header to view and manage its brands.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {brands.length === 0 && currentWorkspace ? (
        <Card className="border-dashed border-2 hover:border-primary/40 transition-colors">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No brands yet</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              Create your first brand identity to start generating content, tracking analytics, and scheduling posts.
            </p>
            <Button id="create-first-brand-btn" onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Brand
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {brands.map(brand => (
            <Card
              key={brand.id}
              className="group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 border hover:border-primary/30"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <BrandAvatar brand={brand} />
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate">{brand.name}</CardTitle>
                      {brand.industry && (
                        <Badge variant="secondary" className="text-xs mt-1">{brand.industry}</Badge>
                      )}
                      {brand.website && (
                        <a
                          href={brand.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary mt-1 truncate"
                        >
                          <Globe className="w-3 h-3 shrink-0" />
                          {brand.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Insights" onClick={() => setAnalyticsBrand(brand)}>
                      <BarChart3 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Schedule" onClick={() => setCalendarBrand(brand)}>
                      <CalendarDays className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Upload content" onClick={() => setUploadBrand(brand)}>
                      <UploadCloud className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => handleOpenDialog(brand)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      title="Delete"
                      onClick={() => handleDelete(brand.id, brand.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0 space-y-2">
                {brand.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{brand.description}</p>
                )}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {brand.voice && (
                    <span className="inline-flex items-center gap-1 text-xs bg-primary/8 text-primary px-2 py-0.5 rounded-full">
                      <Megaphone className="w-3 h-3" />{brand.voice}
                    </span>
                  )}
                  {brand.target_audience && (
                    <span className="inline-flex items-center gap-1 text-xs bg-secondary/10 text-secondary-foreground px-2 py-0.5 rounded-full truncate max-w-[160px]">
                      <Users className="w-3 h-3 shrink-0" />{brand.target_audience}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Analytics Dialog */}
      <Dialog open={!!analyticsBrand} onOpenChange={open => !open && setAnalyticsBrand(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Insights · {analyticsBrand?.name}</DialogTitle>
          </DialogHeader>
          {analyticsBrand && <BrandAnalyticsPanel brandId={analyticsBrand.id} />}
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={!!uploadBrand} onOpenChange={open => !open && setUploadBrand(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Content · {uploadBrand?.name}</DialogTitle>
          </DialogHeader>
          {uploadBrand && <BrandContentUpload brandId={uploadBrand.id} />}
        </DialogContent>
      </Dialog>

      {/* Calendar Dialog */}
      <Dialog open={!!calendarBrand} onOpenChange={open => !open && setCalendarBrand(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule · {calendarBrand?.name}</DialogTitle>
          </DialogHeader>
          {calendarBrand && <BrandScheduleCalendar brandId={calendarBrand.id} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
