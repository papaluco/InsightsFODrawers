import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { MenuUsageEvent, MENU_EVENT_FRIENDLY } from '../../../types/menuUsageTypes';
import { fmtDateTime, EVENT_COLORS } from '../common/usageHelpers';

import { MENU_USER_NAMES, MENU_DISTRICT_NAMES } from '../../../data/mockMenuUsageData';

interface Props {
  event: MenuUsageEvent | null;
  isOpen: boolean;
  onClose: () => void;
  zIndex?: number;
}

const MenuEventDetailDrawer: React.FC<Props> = ({ event, isOpen, onClose, zIndex = 80 }) => {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) { e.preventDefault(); e.stopPropagation(); onClose(); }
    };
    window.addEventListener('keydown', h, true);
    return () => window.removeEventListener('keydown', h, true);
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  const friendlyType = MENU_EVENT_FRIENDLY[event.eventType] ?? event.eventType;
  const color = EVENT_COLORS[event.eventType] ?? '#64748b';
  const userName = MENU_USER_NAMES[event.userId] ?? event.userId;
  const districtName = MENU_DISTRICT_NAMES[event.districtId] ?? event.districtId;

  const contextEntries = Object.entries(event.context).filter(([, v]) => v !== undefined && v !== '');

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        style={{ zIndex: zIndex - 5 }}
        onClick={onClose}
      />
      <div
        className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl flex flex-col"
        style={{ zIndex }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-sm font-semibold text-slate-800">{friendlyType}</span>
            </div>
            <span className="text-xs text-gray-400 ml-4">{fmtDateTime(event.timestamp)}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Core Fields */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Event Details</h3>
            {[
              { label: 'Event Type', value: event.eventType },
              { label: 'User', value: `${userName} (${event.userId})` },
              { label: 'District', value: `${districtName} (${event.districtId})` },
              { label: 'Platform', value: event.platform },
              { label: 'Page', value: event.page },
              { label: 'Session ID', value: event.sessionId },
              { label: 'Timestamp', value: event.timestamp },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
                <span className="text-sm text-slate-700 break-all font-mono">{value}</span>
              </div>
            ))}
          </div>

          {/* Context */}
          {contextEntries.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Context</h3>
              {contextEntries.map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{k}</span>
                  <span className="text-sm text-slate-700 break-all font-mono">{String(v)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Raw JSON */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Raw Event</h3>
            <pre className="text-[10px] bg-slate-50 rounded-lg p-3 overflow-x-auto text-slate-600 border border-gray-100">
              {JSON.stringify(event, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuEventDetailDrawer;
