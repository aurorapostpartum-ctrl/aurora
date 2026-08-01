import { useSyncExternalStore } from 'react';

import {
  ACTIVITY,
  CHECKLIST_TEMPLATES,
  DOCUMENTS,
  HAZARD_TEMPLATES,
  JOBS,
  JOB_CHECKLISTS,
  JOB_HAZARD_ASSESSMENTS,
} from './company';
import { demoNow, formatDate } from './selectors';
import { createId } from '../lib/id';
import type {
  ActivityType,
  DocumentCategory,
  DocumentFileType,
  Job,
  JobDocument,
  JobStatus,
  ProjectType,
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
    const template = CHECKLIST_TEMPLATES.find((t) => t.id === templateId);
    if (!template) continue;
    JOB_CHECKLISTS.unshift({
      id: createId('jcl'),
      jobId: job.id,
      templateId: template.id,
      templateName: template.name,
      trade: template.trade,
      recordTitle: `${job.name} — ${template.name} — ${formatDate(now)}`,
      generatedBy: input.managerId,
      generatedAt: now,
      status: 'in_progress',
      items: template.items.map((item) => ({ id: item.id, text: item.text, status: 'pending' })),
    });
    ACTIVITY.unshift({
      id: createId('act'),
      jobId: job.id,
      type: 'checklist_generated',
      actorId: input.managerId,
      createdAt: now,
      summary: `Generated ${template.name}`,
    });
  }

  for (const templateId of input.hazardTemplateIds) {
    const template = HAZARD_TEMPLATES.find((t) => t.id === templateId);
    if (!template) continue;
    JOB_HAZARD_ASSESSMENTS.unshift({
      id: createId('jha'),
      jobId: job.id,
      templateId: template.id,
      templateName: template.name,
      trade: template.trade,
      recordTitle: `${job.name} — ${template.name} — ${formatDate(now)}`,
      generatedBy: input.managerId,
      generatedAt: now,
      status: 'in_progress',
      crewSignoff: [],
      hazards: template.hazards.map((h) => ({
        id: h.id,
        hazard: h.hazard,
        controlMeasure: h.controlMeasure,
        acknowledged: false,
      })),
    });
    ACTIVITY.unshift({
      id: createId('act'),
      jobId: job.id,
      type: 'hazard_assessment_generated',
      actorId: input.managerId,
      createdAt: now,
      summary: `Generated ${template.name}`,
    });
  }

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
  const updated: Job = {
    ...existing,
    employeeIds: [...new Set([...existing.employeeIds, ...employeeIds])],
  };
  JOBS[index] = updated;
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
    reviewedBy: [],
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
    reviewedBy: doc.reviewRequired ? [input.uploadedBy] : doc.reviewedBy,
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
  emitChange();
  return updated;
}

export function markDocumentReviewed(documentId: string, personId: string): JobDocument | undefined {
  const index = DOCUMENTS.findIndex((d) => d.id === documentId);
  if (index === -1) return undefined;

  const doc = DOCUMENTS[index];
  if (doc.reviewedBy.includes(personId)) return doc;

  const updated: JobDocument = { ...doc, reviewedBy: [...doc.reviewedBy, personId] };
  DOCUMENTS[index] = updated;

  const current = updated.revisions.find((r) => r.isCurrent) ?? updated.revisions[0];
  ACTIVITY.unshift({
    id: createId('act'),
    jobId: doc.jobId,
    type: 'document_acknowledged',
    actorId: personId,
    createdAt: demoNow().toISOString(),
    summary: `Reviewed ${doc.title} (Rev ${current.revisionNumber})`,
  });
  emitChange();
  return updated;
}
