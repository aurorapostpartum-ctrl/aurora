import type { Ionicons } from '@expo/vector-icons';
import type { PhotoCategory } from '../../types/domain';

export const PHOTO_CATEGORY_OPTIONS: { value: PhotoCategory; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'general', label: 'Job Folder', icon: 'folder-outline' },
  { value: 'checklist', label: 'Checklists', icon: 'checkbox-outline' },
  { value: 'hazard_assessment', label: 'Hazard Assessments', icon: 'warning-outline' },
  { value: 'deficiency', label: 'Deficiencies', icon: 'alert-circle-outline' },
];

export function categoryLabel(category: PhotoCategory): string {
  return PHOTO_CATEGORY_OPTIONS.find((o) => o.value === category)?.label ?? 'Job Folder';
}

export function categoryIcon(category: PhotoCategory): keyof typeof Ionicons.glyphMap {
  return PHOTO_CATEGORY_OPTIONS.find((o) => o.value === category)?.icon ?? 'folder-outline';
}

export type DateFilterOption = 'all' | 'today' | 'week' | 'month';

export const DATE_FILTER_OPTIONS: { value: DateFilterOption; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

export function isWithinDateFilter(iso: string, filter: DateFilterOption, now: Date): boolean {
  if (filter === 'all') return true;
  const then = new Date(iso).getTime();
  const diffMs = now.getTime() - then;
  const days = diffMs / (24 * 60 * 60 * 1000);
  if (filter === 'today') return days < 1;
  if (filter === 'week') return days < 7;
  return days < 30;
}
