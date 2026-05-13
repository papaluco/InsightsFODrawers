import React, { useEffect, useState } from 'react';
import { X, FileText, Filter, PanelRight, Zap, Download, Bot, BarChart3, ChevronRight } from 'lucide-react';
import { AppUsageEvent, AppSessionStatRow } from '../../../types/appUsageTypes';
import { getAppSessionEvents } from '../../../services/appUsageService';
import { getEventFriendlyLabel } from './appUsageHelpers';
import { fmtDateTime, fmtDuration, ENTRY_POINT_LABELS, TAB_COLORS, USAGE_ICONS } from '../common/usageHelpers';
import { APP_USER_NAMES, APP_DISTRICT_NAMES } from '../../../data/mockAppUsageData';

interface Props {
  session: AppSessionStatRow | null;
  isOpen: boolean;
  onClose: () => void;
  zIndex?: number;
  isTopmost?: boolean;
}

function getEventIcon(eventType: string) {
  if (eventType === 'PAGE_VIEWED') return <FileText size={14} className="text-indigo-500 flex-shrink-0" />;
  if (eventType.includes('FILTER') || eventType.includes('DATE_RANGE') || eventType.includes('BENCHMARK')) return <Filter size={14} className="text-emerald-500 flex-shrink-0" />;
  if (eventType.includes('DRAWER')) return <PanelRight size={14} className="text-blue-500 flex-shrink-0" />;
  if (eventType.includes('SCHOOLIE')) return <Bot size={14} className="text-purple-500 flex-shrink-0" />;
  if (eventType.includes('DOWNLOAD')) return <Download size={14} className="text-amber-500 flex-shrink-0" />;
  if (eventType.includes('REPORT')) return <BarChart3 size={14} className="text-teal-500 flex-shrink-0" />;
  if (eventType.includes('LAYOUT') || eventType.includes('TREND') || eventType.includes('KPI')) return <Zap size={14} className="text-violet-500 flex-shrink-0" />;
  return <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />;
}

function isPageView(e: AppUsageEvent) { return e.eventType === 'PAGE_VIEWED'; }
function isAppClose(e: AppUsageEvent) { return e.eventType === 'APP_CLOSED'; }

const AppSessionDetailDrawer: React.FC<Props> = ({
  session,
  isOpen,
  onClose,
  zIndex = 60,
  isTopmost = true,
}) => {
  const [events, setEvents] = useState<AppUsageEvent[]>([]);
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
      getAppSessionEvents(session.sessionId).then(evs => {
        setEvents(evs);
        setLoading(false);
      });
    }
  }, [isOpen, session]);

  const timeline = React.useMemo(() => {
    const nonClose = events.filter(e => !isAppClose(e));
    type TimelineGroup = { page: AppUsageEvent; actions: AppUsageEvent[] };
    const groups: TimelineGroup[] = [];
    let currentGroup: TimelineGroup | null = null;
    for (const e of nonClose) {
      if (isPageView(e)) {
        currentGroup = { page: e, actions: [] };
        groups.push(currentGroup);
      } else if (currentGroup) {
        currentGroup.actions.push(e);
      }
    }
    return groups;
  }, [events]);

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
        className={`fixed top-0 right-0 h-full w-[560px] bg-white border-l border-gray-200 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ zIndex: zIndex + 1 }}
      >
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${TAB_COLORS.Sessions}1A` }}
            >
              <USAGE_ICONS.Sessions size={20} style={{ color: TAB_COLORS.Sessions }} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Session Detail</h3>
              {session && (
                <p className="text-xs text-gray-400 mt-0.5 font-mono">
                  {session.sessionId}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {session && (
          <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-2 gap-3 text-sm shrink-0">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">User</p>
              <p className="font-medium text-slate-700">{APP_USER_NAMES[session.userId] ?? session.userId}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">District</p>
              <p className="font-medium text-slate-700">{APP_DISTRICT_NAMES[session.districtId] ?? session.districtId}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Platform</p>
              <p className="text-slate-600">{session.platform}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Entry Point</p>
              <p className="text-slate-600">{ENTRY_POINT_LABELS[session.entryPoint] ?? session.entryPoint}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Start Time</p>
              <p className="text-slate-600">{fmtDateTime(session.startTime)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duration</p>
              <p className="text-slate-600">{fmtDuration(session.derivedDuration, session.isDerivedDuration)}</p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-teal-500 border-t-transparent" />
            </div>
          ) : timeline.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">No events found for this session.</div>
          ) : (
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Session Timeline</p>
              {timeline.map((group, gi) => (
                <div key={gi} className="space-y-0.5">
                  <div className="flex items-start gap-3 py-2 px-3 bg-slate-50 rounded-xl">
                    <div className="mt-0.5">{getEventIcon(group.page.eventType)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-700">
                          {getEventFriendlyLabel(group.page.eventType, group.page.context)}
                          {' '}<span className="font-normal text-slate-500">— {group.page.page}</span>
                        </span>
                        <span className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0">
                          {fmtDateTime(group.page.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {group.actions.map((action, ai) => (
                    <div key={ai} className="flex items-start gap-3 py-1.5 px-3 ml-5 border-l-2 border-gray-100">
                      <div className="mt-0.5">{getEventIcon(action.eventType)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm text-slate-600">
                            {getEventFriendlyLabel(action.eventType, action.context)}
                          </span>
                          <span className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0">
                            {fmtDateTime(action.timestamp)}
                          </span>
                        </div>
                        {action.context.kpi && (
                          <p className="text-[11px] text-gray-400 mt-0.5">{action.context.kpi}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {session?.hasAppClosed && (
                <div className="flex items-center gap-3 py-2 px-3 mt-2 border border-dashed border-gray-200 rounded-xl">
                  <X size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-400 italic">App closed</span>
                </div>
              )}
              {!session?.hasAppClosed && (
                <div className="flex items-center gap-3 py-2 px-3 mt-2 border border-dashed border-gray-200 rounded-xl">
                  <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-400 italic">
                    Session end not recorded — duration estimated
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AppSessionDetailDrawer;
