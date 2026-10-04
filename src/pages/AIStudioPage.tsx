import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAIStudio } from '@/hooks/useAIStudio';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Wand2, Video, Image as ImageIcon, Mic, Music, FileText, Share2, Layers, Subtitles, History, DollarSign } from 'lucide-react';

import { AILandingWizard } from '@/components/ai-studio/AILandingWizard';
import { IdeaGeneratorView } from '@/components/ai-studio/IdeaGeneratorView';
import { ScriptStudioView } from '@/components/ai-studio/ScriptStudioView';
import { SocialContentConverterView } from '@/components/ai-studio/SocialContentConverterView';
import { ImageGeneratorView } from '@/components/ai-studio/ImageGeneratorView';
import { VideoGeneratorView } from '@/components/ai-studio/VideoGeneratorView';
import { VoiceStudioView } from '@/components/ai-studio/VoiceStudioView';
import { AudioStudioView } from '@/components/ai-studio/AudioStudioView';
import { CaptionStudioView } from '@/components/ai-studio/CaptionStudioView';
import { AIContentEditorView } from '@/components/ai-studio/AIContentEditorView';
import { ProjectEditorView } from '@/components/ai-studio/ProjectEditorView';
import { GenerationHistoryView } from '@/components/ai-studio/GenerationHistoryView';

export default function AIStudioPage() {
  const { projects, activeProject, setActiveProject, jobs, scripts, refreshData } = useAIStudio();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'script' ? 'script' : 'wizard');
  const [selectedScriptId, setSelectedScriptId] = useState<number | undefined>(undefined);
  const [scriptTopic, setScriptTopic] = useState('');

  const handleSelectFromWizard = (tabKey: string) => {
    setActiveTab(tabKey);
  };

  const handleConvertToScript = (idea: any) => {
    setScriptTopic(idea.title || idea.hook);
    setActiveTab('script');
  };

  const handleConvertToSocial = (script: any) => {
    setSelectedScriptId(script.id);
    setActiveTab('social');
  };

  const presets = [
    { name: 'Instagram Reel', ratio: '9:16', limit: '2,200 chars' },
    { name: 'TikTok', ratio: '9:16', limit: '2,200 chars' },
    { name: 'YouTube Short', ratio: '9:16', limit: '500 chars' },
    { name: 'YouTube Video', ratio: '16:9', limit: '5,000 chars' },
    { name: 'LinkedIn Post', ratio: '1:1', limit: '3,000 chars' },
    { name: 'X Thread', ratio: '1:1', limit: '280 chars/tweet' },
  ];

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight">Syncfloww AI Media Studio</h1>
            <Badge className="bg-primary/10 text-primary border-primary/20">MVP Preview</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Unified AI Generation & Media Creation Platform • Workspace Isolated
          </p>
        </div>

        <div className="flex items-center gap-2">
          {projects.length > 0 && (
            <Badge variant="outline" className="px-3 py-1 font-semibold">
              Project: {activeProject?.title || 'Default Studio'}
            </Badge>
          )}
        </div>
      </div>

      {/* Preset Formats Bar */}
      <div className="p-3 bg-muted/40 rounded-xl border flex flex-wrap items-center gap-3 text-xs">
        <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Format Presets:</span>
        {presets.map((pr, i) => (
          <div key={i} className="px-2.5 py-1 bg-background rounded-md border flex items-center gap-1.5 font-medium shadow-2xs">
            <span>{pr.name}</span>
            <span className="text-[10px] text-muted-foreground">({pr.ratio})</span>
          </div>
        ))}
      </div>

      {/* Studio Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <div className="overflow-x-auto pb-1">
          <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground min-w-full sm:min-w-0">
            <TabsTrigger value="wizard" className="gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5" /> Creation Studio
            </TabsTrigger>
            <TabsTrigger value="ideas" className="gap-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Ideas
            </TabsTrigger>
            <TabsTrigger value="script" className="gap-1.5 text-xs">
              <FileText className="w-3.5 h-3.5 text-blue-500" /> Script Studio
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-1.5 text-xs">
              <Share2 className="w-3.5 h-3.5 text-purple-500" /> Social Content
            </TabsTrigger>
            <TabsTrigger value="image" className="gap-1.5 text-xs">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-500" /> Image Studio
            </TabsTrigger>
            <TabsTrigger value="video" className="gap-1.5 text-xs">
              <Video className="w-3.5 h-3.5 text-rose-500" /> Video Studio
            </TabsTrigger>
            <TabsTrigger value="voice" className="gap-1.5 text-xs">
              <Mic className="w-3.5 h-3.5 text-indigo-500" /> Murf Voice
            </TabsTrigger>
            <TabsTrigger value="audio" className="gap-1.5 text-xs">
              <Music className="w-3.5 h-3.5 text-sky-500" /> Audio Mixer
            </TabsTrigger>
            <TabsTrigger value="captions" className="gap-1.5 text-xs">
              <Subtitles className="w-3.5 h-3.5 text-yellow-500" /> Subtitles
            </TabsTrigger>
            <TabsTrigger value="editor" className="gap-1.5 text-xs">
              <Wand2 className="w-3.5 h-3.5 text-purple-500" /> Magic Editor
            </TabsTrigger>
            <TabsTrigger value="project" className="gap-1.5 text-xs">
              <Layers className="w-3.5 h-3.5 text-fuchsia-500" /> Exporter
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5 text-xs">
              <History className="w-3.5 h-3.5" /> History
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="wizard">
          <AILandingWizard onSelectOption={handleSelectFromWizard} />
        </TabsContent>

        <TabsContent value="ideas">
          <IdeaGeneratorView onConvertToScript={handleConvertToScript} />
        </TabsContent>

        <TabsContent value="script">
          <ScriptStudioView initialTopic={scriptTopic} onConvertToSocial={handleConvertToSocial} />
        </TabsContent>

        <TabsContent value="social">
          <SocialContentConverterView scriptId={selectedScriptId || (scripts.length > 0 ? scripts[0].id : undefined)} />
        </TabsContent>

        <TabsContent value="image">
          <ImageGeneratorView />
        </TabsContent>

        <TabsContent value="video">
          <VideoGeneratorView />
        </TabsContent>

        <TabsContent value="voice">
          <VoiceStudioView />
        </TabsContent>

        <TabsContent value="audio">
          <AudioStudioView />
        </TabsContent>

        <TabsContent value="captions">
          <CaptionStudioView />
        </TabsContent>

        <TabsContent value="editor">
          <AIContentEditorView />
        </TabsContent>

        <TabsContent value="project">
          <ProjectEditorView project={activeProject} />
        </TabsContent>

        <TabsContent value="history">
          <GenerationHistoryView jobs={jobs} onRefresh={refreshData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
