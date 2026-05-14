import React, { useMemo, useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, MessageSquare, GripVertical, CheckCircle, XCircle } from 'lucide-react';
import { SchoolieSessionStatRow } from '../../../types/schoolieUsageTypes';
import { fmtDateTime } from '../common/usageHelpers';
import { ReportPaging } from '../../InsightsReports/ReportPaging';
import { FilterIcon, SettingsIcon, AlertIcon } from '../../Common/Icons';
import { ExportMenu } from '../../Downloading/ExportMenu/ExportMenu';
import { CSVExpButton } from '../../Downloading/CSVGen/CSVExpButton';
import type { ICSVReportData } from '../../Downloading/CSVGen/CSVContract';

interface Props {
  data: SchoolieSessionStatRow[];
  onRowClick?: (row: SchoolieSessionStatRow) => void;
  onUserClick?: (row: SchoolieSessionStatRow) => void;
  onDistrictClick?: (row: SchoolieSessionStatRow) => void;
}

type SortKey = keyof SchoolieSessionStatRow;
type ColKey = SortKey;

interface ColDef { key: ColKey; label: string; defaultVisible: boolean; sortable: boolean; }

const COLUMNS: ColDef[] = [
  { key: 'userName',           label: 'User',       defaultVisible: true, sortable: true },
  { key: 'districtName',       label: 'District',   defaultVisible: true, sortable: true },
  { key: 'platform',           label: 'Platform',   defaultVisible: true, sortable: true },
  { key: 'analysisIdentifier', label: 'Analysis',   defaultVisible: true, sortable: true },
  { key: 'sourceEntryPoint',   label: 'Surface',    defaultVisible: true, sortable: true },
  { key: 'promptVersion',      label: 'Prompt v',   defaultVisible: true, sortable: true },
  { key: 'modelVersion',       label: 'Model',      defaultVisible: true, sortable: true },
  { key: 'requestedAt',        label: 'Requested',  defaultVisible: true, sortable: true },
  { key: 'responseTimeMs',     label: 'Resp. Time', defaultVisible: true, sortable: true },
  { key: 'status',             label: 'Status',     defaultVisible: true, sortable: true },
  { key: 'sessionId',          label: 'Session',    defaultVisible: true, sortable: true },
];

const ALL_COL_KEYS = COLUMNS.map(c => c.key);
const COL_BY_KEY = new Map(COLUMNS.map(c => [c.key, c]));
const DEFAULT_VISIBLE = COLUMNS.filter(c => c.defaultVisible).map(c => c.key);

function getCsvValue(row: SchoolieSessionStatRow, key: ColKey): string {
  switch (key) {
    case 'userName':           return row.userName;
    case 'districtName':       return row.districtName;
    case 'platform':           return row.platform;
    case 'analysisIdentifier': return row.analysisIdentifier;
    case 'sourceEntryPoint':   return row.sourceEntryPoint;
    case 'promptVersion':      return `v${row.promptVersion}`;
    case 'modelVersion':       return row.modelVersion;
    case 'requestedAt':        return fmtDateTime(row.requestedAt);
    case 'responseTimeMs':     return row.responseTimeMs != null ? `${row.responseTimeMs}ms` : '—';
    case 'status':             return row.status ?? '—';
    case 'sessionId':          return row.sessionId;
    default:                   return '';
  }
}

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

const SchoolieSessionGrid: React.FC<Props> = ({ data, onRowClick, onUserClick, onDistrictClick }) => {
  const [expanded, setExpanded] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'requestedAt', dir: 'desc' });
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
    let rows = data;
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(r =>
        r.userName.toLowerCase().includes(q) ||
        r.districtName.toLowerCase().includes(q) ||
        r.sessionId.toLowerCase().includes(q) ||
        r.analysisIdentifier.toLowerCase().includes(q)
      );
    }
    rows = [...rows].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av ?? '').localeCompare(String(bv ?? ''));
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [data, search, sort]);

  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const requestSort = (col: ColDef) => {
    if (!col.sortable) return;
    const key = col.key as SortKey;
    setSort(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
  };

  const csvData = useMemo((): ICSVReportData => ({
    fileName: `schoolie_sessions_${new Date().toISOString().slice(0, 10)}`,
    headers: orderedVisibleCols.map(c => c.label),
    rows: filtered.map(row => orderedVisibleCols.map(c => getCsvValue(row, c.key))),
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
          <span className="text-sm font-semibold text-slate-700">Sessions</span>
          <span className="text-[11px] text-gray-400">{data.length} sessions</span>
        </button>
        <div className="flex items-center gap-3">
          <ExportMenu>
            <div className="px-4 py-1.5 bg-slate-50 border-y border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Data Exports</p>
            </div>
            <CSVExpButton title="Sessions (.csv)" subtext="Download visible columns as seen" csvData={csvData} />
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
              placeholder="Search sessions..."
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
                {paged.map(row => (
                  <tr key={row.sessionId} className="transition-colors hover:bg-slate-50">
                    {orderedVisibleCols.map(col => {
                      const isUserClick     = col.key === 'userName'     && !!onUserClick;
                      const isDistrictClick = col.key === 'districtName' && !!onDistrictClick;
                      const isSessionClick  = col.key === 'sessionId'    && !!onRowClick;
                      const isClickable = isUserClick || isDistrictClick || isSessionClick;
                      return (
                        <td
                          key={col.key}
                          onClick={() => {
                            if (isUserClick)     onUserClick?.(row);
                            if (isDistrictClick) onDistrictClick?.(row);
                            if (isSessionClick)  onRowClick?.(row);
                          }}
                          className={`px-4 py-2.5 text-sm text-slate-500 whitespace-nowrap ${isClickable ? 'cursor-pointer hover:text-teal-600 font-medium hover:bg-slate-100' : ''}`}
                        >
                          {col.key === 'userName'           && <span className="font-medium text-slate-700">{row.userName}</span>}
                          {col.key === 'districtName'       && row.districtName}
                          {col.key === 'platform'           && row.platform}
                          {col.key === 'analysisIdentifier' && row.analysisIdentifier}
                          {col.key === 'sourceEntryPoint'   && row.sourceEntryPoint}
                          {col.key === 'promptVersion'      && `v${row.promptVersion}`}
                          {col.key === 'modelVersion'       && <span className="text-slate-400">{row.modelVersion}</span>}
                          {col.key === 'requestedAt'        && <span className="text-slate-400">{fmtDateTime(row.requestedAt)}</span>}
                          {col.key === 'responseTimeMs'     && (
                            row.responseTimeMs != null
                              ? <span className="tabular-nums">{row.responseTimeMs.toLocaleString()}ms</span>
                              : <span className="text-gray-300">—</span>
                          )}
                          {col.key === 'status' && (
                            row.status === 'success'
                              ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-full"><CheckCircle size={10} /> Success</span>
                              : row.status === 'error'
                              ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 text-[11px] font-semibold rounded-full"><XCircle size={10} /> Error</span>
                              : <span className="text-gray-300">—</span>
                          )}
                          {col.key === 'sessionId' && <span className="font-medium text-slate-400 font-mono text-xs">{row.sessionId}</span>}
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
                <p className="text-sm">No sessions found{search ? ' matching your search' : ''}.</p>
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

export default SchoolieSessionGrid;
