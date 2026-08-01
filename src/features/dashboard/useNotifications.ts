import { useQuery } from '@tanstack/react-query';

import { supabase } from '../../lib/supabase';
import type { NotificationItem } from './types';

async function fetchNotifications(): Promise<NotificationItem[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, title, body, read, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });
}
