import React, { useState } from 'react';
import { Users, UserCheck, RefreshCw, Zap, Activity, Clock } from 'lucide-react';
import { AppUserStatRow } from '../../../types/appUsageTypes';
import FeedbackKPICard from '../feedback/FeedbackKPICard';

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

interface Props {
  data: AppUserStatRow[];
  onActiveUsersClick?: () => void;
  onNewUsersClick?: () => void;
  onReturningUsersClick?: () => void;
  onPowerUsersClick?: () => void;
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
      className="text-left rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-200"
    >
      {children}
    </button>
  );
};

const AppUserKPICards: React.FC<Props> = ({
  data,
  onActiveUsersClick,
  onNewUsersClick,
  onReturningUsersClick,
  onPowerUsersClick,
  onAvgSessionsClick,
}) => {
  const [expanded, setExpanded] = useState(true);

  const activeUsers = data.length;
  const newUsers = data.filter(u => u.isPowerUser === false && u.sessions <= 2).length;
  const returningUsers = data.filter(u => u.sessions > 2).length;
  const powerUsers = data.filter(u => u.isPowerUser).length;
  const avgSessions = data.length > 0
    ? Math.round((data.reduce((s, u) => s + u.sessions, 0) / data.length) * 10) / 10
    : 0;
  const avgDuration = data.length > 0
    ? Math.round((data.reduce((s, u) => s + u.avgSessionDuration, 0) / data.length) * 10) / 10
    : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-700">User KPIs</span>
        <CollapseChevron expanded={expanded} />
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            <ClickableCard onClick={onActiveUsersClick}>
              <FeedbackKPICard label="Active Users" value={activeUsers.toLocaleString()} icon={<Users size={20} />} colorClass="bg-teal-50 text-teal-600" />
            </ClickableCard>

            <ClickableCard onClick={onNewUsersClick}>
              <FeedbackKPICard label="New Users" value={newUsers.toLocaleString()} icon={<UserCheck size={20} />} colorClass="bg-emerald-50 text-emerald-600" />
            </ClickableCard>

            <ClickableCard onClick={onReturningUsersClick}>
              <FeedbackKPICard label="Returning Users" value={returningUsers.toLocaleString()} icon={<RefreshCw size={20} />} colorClass="bg-blue-50 text-blue-600" />
            </ClickableCard>

            <ClickableCard onClick={onPowerUsersClick}>
              <FeedbackKPICard label="Power Users" value={powerUsers.toLocaleString()} icon={<Zap size={20} />} colorClass="bg-amber-50 text-amber-600" />
            </ClickableCard>

            <ClickableCard onClick={onAvgSessionsClick}>
              <FeedbackKPICard label="Avg Sessions" value={avgSessions.toString()} icon={<Activity size={20} />} colorClass="bg-indigo-50 text-indigo-600" />
            </ClickableCard>

            <FeedbackKPICard label="Avg Duration" value={`${avgDuration} min`} icon={<Clock size={20} />} colorClass="bg-violet-50 text-violet-600" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AppUserKPICards;