import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Shuffle, FileText, Share, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentButtonProps {
  type: "improve" | "variations" | "script" | "share" | "analyze" | "magic";
  loading?: boolean;
  onClick: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const AGENT_CONFIG = {
  improve: {
    icon: TrendingUp,
    label: "Improve My Idea",
    description: "Get AI suggestions to boost your score",
    gradient: "from-success to-success/80",
    shadow: "shadow-glow"
  },
  variations: {
    icon: Shuffle,
    label: "Create Variations",
    description: "Generate alternative versions",
    gradient: "from-secondary to-secondary/80",
    shadow: "shadow-ai"
  },
  script: {
    icon: FileText,
    label: "Summon the Scriptwriting Agent",
    description: "Generate complete production package",
    gradient: "from-primary to-primary/80",
    shadow: "shadow-glow"
  },
  share: {
    icon: Share,
    label: "Share Project",
    description: "Collaborate with your team",
    gradient: "from-highlight to-highlight/80",
    shadow: "shadow-md"
  },
  analyze: {
    icon: Sparkles,
    label: "Get Virality Score",
    description: "Analyze your idea's potential",
    gradient: "from-ai to-ai/80",
    shadow: "shadow-ai"
  },
  magic: {
    icon: Wand2,
    label: "AI Magic",
    description: "Let AI enhance your idea",
    gradient: "from-gradient-hero",
    shadow: "shadow-xl"
  }
};

export const AgentButton = ({ 
  type, 
  loading = false, 
  onClick, 
  className, 
  size = "md" 
}: AgentButtonProps) => {
  const config = AGENT_CONFIG[type];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <Button
      onClick={onClick}
      disabled={loading}
      className={cn(
        "relative overflow-hidden group transition-all duration-300 hover:scale-105",
        `bg-gradient-to-r ${config.gradient}`,
        config.shadow,
        "border-0 text-white font-medium",
        sizeClasses[size],
        loading && "animate-pulse",
        className
      )}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      {/* Content */}
      <div className="relative flex items-center gap-2">
        <Icon className={cn(
          "flex-shrink-0",
          size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5",
          loading && "animate-spin"
        )} />
        <span>{config.label}</span>
      </div>
      
      {/* Tooltip description for larger sizes */}
      {size !== "sm" && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          {config.description}
        </div>
      )}
    </Button>
  );
};