import { Bot, Wand2, MessageSquare, Image, Music, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const aiTools = [
  {
    id: 1,
    title: 'Script Generator',
    description: 'Generate compelling video scripts based on your topic and target audience',
    icon: MessageSquare,
    status: 'available',
    category: 'Content',
    featured: true
  },
  {
    id: 2,
    title: 'Visual Generator',
    description: 'Create stunning visuals and graphics for your video content',
    icon: Image,
    status: 'available',
    category: 'Design',
    featured: false
  },
  {
    id: 3,
    title: 'Music Generator',
    description: 'Generate custom background music that matches your video\'s mood',
    icon: Music,
    status: 'coming_soon',
    category: 'Audio',
    featured: false
  },
  {
    id: 4,
    title: 'Voice Generator',
    description: 'Create professional voiceovers with AI-powered text-to-speech',
    icon: Wand2,
    status: 'coming_soon',
    category: 'Audio',
    featured: false
  }
];

export default function AITools() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-success/10 text-success border-success/20">Available</Badge>;
      case 'coming_soon':
        return <Badge variant="outline">Coming Soon</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const featuredTools = aiTools.filter(tool => tool.featured);
  const otherTools = aiTools.filter(tool => !tool.featured);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-ai rounded-2xl flex items-center justify-center mx-auto shadow-glow">
          <Bot className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">AI Tools</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Powerful AI-driven tools to enhance your video creation workflow. 
            From script generation to visual effects, we've got you covered.
          </p>
        </div>
      </div>

      {/* Featured Tools */}
      {featuredTools.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Featured Tools</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredTools.map((tool) => (
              <Card key={tool.id} className="border-2 border-ai/20 bg-gradient-to-br from-ai/5 to-transparent hover:shadow-xl transition-all duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-ai rounded-xl flex items-center justify-center">
                        <tool.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-foreground">{tool.title}</CardTitle>
                        <Badge variant="outline" className="mt-1">{tool.category}</Badge>
                      </div>
                    </div>
                    {getStatusBadge(tool.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground mb-4">
                    {tool.description}
                  </CardDescription>
                  <Button 
                    className="w-full" 
                    disabled={tool.status !== 'available'}
                  >
                    {tool.status === 'available' ? 'Launch Tool' : 'Coming Soon'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Tools */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">All AI Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiTools.map((tool) => (
            <Card key={tool.id} className="hover:shadow-lg transition-all duration-200 group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-gradient-secondary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <tool.icon className="w-5 h-5 text-white" />
                  </div>
                  {getStatusBadge(tool.status)}
                </div>
                <div>
                  <CardTitle className="text-lg text-foreground">{tool.title}</CardTitle>
                  <Badge variant="outline" className="mt-2">{tool.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground mb-4">
                  {tool.description}
                </CardDescription>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  disabled={tool.status !== 'available'}
                >
                  {tool.status === 'available' ? 'Try Tool' : 'Notify Me'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Coming Soon Section */}
      <Card className="border-dashed border-2 border-border bg-muted/20">
        <CardContent className="p-8 text-center">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">More AI Tools on the Way</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            We're constantly developing new AI-powered tools to make your video creation process even more efficient and creative.
          </p>
          <Button variant="outline">Request a Tool</Button>
        </CardContent>
      </Card>
    </div>
  );
}