import {
  ACTIVITY,
  ANNOUNCEMENTS,
  CHECKLIST_TEMPLATES,
  DEFICIENCIES,
  DOCUMENTS,
  HAZARD_TEMPLATES,
  JOB_CHECKLISTS,
  JOB_HAZARD_ASSESSMENTS,
  JOBS,
  NOTES,
  NOTIFICATIONS,
  PEOPLE,
  PHOTOS,
  PROJECT_COMPLETIONS,
} from './company';
import type { Person } from '../types/domain';

export function getPerson(id: string | undefined): Person | undefined {
  if (!id) return undefined;
  return PEOPLE.find((p) => p.id === id);
}

export function personName(id: string | undefined): string {
  return getPerson(id)?.name ?? 'Unknown';
}

export function getJob(id: string | undefined) {
  return JOBS.find((j) => j.id === id);
}

export function jobsForPerson(person: Person) {
  return JOBS.filter((j) => person.jobIds.includes(j.id));
}

export function documentsForJob(jobId: string) {
  return DOCUMENTS.filter((d) => d.jobId === jobId);
}

export function getDocument(id: string | undefined) {
  if (!id) return undefined;
  return DOCUMENTS.find((d) => d.id === id);
}

export function checklistsForJob(jobId: string) {
  return JOB_CHECKLISTS.filter((c) => c.jobId === jobId);
}

export function hazardAssessmentsForJob(jobId: string) {
  return JOB_HAZARD_ASSESSMENTS.filter((h) => h.jobId === jobId);
}

export function photosForJob(jobId: string) {
  return PHOTOS.filter((p) => p.jobId === jobId);
}

export function deficienciesForJob(jobId: string) {
  return DEFICIENCIES.filter((d) => d.jobId === jobId);
}

export function notesForJob(jobId: string) {
  return NOTES.filter((n) => n.jobId === jobId);
}

export function announcementsForJob(jobId: string) {
  return ANNOUNCEMENTS.filter((a) => a.jobId === jobId);
}

export function activityForJob(jobId: string) {
  return ACTIVITY.filter((a) => a.jobId === jobId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function allActivitySorted() {
  return [...ACTIVITY].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function notificationsForPerson(personId: string) {
  return NOTIFICATIONS.filter((n) => n.recipientId === personId).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function completionForJob(jobId: string) {
  return PROJECT_COMPLETIONS.find((c) => c.jobId === jobId);
}

export function getChecklistTemplate(id: string) {
  return CHECKLIST_TEMPLATES.find((t) => t.id === id);
}

export function getHazardTemplate(id: string) {
  return HAZARD_TEMPLATES.find((t) => t.id === id);
}

export function checklistRecordsForTemplate(templateId: string) {
  return JOB_CHECKLISTS.filter((c) => c.templateId === templateId);
}

export function lastUsedAtForChecklistTemplate(templateId: string): string | undefined {
  const records = checklistRecordsForTemplate(templateId);
  if (records.length === 0) return undefined;
  return records.reduce((latest, r) => (r.generatedAt > latest ? r.generatedAt : latest), records[0].generatedAt);
}

export function hazardRecordsForTemplate(templateId: string) {
  return JOB_HAZARD_ASSESSMENTS.filter((h) => h.templateId === templateId);
}

// Sample data is dated relative to SiteVault's "current" demo date rather
// than the real wall clock, so anchor relative timestamps to it.
const DEMO_NOW = new Date('2026-08-01T12:00:00Z').getTime();

export function demoNow(): Date {
  return new Date(DEMO_NOW);
}

export function isWithinLastDays(iso: string, days: number): boolean {
  return DEMO_NOW - new Date(iso).getTime() <= days * 24 * 60 * 60 * 1000;
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = Math.max(0, DEMO_NOW - then);
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
