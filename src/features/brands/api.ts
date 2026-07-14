import apiClient from '@/lib/apiClient';

export interface Brand {
  id: string;
  workspace_id?: string;
  name: string;
  website?: string;
  target_audience?: string;
  voice?: string;
  primary_color?: string;
  logo?: string | null;
  mission?: string;
  vision?: string;
  keywords?: string[];
  fonts?: string;
  created_at?: string;
}

export const brandsApi = {
  list: async (workspaceId: string): Promise<Brand[]> => {
    const { data } = await apiClient.get(`/api/v1/brands/workspaces/${workspaceId}/`);
    return Array.isArray(data) ? data : data?.results || [];
  },
  get: async (workspaceId: string, id: string): Promise<Brand> => {
    const { data } = await apiClient.get(`/api/v1/brands/workspaces/${workspaceId}/${id}/`);
    return data;
  },
  create: async (workspaceId: string, payload: Partial<Brand>): Promise<Brand> => {
    const { data } = await apiClient.post(`/api/v1/brands/workspaces/${workspaceId}/`, payload);
    return data;
  },
  update: async (workspaceId: string, id: string, payload: Partial<Brand>): Promise<Brand> => {
    const { data } = await apiClient.patch(
      `/api/v1/brands/workspaces/${workspaceId}/${id}/`,
      payload,
    );
    return data;
  },
  remove: async (workspaceId: string, id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/brands/workspaces/${workspaceId}/${id}/`);
  },
};
