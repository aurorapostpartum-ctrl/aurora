import { createId } from '../../lib/id';
import type { ChecklistTemplate } from '../../types/domain';

export const TRADE_OPTIONS = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Concrete',
  'Mechanical/HVAC',
  'Roofing',
  'Masonry',
  'Painting',
  'Drywall',
  'Flooring',
  'Landscaping',
  'Safety',
  'General',
  'Other',
];

export function totalItems(template: ChecklistTemplate): number {
  return template.sections.reduce((sum, section) => sum + section.items.length, 0);
}

// --- Draft shapes used only while a template is being edited in the builder ---

export interface DraftItem {
  key: string;
  text: string;
  required: boolean;
  requiresPhoto: boolean;
  notes: string;
}

export interface DraftSection {
  key: string;
  name: string;
  items: DraftItem[];
}

export function createDraftItem(): DraftItem {
  return { key: createId('draft-item'), text: '', required: false, requiresPhoto: false, notes: '' };
}

export function createDraftSection(name = ''): DraftSection {
  return { key: createId('draft-sec'), name, items: [createDraftItem()] };
}

export function templateToDraftSections(template: ChecklistTemplate): DraftSection[] {
  return template.sections.map((section) => ({
    key: createId('draft-sec'),
    name: section.name,
    items: section.items.map((item) => ({
      key: createId('draft-item'),
      text: item.text,
      required: item.required,
      requiresPhoto: item.requiresPhoto,
      notes: item.notes ?? '',
    })),
  }));
}

function toTitleCase(s: string): string {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

const BULLET_RE = /^[-*•☐☑✓]\s*/;
const NUMBERED_RE = /^\d+[.)]\s*/;

function stripBullet(line: string): string {
  return line.replace(BULLET_RE, '').replace(NUMBERED_RE, '').trim();
}

function looksLikeSectionHeader(line: string): boolean {
  const cleaned = line.replace(/[:：]\s*$/, '').trim();
  const letters = cleaned.replace(/[^A-Za-z]/g, '');
  if (letters.length < 2) return false;
  return letters === letters.toUpperCase();
}

/**
 * Turns pasted plain-text checklist content ("upload an existing checklist")
 * into draft sections the builder can render and refine. Lines that read as
 * ALL-CAPS headers (optionally ending in ':') start a new section; everything
 * else becomes an item under the current section, with common bullet/number
 * prefixes stripped.
 */
export function parseChecklistText(raw: string): DraftSection[] {
  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const sections: DraftSection[] = [];
  let current: DraftSection | null = null;

  for (const line of lines) {
    if (looksLikeSectionHeader(line)) {
      current = { key: createId('draft-sec'), name: toTitleCase(line.replace(/[:：]\s*$/, '')), items: [] };
      sections.push(current);
      continue;
    }
    const text = stripBullet(line);
    if (!text) continue;
    if (!current) {
      current = { key: createId('draft-sec'), name: 'General', items: [] };
      sections.push(current);
    }
    current.items.push({ key: createId('draft-item'), text, required: false, requiresPhoto: false, notes: '' });
  }

  return sections.filter((s) => s.items.length > 0);
}
