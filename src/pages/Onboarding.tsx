import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Check, ChevronRight, Link2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import apiClient from "@/lib/apiClient";

const platforms = ["Instagram", "Facebook", "LinkedIn", "X", "TikTok", "Pinterest", "Threads"];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [workspaceName, setWorkspaceName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("");
  const [website, setWebsite] = useState("");
  const [audience, setAudience] = useState("");
  const [voice, setVoice] = useState("");
  const [saving, setSaving] = useState(false);
  const { createWorkspace, currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleWorkspace = async () => {
    if (!workspaceName.trim()) return;
    setSaving(true);
    try {
      await createWorkspace(workspaceName.trim(), workspaceName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
      setStep(2);
    } catch {
      toast({ title: "Could not create workspace", description: "Choose a unique workspace name and try again.", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleBrand = async () => {
    if (!brandName.trim() || !currentWorkspace) return;
    setSaving(true);
    try {
      await apiClient.post(`/api/v1/brands/workspaces/${currentWorkspace.id}/`, {
        name: brandName.trim(), industry, website, target_audience: audience, voice: { tone: voice },
      });
      setStep(3);
    } catch {
      toast({ title: "Could not create brand", description: "Please check the supplied details and try again.", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const next = <Button className="gap-2" disabled={saving}>{saving ? "Saving…" : "Continue"}<ChevronRight className="h-4 w-4" /></Button>;
  return <main className="min-h-screen bg-muted/30 py-10 px-4"><div className="mx-auto max-w-2xl space-y-8">
    <div className="text-center space-y-2"><img src="/Icon.png" alt="SyncFloww" className="mx-auto h-11 w-11" /><h1 className="text-3xl font-bold">Set up your workspace</h1><p className="text-muted-foreground">A few details and you’ll be ready to plan, create, and publish.</p></div>
    <div className="flex justify-between text-xs text-muted-foreground">{["Workspace", "Brand", "Accounts", "Ready"].map((label, index) => <div key={label} className={`flex items-center gap-2 ${step >= index + 1 ? "text-primary font-medium" : ""}`}><span className={`grid h-6 w-6 place-items-center rounded-full border ${step > index + 1 ? "bg-primary text-primary-foreground" : ""}`}>{step > index + 1 ? <Check className="h-4 w-4" /> : index + 1}</span>{label}</div>)}</div>
    {step === 1 && <Card><CardHeader><CardTitle className="flex gap-2"><Building2 /> Create your workspace</CardTitle></CardHeader><CardContent className="space-y-5"><div><Label>Workspace name</Label><Input className="mt-2" autoFocus value={workspaceName} onChange={(event) => setWorkspaceName(event.target.value)} placeholder="e.g. Acme Marketing" /></div><div className="flex justify-end" onClick={handleWorkspace}>{next}</div></CardContent></Card>}
    {step === 2 && <Card><CardHeader><CardTitle className="flex gap-2"><Palette /> Define your first brand</CardTitle></CardHeader><CardContent className="space-y-4"><div><Label>Brand name</Label><Input className="mt-2" value={brandName} onChange={(event) => setBrandName(event.target.value)} /></div><div className="grid gap-4 sm:grid-cols-2"><div><Label>Industry</Label><Input className="mt-2" value={industry} onChange={(event) => setIndustry(event.target.value)} /></div><div><Label>Website</Label><Input className="mt-2" value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://" /></div></div><div><Label>Target audience</Label><Textarea className="mt-2" value={audience} onChange={(event) => setAudience(event.target.value)} /></div><div><Label>Brand voice</Label><Input className="mt-2" value={voice} onChange={(event) => setVoice(event.target.value)} placeholder="e.g. warm, concise and expert" /></div><div className="flex justify-between"><Button variant="ghost" onClick={() => setStep(1)}>Back</Button><span onClick={handleBrand}>{next}</span></div></CardContent></Card>}
    {step === 3 && <Card><CardHeader><CardTitle className="flex gap-2"><Link2 /> Connect social accounts</CardTitle></CardHeader><CardContent><p className="mb-5 text-sm text-muted-foreground">You can connect accounts now or from Social Accounts later.</p><div className="grid gap-3 sm:grid-cols-2">{platforms.map((platform) => <div key={platform} className="flex items-center justify-between rounded-lg border p-3"><span className="font-medium">{platform}</span><Button size="sm" variant="outline" disabled>Connect</Button></div>)}</div><div className="mt-6 flex justify-between"><Button variant="ghost" onClick={() => setStep(2)}>Back</Button><Button onClick={() => setStep(4)}>Continue</Button></div></CardContent></Card>}
    {step === 4 && <Card><CardContent className="py-14 text-center"><div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground"><Check /></div><h2 className="text-2xl font-bold">You’re all set.</h2><p className="mt-2 text-muted-foreground">Your workspace is ready for your first campaign.</p><Button className="mt-6" onClick={() => navigate("/dashboard")}>Go to dashboard</Button></CardContent></Card>}
  </div></main>;
}
