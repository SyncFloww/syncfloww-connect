import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { workspacesListQuery } from '@/features/workspaces/queries';
import type { Workspace } from '@/features/workspaces/api';
import { useAuth } from '@/hooks/useAuth';

interface WorkspaceContextValue {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  activeWorkspaceId: string | null;
  setActiveWorkspaceId: (id: string) => void;
  isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);
const STORAGE_KEY = 'syncflow-active-workspace';

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string | null>(null);

  const { data: workspaces = [], isLoading } = useQuery({
    ...workspacesListQuery(),
    enabled: Boolean(user),
  });

  // Restore or default active workspace
  useEffect(() => {
    if (!workspaces.length) return;
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    const exists = stored && workspaces.find((w) => w.id === stored);
    setActiveWorkspaceIdState(exists ? stored! : workspaces[0].id);
  }, [workspaces]);

  const setActiveWorkspaceId = (id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    setActiveWorkspaceIdState(id);
  };

  const activeWorkspace = useMemo(
    () => workspaces.find((w) => w.id === activeWorkspaceId) || null,
    [workspaces, activeWorkspaceId],
  );

  return (
    <WorkspaceContext.Provider
      value={{ workspaces, activeWorkspace, activeWorkspaceId, setActiveWorkspaceId, isLoading }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
