import React, { useEffect } from 'react';
import { X, Zap } from 'lucide-react';
import { MenuUserStatRow, MenuSessionRow } from '../../../types/menuUsageTypes';
import { fmtDate, TAB_COLORS, TAB_TAILWIND, USAGE_ICONS } from '../common/usageHelpers';
import MenuSessionGrid from './MenuSessionGrid';
import FeedbackKPICard from '../feedback/FeedbackKPICard';

interface Props {
  user: MenuUserStatRow | null;
  sessions: MenuSessionRow[];
  isOpen: boolean;
  onClose: () => void;
  zIndex?: number;
  isTopmost?: boolean;
  onSessionClick?: (session: MenuSessionRow) => void;
  onSessionEventsClick?: (session: MenuSessionRow) => void;
  onSessionUserClick?: (session: MenuSessionRow) => void;
  onSessionDistrictClick?: (session: MenuSessionRow) => void;
}

const MenuUserDetailDrawer: React.FC<Props> = ({
  user,
  sessions,
  isOpen,
  onClose,
  zIndex = 60,
  isTopmost = true,
  onSessionClick,
  onSessionEventsClick,
  onSessionUserClick,
  onSessionDistrictClick,
}) => {
  const userSessions = user ? sessions.filter(s => s.userId === user.userId) : [];

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !isOpen || !isTopmost) return;
      e.preventDefault();
      e.stopPropagation();
      onClose();
    };
    window.addEventListener('keydown', h, true);
    return () => window.removeEventListener('keydown', h, true);
  }, [isOpen, isTopmost, onClose]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20"
          style={{ zIndex }}
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-[960px] bg-white border-l border-gray-200 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ zIndex: zIndex + 1 }}
      >
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${TAB_COLORS.Users}1A` }}
            >
              <USAGE_ICONS.User size={20} style={{ color: TAB_COLORS.Users }} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {user?.userName ?? 'User Detail'}
              </h3>
              {user && (
                <p className="text-xs text-gray-400">
                  {user.districtName} · {user.platform}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(user as any)?.isPowerUser && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                <Zap size={12} /> Power User
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {user && (
          <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-5 space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <FeedbackKPICard
                label="Sessions"
                value={user.sessions.toLocaleString()}
                icon={<USAGE_ICONS.Sessions size={16} />}
                colorClass={TAB_TAILWIND.Sessions}
              />
              <FeedbackKPICard
                label="Page Views"
                value={user.pageViews.toLocaleString()}
                icon={<USAGE_ICONS.PageViews size={16} />}
                colorClass={TAB_TAILWIND.PageViews}
              />
              <FeedbackKPICard
                label="Interactions"
                value={user.interactions.toLocaleString()}
                icon={<USAGE_ICONS.Interactions size={16} />}
                colorClass={TAB_TAILWIND.Interactions}
              />
              <FeedbackKPICard
                label="Menu Items Views"
                value={user.menuItemsDrawerViews.toLocaleString()}
                icon={<USAGE_ICONS.MenuItems size={16} />}
                colorClass={TAB_TAILWIND.MenuItems}
              />
              <FeedbackKPICard
                label="School Perf. Views"
                value={user.schoolPerformanceDrawerViews.toLocaleString()}
                icon={<USAGE_ICONS.SchoolPerformance size={16} />}
                colorClass={TAB_TAILWIND.SchoolPerformance}
              />
              <FeedbackKPICard
                label="Last Active"
                value={fmtDate(user.lastActive)}
                icon={<USAGE_ICONS.Time size={16} />}
                colorClass={TAB_TAILWIND.Timing}
              />
            </div>

            <MenuSessionGrid
              data={userSessions}
              onRowClick={onSessionClick}
              onEventsClick={onSessionEventsClick}
              onUserClick={onSessionUserClick}
              onDistrictClick={onSessionDistrictClick}
            />
            
          </div>
        )}
      </div>
    </>
  );
};

export default MenuUserDetailDrawer;
