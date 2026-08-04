import React, { useState } from 'react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Target, DollarSign, Calendar, Play, Pause, Trash2, CheckCircle2 } from 'lucide-react';
import { Campaign } from '@/lib/apiServices';

export default function Campaigns() {
  const { campaigns, isLoading, createCampaign, updateCampaign, deleteCampaign } = useCampaigns();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    await createCampaign({
      name,
      description,
      budget_allocated: budget ? parseFloat(budget) : 0,
      status: 'draft',
    });
    setName('');
    setDescription('');
    setBudget('');
    setIsOpen(false);
  };

  const toggleStatus = async (campaign: Campaign) => {
    const nextStatus = campaign.status === 'active' ? 'paused' : 'active';
    await updateCampaign({ id: campaign.id, campaign: { status: nextStatus } });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campaign Management</h1>
          <p className="text-muted-foreground text-sm">
            Orchestrate multi-channel marketing campaigns, track goals, and measure budgets.
          </p>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Marketing Campaign</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Campaign Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Q4 Growth Sprint"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief campaign objective..."
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Budget Allocated ($)</label>
                <Input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="1000"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Campaign</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-xl bg-card animate-pulse border" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="space-y-3">
            <Target className="w-12 h-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">No Campaigns Found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Create your first omnichannel campaign to start tracking marketing outcomes across platforms.
            </p>
            <Button onClick={() => setIsOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Create Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((c) => (
            <Card key={c.id} className="relative overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <span
                    className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      c.status === 'active'
                        ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                        : c.status === 'paused'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {c.status.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                      onClick={() => toggleStatus(c)}
                    >
                      {c.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      onClick={() => deleteCampaign(c.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg mt-2 truncate">{c.name}</CardTitle>
                <CardDescription className="line-clamp-2">{c.description || 'No description provided.'}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 text-sm border-t pt-4">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-primary" /> Budget
                  </span>
                  <span className="font-semibold text-foreground">
                    ${c.budget_spent || 0} / ${c.budget_allocated || 0}
                  </span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        ((c.budget_spent || 0) / (c.budget_allocated || 1)) * 100
                      )}%`,
                    }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs text-muted-foreground pt-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Created {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
