import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Share2, Sparkles, Copy, Check, CheckCircle2, Calendar } from 'lucide-react';
import { aiStudioApi, AISocialContent } from '@/services/aiStudioService';
import { useToast } from '@/hooks/use-toast';

interface SocialContentConverterProps {
  scriptId?: number;
}

export const SocialContentConverterView: React.FC<SocialContentConverterProps> = ({ scriptId }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [socialOutputs, setSocialOutputs] = useState<AISocialContent[]>([]);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!scriptId) return;
    setLoading(true);
    try {
      const items = await aiStudioApi.convertToSocialContent(scriptId);
      setSocialOutputs(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (platform: string, content: string) => {
    setScheduling(true);
    try {
      await aiStudioApi.schedulePost({
        title: `AI Studio Post (${platform})`,
        content: content,
        platforms: [platform],
        scheduled_at: new Date(Date.now() + 86400000).toISOString(),
      });
      toast({
        title: 'Post Scheduled!',
        description: `Your post for ${platform} has been added to the publishing queue.`,
      });
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Scheduling Failed',
        description: 'Failed to schedule post to publishing system.',
      });
    } finally {
      setScheduling(false);
    }
  };

  const copyContent = (text: string, platform: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(platform);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const platforms = [
    { key: 'instagram', label: 'Instagram' },
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'x', label: 'X (Twitter)' },
    { key: 'facebook', label: 'Facebook' },
    { key: 'tiktok', label: 'TikTok' },
    { key: 'youtube', label: 'YouTube' },
  ];

  return (
    <div className="space-y-6">
      <Card className="border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Share2 className="w-5 h-5 text-purple-500" /> Multi-Platform Social Converter
          </CardTitle>
          <Button onClick={handleConvert} disabled={loading || !scriptId} className="bg-purple-600 hover:bg-purple-700 gap-2">
            <Sparkles className="w-4 h-4" /> Convert Script to All Platforms
          </Button>
        </CardHeader>
        <CardContent>
          {socialOutputs.length === 0 ? (
            <div className="p-12 text-center border-dashed border-2 rounded-xl">
              <Share2 className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="text-lg font-semibold">Ready to Convert Script</h3>
              <p className="text-sm text-muted-foreground">Click "Convert Script to All Platforms" to generate tailored posts for IG, LinkedIn, X, FB, TikTok & YouTube.</p>
            </div>
          ) : (
            <Tabs defaultValue="instagram" className="w-full space-y-4">
              <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
                {platforms.map((p) => (
                  <TabsTrigger key={p.key} value={p.key} className="capitalize text-xs">
                    {p.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {platforms.map((p) => {
                const item = socialOutputs.find((so) => so.platform === p.key);
                const captionText = item ? item.caption : `Draft post tailored for ${p.label}...`;
                return (
                  <TabsContent key={p.key} value={p.key} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-green-500" /> Saved to Content Library
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => copyContent(captionText, p.key)} className="gap-1">
                          {copiedTab === p.key ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedTab === p.key ? 'Copied!' : 'Copy Copy'}
                        </Button>
                        <Button size="sm" onClick={() => handleSchedule(p.key, captionText)} disabled={scheduling} className="gap-1 bg-green-600 hover:bg-green-700 text-white">
                          <Calendar className="w-3.5 h-3.5" /> Schedule & Publish
                        </Button>
                      </div>
                    </div>

                    <Textarea
                      rows={8}
                      className="font-mono text-sm leading-relaxed"
                      value={captionText}
                      onChange={(e) => {
                        const updated = socialOutputs.map((so) =>
                          so.platform === p.key ? { ...so, caption: e.target.value } : so
                        );
                        setSocialOutputs(updated);
                      }}
                    />
                  </TabsContent>
                );
              })}
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
