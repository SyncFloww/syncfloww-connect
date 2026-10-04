import apiClient from '@/lib/apiClient';
export interface InterviewState {
  answers: Record<string, string>;
  questions: { key: string; title: string; hint: string; required: boolean }[];
  missing: string[];
  completed: boolean;
}
export const brandInterview = {
  get: async (id: string): Promise<InterviewState> => (await apiClient.get(`/api/social/brands/${id}/onboarding/`)).data,
  save: async (id: string, answers: Record<string, string>, complete = false): Promise<InterviewState> =>
    (await apiClient.patch(`/api/social/brands/${id}/onboarding/`, { answers, complete })).data,
};
