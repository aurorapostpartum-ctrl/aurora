import { Ionicons } from '@expo/vector-icons';

import { isWithinLastDays } from '../../data/selectors';
import type { JobChecklist, JobDocument, JobHazardAssessment } from '../../types/domain';
import { reviewStateFor } from '../documents/documentMeta';
import type { StatusTone } from '../../components/ui';

export interface JobRequirement {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: StatusTone;
  label: string;
  done: boolean;
}

const HAZARD_FRESH_DAYS = 3;

function byNewest(a: { generatedAt: string }, b: { generatedAt: string }) {
  return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
}

function hazardRequirement(hazards: JobHazardAssessment[]): JobRequirement {
  const latest = [...hazards].sort(byNewest)[0];
  const isFresh =
    latest?.status === 'completed' && isWithinLastDays(latest.completedAt ?? latest.generatedAt, HAZARD_FRESH_DAYS);

  if (isFresh) {
    return { id: 'req-hazard', icon: 'checkmark-circle', tone: 'success', label: 'Hazard assessment up to date', done: true };
  }
  if (latest?.status === 'in_progress') {
    return { id: 'req-hazard', icon: 'warning-outline', tone: 'warning', label: 'Hazard assessment in progress', done: false };
  }
  return { id: 'req-hazard', icon: 'warning-outline', tone: 'danger', label: 'Hazard assessment required', done: false };
}

function pendingDocuments(documents: JobDocument[], personId: string): JobDocument[] {
  return documents
    .filter((d) => {
      const state = reviewStateFor(d, personId);
      return state === 'needs_review' || state === 'new_revision';
    })
    .sort((a, b) => {
      const aDate = a.revisions.find((r) => r.isCurrent)?.uploadedAt ?? '';
      const bDate = b.revisions.find((r) => r.isCurrent)?.uploadedAt ?? '';
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
}

function documentRequirement(documents: JobDocument[], personId: string): JobRequirement {
  const pending = pendingDocuments(documents, personId);

  if (pending.length > 0) {
    const [doc] = pending;
    const label = pending.length > 1 ? `Review ${doc.title} (+${pending.length - 1} more)` : `Review ${doc.title}`;
    return { id: 'req-document', icon: 'document-text-outline', tone: 'warning', label, done: false };
  }

  const anyReviewable = documents.some((d) => d.reviewRequired);
  return {
    id: 'req-document',
    icon: 'checkmark-circle',
    tone: 'success',
    label: anyReviewable ? 'Documents reviewed' : 'No documents need review',
    done: true,
  };
}

function checklistRequirement(checklists: JobChecklist[]): JobRequirement {
  const latest = [...checklists].sort(byNewest)[0];
  if (!latest) {
    return { id: 'req-checklist', icon: 'checkbox-outline', tone: 'warning', label: 'No checklist generated yet', done: false };
  }
  if (latest.status === 'completed') {
    return { id: 'req-checklist', icon: 'checkmark-circle', tone: 'success', label: 'Daily checklist complete', done: true };
  }
  return { id: 'req-checklist', icon: 'checkbox-outline', tone: 'warning', label: 'Daily checklist in progress', done: false };
}

export function requirementsForJob(
  hazards: JobHazardAssessment[],
  documents: JobDocument[],
  checklists: JobChecklist[],
  personId: string
): JobRequirement[] {
  return [hazardRequirement(hazards), documentRequirement(documents, personId), checklistRequirement(checklists)];
}

export function pendingDocumentReviewCount(documents: JobDocument[], personId: string): number {
  return pendingDocuments(documents, personId).length;
}
