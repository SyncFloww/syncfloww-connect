import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Target, Palette, Monitor, ArrowLeft, ArrowRight } from "lucide-react";

interface IdeaWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: IdeaFormData) => void;
}

export interface IdeaFormData {
  projectName: string;
  videoType: "personal" | "brand";
  niche: string;
  targetAudience: string;
  goal: string;
  tone: string[];
  platform: string;
  format: string;
}

const STEPS = [
  { id: 1, title: "Define your project", icon: Target },
  { id: 2, title: "What type of video do you want to make?", icon: Monitor },
  { id: 3, title: "About tone of your video", icon: Palette },
];

const TONES = [
  "Bold", "Playful", "Emotional", "Inspirational",
  "Educational", "Calm / Professional", "Others"
];

const GOALS = [
  "Get more visibility / Awareness",
  "Sell a product / service", 
  "Build a personal brand",
  "Other"
];

export const IdeaWizard = ({ open, onOpenChange, onComplete }: IdeaWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<IdeaFormData>({
    projectName: "",
    videoType: "brand",
    niche: "",
    targetAudience: "",
    goal: "",
    tone: [],
    platform: "youtube-shorts",
    format: "talking-head"
  });

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(formData);
      onOpenChange(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleToneToggle = (tone: string) => {
    setFormData(prev => ({
      ...prev,
      tone: prev.tone.includes(tone)
        ? prev.tone.filter(t => t !== tone)
        : [...prev.tone, tone]
    }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.projectName && formData.goal;
      case 2:
        return formData.niche && formData.targetAudience;
      case 3:
        return formData.tone.length > 0;
      default:
        return false;
    }
  };

  const progress = (currentStep / STEPS.length) * 100;
  const CurrentIcon = STEPS[currentStep - 1]?.icon || Sparkles;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gradient-surface border-0 shadow-xl">
        <DialogHeader className="pb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <CurrentIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <DialogTitle className="text-xl">Let's get started in 3 steps!</DialogTitle>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-4 mb-6">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center gap-2">
                <div className={`w-8 h-2 rounded-full transition-all duration-300 ${
                  index + 1 <= currentStep ? 'bg-gradient-primary' : 'bg-muted'
                }`} />
                {index < STEPS.length - 1 && (
                  <div className="w-8 h-px bg-border" />
                )}
              </div>
            ))}
          </div>
          
          <Progress value={progress} className="h-1" />
        </DialogHeader>

        <div className="space-y-6 animate-scale-in">
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">1. Define your project</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="projectName">What's the name of your project?</Label>
                  <Input
                    id="projectName"
                    placeholder="E.g. Campaign #1"
                    value={formData.projectName}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Video Type</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="videoType"
                        value="personal"
                        checked={formData.videoType === "personal"}
                        onChange={(e) => setFormData(prev => ({ ...prev, videoType: e.target.value as "personal" | "brand" }))}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 ${formData.videoType === "personal" ? 'bg-primary border-primary' : 'border-muted'}`} />
                      <span>Personal</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="videoType"
                        value="brand"
                        checked={formData.videoType === "brand"}
                        onChange={(e) => setFormData(prev => ({ ...prev, videoType: e.target.value as "personal" | "brand" }))}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 ${formData.videoType === "brand" ? 'bg-primary border-primary' : 'border-muted'}`} />
                      <span>Brand</span>
                    </label>
                  </div>
                </div>

                <div>
                  <Label>Target outcome for your video</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {GOALS.map((goal) => (
                      <label key={goal} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={formData.goal === goal}
                          onCheckedChange={() => setFormData(prev => ({ ...prev, goal }))}
                        />
                        <span className="text-sm">{goal}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">2. What type of video do you want to make?</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="niche">What's your core niche or focus for this video</Label>
                  <Input
                    id="niche"
                    placeholder="E.g. type here"
                    value={formData.niche}
                    onChange={(e) => setFormData(prev => ({ ...prev, niche: e.target.value }))}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="audience">Who's your target audience for this video</Label>
                  <Textarea
                    id="audience"
                    placeholder="E.g. describe your target audience"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                    className="mt-2 min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground mt-1">(Try to give as much detail as you can)</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">3. About tone of your video</h3>
              
              <div className="space-y-4">
                <div>
                  <Label>What tone or personality should your video have?</Label>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {TONES.map((tone) => (
                      <label key={tone} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={formData.tone.includes(tone)}
                          onCheckedChange={() => handleToneToggle(tone)}
                        />
                        <span className="text-sm">{tone}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={formData.platform} onValueChange={(value) => setFormData(prev => ({ ...prev, platform: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube-shorts">Youtube shorts</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="instagram-reels">Instagram Reels</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="format">Preferred format</Label>
                  <Select value={formData.format} onValueChange={(value) => setFormData(prev => ({ ...prev, format: value }))}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="talking-head">Talking head</SelectItem>
                      <SelectItem value="voiceover">Voiceover</SelectItem>
                      <SelectItem value="text-only">Text only</SelectItem>
                      <SelectItem value="animation">Animation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!isStepValid()}
            className="flex items-center gap-2 bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            {currentStep === STEPS.length ? "Generate Ideas" : "Next"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};