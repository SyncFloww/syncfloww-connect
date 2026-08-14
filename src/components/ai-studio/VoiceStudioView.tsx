import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mic, Sparkles, Download, CheckCircle, ShieldCheck, Play, RefreshCw, Volume2 } from 'lucide-react';
import { aiStudioApi, VoiceOption } from '@/services/aiStudioService';
import { CustomVoiceConsentModal } from './CustomVoiceConsentModal';

export const VoiceStudioView: React.FC = () => {
  const [text, setText] = useState('');
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('en-US-natalie');
  const [speed, setSpeed] = useState([1.0]);
  const [pitch, setPitch] = useState([0]);
  const [loading, setLoading] = useState(false);
  const [generatedVoice, setGeneratedVoice] = useState<any>(null);

  const [consentModalOpen, setConsentModalOpen] = useState(false);

  useEffect(() => {
    aiStudioApi.getVoices().then((vList) => {
      if (vList && vList.length > 0) {
        setVoices(vList);
      }
    }).catch(console.error);
  }, []);

  const handleGenerateVoiceover = async () => {
    if (!text) return;
    setLoading(true);
    try {
      const res = await aiStudioApi.generateVoiceover({
        text,
        voice_id: selectedVoice,
        speed: speed[0],
        pitch: pitch[0],
      });
      setGeneratedVoice(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1 border shadow-sm h-fit">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Mic className="w-5 h-5 text-indigo-500" /> Murf Voice Studio
          </CardTitle>
          <Button variant="outline" size="xs" onClick={() => setConsentModalOpen(true)} className="gap-1 border-indigo-500/30 text-indigo-600">
            <ShieldCheck className="w-3.5 h-3.5" /> Custom Voice
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Voiceover Script Text</Label>
            <Textarea
              rows={4}
              placeholder="e.g. Welcome to Syncfloww AI Media Studio! Elevate your social media strategy with production-ready audio."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Select Murf Voice</Label>
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {voices.map((v) => (
                  <SelectItem key={v.voice_id} value={v.voice_id}>
                    {v.name} ({v.accent || v.locale}) - {v.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <Label>Speaking Speed</Label>
              <span className="font-semibold text-muted-foreground">{speed[0].toFixed(1)}x</span>
            </div>
            <Slider
              value={speed}
              onValueChange={setSpeed}
              min={0.5}
              max={2.0}
              step={0.1}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <Label>Pitch Tuning</Label>
              <span className="font-semibold text-muted-foreground">{pitch[0]}</span>
            </div>
            <Slider
              value={pitch}
              onValueChange={setPitch}
              min={-5}
              max={5}
              step={1}
            />
          </div>

          <Button onClick={handleGenerateVoiceover} disabled={loading || !text} className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Generate Murf Voiceover
          </Button>
        </CardContent>
      </Card>

      <div className="lg:col-span-2 space-y-4">
        {!generatedVoice ? (
          <Card className="p-12 text-center border-dashed border-2 flex flex-col items-center justify-center min-h-[400px]">
            <Volume2 className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <h3 className="text-lg font-semibold">No Audio Generated</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Select a Murf Gen2 or Falcon 2 voice on the left to render studio voiceovers complete with caption timing metadata.
            </p>
          </Card>
        ) : (
          <Card className="border overflow-hidden">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20">
                    Voice: {selectedVoice}
                  </Badge>
                  <Badge variant="secondary">{generatedVoice.duration}s</Badge>
                </div>

                <div className="flex items-center text-xs font-semibold text-indigo-600 gap-1">
                  <CheckCircle className="w-4 h-4" /> Added to Media Library
                </div>
              </div>

              {/* Audio Player */}
              <div className="p-4 bg-muted/40 rounded-xl border space-y-3">
                <audio src={generatedVoice.audio_url} controls className="w-full" />
              </div>

              {/* Word Timing Data Inspector for Subtitle Sync */}
              {generatedVoice.word_timings && generatedVoice.word_timings.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Synchronized Word Timing Metadata ({generatedVoice.word_timings.length} words)
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-3 bg-background rounded-lg border">
                    {generatedVoice.word_timings.map((wt: any, i: number) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded bg-muted/60 border font-mono">
                        {wt.word} <span className="text-[10px] text-muted-foreground">({wt.start_time}s)</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <CustomVoiceConsentModal
        open={consentModalOpen}
        onOpenChange={setConsentModalOpen}
      />
    </div>
  );
};
