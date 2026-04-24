import React, { useState } from 'react';
import { UnifiedReport, ReportSource } from '../../data/ReportTypes';
import { mockReportHistoryData } from '../../data/mockReportHistoryData';
import { formatLastRun } from '../../utils/dateUtils';
import { getReportSourceStyle } from '../../utils/reportUtils'; 
import ReportActionMenu from './ReportActionMenu';
import { RunNowButton } from './RunNowButton';
import { ReportPaging } from './ReportPaging';
import { 
  StarIcon, 
  ReportIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '../Common/Icons';

interface Props {
  reports: UnifiedReport[];
  totalReportsCount: number; // Added so the paging knows the full count
  onRunReport: (report: UnifiedReport) => void;
  onDistributeReport: (report: UnifiedReport) => void;
  onToggleStar: (id: string) => void;
  onViewHistory: (id: string, name: string) => void;
  onViewConfig: (report: UnifiedReport) => void;
  
  // Paging Props
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (val: number) => void;
  
  // Sorting Props
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
}

const ReportListTable: React.FC<Props> = ({ 
  reports, 
  totalReportsCount,
  onRunReport,
  onDistributeReport,
  onToggleStar, 
  onViewHistory, 
  onViewConfig,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  sortField,
  sortDirection,
  onSort
}) => {
  // Logic-only: Internal state for the collapse toggle
  const [isExpanded, setIsExpanded] = useState(true);

  // Helper for sort indicators
  const SortIndicator = ({ column }: { column: string }) => {
    if (sortField !== column) return null;
    return <span className="ml-1 text-blue-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  const renderSourceBadge = (source: ReportSource) => {
    const style = getReportSourceStyle(source);
    return (
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${style.bg} ${style.border}`}>
        {style.text}
      </span>
    );
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* HEADER SECTION - MOVED FROM CONTAINER */}
      <div className="px-5 py-4 flex justify-between items-center border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <ReportIcon />
          <h2 className="text-lg font-semibold text-slate-800">Full Report Directory</h2>
        </div>
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-400 hover:text-slate-600">
          {isExpanded ? <ChevronUpIcon size={20} /> : <ChevronDownIcon size={20} />}
        </button>
      </div>

      {isExpanded && (
        <>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed">
              <thead className="bg-white border-b border-gray-200">
                <tr>
                  <th className="w-10 px-4 py-3"></th>
                  <th className="w-20 px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">TYPE</th>
                  <th 
                    className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-slate-800" 
                    onClick={() => onSort('name')}
                  >
                    <div className="flex items-center">NAME <SortIndicator column="name" /></div>
                  </th>
                  <th 
                    className="w-40 px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-slate-800" 
                    onClick={() => onSort('module')}
                  >
                    <div className="flex items-center">MODULE <SortIndicator column="module" /></div>
                  </th>
                  <th 
                    className="w-48 px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-slate-800" 
                    onClick={() => onSort('dataSource')}
                  >
                    <div className="flex items-center">DATA SOURCE <SortIndicator column="dataSource" /></div>
                  </th>
                  <th className="w-32 px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">LAST RUN</th>
                  <th className="w-40 px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {reports.map((report) => {
                  const latestRun = mockReportHistoryData
                    .filter(h => h.reportId === report.id && h.status === 'Success')
                    .sort((a, b) => new Date(b.runDate).getTime() - new Date(a.runDate).getTime())[0];

                  return (
                    <tr key={report.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="w-10 px-4 py-4">
                        <button onClick={() => onToggleStar(report.id)} className="focus:outline-none">
                          <StarIcon size={18} className={report.isStarred ? "text-orange-400 fill-orange-400" : "text-gray-200 hover:text-gray-300"} />
                        </button>
                      </td>
                      <td className="w-20 px-4 py-4">{renderSourceBadge(report.sourceType)}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-slate-700 truncate">{report.name}</td>
                      <td className="w-40 px-4 py-4 text-sm text-slate-600">{report.module}</td>
                      <td className="w-48 px-4 py-4 text-sm text-slate-600">{report.dataSource}</td>
                      <td className="w-32 px-4 py-4 text-sm text-slate-600">{latestRun ? formatLastRun(latestRun.runDate) : "Never"}</td>
                      <td className="w-40 px-4 py-4">
                        <div className="flex justify-end gap-2 items-center">
                          <RunNowButton onClick={() => onRunReport(report)} reportName={report.name} />
                          <ReportActionMenu 
                            report={report} 
                            onViewHistory={onViewHistory} 
                            onViewConfig={onViewConfig}
                            onDistributeReport={onDistributeReport}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* PAGING SECTION - MOVED FROM CONTAINER */}
          <ReportPaging
            currentPage={currentPage}
            totalItems={totalReportsCount}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
            showAllOption={true}
          />
        </>
      )}
    </section>
  );
};

export default ReportListTable;