export type FeedbackType = "Schoolie" | "Insights" | "Reports" | "MenuAnalysis";

export type SchoolieFeedbackValue = "thumbs_up" | "thumbs_down";

export type SchoolieSourceEntryPoint =
  | "Workspace"
  | "Dashboard"
  | "KpiDrawer"
  | "CompareSites"
  | "TrendAnalysis";

export interface SchoolieFeedbackPayload {
  userId: string;
  districtId: string;
  platform: "SchoolCafe" | "PrimeroEdge";
  sourceEntryPoint: SchoolieSourceEntryPoint;
  feedbackValue: SchoolieFeedbackValue;
  feedbackType: FeedbackType;

  promptType: string;
  promptVersion: number;
  promptText: string;

  responseText?: string;
  responseJson?: unknown;

  kpiIdentifier?: string;
  analysisIdentifier?: string;
  sessionId?: string;
  drawerType?: "District" | "Site";
  cacheStatus?: "Cached" | "NewlyGenerated";

  reasonCodes?: string[];
  comment?: string;

  contextJson?: Record<string, unknown>;
}

/** Contextual props passed into the SchoolieFeedback component by its parent. */
export interface SchoolieFeedbackContext {
  userId?: string;
  districtId?: string;
  platform?: "SchoolCafe" | "PrimeroEdge";
  sourceEntryPoint: SchoolieSourceEntryPoint;
  feedbackType?: FeedbackType;
  kpiIdentifier?: string;
  analysisIdentifier?: string;
  sessionId?: string;
  drawerType?: "District" | "Site";
  dateRange?: string;
  promptType?: string;
  promptVersion?: number;
  promptText?: string;
  responseText?: string;
  responseJson?: unknown;
  cacheStatus?: "Cached" | "NewlyGenerated";
  contextJson?: Record<string, unknown>;
}

/** Represents a persisted feedback record (mirrors DB row structure). */
export interface FeedbackRecord {
  // Core reportable columns
  feedbackId: string;
  userId: string;
  districtId: string;
  platform: "SchoolCafe" | "PrimeroEdge";
  feedbackType: FeedbackType;
  sourceEntryPoint: SchoolieSourceEntryPoint;
  kpiIdentifier?: string;
  analysisIdentifier?: string;
  sessionId?: string;
  drawerType?: "District" | "Site";
  promptType: string;
  promptVersion: number;
  feedbackValue: SchoolieFeedbackValue;
  reasonCodes?: string[];
  comment?: string;
  cacheStatus?: "Cached" | "NewlyGenerated";
  createdAt: string;
  updatedAt?: string;
  // JSON / text columns
  contextJson?: Record<string, unknown>;
  promptText?: string;
  responseJson?: unknown;
  responseText?: string;
}

/** Key used to detect duplicate feedback for the same AI response context. */
export interface FeedbackContextKey {
  userId: string;
  districtId: string;
  sourceEntryPoint: SchoolieSourceEntryPoint;
  feedbackType?: FeedbackType;
  kpiIdentifier?: string;
  analysisIdentifier?: string;
  dateRange?: string;
  promptVersion?: number;
}
