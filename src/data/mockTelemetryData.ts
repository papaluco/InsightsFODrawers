/**
 * Mock telemetry seed data for the App Health dashboards.
 *
 * Session IDs are shared with existing usage mock data so the Sessions Explorer
 * can join usage events with errors and performance events within the same session.
 *
 * Seed is called once at app startup via seedTelemetry().
 */
import type { ErrorTelemetryEvent, PerformanceTelemetryEvent, TelemetryEvent } from '../telemetry/types';
import { TelemetryTransport } from '../telemetry/core/TelemetryTransport';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeRng(seed: number) {
  let s = seed | 0;
  return (): number => {
    s = Math.imul(1664525, s) + 1013904223;
    return (s >>> 0) / 4294967296;
  };
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

/** Returns an ISO 8601 timestamp N days before 2026-05-11. */
function ts(daysAgo: number, hour = 10, minute = 0, second = 0): string {
  const base = new Date('2026-05-11T00:00:00.000Z');
  base.setDate(base.getDate() - daysAgo);
  base.setHours(hour, minute, second, 0);
  return base.toISOString();
}

let eidx = 0;
let pidx = 0;
const errId  = () => `mock-err-${String(++eidx).padStart(3, '0')}`;
const perfId = () => `mock-perf-${String(++pidx).padStart(3, '0')}`;

// ─── Session cross-reference ──────────────────────────────────────────────────
// These session IDs must match the ones generated in the existing mock usage files
// so that the Sessions Explorer can join events across domains.

const INSIGHTS_SESSIONS: { sessionId: string; userId: string; districtId: string }[] = [
  { sessionId: 's-001', userId: 'iu-001', districtId: 'id-001' },
  { sessionId: 's-002', userId: 'iu-001', districtId: 'id-001' },
  { sessionId: 's-003', userId: 'iu-002', districtId: 'id-002' },
  { sessionId: 's-004', userId: 'iu-002', districtId: 'id-002' },
  { sessionId: 's-005', userId: 'iu-003', districtId: 'id-002' },
  { sessionId: 's-006', userId: 'iu-003', districtId: 'id-002' },
  { sessionId: 's-007', userId: 'iu-004', districtId: 'id-001' },
  { sessionId: 's-008', userId: 'iu-004', districtId: 'id-001' },
  { sessionId: 's-009', userId: 'iu-005', districtId: 'id-003' },
  { sessionId: 's-010', userId: 'iu-005', districtId: 'id-003' },
  { sessionId: 's-011', userId: 'iu-006', districtId: 'id-003' },
  { sessionId: 's-012', userId: 'iu-006', districtId: 'id-003' },
  { sessionId: 's-013', userId: 'iu-007', districtId: 'id-004' },
  { sessionId: 's-014', userId: 'iu-007', districtId: 'id-004' },
  { sessionId: 's-015', userId: 'iu-008', districtId: 'id-002' },
  { sessionId: 's-016', userId: 'iu-008', districtId: 'id-002' },
];

const APP_SESSIONS: { sessionId: string; userId: string; districtId: string }[] = [
  { sessionId: 'session-a001', userId: 'user-a01', districtId: 'district-a01' },
  { sessionId: 'session-a002', userId: 'user-a01', districtId: 'district-a01' },
  { sessionId: 'session-a003', userId: 'user-a02', districtId: 'district-a02' },
  { sessionId: 'session-a004', userId: 'user-a02', districtId: 'district-a02' },
  { sessionId: 'session-a005', userId: 'user-a03', districtId: 'district-a03' },
  { sessionId: 'session-a006', userId: 'user-a03', districtId: 'district-a03' },
  { sessionId: 'session-a007', userId: 'user-a04', districtId: 'district-a04' },
  { sessionId: 'session-a008', userId: 'user-a04', districtId: 'district-a04' },
  { sessionId: 'session-a009', userId: 'user-a05', districtId: 'district-a01' },
  { sessionId: 'session-a010', userId: 'user-a05', districtId: 'district-a01' },
  { sessionId: 'session-a011', userId: 'user-a06', districtId: 'district-a02' },
  { sessionId: 'session-a012', userId: 'user-a06', districtId: 'district-a02' },
  { sessionId: 'session-a013', userId: 'user-a07', districtId: 'district-a05' },
  { sessionId: 'session-a014', userId: 'user-a08', districtId: 'district-a06' },
  { sessionId: 'session-a015', userId: 'user-a09', districtId: 'district-a03' },
];

const MENU_SESSIONS: { sessionId: string; userId: string; districtId: string }[] = [
  { sessionId: 'msess-0001', userId: 'mu001', districtId: 'md001' },
  { sessionId: 'msess-0002', userId: 'mu002', districtId: 'md001' },
  { sessionId: 'msess-0003', userId: 'mu005', districtId: 'md002' },
  { sessionId: 'msess-0004', userId: 'mu008', districtId: 'md003' },
  { sessionId: 'msess-0005', userId: 'mu011', districtId: 'md004' },
  { sessionId: 'msess-0006', userId: 'mu014', districtId: 'md005' },
  { sessionId: 'msess-0007', userId: 'mu017', districtId: 'md006' },
  { sessionId: 'msess-0008', userId: 'mu020', districtId: 'md007' },
  { sessionId: 'msess-0009', userId: 'mu023', districtId: 'md008' },
  { sessionId: 'msess-0010', userId: 'mu003', districtId: 'md001' },
];

// ─── Error Events ─────────────────────────────────────────────────────────────

function err(
  overrides: Omit<ErrorTelemetryEvent, 'eventId' | 'eventDomain' | 'source' | 'module'> & { module?: string },
): ErrorTelemetryEvent {
  return {
    eventId:   errId(),
    eventDomain: 'error',
    source:    'frontend',
    module:    'insights',
    ...overrides,
  };
}

export const mockErrorEvents: ErrorTelemetryEvent[] = [

  // ── Critical errors ────────────────────────────────────────────────────────

  err({
    eventName: 'app_crash_unhandled_exception',
    timestamp: ts(2, 14, 32, 11),
    sessionId: 's-004', userId: 'iu-002', districtId: 'id-002',
    errorCategory: 'frontend_exception',
    severity: 'critical',
    message: 'Cannot read properties of undefined (reading "kpiData")',
    isUserBlocking: true,
    component: 'KpiGrid',
    page: 'InsightsDashboard',
    sanitizedStackTrace: 'KpiGrid.tsx:142\nuseFetchKpiData.ts:88\nReact render cycle',
  }),
  err({
    eventName: 'app_crash_unhandled_exception',
    timestamp: ts(9, 9, 5, 44),
    sessionId: 'session-a007', userId: 'user-a04', districtId: 'district-a04',
    errorCategory: 'frontend_exception',
    severity: 'critical',
    message: 'Maximum update depth exceeded in component tree',
    isUserBlocking: true,
    component: 'InsightsDashboard',
    page: 'InsightsDashboard',
    sanitizedStackTrace: 'InsightsDashboard.tsx:98\nuseInsightsData.ts:221\nReact reconciler',
  }),
  err({
    eventName: 'report_generation_crashed',
    timestamp: ts(15, 11, 17, 0),
    sessionId: 'session-a003', userId: 'user-a02', districtId: 'district-a02',
    errorCategory: 'api_error',
    severity: 'critical',
    message: 'Report generation service returned 503: Service Unavailable',
    statusCode: 503,
    isUserBlocking: true,
    module: 'reports',
    component: 'ReportBuilder',
    page: 'ReportsPage',
    sanitizedStackTrace: 'ReportBuilder.tsx:310\ngenerateReport.ts:55\nfetch',
  }),
  err({
    eventName: 'auth_session_expired',
    timestamp: ts(6, 16, 45, 0),
    sessionId: 'session-a012', userId: 'user-a06', districtId: 'district-a02',
    errorCategory: 'permission_error',
    severity: 'critical',
    message: 'Session token expired — user forced to re-authenticate',
    statusCode: 401,
    isUserBlocking: true,
    module: 'workspace',
    component: 'AuthGuard',
    page: 'WorkspacePage',
  }),
  err({
    eventName: 'district_data_load_failed',
    timestamp: ts(22, 8, 12, 30),
    sessionId: 's-013', userId: 'iu-007', districtId: 'id-004',
    errorCategory: 'api_error',
    severity: 'critical',
    message: 'District data endpoint returned 500 — dashboard unrenderable',
    statusCode: 500,
    isUserBlocking: true,
    component: 'InsightsDashboard',
    page: 'InsightsDashboard',
  }),

  // ── High severity — API errors ─────────────────────────────────────────────

  err({
    eventName: 'kpi_drawer_load_failed',
    timestamp: ts(1, 9, 14, 22),
    sessionId: 's-001', userId: 'iu-001', districtId: 'id-001',
    errorCategory: 'api_error',
    severity: 'high',
    message: 'KPI data fetch returned 500: Internal Server Error',
    statusCode: 500,
    isUserBlocking: true,
    component: 'KpiDrawer',
    page: 'InsightsDashboard',
  }),
  err({
    eventName: 'kpi_drawer_load_failed',
    timestamp: ts(3, 10, 22, 5),
    sessionId: 's-003', userId: 'iu-002', districtId: 'id-002',
    errorCategory: 'api_error',
    severity: 'high',
    message: 'KPI data fetch returned 500: Internal Server Error',
    statusCode: 500,
    isUserBlocking: true,
    component: 'KpiDrawer',
    page: 'InsightsDashboard',
  }),
  err({
    eventName: 'kpi_drawer_load_failed',
    timestamp: ts(8, 14, 8, 0),
    sessionId: 's-007', userId: 'iu-004', districtId: 'id-001',
    errorCategory: 'network_error',
    severity: 'high',
    message: 'KPI data fetch timed out after 15000ms',
    isUserBlocking: true,
    component: 'KpiDrawer',
    page: 'InsightsDashboard',
  }),
  err({
    eventName: 'report_load_failed',
    timestamp: ts(4, 13, 33, 0),
    sessionId: 'session-a005', userId: 'user-a03', districtId: 'district-a03',
    errorCategory: 'api_error',
    severity: 'high',
    message: 'Report data endpoint returned 502: Bad Gateway',
    statusCode: 502,
    isUserBlocking: true,
    module: 'reports',
    component: 'ReportViewer',
    page: 'ReportsPage',
  }),
  err({
    eventName: 'report_export_failed',
    timestamp: ts(7, 15, 0, 0),
    sessionId: 'session-a009', userId: 'user-a05', districtId: 'district-a01',
    errorCategory: 'api_error',
    severity: 'high',
    message: 'PDF export service returned 500 after 12 seconds',
    statusCode: 500,
    isUserBlocking: false,
    module: 'reports',
    component: 'ExportButton',
    page: 'ReportsPage',
    properties: { format: 'PDF', reportId: 'rpt-002' },
  }),
  err({
    eventName: 'menu_analysis_drawer_load_failed',
    timestamp: ts(5, 11, 19, 0),
    sessionId: 'msess-0001', userId: 'mu001', districtId: 'md001',
    errorCategory: 'api_error',
    severity: 'high',
    message: 'Menu items drawer data fetch returned 500',
    statusCode: 500,
    isUserBlocking: true,
    module: 'menu_analysis',
    component: 'MenuItemsDrawer',
    page: 'MenuAnalysisPage',
  }),
  err({
    eventName: 'menu_analysis_drawer_load_failed',
    timestamp: ts(12, 9, 47, 0),
    sessionId: 'msess-0004', userId: 'mu008', districtId: 'md003',
    errorCategory: 'network_error',
    severity: 'high',
    message: 'Menu analysis API request timed out after 10000ms',
    isUserBlocking: true,
    module: 'menu_analysis',
    component: 'SchoolPerformanceDrawer',
    page: 'MenuAnalysisPage',
  }),
  err({
    eventName: 'insights_grid_render_failed',
    timestamp: ts(10, 10, 5, 0),
    sessionId: 's-009', userId: 'iu-005', districtId: 'id-003',
    errorCategory: 'frontend_exception',
    severity: 'high',
    message: 'TypeError: Cannot destructure undefined from kpiData response',
    isUserBlocking: true,
    component: 'KpiGrid',
    page: 'InsightsDashboard',
    sanitizedStackTrace: 'KpiGrid.tsx:88\nKpiCard.tsx:34\nReact render',
  }),
  err({
    eventName: 'site_filter_load_failed',
    timestamp: ts(11, 14, 22, 0),
    sessionId: 'session-a013', userId: 'user-a07', districtId: 'district-a05',
    errorCategory: 'api_error',
    severity: 'high',
    message: 'Site filter options endpoint returned 422: Unprocessable Entity',
    statusCode: 422,
    isUserBlocking: false,
    component: 'SiteFilterBar',
    page: 'InsightsDashboard',
  }),

  // ── High severity — permission errors ──────────────────────────────────────

  err({
    eventName: 'unauthorized_district_access',
    timestamp: ts(3, 8, 5, 0),
    sessionId: 'session-a011', userId: 'user-a06', districtId: 'district-a02',
    errorCategory: 'permission_error',
    severity: 'high',
    message: 'User does not have access to requested district data: 403 Forbidden',
    statusCode: 403,
    isUserBlocking: true,
    component: 'KpiDrawer',
    page: 'InsightsDashboard',
  }),
  err({
    eventName: 'report_access_denied',
    timestamp: ts(18, 15, 30, 0),
    sessionId: 'session-a015', userId: 'user-a09', districtId: 'district-a03',
    errorCategory: 'permission_error',
    severity: 'high',
    message: 'Access denied to report rpt-004: user lacks required role',
    statusCode: 403,
    isUserBlocking: true,
    module: 'reports',
    component: 'ReportViewer',
    page: 'ReportsPage',
    properties: { reportId: 'rpt-004' },
  }),

  // ── Medium severity — API errors ───────────────────────────────────────────

  err({
    eventName: 'trend_chart_load_failed',
    timestamp: ts(1, 10, 35, 0),
    sessionId: 's-002', userId: 'iu-001', districtId: 'id-001',
    errorCategory: 'api_error',
    severity: 'medium',
    message: 'Trend chart data endpoint returned 504: Gateway Timeout',
    statusCode: 504,
    isUserBlocking: false,
    component: 'TrendChart',
    page: 'InsightsDashboard',
  }),
  err({
    eventName: 'trend_chart_load_failed',
    timestamp: ts(5, 13, 2, 0),
    sessionId: 's-006', userId: 'iu-003', districtId: 'id-002',
    errorCategory: 'api_error',
    severity: 'medium',
    message: 'Trend chart data endpoint returned 504: Gateway Timeout',
    statusCode: 504,
    isUserBlocking: false,
    component: 'TrendChart',
    page: 'InsightsDashboard',
  }),
  err({
    eventName: 'trend_chart_load_failed',
    timestamp: ts(14, 9, 55, 0),
    sessionId: 's-010', userId: 'iu-005', districtId: 'id-003',
    errorCategory: 'api_error',
    severity: 'medium',
    message: 'Trend chart data endpoint returned 500: Internal Server Error',
    statusCode: 500,
    isUserBlocking: false,
    component: 'TrendChart',
    page: 'InsightsDashboard',
  }),
  err({
    eventName: 'benchmark_save_failed',
    timestamp: ts(2, 15, 44, 0),
    sessionId: 's-002', userId: 'iu-001', districtId: 'id-001',
    errorCategory: 'api_error',
    severity: 'medium',
    message: 'Benchmark configuration save returned 409: Conflict',
    statusCode: 409,
    isUserBlocking: false,
    component: 'BenchmarkConfig',
    page: 'InsightsDashboard',
  }),
  err({
    eventName: 'report_filter_apply_failed',
    timestamp: ts(6, 11, 15, 0),
    sessionId: 'session-a003', userId: 'user-a02', districtId: 'district-a02',
    errorCategory: 'api_error',
    severity: 'medium',
    message: 'Report filter endpoint returned 400: Bad Request — invalid date range',
    statusCode: 400,
    isUserBlocking: false,
    module: 'reports',
    component: 'ReportFilterBar',
    page: 'ReportsPage',
  }),
  err({
    eventName: 'csv_export_failed',
    timestamp: ts(7, 14, 20, 0),
    sessionId: 'session-a005', userId: 'user-a03', districtId: 'district-a03',
    errorCategory: 'api_error',
    severity: 'medium',
    message: 'CSV export endpoint returned 500 after successful report load',
    statusCode: 500,
    isUserBlocking: false,
    module: 'reports',
    component: 'ExportButton',
    page: 'ReportsPage',
    properties: { format: 'CSV' },
  }),
  err({
    eventName: 'schoolie_response_failed',
    timestamp: ts(3, 16, 5, 0),
    sessionId: 's-001', userId: 'iu-001', districtId: 'id-001',
    errorCategory: 'api_error',
    severity: 'medium',
    message: 'Schoolie AI response endpoint returned 503: Service Unavailable',
    statusCode: 503,
    isUserBlocking: false,
    component: 'SchoolieChat',
    page: 'InsightsDashboard',
    properties: { kpi: 'MPLH' },
  }),
  err({
    eventName: 'schoolie_response_failed',
    timestamp: ts(10, 11, 33, 0),
    sessionId: 'session-a009', userId: 'user-a05', districtId: 'district-a01',
    errorCategory: 'network_error',
    severity: 'medium',
    message: 'Schoolie AI request timed out after 30000ms',
    isUserBlocking: false,
    module: 'workspace',
    component: 'SchoolieChat',
    page: 'WorkspacePage',
  }),
  err({
    eventName: 'menu_filter_options_failed',
    timestamp: ts(8, 10, 0, 0),
    sessionId: 'msess-0003', userId: 'mu005', districtId: 'md002',
    errorCategory: 'api_error',
    severity: 'medium',
    message: 'Menu filter options endpoint returned 500',
    statusCode: 500,
    isUserBlocking: false,
    module: 'menu_analysis',
    component: 'MenuUsageFilters',
    page: 'MenuAnalysisPage',
  }),
  err({
    eventName: 'grid_sort_failed',
    timestamp: ts(4, 9, 48, 0),
    sessionId: 'session-a007', userId: 'user-a04', districtId: 'district-a04',
    errorCategory: 'frontend_exception',
    severity: 'medium',
    message: 'Sort operation failed: undefined is not comparable',
    isUserBlocking: false,
    component: 'ReportGrid',
    page: 'ReportsPage',
    module: 'reports',
  }),
  err({
    eventName: 'dashboard_download_failed',
    timestamp: ts(5, 15, 55, 0),
    sessionId: 's-002', userId: 'iu-001', districtId: 'id-001',
    errorCategory: 'api_error',
    severity: 'medium',
    message: 'Dashboard PDF download returned 500 after 8 seconds',
    statusCode: 500,
    isUserBlocking: false,
    component: 'DashboardDownload',
    page: 'InsightsDashboard',
  }),
  err({
    eventName: 'district_kpi_load_partial',
    timestamp: ts(13, 10, 10, 0),
    sessionId: 's-014', userId: 'iu-007', districtId: 'id-004',
    errorCategory: 'data_error',
    severity: 'medium',
    message: 'KPI response missing expected fields: thresholdPct, priorYear',
    isUserBlocking: false,
    component: 'KpiCard',
    page: 'InsightsDashboard',
  }),
  err({
    eventName: 'district_kpi_load_partial',
    timestamp: ts(20, 11, 27, 0),
    sessionId: 's-015', userId: 'iu-008', districtId: 'id-002',
    errorCategory: 'data_error',
    severity: 'medium',
    message: 'KPI response missing expected fields: thresholdPct',
    isUserBlocking: false,
    component: 'KpiCard',
    page: 'InsightsDashboard',
  }),

  // ── Medium severity — frontend exceptions ──────────────────────────────────

  err({
    eventName: 'chart_render_exception',
    timestamp: ts(2, 9, 0, 0),
    sessionId: 'session-a001', userId: 'user-a01', districtId: 'district-a01',
    errorCategory: 'frontend_exception',
    severity: 'medium',
    message: 'Recharts error: Cannot read properties of null (reading "length")',
    isUserBlocking: false,
    component: 'TrendChart',
    page: 'InsightsDashboard',
    sanitizedStackTrace: 'TrendChart.tsx:77\nRecharts Line:44\nReact render',
  }),
  err({
    eventName: 'chart_render_exception',
    timestamp: ts(16, 13, 41, 0),
    sessionId: 'msess-0005', userId: 'mu011', districtId: 'md004',
    errorCategory: 'frontend_exception',
    severity: 'medium',
    message: 'Recharts error: invalid domain [0, NaN]',
    isUserBlocking: false,
    module: 'menu_analysis',
    component: 'MenuMetricUsageChart',
    page: 'MenuAnalysisPage',
    sanitizedStackTrace: 'MenuMetricUsageChart.tsx:56\nRecharts BarChart:112',
  }),
  err({
    eventName: 'grid_render_exception',
    timestamp: ts(9, 14, 18, 0),
    sessionId: 'session-a010', userId: 'user-a05', districtId: 'district-a01',
    errorCategory: 'frontend_exception',
    severity: 'medium',
    message: 'TypeError: row.value.toFixed is not a function',
    isUserBlocking: false,
    module: 'reports',
    component: 'ReportGrid',
    page: 'ReportsPage',
    sanitizedStackTrace: 'ReportGrid.tsx:203\nReportGridCell.tsx:45',
  }),
  err({
    eventName: 'drawer_animation_failed',
    timestamp: ts(11, 9, 2, 0),
    sessionId: 'session-a014', userId: 'user-a08', districtId: 'district-a06',
    errorCategory: 'frontend_exception',
    severity: 'medium',
    message: 'Framer Motion animation target ref is null',
    isUserBlocking: false,
    component: 'DrawerPanel',
    page: 'InsightsDashboard',
  }),

  // ── Medium severity — network errors ───────────────────────────────────────

  err({
    eventName: 'api_request_timeout',
    timestamp: ts(3, 11, 30, 0),
    sessionId: 's-005', userId: 'iu-003', districtId: 'id-002',
    errorCategory: 'network_error',
    severity: 'medium',
    message: 'API request timed out after 10000ms: /api/insights/kpi/MPLH',
    isUserBlocking: false,
    component: 'KpiCard',
    page: 'InsightsDashboard',
  }),
  err({
    eventName: 'api_request_timeout',
    timestamp: ts(17, 15, 5, 0),
    sessionId: 'session-a002', userId: 'user-a01', districtId: 'district-a01',
    errorCategory: 'network_error',
    severity: 'medium',
    message: 'API request timed out after 10000ms: /api/reports/list',
    isUserBlocking: false,
    module: 'reports',
    component: 'ReportList',
    page: 'ReportsPage',
  }),
  err({
    eventName: 'network_connection_lost',
    timestamp: ts(6, 14, 45, 0),
    sessionId: 's-012', userId: 'iu-006', districtId: 'id-003',
    errorCategory: 'network_error',
    severity: 'medium',
    message: 'fetch failed: NetworkError — browser went offline mid-request',
    isUserBlocking: false,
    component: 'KpiDrawer',
    page: 'InsightsDashboard',
  }),
  err({
    eventName: 'network_connection_lost',
    timestamp: ts(19, 10, 20, 0),
    sessionId: 'msess-0007', userId: 'mu017', districtId: 'md006',
    errorCategory: 'network_error',
    severity: 'medium',
    message: 'fetch failed: NetworkError — browser went offline mid-request',
    isUserBlocking: false,
    module: 'menu_analysis',
    component: 'MenuItemsDrawer',
    page: 'MenuAnalysisPage',
  }),
  err({
    eventName: 'slow_connection_degraded',
    timestamp: ts(8, 8, 55, 0),
    sessionId: 'session-a004', userId: 'user-a02', districtId: 'district-a02',
    errorCategory: 'network_error',
    severity: 'medium',
    message: 'Repeated request retries detected — slow or degraded connection',
    isUserBlocking: false,
    component: 'TrendChart',
    page: 'InsightsDashboard',
  }),

  // ── Medium severity — validation errors ────────────────────────────────────

  err({
    eventName: 'date_range_validation_failed',
    timestamp: ts(1, 11, 42, 0),
    sessionId: 'session-a006', userId: 'user-a03', districtId: 'district-a03',
    errorCategory: 'validation_error',
    severity: 'medium',
    message: 'Date range invalid: end date is before start date',
    isUserBlocking: false,
    component: 'DateRangePicker',
    page: 'ReportsPage',
    module: 'reports',
  }),
  err({
    eventName: 'filter_validation_failed',
    timestamp: ts(4, 12, 10, 0),
    sessionId: 's-008', userId: 'iu-004', districtId: 'id-001',
    errorCategory: 'validation_error',
    severity: 'medium',
    message: 'Filter value exceeds maximum allowed length (500 chars)',
    isUserBlocking: false,
    component: 'SiteFilterBar',
    page: 'InsightsDashboard',
  }),
  err({
    eventName: 'report_param_validation_failed',
    timestamp: ts(12, 14, 55, 0),
    sessionId: 'session-a008', userId: 'user-a04', districtId: 'district-a04',
    errorCategory: 'validation_error',
    severity: 'medium',
    message: 'Report parameter "siteIds" must not be empty',
    isUserBlocking: false,
    module: 'reports',
    component: 'ReportBuilder',
    page: 'ReportsPage',
  }),

  // ── Low severity ──────────────────────────────────────────────────────────

  err({
    eventName: 'stale_cache_served',
    timestamp: ts(0, 9, 0, 0),
    sessionId: 's-001', userId: 'iu-001', districtId: 'id-001',
    errorCategory: 'data_error',
    severity: 'low',
    message: 'Serving stale cached KPI data — cache is 4 hours old',
    isUserBlocking: false,
    component: 'KpiCard',
    page: 'InsightsDashboard',
  }),
  err({
    eventName: 'stale_cache_served',
    timestamp: ts(1, 10, 5, 0),
    sessionId: 's-003', userId: 'iu-002', districtId: 'id-002',
    errorCategory: 'data_error',
    severity: 'low',
    message: 'Serving stale cached KPI data — cache is 6 hours old',
    isUserBlocking: false,
    component: 'KpiCard',
    page: 'InsightsDashboard',
  }),
  err({
    eventName: 'stale_cache_served',
    timestamp: ts(3, 11, 12, 0),
    sessionId: 'session-a001', userId: 'user-a01', districtId: 'district-a01',
    errorCategory: 'data_error',
    severity: 'low',
    message: 'Serving stale cached report data — cache is 2 hours old',
    isUserBlocking: false,
    module: 'reports',
    component: 'ReportViewer',
    page: 'ReportsPage',
  }),
  err({
    eventName: 'icon_asset_load_failed',
    timestamp: ts(2, 13, 5, 0),
    sessionId: 'session-a002', userId: 'user-a01', districtId: 'district-a01',
    errorCategory: 'frontend_exception',
    severity: 'low',
    message: 'Failed to load icon asset: /assets/icons/trend-up.svg',
    isUserBlocking: false,
    component: 'TrendIcon',
    page: 'InsightsDashboard',
  }),
  err({
    eventName: 'tooltip_render_error',
    timestamp: ts(5, 10, 22, 0),
    sessionId: 's-005', userId: 'iu-003', districtId: 'id-002',
    errorCategory: 'frontend_exception',
    severity: 'low',
    message: 'Chart tooltip render error: value is null',
    isUserBlocking: false,
    component: 'TrendChart',
    page: 'InsightsDashboard',
  }),
  err({
    eventName: 'tooltip_render_error',
    timestamp: ts(9, 14, 30, 0),
    sessionId: 'msess-0002', userId: 'mu002', districtId: 'md001',
    errorCategory: 'frontend_exception',
    severity: 'low',
    message: 'Chart tooltip render error: NaN passed to formatter',
    isUserBlocking: false,
    module: 'menu_analysis',
    component: 'MenuDrawerUsageChart',
    page: 'MenuAnalysisPage',
  }),
  err({
    eventName: 'preference_save_failed',
    timestamp: ts(4, 16, 0, 0),
    sessionId: 's-007', userId: 'iu-004', districtId: 'id-001',
    errorCategory: 'api_error',
    severity: 'low',
    message: 'Column preference save returned 422 — defaulting to system columns',
    statusCode: 422,
    isUserBlocking: false,
    component: 'ColumnPicker',
    page: 'InsightsDashboard',
  }),
  err({
    eventName: 'preference_save_failed',
    timestamp: ts(10, 9, 50, 0),
    sessionId: 'session-a013', userId: 'user-a07', districtId: 'district-a05',
    errorCategory: 'api_error',
    severity: 'low',
    message: 'Column preference save returned 422 — defaulting to system columns',
    statusCode: 422,
    isUserBlocking: false,
    module: 'reports',
    component: 'ColumnPicker',
    page: 'ReportsPage',
  }),
  err({
    eventName: 'non_critical_retry_succeeded',
    timestamp: ts(6, 10, 15, 0),
    sessionId: 's-011', userId: 'iu-006', districtId: 'id-003',
    errorCategory: 'network_error',
    severity: 'low',
    message: 'First request failed (timeout), retry succeeded on attempt 2',
    isUserBlocking: false,
    component: 'KpiDrawer',
    page: 'InsightsDashboard',
  }),
  err({
    eventName: 'non_critical_retry_succeeded',
    timestamp: ts(13, 11, 5, 0),
    sessionId: 'session-a010', userId: 'user-a05', districtId: 'district-a01',
    errorCategory: 'network_error',
    severity: 'low',
    message: 'First request failed (timeout), retry succeeded on attempt 2',
    isUserBlocking: false,
    module: 'reports',
    component: 'ReportViewer',
    page: 'ReportsPage',
  }),
  err({
    eventName: 'missing_feature_flag',
    timestamp: ts(7, 8, 30, 0),
    sessionId: 'session-a004', userId: 'user-a02', districtId: 'district-a02',
    errorCategory: 'integration_error',
    severity: 'low',
    message: 'Feature flag "advanced_benchmarks" not found — using default behavior',
    isUserBlocking: false,
    component: 'BenchmarkConfig',
    page: 'InsightsDashboard',
  }),
  err({
    eventName: 'missing_feature_flag',
    timestamp: ts(21, 9, 10, 0),
    sessionId: 'msess-0009', userId: 'mu023', districtId: 'md008',
    errorCategory: 'integration_error',
    severity: 'low',
    message: 'Feature flag "menu_analysis_v2" not found — using default behavior',
    isUserBlocking: false,
    module: 'menu_analysis',
    component: 'MenuAnalysisPage',
    page: 'MenuAnalysisPage',
  }),
  err({
    eventName: 'user_settings_load_failed',
    timestamp: ts(15, 14, 40, 0),
    sessionId: 's-016', userId: 'iu-008', districtId: 'id-002',
    errorCategory: 'api_error',
    severity: 'low',
    message: 'User settings endpoint returned 404 — using defaults',
    statusCode: 404,
    isUserBlocking: false,
    module: 'workspace',
    component: 'SettingsPanel',
    page: 'WorkspacePage',
  }),
  err({
    eventName: 'telemetry_flush_failed',
    timestamp: ts(0, 23, 55, 0),
    sessionId: 'session-a001', userId: 'user-a01', districtId: 'district-a01',
    errorCategory: 'network_error',
    severity: 'low',
    message: 'Telemetry batch flush failed after 3 retries — events discarded',
    isUserBlocking: false,
    module: 'workspace',
    component: 'TelemetryQueue',
    page: 'WorkspacePage',
  }),
];

// ─── Performance Events ───────────────────────────────────────────────────────

function perf(
  overrides: Omit<PerformanceTelemetryEvent, 'eventId' | 'eventDomain' | 'source' | 'module'> & { module?: string },
): PerformanceTelemetryEvent {
  return {
    eventId:   perfId(),
    eventDomain: 'performance',
    source:    'frontend',
    module:    'insights',
    ...overrides,
  };
}

// Generate a batch of similar performance events using a seeded RNG
function perfBatch(
  rng: () => number,
  count: number,
  template: Omit<PerformanceTelemetryEvent, 'eventId' | 'eventDomain' | 'source' | 'timestamp' | 'sessionId' | 'durationMs' | 'isSlow'>,
  sessions: { sessionId: string; userId: string; districtId: string }[],
  baseDaysAgo: number,
  normalMs: number,
  slowMs: number,
  thresholdMs: number,
  slowPct: number,
): PerformanceTelemetryEvent[] {
  const results: PerformanceTelemetryEvent[] = [];
  for (let i = 0; i < count; i++) {
    const session  = pick(sessions, rng);
    const daysAgo  = Math.floor(rng() * baseDaysAgo);
    const hour     = 8 + Math.floor(rng() * 9);
    const minute   = Math.floor(rng() * 60);
    const isSlow   = rng() < slowPct;
    const durationMs = isSlow
      ? Math.round(slowMs * (0.9 + rng() * 0.6))
      : Math.round(normalMs * (0.5 + rng() * 0.8));
    results.push(perf({
      ...template,
      sessionId:  session.sessionId,
      userId:     session.userId,
      districtId: session.districtId,
      timestamp:  ts(daysAgo, hour, minute),
      durationMs,
      thresholdMs,
      isSlow:     durationMs > thresholdMs,
      success:    rng() > 0.08,
    }));
  }
  return results;
}

const rng = makeRng(42);
const allSessions = [...INSIGHTS_SESSIONS, ...APP_SESSIONS, ...MENU_SESSIONS];

export const mockPerformanceEvents: PerformanceTelemetryEvent[] = [

  // ── Hand-crafted correlated events (match error events above) ──────────────

  // Session s-001: KPI drawer load that preceeds the kpi_drawer_load_failed error
  perf({
    eventName: 'kpi_drawer_load',
    timestamp: ts(1, 9, 14, 10),
    sessionId: 's-001', userId: 'iu-001', districtId: 'id-001',
    performanceCategory: 'drawer_load',
    durationMs: 14800, thresholdMs: 2500, isSlow: true, success: false,
    component: 'KpiDrawer', page: 'InsightsDashboard',
  }),
  // Same session, earlier successful drawer open
  perf({
    eventName: 'kpi_drawer_load',
    timestamp: ts(3, 10, 21, 45),
    sessionId: 's-003', userId: 'iu-002', districtId: 'id-002',
    performanceCategory: 'drawer_load',
    durationMs: 12300, thresholdMs: 2500, isSlow: true, success: false,
    component: 'KpiDrawer', page: 'InsightsDashboard',
  }),
  // Report generation that crashed (session-a003)
  perf({
    eventName: 'report_generation',
    timestamp: ts(15, 11, 15, 30),
    sessionId: 'session-a003', userId: 'user-a02', districtId: 'district-a02',
    performanceCategory: 'report_generation',
    durationMs: 31000, thresholdMs: 10000, isSlow: true, success: false,
    module: 'reports', component: 'ReportBuilder', page: 'ReportsPage',
  }),
  // Menu analysis drawer that failed (msess-0001)
  perf({
    eventName: 'menu_items_drawer_load',
    timestamp: ts(5, 11, 18, 45),
    sessionId: 'msess-0001', userId: 'mu001', districtId: 'md001',
    performanceCategory: 'drawer_load',
    durationMs: 11200, thresholdMs: 2500, isSlow: true, success: false,
    module: 'menu_analysis', component: 'MenuItemsDrawer', page: 'MenuAnalysisPage',
  }),
  // Slow page load (session-a007 — same as critical crash)
  perf({
    eventName: 'insights_page_load',
    timestamp: ts(9, 9, 4, 55),
    sessionId: 'session-a007', userId: 'user-a04', districtId: 'district-a04',
    performanceCategory: 'page_load',
    durationMs: 8400, thresholdMs: 3000, isSlow: true, success: true,
    component: 'InsightsDashboard', page: 'InsightsDashboard',
  }),

  // ── Batch: page_load — insights (30 events, ~20% slow) ────────────────────
  ...perfBatch(rng, 30,
    { eventName: 'insights_page_load', performanceCategory: 'page_load',
      component: 'InsightsDashboard', page: 'InsightsDashboard', module: 'insights' },
    INSIGHTS_SESSIONS, 30, 1200, 4500, 3000, 0.2,
  ),

  // ── Batch: page_load — reports (10 events, ~15% slow) ─────────────────────
  ...perfBatch(rng, 10,
    { eventName: 'reports_page_load', performanceCategory: 'page_load',
      component: 'ReportsPage', page: 'ReportsPage', module: 'reports' },
    APP_SESSIONS, 30, 900, 4200, 3000, 0.15,
  ),

  // ── Batch: drawer_load — kpi drawer (40 events, ~25% slow) ────────────────
  ...perfBatch(rng, 40,
    { eventName: 'kpi_drawer_load', performanceCategory: 'drawer_load',
      component: 'KpiDrawer', page: 'InsightsDashboard', module: 'insights' },
    INSIGHTS_SESSIONS, 30, 900, 4800, 2500, 0.25,
  ),

  // ── Batch: drawer_load — menu items (15 events, ~30% slow) ────────────────
  ...perfBatch(rng, 15,
    { eventName: 'menu_items_drawer_load', performanceCategory: 'drawer_load',
      component: 'MenuItemsDrawer', page: 'MenuAnalysisPage', module: 'menu_analysis' },
    MENU_SESSIONS, 30, 1100, 5200, 2500, 0.30,
  ),

  // ── Batch: api_request — kpi data (30 events, ~20% slow) ──────────────────
  ...perfBatch(rng, 30,
    { eventName: 'api_kpi_data_fetch', performanceCategory: 'api_request',
      component: 'KpiCard', page: 'InsightsDashboard', module: 'insights' },
    INSIGHTS_SESSIONS, 30, 600, 3500, 2000, 0.2,
  ),

  // ── Batch: api_request — report fetch (10 events, ~15% slow) ──────────────
  ...perfBatch(rng, 10,
    { eventName: 'api_report_fetch', performanceCategory: 'api_request',
      component: 'ReportViewer', page: 'ReportsPage', module: 'reports' },
    APP_SESSIONS, 30, 700, 3800, 2000, 0.15,
  ),

  // ── Batch: chart_render — trend chart (20 events, ~10% slow) ──────────────
  ...perfBatch(rng, 20,
    { eventName: 'trend_chart_render', performanceCategory: 'chart_render',
      component: 'TrendChart', page: 'InsightsDashboard', module: 'insights' },
    INSIGHTS_SESSIONS, 30, 300, 2500, 2000, 0.1,
  ),

  // ── Batch: filter_apply — insights (15 events, ~12% slow) ─────────────────
  ...perfBatch(rng, 15,
    { eventName: 'site_filter_apply', performanceCategory: 'filter_apply',
      component: 'SiteFilterBar', page: 'InsightsDashboard', module: 'insights' },
    INSIGHTS_SESSIONS, 30, 200, 2200, 1500, 0.12,
  ),

  // ── Batch: report_generation (8 events, ~40% slow) ────────────────────────
  ...perfBatch(rng, 8,
    { eventName: 'report_generation', performanceCategory: 'report_generation',
      component: 'ReportBuilder', page: 'ReportsPage', module: 'reports' },
    APP_SESSIONS, 30, 6000, 18000, 10000, 0.40,
  ),

  // ── Batch: ai_response — Schoolie (10 events, ~20% slow) ──────────────────
  ...perfBatch(rng, 10,
    { eventName: 'schoolie_response', performanceCategory: 'ai_response',
      component: 'SchoolieChat', page: 'InsightsDashboard', module: 'insights' },
    INSIGHTS_SESSIONS, 30, 4000, 22000, 15000, 0.2,
  ),
];

// ─── Seed function ────────────────────────────────────────────────────────────

/**
 * Seed the in-memory TelemetryTransport with mock error and performance events.
 * Call once at app startup, after other mock data is initialized.
 */
let _seeded = false;

export function seedTelemetry(): void {
  if (_seeded) return;
  _seeded = true;
  TelemetryTransport.seed([...mockErrorEvents, ...mockPerformanceEvents]);
}
