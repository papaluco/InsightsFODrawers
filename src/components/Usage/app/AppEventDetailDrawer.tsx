import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { AppUsageEvent, APP_EVENT_FRIENDLY } from '../../../types/appUsageTypes';
import { fmtDateTime, APP_ICONS, TAB_COLORS } from './appUsageHelpers';
import { APP_USER_NAMES, APP_DISTRICT_NAMES } from '../../../data/mockAppUsageData';

interface Props {
  event: AppUsageEvent | null;
  isOpen: boolean;
  onClose: () => void;
  zIndex?: number;
  isTopmost?: boolean;
}

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
    <span className="text-sm text-slate-700 font-medium break-all">{value || '—'}</span>
  </div>
);

const AppEventDetailDrawer: React.FC<Props> = ({
  event,
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
        className={`fixed top-0 right-0 h-full w-[460px] bg-white border-l border-gray-200 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ zIndex: zIndex + 1 }}
      >
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${TAB_COLORS.Event}1A` }}
            >
              <APP_ICONS.EVENT size={20} style={{ color: TAB_COLORS.Event }} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {event
                  ? APP_EVENT_FRIENDLY[event.eventType as keyof typeof APP_EVENT_FRIENDLY] ?? event.eventType
                  : 'Event Detail'}
              </h3>
              {event && (
                <p className="text-xs text-gray-400">
                  {APP_USER_NAMES[event.userId] ?? event.userId} · {event.platform}
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
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              No event selected
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AppEventDetailDrawer;
