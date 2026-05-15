import React, { useMemo, lazy, Suspense } from 'react';

import {
  AppUsageSummary,
  AppUserStatRow,
  AppDistrictStatRow,
  AppSessionStatRow,
  AppUsageEvent,
} from '../../../types/appUsageTypes';
import { PAGE_COLORS, ENTRY_POINT_COLORS, ENTRY_POINT_LABELS, CHART_COLORS } from '../common/usageHelpers';

const AppUsageOverviewKPICards = lazy(() => import('./AppUsageOverviewKPICards'));
const AppUsageOverviewChart = lazy(() => import('./AppUsageOverviewChart'));
const AppSessionFreqChart = lazy(() => import('./AppSessionFreqChart'));
const ReportsPieChart = lazy(() => import('../reports/ReportsPieChart'));

interface Props {
  summary: AppUsageSummary | null;
  filteredEvents: AppUsageEvent[];
  userStats: AppUserStatRow[];
  districtStats: AppDistrictStatRow[];
  sessionStats: AppSessionStatRow[];
  pageUsageData: { name: string; value: number }[];
  entryPointData: { name: string; value: number }[];
  onDrillToUsers: (title: string, users: AppUserStatRow[]) => void;
  onDrillToDistricts: (title: string, districts: AppDistrictStatRow[]) => void;
  onDrillToSessions: (title: string, sessions: AppSessionStatRow[]) => void;
  onOpenEventList: (events: AppUsageEvent[], title: string) => void;
}

const AppOverviewTab: React.FC<Props> = ({
  summary,
  filteredEvents,
  userStats,
  districtStats,
  sessionStats,
  pageUsageData,
  entryPointData,
  onDrillToUsers,
  onDrillToDistricts,
  onDrillToSessions,
  onOpenEventList,
}) => {
  const pageUsageColors = pageUsageData.map(d => PAGE_COLORS[d.name] ?? CHART_COLORS[0]);

  const entryPointColors = entryPointData.map(d => {
    const key = Object.entries(ENTRY_POINT_LABELS).find(([, v]) => v === d.name)?.[0];
    return key ? (ENTRY_POINT_COLORS[key] ?? CHART_COLORS[0]) : CHART_COLORS[0];
  });

  const platformData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of filteredEvents) {
      const platform = e.platform || 'Unknown';
      counts.set(platform, (counts.get(platform) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredEvents]);

  const platformColors = platformData.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);

  const drillByPage = (pageName: string) =>
    onOpenEventList(filteredEvents.filter(e => e.page === pageName), `Events — ${pageName}`);

  const drillByEntryPoint = (label: string) => {
    const key = Object.entries(ENTRY_POINT_LABELS).find(([, v]) => v === label)?.[0];
    if (!key) return;
    onOpenEventList(filteredEvents.filter(e => e.context.entryPoint === key), `Entry Point — ${label}`);
  };

  const drillByPlatform = (platformName: string) =>
    onOpenEventList(filteredEvents.filter(e => e.platform === platformName), `Events — Platform: ${platformName}`);

  return (
    <div className="space-y-5">
      <Suspense fallback={<div className="h-32 animate-pulse bg-white rounded-xl border border-gray-100" />}>
        {summary && (
          <AppUsageOverviewKPICards
            summary={summary}
            onActiveUsersClick={() => onDrillToUsers('Active Users', userStats)}
            onActiveDistrictsClick={() => onDrillToDistricts('Active Districts', districtStats.filter(d => !d.hasNoActivity))}
            onSessionsClick={() => onDrillToSessions('Sessions', sessionStats)}
            onNewUsersClick={() => onDrillToUsers('New Users', userStats)}
          />
        )}
      </Suspense>

      <Suspense fallback={<div className="h-64 animate-pulse bg-gray-50 rounded-xl" />}>
        <AppUsageOverviewChart events={filteredEvents} />
      </Suspense>

      <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-3 gap-5 h-64 animate-pulse bg-gray-50 rounded-xl" />}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <ReportsPieChart
          data={pageUsageData}
          title="Page Usage Breakdown"
          colors={pageUsageColors}
          onSegmentClick={drillByPage}
          emptyMessage="No page view data available"
        />
        <ReportsPieChart
          data={entryPointData}
          title="Entry Point Breakdown"
          colors={entryPointColors}
          onSegmentClick={drillByEntryPoint}
          emptyMessage="No entry point data available"
        />
        <ReportsPieChart
          data={platformData}
          title="Platform Breakdown"
          colors={platformColors}
          onSegmentClick={drillByPlatform}
            emptyMessage="No platform data available"
          />
        </div>
      </Suspense>

      <Suspense fallback={<div className="h-64 animate-pulse bg-gray-50 rounded-xl" />}>
        <AppSessionFreqChart events={filteredEvents} />
      </Suspense>
    </div>
  );
};

export default AppOverviewTab;
