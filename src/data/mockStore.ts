import { useSyncExternalStore } from 'react';

import { ACTIVITY, JOBS } from './company';
import { demoNow } from './selectors';
import { createId } from '../lib/id';
import type { Job } from '../types/domain';

// SiteVault's data is a seeded, in-memory dataset (see company.ts) rather
// than a live backend. Screens that need to reflect writes made through
// this store (e.g. creating a job from the dashboard) subscribe via
// useMockDataVersion() and re-read the same JOBS/ACTIVITY array references,
// which are mutated in place below.

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return JOBS.length + ACTIVITY.length;
}

export function useMockDataVersion() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

const TAB_COLOR_PALETTE = ['#C4813C', '#5B7CA3', '#4C6B58', '#A45D4E', '#6E5A9E', '#8C6A4A'];

export interface CreateJobInput {
  name: string;
  address: string;
  client: string;
  targetCompletionDate: string;
  description: string;
  managerId: string;
}

export function createJob(input: CreateJobInput): Job {
  const now = demoNow();
  const job: Job = {
    id: createId('job'),
    name: input.name.trim(),
    address: input.address.trim(),
    client: input.client.trim() || 'TBD',
    status: 'active',
    startDate: now.toISOString(),
    targetCompletionDate: input.targetCompletionDate,
    tabColor: TAB_COLOR_PALETTE[JOBS.length % TAB_COLOR_PALETTE.length],
    managerIds: [input.managerId],
    employeeIds: [],
    description: input.description.trim(),
    progress: 0,
  };

  JOBS.unshift(job);
  ACTIVITY.unshift({
    id: createId('act'),
    jobId: job.id,
    type: 'job_created',
    actorId: input.managerId,
    createdAt: job.startDate,
    summary: `Created the ${job.name} job folder`,
  });

  emitChange();
  return job;
}
