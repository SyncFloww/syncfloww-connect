import apiClient from '@/lib/apiClient';

export interface Workspace {
  id: string;
  name: string;
  logo?: string | null;
  industry?: string | null;
  created_at?: string;
}

export interface WorkspaceMember {
  id: string;
  user_id: string;
  email: string;
  role: string;
  full_name?: string;
}

export const workspacesApi = {
  list: async (): Promise<Workspace[]> => {
    const { data } = await apiClient.get('/api/workspaces/');
    return Array.isArray(data) ? data : data?.results || [];
  },
  get: async (id: string): Promise<Workspace> => {
    const { data } = await apiClient.get(`/api/workspaces/${id}/`);
    return data;
  },
  create: async (payload: Partial<Workspace>): Promise<Workspace> => {
    const { data } = await apiClient.post('/api/workspaces/', payload);
    return data;
  },
  update: async (id: string, payload: Partial<Workspace>): Promise<Workspace> => {
    const { data } = await apiClient.patch(`/api/workspaces/${id}/`, payload);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/workspaces/${id}/`);
  },
  members: async (id: string): Promise<WorkspaceMember[]> => {
    const { data } = await apiClient.get(`/api/workspaces/${id}/members/`);
    return Array.isArray(data) ? data : data?.results || [];
  },
  invite: async (id: string, email: string, role = 'member') => {
    const { data } = await apiClient.post(`/api/workspaces/${id}/invitations/`, {
      email,
      role,
    });
    return data;
  },
  acceptInvite: async (token: string) => {
    const { data } = await apiClient.post(`/api/workspaces/invitations/${token}/accept/`);
    return data;
  },
};
