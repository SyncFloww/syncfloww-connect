import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Building2, Instagram, Facebook, Twitter, Youtube, Link as LinkIcon, Edit2, Trash2, BarChart3, UploadCloud, CalendarDays } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import apiClient from '@/lib/apiClient';
import BrandAnalyticsPanel from '@/components/BrandAnalyticsPanel';
import BrandContentUpload from '@/components/BrandContentUpload';
import BrandScheduleCalendar from '@/components/BrandScheduleCalendar';

interface Brand {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  created_at: string;
}

export default function BrandManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analyticsBrand, setAnalyticsBrand] = useState<Brand | null>(null);
  const [uploadBrand, setUploadBrand] = useState<Brand | null>(null);
  const [calendarBrand, setCalendarBrand] = useState<Brand | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    instagram_url: '',
    facebook_url: '',
    twitter_url: '',
    youtube_url: '',
    tiktok_url: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchBrands();
  }, [user, navigate]);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/api/social/brands/');
      setBrands(data || []);
    } catch (error: any) {
      const msg = error.friendlyMessage || 'Unable to load brands. Please try again.';
      toast({ title: 'Oops!', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      website: '',
      instagram_url: '',
      facebook_url: '',
      twitter_url: '',
      youtube_url: '',
      tiktok_url: '',
    });
    setEditingBrand(null);
  };

  const handleOpenDialog = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({
        name: brand.name,
        description: brand.description || '',
        website: brand.website || '',
        instagram_url: brand.instagram_url || '',
        facebook_url: brand.facebook_url || '',
        twitter_url: brand.twitter_url || '',
        youtube_url: brand.youtube_url || '',
        tiktok_url: brand.tiktok_url || '',
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      if (editingBrand) {
        const { data } = await apiClient.put(`/api/social/brands/${editingBrand.id}/`, formData);
        setBrands(prev => prev.map(b => b.id === editingBrand.id ? { ...b, ...data } : b));
        toast({ title: 'Brand updated successfully!' });
      } else {
        const { data } = await apiClient.post('/api/social/brands/', formData);
        setBrands(prev => [data, ...prev]);
        toast({ title: 'Brand created successfully!' });
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      const msg = error.friendlyMessage || error.response?.data?.detail || 'Something went wrong. Please try again.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (brandId: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;

    try {
      await apiClient.delete(`/api/social/brands/${brandId}/`);
      setBrands(prev => prev.filter(b => b.id !== brandId));
      toast({ title: 'Brand deleted successfully!' });
    } catch (error: any) {
      const msg = error.friendlyMessage || 'Unable to delete brand. Please try again.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };

  if (loading) {
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
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex gap-2">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="w-8 h-8 rounded-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Brand Management</h1>
          <p className="text-muted-foreground">Manage your brands and connected social accounts</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Brand
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBrand ? 'Edit Brand' : 'Create New Brand'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Brand Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter brand name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of your brand"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://example.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Connect Social Media</h3>
                <div className="space-y-3">
                  <div className="relative">
                    <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500" />
                    <Input value={formData.instagram_url} onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })} placeholder="Instagram profile URL" className="pl-10" />
                  </div>
                  <div className="relative">
                    <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
                    <Input value={formData.facebook_url} onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })} placeholder="Facebook page URL" className="pl-10" />
                  </div>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-500" />
                    <Input value={formData.twitter_url} onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })} placeholder="Twitter/X profile URL" className="pl-10" />
                  </div>
                  <div className="relative">
                    <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                    <Input value={formData.youtube_url} onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })} placeholder="YouTube channel URL" className="pl-10" />
                  </div>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                    <Input value={formData.tiktok_url} onChange={(e) => setFormData({ ...formData, tiktok_url: e.target.value })} placeholder="TikTok profile URL" className="pl-10" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }} className="flex-1">Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Saving...' : editingBrand ? 'Update Brand' : 'Create Brand'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {brands.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No brands yet</h3>
            <p className="text-muted-foreground text-center mb-4">Create your first brand to start managing your social presence</p>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Brand
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <Card key={brand.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{brand.name}</CardTitle>
                      {brand.website && (
                        <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary">
                          {brand.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setAnalyticsBrand(brand)} className="h-8 w-8" title="Insights"><BarChart3 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setCalendarBrand(brand)} className="h-8 w-8" title="Schedule calendar"><CalendarDays className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setUploadBrand(brand)} className="h-8 w-8" title="Upload content"><UploadCloud className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(brand)} className="h-8 w-8" title="Edit"><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(brand.id)} className="h-8 w-8 text-destructive hover:text-destructive" title="Delete"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {brand.description && <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{brand.description}</p>}
                <div className="flex gap-2 flex-wrap">
                  {brand.instagram_url && <a href={brand.instagram_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-accent hover:bg-accent/80"><Instagram className="w-4 h-4 text-pink-500" /></a>}
                  {brand.facebook_url && <a href={brand.facebook_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-accent hover:bg-accent/80"><Facebook className="w-4 h-4 text-blue-600" /></a>}
                  {brand.twitter_url && <a href={brand.twitter_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-accent hover:bg-accent/80"><Twitter className="w-4 h-4 text-sky-500" /></a>}
                  {brand.youtube_url && <a href={brand.youtube_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-accent hover:bg-accent/80"><Youtube className="w-4 h-4 text-red-500" /></a>}
                  {brand.tiktok_url && (
                    <a href={brand.tiktok_url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-accent hover:bg-accent/80">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!analyticsBrand} onOpenChange={(open) => !open && setAnalyticsBrand(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Insights · {analyticsBrand?.name}</DialogTitle>
          </DialogHeader>
          {analyticsBrand && <BrandAnalyticsPanel brandId={analyticsBrand.id} />}
        </DialogContent>
      </Dialog>

      <Dialog open={!!uploadBrand} onOpenChange={(open) => !open && setUploadBrand(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload content · {uploadBrand?.name}</DialogTitle>
          </DialogHeader>
          {uploadBrand && <BrandContentUpload brandId={uploadBrand.id} />}
        </DialogContent>
      </Dialog>

      <Dialog open={!!calendarBrand} onOpenChange={(open) => !open && setCalendarBrand(null)}>
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
