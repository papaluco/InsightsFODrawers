import type {
  SchoolieEventType,
  SchoolieAnalysisIdentifier,
  SchoolieSourceEntryPoint,
} from '../data/mockSchoolieUsageData';

export type { SchoolieEventType, SchoolieAnalysisIdentifier, SchoolieSourceEntryPoint };

export interface SchoolieUsageFilters {
  dateRange?: { start: string; end: string };
  districtId?: string;
  userId?: string;
  sourceEntryPoint?: SchoolieSourceEntryPoint;
  analysisIdentifier?: SchoolieAnalysisIdentifier;
  eventType?: SchoolieEventType;
}

export const DEFAULT_SCHOOLIE_FILTERS: SchoolieUsageFilters = {};

export interface SchoolieUsageSummary {
  totalInteractions: number;
  totalRequests: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  avgResponseTimeMs: number;
  p95ResponseTimeMs: number;
  activeUsers: number;
  activeDistricts: number;
  kpiInteractions: number;
  dashboardInteractions: number;
  usageScreenInteractions: number;
}

export interface SchoolieUserStatRow {
  userId: string;
  userName: string;
  districtId: string;
  districtName: string;
  totalRequests: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  avgResponseTimeMs: number;
  lastActive: string;
  topAnalysis: string;
}

export interface SchoolieDistrictStatRow {
  districtId: string;
  districtName: string;
  activeUsers: number;
  totalRequests: number;
  successRate: number;
  avgResponseTimeMs: number;
  lastActivity: string;
}

export interface SchoolieSessionStatRow {
  sessionId: string;
  userId: string;
  userName: string;
  districtId: string;
  districtName: string;
  platform: 'SchoolCafe' | 'PrimeroEdge';
  analysisIdentifier: string;
  sourceEntryPoint: SchoolieSourceEntryPoint;
  promptVersion: 1 | 2;
  modelVersion: string;
  requestedAt: string;
  responseTimeMs?: number;
  status?: 'success' | 'error';
  errorMessage?: string;
}

export interface SchoolieEventStatRow {
  analysisIdentifier: string;
  sourceEntryPoint: SchoolieSourceEntryPoint;
  totalRequests: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  avgResponseTimeMs: number;
}

export interface SchoolieOperationalStats {
  successRate: number;
  errorRate: number;
  avgResponseTimeMs: number;
  p95ResponseTimeMs: number;
  timeoutCount: number;
  fastFailCount: number;
  totalErrors: number;
  errorsByType: { errorMessage: string; count: number }[];
}

export interface ScholieSatisfactionStats {
  totalFeedback: number;
  thumbsUpCount: number;
  thumbsDownCount: number;
  satisfactionRate: number;
  topReasonCodes: { code: string; count: number }[];
  byAnalysis: {
    analysisIdentifier: string;
    thumbsUp: number;
    thumbsDown: number;
    satisfactionRate: number;
  }[];
}
