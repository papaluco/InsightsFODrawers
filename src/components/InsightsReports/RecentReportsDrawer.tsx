import React, { useState, useMemo } from 'react';
import { mockReportHistoryData, ReportHistoryItem } from '../../data/mockReportHistoryData';
import {
    ReportIcon,
    XIcon,
    FilterIcon,
    ViewIcon,
    SettingsIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from '../Common/Icons';
import { getReportSourceStyle } from '../../utils/reportUtils';
import { ReportSource } from '../../data/ReportTypes';
import { ReportPaging } from './ReportPaging';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    reportId?: string | null; // Parameter to filter by specific report
    reportName?: string | null;
    onViewConfig: (reportId: string) => void; // New prop for the config action
}

const renderSourceBadge = (source: ReportSource) => {
    const style = getReportSourceStyle(source);
    return (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${style.bg} ${style.border}`}>
            {style.text}
        </span>
    );
};

const RecentReportsDrawer: React.FC<Props> = ({ isOpen, onClose, reportId, reportName, onViewConfig }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [sortConfig, setSortConfig] = useState<{ key: keyof ReportHistoryItem, direction: 'asc' | 'desc' }>({
        key: 'runDate',
        direction: 'desc'
    });

    // Filter logic based on reportId parameter and search term
    const filteredHistory = useMemo(() => {
        let data = [...mockReportHistoryData];

        if (reportId) {
            data = data.filter(h => h.reportId === reportId);
        }

        if (searchTerm) {
            data = data.filter(h =>
                h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                h.module.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return data.sort((a, b) => {
            const aValue = a[sortConfig.key] ?? '';
            const bValue = b[sortConfig.key] ?? '';

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [reportId, searchTerm, sortConfig]);

    // Pagination logic
    const pagedData = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSort = (key: keyof ReportHistoryItem) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity" onClick={onClose} />
            )}

            {/* Drawer Container */}
            <div className={`fixed top-0 right-0 h-full w-[800px] bg-slate-50 shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">

                    {/* Header - Matching Sidebar Style */}
                    <div className="px-6 py-5 bg-white border-b border-gray-200 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <ReportIcon className="text-primary" size={24} />
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">
                                    Recent Reports
                                </h2>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{reportId ? `History: ${reportName}` : 'All Recently Run Reports'}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-slate-600">
                            <XIcon size={24} />
                        </button>
                    </div>

                    {/* Search Filter Section */}
                    <div className="px-6 py-4 bg-white border-b border-gray-100 flex justify-end">
                        <div className="relative w-1/4">
                            <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search reports by name or module..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Grid Section - Adjusted for better spacing and vertical density */}
                    <div className="flex-initial overflow-hidden flex flex-col p-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col flex-1">
                            <div className="overflow-y-auto flex-1 no-scrollbar">
                                <table className="w-full text-left border-collapse table-fixed">
                                    <thead className="bg-white border-b border-gray-200 sticky top-0 z-10">
                                        <tr>
                                            <th className="w-10 px-2 py-3"></th>
                                            <th className="w-20 px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">TYPE</th>
                                            <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-slate-800" onClick={() => handleSort('name')}>
                                                <div className="flex items-center gap-1">
                                                    Name
                                                    {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronUpIcon size={14} /> : <ChevronDownIcon size={14} />)}
                                                </div>
                                            </th>
                                            <th className="w-44 px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Module</th>
                                            <th className="w-40 px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-slate-800" onClick={() => handleSort('runDate')}>
                                                <div className="flex items-center gap-1">
                                                    Run Date/Time
                                                    {sortConfig.key === 'runDate' && (sortConfig.direction === 'asc' ? <ChevronUpIcon size={14} /> : <ChevronDownIcon size={14} />)}
                                                </div>
                                            </th>
                                            <th className="w-24 px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {pagedData.map((run) => (
                                            <tr key={run.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-2 py-2 whitespace-nowrap text-center">
                                                    <div className="flex justify-center">
                                                        <div className={`h-1.5 w-1.5 rounded-full ${run.status === 'Success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                    </div>
                                                </td>
                                                <td className="w-20 px-4 py-2 whitespace-nowrap">
                                                    {renderSourceBadge(run.sourceType)}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <div className="text-sm font-semibold text-slate-700 truncate">{run.name}</div>
                                                </td>
                                                <td className="px-4 py-2 text-sm text-slate-600 truncate">{run.module}</td>
                                                <td className="px-4 py-2 text-[12px] font-medium text-slate-500 whitespace-nowrap">
                                                    {new Date(run.runDate).toLocaleString([], {
                                                        year: 'numeric', month: '2-digit', day: '2-digit',
                                                        hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </td>
                                                <td className="px-4 py-2">
                                                    <div className="flex justify-end gap-1">
                                                        <a
                                                            href={run.fileUrl || '#'}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={`p-1.5 rounded-md transition-all ${run.fileUrl
                                                                    ? 'text-gray-400 hover:text-primary hover:bg-blue-50'
                                                                    : 'text-gray-200 cursor-not-allowed'
                                                                }`}
                                                            title={run.fileUrl ? "View Report" : "No link available"}
                                                            onClick={(e) => !run.fileUrl && e.preventDefault()}
                                                        >
                                                            <ViewIcon size={16} />
                                                        </a>

                                                        {/* Updated Button logic */}
                                                        <button 
                                                            className="p-1.5 text-gray-400 hover:text-slate-600 hover:bg-gray-100 rounded-md transition-all" 
                                                            title="View Configuration"
                                                            onClick={() => onViewConfig(run.reportId)}
                                                        >
                                                            <SettingsIcon size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {pagedData.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="py-20 text-center text-gray-400 italic text-sm">No recent runs found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Footer */}
                            <ReportPaging
                                currentPage={currentPage}
                                totalItems={filteredHistory.length}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                                onItemsPerPageChange={(val) => {
                                    setItemsPerPage(val);
                                    setCurrentPage(1); // Keep that reset logic consistent
                                }}
                                showAllOption={false} // Drawers usually stay fixed at a specific count
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RecentReportsDrawer;