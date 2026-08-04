import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmApi, Lead, Deal, Contact } from '@/lib/apiServices';
import { useToast } from '@/hooks/use-toast';

export function useCRM() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const leadsQuery = useQuery({
    queryKey: ['crm-leads'],
    queryFn: () => crmApi.getLeads(),
  });

  const dealsQuery = useQuery({
    queryKey: ['crm-deals'],
    queryFn: () => crmApi.getDeals(),
  });

  const contactsQuery = useQuery({
    queryKey: ['crm-contacts'],
    queryFn: () => crmApi.getContacts(),
  });

  const createLeadMutation = useMutation({
    mutationFn: (lead: Partial<Lead>) => crmApi.createLead(lead),
    onSuccess: () => {
      toast({ title: 'Lead Added', description: 'New lead added to CRM.' });
      queryClient.invalidateQueries({ queryKey: ['crm-leads'] });
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, lead }: { id: number; lead: Partial<Lead> }) => crmApi.updateLead(id, lead),
    onSuccess: () => {
      toast({ title: 'Lead Updated' });
      queryClient.invalidateQueries({ queryKey: ['crm-leads'] });
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: (id: number) => crmApi.deleteLead(id),
    onSuccess: () => {
      toast({ title: 'Lead Removed' });
      queryClient.invalidateQueries({ queryKey: ['crm-leads'] });
    },
  });

  const createDealMutation = useMutation({
    mutationFn: (deal: Partial<Deal>) => crmApi.createDeal(deal),
    onSuccess: () => {
      toast({ title: 'Deal Created' });
      queryClient.invalidateQueries({ queryKey: ['crm-deals'] });
    },
  });

  const updateDealMutation = useMutation({
    mutationFn: ({ id, deal }: { id: number; deal: Partial<Deal> }) => crmApi.updateDeal(id, deal),
    onSuccess: () => {
      toast({ title: 'Deal Updated' });
      queryClient.invalidateQueries({ queryKey: ['crm-deals'] });
    },
  });

  const createContactMutation = useMutation({
    mutationFn: (contact: Partial<Contact>) => crmApi.createContact(contact),
    onSuccess: () => {
      toast({ title: 'Contact Created' });
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
    },
  });

  return {
    leads: leadsQuery.data || [],
    isLoadingLeads: leadsQuery.isLoading,
    deals: dealsQuery.data || [],
    isLoadingDeals: dealsQuery.isLoading,
    contacts: contactsQuery.data || [],
    isLoadingContacts: contactsQuery.isLoading,
    createLead: createLeadMutation.mutateAsync,
    updateLead: updateLeadMutation.mutateAsync,
    deleteLead: deleteLeadMutation.mutateAsync,
    createDeal: createDealMutation.mutateAsync,
    updateDeal: updateDealMutation.mutateAsync,
    createContact: createContactMutation.mutateAsync,
  };
}
