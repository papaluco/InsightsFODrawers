/**
 * Filter options service for the Insights Usage dashboard.
 * Each function is async so it can be swapped for a real API call without changing callers.
 */
import { INSIGHTS_EVENT_FRIENDLY } from '../types/insightsUsageTypes';
import { KPI_SELECT_OPTIONS } from '../types/kpiTypes';
import {
  INSIGHTS_DISTRICT_NAMES,
  INSIGHTS_USER_NAMES,
  mockInsightsUsageEvents,
} from '../data/mockInsightsUsageData';

export interface FilterOption {
  value: string;
  label: string;
}

function uniq<T>(arr: T[]): T[] {
  return [...new Set(arr)].filter(Boolean).sort() as T[];
}

export async function getPlatformOptions(): Promise<FilterOption[]> {
  return [
    { value: 'SchoolCafe', label: 'SchoolCafe' },
    { value: 'PrimeroEdge', label: 'PrimeroEdge' },
  ];
}

export async function getDistrictOptions(platform?: string): Promise<FilterOption[]> {
  const events = platform
    ? mockInsightsUsageEvents.filter(e => e.platform === platform)
    : mockInsightsUsageEvents;
  const ids = uniq(events.map(e => e.districtId));
  return ids.map(id => ({ value: id, label: INSIGHTS_DISTRICT_NAMES[id] ?? id }));
}

export async function getUserOptions(
  platform?: string,
  districtIds?: string[]
): Promise<FilterOption[]> {
  let events = mockInsightsUsageEvents;
  if (platform) events = events.filter(e => e.platform === platform);
  if (districtIds?.length) events = events.filter(e => districtIds.includes(e.districtId));
  const ids = uniq(events.map(e => e.userId));
  return ids.map(id => ({ value: id, label: INSIGHTS_USER_NAMES[id] ?? id }));
}

export async function getKPIOptions(): Promise<FilterOption[]> {
  return KPI_SELECT_OPTIONS as FilterOption[];
}

export async function getEventTypeOptions(): Promise<FilterOption[]> {
  return (Object.entries(INSIGHTS_EVENT_FRIENDLY) as [string, string][]).map(
    ([value, label]) => ({ value, label })
  );
}
