import React, { useState } from 'react';
import { MenuUsageSummary } from '../../../types/menuUsageTypes';
import FeedbackKPICard from '../feedback/FeedbackKPICard';
import { MENU_ICONS, MENU_TAB_TAILWIND } from './menuUsageHelpers';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  summary: MenuUsageSummary;
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

const MenuOverviewKPICards: React.FC<Props> = ({ summary, onActiveUsersClick, onActiveDistrictsClick }) => {
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
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-9 gap-3">
            <FeedbackKPICard
              label="Page Views"
              value={summary.pageViews.toLocaleString()}
              icon={<MENU_ICONS.PAGE_VIEWS size={20} />}
              colorClass={MENU_TAB_TAILWIND.PageViews}
            />

            <FeedbackKPICard
              label="Interactions"
              value={summary.interactions.toLocaleString()}
              icon={<MENU_ICONS.OVERVIEW size={20} />}
              colorClass={MENU_TAB_TAILWIND.Interactions}
            />

            <FeedbackKPICard
              label="Interaction Rate"
              value={`${summary.interactionRate.toLocaleString()}x`}
              icon={<MENU_ICONS.CHART size={20} />}
              colorClass={MENU_TAB_TAILWIND.Overview}
            />

            <FeedbackKPICard
              label="Menu Items Views"
              value={summary.menuItemsDrawerViews.toLocaleString()}
              icon={<MENU_ICONS.MENU_ITEMS size={20} />}
              colorClass={MENU_TAB_TAILWIND['Menu Items']}
            />

            <FeedbackKPICard
              label="School Perf. Views"
              value={summary.schoolPerformanceDrawerViews.toLocaleString()}
              icon={<MENU_ICONS.SCHOOL_PERF size={20} />}
              colorClass={MENU_TAB_TAILWIND['School Performance']}
            />

            <FeedbackKPICard
              label="Metric Changes"
              value={summary.metricChanges.toLocaleString()}
              icon={<MENU_ICONS.FILTER size={20} />}
              colorClass={MENU_TAB_TAILWIND.Metrics}
            />

            <FeedbackKPICard
              label="Filter Changes"
              value={summary.filterChanges.toLocaleString()}
              icon={<MENU_ICONS.FILTER size={20} />}
              colorClass={MENU_TAB_TAILWIND.Filters}
            />

            <ClickableCard onClick={onActiveUsersClick}>
              <FeedbackKPICard
                label="Active Users"
                value={summary.activeUsers.toLocaleString()}
                icon={<MENU_ICONS.USER size={20} />}
                colorClass={MENU_TAB_TAILWIND.Users}
              />
            </ClickableCard>

            <ClickableCard onClick={onActiveDistrictsClick}>
              <FeedbackKPICard
                label="Active Districts"
                value={summary.activeDistricts.toLocaleString()}
                icon={<MENU_ICONS.DISTRICT size={20} />}
                colorClass={MENU_TAB_TAILWIND.Districts}
              />
            </ClickableCard>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuOverviewKPICards;
