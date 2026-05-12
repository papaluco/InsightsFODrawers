import { useEffect, useState } from 'react';
import { X, Users, AlertCircle, Zap, MousePointer } from 'lucide-react';
import type { TelemetryEvent, ErrorTelemetryEvent, PerformanceTelemetryEvent } from '../../../telemetry/types';
import type { SessionRow } from '../../../services/sessionsService';
import { getSessionTimeline } from '../../../services/sessionsService';
import { HEALTH_BADGE, fmtTs, fmtTsFull, fmtDuration } from './sessionsHelpers';
import { SEV_BADGE } from '../errors/errorHelpers';
import { fmtMs } from '../performance/perfHelpers';

interface Props {
  session: SessionRow | null;
  isOpen: boolean;
  onClose: () => void;
  zIndex: number;
}

function DomainIcon({ domain }: { domain: string }) {
  if (domain === 'error')       return <AlertCircle size={12} className="text-rose-500 shrink-0" />;
  if (domain === 'performance') return <Zap         size={12} className="text-amber-500 shrink-0" />;
  return                               <MousePointer size={12} className="text-blue-400 shrink-0" />;
}

function TimelineEvent({ e }: { e: TelemetryEvent }) {
  const isError = e.eventDomain === 'error';
  const isPerf  = e.eventDomain === 'performance';
  const err     = isError ? e as ErrorTelemetryEvent : null;
  const perf    = isPerf  ? e as PerformanceTelemetryEvent : null;

  return (
    <div className={`flex gap-3 group`}>
      {/* timeline line + dot */}
      <div className="flex flex-col items-center">
        <div className={`w-2.5 h-2.5 rounded-full mt-0.5 shrink-0 ${
          isError ? 'bg-rose-400' : isPerf ? (perf!.isSlow ? 'bg-amber-400' : 'bg-emerald-400') : 'bg-blue-300'
        }`} />
        <div className="w-px flex-1 bg-gray-100 my-0.5" />
      </div>

      {/* content */}
      <div className="pb-3 flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <DomainIcon domain={e.eventDomain} />
          <span className="font-mono text-xs text-gray-700 truncate">{e.eventName}</span>
          {err && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold capitalize shrink-0 ${SEV_BADGE[err.severity]}`}>
              {err.severity}
            </span>
          )}
          {perf && perf.isSlow && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-700 shrink-0">slow</span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-gray-400">{fmtTs(e.timestamp)}</span>
          {e.module    && <span className="text-[10px] text-gray-400">· {e.module}</span>}
          {e.component && <span className="text-[10px] text-gray-400">· {e.component}</span>}
          {perf        && <span className="text-[10px] font-semibold text-amber-600">{fmtMs(perf.durationMs)}</span>}
          {err?.isUserBlocking && <span className="text-[10px] font-semibold text-rose-600">· blocking</span>}
        </div>
        {err?.message && (
          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{err.message}</p>
        )}
      </div>
    </div>
  );
}

const SessionTimelineDrawer: React.FC<Props> = ({ session, isOpen, onClose, zIndex }) => {
  const [timeline, setTimeline] = useState<TelemetryEvent[]>([]);
  const [tlLoading, setTlLoading] = useState(false);

  useEffect(() => {
    if (!session) { setTimeline([]); return; }
    let cancelled = false;
    setTlLoading(true);
    getSessionTimeline(session.sessionId).then(events => {
      if (!cancelled) { setTimeline(events); setTlLoading(false); }
    }).catch(() => { if (!cancelled) setTlLoading(false); });
    return () => { cancelled = true; };
  }, [session]);

  const errCount   = timeline.filter(e => e.eventDomain === 'error').length;
  const perfCount  = timeline.filter(e => e.eventDomain === 'performance').length;
  const usageCount = timeline.filter(e => e.eventDomain === 'usage').length;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20"
          style={{ zIndex: zIndex - 1 }}
          onClick={onClose}
        />
      )}
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-lg bg-white border-l border-gray-200 flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ zIndex }}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-blue-500" />
            <h3 className="text-sm font-bold text-gray-800">Session Timeline</h3>
            {session && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${HEALTH_BADGE[session.health]}`}>
                {session.health}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {session ? (
            <>
              {/* Session metadata */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Session ID</p>
                <p className="font-mono text-xs text-gray-700 break-all">{session.sessionId}</p>
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">First Seen</p>
                    <p className="text-xs text-gray-700 mt-0.5">{fmtTsFull(session.firstSeen)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Seen</p>
                    <p className="text-xs text-gray-700 mt-0.5">{fmtTsFull(session.lastSeen)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duration</p>
                    <p className="text-xs text-gray-700 mt-0.5">{fmtDuration(session.durationMs)}</p>
                  </div>
                </div>
                {(session.districtId || session.userId) && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    {session.districtId && (
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">District</p>
                        <p className="text-xs text-gray-700 mt-0.5">{session.districtId}</p>
                      </div>
                    )}
                    {session.userId && (
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">User</p>
                        <p className="text-xs text-gray-700 mt-0.5">{session.userId}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Event summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
                  <p className="text-xl font-bold text-blue-700">{usageCount}</p>
                  <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-wide mt-0.5">Usage</p>
                </div>
                <div className="bg-rose-50 rounded-lg p-3 text-center border border-rose-100">
                  <p className="text-xl font-bold text-rose-700">{errCount}</p>
                  <p className="text-[10px] text-rose-500 font-semibold uppercase tracking-wide mt-0.5">Errors</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3 text-center border border-amber-100">
                  <p className="text-xl font-bold text-amber-700">{perfCount}</p>
                  <p className="text-[10px] text-amber-500 font-semibold uppercase tracking-wide mt-0.5">Perf</p>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Event Timeline ({timeline.length} events)
                </p>
                {tlLoading ? (
                  <p className="text-sm text-gray-400 text-center py-6 animate-pulse">Loading timeline…</p>
                ) : timeline.length > 0 ? (
                  <div className="pl-1">
                    {timeline.map((e, i) => (
                      <TimelineEvent key={`${e.eventId}-${i}`} e={e} />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-6">No events for this session</p>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400 text-center mt-12">Select a session to view its timeline</p>
          )}
        </div>
      </div>
    </>
  );
};

export default SessionTimelineDrawer;
