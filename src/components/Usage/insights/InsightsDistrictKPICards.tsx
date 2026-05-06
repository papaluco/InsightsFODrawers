import React, { useMemo, useState } from 'react';
import { Building2, Users, Layers, Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { InsightsDistrictStatRow } from '../../../types/insightsUsageTypes';
import FeedbackKPICard from '../feedback/FeedbackKPICard';

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

function avg(total: number, count: number): string {
  if (count === 0) return '—';
  return (total / count).toFixed(1);
}

interface Props {
  data: InsightsDistrictStatRow[];
  totalDistricts: number;
}

const InsightsDistrictKPICards: React.FC<Props> = ({ data, totalDistricts }) => {
  const [expanded, setExpanded] = useState(true);

  const metrics = useMemo(() => {
    const withActivity = data.length;
    const noActivity = Math.max(0, totalDistricts - withActivity);
    const totalUsers = data.reduce((sum, d) => sum + d.activeUsers, 0);
    const totalSessions = data.reduce((sum, d) => sum + d.sessions, 0);
    const totalInteractions = data.reduce((sum, d) => sum + d.interactions, 0);
    return { withActivity, noActivity, totalUsers, totalSessions, totalInteractions };
  }, [data, totalDistricts]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-700">District Summary</span>
        <CollapseChevron expanded={expanded} />
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            <FeedbackKPICard
              label="Active Districts"
              value={totalDistricts.toLocaleString()}
              icon={<Building2 size={20} />}
              colorClass="bg-cyan-50 text-cyan-600"
            />
            <FeedbackKPICard
              label="Avg Users / District"
              value={avg(metrics.totalUsers, data.length)}
              icon={<Users size={20} />}
              colorClass="bg-pink-50 text-pink-600"
            />
            <FeedbackKPICard
              label="Avg Sessions / District"
              value={avg(metrics.totalSessions, data.length)}
              icon={<Layers size={20} />}
              colorClass="bg-indigo-50 text-indigo-600"
            />
            <FeedbackKPICard
              label="Avg Interactions / District"
              value={avg(metrics.totalInteractions, data.length)}
              icon={<Activity size={20} />}
              colorClass="bg-violet-50 text-violet-600"
            />
            <FeedbackKPICard
              label="Districts with Activity"
              value={metrics.withActivity.toLocaleString()}
              icon={<CheckCircle2 size={20} />}
              colorClass="bg-emerald-50 text-emerald-600"
            />
            <FeedbackKPICard
              label="Districts No Activity"
              value={metrics.noActivity.toLocaleString()}
              icon={<AlertCircle size={20} />}
              colorClass="bg-rose-50 text-rose-600"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(InsightsDistrictKPICards);
