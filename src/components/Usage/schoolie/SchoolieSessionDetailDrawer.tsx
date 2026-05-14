import React, { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, Clock, Zap, Bot } from 'lucide-react';
import { SchoolieSessionStatRow } from '../../../types/schoolieUsageTypes';
import { SchoolieUsageEvent } from '../../../data/mockSchoolieUsageData';
import { getSchoolieSessionEvents } from '../../../services/schoolieUsageService';
import { fmtDateTime, TAB_COLORS, USAGE_ICONS } from '../common/usageHelpers';
import { SCHOOLIE_USER_NAMES, SCHOOLIE_DISTRICT_NAMES } from '../../../data/mockSchoolieUsageData';

interface Props {
  session: SchoolieSessionStatRow | null;
  isOpen: boolean;
  onClose: () => void;
  zIndex?: number;
  isTopmost?: boolean;
}

function getEventIcon(eventType: SchoolieUsageEvent['eventType']) {
  if (eventType === 'AI_RESPONSE_SUCCESS') return <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />;
  if (eventType === 'AI_RESPONSE_ERROR')   return <XCircle size={14} className="text-red-500 flex-shrink-0" />;
  if (eventType === 'AI_REQUEST_STARTED')  return <Zap size={14} className="text-violet-500 flex-shrink-0" />;
  return <Bot size={14} className="text-violet-300 flex-shrink-0" />;
}

function getEventLabel(eventType: SchoolieUsageEvent['eventType']): string {
  switch (eventType) {
    case 'KPI_SCHOOLIE_OPENED':       return 'KPI Schoolie Opened';
    case 'DASHBOARD_SCHOOLIE_OPENED': return 'Dashboard Schoolie Opened';
    case 'AI_REQUEST_STARTED':        return 'AI Request Started';
    case 'AI_RESPONSE_SUCCESS':       return 'AI Response — Success';
    case 'AI_RESPONSE_ERROR':         return 'AI Response — Error';
  }
}

const SchoolieSessionDetailDrawer: React.FC<Props> = ({
  session,
  isOpen,
  onClose,
  zIndex = 60,
  isTopmost = true,
}) => {
  const [events, setEvents] = useState<SchoolieUsageEvent[]>([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (isOpen && session) {
      setLoading(true);
      getSchoolieSessionEvents(session.sessionId).then(evs => {
        setEvents(evs);
        setLoading(false);
      });
    }
  }, [isOpen, session]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20" style={{ zIndex }} onClick={onClose} />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-[560px] bg-white border-l border-gray-200 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ zIndex: zIndex + 1 }}
      >
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${TAB_COLORS.Sessions}1A` }}>
              <USAGE_ICONS.Sessions size={20} style={{ color: TAB_COLORS.Sessions }} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Session Detail</h3>
              {session && (
                <p className="text-xs text-gray-400 mt-0.5 font-mono">{session.sessionId}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {session && (
          <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-2 gap-3 text-sm shrink-0">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">User</p>
              <p className="font-medium text-slate-700">{SCHOOLIE_USER_NAMES[session.userId] ?? session.userId}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">District</p>
              <p className="font-medium text-slate-700">{SCHOOLIE_DISTRICT_NAMES[session.districtId] ?? session.districtId}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Platform</p>
              <p className="text-slate-600">{session.platform}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Analysis</p>
              <p className="text-slate-600">{session.analysisIdentifier}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Source Surface</p>
              <p className="text-slate-600">{session.sourceEntryPoint}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Model</p>
              <p className="text-slate-600">{session.modelVersion} · Prompt v{session.promptVersion}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Requested At</p>
              <p className="text-slate-600">{fmtDateTime(session.requestedAt)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Response Time</p>
              <p className="text-slate-600">
                {session.responseTimeMs != null ? `${session.responseTimeMs.toLocaleString()}ms` : '—'}
              </p>
            </div>
            {session.status && (
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
                {session.status === 'success'
                  ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-full"><CheckCircle size={10} /> Success</span>
                  : <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 text-[11px] font-semibold rounded-full"><XCircle size={10} /> Error</span>
                }
              </div>
            )}
            {session.errorMessage && (
              <div className="col-span-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Error</p>
                <p className="text-red-600 text-sm">{session.errorMessage}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-violet-500 border-t-transparent" />
            </div>
          ) : events.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">No events found for this session.</div>
          ) : (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Session Timeline</p>
              {events.map((e, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 py-3 px-4 rounded-xl ${
                    e.eventType === 'AI_RESPONSE_SUCCESS' ? 'bg-emerald-50' :
                    e.eventType === 'AI_RESPONSE_ERROR'   ? 'bg-red-50' :
                    e.eventType === 'AI_REQUEST_STARTED'  ? 'bg-violet-50' :
                    'bg-slate-50'
                  }`}
                >
                  <div className="mt-0.5">{getEventIcon(e.eventType)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-700">{getEventLabel(e.eventType)}</span>
                      <span className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0 flex items-center gap-1">
                        <Clock size={10} />
                        {fmtDateTime(e.timestamp)}
                      </span>
                    </div>
                    {e.responseTimeMs != null && (
                      <p className="text-[11px] text-gray-500 mt-0.5">{e.responseTimeMs.toLocaleString()}ms response time</p>
                    )}
                    {e.errorMessage && (
                      <p className="text-[11px] text-red-600 mt-0.5">{e.errorMessage}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SchoolieSessionDetailDrawer;
