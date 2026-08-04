import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialApi, SocialAccount } from '@/lib/apiServices';
import { useToast } from '@/hooks/use-toast';

export function useSocialOAuth(brandId?: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const accountsQuery = useQuery({
    queryKey: ['social-accounts', brandId],
    queryFn: () => socialApi.getAccounts(brandId),
  });

  const providersQuery = useQuery({
    queryKey: ['social-providers'],
    queryFn: () => socialApi.getProviders(),
  });

  const disconnectMutation = useMutation({
    mutationFn: (id: number) => socialApi.disconnectAccount(id),
    onSuccess: () => {
      toast({ title: 'Account Disconnected', description: 'Social platform account unlinked.' });
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
    },
    onError: (err: any) => {
      toast({
        title: 'Disconnect Failed',
        description: err.response?.data?.detail || err.message || 'Could not disconnect account',
        variant: 'destructive',
      });
    },
  });

  const connectAccountMutation = useMutation({
    mutationFn: ({ platform, payload }: { platform: string; payload: any }) =>
      socialApi.connectAccount(platform, payload),
    onSuccess: () => {
      toast({ title: 'Account Connected', description: 'Social media account linked successfully.' });
      queryClient.invalidateQueries({ queryKey: ['social-accounts'] });
    },
  });

  const handleAuthorize = async (platform: string) => {
    try {
      const data = await socialApi.getAuthorizeUrl(platform);
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({ title: 'OAuth Init', description: `Initializing ${platform} authorization...` });
      }
    } catch (err: any) {
      toast({
        title: 'OAuth Error',
        description: err.response?.data?.detail || err.message || 'Failed to start authorization',
        variant: 'destructive',
      });
    }
  };

  return {
    accounts: accountsQuery.data || [],
    isLoadingAccounts: accountsQuery.isLoading,
    providers: providersQuery.data,
    disconnectAccount: disconnectMutation.mutateAsync,
    isDisconnecting: disconnectMutation.isPending,
    connectAccount: connectAccountMutation.mutateAsync,
    handleAuthorize,
    refetchAccounts: accountsQuery.refetch,
  };
}
