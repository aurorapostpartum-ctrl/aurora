import { useSyncExternalStore } from 'react';

import {
  ACTIVITY,
  ANNOUNCEMENTS,
  CHECKLIST_TEMPLATES,
  DEFICIENCIES,
  DOCUMENTS,
  HAZARD_TEMPLATES,
  JOBS,
  JOB_CHECKLISTS,
  JOB_HAZARD_ASSESSMENTS,
  NOTES,
  NOTIFICATIONS,
  PEOPLE,
  PHOTOS,
  PROJECT_COMPLETIONS,
} from './company';
import { enqueueSync } from './offlineStore';
import { demoNow, formatDate } from './selectors';
import { createId } from '../lib/id';
import type {
  ActivityType,
  AppNotification,
  ChecklistItem,
  ChecklistItemStatus,
  ChecklistTemplate,
  ChecklistTemplateSection,
  Deficiency,
  DeficiencyPriority,
  DeficiencyStatus,
  DocumentCategory,
  DocumentFileType,
  HazardAssessmentStep,
  HazardAssessmentTemplate,
  HazardSourceFileType,
  HazardTemplateSection,
  Job,
  JobAnnouncement,
  JobChecklist,
  JobDocument,
  JobHazardAssessment,
  JobHazardItem,
  JobNote,
  JobPhoto,
  JobStatus,
  NotificationType,
  PhotoCategory,
  ProjectCompletion,
  ProjectCompletionItem,
  ProjectType,
  TemplateVisibility,
} from '../types/domain';

// SiteVault's data is a seeded, in-memory dataset (see company.ts) rather
// than a live backend. Screens that need to reflect writes made through
// this store (creating or editing a job) subscribe via useMockDataVersion()
// and re-read the same JOBS/ACTIVITY/... array references, which are
// mutated in place below. `version` is a plain counter — bumped on every
// write — rather than something derived like array length, since an edit
// mutates an existing entry without changing any array's length.

let version = 0;
const listeners = new Set<() => void>();

function emitChange() {
  version += 1;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return version;
}

export function useMockDataVersion() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// --- Notifications ---
// Every meaningful action below pushes its own notification alongside its
// activity entry — one per event, only to the job's other people, so the
// notification center reflects real system actions rather than noise.

interface NotifyInput {
  jobId?: string;
  type: NotificationType;
  title: string;
  body: string;
  recordId?: string;
  createdAt?: string;
}

function notify(recipientIds: string[], input: NotifyInput) {
  const createdAt = input.createdAt ?? demoNow().toISOString();
  for (const recipientId of new Set(recipientIds)) {
    const notification: AppNotification = {
      id: createId('ntf'),
      jobId: input.jobId,
      type: input.type,
      title: input.title,
      body: input.body,
      createdAt,
      read: false,
      recipientId,
      recordId: input.recordId,
    };
    NOTIFICATIONS.unshift(notification);
  }
}

/** Everyone else with access to a job — used to scope notifications to people who'd actually care. */
function otherJobPeople(job: Job, excludeId: string): string[] {
  return [...job.managerIds, ...job.employeeIds].filter((id) => id !== excludeId);
}

export function markNotificationRead(notificationId: string) {
  const index = NOTIFICATIONS.findIndex((n) => n.id === notificationId);
  if (index === -1) return;
  if (NOTIFICATIONS[index].read) return;
  NOTIFICATIONS[index] = { ...NOTIFICATIONS[index], read: true };
  emitChange();
}

export function markAllNotificationsRead(personId: string) {
  let changed = false;
  for (let i = 0; i < NOTIFICATIONS.length; i += 1) {
    if (NOTIFICATIONS[i].recipientId === personId && !NOTIFICATIONS[i].read) {
      NOTIFICATIONS[i] = { ...NOTIFICATIONS[i], read: true };
      changed = true;
    }
  }
  if (changed) emitChange();
}

const TAB_COLOR_PALETTE = ['#C4813C', '#5B7CA3', '#4C6B58', '#A45D4E', '#6E5A9E', '#8C6A4A'];

export interface CreateJobInput {
  name: string;
  address: string;
  client: string;
  projectType: ProjectType;
  startDate: string;
  targetCompletionDate: string;
  description: string;
  managerId: string;
  employeeIds: string[];
  checklistTemplateIds: string[];
  hazardTemplateIds: string[];
}

const DEFAULT_COMPLETION_LABELS = [
  'Work completed',
  'Final inspection completed',
  'Final photos uploaded',
  'Deficiencies resolved',
  'Client walkthrough completed',
  'Client sign-off completed',
  'Final documents uploaded',
];

function defaultCompletionChecklist(): ProjectCompletionItem[] {
  return DEFAULT_COMPLETION_LABELS.map((label) => ({
    id: createId('pc'),
    label,
    done: false,
    required: true,
  }));
}

export function createJob(input: CreateJobInput): Job {
  const now = demoNow().toISOString();

  const job: Job = {
    id: createId('job'),
    name: input.name.trim(),
    address: input.address.trim(),
    client: input.client.trim() || 'TBD',
    projectType: input.projectType,
    status: 'active',
    startDate: input.startDate,
    targetCompletionDate: input.targetCompletionDate,
    tabColor: TAB_COLOR_PALETTE[JOBS.length % TAB_COLOR_PALETTE.length],
    managerIds: [input.managerId],
    employeeIds: input.employeeIds,
    description: input.description.trim(),
    progress: 0,
  };

  JOBS.unshift(job);
  ACTIVITY.unshift({
    id: createId('act'),
    jobId: job.id,
    type: 'job_created',
    actorId: input.managerId,
    createdAt: now,
    summary: `Created the ${job.name} job folder`,
  });

  for (const templateId of input.checklistTemplateIds) {
    generateChecklistFromTemplate({ jobId: job.id, templateId, generatedBy: input.managerId });
  }

  for (const templateId of input.hazardTemplateIds) {
    generateHazardAssessmentFromTemplate({ jobId: job.id, templateId, generatedBy: input.managerId });
  }

  PROJECT_COMPLETIONS.unshift({
    jobId: job.id,
    isComplete: false,
    finalNotes: '',
    checklist: defaultCompletionChecklist(),
  });

  emitChange();
  return job;
}

export interface UpdateJobInput {
  name: string;
  address: string;
  client: string;
  projectType: ProjectType;
  status: JobStatus;
  startDate: string;
  targetCompletionDate: string;
  description: string;
  employeeIds: string[];
}

export function updateJob(jobId: string, input: UpdateJobInput): Job | undefined {
  const index = JOBS.findIndex((j) => j.id === jobId);
  if (index === -1) return undefined;

  const updated: Job = {
    ...JOBS[index],
    name: input.name.trim(),
    address: input.address.trim(),
    client: input.client.trim() || 'TBD',
    projectType: input.projectType,
    status: input.status,
    startDate: input.startDate,
    targetCompletionDate: input.targetCompletionDate,
    description: input.description.trim(),
    employeeIds: input.employeeIds,
  };

  JOBS[index] = updated;
  emitChange();
  return updated;
}

export function addEmployeesToJob(jobId: string, employeeIds: string[]): Job | undefined {
  const index = JOBS.findIndex((j) => j.id === jobId);
  if (index === -1) return undefined;

  const existing = JOBS[index];
  const newlyAdded = employeeIds.filter((id) => !existing.employeeIds.includes(id));
  const updated: Job = {
    ...existing,
    employeeIds: [...new Set([...existing.employeeIds, ...employeeIds])],
  };
  JOBS[index] = updated;

  notify(newlyAdded, {
    jobId,
    type: 'job_assignment',
    title: 'New job assignment',
    body: `You've been added to ${updated.name}.`,
  });

  emitChange();
  return updated;
}

export function setJobStatus(jobId: string, status: JobStatus): Job | undefined {
  const index = JOBS.findIndex((j) => j.id === jobId);
  if (index === -1) return undefined;

  const updated: Job = { ...JOBS[index], status };
  JOBS[index] = updated;
  emitChange();
  return updated;
}

export function duplicateJob(jobId: string, managerId: string): Job | undefined {
  const source = JOBS.find((j) => j.id === jobId);
  if (!source) return undefined;

  return createJob({
    name: `${source.name} (Copy)`,
    address: source.address,
    client: source.client,
    projectType: source.projectType,
    startDate: demoNow().toISOString().slice(0, 10),
    targetCompletionDate: source.targetCompletionDate,
    description: source.description,
    managerId,
    employeeIds: [],
    checklistTemplateIds: [],
    hazardTemplateIds: [],
  });
}

export interface RecordActivityInput {
  jobId: string;
  type: ActivityType;
  actorId: string;
  summary: string;
}

export function recordActivity(input: RecordActivityInput) {
  ACTIVITY.unshift({
    id: createId('act'),
    jobId: input.jobId,
    type: input.type,
    actorId: input.actorId,
    createdAt: demoNow().toISOString(),
    summary: input.summary,
  });
  emitChange();
}

export interface AddDocumentInput {
  jobId: string;
  title: string;
  category: DocumentCategory;
  fileType: DocumentFileType;
  uploadedBy: string;
  reviewRequired: boolean;
  pageCount: number;
}

export function addDocument(input: AddDocumentInput): JobDocument {
  const now = demoNow().toISOString();

  const document: JobDocument = {
    id: createId('doc'),
    jobId: input.jobId,
    title: input.title.trim(),
    category: input.category,
    reviewRequired: input.reviewRequired,
    acknowledgments: [],
    revisions: [
      {
        id: createId('rev'),
        revisionNumber: 1,
        uploadedBy: input.uploadedBy,
        uploadedAt: now,
        notes: 'Initial upload.',
        fileType: input.fileType,
        isCurrent: true,
        pageCount: Math.max(1, input.pageCount),
      },
    ],
  };

  DOCUMENTS.unshift(document);
  ACTIVITY.unshift({
    id: createId('act'),
    jobId: input.jobId,
    type: 'document_uploaded',
    actorId: input.uploadedBy,
    createdAt: now,
    summary: `Uploaded ${document.title}`,
  });

  const job = JOBS.find((j) => j.id === input.jobId);
  if (job) {
    notify(otherJobPeople(job, input.uploadedBy), input.reviewRequired
      ? {
          jobId: input.jobId,
          type: 'document_acknowledgment_required',
          title: 'Document requires your acknowledgment',
          body: `${document.title} was uploaded to ${job.name} — please review and acknowledge.`,
          recordId: document.id,
          createdAt: now,
        }
      : {
          jobId: input.jobId,
          type: 'document_uploaded',
          title: 'New document uploaded',
          body: `${document.title} was uploaded to ${job.name}.`,
          recordId: document.id,
          createdAt: now,
        });
  }

  emitChange();
  return document;
}

export interface AddDocumentRevisionInput {
  documentId: string;
  uploadedBy: string;
  notes: string;
  fileType: DocumentFileType;
  pageCount: number;
}

export function addDocumentRevision(input: AddDocumentRevisionInput): JobDocument | undefined {
  const index = DOCUMENTS.findIndex((d) => d.id === input.documentId);
  if (index === -1) return undefined;

  const doc = DOCUMENTS[index];
  const now = demoNow().toISOString();
  const nextNumber = Math.max(...doc.revisions.map((r) => r.revisionNumber)) + 1;

  const updated: JobDocument = {
    ...doc,
    revisions: [
      {
        id: createId('rev'),
        revisionNumber: nextNumber,
        uploadedBy: input.uploadedBy,
        uploadedAt: now,
        notes: input.notes.trim() || 'Revision update.',
        fileType: input.fileType,
        isCurrent: true,
        pageCount: Math.max(1, input.pageCount),
      },
      ...doc.revisions.map((r) => ({ ...r, isCurrent: false })),
    ],
    // A fresh revision needs everyone's review again — except the person who
    // just uploaded it, who by definition has seen what's in it.
    acknowledgments: doc.reviewRequired ? [{ personId: input.uploadedBy, acknowledgedAt: now }] : doc.acknowledgments,
  };

  DOCUMENTS[index] = updated;
  ACTIVITY.unshift({
    id: createId('act'),
    jobId: doc.jobId,
    type: 'document_revised',
    actorId: input.uploadedBy,
    createdAt: now,
    summary: `Uploaded Rev ${nextNumber} of ${doc.title}`,
  });

  const job = JOBS.find((j) => j.id === doc.jobId);
  if (job) {
    notify(otherJobPeople(job, input.uploadedBy), doc.reviewRequired
      ? {
          jobId: doc.jobId,
          type: 'document_acknowledgment_required',
          title: 'Document requires your acknowledgment',
          body: `${doc.title} was updated to Rev ${nextNumber} on ${job.name} — please review and acknowledge.`,
          recordId: doc.id,
          createdAt: now,
        }
      : {
          jobId: doc.jobId,
          type: 'print_revision',
          title: 'New print revision',
          body: `${doc.title} updated to Rev ${nextNumber} on ${job.name}.`,
          recordId: doc.id,
          createdAt: now,
        });
  }

  emitChange();
  return updated;
}

export function markDocumentReviewed(documentId: string, personId: string): JobDocument | undefined {
  const index = DOCUMENTS.findIndex((d) => d.id === documentId);
  if (index === -1) return undefined;

  const doc = DOCUMENTS[index];
  if (doc.acknowledgments.some((a) => a.personId === personId)) return doc;

  const now = demoNow().toISOString();
  const updated: JobDocument = {
    ...doc,
    acknowledgments: [...doc.acknowledgments, { personId, acknowledgedAt: now }],
  };
  DOCUMENTS[index] = updated;

  const current = updated.revisions.find((r) => r.isCurrent) ?? updated.revisions[0];
  ACTIVITY.unshift({
    id: createId('act'),
    jobId: doc.jobId,
    type: 'document_acknowledged',
    actorId: personId,
    createdAt: now,
    summary: `Reviewed ${doc.title} (Rev ${current.revisionNumber})`,
  });
  emitChange();
  return updated;
}

/**
 * A generated JobChecklist keeps a flat item list (its own independent copy,
 * per-item pass/fail status) rather than the template's nested sections —
 * this is where a template's structure turns into a real, working record.
 */
export function flattenChecklistTemplateSections(sections: ChecklistTemplateSection[]): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  for (const section of sections) {
    for (const item of section.items) {
      items.push({
        id: item.id,
        text: item.text,
        status: 'pending',
        sectionName: section.name,
        required: item.required,
        requiresPhoto: item.requiresPhoto,
      });
    }
  }
  return items;
}

export interface ChecklistTemplateSectionInput {
  name: string;
  items: {
    text: string;
    required: boolean;
    requiresPhoto: boolean;
    notes?: string;
  }[];
}

export interface CreateChecklistTemplateInput {
  name: string;
  trade: string;
  description: string;
  sections: ChecklistTemplateSectionInput[];
  createdBy: string;
  visibility: TemplateVisibility;
}

function buildSections(sections: ChecklistTemplateSectionInput[]): ChecklistTemplateSection[] {
  return sections
    .filter((s) => s.items.length > 0)
    .map((section) => ({
      id: createId('sec'),
      name: section.name.trim() || 'Untitled Section',
      items: section.items
        .filter((i) => i.text.trim().length > 0)
        .map((item) => ({
          id: createId('item'),
          text: item.text.trim(),
          required: item.required,
          requiresPhoto: item.requiresPhoto,
          notes: item.notes?.trim() || undefined,
        })),
    }));
}

export function createChecklistTemplate(input: CreateChecklistTemplateInput): ChecklistTemplate {
  const now = demoNow().toISOString();
  const template: ChecklistTemplate = {
    id: createId('tmpl-cl'),
    name: input.name.trim(),
    trade: input.trade.trim() || 'General',
    description: input.description.trim(),
    sections: buildSections(input.sections),
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
    visibility: input.visibility,
    archived: false,
  };
  CHECKLIST_TEMPLATES.unshift(template);
  emitChange();
  return template;
}

export interface UpdateChecklistTemplateInput {
  name: string;
  trade: string;
  description: string;
  sections: ChecklistTemplateSectionInput[];
  visibility: TemplateVisibility;
}

export function updateChecklistTemplate(
  templateId: string,
  input: UpdateChecklistTemplateInput
): ChecklistTemplate | undefined {
  const index = CHECKLIST_TEMPLATES.findIndex((t) => t.id === templateId);
  if (index === -1) return undefined;

  const updated: ChecklistTemplate = {
    ...CHECKLIST_TEMPLATES[index],
    name: input.name.trim(),
    trade: input.trade.trim() || 'General',
    description: input.description.trim(),
    sections: buildSections(input.sections),
    visibility: input.visibility,
    updatedAt: demoNow().toISOString(),
  };
  CHECKLIST_TEMPLATES[index] = updated;
  emitChange();
  return updated;
}

export function duplicateChecklistTemplate(templateId: string, actorId: string): ChecklistTemplate | undefined {
  const source = CHECKLIST_TEMPLATES.find((t) => t.id === templateId);
  if (!source) return undefined;

  return createChecklistTemplate({
    name: `${source.name} (Copy)`,
    trade: source.trade,
    description: source.description,
    sections: source.sections.map((section) => ({
      name: section.name,
      items: section.items.map((item) => ({
        text: item.text,
        required: item.required,
        requiresPhoto: item.requiresPhoto,
        notes: item.notes,
      })),
    })),
    createdBy: actorId,
    // A duplicate starts private — the author decides if/when to publish it company-wide.
    visibility: 'private',
  });
}

export function setChecklistTemplateArchived(templateId: string, archived: boolean): ChecklistTemplate | undefined {
  const index = CHECKLIST_TEMPLATES.findIndex((t) => t.id === templateId);
  if (index === -1) return undefined;

  const updated: ChecklistTemplate = { ...CHECKLIST_TEMPLATES[index], archived, updatedAt: demoNow().toISOString() };
  CHECKLIST_TEMPLATES[index] = updated;
  emitChange();
  return updated;
}

const PHOTO_PALETTE = ['#8C6A4A', '#5B7CA3', '#9A8464', '#4C6B58', '#A45D4E', '#6E5A9E', '#C4813C'];

export interface AddPhotoInput {
  jobId: string;
  caption: string;
  uploadedBy: string;
  tags?: string[];
  uri?: string;
  category?: PhotoCategory;
  linkedRecordId?: string;
  linkedRecordLabel?: string;
}

export function addPhoto(input: AddPhotoInput): JobPhoto {
  const photo: JobPhoto = {
    id: createId('ph'),
    jobId: input.jobId,
    uri: input.uri,
    swatch: PHOTO_PALETTE[PHOTOS.length % PHOTO_PALETTE.length],
    caption: input.caption,
    category: input.category ?? 'general',
    linkedRecordId: input.linkedRecordId,
    linkedRecordLabel: input.linkedRecordLabel,
    uploadedBy: input.uploadedBy,
    uploadedAt: demoNow().toISOString(),
    tags: input.tags ?? [],
  };
  PHOTOS.unshift(photo);
  ACTIVITY.unshift({
    id: createId('act'),
    jobId: input.jobId,
    type: 'photo_uploaded',
    actorId: input.uploadedBy,
    createdAt: photo.uploadedAt,
    summary: `Uploaded photo: ${photo.caption}`,
  });
  enqueueSync('photo', photo.id, input.jobId, photo.caption);
  emitChange();
  return photo;
}

export interface GenerateChecklistInput {
  jobId: string;
  templateId: string;
  generatedBy: string;
}

export function generateChecklistFromTemplate(input: GenerateChecklistInput): JobChecklist | undefined {
  const template = CHECKLIST_TEMPLATES.find((t) => t.id === input.templateId);
  if (!template) return undefined;

  const job = JOBS.find((j) => j.id === input.jobId);
  const now = demoNow().toISOString();
  const record: JobChecklist = {
    id: createId('jcl'),
    jobId: input.jobId,
    templateId: template.id,
    templateName: template.name,
    trade: template.trade,
    recordTitle: `${job?.name ?? ''} — ${template.name} — ${formatDate(now)}`,
    generatedBy: input.generatedBy,
    generatedAt: now,
    status: 'in_progress',
    items: flattenChecklistTemplateSections(template.sections),
  };

  JOB_CHECKLISTS.unshift(record);
  ACTIVITY.unshift({
    id: createId('act'),
    jobId: input.jobId,
    type: 'checklist_generated',
    actorId: input.generatedBy,
    createdAt: now,
    summary: `Generated ${template.name}`,
  });

  if (job) {
    notify(otherJobPeople(job, input.generatedBy), {
      jobId: input.jobId,
      type: 'checklist_required',
      title: 'Checklist required',
      body: `${template.name} was generated for ${job.name} and needs to be completed.`,
      recordId: record.id,
      createdAt: now,
    });
  }

  emitChange();
  return record;
}

export function updateChecklistItemStatus(
  checklistId: string,
  itemId: string,
  status: ChecklistItemStatus
): JobChecklist | undefined {
  const index = JOB_CHECKLISTS.findIndex((c) => c.id === checklistId);
  if (index === -1) return undefined;

  const checklist = JOB_CHECKLISTS[index];
  const updated: JobChecklist = {
    ...checklist,
    items: checklist.items.map((item) => (item.id === itemId ? { ...item, status } : item)),
  };
  JOB_CHECKLISTS[index] = updated;
  emitChange();
  return updated;
}

export function updateChecklistItemNote(checklistId: string, itemId: string, note: string): JobChecklist | undefined {
  const index = JOB_CHECKLISTS.findIndex((c) => c.id === checklistId);
  if (index === -1) return undefined;

  const checklist = JOB_CHECKLISTS[index];
  const updated: JobChecklist = {
    ...checklist,
    items: checklist.items.map((item) => (item.id === itemId ? { ...item, note: note || undefined } : item)),
  };
  JOB_CHECKLISTS[index] = updated;
  emitChange();
  return updated;
}

export function addChecklistItemPhoto(
  checklistId: string,
  itemId: string,
  uploadedBy: string,
  uri?: string
): JobChecklist | undefined {
  const index = JOB_CHECKLISTS.findIndex((c) => c.id === checklistId);
  if (index === -1) return undefined;

  const checklist = JOB_CHECKLISTS[index];
  const item = checklist.items.find((i) => i.id === itemId);
  if (!item) return undefined;

  const photo = addPhoto({
    jobId: checklist.jobId,
    caption: item.text,
    uploadedBy,
    tags: ['checklist'],
    uri,
    category: 'checklist',
    linkedRecordId: checklist.id,
    linkedRecordLabel: checklist.templateName,
  });

  const updated: JobChecklist = {
    ...checklist,
    items: checklist.items.map((i) => (i.id === itemId ? { ...i, photoIds: [...(i.photoIds ?? []), photo.id] } : i)),
  };
  JOB_CHECKLISTS[index] = updated;
  emitChange();
  return updated;
}

export function submitChecklist(checklistId: string, submittedBy: string): JobChecklist | undefined {
  const index = JOB_CHECKLISTS.findIndex((c) => c.id === checklistId);
  if (index === -1) return undefined;

  const checklist = JOB_CHECKLISTS[index];
  const now = demoNow().toISOString();
  const updated: JobChecklist = { ...checklist, status: 'completed', completedBy: submittedBy, completedAt: now };
  JOB_CHECKLISTS[index] = updated;

  ACTIVITY.unshift({
    id: createId('act'),
    jobId: checklist.jobId,
    type: 'checklist_completed',
    actorId: submittedBy,
    createdAt: now,
    summary: `Submitted ${checklist.templateName}`,
  });
  enqueueSync('checklist', checklist.id, checklist.jobId, checklist.templateName);
  emitChange();
  return updated;
}

/**
 * Mirrors flattenChecklistTemplateSections: a generated JobHazardAssessment
 * keeps its own independent flat list, so a later template edit never
 * touches an already-generated record.
 */
export function flattenHazardTemplateSections(sections: HazardTemplateSection[]): JobHazardItem[] {
  const items: JobHazardItem[] = [];
  for (const section of sections) {
    for (const item of section.items) {
      items.push({
        id: item.id,
        hazard: item.hazard,
        controlMeasure: item.controlMeasure,
        identified: false,
        sectionName: section.name,
        required: item.required,
        requiresPhoto: item.requiresPhoto,
      });
    }
  }
  return items;
}

export interface HazardTemplateSectionInput {
  name: string;
  items: {
    hazard: string;
    controlMeasure: string;
    required: boolean;
    requiresPhoto: boolean;
    notes?: string;
  }[];
}

export interface CreateHazardTemplateInput {
  name: string;
  trade: string;
  description: string;
  sections: HazardTemplateSectionInput[];
  createdBy: string;
  visibility: TemplateVisibility;
  requiresSignature: boolean;
  sourceFileName?: string;
  sourceFileType?: HazardSourceFileType;
}

function buildHazardSections(sections: HazardTemplateSectionInput[]): HazardTemplateSection[] {
  return sections
    .filter((s) => s.items.length > 0)
    .map((section) => ({
      id: createId('sec'),
      name: section.name.trim() || 'Untitled Section',
      items: section.items
        .filter((i) => i.hazard.trim().length > 0)
        .map((item) => ({
          id: createId('haz'),
          hazard: item.hazard.trim(),
          controlMeasure: item.controlMeasure.trim(),
          required: item.required,
          requiresPhoto: item.requiresPhoto,
          notes: item.notes?.trim() || undefined,
        })),
    }));
}

export function createHazardTemplate(input: CreateHazardTemplateInput): HazardAssessmentTemplate {
  const now = demoNow().toISOString();
  const template: HazardAssessmentTemplate = {
    id: createId('tmpl-haz'),
    name: input.name.trim(),
    trade: input.trade.trim() || 'General',
    description: input.description.trim(),
    sections: buildHazardSections(input.sections),
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
    visibility: input.visibility,
    archived: false,
    requiresSignature: input.requiresSignature,
    sourceFileName: input.sourceFileName,
    sourceFileType: input.sourceFileType,
  };
  HAZARD_TEMPLATES.unshift(template);
  emitChange();
  return template;
}

export interface UpdateHazardTemplateInput {
  name: string;
  trade: string;
  description: string;
  sections: HazardTemplateSectionInput[];
  visibility: TemplateVisibility;
  requiresSignature: boolean;
}

export function updateHazardTemplate(
  templateId: string,
  input: UpdateHazardTemplateInput
): HazardAssessmentTemplate | undefined {
  const index = HAZARD_TEMPLATES.findIndex((t) => t.id === templateId);
  if (index === -1) return undefined;

  const updated: HazardAssessmentTemplate = {
    ...HAZARD_TEMPLATES[index],
    name: input.name.trim(),
    trade: input.trade.trim() || 'General',
    description: input.description.trim(),
    sections: buildHazardSections(input.sections),
    visibility: input.visibility,
    requiresSignature: input.requiresSignature,
    updatedAt: demoNow().toISOString(),
  };
  HAZARD_TEMPLATES[index] = updated;
  emitChange();
  return updated;
}

export function duplicateHazardTemplate(templateId: string, actorId: string): HazardAssessmentTemplate | undefined {
  const source = HAZARD_TEMPLATES.find((t) => t.id === templateId);
  if (!source) return undefined;

  return createHazardTemplate({
    name: `${source.name} (Copy)`,
    trade: source.trade,
    description: source.description,
    sections: source.sections.map((section) => ({
      name: section.name,
      items: section.items.map((item) => ({
        hazard: item.hazard,
        controlMeasure: item.controlMeasure,
        required: item.required,
        requiresPhoto: item.requiresPhoto,
        notes: item.notes,
      })),
    })),
    createdBy: actorId,
    // A duplicate starts private — the author decides if/when to publish it company-wide.
    visibility: 'private',
    requiresSignature: source.requiresSignature,
  });
}

export function setHazardTemplateArchived(templateId: string, archived: boolean): HazardAssessmentTemplate | undefined {
  const index = HAZARD_TEMPLATES.findIndex((t) => t.id === templateId);
  if (index === -1) return undefined;

  const updated: HazardAssessmentTemplate = { ...HAZARD_TEMPLATES[index], archived, updatedAt: demoNow().toISOString() };
  HAZARD_TEMPLATES[index] = updated;
  emitChange();
  return updated;
}

// --- Job-specific Hazard Assessment guided workflow ---
// A generated JobHazardAssessment is an independent copy — the template it
// came from is never touched by anything below.

export interface GenerateHazardAssessmentInput {
  jobId: string;
  templateId: string;
  generatedBy: string;
}

export function generateHazardAssessmentFromTemplate(
  input: GenerateHazardAssessmentInput
): JobHazardAssessment | undefined {
  const template = HAZARD_TEMPLATES.find((t) => t.id === input.templateId);
  if (!template) return undefined;

  const job = JOBS.find((j) => j.id === input.jobId);
  const now = demoNow().toISOString();
  const record: JobHazardAssessment = {
    id: createId('jha'),
    jobId: input.jobId,
    templateId: template.id,
    templateName: template.name,
    trade: template.trade,
    recordTitle: `${job?.name ?? ''} — ${template.name} — ${formatDate(now)}`,
    generatedBy: input.generatedBy,
    generatedAt: now,
    status: 'in_progress',
    workDescription: '',
    notes: '',
    currentStep: 0,
    hazards: flattenHazardTemplateSections(template.sections),
  };

  JOB_HAZARD_ASSESSMENTS.unshift(record);
  ACTIVITY.unshift({
    id: createId('act'),
    jobId: input.jobId,
    type: 'hazard_assessment_generated',
    actorId: input.generatedBy,
    createdAt: now,
    summary: `Generated ${template.name}`,
  });

  if (job) {
    notify(otherJobPeople(job, input.generatedBy), {
      jobId: input.jobId,
      type: 'hazard_assessment_required',
      title: 'Hazard assessment required',
      body: `${template.name} was generated for ${job.name} and needs to be completed.`,
      recordId: record.id,
      createdAt: now,
    });
  }

  emitChange();
  return record;
}

function updateHazardAssessment(
  recordId: string,
  updater: (record: JobHazardAssessment) => JobHazardAssessment
): JobHazardAssessment | undefined {
  const index = JOB_HAZARD_ASSESSMENTS.findIndex((r) => r.id === recordId);
  if (index === -1) return undefined;

  const updated = updater(JOB_HAZARD_ASSESSMENTS[index]);
  JOB_HAZARD_ASSESSMENTS[index] = updated;
  emitChange();
  return updated;
}

export function updateHazardWorkDescription(recordId: string, workDescription: string): JobHazardAssessment | undefined {
  return updateHazardAssessment(recordId, (record) => ({ ...record, workDescription }));
}

export function setHazardItemIdentified(recordId: string, itemId: string, identified: boolean): JobHazardAssessment | undefined {
  return updateHazardAssessment(recordId, (record) => ({
    ...record,
    hazards: record.hazards.map((h) => (h.id === itemId ? { ...h, identified } : h)),
  }));
}

export function addCustomHazardItem(recordId: string, hazard: string): JobHazardAssessment | undefined {
  const text = hazard.trim();
  if (!text) return undefined;
  return updateHazardAssessment(recordId, (record) => ({
    ...record,
    hazards: [
      ...record.hazards,
      {
        id: createId('haz-custom'),
        hazard: text,
        controlMeasure: '',
        identified: true,
        custom: true,
        required: false,
        requiresPhoto: false,
      },
    ],
  }));
}

export function removeHazardItem(recordId: string, itemId: string): JobHazardAssessment | undefined {
  return updateHazardAssessment(recordId, (record) => ({
    ...record,
    hazards: record.hazards.filter((h) => h.id !== itemId),
  }));
}

export function updateHazardItemControl(recordId: string, itemId: string, controlMeasure: string): JobHazardAssessment | undefined {
  return updateHazardAssessment(recordId, (record) => ({
    ...record,
    hazards: record.hazards.map((h) => (h.id === itemId ? { ...h, controlMeasure } : h)),
  }));
}

export function addHazardItemPhoto(
  recordId: string,
  itemId: string,
  uploadedBy: string,
  uri?: string
): JobHazardAssessment | undefined {
  const record = JOB_HAZARD_ASSESSMENTS.find((r) => r.id === recordId);
  const item = record?.hazards.find((h) => h.id === itemId);
  if (!record || !item) return undefined;

  const photo = addPhoto({
    jobId: record.jobId,
    caption: item.hazard,
    uploadedBy,
    tags: ['hazard-assessment'],
    uri,
    category: 'hazard_assessment',
    linkedRecordId: record.id,
    linkedRecordLabel: record.templateName,
  });

  return updateHazardAssessment(recordId, (r) => ({
    ...r,
    hazards: r.hazards.map((h) => (h.id === itemId ? { ...h, photoIds: [...(h.photoIds ?? []), photo.id] } : h)),
  }));
}

export function updateHazardNotes(recordId: string, notes: string): JobHazardAssessment | undefined {
  return updateHazardAssessment(recordId, (record) => ({ ...record, notes }));
}

export function setHazardCurrentStep(recordId: string, step: HazardAssessmentStep): JobHazardAssessment | undefined {
  return updateHazardAssessment(recordId, (record) => ({ ...record, currentStep: step }));
}

export function signHazardAssessment(recordId: string, signatureName: string): JobHazardAssessment | undefined {
  return updateHazardAssessment(recordId, (record) => ({
    ...record,
    signatureName: signatureName.trim(),
    signedAt: demoNow().toISOString(),
  }));
}

export function submitHazardAssessment(recordId: string, submittedBy: string): JobHazardAssessment | undefined {
  const record = JOB_HAZARD_ASSESSMENTS.find((r) => r.id === recordId);
  if (!record) return undefined;
  const now = demoNow().toISOString();

  const updated = updateHazardAssessment(recordId, (r) => ({
    ...r,
    status: 'completed',
    completedBy: submittedBy,
    completedAt: now,
    currentStep: 6,
  }));

  ACTIVITY.unshift({
    id: createId('act'),
    jobId: record.jobId,
    type: 'hazard_assessment_completed',
    actorId: submittedBy,
    createdAt: now,
    summary: `Submitted ${record.templateName}`,
  });
  enqueueSync('hazard', record.id, record.jobId, record.templateName);
  emitChange();
  return updated;
}

// --- Deficiencies ---

export interface CreateDeficiencyInput {
  jobId: string;
  title: string;
  description: string;
  location: string;
  priority: DeficiencyPriority;
  reportedBy: string;
  assignedTo?: string;
}

export function createDeficiency(input: CreateDeficiencyInput): Deficiency {
  const now = demoNow().toISOString();
  const deficiency: Deficiency = {
    id: createId('def'),
    jobId: input.jobId,
    title: input.title.trim(),
    description: input.description.trim(),
    status: 'open',
    priority: input.priority,
    location: input.location.trim() || 'Unspecified',
    reportedBy: input.reportedBy,
    reportedAt: now,
    assignedTo: input.assignedTo,
    photoIds: [],
  };
  DEFICIENCIES.unshift(deficiency);
  ACTIVITY.unshift({
    id: createId('act'),
    jobId: input.jobId,
    type: 'deficiency_reported',
    actorId: input.reportedBy,
    createdAt: now,
    summary: `Reported deficiency: ${deficiency.title}`,
  });
  emitChange();
  return deficiency;
}

function updateDeficiencyRecord(
  deficiencyId: string,
  updater: (deficiency: Deficiency) => Deficiency
): Deficiency | undefined {
  const index = DEFICIENCIES.findIndex((d) => d.id === deficiencyId);
  if (index === -1) return undefined;

  const updated = updater(DEFICIENCIES[index]);
  DEFICIENCIES[index] = updated;
  emitChange();
  return updated;
}

export interface UpdateDeficiencyInput {
  title: string;
  description: string;
  location: string;
  priority: DeficiencyPriority;
}

export function updateDeficiency(deficiencyId: string, input: UpdateDeficiencyInput): Deficiency | undefined {
  return updateDeficiencyRecord(deficiencyId, (d) => ({
    ...d,
    title: input.title.trim(),
    description: input.description.trim(),
    location: input.location.trim() || 'Unspecified',
    priority: input.priority,
  }));
}

export function assignDeficiency(deficiencyId: string, assigneeId: string | undefined, actorId: string): Deficiency | undefined {
  const deficiency = DEFICIENCIES.find((d) => d.id === deficiencyId);
  if (!deficiency) return undefined;
  const now = demoNow().toISOString();

  const updated = updateDeficiencyRecord(deficiencyId, (d) => ({ ...d, assignedTo: assigneeId }));

  ACTIVITY.unshift({
    id: createId('act'),
    jobId: deficiency.jobId,
    type: 'deficiency_assigned',
    actorId,
    createdAt: now,
    summary: assigneeId
      ? `Assigned deficiency "${deficiency.title}"`
      : `Unassigned deficiency "${deficiency.title}"`,
  });
  emitChange();
  return updated;
}

const STATUS_LABEL_FOR_ACTIVITY: Record<DeficiencyStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  complete: 'Complete',
};

export function setDeficiencyStatus(deficiencyId: string, status: DeficiencyStatus, actorId: string): Deficiency | undefined {
  const deficiency = DEFICIENCIES.find((d) => d.id === deficiencyId);
  if (!deficiency) return undefined;
  const now = demoNow().toISOString();

  const updated = updateDeficiencyRecord(deficiencyId, (d) => ({
    ...d,
    status,
    completedBy: status === 'complete' ? actorId : undefined,
    completedAt: status === 'complete' ? now : undefined,
  }));

  ACTIVITY.unshift({
    id: createId('act'),
    jobId: deficiency.jobId,
    type: status === 'complete' ? 'deficiency_completed' : 'deficiency_status_changed',
    actorId,
    createdAt: now,
    summary:
      status === 'complete'
        ? `Marked complete: ${deficiency.title}`
        : `Marked ${STATUS_LABEL_FOR_ACTIVITY[status]}: ${deficiency.title}`,
  });
  emitChange();
  return updated;
}

export function addDeficiencyPhoto(deficiencyId: string, uploadedBy: string, uri?: string): Deficiency | undefined {
  const deficiency = DEFICIENCIES.find((d) => d.id === deficiencyId);
  if (!deficiency) return undefined;

  const photo = addPhoto({
    jobId: deficiency.jobId,
    caption: deficiency.title,
    uploadedBy,
    tags: ['deficiency'],
    uri,
    category: 'deficiency',
    linkedRecordId: deficiency.id,
    linkedRecordLabel: deficiency.title,
  });

  return updateDeficiencyRecord(deficiencyId, (d) => ({ ...d, photoIds: [...d.photoIds, photo.id] }));
}

// --- Notes & Announcements ---

export function addNote(jobId: string, authorId: string, body: string): JobNote | undefined {
  const job = JOBS.find((j) => j.id === jobId);
  if (!job) return undefined;

  const now = demoNow().toISOString();
  const note: JobNote = {
    id: createId('note'),
    jobId,
    authorId,
    createdAt: now,
    body: body.trim(),
  };
  if (!note.body) return undefined;

  NOTES.unshift(note);
  ACTIVITY.unshift({
    id: createId('act'),
    jobId,
    type: 'note_added',
    actorId: authorId,
    createdAt: now,
    summary: 'Added a note',
  });

  const author = PEOPLE.find((p) => p.id === authorId);
  if (author?.role === 'manager') {
    notify(job.employeeIds, {
      jobId,
      type: 'manager_comment',
      title: 'Manager comments',
      body: `${author.name}: "${note.body}"`,
      createdAt: now,
    });
  }

  emitChange();
  return note;
}

export function addAnnouncement(
  jobId: string,
  authorId: string,
  title: string,
  body: string,
  pinned = true
): JobAnnouncement | undefined {
  const job = JOBS.find((j) => j.id === jobId);
  if (!job) return undefined;
  if (!title.trim() || !body.trim()) return undefined;

  const now = demoNow().toISOString();
  const announcement: JobAnnouncement = {
    id: createId('ann'),
    jobId,
    authorId,
    createdAt: now,
    title: title.trim(),
    body: body.trim(),
    pinned,
  };

  ANNOUNCEMENTS.unshift(announcement);
  ACTIVITY.unshift({
    id: createId('act'),
    jobId,
    type: 'announcement_posted',
    actorId: authorId,
    createdAt: now,
    summary: `Posted announcement: ${announcement.title}`,
  });

  notify(otherJobPeople(job, authorId), {
    jobId,
    type: 'announcement',
    title: 'Project announcement',
    body: `${announcement.title} — ${job.name}`,
    createdAt: now,
  });

  emitChange();
  return announcement;
}

// --- Project Completion ---
// Marking a job complete only flips its status and stamps the completion
// record — every document, revision, checklist, hazard assessment, photo,
// and activity entry stays exactly where it is, untouched.

function updateCompletionRecord(
  jobId: string,
  updater: (completion: ProjectCompletion) => ProjectCompletion
): ProjectCompletion | undefined {
  const index = PROJECT_COMPLETIONS.findIndex((c) => c.jobId === jobId);
  if (index === -1) return undefined;

  const updated = updater(PROJECT_COMPLETIONS[index]);
  PROJECT_COMPLETIONS[index] = updated;
  emitChange();
  return updated;
}

function updateCompletionItems(
  jobId: string,
  updater: (items: ProjectCompletionItem[]) => ProjectCompletionItem[]
): ProjectCompletion | undefined {
  return updateCompletionRecord(jobId, (c) => ({ ...c, checklist: updater(c.checklist) }));
}

export function addCompletionItem(jobId: string, label: string, required: boolean): ProjectCompletion | undefined {
  const text = label.trim();
  if (!text) return undefined;
  return updateCompletionItems(jobId, (items) => [...items, { id: createId('pc'), label: text, done: false, required }]);
}

export function removeCompletionItem(jobId: string, itemId: string): ProjectCompletion | undefined {
  return updateCompletionItems(jobId, (items) => items.filter((i) => i.id !== itemId));
}

export function setCompletionItemRequired(jobId: string, itemId: string, required: boolean): ProjectCompletion | undefined {
  return updateCompletionItems(jobId, (items) => items.map((i) => (i.id === itemId ? { ...i, required } : i)));
}

export function setCompletionItemDone(
  jobId: string,
  itemId: string,
  done: boolean,
  actorId: string
): ProjectCompletion | undefined {
  const now = demoNow().toISOString();
  return updateCompletionItems(jobId, (items) =>
    items.map((i) =>
      i.id === itemId ? { ...i, done, completedBy: done ? actorId : undefined, completedAt: done ? now : undefined } : i
    )
  );
}

export function updateCompletionItemNotes(jobId: string, itemId: string, notes: string): ProjectCompletion | undefined {
  return updateCompletionItems(jobId, (items) =>
    items.map((i) => (i.id === itemId ? { ...i, notes: notes || undefined } : i))
  );
}

export function addCompletionItemPhoto(
  jobId: string,
  itemId: string,
  uploadedBy: string,
  uri?: string
): ProjectCompletion | undefined {
  const completion = PROJECT_COMPLETIONS.find((c) => c.jobId === jobId);
  const item = completion?.checklist.find((i) => i.id === itemId);
  if (!completion || !item) return undefined;

  const photo = addPhoto({
    jobId,
    caption: item.label,
    uploadedBy,
    tags: ['completion'],
    uri,
    category: 'completion',
    linkedRecordId: jobId,
    linkedRecordLabel: 'Project Completion',
  });

  return updateCompletionItems(jobId, (items) =>
    items.map((i) => (i.id === itemId ? { ...i, photoIds: [...(i.photoIds ?? []), photo.id] } : i))
  );
}

export function attachCompletionItemDocument(
  jobId: string,
  itemId: string,
  documentId: string
): ProjectCompletion | undefined {
  return updateCompletionItems(jobId, (items) =>
    items.map((i) =>
      i.id === itemId && !(i.documentIds ?? []).includes(documentId)
        ? { ...i, documentIds: [...(i.documentIds ?? []), documentId] }
        : i
    )
  );
}

export function removeCompletionItemDocument(
  jobId: string,
  itemId: string,
  documentId: string
): ProjectCompletion | undefined {
  return updateCompletionItems(jobId, (items) =>
    items.map((i) => (i.id === itemId ? { ...i, documentIds: (i.documentIds ?? []).filter((d) => d !== documentId) } : i))
  );
}

export function updateCompletionFinalNotes(jobId: string, finalNotes: string): ProjectCompletion | undefined {
  return updateCompletionRecord(jobId, (c) => ({ ...c, finalNotes }));
}

export function markJobComplete(jobId: string, actorId: string): ProjectCompletion | undefined {
  const job = JOBS.find((j) => j.id === jobId);
  if (!job) return undefined;
  const now = demoNow().toISOString();

  const updated = updateCompletionRecord(jobId, (c) => ({ ...c, isComplete: true, completedAt: now, completedBy: actorId }));
  if (!updated) return undefined;

  setJobStatus(jobId, 'completed');

  ACTIVITY.unshift({
    id: createId('act'),
    jobId,
    type: 'job_completed',
    actorId,
    createdAt: now,
    summary: `Marked ${job.name} complete`,
  });
  emitChange();
  return updated;
}
