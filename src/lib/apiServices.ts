import apiClient from '@/lib/apiClient';

// --- Types ---
export interface SocialAccount {
  id: number;
  workspace?: number;
  brand?: number;
  platform: string;
  account_name: string;
  account_id: string;
  avatar_url?: string;
  connected_at: string;
  status: 'active' | 'expired' | 'disconnected';
  access_token_expires_at?: string;
}

export interface BrandProfile {
  id: number;
  brand: number;
  target_audience?: string;
  brand_values?: string;
  mission_statement?: string;
  brand_voice_notes?: string;
  website_url?: string;
}

export interface BrandKnowledgeItem {
  id: number;
  brand: number;
  title: string;
  content: string;
  knowledge_type: string;
  created_at: string;
}

export interface Post {
  id: number;
  workspace?: number;
  brand?: number;
  title: string;
  content: string;
  media_urls?: string[];
  status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed';
  scheduled_at?: string;
  published_at?: string;
  created_at: string;
  platforms?: string[];
  retry_count?: number;
  error_message?: string;
}

export interface PublishingJob {
  id: number;
  post: number;
  platform: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  scheduled_at: string;
  executed_at?: string;
  error_message?: string;
  retry_count: number;
}

export interface DailyAnalytics {
  id: number;
  date: string;
  impressions: number;
  engagements: number;
  clicks: number;
  shares: number;
  comments: number;
  followers_gained: number;
  reach: number;
}

export interface UnifiedDashboardMetrics {
  total_posts: number;
  scheduled_posts: number;
  total_impressions: number;
  total_engagements: number;
  engagement_rate: number;
  follower_growth: number;
  connected_accounts_count: number;
  recent_activity: any[];
}

export interface Campaign {
  id: number;
  workspace?: number;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  start_date?: string;
  end_date?: string;
  budget_allocated?: number;
  budget_spent?: number;
  created_at: string;
}

export interface CampaignGoal {
  id: number;
  campaign: number;
  metric_name: string;
  target_value: number;
  current_value: number;
}

export interface Lead {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted';
  source?: string;
  value?: number;
  created_at: string;
}

export interface Deal {
  id: number;
  title: string;
  lead?: number;
  company?: string;
  stage: 'lead' | 'contacted' | 'proposal' | 'negotiation' | 'won' | 'lost';
  amount: number;
  expected_close_date?: string;
  created_at: string;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
  created_at: string;
}

export interface AIAgent {
  id: number;
  name: string;
  agent_type: string;
  description: string;
  model_name: string;
  is_active: boolean;
}

export interface GenerationHistory {
  id: number;
  prompt: string;
  output_text: string;
  model_used: string;
  created_at: string;
}

// --- API Service Methods ---

export const socialApi = {
  getAccounts: async (brandId?: number): Promise<SocialAccount[]> => {
    const params = brandId ? { brand: brandId } : {};
    const { data } = await apiClient.get('/api/social/accounts/', { params });
    return data.results || data || [];
  },
  getProviders: async () => {
    const { data } = await apiClient.get('/api/social/oauth/providers/');
    return data;
  },
  getAuthorizeUrl: async (platform: string) => {
    const { data } = await apiClient.get(`/api/social/oauth/authorize/?platform=${platform}`);
    return data;
  },
  connectAccount: async (platform: string, payload: any) => {
    const { data } = await apiClient.post(`/api/social/connect/${platform}/`, payload);
    return data;
  },
  disconnectAccount: async (id: number) => {
    const { data } = await apiClient.post(`/api/social/${id}/disconnect/`);
    return data;
  },
  getBrandProfile: async (brandId: number): Promise<BrandProfile> => {
    const { data } = await apiClient.get(`/api/social/brands/${brandId}/profile/`);
    return data;
  },
  updateBrandProfile: async (brandId: number, profile: Partial<BrandProfile>): Promise<BrandProfile> => {
    const { data } = await apiClient.patch(`/api/social/brands/${brandId}/profile/`, profile);
    return data;
  },
  getBrandKnowledge: async (brandId: number): Promise<BrandKnowledgeItem[]> => {
    const { data } = await apiClient.get(`/api/social/brands/${brandId}/knowledge/`);
    return data.results || data || [];
  },
  addBrandKnowledge: async (brandId: number, item: Partial<BrandKnowledgeItem>): Promise<BrandKnowledgeItem> => {
    const { data } = await apiClient.post(`/api/social/brands/${brandId}/knowledge/`, { ...item, brand: brandId });
    return data;
  },
};

export const publishingApi = {
  getPosts: async (params?: Record<string, any>): Promise<Post[]> => {
    const { data } = await apiClient.get('/api/publishing/posts/', { params });
    return data.results || data || [];
  },
  createPost: async (post: Partial<Post>): Promise<Post> => {
    const { data } = await apiClient.post('/api/publishing/posts/', post);
    return data;
  },
  updatePost: async (id: number, post: Partial<Post>): Promise<Post> => {
    const { data } = await apiClient.patch(`/api/publishing/posts/${id}/`, post);
    return data;
  },
  deletePost: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/publishing/posts/${id}/`);
  },
  getJobs: async (): Promise<PublishingJob[]> => {
    const { data } = await apiClient.get('/api/publishing/jobs/');
    return data.results || data || [];
  },
  retryJob: async (jobId: number): Promise<PublishingJob> => {
    const { data } = await apiClient.patch(`/api/publishing/jobs/${jobId}/`, { status: 'pending' });
    return data;
  },
};

export const analyticsApi = {
  getDashboard: async (): Promise<UnifiedDashboardMetrics> => {
    const { data } = await apiClient.get('/api/analytics/dashboard/');
    return data;
  },
  getDailyAnalytics: async (): Promise<DailyAnalytics[]> => {
    const { data } = await apiClient.get('/api/analytics/daily/');
    return data.results || data || [];
  },
  collectMetrics: async () => {
    const { data } = await apiClient.post('/api/analytics/collect/');
    return data;
  },
};

export const campaignsApi = {
  getCampaigns: async (): Promise<Campaign[]> => {
    const { data } = await apiClient.get('/api/campaigns/campaigns/');
    return data.results || data || [];
  },
  createCampaign: async (campaign: Partial<Campaign>): Promise<Campaign> => {
    const { data } = await apiClient.post('/api/campaigns/campaigns/', campaign);
    return data;
  },
  updateCampaign: async (id: number, campaign: Partial<Campaign>): Promise<Campaign> => {
    const { data } = await apiClient.patch(`/api/campaigns/campaigns/${id}/`, campaign);
    return data;
  },
  deleteCampaign: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/campaigns/campaigns/${id}/`);
  },
  getGoals: async (campaignId?: number): Promise<CampaignGoal[]> => {
    const params = campaignId ? { campaign: campaignId } : {};
    const { data } = await apiClient.get('/api/campaigns/goals/', { params });
    return data.results || data || [];
  },
  createGoal: async (goal: Partial<CampaignGoal>): Promise<CampaignGoal> => {
    const { data } = await apiClient.post('/api/campaigns/goals/', goal);
    return data;
  },
};

export const crmApi = {
  getLeads: async (): Promise<Lead[]> => {
    const { data } = await apiClient.get('/api/v2/leads/');
    return data.results || data || [];
  },
  createLead: async (lead: Partial<Lead>): Promise<Lead> => {
    const { data } = await apiClient.post('/api/v2/leads/', lead);
    return data;
  },
  updateLead: async (id: number, lead: Partial<Lead>): Promise<Lead> => {
    const { data } = await apiClient.patch(`/api/v2/leads/${id}/`, lead);
    return data;
  },
  deleteLead: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v2/leads/${id}/`);
  },
  getDeals: async (): Promise<Deal[]> => {
    const { data } = await apiClient.get('/api/v2/deals/');
    return data.results || data || [];
  },
  createDeal: async (deal: Partial<Deal>): Promise<Deal> => {
    const { data } = await apiClient.post('/api/v2/deals/', deal);
    return data;
  },
  updateDeal: async (id: number, deal: Partial<Deal>): Promise<Deal> => {
    const { data } = await apiClient.patch(`/api/v2/deals/${id}/`, deal);
    return data;
  },
  getContacts: async (): Promise<Contact[]> => {
    const { data } = await apiClient.get('/api/v2/contacts/');
    return data.results || data || [];
  },
  createContact: async (contact: Partial<Contact>): Promise<Contact> => {
    const { data } = await apiClient.post('/api/v2/contacts/', contact);
    return data;
  },
};

export const aiApi = {
  generateContent: async (payload: { prompt: string; agent_type?: string; platform?: string; brand_id?: number }) => {
    const { data } = await apiClient.post('/api/ai/content/generate/', payload);
    return data;
  },
  executeAgent: async (agentType: string, payload: any) => {
    const { data } = await apiClient.post(`/api/ai/agents/${agentType}/execute/`, payload);
    return data;
  },
  getAgents: async (): Promise<AIAgent[]> => {
    const { data } = await apiClient.get('/api/ai/agents/');
    return data.results || data || [];
  },
  getHistory: async (): Promise<GenerationHistory[]> => {
    const { data } = await apiClient.get('/api/ai/histories/');
    return data.results || data || [];
  },
  getTemplates: async () => {
    const { data } = await apiClient.get('/api/ai/templates/');
    return data.results || data || [];
  },
};

export const marketplaceApi = {
  getApps: async () => {
    const { data } = await apiClient.get('/api/v2/apps/');
    return data.results || data || [];
  },
  getPromptPacks: async () => {
    const { data } = await apiClient.get('/api/v2/prompt-packs/');
    return data.results || data || [];
  },
  getPlugins: async () => {
    const { data } = await apiClient.get('/api/v2/plugins/');
    return data.results || data || [];
  },
};
