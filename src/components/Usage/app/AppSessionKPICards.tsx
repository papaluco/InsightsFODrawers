import React, { useState } from 'react';
import { XCircle, CheckCircle, BarChart2 } from 'lucide-react';
import { AppSessionStatRow } from '../../../types/appUsageTypes';
import FeedbackKPICard from '../feedback/FeedbackKPICard';
import { TAB_TAILWIND , USAGE_ICONS } from '../../Usage/common/usageHelpers';

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

interface Props {
  data: AppSessionStatRow[];
  onTotalSessionsClick?: () => void;
  onSessionsPerUserClick?: () => void;
  onAppClosedClick?: () => void;
  onNoAppCloseClick?: () => void;
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
      className="text-left rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-200"
    >
      {children}
    </button>
  );
};

const AppSessionKPICards: React.FC<Props> = ({
  data,
  onTotalSessionsClick,
  onSessionsPerUserClick,
  onAppClosedClick,
  onNoAppCloseClick,
}) => {
  const [expanded, setExpanded] = useState(true);

  const total = data.length;
  const durations = data.map(s => s.derivedDuration).sort((a, b) => a - b);
  const avgDuration = total > 0 ? Math.round((durations.reduce((s, v) => s + v, 0) / total) * 10) / 10 : 0;
  const median = total > 0 ? durations[Math.floor(total / 2)] : 0;

  const uniqueUsers = new Set(data.map(s => s.userId)).size;
  const sessionsPerUser = uniqueUsers > 0 ? Math.round((total / uniqueUsers) * 10) / 10 : 0;

  const withClosed = data.filter(s => s.hasAppClosed).length;
  const withoutClosed = total - withClosed;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button onClick={() => setExpanded(e => !e)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors">
        <span className="text-sm font-semibold text-slate-700">Session KPIs</span>
        <CollapseChevron expanded={expanded} />
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            <ClickableCard onClick={onTotalSessionsClick}>
              <FeedbackKPICard label="Total Sessions" value={total.toLocaleString()} icon={<USAGE_ICONS.Sessions size={20} />} colorClass={TAB_TAILWIND.Sessions} />
            </ClickableCard>

            <FeedbackKPICard label="Avg Duration" value={`${avgDuration} min`} icon={<USAGE_ICONS.Time size={20} />} colorClass={TAB_TAILWIND.Sessions} />

            <FeedbackKPICard label="Median Duration" value={`${Math.round(median * 10) / 10} min`} icon={<BarChart2 size={20} />} colorClass={TAB_TAILWIND.Sessions} />

            <ClickableCard onClick={onSessionsPerUserClick}>
              <FeedbackKPICard label="Sessions/User" value={sessionsPerUser.toString()} icon={<USAGE_ICONS.User size={20} />} colorClass={TAB_TAILWIND.Sessions} />
            </ClickableCard>

            <ClickableCard onClick={onAppClosedClick}>
              <FeedbackKPICard label="App Closed" value={withClosed.toLocaleString()} icon={<CheckCircle size={20} />} colorClass={TAB_TAILWIND.Sessions} />
            </ClickableCard>

            <ClickableCard onClick={onNoAppCloseClick}>
              <FeedbackKPICard label="No App Close" value={withoutClosed.toLocaleString()} icon={<XCircle size={20} />} colorClass={TAB_TAILWIND.Sessions} />
            </ClickableCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppSessionKPICards;
