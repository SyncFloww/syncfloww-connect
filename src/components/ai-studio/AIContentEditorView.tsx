import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Wand2, Sparkles, RefreshCw, Copy, Check } from 'lucide-react';
import { aiStudioApi } from '@/services/aiStudioService';

export const AIContentEditorView: React.FC = () => {
  const [content, setContent] = useState('Syncfloww AI Media Studio provides end-to-end multi-agent creation workflows.');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleMagicAction = async (action: string) => {
    if (!content) return;
    setLoading(true);
    try {
      const res = await aiStudioApi.executeMagicAction({ action, text: content });
      setHistory([content, ...history]);
      setContent(res.result_text);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyContent = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-500" /> AI Unified Magic Editor
          </CardTitle>
          <Button variant="outline" size="sm" onClick={copyContent} className="gap-1">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 bg-muted/40 rounded-xl border flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" /> AI Actions:
            </span>
            <Button variant="secondary" size="xs" onClick={() => handleMagicAction('rewrite')} disabled={loading}>
              ✨ Rewrite & Improve
            </Button>
            <Button variant="secondary" size="xs" onClick={() => handleMagicAction('viral_hook')} disabled={loading}>
              🔥 Add Viral Hook
            </Button>
            <Button variant="secondary" size="xs" onClick={() => handleMagicAction('shorten')} disabled={loading}>
              ✂️ Shorten
            </Button>
            <Button variant="secondary" size="xs" onClick={() => handleMagicAction('expand')} disabled={loading}>
              📝 Expand
            </Button>
            <Button variant="secondary" size="xs" onClick={() => handleMagicAction('make_professional')} disabled={loading}>
              💼 Make Professional
            </Button>
          </div>

          <Textarea
            rows={10}
            className="text-base leading-relaxed"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card className="lg:col-span-1 border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base font-bold">Revision History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {history.length === 0 ? (
            <p className="text-xs text-muted-foreground">No previous revisions yet. Perform an AI action to create version history.</p>
          ) : (
            history.map((rev, i) => (
              <div key={i} className="p-3 bg-muted/50 rounded-lg border text-xs space-y-1">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Version {history.length - i}</span>
                  <Button variant="ghost" size="xs" onClick={() => setContent(rev)}>
                    Restore
                  </Button>
                </div>
                <p className="line-clamp-2 text-foreground">{rev}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
