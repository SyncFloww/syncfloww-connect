import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Sparkles, Wand2, History, Share2, Copy, Save, Check } from 'lucide-react';
import { aiStudioApi, AIScript } from '@/services/aiStudioService';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useQuery } from '@tanstack/react-query';
import { brandsListQuery } from '@/features/brands/queries';

interface ScriptStudioViewProps {
  initialTopic?: string;
  onConvertToSocial?: (script: AIScript) => void;
}

export const ScriptStudioView: React.FC<ScriptStudioViewProps> = ({ initialTopic = '', onConvertToSocial }) => {
  const [topic, setTopic] = useState(initialTopic);
  const [platform, setPlatform] = useState('tiktok');
  const [tone, setTone] = useState('High Energy');
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace ? String(currentWorkspace.id) : '';
  const { data: brands = [], isLoading: brandsLoading } = useQuery(brandsListQuery(workspaceId));
  const [chosenBrand, setChosenBrand] = useState('');
  const storedBrand = workspaceId ? localStorage.getItem('syncflow-active-brand-' + workspaceId) : null;
  const brandId = [chosenBrand, storedBrand].find((id) => brands.some((brand) => String(brand.id) === id)) || (brands[0] ? String(brands[0].id) : '');

  const [activeScript, setActiveScript] = useState<AIScript | null>(null);

  const handleGenerateScript = async () => {
    if (!topic.trim() || loading) return;
    if (!brandId || !workspaceId) { setError('Set up a brand before generating a script.'); return; }
    setLoading(true);
    setError('');
    try {
      const script = await aiStudioApi.generateScript({
        topic,
        platform,
        tone,
        duration,
        brand: Number(brandId),
        workspace: Number(workspaceId),
      });
      setActiveScript(script);
    } catch (e) {
      setError('Script generation is unavailable. Please try again shortly. Your saved brand details are safe.');
      console.error('Failed to generate script:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicAction = async (actionType: string) => {
    if (!activeScript) return;
    setLoading(true);
    try {
      const res = await aiStudioApi.executeMagicAction({
        action: actionType,
        text: activeScript.voiceover_text || activeScript.body,
        tone,
      });
      const updated = {
        ...activeScript,
        voiceover_text: res.result_text,
        body: res.result_text,
      };
      setActiveScript(updated);
      // Save version
      await aiStudioApi.saveScriptVersion(activeScript.id, `AI Magic Action: ${actionType}`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!activeScript) return;
    const textToCopy = `HOOK: ${activeScript.hook}\n\nBODY:\n${activeScript.body}\n\nCTA: ${activeScript.cta}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Configuration Column */}
      <Card className="lg:col-span-1 border shadow-sm h-fit">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" /> AI Script Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p role="alert" className="rounded-md border border-destructive p-3 text-sm">{error}</p>}
          <div className="space-y-2"><Label htmlFor="script-brand">Brand context</Label><select id="script-brand" className="w-full rounded-md border bg-background p-2" value={brandId} disabled={loading || brandsLoading} onChange={(event) => { setChosenBrand(event.target.value); setActiveScript(null); }}>
            {!brands.length && <option value="">Set up your brand first</option>}
            {brands.map((brand) => <option key={brand.id} value={String(brand.id)}>{brand.name}</option>)}
          </select><a href="/onboarding" className="text-sm text-primary underline">Review brand details</a></div>
          <div className="space-y-2">
            <Label>Video Topic / Prompt</Label>
            <Input
              placeholder="e.g. 3 Secret AI Tools for Social Media Managers"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Target Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="reels">Instagram Reels</SelectItem>
                <SelectItem value="shorts">YouTube Shorts</SelectItem>
                <SelectItem value="youtube">YouTube Longform</SelectItem>
                <SelectItem value="linkedin">LinkedIn Video</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tone of Voice</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High Energy">High Energy & Viral</SelectItem>
                <SelectItem value="Educational">Educational & Direct</SelectItem>
                <SelectItem value="Storytelling">Storytelling & Emotional</SelectItem>
                <SelectItem value="Corporate">Corporate & Professional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Target Duration</Label>
            <Select value={String(duration)} onValueChange={(val) => setDuration(Number(val))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 Seconds (Super Short)</SelectItem>
                <SelectItem value="30">30 Seconds (Standard Short)</SelectItem>
                <SelectItem value="60">60 Seconds (Detailed Short)</SelectItem>
                <SelectItem value="180">3 Minutes (In-Depth)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleGenerateScript} disabled={loading || !topic} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
            {loading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            Generate AI Script
          </Button>
        </CardContent>
      </Card>

      {/* Script Display & Editing Column */}
      <div className="lg:col-span-2 space-y-4">
        {!activeScript ? (
          <Card className="p-12 text-center border-dashed border-2">
            <FileText className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="text-lg font-semibold">No Script Loaded</h3>
            <p className="text-sm text-muted-foreground">Enter your topic on the left to build a structured short-form video script.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card className="border">
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <div>
                  <CardTitle className="text-xl font-bold">{activeScript.title}</CardTitle>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="uppercase">{activeScript.platform}</Badge>
                    <Badge variant="secondary">{activeScript.duration_seconds}s</Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard} className="gap-1">
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  {onConvertToSocial && (
                    <Button size="sm" onClick={() => onConvertToSocial(activeScript)} className="gap-1 bg-purple-600 hover:bg-purple-700">
                      Convert to Social <Share2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* AI Magic Rewrite Bar */}
                <div className="p-3 bg-muted/40 rounded-xl border flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                    <Wand2 className="w-3.5 h-3.5 text-primary" /> AI Refine:
                  </span>
                  <Button variant="secondary" size="xs" onClick={() => handleMagicAction('viral_hook')}>
                    🔥 Make Hook Viral
                  </Button>
                  <Button variant="secondary" size="xs" onClick={() => handleMagicAction('shorten')}>
                    ✂️ Shorten Text
                  </Button>
                  <Button variant="secondary" size="xs" onClick={() => handleMagicAction('expand')}>
                    📝 Expand Details
                  </Button>
                </div>

                {/* Hook Section */}
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase font-bold text-amber-500">1. High-Retention Hook (0 - 3s)</Label>
                  <Textarea
                    className="font-bold text-base bg-amber-500/5 border-amber-500/20"
                    rows={2}
                    value={activeScript.hook}
                    onChange={(e) => setActiveScript({ ...activeScript, hook: e.target.value })}
                  />
                </div>

                {/* Body Section */}
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase font-bold text-blue-500">2. Core Body Content (3s - 25s)</Label>
                  <Textarea
                    rows={5}
                    value={activeScript.body}
                    onChange={(e) => setActiveScript({ ...activeScript, body: e.target.value })}
                  />
                </div>

                {/* CTA Section */}
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase font-bold text-emerald-500">3. Call to Action (25s - 30s)</Label>
                  <Textarea
                    rows={2}
                    className="bg-emerald-500/5 border-emerald-500/20"
                    value={activeScript.cta}
                    onChange={(e) => setActiveScript({ ...activeScript, cta: e.target.value })}
                  />
                </div>

                {/* Visual Directions */}
                <div className="space-y-1.5 pt-2 border-t">
                  <Label className="text-xs uppercase font-bold text-muted-foreground">Visual Directions & B-Roll Cues</Label>
                  <p className="text-xs text-muted-foreground bg-muted p-3 rounded-lg border">{activeScript.visual_directions}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
