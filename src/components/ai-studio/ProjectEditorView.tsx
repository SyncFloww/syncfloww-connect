import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Layers, Sparkles, Film, Mic, Image as ImageIcon, Subtitles, Download, Share2 } from 'lucide-react';
import { AIContentProject } from '@/services/aiStudioService';

interface ProjectEditorViewProps {
  project: AIContentProject | null;
}

export const ProjectEditorView: React.FC<ProjectEditorViewProps> = ({ project }) => {
  const [exporting, setExporting] = useState(false);
  const [exportedUrl, setExportedUrl] = useState<string | null>(project?.export_url || null);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setExportedUrl('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4');
    }, 2500);
  };

  if (!project) {
    return (
      <Card className="p-12 text-center border-dashed border-2">
        <Layers className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
        <h3 className="text-lg font-semibold">No Active Project Selected</h3>
        <p className="text-sm text-muted-foreground">Select or create a project from the Studio toolbar to compose multi-asset social videos.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Layers className="w-5 h-5 text-fuchsia-500" /> {project.title}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Preset Format: {project.preset_format} ({project.target_platform})</p>
          </div>
          <Button onClick={handleExport} disabled={exporting} className="bg-fuchsia-600 hover:bg-fuchsia-700 gap-2">
            {exporting ? <Sparkles className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
            {exporting ? 'Rendering MP4...' : 'Render & Export Final MP4'}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Timeline composition visual representation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Multi-Track Composition Timeline</h4>

            <div className="space-y-2">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center justify-between text-xs">
                <span className="font-semibold flex items-center gap-2 text-rose-600">
                  <Film className="w-4 h-4" /> Video Layer (Runway Gen3)
                </span>
                <Badge variant="outline">0:00 - 0:30</Badge>
              </div>

              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-center justify-between text-xs">
                <span className="font-semibold flex items-center gap-2 text-indigo-600">
                  <Mic className="w-4 h-4" /> Voiceover Layer (Murf AI Natalie)
                </span>
                <Badge variant="outline">0:00 - 0:28</Badge>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center justify-between text-xs">
                <span className="font-semibold flex items-center gap-2 text-amber-600">
                  <Subtitles className="w-4 h-4" /> Subtitle Caption Layer (Synced SRT)
                </span>
                <Badge variant="outline">0:00 - 0:28</Badge>
              </div>
            </div>
          </div>

          {exportedUrl && (
            <div className="p-4 bg-muted/40 rounded-xl border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-fuchsia-600">Rendered Social Export MP4</span>
                <Button variant="outline" size="sm" asChild className="gap-1">
                  <a href={exportedUrl} download target="_blank" rel="noreferrer">
                    <Download className="w-4 h-4" /> Download Export
                  </a>
                </Button>
              </div>
              <video src={exportedUrl} controls className="w-full max-h-80 rounded-lg border bg-black" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
