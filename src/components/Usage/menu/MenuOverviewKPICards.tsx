import React, { useState } from 'react';
import { MenuUsageSummary } from '../../../types/menuUsageTypes';
import FeedbackKPICard from '../feedback/FeedbackKPICard';
import { USAGE_ICONS, TAB_TAILWIND } from '../common/usageHelpers';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  summary: MenuUsageSummary;
  onPageViewsClick?: () => void;
  onInteractionsClick?: () => void;
  onMenuItemsClick?: () => void;
  onSchoolPerfClick?: () => void;
  onActiveUsersClick?: () => void;
  onActiveDistrictsClick?: () => void;
}

const ClickableCard: React.FC<{ onClick?: () => void; children: React.ReactNode }> = ({ onClick, children }) => {
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

const MenuOverviewKPICards: React.FC<Props> = ({
  summary,
  onPageViewsClick,
  onInteractionsClick,
  onMenuItemsClick,
  onSchoolPerfClick,
  onActiveUsersClick,
  onActiveDistrictsClick,
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-semibold text-slate-700">Overview KPIs</span>
        {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
            <ClickableCard onClick={onPageViewsClick}>
              <FeedbackKPICard
                label="Page Views"
                value={summary.pageViews.toLocaleString()}
                icon={<USAGE_ICONS.PageViews size={20} />}
                colorClass={TAB_TAILWIND.PageViews}
              />
            </ClickableCard>

            <ClickableCard onClick={onInteractionsClick}>
              <FeedbackKPICard
                label="Interactions"
                value={summary.interactions.toLocaleString()}
                icon={<USAGE_ICONS.Interactions size={20} />}
                colorClass={TAB_TAILWIND.Interactions}
              />
            </ClickableCard>

            <FeedbackKPICard
              label="Interaction Rate"
              value={`${summary.interactionRate.toLocaleString()}x`}
              icon={<USAGE_ICONS.Chart size={20} />}
              colorClass={TAB_TAILWIND.Overview}
            />

            <ClickableCard onClick={onMenuItemsClick}>
              <FeedbackKPICard
                label="Menu Items Views"
                value={summary.menuItemsDrawerViews.toLocaleString()}
                icon={<USAGE_ICONS.MenuItems size={20} />}
                colorClass={TAB_TAILWIND.MenuItems}
              />
            </ClickableCard>

            <ClickableCard onClick={onSchoolPerfClick}>
              <FeedbackKPICard
                label="School Perf. Views"
                value={summary.schoolPerformanceDrawerViews.toLocaleString()}
                icon={<USAGE_ICONS.SchoolPerformance size={20} />}
                colorClass={TAB_TAILWIND.SchoolPerformance}
              />
            </ClickableCard>

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
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuOverviewKPICards;
