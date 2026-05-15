import React, { useMemo, useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, MessageSquare, GripVertical, ThumbsUp, ThumbsDown } from 'lucide-react';
import { FeedbackRecord } from '../../../types/feedbackTypes';
import { SCHOOLIE_USER_NAMES, SCHOOLIE_DISTRICT_NAMES } from '../../../data/mockSchoolieUsageData';
import { fmtDateTime, TOPIC_COLORS, USAGE_ICONS } from '../common/usageHelpers';
import { SOURCE_DISPLAY } from '../feedback/feedbackHelpers';
import { ReportPaging } from '../../InsightsReports/ReportPaging';
import { FilterIcon, SettingsIcon, AlertIcon } from '../../Common/Icons';
import { ExportMenu } from '../../Downloading/ExportMenu/ExportMenu';
import { CSVExpButton } from '../../Downloading/CSVGen/CSVExpButton';
import type { ICSVReportData } from '../../Downloading/CSVGen/CSVContract';

interface Props {
  records: FeedbackRecord[];
  title?: string;
  onUserClick?: (userId: string) => void;
  onDistrictClick?: (districtId: string) => void;
  onSurfaceClick?: (surface: string) => void;
  onAnalysisClick?: (analysis: string) => void;
  onFeedbackDetailClick?: (record: FeedbackRecord) => void;
}

type ColKey =
  | 'feedbackId'
  | 'createdAt'
  | 'userName'
  | 'districtName'
  | 'sourceEntryPoint'
  | 'analysis'
  | 'feedbackValue'
  | 'reasonCodes';

interface ColDef { key: ColKey; label: string; defaultVisible: boolean; sortable: boolean; }

const COLUMNS: ColDef[] = [
  { key: 'feedbackId',       label: 'Feedback ID', defaultVisible: true,  sortable: true  },
  { key: 'createdAt',        label: 'Date',         defaultVisible: true,  sortable: true  },
  { key: 'userName',         label: 'User',         defaultVisible: true,  sortable: true  },
  { key: 'districtName',     label: 'District',     defaultVisible: true,  sortable: true  },
  { key: 'sourceEntryPoint', label: 'Surface',      defaultVisible: true,  sortable: true  },
  { key: 'analysis',         label: 'Analysis',     defaultVisible: true,  sortable: true  },
  { key: 'feedbackValue',    label: 'Value',        defaultVisible: true,  sortable: true  },
  { key: 'reasonCodes',      label: 'Reasons',      defaultVisible: true,  sortable: false },
];

const ALL_COL_KEYS = COLUMNS.map(c => c.key);
const COL_BY_KEY = new Map(COLUMNS.map(c => [c.key, c]));
const DEFAULT_VISIBLE = COLUMNS.filter(c => c.defaultVisible).map(c => c.key);

function getCsvText(record: FeedbackRecord, key: ColKey): string {
  switch (key) {
    case 'feedbackId':       return record.feedbackId;
    case 'createdAt':        return fmtDateTime(record.createdAt);
    case 'userName':         return SCHOOLIE_USER_NAMES[record.userId] ?? record.userId;
    case 'districtName':     return SCHOOLIE_DISTRICT_NAMES[record.districtId] ?? record.districtId;
    case 'sourceEntryPoint': return SOURCE_DISPLAY[record.sourceEntryPoint] ?? record.sourceEntryPoint;
    case 'analysis':         return record.kpiIdentifier ?? record.analysisIdentifier ?? '—';
    case 'feedbackValue':    return record.feedbackValue === 'thumbs_up' ? 'Positive' : 'Negative';
    case 'reasonCodes':      return record.reasonCodes?.join(', ') ?? '—';
    default:                 return '';
  }
}

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

const SchoolieFeedbackGrid: React.FC<Props> = ({
  records,
  title = 'Feedback',
  onUserClick,
  onDistrictClick,
  onSurfaceClick,
  onAnalysisClick,
  onFeedbackDetailClick,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ key: ColKey; dir: 'asc' | 'desc' }>({ key: 'createdAt', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [visibleCols, setVisibleCols] = useState<ColKey[]>(DEFAULT_VISIBLE);
  const [colOrder, setColOrder] = useState<ColKey[]>(ALL_COL_KEYS);
  const [showColPicker, setShowColPicker] = useState(false);
  const [draggedKey, setDraggedKey] = useState<ColKey | null>(null);
  const [dragOverKey, setDragOverKey] = useState<ColKey | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowColPicker(false);
    };
    if (showColPicker) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showColPicker]);

  const orderedVisibleCols = useMemo(
    () => colOrder.filter(k => visibleCols.includes(k)).map(k => COL_BY_KEY.get(k)!),
    [colOrder, visibleCols]
  );

  const filtered = useMemo(() => {
    let rows = records;
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(r =>
        (SCHOOLIE_USER_NAMES[r.userId] ?? r.userId).toLowerCase().includes(q) ||
        (SCHOOLIE_DISTRICT_NAMES[r.districtId] ?? r.districtId).toLowerCase().includes(q) ||
        (SOURCE_DISPLAY[r.sourceEntryPoint] ?? r.sourceEntryPoint).toLowerCase().includes(q) ||
        (r.kpiIdentifier ?? r.analysisIdentifier ?? '').toLowerCase().includes(q) ||
        r.feedbackId.toLowerCase().includes(q) ||
        (r.reasonCodes?.join(' ') ?? '').toLowerCase().includes(q)
      );
    }
    rows = [...rows].sort((a, b) => {
      const cmp = getCsvText(a, sort.key).localeCompare(getCsvText(b, sort.key));
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [records, search, sort]);

  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const requestSort = (col: ColDef) => {
    if (!col.sortable) return;
    setSort(prev => ({ key: col.key, dir: prev.key === col.key && prev.dir === 'asc' ? 'desc' : 'asc' }));
  };

  const csvData = useMemo((): ICSVReportData => ({
    fileName: `schoolie_feedback_${new Date().toISOString().slice(0, 10)}`,
    headers: orderedVisibleCols.map(c => c.label),
    rows: filtered.map(r => orderedVisibleCols.map(c => getCsvText(r, c.key))),
  }), [filtered, orderedVisibleCols]);

  const handleDragStart = (e: React.DragEvent, key: ColKey) => { setDraggedKey(key); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e: React.DragEvent, key: ColKey) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (key !== draggedKey) setDragOverKey(key); };
  const handleDrop = (e: React.DragEvent, targetKey: ColKey) => {
    e.preventDefault();
    if (!draggedKey || draggedKey === targetKey) return;
    setColOrder(prev => {
      const next = [...prev];
      const from = next.indexOf(draggedKey);
      const to = next.indexOf(targetKey);
      next.splice(from, 1);
      next.splice(to, 0, draggedKey);
      return next;
    });
    setDraggedKey(null); setDragOverKey(null);
  };
  const handleDragEnd = () => { setDraggedKey(null); setDragOverKey(null); };

  const hiddenCount = ALL_COL_KEYS.length - visibleCols.length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5">
        <button onClick={() => setExpanded(e => !e)} className="flex items-center gap-2.5 hover:opacity-80">
          <USAGE_ICONS.SchoolieFeedback size={16} style={{ color: TOPIC_COLORS.Feedback }} />
          <span className="text-sm font-semibold text-slate-700">{title}</span>
          <span className="text-[11px] text-gray-400">{records.length} records</span>
        </button>
        <div className="flex items-center gap-3">
          <ExportMenu>
            <div className="px-4 py-1.5 bg-slate-50 border-y border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Data Exports</p>
            </div>
            <CSVExpButton title="Feedback (.csv)" subtext="Download visible columns as seen" csvData={csvData} />
          </ExportMenu>

          <div className="relative" ref={pickerRef}>
            <button
              onClick={() => setShowColPicker(p => !p)}
              className={`p-2 rounded-lg border transition-all ${showColPicker ? 'bg-teal-50 border-teal-400 text-teal-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              <SettingsIcon size={18} />
            </button>
            {showColPicker && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 shadow-xl rounded-xl z-50 p-4 animate-in zoom-in-95 duration-100">
                <div className="flex justify-between items-center mb-1 px-1">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Columns</h3>
                  <button
                    onClick={() => setVisibleCols(visibleCols.length === ALL_COL_KEYS.length ? [] : [...ALL_COL_KEYS])}
                    className="text-[10px] font-bold text-teal-600 uppercase hover:underline"
                  >
                    {visibleCols.length === ALL_COL_KEYS.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 px-1 mb-3">Drag to reorder</p>
                <div className="space-y-0.5 max-h-64 overflow-y-auto pr-1">
                  {colOrder.map(key => {
                    const col = COL_BY_KEY.get(key)!;
                    return (
                      <div
                        key={key}
                        draggable
                        onDragStart={e => handleDragStart(e, key)}
                        onDragOver={e => handleDragOver(e, key)}
                        onDrop={e => handleDrop(e, key)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-colors select-none
                          ${draggedKey === key ? 'opacity-40 bg-teal-50' : 'hover:bg-slate-50'}
                          ${dragOverKey === key && draggedKey !== key ? 'border-t-2 border-teal-400' : 'border-t-2 border-transparent'}
                        `}
                      >
                        <GripVertical size={14} className="text-gray-300 cursor-grab flex-shrink-0" />
                        <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 flex-shrink-0"
                            checked={visibleCols.includes(key)}
                            onChange={() => setVisibleCols(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])}
                          />
                          <span className="text-sm text-slate-600 font-medium truncate">{col.label}</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="relative w-56">
            <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search feedback..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none"
            />
          </div>
          <button onClick={() => setExpanded(e => !e)}><CollapseChevron expanded={expanded} /></button>
        </div>
      </div>

      {expanded && (
        <>
          {hiddenCount > 0 && (
            <div className="px-5 py-2 border-t border-gray-100 flex items-center gap-2 text-amber-600 animate-in fade-in duration-300">
              <AlertIcon size={14} className="text-amber-500" />
              <span className="text-[11px] font-semibold italic">Showing {visibleCols.length} of {ALL_COL_KEYS.length} columns.</span>
            </div>
          )}
          <div className={`${hiddenCount > 0 ? '' : 'border-t border-gray-100'} overflow-x-auto`}>
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-gray-200">
                <tr>
                  {orderedVisibleCols.map(col => (
                    <th
                      key={col.key}
                      onClick={() => requestSort(col)}
                      className={`px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap select-none ${col.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        {col.sortable && sort.key === col.key && (
                          sort.dir === 'asc'
                            ? <ChevronUp size={12} className="text-teal-500" />
                            : <ChevronDown size={12} className="text-teal-500" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paged.map((record, idx) => (
                  <tr key={`${record.feedbackId}-${idx}`} className="transition-colors hover:bg-slate-50">
                    {orderedVisibleCols.map(col => {
                      const isFeedbackIdClick  = col.key === 'feedbackId'       && !!onFeedbackDetailClick;
                      const isUserClick        = col.key === 'userName'         && !!onUserClick;
                      const isDistrictClick    = col.key === 'districtName'     && !!onDistrictClick;
                      const isSurfaceClick     = col.key === 'sourceEntryPoint' && !!onSurfaceClick;
                      const isAnalysisClick    = col.key === 'analysis'         && !!onAnalysisClick;
                      const isClickable = isFeedbackIdClick || isUserClick || isDistrictClick || isSurfaceClick || isAnalysisClick;

                      return (
                        <td
                          key={col.key}
                          onClick={() => {
                            if (isFeedbackIdClick) onFeedbackDetailClick?.(record);
                            if (isUserClick)       onUserClick?.(record.userId);
                            if (isDistrictClick)   onDistrictClick?.(record.districtId);
                            if (isSurfaceClick)    onSurfaceClick?.(record.sourceEntryPoint);
                            if (isAnalysisClick)   onAnalysisClick?.(record.kpiIdentifier ?? record.analysisIdentifier ?? '');
                          }}
                          className={`px-4 py-2.5 text-sm whitespace-nowrap ${isClickable ? 'cursor-pointer hover:text-teal-600 hover:bg-slate-100' : ''}`}
                        >
                          {col.key === 'feedbackId' && (
                            <span className="font-mono text-xs text-slate-400">{record.feedbackId}</span>
                          )}
                          {col.key === 'createdAt' && (
                            <span className="text-slate-400">{fmtDateTime(record.createdAt)}</span>
                          )}
                          {col.key === 'userName' && (
                            <span className="font-medium text-slate-700">
                              {SCHOOLIE_USER_NAMES[record.userId] ?? record.userId}
                            </span>
                          )}
                          {col.key === 'districtName' && (
                            <span className="text-slate-500">
                              {SCHOOLIE_DISTRICT_NAMES[record.districtId] ?? record.districtId}
                            </span>
                          )}
                          {col.key === 'sourceEntryPoint' && (
                            <span className="text-slate-500">
                              {SOURCE_DISPLAY[record.sourceEntryPoint] ?? record.sourceEntryPoint}
                            </span>
                          )}
                          {col.key === 'analysis' && (
                            <span className="text-slate-500">
                              {record.kpiIdentifier ?? record.analysisIdentifier ?? '—'}
                            </span>
                          )}
                          {col.key === 'feedbackValue' && (
                            record.feedbackValue === 'thumbs_up'
                              ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-full"><ThumbsUp size={9} /> Positive</span>
                              : <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 text-[11px] font-semibold rounded-full"><ThumbsDown size={9} /> Negative</span>
                          )}
                          {col.key === 'reasonCodes' && (
                            <span className="text-slate-400 text-xs">{record.reasonCodes?.join(', ') ?? '—'}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            {paged.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <MessageSquare size={32} className="mb-2 opacity-20" />
                <p className="text-sm">No feedback found{search ? ' matching your search' : ''}.</p>
              </div>
            )}
          </div>
          <ReportPaging
            currentPage={page}
            totalItems={filtered.length}
            itemsPerPage={perPage}
            onPageChange={setPage}
            onItemsPerPageChange={v => { setPerPage(v); setPage(1); }}
            showAllOption
          />
        </>
      )}
    </div>
  );
};

export default SchoolieFeedbackGrid;
