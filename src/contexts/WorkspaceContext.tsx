import { createContext, useCallback, useContext, useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  role: "owner" | "admin" | "manager" | "editor" | "viewer";
}

interface WorkspaceContextValue {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  loading: boolean;
  selectWorkspace: (workspace: Workspace) => void;
  createWorkspace: (name: string, slug: string) => Promise<Workspace>;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);
const STORAGE_KEY = "syncfloww.currentWorkspace";

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshWorkspaces = useCallback(async () => {
    if (!localStorage.getItem("access_token")) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await apiClient.get<Workspace[] | { results: Workspace[] }>("/api/workspaces/");
      const items = (Array.isArray(data) ? data : data.results).map((workspace) => ({ ...workspace, id: String(workspace.id) }));
      setWorkspaces(items);
      const savedId = localStorage.getItem(STORAGE_KEY);
      setCurrentWorkspace(items.find((workspace) => workspace.id === savedId) ?? items[0] ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshWorkspaces();
    window.addEventListener("auth-updated", refreshWorkspaces);
    return () => window.removeEventListener("auth-updated", refreshWorkspaces);
  }, [refreshWorkspaces]);

  const selectWorkspace = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    localStorage.setItem(STORAGE_KEY, workspace.id);
  };

  const createWorkspace = async (name: string, slug: string) => {
    const { data } = await apiClient.post<Workspace>("/api/workspaces/", { name, slug });
    const workspace = { ...data, id: String(data.id) };
    setWorkspaces((existing) => [...existing, workspace]);
    selectWorkspace(workspace);
    return workspace;
  };

  return <WorkspaceContext.Provider value={{ workspaces, currentWorkspace, loading, selectWorkspace, createWorkspace, refreshWorkspaces }}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return context;
}
