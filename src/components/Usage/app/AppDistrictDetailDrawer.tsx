import React, { useEffect } from 'react';
import { X, Building2, AlertTriangle } from 'lucide-react';
import { AppDistrictStatRow, AppSessionStatRow } from '../../../types/appUsageTypes';
import { fmtDate, fmtDuration } from './appUsageHelpers';
import AppSessionGrid from './AppSessionGrid';
import FeedbackKPICard from '../feedback/FeedbackKPICard';

interface Props {
  district: AppDistrictStatRow | null;
  sessions: AppSessionStatRow[];
  isOpen: boolean;
  onClose: () => void;
  onSessionClick?: (session: AppSessionStatRow) => void;
}

const AppDistrictDetailDrawer: React.FC<Props> = ({ district, sessions, isOpen, onClose, onSessionClick }) => {
  const districtSessions = district ? sessions.filter(s => s.districtId === district.districtId) : [];

  useEffect(() => {
  const h = (e: KeyboardEvent) => {
    if (e.key !== 'Escape' || !isOpen) return;

    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  window.addEventListener('keydown', h, true);
  return () => window.removeEventListener('keydown', h, true);
}, [isOpen, onClose]);

  return (
    <div className={`fixed top-0 right-0 h-full w-[760px] bg-white border-l border-gray-200 shadow-2xl z-[53] flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
            <Building2 size={20} className="text-teal-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">{district?.districtName ?? 'District Detail'}</h3>
            {district && <p className="text-xs text-gray-400">{district.platform || 'All platforms'} · {district.timezone}</p>}
          </div>
        </div>

        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
          <X size={18} />
        </button>
      </div>

      {district && (
        <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-5 space-y-5">
          {district.hasNoActivity && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 text-xs font-semibold rounded-full border border-rose-200">
              <AlertTriangle size={12} /> Needs Attention
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <FeedbackKPICard label="Active Users" value={district.activeUsers.toLocaleString()} icon={<Building2 size={16} />} colorClass="bg-teal-50 text-teal-600" />
            <FeedbackKPICard label="Sessions" value={district.sessions.toLocaleString()} icon={<Building2 size={16} />} colorClass="bg-indigo-50 text-indigo-600" />
            <FeedbackKPICard label="Avg Sessions/User" value={district.avgSessionsPerUser.toString()} icon={<Building2 size={16} />} colorClass="bg-blue-50 text-blue-600" />
            <FeedbackKPICard label="Avg Duration" value={district.avgDuration > 0 ? fmtDuration(district.avgDuration) : '—'} icon={<Building2 size={16} />} colorClass="bg-violet-50 text-violet-600" />
            <FeedbackKPICard label="Last Activity" value={district.lastActivity ? fmtDate(district.lastActivity) : '—'} icon={<Building2 size={16} />} colorClass="bg-sky-50 text-sky-600" />
            <FeedbackKPICard label="Timezone" value={district.timezone} icon={<Building2 size={16} />} colorClass="bg-slate-50 text-slate-600" />
          </div>

          <AppSessionGrid
            data={districtSessions}
            onRowClick={onSessionClick}
          />
        </div>
      )}
    </div>
  );
};

export default AppDistrictDetailDrawer;