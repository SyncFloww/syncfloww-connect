import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image as ImageIcon, Sparkles, Download, CheckCircle, RefreshCw } from 'lucide-react';
import { aiStudioApi } from '@/services/aiStudioService';

export const ImageGeneratorView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [provider, setProvider] = useState('fal');
  const [style, setStyle] = useState('Cinematic Modern');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedMedia, setGeneratedMedia] = useState<any>(null);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const res = await aiStudioApi.generateImage({
        prompt,
        aspect_ratio: aspectRatio,
        provider,
        style,
        negative_prompt: negativePrompt,
      });
      setGeneratedMedia(res);
    } catch (e) {
      console.error('Image generation failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const aspectRatios = [
    { key: '1:1', label: '1:1 Square (Feed)' },
    { key: '4:5', label: '4:5 Portrait (IG Feed)' },
    { key: '9:16', label: '9:16 Vertical (Reels/TikTok)' },
    { key: '16:9', label: '16:9 Widescreen (YT)' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1 border shadow-sm h-fit">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-emerald-500" /> AI Image Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Image Prompt</Label>
            <Textarea
              rows={3}
              placeholder="e.g. Modern sleek futuristic workspace with glowing neon accent lighting, high definition product photography..."
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
                {aspectRatios.map((ar) => (
                  <SelectItem key={ar.key} value={ar.key}>
                    {ar.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>AI Provider</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fal">fal.ai (Flux Schnell)</SelectItem>
                <SelectItem value="replicate">Replicate (FLUX / SDXL)</SelectItem>
                <SelectItem value="gemini">Google Imagen 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Visual Style Preset</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cinematic Modern">Cinematic Modern</SelectItem>
                <SelectItem value="Photorealistic Studio">Photorealistic Studio</SelectItem>
                <SelectItem value="3D Digital Art">3D Digital Art</SelectItem>
                <SelectItem value="Minimalist Graphic">Minimalist Graphic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Negative Prompt (Optional)</Label>
            <Input
              placeholder="blur, distorted, low resolution"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
            />
          </div>

          <Button onClick={handleGenerate} disabled={loading || !prompt} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate Image
          </Button>
        </CardContent>
      </Card>

      <div className="lg:col-span-2 space-y-4">
        {!generatedMedia ? (
          <Card className="p-12 text-center border-dashed border-2 flex flex-col items-center justify-center min-h-[400px]">
            <ImageIcon className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <h3 className="text-lg font-semibold">No Image Generated</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Describe your image on the left. Generated images are automatically synced to your Media Library.
            </p>
          </Card>
        ) : (
          <Card className="border overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                    Ratio: {aspectRatio}
                  </Badge>
                  <Badge variant="secondary" className="uppercase">{provider}</Badge>
                </div>

                <div className="flex items-center text-xs font-semibold text-emerald-600 gap-1">
                  <CheckCircle className="w-4 h-4" /> Added to Media Library
                </div>
              </div>

              <div className="relative rounded-xl overflow-hidden border bg-black/5 flex items-center justify-center">
                <img
                  src={generatedMedia.file_url || generatedMedia.url}
                  alt={prompt}
                  className="max-h-[500px] w-auto object-contain rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="font-semibold text-sm">{generatedMedia.file_name}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-md">{prompt}</p>
                </div>
                <Button variant="outline" size="sm" asChild className="gap-1">
                  <a href={generatedMedia.file_url || generatedMedia.url} download target="_blank" rel="noreferrer">
                    <Download className="w-4 h-4" /> Download
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
