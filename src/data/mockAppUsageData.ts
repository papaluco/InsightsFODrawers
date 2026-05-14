import { AppUsageEvent, AppEventType, AppPage, AppEntryPoint } from '../types/appUsageTypes';
import { MOCK_CURRENT_USER } from './mockCurrentUser';

export const APP_USER_NAMES: Record<string, string> = {
  [MOCK_CURRENT_USER.userId]: MOCK_CURRENT_USER.userName,
  'user-a01': 'Hannah Green',
  'user-a02': 'Marcus Rivera',
  'user-a03': 'Priya Patel',
  'user-a04': 'James Thornton',
  'user-a05': 'Sofia Nguyen',
  'user-a06': 'Derek Mills',
  'user-a07': 'Layla Brooks',
  'user-a08': 'Ethan Clarke',
  'user-a09': 'Mia Sanchez',
  'user-a10': 'Noah Kim',
  'user-a11': 'Chloe Watson',
  'user-a12': 'Liam Foster',
  'user-a13': 'Amara Johnson',
  'user-a14': 'Tyler Reed',
  'user-a15': 'Grace Chen',
  'user-a16': 'Jordan Mitchell',
  'user-a17': 'Emma Davis',
  'user-a18': 'Carlos Hernandez',
};

export const APP_DISTRICT_NAMES: Record<string, string> = {
  [MOCK_CURRENT_USER.districtId]: MOCK_CURRENT_USER.districtName,
  'district-a01': 'Mercer County USD',
  'district-a02': 'Lakewood ISD',
  'district-a03': 'Sunrise Valley USD',
  'district-a04': 'Northside ISD',
  'district-a05': 'Cedar Ridge USD',
  'district-a06': 'Bayshore ISD',
};

export const APP_DISTRICT_TIMEZONES: Record<string, string> = {
  [MOCK_CURRENT_USER.districtId]: 'America/Chicago',
  'district-a01': 'America/New_York',
  'district-a02': 'America/Chicago',
  'district-a03': 'America/Los_Angeles',
  'district-a04': 'America/Denver',
  'district-a05': 'America/Chicago',
  'district-a06': 'America/New_York',
};

export const APP_USER_FIRST_SEEN: Record<string, string> = {
  [MOCK_CURRENT_USER.userId]: '2026-01-05',
  'user-a01': '2026-01-10',
  'user-a02': '2026-01-15',
  'user-a03': '2026-01-22',
  'user-a04': '2026-02-01',
  'user-a05': '2026-02-05',
  'user-a06': '2026-02-10',
  'user-a07': '2026-02-18',
  'user-a08': '2026-02-25',
  'user-a09': '2026-03-01',
  'user-a10': '2026-03-08',
  'user-a11': '2026-03-15',
  'user-a12': '2026-03-20',
  'user-a13': '2026-03-25',
  'user-a14': '2026-03-28',
  'user-a15': '2026-04-01',
  'user-a16': '2026-04-05',
  'user-a17': '2026-04-25',
  'user-a18': '2026-04-28',
};

const USERS: { id: string; districtId: string; platform: 'SchoolCafe' | 'PrimeroEdge' }[] = [
  { id: 'user-a01', districtId: 'district-a01', platform: 'SchoolCafe' },
  { id: 'user-a02', districtId: 'district-a02', platform: 'SchoolCafe' },
  { id: 'user-a03', districtId: 'district-a03', platform: 'SchoolCafe' },
  { id: 'user-a04', districtId: 'district-a04', platform: 'SchoolCafe' },
  { id: 'user-a05', districtId: 'district-a01', platform: 'SchoolCafe' },
  { id: 'user-a06', districtId: 'district-a02', platform: 'SchoolCafe' },
  { id: 'user-a07', districtId: 'district-a05', platform: 'SchoolCafe' },
  { id: 'user-a08', districtId: 'district-a06', platform: 'SchoolCafe' },
  { id: 'user-a09', districtId: 'district-a03', platform: 'PrimeroEdge' },
  { id: 'user-a10', districtId: 'district-a04', platform: 'PrimeroEdge' },
  { id: 'user-a11', districtId: 'district-a05', platform: 'PrimeroEdge' },
  { id: 'user-a12', districtId: 'district-a01', platform: 'PrimeroEdge' },
  { id: 'user-a13', districtId: 'district-a02', platform: 'PrimeroEdge' },
  { id: 'user-a14', districtId: 'district-a06', platform: 'PrimeroEdge' },
  { id: 'user-a15', districtId: 'district-a03', platform: 'PrimeroEdge' },
  { id: 'user-a16', districtId: 'district-a04', platform: 'PrimeroEdge' },
  { id: 'user-a17', districtId: 'district-a05', platform: 'SchoolCafe' },
  { id: 'user-a18', districtId: 'district-a06', platform: 'SchoolCafe' },
];

const KPI_NAMES = [
  'Meals Per Labor Hour', 'Earned vs Spent', 'Participation Rate',
  'Cost per Meal', 'Total Reimbursement', 'Net Revenue', 'Avg Meal Price',
];
const SITE_NAMES = ['Elementary Schools', 'Middle Schools', 'High Schools', 'All Sites', 'District Office'];
const REPORT_NAMES = ['MPLH Performance', 'Participation Trends', 'Daily Meal Distribution', 'Monthly Revenue', 'Student Eligibility'];
const REPORT_IDS = ['rpt-001', 'rpt-002', 'rpt-003', 'rpt-004', 'rpt-005'];

const ENTRY_POINT_TO_PAGE: Record<AppEntryPoint, AppPage> = {
  Workspace: 'Workspace',
  InsightsDirect: 'Insights',
  MenuAnalysisDirect: 'MenuAnalysis',
  ReportsDirect: 'Reports',
};

// Seeded deterministic RNG
function makeRng(seed: number) {
  let s = seed | 0;
  return function (): number {
    s = Math.imul(1664525, s) + 1013904223;
    return ((s >>> 0) / 4294967296);
  };
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function isoOffset(base: Date, offsetMinutes: number): string {
  return new Date(base.getTime() + offsetMinutes * 60000).toISOString();
}

// [userIdx, daysOffset (from 2026-04-07), hourOfDay, entryPoint, level, durationMins, hasAppClosed]
type SessionSpec = [number, number, number, AppEntryPoint, 'D' | 'S' | 'M' | 'H', number, boolean];

function buildSessionSpecs(): SessionSpec[] {
  const rng = makeRng(9001);
  const specs: SessionSpec[] = [];

  const profiles = [
    { ui: 0, count: 28, level: 'H' as const, avgDur: 20, closedPct: 0.75 },
    { ui: 1, count: 24, level: 'H' as const, avgDur: 18, closedPct: 0.70 },
    { ui: 2, count: 20, level: 'H' as const, avgDur: 22, closedPct: 0.80 },
    { ui: 3, count: 14, level: 'M' as const, avgDur: 14, closedPct: 0.65 },
    { ui: 4, count: 12, level: 'M' as const, avgDur: 12, closedPct: 0.60 },
    { ui: 5, count: 10, level: 'M' as const, avgDur: 11, closedPct: 0.55 },
    { ui: 6, count: 8,  level: 'S' as const, avgDur: 8,  closedPct: 0.50 },
    { ui: 7, count: 7,  level: 'S' as const, avgDur: 7,  closedPct: 0.45 },
    { ui: 8, count: 9,  level: 'M' as const, avgDur: 13, closedPct: 0.60 },
    { ui: 9, count: 7,  level: 'M' as const, avgDur: 10, closedPct: 0.55 },
    { ui: 10, count: 6, level: 'S' as const, avgDur: 9,  closedPct: 0.50 },
    { ui: 11, count: 5, level: 'S' as const, avgDur: 8,  closedPct: 0.45 },
    { ui: 12, count: 5, level: 'S' as const, avgDur: 7,  closedPct: 0.45 },
    { ui: 13, count: 3, level: 'D' as const, avgDur: 1,  closedPct: 0.30 },
    { ui: 14, count: 4, level: 'S' as const, avgDur: 6,  closedPct: 0.40 },
    { ui: 15, count: 2, level: 'D' as const, avgDur: 1,  closedPct: 0.25 },
    { ui: 16, count: 2, level: 'S' as const, avgDur: 7,  closedPct: 0.50 },
    { ui: 17, count: 2, level: 'S' as const, avgDur: 6,  closedPct: 0.50 },
  ];

  const ENTRY_POOL: AppEntryPoint[] = ['InsightsDirect', 'InsightsDirect', 'Workspace', 'ReportsDirect', 'MenuAnalysisDirect'];

  for (const p of profiles) {
    for (let i = 0; i < p.count; i++) {
      const daysOffset = Math.floor(rng() * 30);
      // Bias toward business hours (8-17)
      const hour = 8 + Math.floor(rng() * 9);
      const entry = pick(ENTRY_POOL, rng);
      const dur = Math.max(1, Math.round(p.avgDur * (0.5 + rng())));
      const hasClosed = rng() < p.closedPct;
      specs.push([p.ui, daysOffset, hour, entry, p.level, dur, hasClosed]);
    }
  }

  return specs;
}

function generateMockAppEvents(): AppUsageEvent[] {
  const rng = makeRng(7777);
  const events: AppUsageEvent[] = [];
  const specs = buildSessionSpecs();
  const BASE = new Date('2026-04-07T00:00:00Z');

  let sessionCounter = 1;

  for (const [ui, daysOff, hourOff, entryPoint, level, durationMin, hasAppClosed] of specs) {
    const user = USERS[ui];
    const sessionId = `session-a${String(sessionCounter++).padStart(3, '0')}`;
    const startDate = new Date(BASE.getTime() + daysOff * 86400000 + hourOff * 3600000 + Math.floor(rng() * 3600) * 1000);
    let t = 0; // minute offset from start

    const addEv = (eventType: AppEventType, page: AppPage, minOff: number, ctx: Record<string, string> = {}) => {
      events.push({
        eventType,
        sessionId,
        userId: user.id,
        districtId: user.districtId,
        platform: user.platform,
        page,
        timestamp: isoOffset(startDate, minOff),
        context: ctx,
      });
    };

    const entryPage = ENTRY_POINT_TO_PAGE[entryPoint];
    addEv('PAGE_VIEWED', entryPage, t, { entryPoint });
    t++;

    if (level === 'D') {
      // Drop-off: just one page view, short session
      if (hasAppClosed) addEv('APP_CLOSED', entryPage, Math.max(0.3, rng() * 0.7));
      continue;
    }

    // Additional pages and interactions
    const pages: AppPage[] = [entryPage];

    function addInsightsInteractions(countMin: number, countMax: number) {
      const count = countMin + Math.floor(rng() * (countMax - countMin + 1));
      for (let k = 0; k < count; k++) {
        t += Math.floor(rng() * 2) + 1;
        const roll = rng();
        const kpi = pick(KPI_NAMES, rng);
        const site = pick(SITE_NAMES, rng);
        if (roll < 0.28) {
          addEv('KPI_DRAWER_OPENED', 'Insights', t, { kpi, drawerType: rng() > 0.5 ? 'District' : 'Site' });
          if (rng() < 0.35) { t++; addEv('KPI_DRAWER_DOWNLOAD', 'Insights', t, { kpi, format: 'PDF' }); }
          if (rng() < 0.25) { t++; addEv('KPI_SCHOOLIE_OPENED', 'Insights', t, { kpi }); }
        } else if (roll < 0.50) {
          addEv('SITE_FILTER_CHANGED', 'Insights', t, { site });
        } else if (roll < 0.65) {
          addEv('DATE_RANGE_CHANGED', 'Insights', t, {});
        } else if (roll < 0.75) {
          addEv('TREND_KPI_SELECTED', 'Insights', t, { kpi });
        } else if (roll < 0.83) {
          addEv('DASHBOARD_DOWNLOAD_TRIGGERED', 'Insights', t, { format: 'PDF' });
        } else if (roll < 0.90) {
          addEv('DASHBOARD_SCHOOLIE_OPENED', 'Insights', t, {});
        } else if (roll < 0.95) {
          addEv('BENCHMARK_CONFIG_OPENED', 'Insights', t, { kpi });
        } else {
          addEv('KPI_LAYOUT_UPDATED', 'Insights', t, {});
        }
      }
    }

    function addReportsInteractions(countMin: number, countMax: number) {
      const count = countMin + Math.floor(rng() * (countMax - countMin + 1));
      for (let k = 0; k < count; k++) {
        t += Math.floor(rng() * 2) + 1;
        const roll = rng();
        const rptIdx = Math.floor(rng() * REPORT_NAMES.length);
        const ctx = { reportId: REPORT_IDS[rptIdx], reportName: REPORT_NAMES[rptIdx] };
        if (roll < 0.30) {
          addEv('REPORT_VIEWED', 'Reports', t, ctx);
        } else if (roll < 0.55) {
          addEv('REPORT_RUN', 'Reports', t, ctx);
        } else if (roll < 0.70) {
          addEv('REPORT_DOWNLOADED', 'Reports', t, { ...ctx, format: rng() > 0.5 ? 'PDF' : 'Excel' });
        } else if (roll < 0.80) {
          addEv('REPORT_CONFIG_VIEWED', 'Reports', t, ctx);
        } else if (roll < 0.90) {
          addEv('REPORT_EMAILED', 'Reports', t, ctx);
        } else {
          addEv('REPORT_DISTRIBUTED', 'Reports', t, ctx);
        }
      }
    }

    // Interactions on entry page
    if (entryPage === 'Insights') {
      if (level === 'S') addInsightsInteractions(1, 3);
      else if (level === 'M') addInsightsInteractions(2, 5);
      else addInsightsInteractions(4, 8);
    } else if (entryPage === 'Reports') {
      if (level === 'S') addReportsInteractions(1, 3);
      else if (level === 'M') addReportsInteractions(2, 4);
      else addReportsInteractions(3, 6);
    }

    // Navigate to additional pages
    const navRoll = rng();
    if ((level === 'M' || level === 'H') && navRoll > 0.3 && !pages.includes('Insights') && t < durationMin - 3) {
      t += Math.floor(rng() * 3) + 1;
      addEv('PAGE_VIEWED', 'Insights', t, {});
      pages.push('Insights');
      if (level === 'M') addInsightsInteractions(1, 3);
      else addInsightsInteractions(2, 5);
    }

    if (level === 'H' && rng() > 0.4 && !pages.includes('Reports') && t < durationMin - 3) {
      t += Math.floor(rng() * 3) + 1;
      addEv('PAGE_VIEWED', 'Reports', t, {});
      pages.push('Reports');
      addReportsInteractions(1, 3);
    }

    if ((level === 'M' || level === 'H') && rng() > 0.7 && !pages.includes('MenuAnalysis') && t < durationMin - 2) {
      t += Math.floor(rng() * 2) + 1;
      addEv('PAGE_VIEWED', 'MenuAnalysis', t, {});
      pages.push('MenuAnalysis');
    }

    if (rng() > 0.6 && !pages.includes('Workspace') && entryPage !== 'Workspace' && t < durationMin - 2) {
      t += Math.floor(rng() * 2) + 1;
      addEv('PAGE_VIEWED', 'Workspace', t, {});
    }

    if (hasAppClosed) {
      const closeTime = Math.max(t + 1, durationMin);
      addEv('APP_CLOSED', entryPage, closeTime, {});
    }
  }

  return events;
}

const generatedAppEvents = generateMockAppEvents();

// Demo-user sessions — ensures drill-through from Schoolie dashboard returns results.
const demoAppEvents: AppUsageEvent[] = [
  // Session demo-app-001: Insights power session (2 days ago)
  { eventType: 'PAGE_VIEWED',            sessionId: 'demo-app-001', userId: MOCK_CURRENT_USER.userId, districtId: MOCK_CURRENT_USER.districtId, platform: MOCK_CURRENT_USER.platform, page: 'Insights',     timestamp: '2026-05-12T09:00:00.000Z', context: { entryPoint: 'InsightsDirect' } },
  { eventType: 'KPI_DRAWER_OPENED',      sessionId: 'demo-app-001', userId: MOCK_CURRENT_USER.userId, districtId: MOCK_CURRENT_USER.districtId, platform: MOCK_CURRENT_USER.platform, page: 'Insights',     timestamp: '2026-05-12T09:03:00.000Z', context: { kpi: 'MPLH', drawerType: 'District' } },
  { eventType: 'KPI_SCHOOLIE_OPENED',    sessionId: 'demo-app-001', userId: MOCK_CURRENT_USER.userId, districtId: MOCK_CURRENT_USER.districtId, platform: MOCK_CURRENT_USER.platform, page: 'Insights',     timestamp: '2026-05-12T09:05:00.000Z', context: { kpi: 'MPLH' } },
  { eventType: 'KPI_DRAWER_OPENED',      sessionId: 'demo-app-001', userId: MOCK_CURRENT_USER.userId, districtId: MOCK_CURRENT_USER.districtId, platform: MOCK_CURRENT_USER.platform, page: 'Insights',     timestamp: '2026-05-12T09:10:00.000Z', context: { kpi: 'PNA',  drawerType: 'District' } },
  { eventType: 'KPI_SCHOOLIE_OPENED',    sessionId: 'demo-app-001', userId: MOCK_CURRENT_USER.userId, districtId: MOCK_CURRENT_USER.districtId, platform: MOCK_CURRENT_USER.platform, page: 'Insights',     timestamp: '2026-05-12T09:12:00.000Z', context: { kpi: 'PNA' } },
  { eventType: 'DASHBOARD_SCHOOLIE_OPENED', sessionId: 'demo-app-001', userId: MOCK_CURRENT_USER.userId, districtId: MOCK_CURRENT_USER.districtId, platform: MOCK_CURRENT_USER.platform, page: 'Insights', timestamp: '2026-05-12T09:18:00.000Z', context: {} },
  { eventType: 'PAGE_VIEWED',            sessionId: 'demo-app-001', userId: MOCK_CURRENT_USER.userId, districtId: MOCK_CURRENT_USER.districtId, platform: MOCK_CURRENT_USER.platform, page: 'Reports',     timestamp: '2026-05-12T09:22:00.000Z', context: {} },
  { eventType: 'REPORT_VIEWED',          sessionId: 'demo-app-001', userId: MOCK_CURRENT_USER.userId, districtId: MOCK_CURRENT_USER.districtId, platform: MOCK_CURRENT_USER.platform, page: 'Reports',     timestamp: '2026-05-12T09:24:00.000Z', context: { reportId: 'rpt-001', reportName: 'MPLH Performance' } },
  { eventType: 'APP_CLOSED',             sessionId: 'demo-app-001', userId: MOCK_CURRENT_USER.userId, districtId: MOCK_CURRENT_USER.districtId, platform: MOCK_CURRENT_USER.platform, page: 'Reports',     timestamp: '2026-05-12T09:30:00.000Z', context: {} },

  // Session demo-app-002: Menu Analysis + Reports (5 days ago)
  { eventType: 'PAGE_VIEWED',            sessionId: 'demo-app-002', userId: MOCK_CURRENT_USER.userId, districtId: MOCK_CURRENT_USER.districtId, platform: MOCK_CURRENT_USER.platform, page: 'Workspace',   timestamp: '2026-05-09T10:00:00.000Z', context: { entryPoint: 'Workspace' } },
  { eventType: 'PAGE_VIEWED',            sessionId: 'demo-app-002', userId: MOCK_CURRENT_USER.userId, districtId: MOCK_CURRENT_USER.districtId, platform: MOCK_CURRENT_USER.platform, page: 'MenuAnalysis', timestamp: '2026-05-09T10:05:00.000Z', context: {} },
  { eventType: 'PAGE_VIEWED',            sessionId: 'demo-app-002', userId: MOCK_CURRENT_USER.userId, districtId: MOCK_CURRENT_USER.districtId, platform: MOCK_CURRENT_USER.platform, page: 'Reports',     timestamp: '2026-05-09T10:12:00.000Z', context: {} },
  { eventType: 'REPORT_RUN',             sessionId: 'demo-app-002', userId: MOCK_CURRENT_USER.userId, districtId: MOCK_CURRENT_USER.districtId, platform: MOCK_CURRENT_USER.platform, page: 'Reports',     timestamp: '2026-05-09T10:14:00.000Z', context: { reportId: 'rpt-002', reportName: 'Participation Trends' } },
  { eventType: 'APP_CLOSED',             sessionId: 'demo-app-002', userId: MOCK_CURRENT_USER.userId, districtId: MOCK_CURRENT_USER.districtId, platform: MOCK_CURRENT_USER.platform, page: 'Reports',     timestamp: '2026-05-09T10:22:00.000Z', context: {} },

  // Session demo-app-003: Insights-only quick check (10 days ago)
  { eventType: 'PAGE_VIEWED',            sessionId: 'demo-app-003', userId: MOCK_CURRENT_USER.userId, districtId: MOCK_CURRENT_USER.districtId, platform: MOCK_CURRENT_USER.platform, page: 'Insights',     timestamp: '2026-05-04T08:30:00.000Z', context: { entryPoint: 'InsightsDirect' } },
  { eventType: 'KPI_DRAWER_OPENED',      sessionId: 'demo-app-003', userId: MOCK_CURRENT_USER.userId, districtId: MOCK_CURRENT_USER.districtId, platform: MOCK_CURRENT_USER.platform, page: 'Insights',     timestamp: '2026-05-04T08:33:00.000Z', context: { kpi: 'ENP', drawerType: 'District' } },
  { eventType: 'KPI_SCHOOLIE_OPENED',    sessionId: 'demo-app-003', userId: MOCK_CURRENT_USER.userId, districtId: MOCK_CURRENT_USER.districtId, platform: MOCK_CURRENT_USER.platform, page: 'Insights',     timestamp: '2026-05-04T08:35:00.000Z', context: { kpi: 'ENP' } },
  { eventType: 'DATE_RANGE_CHANGED',     sessionId: 'demo-app-003', userId: MOCK_CURRENT_USER.userId, districtId: MOCK_CURRENT_USER.districtId, platform: MOCK_CURRENT_USER.platform, page: 'Insights',     timestamp: '2026-05-04T08:40:00.000Z', context: {} },
];

export const mockAppUsageEvents: AppUsageEvent[] = [...generatedAppEvents, ...demoAppEvents];
