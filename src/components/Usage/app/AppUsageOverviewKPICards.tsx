import React, { useState } from 'react';
import { UserCheck } from 'lucide-react';
import { AppUsageSummary } from '../../../types/appUsageTypes';
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
  summary: AppUsageSummary;
  onActiveUsersClick?: () => void;
  onActiveDistrictsClick?: () => void;
  onSessionsClick?: () => void;
  onNewUsersClick?: () => void;
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
      className="text-left rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-200"
    >
      {children}
    </button>
  );
};

const AppOverviewKPICards: React.FC<Props> = ({
  summary,
  onActiveUsersClick,
  onActiveDistrictsClick,
  onSessionsClick,
  onNewUsersClick,
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700">Overview KPIs</span>
        </div>
        <CollapseChevron expanded={expanded} />
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
            <ClickableCard onClick={onActiveUsersClick}>
              <FeedbackKPICard
                label="Active Users"
                value={summary.activeUsers.toLocaleString()}
                icon={<USAGE_ICONS.User size={20} />}
                colorClass={TAB_TAILWIND.Users}
              />
            </ClickableCard>

            <ClickableCard onClick={onActiveDistrictsClick}>
              <FeedbackKPICard
                label="Active Districts"
                value={summary.activeDistricts.toLocaleString()}
                icon={<USAGE_ICONS.District size={20} />}
                colorClass={TAB_TAILWIND.Districts}
              />
            </ClickableCard>

            <ClickableCard onClick={onSessionsClick}>
              <FeedbackKPICard
                label="Total Sessions"
                value={summary.totalSessions.toLocaleString()}
                icon={<USAGE_ICONS.Sessions size={20} />}
                colorClass={TAB_TAILWIND.Sessions}
              />
            </ClickableCard>

            <FeedbackKPICard
              label="Avg Session"
              value={`${summary.avgSessionDuration} min`}
              icon={<USAGE_ICONS.Time size={20} />}
              colorClass={TAB_TAILWIND.Timming}
            />

            <FeedbackKPICard
              label="DAU / WAU / MAU"
              value={`${summary.dau}`}
              subtitle={`/ ${summary.wau} / ${summary.mau}`}
              icon={<USAGE_ICONS.Trends size={20} />}
              colorClass={TAB_TAILWIND.Overview}
            />

            <ClickableCard onClick={onNewUsersClick}>
              <FeedbackKPICard
                label="New Users"
                value={summary.newUsers.toLocaleString()}
                icon={<UserCheck size={20} />}
                colorClass={TAB_TAILWIND.Users}
              />
            </ClickableCard>

            <FeedbackKPICard
              label="Retention"
              value={`${summary.retentionPercent}%`}
              icon={<USAGE_ICONS.Frequency size={20} />}
              colorClass={TAB_TAILWIND.Users}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AppOverviewKPICards;
