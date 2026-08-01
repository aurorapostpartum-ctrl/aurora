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

export interface Job {
  id: string;
  name: string;
  address: string;
  client: string;
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
  | 'print'
  | 'submittal'
  | 'permit'
  | 'contract'
  | 'report'
  | 'other';

export interface DocumentRevision {
  id: string;
  revisionLabel: string;
  uploadedBy: string;
  uploadedAt: string;
  notes: string;
  fileType: 'pdf' | 'dwg' | 'image';
  isCurrent: boolean;
}

export interface JobDocument {
  id: string;
  jobId: string;
  title: string;
  category: DocumentCategory;
  discipline: string;
  revisions: DocumentRevision[];
  acknowledgedBy: string[];
  requiresAcknowledgement: boolean;
}

export type ChecklistItemStatus = 'pending' | 'pass' | 'fail' | 'na';

export interface ChecklistItem {
  id: string;
  text: string;
  status: ChecklistItemStatus;
  note?: string;
}

export interface ChecklistTemplateItem {
  id: string;
  text: string;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  trade: string;
  description: string;
  items: ChecklistTemplateItem[];
  createdBy: string;
  updatedAt: string;
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
}

export interface HazardAssessmentTemplate {
  id: string;
  name: string;
  trade: string;
  description: string;
  hazards: HazardTemplateItem[];
  createdBy: string;
  updatedAt: string;
}

export interface JobHazardItem {
  id: string;
  hazard: string;
  controlMeasure: string;
  acknowledged: boolean;
}

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
  hazards: JobHazardItem[];
  crewSignoff: string[];
}

export interface JobPhoto {
  id: string;
  jobId: string;
  swatch: string;
  caption: string;
  uploadedBy: string;
  uploadedAt: string;
  tags: string[];
}

export type DeficiencyStatus = 'open' | 'in_progress' | 'resolved';
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
  resolvedAt?: string;
  photoCount: number;
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
  | 'deficiency_resolved'
  | 'note_added'
  | 'announcement_posted'
  | 'job_created'
  | 'job_completed';

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
