import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Project } from '@/types';
import { toast } from 'sonner';

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects(data as Project[]);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (title: string, description?: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          title,
          description,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setProjects(prev => [data as Project, ...prev]);
      toast.success('Project created');
      return data as Project;
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
      return null;
    }
  };

  const updateProject = async (id: string, updates: Partial<Omit<Project, 'metadata'>> & { metadata?: Record<string, unknown> }) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates as never)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setProjects(prev =>
        prev.map(p => (p.id === id ? (data as Project) : p))
      );
      return data as Project;
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
      return null;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProjects(prev => prev.filter(p => p.id !== id));
      toast.success('Project deleted');
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
      return false;
    }
  };

  return {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
  };
}
