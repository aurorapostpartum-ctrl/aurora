import { useSyncExternalStore } from 'react';

import {
  ACTIVITY,
  CHECKLIST_TEMPLATES,
  DOCUMENTS,
  HAZARD_TEMPLATES,
  JOBS,
  JOB_CHECKLISTS,
  JOB_HAZARD_ASSESSMENTS,
  PHOTOS,
} from './company';
import { demoNow, formatDate } from './selectors';
import { createId } from '../lib/id';
import type {
  ActivityType,
  ChecklistItem,
  ChecklistItemStatus,
  ChecklistTemplate,
  ChecklistTemplateSection,
  DocumentCategory,
  DocumentFileType,
  HazardAssessmentStep,
  HazardAssessmentTemplate,
  HazardSourceFileType,
  HazardTemplateSection,
  Job,
  JobChecklist,
  JobDocument,
  JobHazardAssessment,
  JobHazardItem,
  JobPhoto,
  JobStatus,
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
    generateChecklistFromTemplate({ jobId: job.id, templateId, generatedBy: input.managerId });
  }

  for (const templateId of input.hazardTemplateIds) {
    generateHazardAssessmentFromTemplate({ jobId: job.id, templateId, generatedBy: input.managerId });
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
}

export function addPhoto(input: AddPhotoInput): JobPhoto {
  const photo: JobPhoto = {
    id: createId('ph'),
    jobId: input.jobId,
    swatch: PHOTO_PALETTE[PHOTOS.length % PHOTO_PALETTE.length],
    caption: input.caption,
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

export function addChecklistItemPhoto(checklistId: string, itemId: string, uploadedBy: string): JobChecklist | undefined {
  const index = JOB_CHECKLISTS.findIndex((c) => c.id === checklistId);
  if (index === -1) return undefined;

  const checklist = JOB_CHECKLISTS[index];
  const item = checklist.items.find((i) => i.id === itemId);
  if (!item) return undefined;

  const photo = addPhoto({ jobId: checklist.jobId, caption: item.text, uploadedBy, tags: ['checklist'] });

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

export function addHazardItemPhoto(recordId: string, itemId: string, uploadedBy: string): JobHazardAssessment | undefined {
  const record = JOB_HAZARD_ASSESSMENTS.find((r) => r.id === recordId);
  const item = record?.hazards.find((h) => h.id === itemId);
  if (!record || !item) return undefined;

  const photo = addPhoto({ jobId: record.jobId, caption: item.hazard, uploadedBy, tags: ['hazard-assessment'] });

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
  emitChange();
  return updated;
}
