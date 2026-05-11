import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { AppDistrictStatRow } from '../../../types/appUsageTypes';
import FeedbackKPICard from '../feedback/FeedbackKPICard';
import { APP_ICONS, TAB_TAILWIND } from './appUsageHelpers';

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

interface Props {
  data: AppDistrictStatRow[];
  onActiveDistrictsClick?: () => void;
  onNoActivityClick?: () => void;
  onAvgUsersClick?: () => void;
  onAvgSessionsClick?: () => void;
}

const ClickableCard: React.FC<{
  onClick?: () => void;
  children: React.ReactNode;
}> = ({ onClick, children }) => {
  if (!onClick) return <>{children}</>;

  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-200"
    >
      {children}
    </button>
  );
};

const AppDistrictKPICards: React.FC<Props> = ({
  data,
  onActiveDistrictsClick,
  onNoActivityClick,
  onAvgUsersClick,
  onAvgSessionsClick,
}) => {
  const [expanded, setExpanded] = useState(true);

  const active = data.filter(d => !d.hasNoActivity);
  const noActivity = data.filter(d => d.hasNoActivity).length;
  const avgUsers = active.length > 0 ? Math.round((active.reduce((s, d) => s + d.activeUsers, 0) / active.length) * 10) / 10 : 0;
  const avgSessions = active.length > 0 ? Math.round((active.reduce((s, d) => s + d.sessions, 0) / active.length) * 10) / 10 : 0;
  const avgDuration = active.length > 0 ? Math.round((active.reduce((s, d) => s + d.avgDuration, 0) / active.length) * 10) / 10 : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button onClick={() => setExpanded(e => !e)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
        <span className="text-sm font-semibold text-slate-700">District KPIs</span>
        <CollapseChevron expanded={expanded} />
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            <ClickableCard onClick={onActiveDistrictsClick}>
              <FeedbackKPICard label="Active Districts" value={active.length.toLocaleString()} icon={<APP_ICONS.DISTRICT size={20} />} colorClass={TAB_TAILWIND.Districts} />
            </ClickableCard>

            <ClickableCard onClick={onNoActivityClick}>
              <FeedbackKPICard label="No Activity" value={noActivity.toLocaleString()} icon={<AlertTriangle size={20} />} colorClass={TAB_TAILWIND.Districts} />
            </ClickableCard>

            <ClickableCard onClick={onAvgUsersClick}>
              <FeedbackKPICard label="Avg Users/District" value={avgUsers.toString()} icon={<APP_ICONS.USER size={20} />} colorClass={TAB_TAILWIND.Districts} />
            </ClickableCard>

            <ClickableCard onClick={onAvgSessionsClick}>
              <FeedbackKPICard label="Avg Sessions/District" value={avgSessions.toString()} icon={<APP_ICONS.SESSIONS size={20} />} colorClass={TAB_TAILWIND.Districts} />
            </ClickableCard>

            <FeedbackKPICard label="Avg Duration" value={`${avgDuration} min`} icon={<APP_ICONS.TIME size={20} />} colorClass={TAB_TAILWIND.Districts} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AppDistrictKPICards;
