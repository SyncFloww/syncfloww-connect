import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { IdeaWizard, type IdeaFormData } from "./IdeaWizard";
import { ViralityScore } from "./ViralityScore";
import { AgentButton } from "./AgentButton";
import { Plus, Sparkles, Video, TrendingUp, Users, Clock, MoreHorizontal, Rocket } from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  lastEdited: string;
  status: "draft" | "analyzing" | "ready";
  score?: number;
}

const MOCK_PROJECTS: Project[] = [
  {
    id: "1",
    name: "Product Launch Video",
    description: "Brief project description is described here",
    lastEdited: "Edited 3 days ago • You",
    status: "ready",
    score: 85
  },
  {
    id: "2", 
    name: "Brand Awareness Campaign",
    description: "Brief project description is described here",
    lastEdited: "Edited 1 week ago • You",
    status: "analyzing"
  },
  {
    id: "3",
    name: "Educational Series",
    description: "Brief project description is described here", 
    lastEdited: "Edited 2 weeks ago • You",
    status: "draft"
  }
];

const SAMPLE_IDEA = {
  text: "a mom having a \"proud parent\" moment as her young son receives an award",
  score: 71,
  breakdown: {
    hookStrength: 60,
    audienceRelevance: 72,
    emotionalTrigger: 78,
    shareability: 83,
    clarity: 65
  }
};

interface DashboardProps {
  onCreateProject?: () => void;
}

export const Dashboard = ({ onCreateProject }: DashboardProps) => {
  const [showWizard, setShowWizard] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showWorkbench, setShowWorkbench] = useState(false);

  const handleWizardComplete = (data: IdeaFormData) => {
    console.log("Wizard completed with data:", data);
    setShowWorkbench(true);
  };

  const getStatusColor = (status: Project["status"]) => {
    switch (status) {
      case "ready": return "bg-success text-success-foreground";
      case "analyzing": return "bg-highlight text-highlight-foreground";
      case "draft": return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/Icon.png" alt="SyncFloww" className="h-10 w-10" />
              <div>
                <h1 className="text-xl font-bold text-foreground">SyncFloww</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Marketing Suite</p>
              </div>
            </div>
            <Button 
              variant="hero" 
              onClick={() => setShowWizard(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Viral Video
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {!showWorkbench ? (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-primary border-0 text-primary-foreground">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-primary-foreground/80 text-sm">Total Projects</p>
                      <p className="text-2xl font-bold">12</p>
                    </div>
                    <Rocket className="h-8 w-8 text-primary-foreground/80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-secondary border-0 text-secondary-foreground">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-secondary-foreground/80 text-sm">Avg. Score</p>
                      <p className="text-2xl font-bold">76</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-secondary-foreground/80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-ai border-0 text-ai-foreground">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-ai-foreground/80 text-sm">AI Assists</p>
                      <p className="text-2xl font-bold">48</p>
                    </div>
                    <Sparkles className="h-8 w-8 text-ai-foreground/80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">Team Members</p>
                      <p className="text-2xl font-bold text-foreground">3</p>
                    </div>
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Projects List */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">Recent Viral Projects</h2>
                  <Button variant="outline" size="sm">See more</Button>
                </div>

                <div className="space-y-4">
                  {MOCK_PROJECTS.map((project) => (
                    <Card key={project.id} className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-gradient-primary">
                              <Video className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-foreground">{project.name}</h3>
                              <p className="text-sm text-muted-foreground">{project.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Clock className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{project.lastEdited}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {project.score && (
                              <div className="text-center">
                                <div className="text-lg font-bold text-success">{project.score}</div>
                                <div className="text-xs text-muted-foreground">Score</div>
                              </div>
                            )}
                            <Badge className={getStatusColor(project.status)}>
                              {project.status}
                            </Badge>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Quick Actions Sidebar */}
              <div className="space-y-6">
                <Card className="bg-gradient-surface border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-ai" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      variant="gradient" 
                      className="w-full justify-start"
                      onClick={() => setShowWizard(true)}
                    >
                      <Plus className="h-4 w-4" />
                      New Viral Project
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <TrendingUp className="h-4 w-4" />
                      Analyze Existing Idea
                    </Button>
                    
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4" />
                      Team Workspace
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-surface border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>AI Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <p className="text-muted-foreground">
                        💡 <strong>Pro Tip:</strong> Videos with strong emotional hooks score 40% higher in virality
                      </p>
                      <Separator />
                      <p className="text-muted-foreground">
                        🎯 <strong>Target:</strong> Aim for a score above 75 for maximum viral potential
                      </p>
                      <Separator />
                      <p className="text-muted-foreground">
                        🔥 <strong>Trending:</strong> Educational content is performing 60% better this month
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          /* Idea Workbench */
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <Button 
                variant="outline" 
                onClick={() => setShowWorkbench(false)}
                className="mb-4"
              >
                ← Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold text-foreground mb-2">Idea Workbench</h1>
              <p className="text-muted-foreground">Refine and enhance your viral video concept</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Idea Panel */}
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-gradient-surface border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-ai" />
                      Original Idea
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground mb-6 text-lg leading-relaxed">
                      {SAMPLE_IDEA.text}
                    </p>
                    
                    <div className="border-t pt-6">
                      <h4 className="font-medium text-foreground mb-4">Improved Idea</h4>
                      <p className="text-foreground leading-relaxed">
                        Show a mom having a "proud parent" moment as she tears up seeing her young son receives an award
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Agent Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <AgentButton type="improve" onClick={() => {}} />
                  <AgentButton type="variations" onClick={() => {}} />
                  <AgentButton type="script" onClick={() => {}} size="lg" className="sm:col-span-2" />
                </div>
              </div>

              {/* Virality Score Sidebar */}
              <div>
                <ViralityScore score={SAMPLE_IDEA.score} breakdown={SAMPLE_IDEA.breakdown} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Idea Wizard Modal */}
      <IdeaWizard
        open={showWizard}
        onOpenChange={setShowWizard}
        onComplete={handleWizardComplete}
      />
    </div>
  );
};