import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { InsightsUsageEvent, INSIGHTS_EVENT_FRIENDLY } from '../../../types/insightsUsageTypes';
import { INSIGHTS_USER_NAMES, INSIGHTS_DISTRICT_NAMES } from '../../../data/mockInsightsUsageData';

interface Props {
  event: InsightsUsageEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

const EVENT_BADGE: Record<string, string> = {
  INSIGHTS_PAGE_VIEWED:      'bg-indigo-50 text-indigo-700 border-indigo-200',
  KPI_DRAWER_OPENED:         'bg-emerald-50 text-emerald-700 border-emerald-200',
  TREND_KPI_CHANGED:         'bg-amber-50 text-amber-700 border-amber-200',
  KPI_DRAWER_DOWNLOAD:       'bg-orange-50 text-orange-700 border-orange-200',
  DASHBOARD_DOWNLOAD:        'bg-orange-50 text-orange-700 border-orange-200',
  KPI_SCHOOLIE_OPENED:       'bg-purple-50 text-purple-700 border-purple-200',
  DASHBOARD_SCHOOLIE_OPENED: 'bg-violet-50 text-violet-700 border-violet-200',
  DATE_RANGE_CHANGED:        'bg-cyan-50 text-cyan-700 border-cyan-200',
  SITE_FILTER_CHANGED:       'bg-blue-50 text-blue-700 border-blue-200',
  BENCHMARK_CONFIG_OPENED:   'bg-rose-50 text-rose-700 border-rose-200',
  BENCHMARK_UPDATED:         'bg-red-50 text-red-700 border-red-200',
  BULK_UPDATE:               'bg-pink-50 text-pink-700 border-pink-200',
  LAYOUT_CONFIG_CHANGED:     'bg-teal-50 text-teal-700 border-teal-200',
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

const InsightsEventDetailDrawer: React.FC<Props> = ({ event, isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
    };
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  const userName = event ? (INSIGHTS_USER_NAMES[event.userId] ?? event.userId) : '';
  const districtName = event ? (INSIGHTS_DISTRICT_NAMES[event.districtId] ?? event.districtId) : '';
  const friendlyType = event ? (INSIGHTS_EVENT_FRIENDLY[event.eventType] ?? event.eventType) : '';
  const badgeClass = event ? (EVENT_BADGE[event.eventType] ?? 'bg-slate-50 text-slate-600 border-slate-200') : '';

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
              <div className={`flex items-center gap-3 p-3 rounded-xl border ${badgeClass}`}>
                <span className="font-semibold text-sm">{friendlyType}</span>
                <span className="ml-auto text-[11px] text-gray-400 whitespace-nowrap">
                  {new Date(event.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

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

              {(event.context.kpi || event.context.isDistrictDrawer != null || event.context.format || event.context.site) && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Event Details</h4>
                  <dl>
                    <Row label="KPI" value={event.context.kpi} />
                    <Row label="Site" value={event.context.site} />
                    <Row label="Format" value={event.context.format} />
                    {event.context.isDistrictDrawer != null && (
                      <Row label="District Drawer" value={event.context.isDistrictDrawer ? 'Yes' : 'No'} />
                    )}
                    <Row label="Entry Point" value={event.context.entryPoint} />
                  </dl>
                </div>
              )}

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Raw Context</h4>
                <pre className="text-[11px] text-slate-600 bg-slate-50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(event.context, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default InsightsEventDetailDrawer;
