import { Ionicons } from '@expo/vector-icons';

import type { DocumentCategory, DocumentFileType, JobDocument } from '../../types/domain';

export const CATEGORY_LABEL: Record<DocumentCategory, string> = {
  architectural: 'Architectural',
  electrical: 'Electrical',
  plumbing: 'Plumbing',
  mechanical: 'Mechanical',
  permits: 'Permits',
  specifications: 'Specifications',
  contracts: 'Contracts',
  other: 'Other',
};

export const CATEGORY_OPTIONS: { value: DocumentCategory; label: string }[] = (
  Object.keys(CATEGORY_LABEL) as DocumentCategory[]
).map((value) => ({ value, label: CATEGORY_LABEL[value] }));

export const CATEGORY_ICON: Record<DocumentCategory, keyof typeof Ionicons.glyphMap> = {
  architectural: 'business-outline',
  electrical: 'flash-outline',
  plumbing: 'water-outline',
  mechanical: 'cog-outline',
  permits: 'shield-checkmark-outline',
  specifications: 'reader-outline',
  contracts: 'document-lock-outline',
  other: 'document-text-outline',
};

export const FILE_TYPE_OPTIONS: { value: DocumentFileType; label: string }[] = [
  { value: 'pdf', label: 'PDF' },
  { value: 'dwg', label: 'DWG' },
  { value: 'image', label: 'Image' },
];

export const FILE_TYPE_ICON: Record<DocumentFileType, keyof typeof Ionicons.glyphMap> = {
  pdf: 'document-text-outline',
  dwg: 'construct-outline',
  image: 'image-outline',
};

export function revisionLabel(revisionNumber: number): string {
  return `Rev ${revisionNumber}`;
}

export function currentRevision(doc: JobDocument) {
  return doc.revisions.find((r) => r.isCurrent) ?? doc.revisions[0];
}

export type ReviewState = 'not_required' | 'reviewed' | 'needs_review' | 'new_revision';

export function acknowledgmentFor(doc: JobDocument, personId: string) {
  return doc.acknowledgments.find((a) => a.personId === personId);
}

export function reviewStateFor(doc: JobDocument, personId: string): ReviewState {
  if (!doc.reviewRequired) return 'not_required';
  if (acknowledgmentFor(doc, personId)) return 'reviewed';
  return doc.revisions.length > 1 ? 'new_revision' : 'needs_review';
}

export const REVIEW_STATE_LABEL: Record<ReviewState, string> = {
  not_required: 'No review required',
  reviewed: 'Reviewed',
  needs_review: 'Review required',
  new_revision: 'New revision available',
};

// Deterministic, category-flavored sheet names so the mock viewer's page
// navigation and in-document search have something believable to work with —
// standing in for the real sheet index a construction drawing set would have.
const SHEET_NAMES: Record<DocumentCategory, string[]> = {
  architectural: [
    'Cover Sheet',
    'Site Plan',
    'Floor Plan — Level 1',
    'Floor Plan — Level 2',
    'Floor Plan — Level 3',
    'Reflected Ceiling Plan',
    'Building Elevations',
    'Building Sections',
    'Wall Sections',
    'Door & Window Schedule',
    'Interior Details',
    'Roof Plan',
  ],
  electrical: [
    'Cover Sheet',
    'Electrical Site Plan',
    'Power Plan — Level 1',
    'Power Plan — Level 2',
    'Lighting Plan — Level 1',
    'Lighting Plan — Level 2',
    'Panel Schedules',
    'Single Line Diagram',
    'Fire Alarm Riser',
    'Emergency Lighting Plan',
  ],
  plumbing: [
    'Cover Sheet',
    'Domestic Water Riser',
    'Sanitary & Vent Riser',
    'Storm Drainage Plan',
    'Fixture Schedule',
    'Plumbing Plan — Level 1',
    'Plumbing Plan — Level 2',
  ],
  mechanical: [
    'Cover Sheet',
    'HVAC Plan — Level 1',
    'HVAC Plan — Level 2',
    'Ductwork Plan',
    'Equipment Schedule',
    'Control Diagrams',
    'Ventilation Details',
  ],
  permits: ['Cover Page', 'Permit Conditions', 'Approved Site Plan', 'Inspection Log'],
  specifications: ['Cover Page', 'Table of Contents', 'General Requirements', 'Technical Sections', 'Appendix'],
  contracts: ['Cover Page', 'General Conditions', 'Scope of Work', 'Schedule of Values', 'Signatures'],
  other: ['Page 1', 'Page 2', 'Page 3', 'Page 4', 'Page 5'],
};

export function sheetLabelsForCategory(category: DocumentCategory, pageCount: number): string[] {
  const pool = SHEET_NAMES[category];
  const labels: string[] = [];
  for (let i = 0; i < pageCount; i += 1) {
    labels.push(pool[i] ?? `Sheet ${i + 1}`);
  }
  return labels;
}
