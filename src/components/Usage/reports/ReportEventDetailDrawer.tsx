import React, { useEffect } from 'react';
import { X, Eye, Play, Download, Mail, Share2, Settings } from 'lucide-react';
import { ReportUsageEvent, ReportEventType } from '../../../types/reportUsageTypes';
import { getUsageEventFriendlyName } from '../../../constants/usageEventTypes';
import { REPORT_USER_NAMES, REPORT_DISTRICT_NAMES } from '../../../data/mockReportUsageData';

interface Props {
  event: ReportUsageEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

const EVENT_ICONS: Record<ReportEventType, React.ReactNode> = {
  REPORT_VIEWED: <Eye size={15} className="text-indigo-600" />,
  REPORT_RUN: <Play size={15} className="text-emerald-600" />,
  REPORT_DOWNLOADED: <Download size={15} className="text-amber-600" />,
  REPORT_EMAILED: <Mail size={15} className="text-blue-600" />,
  REPORT_DISTRIBUTED: <Share2 size={15} className="text-violet-600" />,
  REPORT_CONFIG_VIEWED: <Settings size={15} className="text-slate-500" />,
};

const EVENT_BADGE: Record<ReportEventType, string> = {
  REPORT_VIEWED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  REPORT_RUN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  REPORT_DOWNLOADED: 'bg-amber-50 text-amber-700 border-amber-200',
  REPORT_EMAILED: 'bg-blue-50 text-blue-700 border-blue-200',
  REPORT_DISTRIBUTED: 'bg-violet-50 text-violet-700 border-violet-200',
  REPORT_CONFIG_VIEWED: 'bg-slate-50 text-slate-600 border-slate-200',
};

const Row: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => {
  if (value == null || value === '') return null;
  return (
    <div className="grid grid-cols-3 gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <dt className="text-xs font-medium text-gray-400 pt-0.5">{label}</dt>
      <dd className="text-sm text-gray-800 col-span-2">{String(value)}</dd>
    </div>
  );
};

const ReportEventDetailDrawer: React.FC<Props> = ({ event, isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  const userName = event ? (REPORT_USER_NAMES[event.userId] ?? event.userId) : '';
  const districtName = event ? (REPORT_DISTRICT_NAMES[event.districtId] ?? event.districtId) : '';

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[59] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div className={`fixed inset-y-0 right-0 w-1/4 min-w-80 bg-white z-[60] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="px-5 py-4 bg-white border-b border-gray-200 flex items-center justify-between shrink-0">
          <h3 className="text-base font-bold text-slate-800">Event Detail</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {event && (
            <>
              {/* Event type banner */}
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${EVENT_BADGE[event.eventType]}`}>
                {EVENT_ICONS[event.eventType]}
                <span className="font-semibold text-sm">{getUsageEventFriendlyName(event.eventType)}</span>
                <span className="ml-auto text-[11px] text-gray-400 whitespace-nowrap">
                  {new Date(event.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              {/* User & context */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">User & Context</h4>
                <dl>
                  <Row label="User" value={userName} />
                  <Row label="District" value={districtName} />
                  <Row label="Platform" value={event.platform} />
                  <Row label="Session" value={event.sessionId} />
                  <Row label="Timestamp" value={new Date(event.timestamp).toLocaleString()} />
                </dl>
              </div>

              {/* Report info */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Report</h4>
                <dl>
                  <Row label="Name" value={event.context.reportName} />
                  <Row label="Type" value={event.context.reportType} />
                  <Row label="Module" value={event.context.module} />
                  <Row label="Data Source" value={event.context.dataSource} />
                  <Row label="Entry Point" value={event.context.entryPoint} />
                  <Row label="Report ID" value={event.context.reportId} />
                </dl>
              </div>

              {/* Event-specific details */}
              {(event.context.format || event.context.recipientCount != null || event.context.distributionType) && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Details</h4>
                  <dl>
                    <Row label="Format" value={event.context.format} />
                    <Row label="Distribution Type" value={event.context.distributionType} />
                    <Row label="Recipients" value={event.context.recipientCount} />
                    {event.context.isDistributed && <Row label="Distributed" value="Yes" />}
                    {event.context.isStarred && <Row label="Starred" value="Yes" />}
                  </dl>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ReportEventDetailDrawer;
