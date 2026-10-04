import { useQuery } from '@tanstack/react-query';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { brandsApi } from '@/features/brands/api';
import { useState } from 'react';
export function useCurrentBrand() {
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace ? String(currentWorkspace.id) : '';
  const [selected, setSelected] = useState('');
  const query = useQuery({ queryKey: ['brands', 'list', workspaceId], queryFn: () => brandsApi.list(workspaceId), enabled: !!workspaceId });
  const brands = query.data || [];
  const stored = workspaceId ? localStorage.getItem('syncflow-active-brand-' + workspaceId) : '';
  const id = [selected, stored].find(value => brands.some(b => String(b.id) === value)) || (brands[0] ? String(brands[0].id) : '');
  const choose = (value: string) => { setSelected(value); localStorage.setItem('syncflow-active-brand-' + workspaceId, value); };
  return { ...query, brands, brand: brands.find(b => String(b.id) === id), brandId: id, choose, workspaceId };
}
