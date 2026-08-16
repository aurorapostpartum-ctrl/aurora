import { Ionicons } from '@expo/vector-icons';

import type { ActivityType } from '../../types/domain';

export const ACTIVITY_ICON: Record<ActivityType, keyof typeof Ionicons.glyphMap> = {
  document_uploaded: 'document-text-outline',
  document_revised: 'document-text-outline',
  document_acknowledged: 'checkmark-done-outline',
  checklist_generated: 'checkbox-outline',
  checklist_completed: 'checkbox',
  hazard_assessment_generated: 'warning-outline',
  hazard_assessment_completed: 'shield-checkmark-outline',
  photo_uploaded: 'image-outline',
  deficiency_reported: 'alert-circle-outline',
  deficiency_assigned: 'person-add-outline',
  deficiency_status_changed: 'sync-outline',
  deficiency_completed: 'checkmark-circle-outline',
  note_added: 'chatbubble-ellipses-outline',
  announcement_posted: 'megaphone-outline',
  job_created: 'folder-open-outline',
  job_completed: 'ribbon-outline',
  employee_assigned: 'person-add-outline',
};

// Summaries are stored capitalized ("Uploaded Rev B...") for use as
// standalone sentences; lowercase the leading verb when the summary trails
// an actor's name instead ("John " + "uploaded Rev B...").
export function lowercaseLeadingVerb(summary: string): string {
  return summary.replace(
    /^(Uploaded|Reported|Generated|Completed|Resolved|Posted|Assigned|Unassigned|Marked|Submitted) /,
    (m) => m.toLowerCase()
  );
}
