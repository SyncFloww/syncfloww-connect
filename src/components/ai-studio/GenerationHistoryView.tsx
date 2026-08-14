import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AIJob, aiStudioApi } from '@/services/aiStudioService';

interface GenerationHistoryViewProps {
  jobs: AIJob[];
  onRefresh?: () => void;
}

export const GenerationHistoryView: React.FC<GenerationHistoryViewProps> = ({ jobs, onRefresh }) => {
  const handleRetry = async (jobId: string) => {
    try {
      await aiStudioApi.retryJob(jobId);
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Card className="border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="w-5 h-5 text-primary" /> AI Generation Job Queue & History
        </CardTitle>
        <Button variant="outline" size="sm" onClick={onRefresh} className="gap-1">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Jobs
        </Button>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No AI generation jobs recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {jobs.map((j) => (
              <div key={j.id} className="p-4 bg-muted/30 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="uppercase font-bold text-[10px]">
                      {j.job_type}
                    </Badge>
                    <Badge
                      className={
                        j.status === 'COMPLETED'
                          ? 'bg-green-500/10 text-green-600 border-green-500/20'
                          : j.status === 'FAILED'
                          ? 'bg-red-500/10 text-red-600 border-red-500/20'
                          : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                      }
                    >
                      {j.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3 mr-1 inline" />}
                      {j.status === 'FAILED' && <AlertCircle className="w-3 h-3 mr-1 inline" />}
                      {j.status} ({j.progress}%)
                    </Badge>
                    <span className="text-xs text-muted-foreground">Provider: {j.provider}</span>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground">Job ID: {j.id}</p>
                </div>

                <div className="flex items-center gap-2">
                  {j.status === 'FAILED' && (
                    <Button variant="outline" size="xs" onClick={() => handleRetry(j.id)} className="gap-1 text-xs">
                      <RefreshCw className="w-3 h-3" /> Retry
                    </Button>
                  )}
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(j.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
