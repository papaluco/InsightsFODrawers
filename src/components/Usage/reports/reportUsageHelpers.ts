import { ReportUsageEvent, ReportUsageFilters, ReportEventType } from '../../../types/reportUsageTypes';

export const EVENT_COLORS: Record<ReportEventType, string> = {
  REPORT_VIEWED:       '#6366f1',
  REPORT_RUN:          '#10b981',
  REPORT_DOWNLOADED:   '#f59e0b',
  REPORT_EMAILED:      '#3b82f6',
  REPORT_DISTRIBUTED:  '#8b5cf6',
  REPORT_CONFIG_VIEWED:'#94a3b8',
};

export const EVENT_LABELS: Record<ReportEventType, string> = {
  REPORT_VIEWED:       'Viewed',
  REPORT_RUN:          'Run',
  REPORT_DOWNLOADED:   'Downloaded',
  REPORT_EMAILED:      'Emailed',
  REPORT_DISTRIBUTED:  'Distributed',
  REPORT_CONFIG_VIEWED:'Config Viewed',
};

export const CHART_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6',
  '#ef4444', '#ec4899', '#14b8a6', '#f97316', '#84cc16',
];

export function pct(a: number, b: number): string {
  if (b === 0) return '0%';
  return `${Math.round((a / b) * 100)}%`;
}

export function fmtDate(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function fmtRelative(iso: string): string {
  if (!iso) return '—';
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function applyReportFilters(events: ReportUsageEvent[], filters: ReportUsageFilters): ReportUsageEvent[] {
  return events.filter(e => {
    if (filters.startDate && e.timestamp.slice(0, 10) < filters.startDate) return false;
    if (filters.endDate && e.timestamp.slice(0, 10) > filters.endDate) return false;
    if (filters.platform && e.platform !== filters.platform) return false;
    if (filters.district && e.districtId !== filters.district) return false;
    if (filters.userId && e.userId !== filters.userId) return false;
    if (filters.reportName && e.context.reportName !== filters.reportName) return false;
    if (filters.reportType && e.context.reportType !== filters.reportType) return false;
    if (filters.module && e.context.module !== filters.module) return false;
    if (filters.dataSource && e.context.dataSource !== filters.dataSource) return false;
    if (filters.entryPoint && e.context.entryPoint !== filters.entryPoint) return false;
    if (filters.eventType && e.eventType !== filters.eventType) return false;
    return true;
  });
}

export function getUniques<T>(events: ReportUsageEvent[], getter: (e: ReportUsageEvent) => T): T[] {
  return [...new Set(events.map(getter))].filter(Boolean) as T[];
}
