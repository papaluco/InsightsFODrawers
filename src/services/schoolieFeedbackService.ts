import {
  SchoolieFeedbackPayload,
  FeedbackRecord,
  FeedbackContextKey,
} from '../types/schoolieFeedbackTypes';
import { mockFeedbackStore } from '../data/mockFeedbackData';

let idCounter = mockFeedbackStore.length + 1;

function generateFeedbackId(): string {
  return `fb-${String(idCounter++).padStart(3, '0')}`;
}

function buildContextKey(key: FeedbackContextKey): string {
  return [
    key.userId,
    key.districtId,
    key.sourceEntryPoint,
    key.kpiIdentifier ?? '',
    key.dateRange ?? '',
    String(key.promptVersion ?? 1),
  ].join('|');
}

function recordMatchesKey(record: FeedbackRecord, key: FeedbackContextKey): boolean {
  return (
    record.userId === key.userId &&
    record.districtId === key.districtId &&
    record.sourceEntryPoint === key.sourceEntryPoint &&
    (record.kpiIdentifier ?? '') === (key.kpiIdentifier ?? '') &&
    ((record.contextJson?.dateRange as string | undefined) ?? '') === (key.dateRange ?? '') &&
    record.promptVersion === (key.promptVersion ?? 1)
  );
}

/** Returns an existing feedback record for the given context, or null if none exists. */
export async function getExistingFeedback(key: FeedbackContextKey): Promise<FeedbackRecord | null> {
  await delay(50);
  return mockFeedbackStore.find(r => recordMatchesKey(r, key)) ?? null;
}

/** Creates a new feedback record. Throws if a record already exists for this context. */
export async function submitFeedback(payload: SchoolieFeedbackPayload): Promise<FeedbackRecord> {
  await delay(150);

  const contextKey: FeedbackContextKey = {
    userId: payload.userId,
    districtId: payload.districtId,
    sourceEntryPoint: payload.sourceEntryPoint,
    kpiIdentifier: payload.kpiIdentifier,
    dateRange: payload.contextJson?.dateRange as string | undefined,
    promptVersion: payload.promptVersion,
  };

  const existing = mockFeedbackStore.find(r => recordMatchesKey(r, contextKey));
  if (existing) {
    // Silently update instead of throwing — handles race conditions gracefully
    return updateFeedback(existing.feedbackId, payload);
  }

  const record: FeedbackRecord = {
    feedbackId: generateFeedbackId(),
    userId: payload.userId,
    districtId: payload.districtId,
    platform: payload.platform,
    sourceEntryPoint: payload.sourceEntryPoint,
    kpiIdentifier: payload.kpiIdentifier,
    drawerType: payload.drawerType,
    promptType: payload.promptType,
    promptVersion: payload.promptVersion,
    feedbackValue: payload.feedbackValue,
    reasonCodes: payload.reasonCodes,
    comment: payload.comment,
    cacheStatus: payload.cacheStatus,
    createdAt: new Date().toISOString(),
    contextJson: payload.contextJson,
    promptText: payload.promptText,
    responseJson: payload.responseJson,
    responseText: payload.responseText,
  };

  mockFeedbackStore.push(record);
  return record;
}

/** Updates an existing feedback record (used when user changes their selection). */
export async function updateFeedback(
  feedbackId: string,
  patch: Partial<SchoolieFeedbackPayload>
): Promise<FeedbackRecord> {
  await delay(150);

  const index = mockFeedbackStore.findIndex(r => r.feedbackId === feedbackId);
  if (index === -1) throw new Error(`Feedback record ${feedbackId} not found`);

  const existing = mockFeedbackStore[index];
  const updated: FeedbackRecord = {
    ...existing,
    feedbackValue: patch.feedbackValue ?? existing.feedbackValue,
    reasonCodes: patch.reasonCodes,
    comment: patch.comment,
    updatedAt: new Date().toISOString(),
  };

  mockFeedbackStore[index] = updated;
  return updated;
}

/** Returns all feedback records — used by the analytics dashboard. */
export async function getAllFeedback(): Promise<FeedbackRecord[]> {
  await delay(50);
  return [...mockFeedbackStore];
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export { buildContextKey };
