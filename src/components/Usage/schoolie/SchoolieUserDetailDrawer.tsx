import React, { useEffect, useMemo, useState } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';
import { SchoolieUserStatRow, SchoolieSessionStatRow } from '../../../types/schoolieUsageTypes';
import { TAB_COLORS, USAGE_ICONS, TOPIC_COLORS, TOPIC_TAILWIND, fmtDate } from '../common/usageHelpers';
import SchoolieSessionGrid from './SchoolieSessionGrid';
import SchoolieSessionDetailDrawer from './SchoolieSessionDetailDrawer';
import FeedbackKPICard from '../feedback/FeedbackKPICard';

interface Props {
  user: SchoolieUserStatRow | null;
  sessions: SchoolieSessionStatRow[];
  isOpen: boolean;
  onClose: () => void;
  zIndex?: number;
  isTopmost?: boolean;
  onSessionDistrictClick?: (session: SchoolieSessionStatRow) => void;
}

const SchoolieUserDetailDrawer: React.FC<Props> = ({
  user,
  sessions,
  isOpen,
  onClose,
  zIndex = 60,
  isTopmost = true,
  onSessionDistrictClick,
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

  const userSessions = useMemo(
    () => user ? sessions.filter(s => s.userId === user.userId) : [],
    [user, sessions]
  );

  const analysisBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    userSessions.forEach(s => counts.set(s.analysisIdentifier, (counts.get(s.analysisIdentifier) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [userSessions]);

  const entryPointBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    userSessions.forEach(s => counts.set(s.sourceEntryPoint, (counts.get(s.sourceEntryPoint) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [userSessions]);

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
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${TAB_COLORS.Users}1A` }}>
              <USAGE_ICONS.User size={20} style={{ color: TAB_COLORS.Users }} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{user?.userName ?? 'User Detail'}</h3>
              {user && <p className="text-xs text-gray-400">{user.districtName}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {user && (
          <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-5 space-y-5">
            <div className="grid grid-cols-4 gap-3">
              <FeedbackKPICard
                label="Total Requests"
                value={user.totalRequests.toLocaleString()}
                icon={<USAGE_ICONS.SchoolieAI size={16} />}
                colorClass={TOPIC_TAILWIND.AI}
              />
              <FeedbackKPICard
                label="Successes"
                value={user.successCount.toLocaleString()}
                icon={<CheckCircle size={16} />}
                colorClass="bg-emerald-50 text-emerald-600"
              />
              <FeedbackKPICard
                label="Errors"
                value={user.errorCount.toLocaleString()}
                icon={<XCircle size={16} />}
                colorClass="bg-red-50 text-red-600"
              />
              <FeedbackKPICard
                label="Success Rate"
                value={`${Math.round(user.successRate * 100)}%`}
                icon={<USAGE_ICONS.Performance size={16} />}
                colorClass={TOPIC_TAILWIND.Performance}
              />
            </div>

            {(analysisBreakdown.length > 0 || entryPointBreakdown.length > 0) && (
              <div className="grid grid-cols-2 gap-4">
                {analysisBreakdown.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Top Analyses</p>
                    <div className="space-y-2">
                      {analysisBreakdown.map(([analysis, count]) => (
                        <div key={analysis} className="flex items-center justify-between">
                          <span className="text-sm text-slate-700 font-medium">{analysis}</span>
                          <span className="text-sm text-gray-400 tabular-nums">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {entryPointBreakdown.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Entry Points</p>
                    <div className="space-y-2">
                      {entryPointBreakdown.map(([ep, count]) => (
                        <div key={ep} className="flex items-center justify-between">
                          <span className="text-sm text-slate-700 font-medium">{ep}</span>
                          <span className="text-sm text-gray-400 tabular-nums">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Avg Response Time</p>
                  <p className="font-medium text-slate-700 mt-0.5">{Math.round(user.avgResponseTimeMs).toLocaleString()}ms</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Active</p>
                  <p className="font-medium text-slate-700 mt-0.5">{fmtDate(user.lastActive)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Top Analysis</p>
                  <p className="font-medium text-slate-700 mt-0.5">{user.topAnalysis || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">District</p>
                  <p className="font-medium text-slate-700 mt-0.5">{user.districtName}</p>
                </div>
              </div>
            </div>

            <SchoolieSessionGrid
              data={userSessions}
              onRowClick={session => { setSelectedSession(session); setIsSessionDetailOpen(true); }}
              onDistrictClick={onSessionDistrictClick}
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

export default SchoolieUserDetailDrawer;
