import React, { useEffect, useRef, useState } from 'react';
import { SchoolieUsageFilters } from '../../../types/schoolieUsageTypes';
import { getSchoolieUsageSummary } from '../../../services/schoolieUsageService';
import SchoolieOverviewTab from './SchoolieOverviewTab';
import SchoolieAdoptionTab from './SchoolieAdoptionTab';
import SchoolieEngagementTab from './SchoolieEngagementTab';
import ScholieSatisfactionTab from './ScholieSatisfactionTab';
import SchoolieOperationalHealthTab from './SchoolieOperationalHealthTab';

type Tab = 'overview' | 'adoption' | 'engagement' | 'satisfaction' | 'operational' | string;

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview',     label: 'Overview' },
  { id: 'adoption',     label: 'Adoption' },
  { id: 'engagement',   label: 'Engagement' },
  { id: 'satisfaction', label: 'Satisfaction' },
  { id: 'operational',  label: 'Operational Health' },
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
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex border-b border-gray-200 px-2 pt-1 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 text-sm font-semibold transition-colors -mb-px whitespace-nowrap ${
                tab === t.id
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tab === 'overview' && <SchoolieOverviewTab filters={filters} onTabChange={setTab} />}
      {tab === 'adoption' && <SchoolieAdoptionTab filters={filters} onTabChange={setTab} />}
      {tab === 'engagement' && <SchoolieEngagementTab filters={filters} onTabChange={setTab} />}
      {tab === 'satisfaction' && <ScholieSatisfactionTab filters={filters} onTabChange={setTab} />}
      {tab === 'operational' && <SchoolieOperationalHealthTab filters={filters} onTabChange={setTab} />}
    </div>
  );
};

export default SchoolieUsageDashboard;
