import React, { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { MenuDistrictStatRow, MenuUserStatRow } from '../../../types/menuUsageTypes';
import { fmtDate, TAB_COLORS, USAGE_ICONS } from '../common/usageHelpers';
import MenuUsersGrid from './MenuUsersGrid';

interface Props {
  district: MenuDistrictStatRow | null;
  users: MenuUserStatRow[];
  isOpen: boolean;
  onClose: () => void;
  zIndex?: number;
  isTopmost?: boolean;
  onUserClick?: (user: MenuUserStatRow) => void;
  onUserSessionsClick?: (user: MenuUserStatRow) => void;
  onUserPageViewsClick?: (user: MenuUserStatRow) => void;
  onUserInteractionsClick?: (user: MenuUserStatRow) => void;
  onUserMenuItemsClick?: (user: MenuUserStatRow) => void;
  onUserSchoolPerfClick?: (user: MenuUserStatRow) => void;
}

const MenuDistrictDetailDrawer: React.FC<Props> = ({
  district,
  users,
  isOpen,
  onClose,
  zIndex = 60,
  isTopmost = true,
  onUserClick,
  onUserSessionsClick,
  onUserPageViewsClick,
  onUserInteractionsClick,
  onUserMenuItemsClick,
  onUserSchoolPerfClick,
}) => {
  const districtUsers = district
    ? users.filter(u => u.districtId === district.districtId)
    : [];

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

  const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        {label}
      </span>
      <span className="text-sm text-slate-700 font-medium break-all">
        {value || '—'}
      </span>
    </div>
  );

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
              style={{ backgroundColor: `${TAB_COLORS.Districts}1A` }}
            >
              <USAGE_ICONS.District size={20} style={{ color: TAB_COLORS.Districts }} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {district?.districtName ?? 'District Detail'}
              </h3>
              {district && (
                <p className="text-xs text-gray-400">
                  {district.platform || 'All platforms'}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {district?.hasNoActivity && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 text-xs font-semibold rounded-full border border-rose-200">
                <AlertTriangle size={12} /> Needs Attention
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

        {district && (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <div className="grid grid-cols-4 gap-4">
              <Row label="Active Users" value={district.activeUsers.toLocaleString()} />
              <Row label="Sessions" value={district.sessions.toLocaleString()} />
              <Row label="Page Views" value={district.pageViews.toLocaleString()} />
              <Row label="Interactions" value={district.interactions.toLocaleString()} />
              <Row label="Menu Items Views" value={district.menuItemsDrawerViews.toLocaleString()} />
              <Row label="School Perf. Views" value={district.schoolPerformanceDrawerViews.toLocaleString()} />
              <Row label="Last Activity" value={district.lastActivity ? fmtDate(district.lastActivity) : '—'} />
            </div>

            <MenuUsersGrid
              data={districtUsers}
              onUserClick={onUserClick}
              onSessionsClick={onUserSessionsClick}
              onPageViewsClick={onUserPageViewsClick}
              onInteractionsClick={onUserInteractionsClick}
              onMenuItemsClick={onUserMenuItemsClick}
              onSchoolPerfClick={onUserSchoolPerfClick}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default MenuDistrictDetailDrawer;
