import React, { useState, useMemo, useEffect, useRef } from 'react';
import { CSVExpButton } from '../CSVGen/CSVExpButton';
import { CSVReportViewerAdapter } from '../CSVGen/adapters/CSVReportViewerAdapter';
import {
    ReportIcon,
    XIcon,
    FilterIcon,
    SettingsIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    AlertIcon 
} from '../Common/Icons';

import reportResponse from '../../data/report_response.json';
import { ReportPaging } from './ReportPaging';
import { ReportSource } from '../../data/ReportTypes';
import { getReportSourceStyle } from '../../utils/reportUtils';
import { ExportMenu } from '../Common/ExportMenu/ExportMenu';

interface ReportViewerDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    reportInfo: {
        name: string;
        module: string;
        source: string;
        reportType?: ReportSource; 
    } | null;
}

const ReportTypeBadge: React.FC<{ source: ReportSource }> = ({ source }) => {
  const style = getReportSourceStyle(source);
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${style.bg} ${style.border} ${style.text}`}>
      {style.text}
    </span>
  );
};

const ReportViewerDrawer: React.FC<ReportViewerDrawerProps> = ({ isOpen, onClose, reportInfo }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [visibleColumns, setVisibleColumns] = useState<string[]>([]);
    const [showColumnPicker, setShowColumnPicker] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    
    const pickerRef = useRef<HTMLDivElement>(null);

    const reportData = useMemo<any[]>(() => {
        try {
            const rawData = (reportResponse as any).PayLoad?.data;
            if (!rawData) return [];
            const parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
            if (Array.isArray(parsed)) return parsed;
            return parsed.rows || parsed.data || Object.values(parsed).find(val => Array.isArray(val)) || [];
        } catch (e) {
            console.error("ReportViewer Parsing Error:", e);
            return [];
        }
    }, []);

const [isLoading, setIsLoading] = useState(false);

// Trigger loader when drawer opens
useEffect(() => {
    if (isOpen) {
        setIsLoading(true);
        // Simulate data fetching/parsing time
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800); 
        return () => clearTimeout(timer);
    }
}, [isOpen]);

    const columns = useMemo<string[]>(() => {
        if (reportData.length === 0) return [];
        return Object.keys(reportData[0]);
    }, [reportData]);

    useEffect(() => {
        if (columns.length > 0) {
            setVisibleColumns(columns.slice(0, 10));
        }
    }, [columns]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Close column picker if clicking outside
        if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
            setShowColumnPicker(false);
        }
        // Close export menu if clicking outside
        if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
            setShowExportMenu(false);
        }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (showColumnPicker) {
                    setShowColumnPicker(false);
                } else {
                    onClose();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        if (showColumnPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [showColumnPicker, onClose]);

    const filteredAndSortedData = useMemo(() => {
        let data = [...reportData];
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            data = data.filter((row: any) =>
                Object.values(row).some((val) =>
                    String(val).toLowerCase().includes(lowerSearch)
                )
            );
        }
        if (sortConfig !== null) {
            data.sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];
                if (typeof aVal === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(aVal)) {
                    aVal = new Date(aVal).getTime();
                    bVal = new Date(bVal).getTime();
                }
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return data;
    }, [reportData, searchTerm, sortConfig]);

    const paginatedData = useMemo(() => {
        if (itemsPerPage <= 0) return filteredAndSortedData;
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAndSortedData, currentPage, itemsPerPage]);

    const requestSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const formatHeader = (key: string) => {
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()).trim();
    };

    const formatCellValue = (value: any) => {
        if (value === null || value === undefined) return '-';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
            return new Date(value).toLocaleDateString();
        }
        return String(value);
    };

    const handleSelectAll = () => {
        setVisibleColumns(visibleColumns.length === columns.length ? [] : columns);
    };

    if (!isOpen) return null;

        // 1. Map the data using the same pattern as MPLH
    const csvReportData = useMemo(() =>
        CSVReportViewerAdapter(
            filteredAndSortedData,
            visibleColumns,
            reportInfo?.name
        ),
        [filteredAndSortedData, visibleColumns, reportInfo?.name]);

    const [_showExportMenu, setShowExportMenu] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null); // To handle clicking outside

    return (
        <div className="fixed inset-0 z-[1000] flex justify-end">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

            <div className={`fixed top-0 right-0 h-full w-3/4 bg-slate-50 shadow-2xl z-[101] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="flex flex-col h-full">

                    <div className="px-6 py-5 bg-white border-b border-gray-200 flex justify-between items-center text-left">
                        <div className="flex items-center gap-3">
                            <ReportIcon className="text-primary" size={24} />
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold text-slate-800">{reportInfo?.name || 'Report Results'}</h2>
                                </div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pt-0.5">
                                    {reportInfo?.module} module, {reportInfo?.source} datasource <ReportTypeBadge source={reportInfo?.reportType ?? ReportSource.Custom} /> 
                                </p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-slate-600">
                            <XIcon size={24} />
                        </button>
                    </div>

                    <div className="px-6 py-4 bg-white border-b border-gray-100 flex justify-between items-end gap-3 relative">

                        {/* COLUMN VISIBILITY Warning */}
                        {visibleColumns.length < columns.length ? (
                            <div className="flex items-center gap-2 mb-1 px-1 text-amber-600 animate-in fade-in slide-in-from-top-1 duration-300">
                                <AlertIcon size={14} className="text-amber-500" />
                                <span className="text-[11px] font-semibold italic">
                                    Showing {visibleColumns.length} of {columns.length} columns.
                                </span>
                            </div>
                        ) : (
                            <div />
                        )}

                        
                        <div className="flex gap-3 items-center">
                            {/* Export Menu Trigger */}
                            <div className="relative" ref={exportMenuRef}>
                                
                                
                                    <ExportMenu>
                                        {/* Data Section */}
                                        <div className="px-4 py-1.5 bg-slate-50 border-y border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Data Exports</p>
                                        </div>
                                        <CSVExpButton
                                            title="Dynamic Report (.csv)"
                                            subtext="Download grid data as seen"
                                            csvData={csvReportData}
                                            onClose={() => setShowExportMenu(false)}
                                        />
                                    </ExportMenu>
                                
                            </div>

                            {/* COLUMN VISIBILITY */}
                            <div className="relative" ref={pickerRef}>
                                <button 
                                    onClick={() => setShowColumnPicker(!showColumnPicker)}
                                    className={`p-2 rounded-lg border transition-all ${showColumnPicker ? 'bg-indigo-50 border-primary text-primary' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <SettingsIcon size={20} />
                                </button>

                                {showColumnPicker && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 shadow-xl rounded-xl z-[110] p-4 animate-in zoom-in-95 duration-100">
                                        <div className="flex justify-between items-center mb-3 px-1">
                                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Columns</h3>
                                            <button onClick={handleSelectAll} className="text-[10px] font-bold text-primary uppercase hover:underline">
                                                {visibleColumns.length === columns.length ? 'Deselect All' : 'Select All'}
                                            </button>
                                        </div>
                                        <div className="space-y-1 max-h-60 overflow-y-auto pr-2 no-scrollbar">
                                            {columns.map(col => (
                                                <label key={col} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                                                    <input 
                                                        type="checkbox" 
                                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                        checked={visibleColumns.includes(col)}
                                                        onChange={() => {
                                                            setVisibleColumns(prev => 
                                                                prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col]
                                                            );
                                                        }}
                                                    />
                                                    <span className="text-sm text-slate-600 font-medium">{formatHeader(col)}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* SEARCH */}
                            <div className="relative w-64">
                                <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search results..."
                                    value={searchTerm}
                                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex-initial overflow-hidden flex flex-col p-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col flex-1 relative">
                            
                            {/* OVERLAY LOADER */}
                            {isLoading && (
                                <div className="absolute inset-0 z-[120] flex flex-col items-center justify-center bg-white/90 backdrop-blur-[2px] animate-in fade-in duration-300">
                                    <div className="relative">
                                        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                                        <ReportIcon size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600/50" />
                                    </div>
                                    <div className="mt-4 flex flex-col items-center">
                                        <p className="text-sm font-bold text-slate-700 tracking-tight">Preparing Report</p>
                                        <p className="text-[11px] text-slate-400 font-medium">Parsing data for {reportInfo?.name}...</p>
                                    </div>
                                </div>
                            )}

                            <div className="overflow-auto flex-1 no-scrollbar">
                                <table className="w-full text-left border-collapse table-auto">
                                    <thead className="bg-white border-b border-gray-200 sticky top-0 z-10">
                                        <tr>
                                            {columns.filter(c => visibleColumns.includes(c)).map((col) => (
                                                <th 
                                                    key={col} 
                                                    onClick={() => requestSort(col)}
                                                    className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-slate-50 transition-colors select-none group/th"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {formatHeader(col)}
                                                        <div className="w-4 flex items-center justify-center">
                                                            {sortConfig?.key === col && (
                                                                sortConfig.direction === 'asc' 
                                                                    ? <ChevronUpIcon size={14} className="text-primary" /> 
                                                                    : <ChevronDownIcon size={14} className="text-primary" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {paginatedData.map((row: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                                                {columns.filter(c => visibleColumns.includes(c)).map((col: string) => (
                                                    <td key={col} className="px-4 py-2 text-sm text-slate-600">
                                                        <div className="truncate max-w-[250px]">
                                                            {formatCellValue(row[col])}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {paginatedData.length === 0 && (
                                    <div className="flex flex-col items-center justify-center p-20 text-gray-400">
                                        <FilterIcon size={40} className="mb-4 opacity-20" />
                                        <p className="text-sm font-medium">No records found matching your search.</p>
                                    </div>
                                )}
                            </div>
                            <div className="bg-white border-t border-gray-100">
                                <ReportPaging
                                    currentPage={currentPage}
                                    totalItems={filteredAndSortedData.length}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={setCurrentPage}
                                    onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
                                    showAllOption={true}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportViewerDrawer;