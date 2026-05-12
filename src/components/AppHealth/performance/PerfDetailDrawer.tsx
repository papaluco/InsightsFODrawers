import { X, Zap } from 'lucide-react';
import type { PerformanceTelemetryEvent } from '../../../telemetry/types';
import { CAT_LABEL, fmtMs, fmtTsFull, durationColor } from './perfHelpers';

interface Props {
  event: PerformanceTelemetryEvent | null;
  isOpen: boolean;
  onClose: () => void;
  zIndex: number;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      <span className="text-sm text-gray-800 break-words">{value ?? <span className="text-gray-300">—</span>}</span>
    </div>
  );
}

const PerfDetailDrawer: React.FC<Props> = ({ event, isOpen, onClose, zIndex }) => {
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
        className={`fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-gray-200 flex flex-col shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ zIndex }}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-amber-500" />
            <h3 className="text-sm font-bold text-gray-800">Performance Detail</h3>
            {event && (
              <span className={`text-xs font-semibold ${event.isSlow ? 'text-orange-500' : 'text-emerald-600'}`}>
                {event.isSlow ? '• Slow' : '• Fast'}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {event ? (
            <>
              {/* Duration hero */}
              <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-100">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Duration</p>
                  <p className={`text-4xl font-bold ${durationColor(event.durationMs)}`}>{fmtMs(event.durationMs)}</p>
                </div>
                {event.thresholdMs != null && (
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Threshold</p>
                    <p className="text-2xl font-bold text-gray-400">{fmtMs(event.thresholdMs)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {Math.round(event.durationMs / event.thresholdMs * 100)}% of limit
                    </p>
                  </div>
                )}
              </div>

              {/* Identity */}
              <div className="space-y-3">
                <Row label="Event Name" value={<span className="font-mono text-xs">{event.eventName}</span>} />
                <Row label="Timestamp"  value={fmtTsFull(event.timestamp)} />
                <Row label="Event ID"   value={<span className="font-mono text-xs text-gray-500">{event.eventId}</span>} />
              </div>

              <div className="border-t border-gray-100" />

              {/* Classification */}
              <div className="space-y-3">
                <Row label="Category"
                  value={
                    <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-medium border border-amber-100">
                      {CAT_LABEL[event.performanceCategory] ?? event.performanceCategory}
                    </span>
                  }
                />
                <Row label="Status"
                  value={
                    event.success
                      ? <span className="text-xs font-semibold text-emerald-600">Success</span>
                      : <span className="text-xs font-semibold text-rose-600">Failed</span>
                  }
                />
              </div>

              <div className="border-t border-gray-100" />

              {/* Context */}
              <div className="space-y-3">
                <Row label="Module"     value={event.module} />
                {event.component && <Row label="Component" value={event.component} />}
                {event.page      && <Row label="Page"      value={event.page} />}
                <Row label="Session ID" value={<span className="font-mono text-xs text-gray-500">{event.sessionId}</span>} />
                {event.districtId && <Row label="District"  value={event.districtId} />}
                {event.userId     && <Row label="User"      value={event.userId} />}
              </div>

              {/* Correlation */}
              {(event.correlationId || event.workflowId || event.parentEventId) && (
                <>
                  <div className="border-t border-gray-100" />
                  <div className="space-y-3">
                    {event.correlationId  && <Row label="Correlation ID"  value={<span className="font-mono text-xs text-gray-500">{event.correlationId}</span>} />}
                    {event.workflowId     && <Row label="Workflow ID"     value={<span className="font-mono text-xs text-gray-500">{event.workflowId}</span>} />}
                    {event.parentEventId  && <Row label="Parent Event ID" value={<span className="font-mono text-xs text-gray-500">{event.parentEventId}</span>} />}
                  </div>
                </>
              )}

              {/* Extra properties */}
              {event.properties && Object.keys(event.properties).length > 0 && (
                <>
                  <div className="border-t border-gray-100" />
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Properties</span>
                    <pre className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 border border-gray-100 overflow-x-auto font-mono">
                      {JSON.stringify(event.properties, null, 2)}
                    </pre>
                  </div>
                </>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400 text-center mt-12">Select a row to view details</p>
          )}
        </div>
      </div>
    </>
  );
};

export default PerfDetailDrawer;
