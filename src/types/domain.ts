export type UserRole = 'manager' | 'employee';

export interface Person {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  email: string;
  phone: string;
  initials: string;
  avatarColor: string;
  jobIds: string[];
}

export type JobStatus = 'active' | 'on_hold' | 'completed';

export type ProjectType = 'Residential' | 'Multi-Family' | 'Commercial' | 'Institutional' | 'Industrial';

export interface Job {
  id: string;
  name: string;
  address: string;
  client: string;
  projectType: ProjectType;
  status: JobStatus;
  startDate: string;
  targetCompletionDate: string;
  completedDate?: string;
  tabColor: string;
  managerIds: string[];
  employeeIds: string[];
  description: string;
  progress: number;
}

export type DocumentCategory =
  | 'architectural'
  | 'electrical'
  | 'plumbing'
  | 'mechanical'
  | 'permits'
  | 'specifications'
  | 'contracts'
  | 'other';

export type DocumentFileType = 'pdf' | 'dwg' | 'image';

export interface DocumentRevision {
  id: string;
  revisionNumber: number;
  uploadedBy: string;
  uploadedAt: string;
  notes: string;
  fileType: DocumentFileType;
  isCurrent: boolean;
  pageCount: number;
}

export interface JobDocument {
  id: string;
  jobId: string;
  title: string;
  category: DocumentCategory;
  revisions: DocumentRevision[];
  /** People who have reviewed the current revision. Cleared to just the uploader whenever a new revision is added. */
  reviewedBy: string[];
  reviewRequired: boolean;
}

export type ChecklistItemStatus = 'pending' | 'complete' | 'incomplete' | 'na';

export interface ChecklistItem {
  id: string;
  text: string;
  status: ChecklistItemStatus;
  note?: string;
  /** Carried over from the template at generation time — older generated records may predate this metadata. */
  sectionName?: string;
  required?: boolean;
  requiresPhoto?: boolean;
  photoIds?: string[];
}

export interface ChecklistTemplateItem {
  id: string;
  text: string;
  required: boolean;
  requiresPhoto: boolean;
  notes?: string;
}

export interface ChecklistTemplateSection {
  id: string;
  name: string;
  items: ChecklistTemplateItem[];
}

export type TemplateVisibility = 'company' | 'private';

export interface ChecklistTemplate {
  id: string;
  name: string;
  trade: string;
  description: string;
  sections: ChecklistTemplateSection[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  visibility: TemplateVisibility;
  archived: boolean;
}

export type RecordStatus = 'in_progress' | 'completed';

export interface JobChecklist {
  id: string;
  jobId: string;
  templateId: string;
  templateName: string;
  trade: string;
  recordTitle: string;
  generatedBy: string;
  generatedAt: string;
  completedBy?: string;
  completedAt?: string;
  status: RecordStatus;
  items: ChecklistItem[];
}

export interface HazardTemplateItem {
  id: string;
  hazard: string;
  controlMeasure: string;
  required: boolean;
  requiresPhoto: boolean;
  notes?: string;
}

export interface HazardTemplateSection {
  id: string;
  name: string;
  items: HazardTemplateItem[];
}

export type HazardSourceFileType = 'pdf' | 'word' | 'excel' | 'image';

export interface HazardAssessmentTemplate {
  id: string;
  name: string;
  trade: string;
  description: string;
  sections: HazardTemplateSection[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  visibility: TemplateVisibility;
  archived: boolean;
  requiresSignature: boolean;
  /** Set when this template originated from "Upload Existing Hazard Assessment Form". */
  sourceFileName?: string;
  sourceFileType?: HazardSourceFileType;
}

export interface JobHazardItem {
  id: string;
  hazard: string;
  controlMeasure: string;
  /** Selected during the "Identify hazards" step as applicable to today's work. */
  identified: boolean;
  /** Added on the fly during the "Identify hazards" step rather than coming from the template. */
  custom?: boolean;
  /** Carried over from the template at generation time — older generated records may predate this metadata. */
  sectionName?: string;
  required?: boolean;
  requiresPhoto?: boolean;
  photoIds?: string[];
}

/** Index into the 7-step guided workflow: 0 work, 1 hazards, 2 controls, 3 notes/photos, 4 review, 5 signature, 6 submit. */
export type HazardAssessmentStep = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface JobHazardAssessment {
  id: string;
  jobId: string;
  templateId: string;
  templateName: string;
  trade: string;
  recordTitle: string;
  generatedBy: string;
  generatedAt: string;
  completedBy?: string;
  completedAt?: string;
  status: RecordStatus;
  /** Step 1: what work is being performed today. */
  workDescription: string;
  hazards: JobHazardItem[];
  /** Step 4: general notes for the assessment as a whole. */
  notes: string;
  /** Step 6: typed digital signature certifying the assessment. */
  signatureName?: string;
  signedAt?: string;
  /** Where the employee left off, so "Continue Later" resumes at the right step. */
  currentStep: HazardAssessmentStep;
}

/** What a photo is attached to: a general Job Folder shot, or a specific record within it. */
export type PhotoCategory = 'general' | 'checklist' | 'hazard_assessment' | 'deficiency';

export interface JobPhoto {
  id: string;
  jobId: string;
  /** Real captured/uploaded image (camera or library, native or web). Absent only for legacy seed photos, which fall back to the swatch. */
  uri?: string;
  swatch: string;
  caption: string;
  category: PhotoCategory;
  /** id of the checklist/hazard assessment/deficiency this photo is attached to, when category isn't 'general'. */
  linkedRecordId?: string;
  /** Human label snapshot of the linked record, for display without a join. */
  linkedRecordLabel?: string;
  uploadedBy: string;
  uploadedAt: string;
  tags: string[];
}

export type DeficiencyStatus = 'open' | 'in_progress' | 'complete';
export type DeficiencyPriority = 'low' | 'medium' | 'high';

export interface Deficiency {
  id: string;
  jobId: string;
  title: string;
  description: string;
  status: DeficiencyStatus;
  priority: DeficiencyPriority;
  location: string;
  reportedBy: string;
  reportedAt: string;
  assignedTo?: string;
  completedBy?: string;
  completedAt?: string;
  photoIds: string[];
}

export interface JobNote {
  id: string;
  jobId: string;
  authorId: string;
  createdAt: string;
  body: string;
}

export interface JobAnnouncement {
  id: string;
  jobId: string;
  authorId: string;
  createdAt: string;
  title: string;
  body: string;
  pinned: boolean;
}

export type ActivityType =
  | 'document_uploaded'
  | 'document_revised'
  | 'document_acknowledged'
  | 'checklist_generated'
  | 'checklist_completed'
  | 'hazard_assessment_generated'
  | 'hazard_assessment_completed'
  | 'photo_uploaded'
  | 'deficiency_reported'
  | 'deficiency_assigned'
  | 'deficiency_status_changed'
  | 'deficiency_completed'
  | 'note_added'
  | 'announcement_posted'
  | 'job_created'
  | 'job_completed'
  | 'employee_assigned';

export interface ActivityEntry {
  id: string;
  jobId: string;
  type: ActivityType;
  actorId: string;
  createdAt: string;
  summary: string;
}

export interface AppNotification {
  id: string;
  jobId?: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  recipientId: string;
}

export interface ProjectCompletionItem {
  id: string;
  label: string;
  done: boolean;
}

export interface ProjectCompletion {
  jobId: string;
  isComplete: boolean;
  completedAt?: string;
  completedBy?: string;
  checklist: ProjectCompletionItem[];
  finalNotes: string;
}

export interface Company {
  id: string;
  name: string;
  initial: string;
  trade: string;
  hqAddress: string;
}
