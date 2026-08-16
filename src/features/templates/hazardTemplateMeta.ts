import { Ionicons } from '@expo/vector-icons';

import { createId } from '../../lib/id';
import type { HazardAssessmentTemplate, HazardSourceFileType } from '../../types/domain';

export { TRADE_OPTIONS } from './checklistTemplateMeta';

export function totalItems(template: HazardAssessmentTemplate): number {
  return template.sections.reduce((sum, section) => sum + section.items.length, 0);
}

export const SOURCE_FILE_TYPE_OPTIONS: { value: HazardSourceFileType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'pdf', label: 'PDF', icon: 'document-text-outline' },
  { value: 'word', label: 'Word Document', icon: 'document-outline' },
  { value: 'excel', label: 'Excel Spreadsheet', icon: 'grid-outline' },
  { value: 'image', label: 'Image / Photo', icon: 'image-outline' },
];

export const SOURCE_FILE_ACCEPT: Record<HazardSourceFileType, string> = {
  pdf: '.pdf,application/pdf',
  word: '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  excel: '.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  image: 'image/*',
};

// --- Draft shapes used only while a template is being edited in the builder ---

export interface DraftHazardItem {
  key: string;
  hazard: string;
  controlMeasure: string;
  required: boolean;
  requiresPhoto: boolean;
  notes: string;
}

export interface DraftHazardSection {
  key: string;
  name: string;
  items: DraftHazardItem[];
}

export function createDraftHazardItem(): DraftHazardItem {
  return { key: createId('draft-haz'), hazard: '', controlMeasure: '', required: false, requiresPhoto: false, notes: '' };
}

export function createDraftHazardSection(name = ''): DraftHazardSection {
  return { key: createId('draft-hazsec'), name, items: [createDraftHazardItem()] };
}

export function templateToDraftHazardSections(template: HazardAssessmentTemplate): DraftHazardSection[] {
  return template.sections.map((section) => ({
    key: createId('draft-hazsec'),
    name: section.name,
    items: section.items.map((item) => ({
      key: createId('draft-haz'),
      hazard: item.hazard,
      controlMeasure: item.controlMeasure,
      required: item.required,
      requiresPhoto: item.requiresPhoto,
      notes: item.notes ?? '',
    })),
  }));
}
