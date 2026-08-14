import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Video, Image as ImageIcon, Mic, Music, FileText, Share2, Layers } from 'lucide-react';

interface AILandingWizardProps {
  onSelectOption: (tabKey: string) => void;
}

export const AILandingWizard: React.FC<AILandingWizardProps> = ({ onSelectOption }) => {
  const creationCards = [
    {
      key: 'ideas',
      title: 'Generate Content Strategy & Ideas',
      desc: 'Hooks, angles, content pillars, and platform recommendations.',
      icon: Sparkles,
      gradient: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
      badge: 'Strategy',
    },
    {
      key: 'script',
      title: 'Write Viral Video Script',
      desc: 'Hooks, body, CTA, visual directions, b-roll & voiceover timing.',
      icon: FileText,
      gradient: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
      badge: 'Script Studio',
    },
    {
      key: 'social',
      title: 'Script → Multi-Social Content',
      desc: 'Transform 1 script into IG, LinkedIn, X, FB, TikTok & YT posts.',
      icon: Share2,
      gradient: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
      badge: 'Converter',
    },
    {
      key: 'image',
      title: 'AI Visual & Image Generation',
      desc: 'Generate 1:1, 4:5, 9:16 & 16:9 social graphics via fal.ai / Replicate.',
      icon: ImageIcon,
      gradient: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30',
      badge: 'Image Studio',
    },
    {
      key: 'video',
      title: 'AI Video Generation',
      desc: 'Text & Image-to-Video generation using Runway Gen3 / Replicate.',
      icon: Video,
      gradient: 'from-rose-500/20 to-red-500/20 border-rose-500/30',
      badge: 'Video Studio',
    },
    {
      key: 'voice',
      title: 'Murf AI Voiceover & Custom Voice',
      desc: 'Studio-quality voiceovers with word-level caption timing.',
      icon: Mic,
      gradient: 'from-indigo-500/20 to-violet-500/20 border-indigo-500/30',
      badge: 'Voice Studio',
    },
    {
      key: 'audio',
      title: 'Audio Studio & FFmpeg Mixer',
      desc: 'Combine voiceovers, background music, and sound effects.',
      icon: Music,
      gradient: 'from-sky-500/20 to-blue-500/20 border-sky-500/30',
      badge: 'Audio Mixer',
    },
    {
      key: 'project',
      title: 'Full Composition & Exporter',
      desc: 'Layer video, voice, subtitles, and export production-ready MP4s.',
      icon: Layers,
      gradient: 'from-fuchsia-500/20 to-pink-500/20 border-fuchsia-500/30',
      badge: 'Timeline',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
          <Sparkles className="w-3.5 h-3.5" /> AI Media Studio Workspace
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">What do you want to create today?</h1>
        <p className="text-muted-foreground text-sm">
          Select a creation workflow to start building high-retention social media assets powered by unified AI providers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {creationCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <Card
              key={card.key}
              onClick={() => onSelectOption(card.key)}
              className={`group relative cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl bg-gradient-to-br ${card.gradient} border backdrop-blur-md overflow-hidden`}
            >
              <CardContent className="p-5 flex flex-col h-full justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-background/80 shadow-sm border">
                      <IconComponent className="w-5 h-5 text-primary group-hover:rotate-6 transition-transform" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-background/80 border text-muted-foreground">
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-base tracking-tight leading-snug group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{card.desc}</p>
                </div>
                <div className="pt-2 flex items-center text-xs font-semibold text-primary">
                  Start creation →
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
