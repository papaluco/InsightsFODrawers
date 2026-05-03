import { FeedbackRecord } from '../../../types/schoolieFeedbackTypes';

export interface DashboardFilters {
  promptType: string;
  promptName: string;
  startDate: string;
  endDate: string;
  platform: string;
  district: string;
}

export const DEFAULT_FILTERS: DashboardFilters = {
  promptType: '',
  promptName: '',
  startDate: '',
  endDate: '',
  platform: '',
  district: '',
};

export const SOURCE_DISPLAY: Record<string, string> = {
  Workspace: 'Workspace',
  Dashboard: 'Dashboard',
  KpiDrawer: 'KPI Drawer',
  CompareSites: 'Compare Sites',
  TrendAnalysis: 'Trend Analysis',
};

export const KPI_DISPLAY: Record<string, string> = {
  MPLH: 'MPLH',
  ENP: 'ENP',
  BREAKFAST: 'Breakfast',
  LUNCH: 'Lunch',
  SNACK: 'Snack',
  SUPPER: 'Supper',
  REVENUE: 'Revenue',
  WASTE: 'Waste',
  MEALS: 'Meals',
  MEAL_EQUIVALENTS: 'MEQs',
  ECON_DISADVANTAGED: 'Eco Dis',
  PAID_NOT_APPLIED: 'PNA',
  INV_VALUE: 'Inv. Value',
  INV_TURNOVER: 'Inv. Turnover',
  PHYS_INV_DISCREPANCY: 'Inv. Discrepancy',
};

export const REASON_DISPLAY: Record<string, string> = {
  too_vague: 'Too Vague',
  not_useful: 'Not Useful',
  incorrect_data: 'Incorrect Data',
  missing_recommendation: 'Missing Recommendation',
  hard_to_understand: 'Hard to Understand',
  other: 'Other',
};

export const PIE_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#3b82f6', '#ec4899', '#14b8a6', '#f97316', '#84cc16',
];

export function getPromptName(record: FeedbackRecord): string {
  if (record.kpiIdentifier) {
    return KPI_DISPLAY[record.kpiIdentifier] ?? record.kpiIdentifier;
  }
  return SOURCE_DISPLAY[record.sourceEntryPoint] ?? record.sourceEntryPoint;
}

export function getPromptTypeDisplay(ep: string): string {
  return SOURCE_DISPLAY[ep] ?? ep;
}

export function getReasonDisplay(code: string): string {
  return REASON_DISPLAY[code] ?? code;
}

export function pct(a: number, b: number): string {
  if (b === 0) return '0%';
  return `${Math.round((a / b) * 100)}%`;
}

export function applyFilters(records: FeedbackRecord[], filters: DashboardFilters): FeedbackRecord[] {
  return records.filter(r => {
    if (filters.promptType && r.sourceEntryPoint !== filters.promptType) return false;
    if (filters.promptName && getPromptName(r) !== filters.promptName) return false;
    if (filters.platform && r.platform !== filters.platform) return false;
    if (filters.district && r.districtId !== filters.district) return false;
    if (filters.startDate && r.createdAt.slice(0, 10) < filters.startDate) return false;
    if (filters.endDate && r.createdAt.slice(0, 10) > filters.endDate) return false;
    return true;
  });
}
