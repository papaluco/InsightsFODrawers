import React, { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { AppDistrictStatRow, AppSessionStatRow } from '../../../types/appUsageTypes';
import { fmtDate, APP_ICONS, TAB_COLORS } from './appUsageHelpers';
import AppSessionGrid from './AppSessionGrid';

interface Props {
  district: AppDistrictStatRow | null;
  sessions: AppSessionStatRow[];
  isOpen: boolean;
  onClose: () => void;
  zIndex?: number;
  isTopmost?: boolean;
  onSessionClick?: (session: AppSessionStatRow) => void;
}

const AppDistrictDetailDrawer: React.FC<Props> = ({
  district,
  sessions,
  isOpen,
  onClose,
  zIndex = 60,
  isTopmost = true,
  onSessionClick,
}) => {
  const districtSessions = district
    ? sessions.filter(s => s.districtId === district.districtId)
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
              <APP_ICONS.DISTRICT size={20} style={{ color: TAB_COLORS.Districts }} />
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
            <div className="grid grid-cols-3 gap-4">
              <Row label="Active Users" value={district.activeUsers.toLocaleString()} />
              <Row label="Last Activity" value={district.lastActivity ? fmtDate(district.lastActivity) : '—'} />
              <Row label="Timezone" value={district.timezone} />
            </div>

            <AppSessionGrid
              data={districtSessions}
              onRowClick={onSessionClick}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default AppDistrictDetailDrawer;
