import { supabase } from '../lib/supabase';
import {
  SchoolieFeedbackPayload,
  FeedbackRecord,
  FeedbackContextKey,
  FeedbackType,
  SchoolieFeedbackValue,
  SchoolieSourceEntryPoint,
} from '../types/feedbackTypes';
// import { mockFeedbackStore } from '../data/mockFeedbackData';
// Uncomment the line above and swap the Supabase calls below for mock equivalents
// when you need to run against local data without a live Supabase connection.

// ─── DB row shape ─────────────────────────────────────────────────────────────
// Mirrors the feedback table exactly; every nullable SQL column is typed | null.

type DbRow = {
  feedback_id:        string;
  user_id:            string;
  district_id:        string;
  platform:           string;
  feedback_type:      string;
  source_entry_point: string | null;
  kpi_identifier:     string | null;
  analysis_identifier: string | null;
  session_id:         string | null;
  drawer_type:        string | null;
  prompt_type:        string | null;
  prompt_version:     number | null;
  feedback_value:     string;
  reason_codes:       string[] | null;
  comment:            string | null;
  cache_status:       string | null;
  context_json:       Record<string, unknown> | null;
  prompt_text:        string | null;
  response_json:      unknown | null;
  response_text:      string | null;
  created_at:         string;
  updated_at:         string | null;
};

type InsertRow = Omit<DbRow, 'feedback_id' | 'created_at' | 'updated_at'>;

// ─── Camel ↔ snake mappers ────────────────────────────────────────────────────

function fromDb(row: DbRow): FeedbackRecord {
  return {
    feedbackId:       row.feedback_id,
    userId:           row.user_id,
    districtId:       row.district_id,
    platform:         row.platform as 'SchoolCafe' | 'PrimeroEdge',
    feedbackType:     row.feedback_type as FeedbackType,
    sourceEntryPoint: (row.source_entry_point ?? '') as SchoolieSourceEntryPoint,
    kpiIdentifier:        row.kpi_identifier ?? undefined,
    analysisIdentifier:   row.analysis_identifier ?? undefined,
    sessionId:            row.session_id ?? undefined,
    drawerType:           (row.drawer_type ?? undefined) as 'District' | 'Site' | undefined,
    promptType:       row.prompt_type ?? '',
    promptVersion:    row.prompt_version ?? 1,
    feedbackValue:    row.feedback_value as SchoolieFeedbackValue,
    reasonCodes:      row.reason_codes ?? undefined,
    comment:          row.comment ?? undefined,
    cacheStatus:      (row.cache_status ?? undefined) as 'Cached' | 'NewlyGenerated' | undefined,
    contextJson:      row.context_json ?? undefined,
    promptText:       row.prompt_text ?? undefined,
    responseJson:     row.response_json ?? undefined,
    responseText:     row.response_text ?? undefined,
    createdAt:        row.created_at,
    updatedAt:        row.updated_at ?? undefined,
  };
}

function toInsertRow(payload: SchoolieFeedbackPayload): InsertRow {
  return {
    user_id:            payload.userId,
    district_id:        payload.districtId,
    platform:           payload.platform,
    feedback_type:      payload.feedbackType,
    source_entry_point: payload.sourceEntryPoint,
    kpi_identifier:      payload.kpiIdentifier ?? null,
    analysis_identifier: payload.analysisIdentifier ?? null,
    session_id:          payload.sessionId ?? null,
    drawer_type:         payload.drawerType ?? null,
    prompt_type:        payload.promptType,
    prompt_version:     payload.promptVersion,
    feedback_value:     payload.feedbackValue,
    reason_codes:       payload.reasonCodes ?? null,
    comment:            payload.comment ?? null,
    cache_status:       payload.cacheStatus ?? null,
    context_json:       payload.contextJson ?? null,
    prompt_text:        payload.promptText ?? null,
    response_json:      payload.responseJson ?? null,
    response_text:      payload.responseText ?? null,
  };
}

// ─── Context key helpers (preserved for callers) ──────────────────────────────

export function buildContextKey(key: FeedbackContextKey): string {
  return [
    key.userId,
    key.districtId,
    key.sourceEntryPoint,
    key.feedbackType ?? 'Schoolie',
    key.kpiIdentifier ?? '',
    key.analysisIdentifier ?? '',
    key.dateRange ?? '',
    String(key.promptVersion ?? 1),
  ].join('|');
}

// ─── Filters for getAllFeedback ───────────────────────────────────────────────

export interface FeedbackFilters {
  feedbackType?: string;
  analysisIdentifier?: string;
  districtId?: string;
  userId?: string;
  platform?: string;
  feedbackValue?: string;
  dateFrom?: string;  // ISO string, inclusive
  dateTo?: string;    // ISO string, inclusive
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Returns an existing feedback record for the given context, or null if none exists. */
export async function getExistingFeedback(key: FeedbackContextKey): Promise<FeedbackRecord | null> {
  try {
    let query = supabase
      .from('feedback')
      .select('*')
      .eq('user_id',          key.userId)
      .eq('district_id',      key.districtId)
      .eq('source_entry_point', key.sourceEntryPoint)
      .eq('feedback_type',    key.feedbackType ?? 'Schoolie')
      .eq('prompt_version',   key.promptVersion ?? 1);

    // kpiIdentifier/analysisIdentifier: match null when absent to avoid conflating contexts
    if (key.kpiIdentifier) {
      query = query.eq('kpi_identifier', key.kpiIdentifier);
    } else {
      query = query.is('kpi_identifier', null);
    }

    if (key.analysisIdentifier) {
      query = query.eq('analysis_identifier', key.analysisIdentifier);
    } else {
      query = query.is('analysis_identifier', null);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[feedbackService] getExistingFeedback failed', {
        userId: key.userId, districtId: key.districtId, error: error.message,
      });
      throw new Error(`getExistingFeedback: ${error.message}`);
    }

    if (!data || data.length === 0) return null;

    // dateRange lives inside context_json — narrow client-side after the indexed query
    const targetDateRange = key.dateRange ?? '';
    const match = (data as DbRow[]).find(
      row => ((row.context_json?.dateRange as string | undefined) ?? '') === targetDateRange
    );

    return match ? fromDb(match) : null;
  } catch (err) {
    console.error('[feedbackService] getExistingFeedback error', { key, err });
    throw err;
  }
}

/** Creates a new feedback record. Updates silently if one already exists for this context. */
export async function submitFeedback(payload: SchoolieFeedbackPayload): Promise<FeedbackRecord> {
  const contextKey: FeedbackContextKey = {
    userId:           payload.userId,
    districtId:       payload.districtId,
    sourceEntryPoint: payload.sourceEntryPoint,
    feedbackType:     payload.feedbackType,
    kpiIdentifier:      payload.kpiIdentifier,
    analysisIdentifier: payload.analysisIdentifier,
    dateRange:          payload.contextJson?.dateRange as string | undefined,
    promptVersion:    payload.promptVersion,
  };

  const existing = await getExistingFeedback(contextKey);
  if (existing) {
    return updateFeedback(existing.feedbackId, payload);
  }

  try {
    const { data, error } = await supabase
      .from('feedback')
      .insert(toInsertRow(payload))
      .select()
      .single();

    if (error) {
      console.error('[feedbackService] submitFeedback insert failed', {
        userId: payload.userId, feedbackType: payload.feedbackType, error: error.message,
      });
      throw new Error(`submitFeedback: ${error.message}`);
    }
    if (!data) {
      throw new Error('submitFeedback: insert succeeded but returned no data');
    }

    return fromDb(data as DbRow);
  } catch (err) {
    console.error('[feedbackService] submitFeedback error', {
      userId: payload.userId, feedbackType: payload.feedbackType, err,
    });
    throw err;
  }
}

/** Updates an existing feedback record (used when user changes their selection). */
export async function updateFeedback(
  feedbackId: string,
  patch: Partial<SchoolieFeedbackPayload>
): Promise<FeedbackRecord> {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .update({
        ...(patch.feedbackValue !== undefined && { feedback_value: patch.feedbackValue }),
        reason_codes: patch.reasonCodes ?? null,
        comment:      patch.comment ?? null,
        updated_at:   new Date().toISOString(),
      })
      .eq('feedback_id', feedbackId)
      .select()
      .single();

    if (error) {
      console.error('[feedbackService] updateFeedback failed', {
        feedbackId, error: error.message,
      });
      throw new Error(`updateFeedback(${feedbackId}): ${error.message}`);
    }
    if (!data) {
      throw new Error(`updateFeedback: record ${feedbackId} not found or not updated`);
    }

    return fromDb(data as DbRow);
  } catch (err) {
    console.error('[feedbackService] updateFeedback error', { feedbackId, err });
    throw err;
  }
}

/** Returns all feedback records ordered by created_at desc, with optional filters. */
export async function getAllFeedback(filters?: FeedbackFilters): Promise<FeedbackRecord[]> {
  try {
    let query = supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.feedbackType)      query = query.eq('feedback_type',       filters.feedbackType);
    if (filters?.analysisIdentifier) query = query.eq('analysis_identifier', filters.analysisIdentifier);
    if (filters?.districtId)        query = query.eq('district_id',         filters.districtId);
    if (filters?.userId)        query = query.eq('user_id',        filters.userId);
    if (filters?.platform)      query = query.eq('platform',       filters.platform);
    if (filters?.feedbackValue) query = query.eq('feedback_value', filters.feedbackValue);
    if (filters?.dateFrom)      query = query.gte('created_at',    filters.dateFrom);
    if (filters?.dateTo)        query = query.lte('created_at',    filters.dateTo);

    const { data, error } = await query;

    if (error) {
      console.error('[feedbackService] getAllFeedback failed', { filters, error: error.message });
      throw new Error(`getAllFeedback: ${error.message}`);
    }

    return (data as DbRow[]).map(fromDb);
  } catch (err) {
    console.error('[feedbackService] getAllFeedback error', { filters, err });
    throw err;
  }
}
