import { useState } from 'react';
import { Lightbulb, Sparkles, RefreshCw, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function IdeaGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [ideaText, setIdeaText] = useState('');
  const [generatedIdeas, setGeneratedIdeas] = useState<string[]>([]);

  const handleGenerateIdeas = async () => {
    setIsGenerating(true);
    setIdeaText('Brainstorming. Generating 3 - 5 ideas...');
    
    // Simulate AI generation delay
    setTimeout(() => {
      const sampleIdeas = [
        "Create a 60-second dance challenge video featuring your product placement in creative ways",
        "Make a 'Day in the Life' video showing how your product fits into everyday routines",
        "Develop a before-and-after transformation video demonstrating your product's impact",
        "Design a viral 'Try not to laugh' challenge incorporating your brand messaging",
        "Produce a trending audio reaction video with creative visual storytelling"
      ];
      
      setGeneratedIdeas(sampleIdeas);
      setIdeaText(sampleIdeas.join('\n\n'));
      setIsGenerating(false);
    }, 3000);
  };

  const handleRefresh = () => {
    setIdeaText('');
    setGeneratedIdeas([]);
  };

  const handleExpand = () => {
    // Implement fullscreen/expand functionality
    console.log('Expand textarea');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-ai rounded-2xl flex items-center justify-center mx-auto shadow-glow">
          <Lightbulb className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Idea Generator</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Let our AI generate creative viral video ideas tailored to your needs. 
            Get instant inspiration for your next social media hit.
          </p>
        </div>
      </div>

      {/* Main Generator Card */}
      <Card className="border-border shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Sparkles className="w-5 h-5 text-ai" />
                Idea Name
              </CardTitle>
              <CardDescription>
                Your AI-generated video ideas will appear here
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isGenerating}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExpand}
                className="gap-2"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Idea Generation Area */}
            <div className="relative">
              <Textarea
                placeholder="Click 'Generate Ideas' to start brainstorming..."
                value={ideaText}
                onChange={(e) => setIdeaText(e.target.value)}
                className="min-h-[300px] resize-none border-2 border-dashed border-border bg-surface/50"
                disabled={isGenerating}
              />
              
              {isGenerating && (
                <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-ai border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-sm text-muted-foreground">AI is generating ideas...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Generation Stats */}
            {generatedIdeas.length > 0 && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Badge variant="secondary" className="gap-1">
                  <Sparkles className="w-3 h-3" />
                  {generatedIdeas.length} Ideas Generated
                </Badge>
                <span>• Last updated: just now</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4 pt-4">
              {!isGenerating && generatedIdeas.length === 0 && (
                <Button
                  onClick={handleGenerateIdeas}
                  className="gap-2 bg-gradient-ai hover:bg-gradient-ai/90"
                  size="lg"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate Ideas
                </Button>
              )}
              
              {generatedIdeas.length > 0 && !isGenerating && (
                <div className="flex gap-3">
                  <Button
                    onClick={handleGenerateIdeas}
                    variant="outline"
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Generate More
                  </Button>
                  <Button className="gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Refine Ideas
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="border-border bg-highlight/5">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">💡 Pro Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Be specific about your target audience and niche for better results</li>
            <li>• Consider trending hashtags and current events in your industry</li>
            <li>• Think about how you can adapt trending formats to your brand</li>
            <li>• Keep your audience's attention span in mind (15-60 seconds for maximum engagement)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}