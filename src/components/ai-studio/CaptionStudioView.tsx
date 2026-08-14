import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Subtitles, Sparkles, Download, Copy, Check, AlignmentLeft } from 'lucide-react';
import { aiStudioApi } from '@/services/aiStudioService';

export const CaptionStudioView: React.FC = () => {
  const [text, setText] = useState('Syncfloww AI Media Studio creates viral social content with automated word timing captions.');
  const [font, setFont] = useState('Inter');
  const [position, setPosition] = useState('bottom');
  const [loading, setLoading] = useState(false);
  const [captionData, setCaptionData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateCaptions = async () => {
    if (!text) return;
    setLoading(true);
    try {
      const res = await aiStudioApi.generateCaptions({
        text,
        style_config: { font, position, color: '#FFFFFF' },
      });
      setCaptionData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copySRT = () => {
    if (!captionData) return;
    navigator.clipboard.writeText(captionData.srt_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1 border shadow-sm h-fit">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Subtitles className="w-5 h-5 text-yellow-500" /> Automatic Caption Studio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Transcript / Speech Text</Label>
            <Textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Subtitle Font Style</Label>
            <Select value={font} onValueChange={setFont}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter (Clean Modern)</SelectItem>
                <SelectItem value="Montserrat">Montserrat (Bold Impact)</SelectItem>
                <SelectItem value="Roboto">Roboto (Classic)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>On-Screen Position</Label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bottom">Bottom Third</SelectItem>
                <SelectItem value="center">Center Overlay</SelectItem>
                <SelectItem value="top">Top Header</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleGenerateCaptions} disabled={loading || !text} className="w-full gap-2 bg-amber-600 hover:bg-amber-700 text-white">
            <Sparkles className="w-4 h-4" /> Generate Subtitles & SRT
          </Button>
        </CardContent>
      </Card>

      <div className="lg:col-span-2 space-y-4">
        {!captionData ? (
          <Card className="p-12 text-center border-dashed border-2 flex flex-col items-center justify-center min-h-[400px]">
            <Subtitles className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <h3 className="text-lg font-semibold">No Subtitles Generated</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Generate timed subtitles to export SRT/VTT files and customize on-screen caption overlays.
            </p>
          </Card>
        ) : (
          <Card className="border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">SRT Subtitle Output</CardTitle>
              <Button variant="outline" size="sm" onClick={copySRT} className="gap-1">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy SRT'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <pre className="p-4 bg-muted/60 rounded-xl border text-xs font-mono whitespace-pre-wrap">
                {captionData.srt_content}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
