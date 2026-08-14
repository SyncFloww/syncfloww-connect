import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Music, Mic, Volume2, Sparkles, Plus, Trash2, RefreshCw } from 'lucide-react';
import { aiStudioApi } from '@/services/aiStudioService';

export const AudioStudioView: React.FC = () => {
  const [tracks, setTracks] = useState<any[]>([
    { id: 1, type: 'voiceover', name: 'Generated Voiceover', url: 'https://actions.google.com/sounds/v1/ambiences/outdoor_synth.ogg', volume: 1.0 },
    { id: 2, type: 'music', name: 'Lo-Fi Background Beat', url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg', volume: 0.3 },
  ]);
  const [loading, setLoading] = useState(false);
  const [mixedAudio, setMixedAudio] = useState<any>(null);

  const addTrack = () => {
    const newTrack = {
      id: Date.now(),
      type: 'sfx',
      name: `Sound Effect Track ${tracks.length + 1}`,
      url: 'https://actions.google.com/sounds/v1/cartoon/clink.ogg',
      volume: 0.5,
    };
    setTracks([...tracks, newTrack]);
  };

  const removeTrack = (id: number) => {
    setTracks(tracks.filter((t) => t.id !== id));
  };

  const updateTrackVolume = (id: number, vol: number[]) => {
    setTracks(tracks.map((t) => (t.id === id ? { ...t, volume: vol[0] } : t)));
  };

  const handleMixAudio = async () => {
    setLoading(true);
    try {
      const job = await aiStudioApi.mixAudioTracks(tracks);
      setMixedAudio(job.output_data || { output_url: tracks[0].url });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Music className="w-5 h-5 text-sky-500" /> Multi-Track Audio Studio & Mixer
          </CardTitle>
          <Button variant="outline" size="sm" onClick={addTrack} className="gap-1">
            <Plus className="w-4 h-4" /> Add Audio Track
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {tracks.map((track) => (
            <Card key={track.id} className="p-4 border bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {track.type === 'voiceover' ? (
                    <Mic className="w-4 h-4 text-indigo-500" />
                  ) : (
                    <Music className="w-4 h-4 text-sky-500" />
                  )}
                  <Input
                    className="h-8 font-semibold text-sm w-60"
                    value={track.name}
                    onChange={(e) =>
                      setTracks(tracks.map((t) => (t.id === track.id ? { ...t, name: e.target.value } : t)))
                    }
                  />
                  <Badge variant="outline" className="uppercase text-[10px]">
                    {track.type}
                  </Badge>
                </div>

                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeTrack(track.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Volume Level</span>
                    <span className="font-semibold">{Math.round(track.volume * 100)}%</span>
                  </div>
                  <Slider
                    value={[track.volume]}
                    onValueChange={(v) => updateTrackVolume(track.id, v)}
                    min={0}
                    max={1}
                    step={0.05}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Source URL</Label>
                  <Input
                    className="h-8 text-xs font-mono"
                    value={track.url}
                    onChange={(e) =>
                      setTracks(tracks.map((t) => (t.id === track.id ? { ...t, url: e.target.value } : t)))
                    }
                  />
                </div>
              </div>
            </Card>
          ))}

          <Button onClick={handleMixAudio} disabled={loading || tracks.length === 0} className="w-full gap-2 bg-sky-600 hover:bg-sky-700">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Mix Tracks with Server FFmpeg
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-1 border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-sky-500" /> Mixed Output Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!mixedAudio ? (
            <div className="p-8 text-center border-dashed border-2 rounded-xl text-muted-foreground text-sm">
              Mix your tracks to preview the combined server normalized audio output.
            </div>
          ) : (
            <div className="space-y-3 p-4 bg-muted/40 rounded-xl border">
              <p className="text-xs font-semibold text-sky-600 uppercase">FFmpeg Rendered Mix</p>
              <audio src={mixedAudio.output_url || mixedAudio.url} controls className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
