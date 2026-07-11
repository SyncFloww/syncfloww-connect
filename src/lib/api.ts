import apiClient from '@/lib/apiClient';

export interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  project_type: string;
  created_at: string;
  generations_count: number;
}

export const api = {
  getBrands: async () => {
    const { data } = await apiClient.get('/api/social/brands/');
    return data || [];
  },

  getProjects: async () => {
    const { data } = await apiClient.get('/api/projects/');
    return (data || []).map((project: any) => ({
      ...project,
      description: project.description || '',
      status: project.status || 'draft',
      generations_count: project.generations_count || 0,
    })) as Project[];
  },
};
