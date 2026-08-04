import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsApi, Campaign, CampaignGoal } from '@/lib/apiServices';
import { useToast } from '@/hooks/use-toast';

export function useCampaigns() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const campaignsQuery = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignsApi.getCampaigns(),
  });

  const createCampaignMutation = useMutation({
    mutationFn: (campaign: Partial<Campaign>) => campaignsApi.createCampaign(campaign),
    onSuccess: () => {
      toast({ title: 'Campaign Created', description: 'Campaign added successfully.' });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.response?.data?.detail || err.message || 'Failed to create campaign.',
        variant: 'destructive',
      });
    },
  });

  const updateCampaignMutation = useMutation({
    mutationFn: ({ id, campaign }: { id: number; campaign: Partial<Campaign> }) =>
      campaignsApi.updateCampaign(id, campaign),
    onSuccess: () => {
      toast({ title: 'Campaign Updated', description: 'Changes saved successfully.' });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: (id: number) => campaignsApi.deleteCampaign(id),
    onSuccess: () => {
      toast({ title: 'Campaign Deleted', description: 'Campaign removed.' });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });

  return {
    campaigns: campaignsQuery.data || [],
    isLoading: campaignsQuery.isLoading,
    createCampaign: createCampaignMutation.mutateAsync,
    isCreating: createCampaignMutation.isPending,
    updateCampaign: updateCampaignMutation.mutateAsync,
    deleteCampaign: deleteCampaignMutation.mutateAsync,
    refetchCampaigns: campaignsQuery.refetch,
  };
}
