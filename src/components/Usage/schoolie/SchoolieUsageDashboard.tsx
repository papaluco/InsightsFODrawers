import React, { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { SchoolieUsageFilters } from '../../../types/schoolieUsageTypes';
import { getSchoolieUsageSummary } from '../../../services/schoolieUsageService';
import { TAB_COLORS } from '../common/usageHelpers';

const SchoolieOverviewTab = lazy(() => import('./SchoolieOverviewTab'));
const SchoolieEngagementTab = lazy(() => import('./SchoolieEngagementTab'));
const SchoolieAdoptionTab = lazy(() => import('./ScholieSatisfactionTab'));
const ScholieSatisfactionTab = lazy(() => import('./ScholieSatisfactionTab'));
const SchoolieOperationalHealthTab = lazy(() => import('./SchoolieOperationalHealthTab'));

type Tab = 'overview' | 'adoption' | 'engagement' | 'satisfaction' | 'operational' | string;

const TABS: { id: Tab; label: string; color: string }[] = [
  { id: 'overview',     label: 'Overview',          color: TAB_COLORS.Overview },
  { id: 'adoption',     label: 'Adoption',           color: TAB_COLORS.Users },
  { id: 'engagement',   label: 'Engagement',         color: TAB_COLORS.Interactions },
  { id: 'satisfaction', label: 'Satisfaction',       color: TAB_COLORS.Sessions },
  { id: 'operational',  label: 'Operational Health', color: TAB_COLORS.Performance },
];

interface Props {
  filters: SchoolieUsageFilters;
  onDataUpdate?: (payload: Record<string, unknown>) => void;
  onTabChange?: (tab: string) => void;
}

const SchoolieUsageDashboard: React.FC<Props> = ({ filters, onDataUpdate, onTabChange }) => {
  const [tab, setTab] = useState<Tab>('overview');

  const onDataUpdateRef = useRef(onDataUpdate);
  onDataUpdateRef.current = onDataUpdate;

  const onTabChangeRef = useRef(onTabChange);
  onTabChangeRef.current = onTabChange;

  useEffect(() => {
    onTabChangeRef.current?.(tab);
  }, [tab]);

  useEffect(() => {
    getSchoolieUsageSummary(filters).then(summary => {
      onDataUpdateRef.current?.({
        totalRequests: summary.totalRequests,
        successRate: summary.successRate,
        activeUsers: summary.activeUsers,
        activeDistricts: summary.activeDistricts,
        totalEvents: summary.totalRequests,
      });
    });
  }, [filters]);

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex flex-wrap border-b border-gray-200">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-6 py-3 text-sm font-semibold transition-colors border-b-2 flex-1 sm:flex-none ${
                tab === t.id
                  ? 'bg-gray-50'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 border-transparent'
              }`}
              style={tab === t.id ? { color: t.color, borderColor: t.color } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <Suspense fallback={<div className="h-64 flex items-center justify-center animate-pulse text-purple-400">Loading Tab...</div>}>
        {/* Tab content */}
        {tab === 'overview' && <SchoolieOverviewTab filters={filters} onTabChange={setTab} />}
        {tab === 'adoption' && <SchoolieAdoptionTab filters={filters} onTabChange={setTab} />}
        {tab === 'engagement' && <SchoolieEngagementTab filters={filters} onTabChange={setTab} />}
        {tab === 'satisfaction' && <ScholieSatisfactionTab filters={filters} onTabChange={setTab} />}
        {tab === 'operational' && <SchoolieOperationalHealthTab filters={filters} onTabChange={setTab} />}
      </Suspense>
    </div>
  );
};

export default SchoolieUsageDashboard;
