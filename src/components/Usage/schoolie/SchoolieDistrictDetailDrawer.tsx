import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { SchoolieDistrictStatRow, SchoolieSessionStatRow } from '../../../types/schoolieUsageTypes';
import { TAB_COLORS, USAGE_ICONS, fmtDate } from '../common/usageHelpers';
import SchoolieSessionGrid from './SchoolieSessionGrid';
import SchoolieSessionDetailDrawer from './SchoolieSessionDetailDrawer';

interface Props {
  district: SchoolieDistrictStatRow | null;
  sessions: SchoolieSessionStatRow[];
  isOpen: boolean;
  onClose: () => void;
  zIndex?: number;
  isTopmost?: boolean;
  onSessionUserClick?: (session: SchoolieSessionStatRow) => void;
}

const SchoolieDistrictDetailDrawer: React.FC<Props> = ({
  district,
  sessions,
  isOpen,
  onClose,
  zIndex = 60,
  isTopmost = true,
  onSessionUserClick,
}) => {
  const [selectedSession, setSelectedSession] = useState<SchoolieSessionStatRow | null>(null);
  const [isSessionDetailOpen, setIsSessionDetailOpen] = useState(false);

  const isAnyChildOpen = isSessionDetailOpen;

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !isOpen) return;
      if (!isTopmost || isAnyChildOpen) return;
      e.preventDefault();
      e.stopPropagation();
      onClose();
    };
    window.addEventListener('keydown', h, true);
    return () => window.removeEventListener('keydown', h, true);
  }, [isOpen, isTopmost, isAnyChildOpen, onClose]);

  const districtSessions = district
    ? sessions.filter(s => s.districtId === district.districtId)
    : [];

  const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      <span className="text-sm text-slate-700 font-medium">{value || '—'}</span>
    </div>
  );

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20" style={{ zIndex }} onClick={onClose} />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-[960px] bg-white border-l border-gray-200 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ zIndex: zIndex + 1 }}
      >
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${TAB_COLORS.Districts}1A` }}>
              <USAGE_ICONS.District size={20} style={{ color: TAB_COLORS.Districts }} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{district?.districtName ?? 'District Detail'}</h3>
              {district && <p className="text-xs text-gray-400">District ID: {district.districtId}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {district && (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="grid grid-cols-4 gap-4">
                <Row label="Active Users"      value={district.activeUsers.toLocaleString()} />
                <Row label="Total Requests"    value={district.totalRequests.toLocaleString()} />
                <Row label="Success Rate"      value={`${Math.round(district.successRate * 100)}%`} />
                <Row label="Avg Response Time" value={`${Math.round(district.avgResponseTimeMs).toLocaleString()}ms`} />
              </div>
              {district.lastActivity && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Row label="Last Activity" value={fmtDate(district.lastActivity)} />
                </div>
              )}
            </div>

            <SchoolieSessionGrid
              data={districtSessions}
              onRowClick={session => { setSelectedSession(session); setIsSessionDetailOpen(true); }}
              onUserClick={onSessionUserClick}
            />
          </div>
        )}
      </div>

      <SchoolieSessionDetailDrawer
        session={selectedSession}
        isOpen={isSessionDetailOpen}
        onClose={() => setIsSessionDetailOpen(false)}
        zIndex={zIndex + 10}
        isTopmost={isSessionDetailOpen}
      />
    </>
  );
};

export default SchoolieDistrictDetailDrawer;
