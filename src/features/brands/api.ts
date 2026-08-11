import apiClient from '@/lib/apiClient';

export interface Brand {
  id: string;
  workspace: string;
  workspace_name?: string;
  name: string;
  slug?: string;
  description?: string;
  website?: string;
  industry?: string;
  logo_url?: string;
  voice?: string;
  target_audience?: string;
  niche?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BrandCreatePayload {
  workspace: string;
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  logo_url?: string;
  voice?: string;
  target_audience?: string;
  niche?: string;
}

export const brandsApi = {
  /** List all brands the current user can access. Optionally filter by workspace. */
  list: async (workspaceId?: string): Promise<Brand[]> => {
    const params = workspaceId ? { workspace: workspaceId } : {};
    const { data } = await apiClient.get('/api/social/brands/', { params });
    return Array.isArray(data) ? data : data?.results || [];
  },

  get: async (id: string): Promise<Brand> => {
    const { data } = await apiClient.get(`/api/social/brands/${id}/`);
    return data;
  },

  create: async (payload: BrandCreatePayload): Promise<Brand> => {
    const { data } = await apiClient.post('/api/social/brands/', payload);
    return data;
  },

  update: async (id: string, payload: Partial<BrandCreatePayload>): Promise<Brand> => {
    const { data } = await apiClient.patch(`/api/social/brands/${id}/`, payload);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/social/brands/${id}/`);
  },
};
