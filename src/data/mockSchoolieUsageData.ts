import { MOCK_CURRENT_USER } from './mockCurrentUser';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SchoolieEventType =
  | 'KPI_SCHOOLIE_OPENED'
  | 'DASHBOARD_SCHOOLIE_OPENED'
  | 'AI_REQUEST_STARTED'
  | 'AI_RESPONSE_SUCCESS'
  | 'AI_RESPONSE_ERROR';

export type SchoolieAnalysisIdentifier =
  | 'MPLH' | 'ENP' | 'PNA' | 'InsightsDashboard' | 'AppUsage' | 'MenuAnalysis' | 'Reports';

export type SchoolieSourceEntryPoint = 'KpiDrawer' | 'Dashboard' | 'UsageScreen';

export interface SchoolieUsageEvent {
  eventType: SchoolieEventType;
  sessionId: string;
  userId: string;
  districtId: string;
  platform: 'SchoolCafe' | 'PrimeroEdge';
  analysisIdentifier: SchoolieAnalysisIdentifier;
  sourceEntryPoint: SchoolieSourceEntryPoint;
  promptVersion: 1 | 2;
  modelVersion: string;
  timestamp: string;
  responseTimeMs?: number;
  status?: 'success' | 'error';
  errorMessage?: string;
}

// ─── User / district identity maps ───────────────────────────────────────────

export const SCHOOLIE_USER_NAMES: Record<string, string> = {
  [MOCK_CURRENT_USER.userId]: MOCK_CURRENT_USER.userName,
  'iu-001': 'Sarah Jenkins',
  'iu-002': 'Michael Chen',
  'user-a01': 'Hannah Green',
  'user-a02': 'Marcus Rivera',
  'user-001': 'Sarah Mitchell',
  'user-002': 'James Rodriguez',
  'mu001': 'Sarah Bennett',
  'mu002': 'James Ortega',
};

export const SCHOOLIE_DISTRICT_NAMES: Record<string, string> = {
  [MOCK_CURRENT_USER.districtId]: MOCK_CURRENT_USER.districtName,
  'id-001': 'Greenfield USD',
  'id-002': 'Riverside ISD',
  'district-a01': 'Mercer County USD',
  'district-a02': 'Lakewood ISD',
  'district-001': 'Mercer County District',
  'district-002': 'Riverside USD',
  'md001': 'Pinewood USD',
  'md002': 'Riverside ISD',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ts(daysAgo: number, hour = 10, minute = 0): string {
  const dt = new Date('2026-05-14T00:00:00.000Z');
  dt.setUTCDate(dt.getUTCDate() - daysAgo);
  dt.setUTCHours(hour, minute, 0, 0);
  return dt.toISOString();
}

function kpiTriple(
  session: string,
  userId: string,
  districtId: string,
  platform: 'SchoolCafe' | 'PrimeroEdge',
  kpi: SchoolieAnalysisIdentifier,
  daysAgo: number,
  hour: number,
  responseMs: number,
  success: boolean,
  promptVersion: 1 | 2,
): SchoolieUsageEvent[] {
  const base = ts(daysAgo, hour);
  const requestTs = new Date(new Date(base).getTime() + 60000).toISOString();
  const responseTs = new Date(new Date(base).getTime() + 60000 + responseMs).toISOString();
  return [
    { eventType: 'KPI_SCHOOLIE_OPENED',  sessionId: session, userId, districtId, platform, analysisIdentifier: kpi, sourceEntryPoint: 'KpiDrawer',  promptVersion, modelVersion: 'gpt-4o', timestamp: base },
    { eventType: 'AI_REQUEST_STARTED',   sessionId: session, userId, districtId, platform, analysisIdentifier: kpi, sourceEntryPoint: 'KpiDrawer',  promptVersion, modelVersion: 'gpt-4o', timestamp: requestTs },
    { eventType: success ? 'AI_RESPONSE_SUCCESS' : 'AI_RESPONSE_ERROR', sessionId: session, userId, districtId, platform, analysisIdentifier: kpi, sourceEntryPoint: 'KpiDrawer', promptVersion, modelVersion: 'gpt-4o', timestamp: responseTs, responseTimeMs: responseMs, status: success ? 'success' : 'error', ...(!success && { errorMessage: responseMs > 10000 ? 'Request timed out' : 'AI service returned an error' }) },
  ];
}

function dashTriple(
  session: string,
  userId: string,
  districtId: string,
  platform: 'SchoolCafe' | 'PrimeroEdge',
  analysis: SchoolieAnalysisIdentifier,
  daysAgo: number,
  hour: number,
  responseMs: number,
  promptVersion: 1 | 2,
): SchoolieUsageEvent[] {
  const base = ts(daysAgo, hour);
  const requestTs = new Date(new Date(base).getTime() + 60000).toISOString();
  const responseTs = new Date(new Date(base).getTime() + 60000 + responseMs).toISOString();
  return [
    { eventType: 'DASHBOARD_SCHOOLIE_OPENED', sessionId: session, userId, districtId, platform, analysisIdentifier: analysis, sourceEntryPoint: 'Dashboard', promptVersion, modelVersion: 'gpt-4o', timestamp: base },
    { eventType: 'AI_REQUEST_STARTED',        sessionId: session, userId, districtId, platform, analysisIdentifier: analysis, sourceEntryPoint: 'Dashboard', promptVersion, modelVersion: 'gpt-4o', timestamp: requestTs },
    { eventType: 'AI_RESPONSE_SUCCESS',       sessionId: session, userId, districtId, platform, analysisIdentifier: analysis, sourceEntryPoint: 'Dashboard', promptVersion, modelVersion: 'gpt-4o', timestamp: responseTs, responseTimeMs: responseMs, status: 'success' },
  ];
}

function usagePair(
  session: string,
  userId: string,
  districtId: string,
  platform: 'SchoolCafe' | 'PrimeroEdge',
  analysis: SchoolieAnalysisIdentifier,
  daysAgo: number,
  hour: number,
  responseMs: number,
  success: boolean,
  promptVersion: 1 | 2,
): SchoolieUsageEvent[] {
  const requestTs = ts(daysAgo, hour);
  const responseTs = new Date(new Date(requestTs).getTime() + responseMs).toISOString();
  return [
    { eventType: 'AI_REQUEST_STARTED', sessionId: session, userId, districtId, platform, analysisIdentifier: analysis, sourceEntryPoint: 'UsageScreen', promptVersion, modelVersion: 'gpt-4o', timestamp: requestTs },
    { eventType: success ? 'AI_RESPONSE_SUCCESS' : 'AI_RESPONSE_ERROR', sessionId: session, userId, districtId, platform, analysisIdentifier: analysis, sourceEntryPoint: 'UsageScreen', promptVersion, modelVersion: 'gpt-4o', timestamp: responseTs, responseTimeMs: responseMs, status: success ? 'success' : 'error', ...(!success && { errorMessage: 'AI service returned an error' }) },
  ];
}

// ─── Events ───────────────────────────────────────────────────────────────────
// 19 interactions × ~3 events each = ~57 events
// ~89% success (17/19), ~11% error (2/19)
// Response times: fast 800–2000ms, slow 4000–8000ms, timeout >10000ms

export const mockSchoolieUsageEvents: SchoolieUsageEvent[] = [

  // ── Demo Admin — KPI drawer interactions ─────────────────────────────────
  ...kpiTriple('sch-s001', MOCK_CURRENT_USER.userId, MOCK_CURRENT_USER.districtId, 'SchoolCafe', 'MPLH',             2,  9, 1200,  true,  1),
  ...kpiTriple('sch-s002', MOCK_CURRENT_USER.userId, MOCK_CURRENT_USER.districtId, 'SchoolCafe', 'PNA',              5, 10,  950,  true,  1),
  ...kpiTriple('sch-s003', MOCK_CURRENT_USER.userId, MOCK_CURRENT_USER.districtId, 'SchoolCafe', 'ENP',             12, 11, 5400,  true,  2),
  ...kpiTriple('sch-s004', MOCK_CURRENT_USER.userId, MOCK_CURRENT_USER.districtId, 'SchoolCafe', 'MPLH',            35,  9, 12500, false, 1), // timeout error
  ...kpiTriple('sch-s005', MOCK_CURRENT_USER.userId, MOCK_CURRENT_USER.districtId, 'SchoolCafe', 'PNA',             55, 14, 1100,  true,  2),

  // ── Demo Admin — dashboard interactions ──────────────────────────────────
  ...dashTriple('sch-s006', MOCK_CURRENT_USER.userId, MOCK_CURRENT_USER.districtId, 'SchoolCafe', 'InsightsDashboard',  8, 10, 1800, 2),
  ...dashTriple('sch-s007', MOCK_CURRENT_USER.userId, MOCK_CURRENT_USER.districtId, 'SchoolCafe', 'InsightsDashboard', 12, 14, 1550, 1),

  // ── Demo Admin — usage screen interactions ────────────────────────────────
  ...usagePair('sch-s008', MOCK_CURRENT_USER.userId, MOCK_CURRENT_USER.districtId, 'SchoolCafe', 'AppUsage',    22, 11, 1500, true,  2),
  ...usagePair('sch-s009', MOCK_CURRENT_USER.userId, MOCK_CURRENT_USER.districtId, 'SchoolCafe', 'Reports',     40, 15, 1700, true,  1),

  // ── Sarah Jenkins (iu-001 / id-001) ──────────────────────────────────────
  ...kpiTriple('sch-s010', 'iu-001', 'id-001', 'SchoolCafe', 'MPLH',             3,  8, 1050, true,  1),
  ...kpiTriple('sch-s011', 'iu-001', 'id-001', 'SchoolCafe', 'ENP',             10, 15,  900, true,  1),
  ...kpiTriple('sch-s012', 'iu-001', 'id-001', 'SchoolCafe', 'PNA',             28, 10, 6200, true,  2),
  ...dashTriple('sch-s013', 'iu-001', 'id-001', 'SchoolCafe', 'InsightsDashboard', 45, 9, 1350, 1),

  // ── Hannah Green (user-a01 / district-a01) ────────────────────────────────
  ...usagePair('sch-s014', 'user-a01', 'district-a01', 'SchoolCafe', 'Reports',      6, 15, 1300, true,  1),
  ...usagePair('sch-s015', 'user-a01', 'district-a01', 'SchoolCafe', 'MenuAnalysis', 14,  9,  380, false, 1), // fast fail error
  ...dashTriple('sch-s016', 'user-a01', 'district-a01', 'SchoolCafe', 'InsightsDashboard', 40, 14, 7100, 2),

  // ── Sarah Mitchell (user-001 / district-001) ──────────────────────────────
  ...kpiTriple('sch-s017', 'user-001', 'district-001', 'SchoolCafe', 'PNA',  4,  9, 1050, true,  1),
  ...kpiTriple('sch-s018', 'user-001', 'district-001', 'SchoolCafe', 'ENP', 18, 11, 4800, true,  2),
  ...usagePair('sch-s019', 'user-001', 'district-001', 'SchoolCafe', 'Reports', 55, 14, 1700, true, 1),

  // ── Sarah Bennett (mu001 / md001) ─────────────────────────────────────────
  ...usagePair('sch-s020', 'mu001', 'md001', 'SchoolCafe', 'MenuAnalysis', 7, 10, 1450, true,  1),
  ...usagePair('sch-s021', 'mu001', 'md001', 'SchoolCafe', 'Reports',     25, 13, 1200, true,  1),
  ...dashTriple('sch-s022', 'mu001', 'md001', 'SchoolCafe', 'InsightsDashboard', 62, 10, 1250, 2),
];
