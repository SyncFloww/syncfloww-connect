import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Video, Sparkles, Download, CheckCircle, RefreshCw, Play } from 'lucide-react';
import { aiStudioApi } from '@/services/aiStudioService';

export const VideoGeneratorView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [provider, setProvider] = useState('runway');
  const [duration, setDuration] = useState(5);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState<any>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setProgress(15);
    try {
      const interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 15 : prev));
      }, 800);

      const res = await aiStudioApi.generateVideo({
        prompt,
        aspect_ratio: aspectRatio,
        provider,
        duration_seconds: duration,
      });

      clearInterval(interval);
      setProgress(100);
      setGeneratedVideo(res);
    } catch (e) {
      console.error('Video generation failed:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1 border shadow-sm h-fit">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Video className="w-5 h-5 text-rose-500" /> AI Video Studio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Video Motion Prompt</Label>
            <Textarea
              rows={3}
              placeholder="e.g. Drone camera sweeping across a futuristic city at sunset, cinematic lighting, ultra smooth 60fps motion..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Aspect Ratio</Label>
            <Select value={aspectRatio} onValueChange={setAspectRatio}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="16:9">16:9 Widescreen (YouTube)</SelectItem>
                <SelectItem value="9:16">9:16 Vertical (Reels / TikTok / Shorts)</SelectItem>
                <SelectItem value="1:1">1:1 Square (Instagram)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Video AI Engine</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="runway">Runway Gen-3 Alpha (Premium)</SelectItem>
                <SelectItem value="replicate">Replicate Luma / Minimax</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Duration (Seconds)</Label>
            <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Seconds</SelectItem>
                <SelectItem value="10">10 Seconds</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleGenerate} disabled={loading || !prompt} className="w-full gap-2 bg-rose-600 hover:bg-rose-700">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate Video
          </Button>

          {loading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>Rendering motion model...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="lg:col-span-2 space-y-4">
        {!generatedVideo ? (
          <Card className="p-12 text-center border-dashed border-2 flex flex-col items-center justify-center min-h-[400px]">
            <Video className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <h3 className="text-lg font-semibold">No Video Asset Rendered</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Enter your prompt on the left to synthesize high-motion video clips synced directly to your Media Library.
            </p>
          </Card>
        ) : (
          <Card className="border overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20">
                    Ratio: {aspectRatio}
                  </Badge>
                  <Badge variant="secondary" className="uppercase">{provider}</Badge>
                </div>

                <div className="flex items-center text-xs font-semibold text-rose-600 gap-1">
                  <CheckCircle className="w-4 h-4" /> Added to Media Library
                </div>
              </div>

              <div className="relative rounded-xl overflow-hidden border bg-black flex items-center justify-center">
                <video
                  src={generatedVideo.file_url || generatedVideo.url}
                  controls
                  className="max-h-[480px] w-full object-contain rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="font-semibold text-sm">{generatedVideo.file_name}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-md">{prompt}</p>
                </div>
                <Button variant="outline" size="sm" asChild className="gap-1">
                  <a href={generatedVideo.file_url || generatedVideo.url} download target="_blank" rel="noreferrer">
                    <Download className="w-4 h-4" /> Download MP4
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
