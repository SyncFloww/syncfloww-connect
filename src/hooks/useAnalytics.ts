import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/apiServices';
import { useToast } from '@/hooks/use-toast';

export function useAnalytics() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const dashboardQuery = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: () => analyticsApi.getDashboard(),
  });

  const dailyQuery = useQuery({
    queryKey: ['analytics-daily'],
    queryFn: () => analyticsApi.getDailyAnalytics(),
  });

  const collectMutation = useMutation({
    mutationFn: () => analyticsApi.collectMetrics(),
    onSuccess: () => {
      toast({ title: 'Metrics Refreshed', description: 'Analytics collected successfully.' });
      queryClient.invalidateQueries({ queryKey: ['analytics-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-daily'] });
    },
    onError: (err: any) => {
      toast({
        title: 'Refresh Failed',
        description: err.response?.data?.detail || err.message || 'Could not trigger metric collection',
        variant: 'destructive',
      });
    },
  });

  return {
    dashboard: dashboardQuery.data,
    isLoadingDashboard: dashboardQuery.isLoading,
    dailyAnalytics: dailyQuery.data || [],
    isLoadingDaily: dailyQuery.isLoading,
    refreshMetrics: collectMutation.mutateAsync,
    isRefreshing: collectMutation.isPending,
    refetchDashboard: dashboardQuery.refetch,
  };
}
