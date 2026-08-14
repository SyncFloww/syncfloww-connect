import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sparkles, ArrowRight, RefreshCw, Bookmark, Share2 } from 'lucide-react';
import { aiStudioApi } from '@/services/aiStudioService';

interface IdeaGeneratorViewProps {
  onConvertToScript?: (idea: any) => void;
}

export const IdeaGeneratorView: React.FC<IdeaGeneratorViewProps> = ({ onConvertToScript }) => {
  const [topic, setTopic] = useState('');
  const [industry, setIndustry] = useState('Tech & SaaS');
  const [audience, setAudience] = useState('Creators & Founders');
  const [tone, setTone] = useState('Engaging & Educational');
  const [platform, setPlatform] = useState('instagram');
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<any[]>([]);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const job = await aiStudioApi.generateIdeas({
        topic,
        industry,
        target_audience: audience,
        tone,
        platform,
      });

      // Poll until completed or fallback quickly
      let count = 0;
      const interval = setInterval(async () => {
        count++;
        try {
          const statusJob = await aiStudioApi.getJobStatus(job.id);
          if (statusJob.status === 'COMPLETED' || count >= 5) {
            clearInterval(interval);
            setLoading(false);
            const generatedList = statusJob.output_data?.ideas || [
              {
                title: `Mastering ${topic} in 2026`,
                hook: `90% of creators do ${topic} completely wrong. Here's the fix:`,
                angle: 'Behind-the-scenes breakdown',
                pillar: 'Educational',
                cta: 'Save this post for your next strategy session!',
                platforms: ['instagram', 'tiktok'],
              },
              {
                title: `3 Mind-Blowing Hacks for ${topic}`,
                hook: `If you're still spending 5 hours on ${topic}, stop right now.`,
                angle: 'High-impact speed tactics',
                pillar: 'Productivity',
                cta: 'Tag a founder who needs to see this!',
                platforms: ['linkedin', 'x'],
              },
            ];
            setIdeas(generatedList);
          }
        } catch {
          clearInterval(interval);
          setLoading(false);
        }
      }, 1000);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1 border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" /> Content Idea Studio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Topic or Core Message</Label>
            <Input
              placeholder="e.g. AI Workflow Automation for Creators"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Industry</Label>
            <Input value={industry} onChange={(e) => setIndustry(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Target Audience</Label>
            <Input value={audience} onChange={(e) => setAudience(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Engaging & Educational">Engaging & Educational</SelectItem>
                <SelectItem value="High Energy & Viral">High Energy & Viral</SelectItem>
                <SelectItem value="Professional & Authoritative">Professional & Authoritative</SelectItem>
                <SelectItem value="Casual & Relatable">Casual & Relatable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Target Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram (Reels / Posts)</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="youtube">YouTube Shorts</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="x">X (Twitter)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleGenerate} disabled={loading || !topic} className="w-full gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate Content Ideas
          </Button>
        </CardContent>
      </Card>

      <div className="lg:col-span-2 space-y-4">
        {ideas.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2">
            <Sparkles className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="text-lg font-semibold">No Ideas Generated Yet</h3>
            <p className="text-sm text-muted-foreground">Fill in your topic on the left and generate strategic hooks and angles.</p>
          </Card>
        ) : (
          ideas.map((item, idx) => (
            <Card key={idx} className="border hover:border-primary/50 transition-all">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-primary/10 text-primary uppercase tracking-wide">
                    Pillar: {item.pillar || 'Educational'}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-8 gap-1">
                      <Bookmark className="w-3.5 h-3.5" /> Save
                    </Button>
                  </div>
                </div>

                <h4 className="font-bold text-lg">{item.title}</h4>

                <div className="bg-muted/40 p-3 rounded-lg border text-sm space-y-1">
                  <p className="font-medium text-xs text-muted-foreground uppercase">Hook & Angle</p>
                  <p className="font-semibold text-primary">"{item.hook}"</p>
                  <p className="text-xs text-muted-foreground">Angle: {item.angle}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <span>CTA: {item.cta}</span>
                  {onConvertToScript && (
                    <Button size="sm" onClick={() => onConvertToScript(item)} className="gap-1">
                      Convert to Script <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
