import React, { useEffect, useMemo } from 'react';
import { X, FileText, SlidersHorizontal, PanelRight, Search, ArrowUpDown, ChevronRight } from 'lucide-react';
import { MenuUsageEvent } from '../../../types/menuUsageTypes';
import { getMenuEventFriendlyLabel } from './menuUsageHelpers';
import { fmtDateTime, TAB_COLORS, USAGE_ICONS } from '../common/usageHelpers';
import { MENU_USER_NAMES, MENU_DISTRICT_NAMES } from '../../../data/mockMenuUsageData';

interface Props {
  sessionId: string | null;
  events: MenuUsageEvent[];
  isOpen: boolean;
  onClose: () => void;
  zIndex?: number;
  isTopmost?: boolean;
}

function getMenuEventIcon(eventType: string) {
  if (eventType === 'MENU_ANALYSIS_PAGE_VIEWED') return <FileText size={14} className="text-indigo-500 flex-shrink-0" />;
  if (eventType === 'MENU_ITEMS_DRAWER_VIEWED' || eventType === 'SCHOOL_PERFORMANCE_DRAWER_VIEWED') return <PanelRight size={14} className="text-blue-500 flex-shrink-0" />;
  if (eventType.includes('FILTER') || eventType.includes('DATE') || eventType.includes('DAYS') || eventType.includes('SCHOOLS') || eventType.includes('CATEGORY')) return <SlidersHorizontal size={14} className="text-emerald-500 flex-shrink-0" />;
  if (eventType.includes('SEARCH')) return <Search size={14} className="text-lime-500 flex-shrink-0" />;
  if (eventType.includes('SORT')) return <ArrowUpDown size={14} className="text-slate-400 flex-shrink-0" />;
  return <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />;
}

const MenuSessionDetailDrawer: React.FC<Props> = ({
  sessionId,
  events,
  isOpen,
  onClose,
  zIndex = 60,
  isTopmost = true,
}) => {
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

  const sessionEvents = useMemo(() => {
    if (!sessionId) return [];
    return [...events]
      .filter(e => e.sessionId === sessionId)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }, [sessionId, events]);

  const meta = sessionEvents[0];

  const timeline = useMemo(() => {
    type Group = { pageView: MenuUsageEvent | null; actions: MenuUsageEvent[] };
    const groups: Group[] = [];
    let current: Group | null = null;
    for (const e of sessionEvents) {
      if (e.eventType === 'MENU_ANALYSIS_PAGE_VIEWED') {
        current = { pageView: e, actions: [] };
        groups.push(current);
      } else if (current) {
        current.actions.push(e);
      } else {
        groups.push({ pageView: null, actions: [e] });
        current = groups[groups.length - 1];
      }
    }
    return groups;
  }, [sessionEvents]);

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
              {sessionId && (
                <p className="text-xs text-gray-400 mt-0.5 font-mono">
                  {sessionId}
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

        {meta && (
          <div className="px-6 py-4 border-b border-gray-100 grid grid-cols-2 gap-3 text-sm shrink-0">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">User</p>
              <p className="font-medium text-slate-700">
                {MENU_USER_NAMES[meta.userId] ?? meta.userId}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">District</p>
              <p className="font-medium text-slate-700">
                {MENU_DISTRICT_NAMES[meta.districtId] ?? meta.districtId}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Platform</p>
              <p className="text-slate-600">{meta.platform}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Events</p>
              <p className="text-slate-600">{sessionEvents.length}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Start Time</p>
              <p className="text-slate-600">{fmtDateTime(sessionEvents[0].timestamp)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Event</p>
              <p className="text-slate-600">{fmtDateTime(sessionEvents[sessionEvents.length - 1].timestamp)}</p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {sessionEvents.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
              No events found for this session.
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                Session Timeline
              </p>
              {timeline.map((group, gi) => (
                <div key={gi} className="space-y-0.5">
                  {group.pageView && (
                    <div className="flex items-start gap-3 py-2 px-3 bg-slate-50 rounded-xl">
                      <div className="mt-0.5">{getMenuEventIcon(group.pageView.eventType)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-slate-700">
                            {getMenuEventFriendlyLabel(group.pageView.eventType, group.pageView.context)}
                          </span>
                          <span className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0">
                            {fmtDateTime(group.pageView.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  {group.actions.map((action, ai) => (
                    <div key={ai} className="flex items-start gap-3 py-1.5 px-3 ml-5 border-l-2 border-gray-100">
                      <div className="mt-0.5">{getMenuEventIcon(action.eventType)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm text-slate-600">
                            {getMenuEventFriendlyLabel(action.eventType, action.context)}
                          </span>
                          <span className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0">
                            {fmtDateTime(action.timestamp)}
                          </span>
                        </div>
                        {action.context.metric && (
                          <p className="text-[11px] text-gray-400 mt-0.5">{action.context.metric}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MenuSessionDetailDrawer;
