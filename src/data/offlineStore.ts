import NetInfo from '@react-native-community/netinfo';
import { useSyncExternalStore } from 'react';

import { createId } from '../lib/id';
import { storage } from '../lib/storage';
import { demoNow } from './selectors';

// SiteVault's data already lives entirely in memory (see mockStore.ts) — there
// is no real backend to lose the connection to. What this module simulates is
// the part that *would* need a network in a real app: confirming a photo/form
// reached the server, and caching large documents locally so they open with
// no connection at all. Every mutation still applies instantly and locally
// (so work is never lost), and the queue below only tracks upload/confirm
// status for the user's benefit — "has this actually gone out yet."

export type SyncKind = 'photo' | 'checklist' | 'hazard';
export type SyncItemStatus = 'pending' | 'syncing' | 'failed';
export type SyncStatus = 'offline' | 'syncing' | 'error' | 'synced';

export interface SyncQueueItem {
  id: string;
  kind: SyncKind;
  recordId: string;
  jobId: string;
  label: string;
  status: SyncItemStatus;
  createdAt: string;
  attempts: number;
}

const QUEUE_KEY = 'sitevault.syncQueue.v1';
const DOWNLOADS_KEY = 'sitevault.downloadedDocuments.v1';
const MAX_AUTO_RETRIES = 2;
const SYNC_DELAY_MS = 900;

let queue: SyncQueueItem[] = [];
let downloadedDocIds = new Set<string>();
let realIsConnected = true;
let simulatedOffline = false;
let hydrated = false;
let draining = false;

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

export function useOfflineVersion() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function persistQueue() {
  storage.setItem(QUEUE_KEY, JSON.stringify(queue)).catch(() => {});
}

function persistDownloads() {
  storage.setItem(DOWNLOADS_KEY, JSON.stringify(Array.from(downloadedDocIds))).catch(() => {});
}

export async function hydrateOfflineStore() {
  if (hydrated) return;
  hydrated = true;
  try {
    const [rawQueue, rawDownloads] = await Promise.all([
      storage.getItem(QUEUE_KEY),
      storage.getItem(DOWNLOADS_KEY),
    ]);
    if (rawQueue) {
      const parsed = JSON.parse(rawQueue) as SyncQueueItem[];
      // A session that ended mid-sync shouldn't strand an item forever.
      queue = parsed.map((item) => (item.status === 'syncing' ? { ...item, status: 'pending' } : item));
    }
    if (rawDownloads) {
      downloadedDocIds = new Set(JSON.parse(rawDownloads) as string[]);
    }
  } catch {
    // corrupted local state — start clean rather than crash the app
    queue = [];
    downloadedDocIds = new Set();
  }
  emitChange();
  maybeDrain();
}

try {
  NetInfo.addEventListener((state) => {
    const nowConnected = state.isConnected !== false && state.isInternetReachable !== false;
    if (nowConnected !== realIsConnected) {
      realIsConnected = nowConnected;
      emitChange();
      maybeDrain();
    }
  });
} catch {
  // NetInfo unavailable in this environment (e.g. static export prerender) — default to online
}

export function isOnline(): boolean {
  return !simulatedOffline && realIsConnected;
}

export function useIsOnline(): boolean {
  useOfflineVersion();
  return isOnline();
}

export function isSimulatedOffline(): boolean {
  return simulatedOffline;
}

export function setSimulatedOffline(value: boolean) {
  if (simulatedOffline === value) return;
  simulatedOffline = value;
  emitChange();
  if (!value) maybeDrain();
}

export function enqueueSync(kind: SyncKind, recordId: string, jobId: string, label: string) {
  const item: SyncQueueItem = {
    id: createId('sync'),
    kind,
    recordId,
    jobId,
    label,
    status: 'pending',
    createdAt: demoNow().toISOString(),
    attempts: 0,
  };
  queue = [...queue, item];
  persistQueue();
  emitChange();
  maybeDrain();
}

function maybeDrain() {
  if (draining || !isOnline()) return;
  const next = queue.find((item) => item.status === 'pending');
  if (!next) return;

  draining = true;
  queue = queue.map((item) => (item.id === next.id ? { ...item, status: 'syncing', attempts: item.attempts + 1 } : item));
  persistQueue();
  emitChange();

  setTimeout(() => {
    draining = false;

    if (!isOnline()) {
      // Connection dropped mid-sync. Retry silently a couple of times; after
      // that, stop and let the user see it as failed rather than loop forever.
      const interrupted = queue.find((item) => item.id === next.id);
      const shouldGiveUp = (interrupted?.attempts ?? 0) > MAX_AUTO_RETRIES;
      queue = queue.map((item) =>
        item.id === next.id ? { ...item, status: shouldGiveUp ? 'failed' : 'pending' } : item
      );
      persistQueue();
      emitChange();
      return;
    }

    queue = queue.filter((item) => item.id !== next.id);
    persistQueue();
    emitChange();
    maybeDrain();
  }, SYNC_DELAY_MS);
}

export function retryFailedSync() {
  queue = queue.map((item) => (item.status === 'failed' ? { ...item, status: 'pending', attempts: 0 } : item));
  persistQueue();
  emitChange();
  maybeDrain();
}

export function retrySyncItem(itemId: string) {
  queue = queue.map((item) => (item.id === itemId && item.status === 'failed' ? { ...item, status: 'pending', attempts: 0 } : item));
  persistQueue();
  emitChange();
  maybeDrain();
}

export function useSyncQueue(): SyncQueueItem[] {
  useOfflineVersion();
  return queue;
}

export function syncStateForRecord(recordId: string): SyncItemStatus | undefined {
  return queue.find((item) => item.recordId === recordId)?.status;
}

export function useSyncStateForRecord(recordId: string): SyncItemStatus | undefined {
  useOfflineVersion();
  return syncStateForRecord(recordId);
}

export interface OverallSyncStatus {
  status: SyncStatus;
  pendingCount: number;
  failedCount: number;
}

export function useOverallSyncStatus(): OverallSyncStatus {
  useOfflineVersion();
  const pendingCount = queue.filter((item) => item.status === 'pending' || item.status === 'syncing').length;
  const failedCount = queue.filter((item) => item.status === 'failed').length;
  if (!isOnline()) return { status: 'offline', pendingCount, failedCount };
  if (pendingCount > 0) return { status: 'syncing', pendingCount, failedCount };
  if (failedCount > 0) return { status: 'error', pendingCount, failedCount };
  return { status: 'synced', pendingCount, failedCount };
}

// --- Downloaded documents (offline availability for prints/documents) ---

export function isDocumentDownloaded(documentId: string): boolean {
  return downloadedDocIds.has(documentId);
}

export function useIsDocumentDownloaded(documentId: string): boolean {
  useOfflineVersion();
  return downloadedDocIds.has(documentId);
}

export function toggleDocumentDownload(documentId: string) {
  if (downloadedDocIds.has(documentId)) {
    downloadedDocIds.delete(documentId);
  } else {
    downloadedDocIds.add(documentId);
  }
  persistDownloads();
  emitChange();
}
