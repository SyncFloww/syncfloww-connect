import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Grid, List, Play, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

import { api, Project } from '@/lib/api.ts';

export default function MyProjects() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await api.getProjects();
        setProjects(data);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load projects. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'in_progress':
        return 'bg-ai/10 text-ai border-ai/20';
      case 'draft':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.project_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Projects</h1>
          <p className="text-muted-foreground">Manage and organize your video projects</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="p-2"
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="p-2"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Recent Created Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Created</h2>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-border">
                <CardContent className="p-0">
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gradient-secondary rounded-t-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white/80 group-hover:scale-110 transition-transform" />
                    </div>
                    {/* Duration badge */}
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="text-xs bg-black/50 text-white border-none">
                        {project.generations_count}x
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-semibold text-foreground line-clamp-1">{project.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(project.status)} variant="outline">
                        {project.status.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {project.created_at}
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {project.generations_count} generation{project.generations_count !== 1 ? 's' : ''} | {project.created_at}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="group cursor-pointer hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Thumbnail */}
                    <div className="w-20 h-12 bg-gradient-secondary rounded flex items-center justify-center flex-shrink-0">
                      <Play className="w-6 h-6 text-white/80" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{project.title}</h3>
                          <p className="text-sm text-muted-foreground">{project.description}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <Badge className={getStatusColor(project.status)} variant="outline">
                            {project.status.replace('_', ' ')}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {project.created_at}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'Try adjusting your search criteria' : 'Create your first video project to get started'}
          </p>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create New Project
          </Button>
        </div>
      )}
    </div>
  );
}