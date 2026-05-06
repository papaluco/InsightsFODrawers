import React, { useState, useEffect } from 'react';
import { ReportHistoryItem, ReportSource } from '../../types/ReportTypes';
import { formatLastRun } from '../../utils/dateUtils';
import { getReportSourceStyle } from '../../utils/reportUtils';
import {
  DownloadIcon,
  ReportIcon,
  ChevronUpIcon,
  RefreshIcon,
  XIcon
} from '../Common/Icons';

type SidebarFilter = 'all' | 'reports' | 'downloads';

interface Props {
  history: ReportHistoryItem[];
  onViewAllHistory: () => void;
}

const renderTypeBadge = (item: ReportHistoryItem) => {
  const style = getReportSourceStyle(item.sourceType);
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${style.bg} ${style.border}`}>
      {style.text}
    </span>
  );
};

const FILTER_CHIPS: { id: SidebarFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'reports', label: 'Reports' },
  { id: 'downloads', label: 'Downloads' },
];

const LatestReportsSidebar: React.FC<Props> = ({ history, onViewAllHistory }) => {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [confirmedReportId, setConfirmedReportId] = useState<string | null>(null);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [, setTick] = useState(0);
  const [activeFilter, setActiveFilter] = useState<SidebarFilter>('all');

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  // Each chip gets its own independent top-10 slice — filtering "Reports" shows 10 reports,
  // not just the non-download subset of the "All" top-10.
  const recent = [...history]
    .filter(item => new Date(item.runDate) >= twoWeeksAgo)
    .sort((a, b) => new Date(b.runDate).getTime() - new Date(a.runDate).getTime());

  const displayHistory = (
    activeFilter === 'downloads'
      ? recent.filter(item => item.sourceType === ReportSource.Download)
      : activeFilter === 'reports'
        ? recent.filter(item => item.sourceType !== ReportSource.Download)
        : recent
  ).slice(0, 10);

  const handleRetryConfirm = (id: string) => {
    if (cooldowns[id] && Date.now() < cooldowns[id]) return;
    setSelectedReportId(null);
    setConfirmedReportId(id);
    setCooldowns(prev => ({ ...prev, [id]: Date.now() + 120000 }));
  };

  return (
    <div className="flex flex-col bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-gray-100 bg-white">
        {/* Row 1: icon + title + chevron */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-3">
            <ReportIcon className="text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-800 tracking-tight">
              Latest Reports &amp; Downloads
            </h2>
          </div>
          <button className="text-gray-400 hover:text-slate-600 transition-colors">
            <ChevronUpIcon size={20} />
          </button>
        </div>
        {/* Row 2: View All + filter chips */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={onViewAllHistory}
            className="text-[11px] font-bold text-primary hover:text-primary/80 uppercase tracking-tight transition-colors whitespace-nowrap"
          >
            View All
          </button>
          <div className="flex gap-1">
            {FILTER_CHIPS.map(chip => (
              <button
                key={chip.id}
                onClick={() => setActiveFilter(chip.id)}
                className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border transition-colors ${
                  activeFilter === chip.id
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {displayHistory.map((item) => {
          const isProcessing = !!(cooldowns[item.id] && Date.now() < cooldowns[item.id]);

          return (
            <div key={item.id} className="border-b border-gray-50 last:border-0">
              <div className="group relative px-4 py-3 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div
                        className={`h-1.5 w-1.5 rounded-full shrink-0 transition-all duration-500 ${
                          isProcessing
                            ? 'bg-amber-400 animate-pulse shadow-[0_0_4px_rgba(251,191,36,0.6)]'
                            : item.status === 'Success'
                              ? 'bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]'
                              : 'bg-rose-500'
                        }`}
                      />
                      <p className="text-sm font-semibold text-slate-700 truncate">
                        {item.name}
                      </p>
                    </div>
                    {/* Type chip + timestamp row */}
                    <div className="flex items-center gap-1.5 pl-3">
                      {renderTypeBadge(item)}
                      <p className="text-[10px] text-gray-500">
                        {formatLastRun(item.runDate)}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {item.status === 'Success' ? (
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-slate-600 p-1.5 block"
                        title="Download Report"
                      >
                        <DownloadIcon size={16} />
                      </a>
                    ) : (
                      <button
                        disabled={isProcessing}
                        onClick={() => {
                          if (isProcessing) return;
                          setSelectedReportId(selectedReportId === item.id ? null : item.id);
                          setConfirmedReportId(null);
                        }}
                        className={`flex items-center gap-1 font-bold text-[10px] uppercase p-1.5 transition-all rounded-md ${
                          isProcessing
                            ? 'text-slate-400 cursor-not-allowed bg-slate-100'
                            : 'text-rose-500 hover:text-rose-700 hover:bg-rose-50'
                        }`}
                      >
                        <RefreshIcon size={12} className={isProcessing ? 'animate-spin' : ''} />
                        {isProcessing ? 'Pending...' : 'Retry'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {(selectedReportId === item.id || confirmedReportId === item.id) && (
                <div className="bg-amber-50 border-y border-amber-100 px-4 py-3 relative animate-in slide-in-from-top-1">
                  <button
                    onClick={() => { setSelectedReportId(null); setConfirmedReportId(null); }}
                    className="absolute top-2.5 right-2.5 text-amber-900/40 hover:text-amber-900 transition-colors"
                  >
                    <XIcon size={14} />
                  </button>
                  {selectedReportId === item.id ? (
                    <>
                      <p className="text-[11px] font-bold text-amber-900 mb-2 uppercase tracking-tight">Distribute this report now?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRetryConfirm(item.id)}
                          className="bg-primary text-white text-[10px] font-bold px-3 py-1.5 rounded hover:bg-primary/90 uppercase"
                        >
                          Yes, Distribute
                        </button>
                        <button
                          onClick={() => setSelectedReportId(null)}
                          className="bg-white border border-amber-200 text-amber-700 text-[10px] font-bold px-3 py-1.5 rounded uppercase"
                        >
                          No
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-[11px] font-bold text-amber-800 leading-tight pr-8">
                      Report has been scheduled and will be distributed as per the configuration if successful.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default React.memo(LatestReportsSidebar);
