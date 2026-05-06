import { InsightsUsageEvent, InsightsEventType } from '../types/insightsUsageTypes';

export const INSIGHTS_USER_NAMES: Record<string, string> = {
  'iu-001': 'Sarah Jenkins',
  'iu-002': 'Michael Chen',
  'iu-003': 'Amanda Torres',
  'iu-004': 'James Wilson',
  'iu-005': 'Linda Park',
  'iu-006': 'David Kim',
  'iu-007': 'Maria Gonzalez',
  'iu-008': 'Robert Hayes',
};

export const INSIGHTS_DISTRICT_NAMES: Record<string, string> = {
  'id-001': 'Greenfield USD',
  'id-002': 'Riverside ISD',
  'id-003': 'Northside CSD',
  'id-004': 'Maplewood USD',
};

export const INSIGHTS_DISTRICT_TIMEZONES: Record<string, string> = {
  'id-001': 'America/New_York',
  'id-002': 'America/Los_Angeles',
  'id-003': 'America/Chicago',
  'id-004': 'America/Denver',
};

// Standard KPIs — available to id-001, id-002, id-003
export const INSIGHTS_STANDARD_KPIS = [
  'MPLH', 'PNA', 'ENP', 'REV', 'FCS', 'LBR',
  'BKF', 'LNH', 'ALC', 'PRC', 'TRD', 'SBD',
];

// Inventory KPIs — only available to id-004 (Maplewood USD)
export const INSIGHTS_INVENTORY_KPIS = ['INV', 'WST', 'FVR'];

export const INSIGHTS_KPIS = [...INSIGHTS_STANDARD_KPIS, ...INSIGHTS_INVENTORY_KPIS];

export const INSIGHTS_DISTRICT_KPIS: Record<string, string[]> = {
  'id-001': INSIGHTS_STANDARD_KPIS,
  'id-002': INSIGHTS_STANDARD_KPIS,
  'id-003': INSIGHTS_STANDARD_KPIS,
  'id-004': INSIGHTS_INVENTORY_KPIS,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function d(daysAgo: number, hour = 10, minute = 0): string {
  const dt = new Date();
  dt.setDate(dt.getDate() - daysAgo);
  dt.setHours(hour, minute, 0, 0);
  return dt.toISOString();
}

function ev(
  eventType: InsightsEventType,
  sessionId: string,
  userId: string,
  districtId: string,
  platform: 'SchoolCafe' | 'PrimeroEdge',
  timestamp: string,
  ctx: Record<string, unknown> = {}
): InsightsUsageEvent {
  return { eventType, sessionId, userId, districtId, platform, timestamp, context: ctx };
}

// Generates KPI_RENDERED events for a session.
// Uses the district's KPI set; hidden KPIs get notRendered: true.
function rk(
  sessionId: string,
  userId: string,
  districtId: string,
  platform: 'SchoolCafe' | 'PrimeroEdge',
  timestamp: string,
  hidden: string[] = []
): InsightsUsageEvent[] {
  const kpis = districtId === 'id-004' ? INSIGHTS_INVENTORY_KPIS : INSIGHTS_STANDARD_KPIS;
  return kpis.map(kpi =>
    ev('KPI_RENDERED', sessionId, userId, districtId, platform, timestamp,
      hidden.includes(kpi) ? { kpi, notRendered: true } : { kpi }
    )
  );
}

// ─── Events ───────────────────────────────────────────────────────────────────

export const mockInsightsUsageEvents: InsightsUsageEvent[] = [

  // ── Session s-001: Sarah Jenkins, Greenfield, SC — d(1,8) ────────────────
  ...rk('s-001', 'iu-001', 'id-001', 'SchoolCafe', d(1, 8, 0), ['ALC', 'SBD']),
  ev('INSIGHTS_PAGE_VIEWED',  's-001', 'iu-001', 'id-001', 'SchoolCafe', d(1, 8, 0)),
  ev('SITE_FILTER_CHANGED',   's-001', 'iu-001', 'id-001', 'SchoolCafe', d(1, 8, 2)),
  ev('KPI_DRAWER_OPENED',     's-001', 'iu-001', 'id-001', 'SchoolCafe', d(1, 8, 5),  { kpi: 'MPLH', isDistrictDrawer: true }),
  ev('TREND_KPI_CHANGED',     's-001', 'iu-001', 'id-001', 'SchoolCafe', d(1, 8, 10), { kpi: 'MPLH' }),
  ev('KPI_DRAWER_DOWNLOAD',   's-001', 'iu-001', 'id-001', 'SchoolCafe', d(1, 8, 15), { kpi: 'MPLH', format: 'CSV' }),
  ev('KPI_SCHOOLIE_OPENED',   's-001', 'iu-001', 'id-001', 'SchoolCafe', d(1, 8, 20), { kpi: 'MPLH' }),

  // ── Session s-002: Sarah Jenkins, Greenfield, SC — d(3,9) ────────────────
  ...rk('s-002', 'iu-001', 'id-001', 'SchoolCafe', d(3, 9, 0), ['TRD']),
  ev('INSIGHTS_PAGE_VIEWED',    's-002', 'iu-001', 'id-001', 'SchoolCafe', d(3, 9, 0)),
  ev('DATE_RANGE_CHANGED',      's-002', 'iu-001', 'id-001', 'SchoolCafe', d(3, 9, 3)),
  ev('KPI_DRAWER_OPENED',       's-002', 'iu-001', 'id-001', 'SchoolCafe', d(3, 9, 8),  { kpi: 'PNA', isDistrictDrawer: true }),
  ev('KPI_DRAWER_OPENED',       's-002', 'iu-001', 'id-001', 'SchoolCafe', d(3, 9, 12), { kpi: 'ENP', isDistrictDrawer: true }),
  ev('BENCHMARK_CONFIG_OPENED', 's-002', 'iu-001', 'id-001', 'SchoolCafe', d(3, 9, 15)),
  ev('BENCHMARK_UPDATED',       's-002', 'iu-001', 'id-001', 'SchoolCafe', d(3, 9, 17)),
  ev('DASHBOARD_DOWNLOAD',      's-002', 'iu-001', 'id-001', 'SchoolCafe', d(3, 9, 25), { format: 'PDF' }),

  // ── Session s-003: Michael Chen, Riverside, SC — d(1,10) ─────────────────
  ...rk('s-003', 'iu-002', 'id-002', 'SchoolCafe', d(1, 10, 0), ['PRC', 'ALC', 'SBD']),
  ev('INSIGHTS_PAGE_VIEWED',  's-003', 'iu-002', 'id-002', 'SchoolCafe', d(1, 10, 0)),
  ev('KPI_DRAWER_OPENED',     's-003', 'iu-002', 'id-002', 'SchoolCafe', d(1, 10, 5),  { kpi: 'MPLH', isDistrictDrawer: true }),
  ev('KPI_DRAWER_OPENED',     's-003', 'iu-002', 'id-002', 'SchoolCafe', d(1, 10, 10), { kpi: 'PNA',  isDistrictDrawer: true }),
  ev('TREND_KPI_CHANGED',     's-003', 'iu-002', 'id-002', 'SchoolCafe', d(1, 10, 15), { kpi: 'PNA' }),
  ev('KPI_DRAWER_DOWNLOAD',   's-003', 'iu-002', 'id-002', 'SchoolCafe', d(1, 10, 20), { kpi: 'PNA', format: 'CSV' }),

  // ── Session s-004: Michael Chen, Riverside — d(5,14) ──────────────────────
  ...rk('s-004', 'iu-002', 'id-002', 'SchoolCafe', d(5, 14, 0), ['LNH']),
  ev('INSIGHTS_PAGE_VIEWED',      's-004', 'iu-002', 'id-002', 'SchoolCafe', d(5, 14, 0)),
  ev('SITE_FILTER_CHANGED',       's-004', 'iu-002', 'id-002', 'SchoolCafe', d(5, 14, 2)),
  ev('DATE_RANGE_CHANGED',        's-004', 'iu-002', 'id-002', 'SchoolCafe', d(5, 14, 4)),
  ev('KPI_DRAWER_OPENED',         's-004', 'iu-002', 'id-002', 'SchoolCafe', d(5, 14, 8),  { kpi: 'ENP', isDistrictDrawer: true }),
  ev('DASHBOARD_SCHOOLIE_OPENED', 's-004', 'iu-002', 'id-002', 'SchoolCafe', d(5, 14, 15)),

  // ── Session s-005: Amanda Torres, Northside, PE — d(2,11) ─────────────────
  ...rk('s-005', 'iu-003', 'id-003', 'PrimeroEdge', d(2, 11, 0), ['BKF', 'LNH']),
  ev('INSIGHTS_PAGE_VIEWED',    's-005', 'iu-003', 'id-003', 'PrimeroEdge', d(2, 11, 0)),
  ev('KPI_DRAWER_OPENED',       's-005', 'iu-003', 'id-003', 'PrimeroEdge', d(2, 11, 6),  { kpi: 'MPLH', isDistrictDrawer: true }),
  ev('KPI_SCHOOLIE_OPENED',     's-005', 'iu-003', 'id-003', 'PrimeroEdge', d(2, 11, 12), { kpi: 'MPLH' }),
  ev('BENCHMARK_CONFIG_OPENED', 's-005', 'iu-003', 'id-003', 'PrimeroEdge', d(2, 11, 20)),

  // ── Session s-006: Amanda Torres, Northside — d(7,15) ─────────────────────
  ...rk('s-006', 'iu-003', 'id-003', 'PrimeroEdge', d(7, 15, 0), []),
  ev('INSIGHTS_PAGE_VIEWED', 's-006', 'iu-003', 'id-003', 'PrimeroEdge', d(7, 15, 0)),
  ev('DATE_RANGE_CHANGED',   's-006', 'iu-003', 'id-003', 'PrimeroEdge', d(7, 15, 3)),
  ev('KPI_DRAWER_OPENED',    's-006', 'iu-003', 'id-003', 'PrimeroEdge', d(7, 15, 8),  { kpi: 'PNA', isDistrictDrawer: true }),
  ev('KPI_DRAWER_OPENED',    's-006', 'iu-003', 'id-003', 'PrimeroEdge', d(7, 15, 12), { kpi: 'ENP', isDistrictDrawer: true }),
  ev('KPI_DRAWER_DOWNLOAD',  's-006', 'iu-003', 'id-003', 'PrimeroEdge', d(7, 15, 16), { kpi: 'ENP', format: 'CSV' }),
  ev('TREND_KPI_CHANGED',    's-006', 'iu-003', 'id-003', 'PrimeroEdge', d(7, 15, 20), { kpi: 'ENP' }),

  // ── Session s-007: James Wilson, Maplewood, SC — d(1,13) ──────────────────
  // Maplewood (id-004) only has inventory KPIs
  ...rk('s-007', 'iu-004', 'id-004', 'SchoolCafe', d(1, 13, 0), []),
  ev('INSIGHTS_PAGE_VIEWED', 's-007', 'iu-004', 'id-004', 'SchoolCafe', d(1, 13, 0)),
  ev('LAYOUT_CONFIG_CHANGED','s-007', 'iu-004', 'id-004', 'SchoolCafe', d(1, 13, 5)),
  ev('KPI_DRAWER_OPENED',    's-007', 'iu-004', 'id-004', 'SchoolCafe', d(1, 13, 10), { kpi: 'INV', isDistrictDrawer: true }),
  ev('TREND_KPI_CHANGED',    's-007', 'iu-004', 'id-004', 'SchoolCafe', d(1, 13, 14), { kpi: 'INV' }),
  ev('KPI_DRAWER_OPENED',    's-007', 'iu-004', 'id-004', 'SchoolCafe', d(1, 13, 18), { kpi: 'WST', isDistrictDrawer: true }),
  ev('TREND_KPI_CHANGED',    's-007', 'iu-004', 'id-004', 'SchoolCafe', d(1, 13, 22), { kpi: 'WST' }),
  ev('KPI_DRAWER_OPENED',    's-007', 'iu-004', 'id-004', 'SchoolCafe', d(1, 13, 26), { kpi: 'FVR', isDistrictDrawer: true }),
  ev('DASHBOARD_DOWNLOAD',   's-007', 'iu-004', 'id-004', 'SchoolCafe', d(1, 13, 35), { format: 'PDF' }),
  ev('KPI_DRAWER_DOWNLOAD',  's-007', 'iu-004', 'id-004', 'SchoolCafe', d(1, 13, 40), { kpi: 'INV', format: 'CSV' }),

  // ── Session s-008: James Wilson, Maplewood — d(4,10) ──────────────────────
  ...rk('s-008', 'iu-004', 'id-004', 'SchoolCafe', d(4, 10, 0), []),
  ev('INSIGHTS_PAGE_VIEWED',      's-008', 'iu-004', 'id-004', 'SchoolCafe', d(4, 10, 0)),
  ev('DATE_RANGE_CHANGED',        's-008', 'iu-004', 'id-004', 'SchoolCafe', d(4, 10, 2)),
  ev('KPI_DRAWER_OPENED',         's-008', 'iu-004', 'id-004', 'SchoolCafe', d(4, 10, 6),  { kpi: 'INV', isDistrictDrawer: true }),
  ev('KPI_SCHOOLIE_OPENED',       's-008', 'iu-004', 'id-004', 'SchoolCafe', d(4, 10, 10), { kpi: 'INV' }),
  ev('DASHBOARD_SCHOOLIE_OPENED', 's-008', 'iu-004', 'id-004', 'SchoolCafe', d(4, 10, 20)),

  // ── Session s-009: Linda Park, Greenfield, SC — d(2,16) ───────────────────
  ...rk('s-009', 'iu-005', 'id-001', 'SchoolCafe', d(2, 16, 0), ['SBD']),
  ev('INSIGHTS_PAGE_VIEWED', 's-009', 'iu-005', 'id-001', 'SchoolCafe', d(2, 16, 0)),
  ev('SITE_FILTER_CHANGED',  's-009', 'iu-005', 'id-001', 'SchoolCafe', d(2, 16, 3)),
  ev('KPI_DRAWER_OPENED',    's-009', 'iu-005', 'id-001', 'SchoolCafe', d(2, 16, 8),  { kpi: 'ENP', isDistrictDrawer: true }),
  ev('TREND_KPI_CHANGED',    's-009', 'iu-005', 'id-001', 'SchoolCafe', d(2, 16, 12), { kpi: 'ENP' }),

  // ── Session s-010: Linda Park, Greenfield — d(8,11) ───────────────────────
  ...rk('s-010', 'iu-005', 'id-001', 'SchoolCafe', d(8, 11, 0), ['ALC', 'TRD', 'SBD']),
  ev('INSIGHTS_PAGE_VIEWED',    's-010', 'iu-005', 'id-001', 'SchoolCafe', d(8, 11, 0)),
  ev('KPI_DRAWER_OPENED',       's-010', 'iu-005', 'id-001', 'SchoolCafe', d(8, 11, 5),  { kpi: 'MPLH', isDistrictDrawer: true }),
  ev('BENCHMARK_CONFIG_OPENED', 's-010', 'iu-005', 'id-001', 'SchoolCafe', d(8, 11, 10)),
  ev('BULK_UPDATE',             's-010', 'iu-005', 'id-001', 'SchoolCafe', d(8, 11, 14)),

  // ── Session s-011: David Kim, Riverside, PE — d(3,14) ─────────────────────
  ...rk('s-011', 'iu-006', 'id-002', 'PrimeroEdge', d(3, 14, 0), ['PRC']),
  ev('INSIGHTS_PAGE_VIEWED', 's-011', 'iu-006', 'id-002', 'PrimeroEdge', d(3, 14, 0)),
  ev('DATE_RANGE_CHANGED',   's-011', 'iu-006', 'id-002', 'PrimeroEdge', d(3, 14, 2)),
  ev('KPI_DRAWER_OPENED',    's-011', 'iu-006', 'id-002', 'PrimeroEdge', d(3, 14, 7),  { kpi: 'PNA', isDistrictDrawer: true }),
  ev('KPI_DRAWER_DOWNLOAD',  's-011', 'iu-006', 'id-002', 'PrimeroEdge', d(3, 14, 12), { kpi: 'PNA', format: 'PDF' }),

  // ── Session s-012: Maria Gonzalez, Maplewood, SC — d(1,15) ────────────────
  ...rk('s-012', 'iu-007', 'id-004', 'SchoolCafe', d(1, 15, 0), []),
  ev('INSIGHTS_PAGE_VIEWED', 's-012', 'iu-007', 'id-004', 'SchoolCafe', d(1, 15, 0)),
  ev('SITE_FILTER_CHANGED',  's-012', 'iu-007', 'id-004', 'SchoolCafe', d(1, 15, 2)),
  ev('DATE_RANGE_CHANGED',   's-012', 'iu-007', 'id-004', 'SchoolCafe', d(1, 15, 4)),
  ev('KPI_DRAWER_OPENED',    's-012', 'iu-007', 'id-004', 'SchoolCafe', d(1, 15, 9),  { kpi: 'INV', isDistrictDrawer: true }),
  ev('KPI_DRAWER_OPENED',    's-012', 'iu-007', 'id-004', 'SchoolCafe', d(1, 15, 14), { kpi: 'WST', isDistrictDrawer: true }),
  ev('TREND_KPI_CHANGED',    's-012', 'iu-007', 'id-004', 'SchoolCafe', d(1, 15, 18), { kpi: 'WST' }),
  ev('KPI_SCHOOLIE_OPENED',  's-012', 'iu-007', 'id-004', 'SchoolCafe', d(1, 15, 22), { kpi: 'WST' }),
  ev('KPI_DRAWER_DOWNLOAD',  's-012', 'iu-007', 'id-004', 'SchoolCafe', d(1, 15, 26), { kpi: 'WST', format: 'CSV' }),

  // ── Session s-013: Robert Hayes, Northside, PE — d(6,10) ──────────────────
  ...rk('s-013', 'iu-008', 'id-003', 'PrimeroEdge', d(6, 10, 0), ['LBR', 'BKF']),
  ev('INSIGHTS_PAGE_VIEWED', 's-013', 'iu-008', 'id-003', 'PrimeroEdge', d(6, 10, 0)),
  ev('KPI_DRAWER_OPENED',    's-013', 'iu-008', 'id-003', 'PrimeroEdge', d(6, 10, 5), { kpi: 'MPLH', isDistrictDrawer: true }),
  ev('TREND_KPI_CHANGED',    's-013', 'iu-008', 'id-003', 'PrimeroEdge', d(6, 10, 9), { kpi: 'MPLH' }),

  // ── Session s-014: Sarah Jenkins, Greenfield — d(10,9) ────────────────────
  ...rk('s-014', 'iu-001', 'id-001', 'SchoolCafe', d(10, 9, 0), ['TRD']),
  ev('INSIGHTS_PAGE_VIEWED', 's-014', 'iu-001', 'id-001', 'SchoolCafe', d(10, 9, 0)),
  ev('DATE_RANGE_CHANGED',   's-014', 'iu-001', 'id-001', 'SchoolCafe', d(10, 9, 2)),
  ev('KPI_DRAWER_OPENED',    's-014', 'iu-001', 'id-001', 'SchoolCafe', d(10, 9, 7),  { kpi: 'ENP', isDistrictDrawer: true }),
  ev('DASHBOARD_DOWNLOAD',   's-014', 'iu-001', 'id-001', 'SchoolCafe', d(10, 9, 15), { format: 'PDF' }),

  // ── Session s-015: James Wilson, Maplewood (page view only) ───────────────
  ...rk('s-015', 'iu-004', 'id-004', 'SchoolCafe', d(12, 8, 0), []),
  ev('INSIGHTS_PAGE_VIEWED', 's-015', 'iu-004', 'id-004', 'SchoolCafe', d(12, 8, 0)),

  // ── Session s-016: Sarah Jenkins, Greenfield — d(15,9) ────────────────────
  ...rk('s-016', 'iu-001', 'id-001', 'SchoolCafe', d(15, 9, 0), ['ALC', 'SBD']),
  ev('INSIGHTS_PAGE_VIEWED', 's-016', 'iu-001', 'id-001', 'SchoolCafe', d(15, 9, 0)),
  ev('SITE_FILTER_CHANGED',  's-016', 'iu-001', 'id-001', 'SchoolCafe', d(15, 9, 2)),
  ev('KPI_DRAWER_OPENED',    's-016', 'iu-001', 'id-001', 'SchoolCafe', d(15, 9, 6),  { kpi: 'REV', isDistrictDrawer: true }),
  ev('TREND_KPI_CHANGED',    's-016', 'iu-001', 'id-001', 'SchoolCafe', d(15, 9, 10), { kpi: 'REV' }),
  ev('KPI_DRAWER_DOWNLOAD',  's-016', 'iu-001', 'id-001', 'SchoolCafe', d(15, 9, 14), { kpi: 'REV', format: 'CSV' }),

  // ── Session s-017: Michael Chen, Riverside, SC — d(12,14) ─────────────────
  ...rk('s-017', 'iu-002', 'id-002', 'SchoolCafe', d(12, 14, 0), ['TRD', 'PRC']),
  ev('INSIGHTS_PAGE_VIEWED',  's-017', 'iu-002', 'id-002', 'SchoolCafe', d(12, 14, 0)),
  ev('SITE_FILTER_CHANGED',   's-017', 'iu-002', 'id-002', 'SchoolCafe', d(12, 14, 2)),
  ev('KPI_DRAWER_OPENED',     's-017', 'iu-002', 'id-002', 'SchoolCafe', d(12, 14, 7),  { kpi: 'LBR', isDistrictDrawer: true }),
  ev('KPI_DRAWER_OPENED',     's-017', 'iu-002', 'id-002', 'SchoolCafe', d(12, 14, 12), { kpi: 'BKF', isDistrictDrawer: true }),
  ev('KPI_SCHOOLIE_OPENED',   's-017', 'iu-002', 'id-002', 'SchoolCafe', d(12, 14, 16), { kpi: 'BKF' }),

  // ── Session s-018: Amanda Torres, Northside, PE — d(8,11) ─────────────────
  ...rk('s-018', 'iu-003', 'id-003', 'PrimeroEdge', d(8, 11, 0), ['REV', 'LNH']),
  ev('INSIGHTS_PAGE_VIEWED', 's-018', 'iu-003', 'id-003', 'PrimeroEdge', d(8, 11, 0)),
  ev('DATE_RANGE_CHANGED',   's-018', 'iu-003', 'id-003', 'PrimeroEdge', d(8, 11, 3)),
  ev('KPI_DRAWER_OPENED',    's-018', 'iu-003', 'id-003', 'PrimeroEdge', d(8, 11, 8),  { kpi: 'ALC', isDistrictDrawer: true }),
  ev('KPI_DRAWER_OPENED',    's-018', 'iu-003', 'id-003', 'PrimeroEdge', d(8, 11, 13), { kpi: 'SBD', isDistrictDrawer: true }),
  ev('TREND_KPI_CHANGED',    's-018', 'iu-003', 'id-003', 'PrimeroEdge', d(8, 11, 17), { kpi: 'SBD' }),

  // ── Session s-019: Linda Park, Greenfield, SC — d(6,16) ───────────────────
  ...rk('s-019', 'iu-005', 'id-001', 'SchoolCafe', d(6, 16, 0), ['BKF', 'SBD']),
  ev('INSIGHTS_PAGE_VIEWED', 's-019', 'iu-005', 'id-001', 'SchoolCafe', d(6, 16, 0)),
  ev('DATE_RANGE_CHANGED',   's-019', 'iu-005', 'id-001', 'SchoolCafe', d(6, 16, 2)),
  ev('KPI_DRAWER_OPENED',    's-019', 'iu-005', 'id-001', 'SchoolCafe', d(6, 16, 7),  { kpi: 'TRD', isDistrictDrawer: true }),
  ev('KPI_DRAWER_OPENED',    's-019', 'iu-005', 'id-001', 'SchoolCafe', d(6, 16, 12), { kpi: 'PRC', isDistrictDrawer: true }),
  ev('KPI_DRAWER_DOWNLOAD',  's-019', 'iu-005', 'id-001', 'SchoolCafe', d(6, 16, 16), { kpi: 'PRC', format: 'PDF' }),

  // ── Session s-020: David Kim, Riverside, PE — d(9,10) ─────────────────────
  ...rk('s-020', 'iu-006', 'id-002', 'PrimeroEdge', d(9, 10, 0), ['FCS', 'LBR']),
  ev('INSIGHTS_PAGE_VIEWED', 's-020', 'iu-006', 'id-002', 'PrimeroEdge', d(9, 10, 0)),
  ev('SITE_FILTER_CHANGED',  's-020', 'iu-006', 'id-002', 'PrimeroEdge', d(9, 10, 2)),
  ev('KPI_DRAWER_OPENED',    's-020', 'iu-006', 'id-002', 'PrimeroEdge', d(9, 10, 7),  { kpi: 'LNH', isDistrictDrawer: true }),
  ev('KPI_DRAWER_DOWNLOAD',  's-020', 'iu-006', 'id-002', 'PrimeroEdge', d(9, 10, 11), { kpi: 'LNH', format: 'CSV' }),
  ev('KPI_DRAWER_OPENED',    's-020', 'iu-006', 'id-002', 'PrimeroEdge', d(9, 10, 15), { kpi: 'ENP', isDistrictDrawer: true }),

  // ── Session s-021: Maria Gonzalez, Maplewood, SC — d(3,15) ────────────────
  ...rk('s-021', 'iu-007', 'id-004', 'SchoolCafe', d(3, 15, 0), []),
  ev('INSIGHTS_PAGE_VIEWED', 's-021', 'iu-007', 'id-004', 'SchoolCafe', d(3, 15, 0)),
  ev('DATE_RANGE_CHANGED',   's-021', 'iu-007', 'id-004', 'SchoolCafe', d(3, 15, 3)),
  ev('KPI_DRAWER_OPENED',    's-021', 'iu-007', 'id-004', 'SchoolCafe', d(3, 15, 8),  { kpi: 'INV', isDistrictDrawer: true }),
  ev('KPI_DRAWER_OPENED',    's-021', 'iu-007', 'id-004', 'SchoolCafe', d(3, 15, 13), { kpi: 'FVR', isDistrictDrawer: true }),
  ev('KPI_SCHOOLIE_OPENED',  's-021', 'iu-007', 'id-004', 'SchoolCafe', d(3, 15, 17), { kpi: 'FVR' }),

  // ── Session s-022: Robert Hayes, Northside, PE — d(14,8) ──────────────────
  ...rk('s-022', 'iu-008', 'id-003', 'PrimeroEdge', d(14, 8, 0), ['ALC', 'PRC']),
  ev('INSIGHTS_PAGE_VIEWED', 's-022', 'iu-008', 'id-003', 'PrimeroEdge', d(14, 8, 0)),
  ev('SITE_FILTER_CHANGED',  's-022', 'iu-008', 'id-003', 'PrimeroEdge', d(14, 8, 2)),
  ev('KPI_DRAWER_OPENED',    's-022', 'iu-008', 'id-003', 'PrimeroEdge', d(14, 8, 7), { kpi: 'BKF', isDistrictDrawer: true }),
  ev('TREND_KPI_CHANGED',    's-022', 'iu-008', 'id-003', 'PrimeroEdge', d(14, 8, 11), { kpi: 'BKF' }),

  // ── Session s-023: Sarah Jenkins, Greenfield — d(20,13) ───────────────────
  ...rk('s-023', 'iu-001', 'id-001', 'SchoolCafe', d(20, 13, 0), ['SBD', 'TRD']),
  ev('INSIGHTS_PAGE_VIEWED', 's-023', 'iu-001', 'id-001', 'SchoolCafe', d(20, 13, 0)),
  ev('DATE_RANGE_CHANGED',   's-023', 'iu-001', 'id-001', 'SchoolCafe', d(20, 13, 2)),
  ev('KPI_DRAWER_OPENED',    's-023', 'iu-001', 'id-001', 'SchoolCafe', d(20, 13, 7),  { kpi: 'FCS', isDistrictDrawer: true }),
  ev('KPI_DRAWER_OPENED',    's-023', 'iu-001', 'id-001', 'SchoolCafe', d(20, 13, 12), { kpi: 'LBR', isDistrictDrawer: true }),
  ev('KPI_DRAWER_DOWNLOAD',  's-023', 'iu-001', 'id-001', 'SchoolCafe', d(20, 13, 16), { kpi: 'FCS', format: 'CSV' }),

  // ── Session s-024: James Wilson, Maplewood, SC — d(18,9) ──────────────────
  ...rk('s-024', 'iu-004', 'id-004', 'SchoolCafe', d(18, 9, 0), []),
  ev('INSIGHTS_PAGE_VIEWED', 's-024', 'iu-004', 'id-004', 'SchoolCafe', d(18, 9, 0)),
  ev('SITE_FILTER_CHANGED',  's-024', 'iu-004', 'id-004', 'SchoolCafe', d(18, 9, 2)),
  ev('KPI_DRAWER_OPENED',    's-024', 'iu-004', 'id-004', 'SchoolCafe', d(18, 9, 7),  { kpi: 'WST', isDistrictDrawer: true }),
  ev('KPI_DRAWER_OPENED',    's-024', 'iu-004', 'id-004', 'SchoolCafe', d(18, 9, 12), { kpi: 'INV', isDistrictDrawer: true }),
  ev('KPI_DRAWER_DOWNLOAD',  's-024', 'iu-004', 'id-004', 'SchoolCafe', d(18, 9, 16), { kpi: 'WST', format: 'PDF' }),

  // ── Session s-025: Amanda Torres, Northside, PE — d(22,11) ────────────────
  ...rk('s-025', 'iu-003', 'id-003', 'PrimeroEdge', d(22, 11, 0), ['BKF', 'LNH']),
  ev('INSIGHTS_PAGE_VIEWED', 's-025', 'iu-003', 'id-003', 'PrimeroEdge', d(22, 11, 0)),
  ev('SITE_FILTER_CHANGED',  's-025', 'iu-003', 'id-003', 'PrimeroEdge', d(22, 11, 3)),
  ev('KPI_DRAWER_OPENED',    's-025', 'iu-003', 'id-003', 'PrimeroEdge', d(22, 11, 8),  { kpi: 'REV', isDistrictDrawer: true }),
  ev('TREND_KPI_CHANGED',    's-025', 'iu-003', 'id-003', 'PrimeroEdge', d(22, 11, 12), { kpi: 'REV' }),
];
