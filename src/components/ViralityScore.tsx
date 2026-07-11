import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Flame, TrendingUp } from "lucide-react";

interface ViralityScoreProps {
  score: number;
  breakdown: {
    hookStrength: number;
    audienceRelevance: number;
    emotionalTrigger: number;
    shareability: number;
    clarity: number;
  };
}

export const ViralityScore = ({ score, breakdown }: ViralityScoreProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-highlight";
    return "text-destructive";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return "from-success to-success/80";
    if (score >= 60) return "from-highlight to-highlight/80";
    return "from-destructive to-destructive/80";
  };

  return (
    <Card className="p-6 bg-gradient-surface border-0 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Virality Score</h3>
        <Flame className="h-5 w-5 text-ai" />
      </div>
      
      {/* Main Score Display */}
      <div className="flex items-center justify-center mb-8">
        <div className="relative">
          <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${getScoreGradient(score)} p-1 shadow-glow animate-pulse-glow`}>
            <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
                  {score}
                </div>
                <div className="text-sm text-muted-foreground">Potential</div>
              </div>
            </div>
          </div>
          <TrendingUp className="absolute -top-2 -right-2 h-6 w-6 text-ai animate-bounce" />
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-4">
        <h4 className="font-medium text-foreground mb-3">Breakdown</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Hook strength</span>
            <span className="text-sm font-medium">{breakdown.hookStrength}</span>
          </div>
          <Progress value={breakdown.hookStrength} className="h-2" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Audience Relevance</span>
            <span className="text-sm font-medium">{breakdown.audienceRelevance}</span>
          </div>
          <Progress value={breakdown.audienceRelevance} className="h-2" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Emotional Trigger</span>
            <span className="text-sm font-medium">{breakdown.emotionalTrigger}</span>
          </div>
          <Progress value={breakdown.emotionalTrigger} className="h-2" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Shareability</span>
            <span className="text-sm font-medium">{breakdown.shareability}</span>
          </div>
          <Progress value={breakdown.shareability} className="h-2" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Clarity</span>
            <span className="text-sm font-medium">{breakdown.clarity}</span>
          </div>
          <Progress value={breakdown.clarity} className="h-2" />
        </div>
      </div>
    </Card>
  );
};