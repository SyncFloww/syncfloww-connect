import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspacesApi, type Workspace } from './api';

export const workspaceKeys = {
  all: ['workspaces'] as const,
  list: () => [...workspaceKeys.all, 'list'] as const,
  detail: (id: string) => [...workspaceKeys.all, 'detail', id] as const,
  members: (id: string) => [...workspaceKeys.all, id, 'members'] as const,
};

export const workspacesListQuery = () =>
  queryOptions({
    queryKey: workspaceKeys.list(),
    queryFn: () => workspacesApi.list(),
  });

export const workspaceQuery = (id: string) =>
  queryOptions({
    queryKey: workspaceKeys.detail(id),
    queryFn: () => workspacesApi.get(id),
    enabled: Boolean(id),
  });

export const workspaceMembersQuery = (id: string) =>
  queryOptions({
    queryKey: workspaceKeys.members(id),
    queryFn: () => workspacesApi.members(id),
    enabled: Boolean(id),
  });

export function useCreateWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<Workspace>) => workspacesApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: workspaceKeys.list() }),
  });
}

export function useUpdateWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Workspace> }) =>
      workspacesApi.update(id, payload),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: workspaceKeys.list() });
      qc.invalidateQueries({ queryKey: workspaceKeys.detail(vars.id) });
    },
  });
}

export function useDeleteWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workspacesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: workspaceKeys.list() }),
  });
}
