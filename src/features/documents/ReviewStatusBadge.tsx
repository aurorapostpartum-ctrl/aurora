import { StatusBadge, type StatusTone } from '../../components/ui';
import { REVIEW_STATE_LABEL, type ReviewState } from './documentMeta';

const TONE: Record<ReviewState, StatusTone> = {
  not_required: 'neutral',
  reviewed: 'success',
  needs_review: 'warning',
  new_revision: 'danger',
};

export function ReviewStatusBadge({ state }: { state: ReviewState }) {
  if (state === 'not_required') return null;
  const label = state === 'new_revision' ? 'NEW REVISION AVAILABLE' : REVIEW_STATE_LABEL[state];
  return <StatusBadge label={label} tone={TONE[state]} />;
}
