export interface Project {
  id: string;
  name: string;
  status: 'active' | 'in_review' | 'completed' | 'on_hold';
  progress: number;
  updated_at: string;
}
