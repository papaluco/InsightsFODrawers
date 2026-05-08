import React from 'react';
import { X } from 'lucide-react';
import { AppUsageEvent, APP_EVENT_FRIENDLY } from '../../../types/appUsageTypes';
import { fmtDateTime } from './appUsageHelpers';
import { APP_USER_NAMES, APP_DISTRICT_NAMES } from '../../../data/mockAppUsageData';

interface Props {
  event: AppUsageEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
    <span className="text-sm text-slate-700 font-medium break-all">{value || '—'}</span>
  </div>
);

const AppEventDetailDrawer: React.FC<Props> = ({ event, isOpen, onClose }) => {
  return (
    <div
      className={`fixed top-0 right-0 h-full w-[460px] bg-white border-l border-gray-200 shadow-2xl z-[53] flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between shrink-0">
        <h3 className="text-base font-bold text-gray-900">Event Detail</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {event ? (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Row label="Event Type" value={APP_EVENT_FRIENDLY[event.eventType as keyof typeof APP_EVENT_FRIENDLY] ?? event.eventType} />
              <Row label="Timestamp" value={fmtDateTime(event.timestamp)} />
              <Row label="User" value={APP_USER_NAMES[event.userId] ?? event.userId} />
              <Row label="User ID" value={event.userId} />
              <Row label="District" value={APP_DISTRICT_NAMES[event.districtId] ?? event.districtId} />
              <Row label="District ID" value={event.districtId} />
              <Row label="Platform" value={event.platform} />
              <Row label="Page" value={event.page} />
              <Row label="Session ID" value={event.sessionId} />
            </div>

            {Object.keys(event.context).length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Context</h4>
                <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-600 font-mono leading-relaxed">
                  <pre className="whitespace-pre-wrap break-all">
                    {JSON.stringify(event.context, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Full Payload</h4>
              <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-600 font-mono leading-relaxed">
                <pre className="whitespace-pre-wrap break-all">
                  {JSON.stringify({
                    eventType: event.eventType,
                    timestamp: event.timestamp,
                    userId: event.userId,
                    districtId: event.districtId,
                    platform: event.platform,
                    page: event.page,
                    sessionId: event.sessionId,
                    context: event.context,
                  }, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">No event selected</div>
        )}
      </div>
    </div>
  );
};

export default AppEventDetailDrawer;
