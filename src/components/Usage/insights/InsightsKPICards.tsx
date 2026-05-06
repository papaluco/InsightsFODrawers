import React, { useState } from 'react';
import { Eye, Activity, Layers, TrendingUp, Bot, Download, Users, Building2 } from 'lucide-react';
import { InsightsUsageSummary } from '../../../types/insightsUsageTypes';
import FeedbackKPICard from '../feedback/FeedbackKPICard';

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

interface Props {
  summary: InsightsUsageSummary;
  onDrill?: (eventType: string) => void;
  onDrillInteractions?: () => void;
  onTabSwitch?: (tab: 'users' | 'districts') => void;
}

const InsightsKPICards: React.FC<Props> = ({ summary, onDrill, onDrillInteractions, onTabSwitch }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-700">KPIs</span>
        <CollapseChevron expanded={expanded} />
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-9 gap-3">
            <FeedbackKPICard
              label="Page Views"
              value={summary.pageViews.toLocaleString()}
              icon={<Eye size={20} />}
              colorClass="bg-indigo-50 text-indigo-600"
              onClick={() => onDrill?.('INSIGHTS_PAGE_VIEWED')}
            />
            <FeedbackKPICard
              label="Sessions"
              value={summary.totalSessions.toLocaleString()}
              icon={<Layers size={20} />}
              colorClass="bg-blue-50 text-blue-600"
            />
            <FeedbackKPICard
              label="Interactions"
              value={summary.interactions.toLocaleString()}
              icon={<Activity size={20} />}
              colorClass="bg-violet-50 text-violet-600"
              onClick={onDrillInteractions}
            />
            <FeedbackKPICard
              label="Interaction Rate"
              value={`${(summary.interactionRate * 100).toFixed(0)}%`}
              icon={<TrendingUp size={20} />}
              colorClass="bg-emerald-50 text-emerald-600"
            />
            <FeedbackKPICard
              label="Drawer Opens"
              value={summary.drawerOpens.toLocaleString()}
              icon={<Layers size={20} />}
              colorClass="bg-teal-50 text-teal-600"
              onClick={() => onDrill?.('KPI_DRAWER_OPENED')}
            />
            <FeedbackKPICard
              label="Schoolie Opens"
              value={summary.schoolieOpens.toLocaleString()}
              icon={<Bot size={20} />}
              colorClass="bg-purple-50 text-purple-600"
              onClick={() => onDrill?.('KPI_SCHOOLIE_OPENED')}
            />
            <FeedbackKPICard
              label="Downloads"
              value={summary.downloads.toLocaleString()}
              icon={<Download size={20} />}
              colorClass="bg-amber-50 text-amber-600"
              onClick={() => onDrill?.('KPI_DRAWER_DOWNLOAD')}
            />
            <FeedbackKPICard
              label="Active Users"
              value={summary.activeUsers.toLocaleString()}
              icon={<Users size={20} />}
              colorClass="bg-pink-50 text-pink-600"
              onClick={() => onTabSwitch?.('users')}
            />
            <FeedbackKPICard
              label="Active Districts"
              value={summary.activeDistricts.toLocaleString()}
              icon={<Building2 size={20} />}
              colorClass="bg-cyan-50 text-cyan-600"
              onClick={() => onTabSwitch?.('districts')}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightsKPICards;
