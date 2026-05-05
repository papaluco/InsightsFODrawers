import { ReportUsageEvent, ReportEventType, ReportEntryPoint } from '../types/reportUsageTypes';

export const REPORT_USER_NAMES: Record<string, string> = {
  'user-r01': 'Sarah Jenkins',
  'user-r02': 'Michael Chen',
  'user-r03': 'Amanda Torres',
  'user-r04': 'James Wilson',
  'user-r05': 'Rachel Kim',
  'user-r06': 'David Martinez',
  'user-r07': 'Lisa Park',
  'user-r08': 'Tom Bradley',
};

export const REPORT_DISTRICT_NAMES: Record<string, string> = {
  'district-r01': 'Katy ISD',
  'district-r02': 'Aldine ISD',
  'district-r03': 'Clear Creek ISD',
  'district-r04': 'Cypress-Fairbanks ISD',
  'district-r05': 'Spring ISD',
};

const SC_USERS = [
  { id: 'user-r01', districtId: 'district-r01', platform: 'SchoolCafe' as const },
  { id: 'user-r03', districtId: 'district-r03', platform: 'SchoolCafe' as const },
  { id: 'user-r05', districtId: 'district-r05', platform: 'SchoolCafe' as const },
  { id: 'user-r07', districtId: 'district-r02', platform: 'SchoolCafe' as const },
];

const PE_USERS = [
  { id: 'user-r02', districtId: 'district-r02', platform: 'PrimeroEdge' as const },
  { id: 'user-r04', districtId: 'district-r04', platform: 'PrimeroEdge' as const },
  { id: 'user-r06', districtId: 'district-r01', platform: 'PrimeroEdge' as const },
  { id: 'user-r08', districtId: 'district-r03', platform: 'PrimeroEdge' as const },
];

// SchoolCafe reports — uses real modules and data sources from reportDataSources.ts
const SC_REPORTS = [
  // Accountability — Custom (report name = normalized data source label)
  { id: 'acc-c1', name: 'Sale Rollup Data',           module: 'Accountability',     dataSource: 'Acc_SaleRollupData',                       reportType: 'Custom',   isDistributed: true,  isStarred: true,  weight: 14 },
  { id: 'acc-c2', name: 'Income Data',                 module: 'Accountability',     dataSource: 'Acc_IncomeData',                            reportType: 'Custom',   isDistributed: true,  isStarred: false, weight: 10 },
  { id: 'acc-c3', name: 'Online Payments',             module: 'Accountability',     dataSource: 'Online_Payments',                           reportType: 'Custom',   isDistributed: false, isStarred: true,  weight: 8  },
  { id: 'acc-c4', name: 'Debit Sales',                 module: 'Accountability',     dataSource: 'Debit_Sales',                               reportType: 'Custom',   isDistributed: false, isStarred: false, weight: 7  },
  { id: 'acc-c5', name: 'Revenue Sales',               module: 'Accountability',     dataSource: 'Revenue_Sales',                             reportType: 'Custom',   isDistributed: false, isStarred: false, weight: 6  },
  { id: 'acc-c6', name: 'ACH Deposits',                module: 'Accountability',     dataSource: 'ACH_Deposits',                              reportType: 'Custom',   isDistributed: false, isStarred: false, weight: 5  },
  // Accountability — PowerBI
  { id: 'acc-p1', name: 'Activity',                    module: 'Accountability',     dataSource: 'Activity',                                  reportType: 'PowerBI',  isDistributed: true,  isStarred: true,  weight: 12 },
  { id: 'acc-p2', name: 'Edit Check',                  module: 'Accountability',     dataSource: 'Edit Check',                                reportType: 'PowerBI',  isDistributed: false, isStarred: true,  weight: 9  },
  { id: 'acc-p3', name: 'Revenue',                     module: 'Accountability',     dataSource: 'Revenue',                                   reportType: 'PowerBI',  isDistributed: false, isStarred: false, weight: 7  },
  { id: 'acc-p4', name: 'Cash Collection',             module: 'Accountability',     dataSource: 'Cash Collection',                           reportType: 'PowerBI',  isDistributed: false, isStarred: false, weight: 6  },
  // Account Management — Custom
  { id: 'am-c1',  name: 'Student Data',                module: 'Account Management', dataSource: 'AcctMgt_StudentData',                       reportType: 'Custom',   isDistributed: true,  isStarred: true,  weight: 11 },
  { id: 'am-c2',  name: 'Student Eligibility for State', module: 'Account Management', dataSource: 'AcctMgt_StudentEligibilityDataForState', reportType: 'Custom',   isDistributed: true,  isStarred: false, weight: 8  },
  // Account Management — MVR
  { id: 'am-m1',  name: 'Sessions',                    module: 'Account Management', dataSource: 'Sessions',                                  reportType: 'MVR',      isDistributed: true,  isStarred: true,  weight: 13 },
  // Eligibility — Custom
  { id: 'elig-c1', name: 'Application Data',           module: 'Eligibility',        dataSource: 'Elig_ApplicationData',                      reportType: 'Custom',   isDistributed: true,  isStarred: true,  weight: 10 },
  { id: 'elig-c2', name: 'Surveys',                    module: 'Eligibility',        dataSource: 'Elig_Surveys',                              reportType: 'Custom',   isDistributed: false, isStarred: false, weight: 6  },
  { id: 'elig-c3', name: 'Direct Certification',       module: 'Eligibility',        dataSource: 'Elig_DirectCertification',                  reportType: 'Custom',   isDistributed: false, isStarred: true,  weight: 8  },
  // System — Custom (subset of available data sources)
  { id: 'sys-c1',  name: 'Users',                      module: 'System',             dataSource: 'Users',                                     reportType: 'Custom',   isDistributed: false, isStarred: false, weight: 5  },
  { id: 'sys-c2',  name: 'Sites',                      module: 'System',             dataSource: 'Sites',                                     reportType: 'Custom',   isDistributed: false, isStarred: false, weight: 4  },
  { id: 'sys-c3',  name: 'Price Types',                module: 'System',             dataSource: 'PriceTypes',                                reportType: 'Custom',   isDistributed: false, isStarred: false, weight: 3  },
  // Insights
  { id: 'ins-1',   name: 'MPLH Performance',           module: 'Insights',           dataSource: 'MPLH',                                      reportType: 'Insights', isDistributed: false, isStarred: true,  weight: 10 },
  { id: 'ins-2',   name: 'Participation Trends',       module: 'Insights',           dataSource: 'ENP',                                       reportType: 'Insights', isDistributed: false, isStarred: false, weight: 7  },
  // Download
  { id: 'dl-1',    name: 'Student Data Export',        module: 'Account Management', dataSource: 'AcctMgt_StudentData',                       reportType: 'Download', isDistributed: false, isStarred: false, weight: 4  },
  { id: 'dl-2',    name: 'Sale Rollup Export',         module: 'Accountability',     dataSource: 'Acc_SaleRollupData',                        reportType: 'Download', isDistributed: false, isStarred: false, weight: 3  },
];

// PrimeroEdge reports — all Distributed type, uses real modules
const PE_REPORTS = [
  { id: 'pe-1', name: 'Daily Meal Distribution', module: 'Production',      dataSource: 'MealDistribution', reportType: 'Distributed', isDistributed: true,  isStarred: true,  weight: 15 },
  { id: 'pe-2', name: 'Site Participation',      module: 'Menu Planning',   dataSource: 'Participation',    reportType: 'Distributed', isDistributed: true,  isStarred: false, weight: 10 },
  { id: 'pe-3', name: 'Monthly Revenue',         module: 'Financials',      dataSource: 'Finance',          reportType: 'Distributed', isDistributed: true,  isStarred: true,  weight: 8  },
  { id: 'pe-4', name: 'Executive Dashboard',     module: 'Accountability',  dataSource: 'Executive',        reportType: 'Distributed', isDistributed: true,  isStarred: true,  weight: 10 },
];

const ENTRY_POINTS: ReportEntryPoint[] = ['Starred', 'FullDirectory', 'Recent'];

const SC_EVENT_POOL: ReportEventType[] = [
  ...Array<ReportEventType>(40).fill('REPORT_VIEWED'),
  ...Array<ReportEventType>(25).fill('REPORT_RUN'),
  ...Array<ReportEventType>(15).fill('REPORT_DOWNLOADED'),
  ...Array<ReportEventType>(10).fill('REPORT_EMAILED'),
  ...Array<ReportEventType>(7).fill('REPORT_DISTRIBUTED'),
  ...Array<ReportEventType>(3).fill('REPORT_CONFIG_VIEWED'),
];

const PE_EVENT_POOL: ReportEventType[] = [
  ...Array<ReportEventType>(35).fill('REPORT_VIEWED'),
  ...Array<ReportEventType>(20).fill('REPORT_RUN'),
  ...Array<ReportEventType>(20).fill('REPORT_DISTRIBUTED'),
  ...Array<ReportEventType>(15).fill('REPORT_DOWNLOADED'),
  ...Array<ReportEventType>(10).fill('REPORT_EMAILED'),
];

function pickWeighted<T extends { weight: number }>(items: T[]): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let rand = Math.random() * total;
  for (const item of items) {
    rand -= item.weight;
    if (rand <= 0) return item;
  }
  return items[items.length - 1];
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysAgoMax = 90, daysAgoMin = 0): string {
  const now = Date.now();
  const minMs = daysAgoMin * 86400000;
  const maxMs = daysAgoMax * 86400000;
  return new Date(now - minMs - Math.random() * (maxMs - minMs)).toISOString();
}

function generateEvents(): ReportUsageEvent[] {
  const events: ReportUsageEvent[] = [];
  let idCounter = 1;

  for (let i = 0; i < 230; i++) {
    const user = pick(SC_USERS);
    const report = pickWeighted(SC_REPORTS);
    const eventType = pick(SC_EVENT_POOL);
    const entryPoint = pick(ENTRY_POINTS);

    const context: ReportUsageEvent['context'] = {
      reportId: report.id,
      reportName: report.name,
      reportType: report.reportType,
      module: report.module,
      dataSource: report.dataSource,
      entryPoint,
      isDistributed: report.isDistributed,
      isStarred: report.isStarred,
    };
    if (eventType === 'REPORT_DOWNLOADED') context.format = pick(['PDF', 'CSV', 'XLSX']);
    if (eventType === 'REPORT_DISTRIBUTED') context.distributionType = 'Manual';
    if (eventType === 'REPORT_EMAILED') context.recipientCount = pick([1, 2, 3, 4, 5]);

    events.push({ eventType, sessionId: `session-${(idCounter % 60) + 1}`, userId: user.id, districtId: user.districtId, platform: user.platform, application: 'InsightsWorkspace', page: 'Reports', timestamp: randomDate(90, 0), context });
    idCounter++;
  }

  for (let i = 0; i < 150; i++) {
    const user = pick(PE_USERS);
    const report = pickWeighted(PE_REPORTS);
    const eventType = pick(PE_EVENT_POOL);
    const entryPoint = pick(ENTRY_POINTS);

    const context: ReportUsageEvent['context'] = {
      reportId: report.id,
      reportName: report.name,
      reportType: report.reportType,
      module: report.module,
      dataSource: report.dataSource,
      entryPoint,
      isDistributed: report.isDistributed,
      isStarred: report.isStarred,
    };
    if (eventType === 'REPORT_DOWNLOADED') context.format = pick(['PDF', 'CSV', 'XLSX']);
    if (eventType === 'REPORT_DISTRIBUTED') context.distributionType = 'Manual';
    if (eventType === 'REPORT_EMAILED') context.recipientCount = pick([1, 2, 3, 4, 5]);

    events.push({ eventType, sessionId: `session-${(idCounter % 60) + 1}`, userId: user.id, districtId: user.districtId, platform: user.platform, application: 'InsightsWorkspace', page: 'Reports', timestamp: randomDate(90, 0), context });
    idCounter++;
  }

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export const mockReportUsageEvents: ReportUsageEvent[] = generateEvents();
