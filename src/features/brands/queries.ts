import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { brandsApi, type Brand } from './api';

export const brandKeys = {
  all: ['brands'] as const,
  list: (workspaceId: string) => [...brandKeys.all, 'list', workspaceId] as const,
  detail: (workspaceId: string, id: string) =>
    [...brandKeys.all, workspaceId, id] as const,
};

export const brandsListQuery = (workspaceId: string) =>
  queryOptions({
    queryKey: brandKeys.list(workspaceId),
    queryFn: () => brandsApi.list(workspaceId),
    enabled: Boolean(workspaceId),
  });

export const brandQuery = (workspaceId: string, id: string) =>
  queryOptions({
    queryKey: brandKeys.detail(workspaceId, id),
    queryFn: () => brandsApi.get(id),
    enabled: Boolean(workspaceId) && Boolean(id),
  });

export function useCreateBrand(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string } & Partial<Brand>) => brandsApi.create({ ...payload, workspace: workspaceId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: brandKeys.list(workspaceId) }),
  });
}

export function useUpdateBrand(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Brand> }) =>
      brandsApi.update(id, payload),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: brandKeys.list(workspaceId) });
      qc.invalidateQueries({ queryKey: brandKeys.detail(workspaceId, vars.id) });
    },
  });
}

export function useDeleteBrand(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => brandsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: brandKeys.list(workspaceId) }),
  });
}
