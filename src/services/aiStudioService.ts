import apiClient from '@/lib/apiClient';

export interface AIJob {
  id: string;
  workspace: number;
  brand?: number;
  job_type: 'idea' | 'script' | 'social_content' | 'image' | 'video' | 'voiceover' | 'audio_mix' | 'caption' | 'composition';
  provider: string;
  model: string;
  input_data: Record<string, any>;
  output_data: Record<string, any>;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress: number;
  error?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface AIScriptVersion {
  id: number;
  version_number: number;
  hook: string;
  body: string;
  cta: string;
  voiceover_text: string;
  visual_directions: string;
  change_summary: string;
  created_at: string;
}

export interface AIScript {
  id: number;
  title: string;
  topic: string;
  platform: string;
  target_audience: string;
  tone: string;
  duration_seconds: number;
  hook: string;
  body: string;
  transitions: string;
  cta: string;
  visual_directions: string;
  b_roll_suggestions: string[];
  voiceover_text: string;
  onscreen_text: string;
  versions?: AIScriptVersion[];
  created_at: string;
}

export interface AISocialContent {
  id: number;
  platform: string;
  content_type: string;
  caption: string;
  hashtags: string[];
  call_to_action: string;
  saved_content_id?: number;
  created_at: string;
}

export interface AIContentProject {
  id: string;
  title: string;
  description: string;
  target_platform: string;
  preset_format: string;
  idea_data: Record<string, any>;
  current_script_id?: number;
  scripts?: AIScript[];
  export_url?: string;
  created_at: string;
  updated_at: string;
}

export interface VoiceOption {
  voice_id: string;
  name: string;
  gender: string;
  locale: string;
  accent: string;
  model: string;
  style: string;
}

export interface CustomVoiceProfile {
  id: number;
  name: string;
  description: string;
  provider_voice_id: string;
  provider_name: string;
  sample_url: string;
  is_active: boolean;
}

export const aiStudioApi = {
  // Jobs
  getJobs: async (): Promise<AIJob[]> => {
    const { data } = await apiClient.get('/api/ai/jobs/');
    return data.results || data || [];
  },
  getJobStatus: async (jobId: string): Promise<AIJob> => {
    const { data } = await apiClient.get(`/api/ai/jobs/${jobId}/`);
    return data;
  },
  retryJob: async (jobId: string): Promise<AIJob> => {
    const { data } = await apiClient.post(`/api/ai/jobs/${jobId}/retry/`);
    return data;
  },
  cancelJob: async (jobId: string): Promise<AIJob> => {
    const { data } = await apiClient.post(`/api/ai/jobs/${jobId}/cancel/`);
    return data;
  },

  // Projects
  getProjects: async (): Promise<AIContentProject[]> => {
    const { data } = await apiClient.get('/api/ai/projects/');
    return data.results || data || [];
  },
  createProject: async (payload: Partial<AIContentProject>): Promise<AIContentProject> => {
    const { data } = await apiClient.post('/api/ai/projects/', payload);
    return data;
  },

  // Ideas
  generateIdeas: async (payload: Record<string, any>): Promise<AIJob> => {
    const { data } = await apiClient.post('/api/ai/ideas/generate/', payload);
    return data;
  },

  // Scripts
  generateScript: async (payload: Record<string, any>): Promise<AIScript> => {
    const { data } = await apiClient.post('/api/ai/scripts/generate/', payload);
    return data;
  },
  getScripts: async (): Promise<AIScript[]> => {
    const { data } = await apiClient.get('/api/ai/scripts/');
    return data.results || data || [];
  },
  saveScriptVersion: async (scriptId: number, changeSummary: string): Promise<AIScriptVersion> => {
    const { data } = await apiClient.post(`/api/ai/scripts/${scriptId}/version/`, { change_summary: changeSummary });
    return data;
  },
  convertToSocialContent: async (scriptId: number): Promise<AISocialContent[]> => {
    const { data } = await apiClient.post(`/api/ai/scripts/${scriptId}/convert-social/`);
    return data;
  },

  // Image & Video
  generateImage: async (payload: { prompt: string; aspect_ratio?: string; provider?: string; style?: string; negative_prompt?: string }): Promise<any> => {
    const { data } = await apiClient.post('/api/ai/images/generate/', payload);
    return data;
  },
  generateVideo: async (payload: { prompt: string; aspect_ratio?: string; provider?: string; image_url?: string; duration_seconds?: number }): Promise<any> => {
    const { data } = await apiClient.post('/api/ai/videos/generate/', payload);
    return data;
  },

  // Voice Studio
  getVoices: async (): Promise<VoiceOption[]> => {
    const { data } = await apiClient.get('/api/ai/voices/');
    return data.voices || [];
  },
  generateVoiceover: async (payload: { text: string; voice_id: string; speed?: number; pitch?: number; style?: string }): Promise<any> => {
    const { data } = await apiClient.post('/api/ai/voices/generate/', payload);
    return data;
  },
  getCustomVoices: async (): Promise<CustomVoiceProfile[]> => {
    const { data } = await apiClient.get('/api/ai/voices/custom/');
    return data.results || data || [];
  },
  recordVoiceConsent: async (payload: { voice_profile?: number; signature_name: string; statement?: string }): Promise<any> => {
    const { data } = await apiClient.post('/api/ai/voices/consent/', payload);
    return data;
  },

  // Audio Mixer & Captions
  mixAudioTracks: async (tracks: any[]): Promise<AIJob> => {
    const { data } = await apiClient.post('/api/ai/audio/mix/', { tracks });
    return data;
  },
  generateCaptions: async (payload: { text: string; audio_url?: string; style_config?: Record<string, any> }): Promise<any> => {
    const { data } = await apiClient.post('/api/ai/captions/generate/', payload);
    return data;
  },

  // Magic Editor & Usage
  executeMagicAction: async (payload: { action: string; text: string; tone?: string }): Promise<any> => {
    const { data } = await apiClient.post('/api/ai/editor/action/', payload);
    return data;
  },
  getUsageMetrics: async (): Promise<any> => {
    const { data } = await apiClient.get('/api/ai/usage/');
    return data;
  },

  // Media Library Integration
  getMediaItems: async (): Promise<any[]> => {
    const { data } = await apiClient.get('/api/media/items/');
    return data.results || data || [];
  },

  // Content Library Integration
  getContentItems: async (): Promise<any[]> => {
    const { data } = await apiClient.get('/api/content/items/');
    return data.results || data || [];
  },

  // Schedule & Publish Integration
  schedulePost: async (payload: { title: string; content: string; media_urls?: string[]; scheduled_at?: string; platforms?: string[] }): Promise<any> => {
    const { data } = await apiClient.post('/api/publishing/posts/', {
      ...payload,
      status: payload.scheduled_at ? 'scheduled' : 'draft',
    });
    return data;
  }
};
