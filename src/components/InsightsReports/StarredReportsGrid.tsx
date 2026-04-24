import React, { useState } from 'react';
import { UnifiedReport } from '../../data/ReportTypes';
import { mockReportHistoryData } from '../../data/mockReportHistoryData';
import { formatLastRun } from '../../utils/dateUtils';
import { getReportSourceStyle } from '../../utils/reportUtils';
import { 
  EmailIcon, 
  StarIcon, 
  SortIcon, 
  ChevronUpIcon, 
  ChevronDownIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon 
} from '../Common/Icons';
import { RunNowButton } from './RunNowButton';
import { DistributeNowButton } from './DistributeNowButton';

interface Props {
  reports: UnifiedReport[];
  totalStarredCount: number;
  onToggleStar: (id: string) => void;
  onRunReport: (report: UnifiedReport) => void;
  onDistributeReport: (report: UnifiedReport) => void;
  // Paging & Sorting Props
  currentPage: number;
  itemsPerPage: number;
  totalStarredPages: number;
  onPageChange: (page: number | ((prev: number) => number)) => void;
  onItemsPerPageChange: (val: number) => void;
  sortBy: string;
  onSortChange: (val: any) => void;
}

const StarredReportsGrid: React.FC<Props> = ({ 
  reports, 
  totalStarredCount,
  onToggleStar, 
  onRunReport,
    onDistributeReport,
  currentPage,
  itemsPerPage,
  totalStarredPages,
  onPageChange,
  onItemsPerPageChange,
  sortBy,
  onSortChange
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* HEADER SECTION */}
      <div className="px-5 py-3 flex justify-between items-center border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <StarIcon />
          <h2 className="text-lg font-semibold text-slate-800">Starred Reports</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg shadow-sm bg-white cursor-pointer">
            <SortIcon size={14} className="text-gray-400" />
            <select 
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="text-sm font-normal text-slate-700 bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
            >
              <option value="Recent">Last Run</option>
              <option value="Name">Name A-Z</option>
              <option value="Module">Module</option>
            </select>
          </div>
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-400 hover:text-slate-600 transition-colors">
            {isExpanded ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="pt-6 px-6 pb-2 bg-slate-50/40">
            {reports.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                {reports.map((report) => {
                  const sourceStyle = getReportSourceStyle(report.sourceType);
                  const latestSuccess = mockReportHistoryData
                    .filter(h => h.reportId === report.id && h.status === 'Success')
                    .sort((a, b) => new Date(b.runDate).getTime() - new Date(a.runDate).getTime())[0];

                  return (
                    <div key={report.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm relative hover:shadow-md transition-all flex flex-col h-full">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{report.module}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-semibold text-slate-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{report.dataSource}</span>
                          <button onClick={() => onToggleStar(report.id)} className="transition-transform hover:scale-110 active:scale-95">
                            <StarIcon size={16} className={report.isStarred ? "text-orange-400 fill-orange-400" : "text-gray-300"} />
                          </button>
                        </div>
                      </div>
                      <div className="mb-4">
                        <h4 className="text-sm font-bold text-slate-800 leading-tight mb-1">{report.name}</h4>
                        <p className="text-[11px] text-gray-500 italic truncate">{report.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-50 mb-4">
                        <div>
                          <p className="text-[8px] text-gray-400 uppercase font-bold tracking-tighter mb-1">Type</p>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${sourceStyle.bg} ${sourceStyle.text} ${sourceStyle.border}`}>{sourceStyle.text}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-[8px] text-gray-400 uppercase font-bold tracking-tighter mb-1">Last Run</p>
                          <span className="text-[10px] font-medium text-primary">{formatLastRun(latestSuccess?.runDate || null)}</span>
                        </div>
                      </div>
                      {/* 4. FOOTER ACTIONS */}
<div className="flex items-center justify-center mt-auto pt-3 border-t border-gray-100">
  <div className="flex gap-6">
    {/* Run Button */}
    <RunNowButton 
      onClick={() => onRunReport(report)} 
      reportName={report.name} 
    />
    
    {/* Distribute Button */}
    <DistributeNowButton 
      onClick={() => onDistributeReport(report)} // Keep this as is if they share logic, or point to onDistribute
      reportName={report.name} 
    />

    {/* RESTORED: Email Button */}
    <button 
      className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 transition-colors group"
      onClick={() => console.log('Email triggered for:', report.name)} // Hook up your email logic here
    >
      <EmailIcon size={14} className="group-hover:stroke-[3px]" />
      <span className="text-[10px] font-bold uppercase tracking-tight">Email</span>
    </button>
  </div>
</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-400 text-sm italic">No starred reports matched.</div>
            )}
          </div>

          {/* PAGINATION SECTION */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-white">
            <div className="flex items-center gap-6">
              <span className="text-[12px] text-gray-500 font-medium">
                Showing {totalStarredCount === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalStarredCount)} of {totalStarredCount}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-gray-400">Show</span>
                <select 
                  value={itemsPerPage}
                  onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                  className="text-[12px] font-semibold text-slate-700 border border-gray-200 rounded-lg py-1 px-2 outline-none bg-white cursor-pointer"
                >
                  <option value={4}>4</option>
                  <option value={8}>8</option>
                  <option value={12}>12</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => onPageChange(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30">
                <ChevronLeftIcon size={16} />
              </button>
              <span className="text-[12px] font-bold text-slate-700">Page {currentPage} of {totalStarredPages || 1}</span>
              <button onClick={() => onPageChange(p => Math.min(p + 1, totalStarredPages))} disabled={currentPage >= totalStarredPages} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30">
                <ChevronRightIcon size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default StarredReportsGrid;