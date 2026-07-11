import { Search, Filter, Play, Star, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const templates = [
  {
    id: 1,
    title: 'Product Launch Reveal',
    description: 'Perfect for announcing new products with dynamic transitions',
    category: 'Business',
    duration: '30s',
    popularity: 95,
    thumbnail: 'gradient-primary'
  },
  {
    id: 2,
    title: 'Social Media Story',
    description: 'Engaging story format for Instagram and TikTok',
    category: 'Social',
    duration: '15s',
    popularity: 88,
    thumbnail: 'gradient-secondary'
  },
  {
    id: 3,
    title: 'Tutorial Explainer',
    description: 'Clean template for educational and how-to content',
    category: 'Education',
    duration: '60s',
    popularity: 92,
    thumbnail: 'gradient-ai'
  },
  {
    id: 4,
    title: 'Testimonial Spotlight',
    description: 'Showcase customer reviews and testimonials',
    category: 'Marketing',
    duration: '45s',
    popularity: 85,
    thumbnail: 'gradient-hero'
  }
];

export default function Templates() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Templates</h1>
        <p className="text-muted-foreground">
          Choose from professionally designed templates to kickstart your video creation
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </Button>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="group cursor-pointer hover:shadow-lg transition-all duration-200">
            <CardContent className="p-0">
              {/* Thumbnail */}
              <div className={`aspect-video bg-${template.thumbnail} rounded-t-lg relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" className="gap-2">
                    <Play className="w-4 h-4" />
                    Preview
                  </Button>
                </div>
                {/* Popularity badge */}
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="gap-1 bg-black/50 text-white border-none">
                    <Star className="w-3 h-3 fill-current" />
                    {template.popularity}%
                  </Badge>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground">{template.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{template.category}</Badge>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {template.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {template.popularity}%
                    </span>
                  </div>
                </div>
                
                <Button className="w-full" variant="outline">
                  Use Template
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coming Soon */}
      <Card className="border-dashed border-2 border-border">
        <CardContent className="p-8 text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">More Templates Coming Soon</h3>
          <p className="text-muted-foreground mb-4">
            We're constantly adding new templates. Stay tuned for more creative options!
          </p>
          <Button variant="outline">Request Template</Button>
        </CardContent>
      </Card>
    </div>
  );
}