import { useQuery } from '@tanstack/react-query';

import { supabase } from '../../lib/supabase';
import type { Project } from './types';

async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('id, name, status, progress, updated_at')
    .order('updated_at', { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });
}
