import { useState, useEffect, useCallback } from 'react';
import { aiStudioApi, AIJob, AIContentProject, AIScript } from '@/services/aiStudioService';

export function useAIStudio() {
  const [projects, setProjects] = useState<AIContentProject[]>([]);
  const [activeProject, setActiveProject] = useState<AIContentProject | null>(null);
  const [jobs, setJobs] = useState<AIJob[]>([]);
  const [scripts, setScripts] = useState<AIScript[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudioData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [projList, jobList, scriptList] = await Promise.all([
        aiStudioApi.getProjects(),
        aiStudioApi.getJobs(),
        aiStudioApi.getScripts(),
      ]);
      setProjects(projList);
      setJobs(jobList);
      setScripts(scriptList);
      if (projList.length > 0 && !activeProject) {
        setActiveProject(projList[0]);
      }
    } catch (err: any) {
      console.error('Failed to load AI Studio data:', err);
      setError(err.message || 'Failed to sync studio data');
    } finally {
      setLoading(false);
    }
  }, [activeProject]);

  useEffect(() => {
    fetchStudioData();
  }, []);

  const createNewProject = async (title: string, description: string = '') => {
    try {
      const proj = await aiStudioApi.createProject({ title, description });
      setProjects((prev) => [proj, ...prev]);
      setActiveProject(proj);
      return proj;
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
      throw err;
    }
  };

  return {
    projects,
    activeProject,
    setActiveProject,
    jobs,
    scripts,
    loading,
    error,
    refreshData: fetchStudioData,
    createNewProject,
  };
}
