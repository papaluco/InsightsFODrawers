import React, { useMemo, useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, MessageSquare, GripVertical, CheckCircle, XCircle } from 'lucide-react';
import { SchoolieUsageEvent, SCHOOLIE_USER_NAMES, SCHOOLIE_DISTRICT_NAMES } from '../../../data/mockSchoolieUsageData';
import { fmtDateTime, TOPIC_COLORS } from '../common/usageHelpers';
import { ReportPaging } from '../../InsightsReports/ReportPaging';
import { FilterIcon, SettingsIcon, AlertIcon } from '../../Common/Icons';
import { ExportMenu } from '../../Downloading/ExportMenu/ExportMenu';
import { CSVExpButton } from '../../Downloading/CSVGen/CSVExpButton';
import type { ICSVReportData } from '../../Downloading/CSVGen/CSVContract';

interface Props {
  events: SchoolieUsageEvent[];
  title?: string;
  onUserClick?: (userId: string) => void;
  onDistrictClick?: (districtId: string) => void;
  onEventTypeClick?: (eventType: string) => void;
  onAnalysisClick?: (analysisIdentifier: string) => void;
  onEventDetailClick?: (event: SchoolieUsageEvent) => void;
}

type ColKey =
  | 'timestamp'
  | 'userName'
  | 'districtName'
  | 'eventType'
  | 'analysisIdentifier'
  | 'sourceEntryPoint'
  | 'responseTimeMs'
  | 'status';

interface ColDef { key: ColKey; label: string; defaultVisible: boolean; sortable: boolean; }

const COLUMNS: ColDef[] = [
  { key: 'timestamp',          label: 'Date',       defaultVisible: true, sortable: true  },
  { key: 'userName',           label: 'User',       defaultVisible: true, sortable: true  },
  { key: 'districtName',       label: 'District',   defaultVisible: true, sortable: true  },
  { key: 'eventType',          label: 'Event',      defaultVisible: true, sortable: true  },
  { key: 'analysisIdentifier', label: 'Analysis',   defaultVisible: true, sortable: true  },
  { key: 'sourceEntryPoint',   label: 'Surface',    defaultVisible: true, sortable: true  },
  { key: 'responseTimeMs',     label: 'Resp. Time', defaultVisible: true, sortable: true  },
  { key: 'status',             label: 'Status',     defaultVisible: true, sortable: false },
];

const ALL_COL_KEYS = COLUMNS.map(c => c.key);
const COL_BY_KEY = new Map(COLUMNS.map(c => [c.key, c]));
const DEFAULT_VISIBLE = COLUMNS.filter(c => c.defaultVisible).map(c => c.key);

const EVENT_TYPE_COLORS: Record<string, string> = {
  KPI_SCHOOLIE_OPENED:       TOPIC_COLORS.AI,
  DASHBOARD_SCHOOLIE_OPENED: TOPIC_COLORS.AI,
  AI_REQUEST_STARTED:        TOPIC_COLORS.Workspace,
  AI_RESPONSE_SUCCESS:       TOPIC_COLORS.Sessions,
  AI_RESPONSE_ERROR:         TOPIC_COLORS.Errors,
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  KPI_SCHOOLIE_OPENED:       'KPI Schoolie Opened',
  DASHBOARD_SCHOOLIE_OPENED: 'Dashboard Schoolie Opened',
  AI_REQUEST_STARTED:        'AI Request Started',
  AI_RESPONSE_SUCCESS:       'AI Response — Success',
  AI_RESPONSE_ERROR:         'AI Response — Error',
};

function getCsvText(event: SchoolieUsageEvent, key: ColKey): string {
  switch (key) {
    case 'timestamp':          return fmtDateTime(event.timestamp);
    case 'userName':           return SCHOOLIE_USER_NAMES[event.userId] ?? event.userId;
    case 'districtName':       return SCHOOLIE_DISTRICT_NAMES[event.districtId] ?? event.districtId;
    case 'eventType':          return EVENT_TYPE_LABELS[event.eventType] ?? event.eventType;
    case 'analysisIdentifier': return event.analysisIdentifier;
    case 'sourceEntryPoint':   return event.sourceEntryPoint;
    case 'responseTimeMs':     return event.responseTimeMs != null ? `${event.responseTimeMs}ms` : '—';
    case 'status':             return event.status ?? '—';
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

const SchoolieEventGrid: React.FC<Props> = ({
  events,
  title = 'Events',
  onUserClick,
  onDistrictClick,
  onEventTypeClick,
  onAnalysisClick,
  onEventDetailClick,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ key: ColKey; dir: 'asc' | 'desc' }>({ key: 'timestamp', dir: 'desc' });
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
    let rows = events;
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(e =>
        (SCHOOLIE_USER_NAMES[e.userId] ?? e.userId).toLowerCase().includes(q) ||
        (SCHOOLIE_DISTRICT_NAMES[e.districtId] ?? e.districtId).toLowerCase().includes(q) ||
        (EVENT_TYPE_LABELS[e.eventType] ?? e.eventType).toLowerCase().includes(q) ||
        e.analysisIdentifier.toLowerCase().includes(q)
      );
    }
    rows = [...rows].sort((a, b) => {
      let cmp = 0;
      if (sort.key === 'responseTimeMs') {
        cmp = (a.responseTimeMs ?? -1) - (b.responseTimeMs ?? -1);
      } else {
        cmp = getCsvText(a, sort.key).localeCompare(getCsvText(b, sort.key));
      }
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [events, search, sort]);

  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const requestSort = (col: ColDef) => {
    if (!col.sortable) return;
    setSort(prev => ({ key: col.key, dir: prev.key === col.key && prev.dir === 'asc' ? 'desc' : 'asc' }));
  };

  const csvData = useMemo((): ICSVReportData => ({
    fileName: `schoolie_events_${new Date().toISOString().slice(0, 10)}`,
    headers: orderedVisibleCols.map(c => c.label),
    rows: filtered.map(event => orderedVisibleCols.map(c => getCsvText(event, c.key))),
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
          <span className="text-sm font-semibold text-slate-700">{title}</span>
          <span className="text-[11px] text-gray-400">{events.length} events</span>
        </button>
        <div className="flex items-center gap-3">
          <ExportMenu>
            <div className="px-4 py-1.5 bg-slate-50 border-y border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Data Exports</p>
            </div>
            <CSVExpButton title="Events (.csv)" subtext="Download visible columns as seen" csvData={csvData} />
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
              placeholder="Search events..."
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
                {paged.map((event, idx) => (
                  <tr key={`${event.sessionId}-${event.eventType}-${idx}`} className="transition-colors hover:bg-slate-50">
                    {orderedVisibleCols.map(col => {
                      const isTimestampClick    = col.key === 'timestamp'          && !!onEventDetailClick;
                      const isUserClick         = col.key === 'userName'           && !!onUserClick;
                      const isDistrictClick     = col.key === 'districtName'       && !!onDistrictClick;
                      const isEventTypeClick    = col.key === 'eventType'          && !!onEventTypeClick;
                      const isAnalysisClick     = col.key === 'analysisIdentifier' && !!onAnalysisClick;
                      const isClickable = isTimestampClick || isUserClick || isDistrictClick || isEventTypeClick || isAnalysisClick;

                      return (
                        <td
                          key={col.key}
                          onClick={() => {
                            if (isTimestampClick) onEventDetailClick?.(event);
                            if (isUserClick)      onUserClick?.(event.userId);
                            if (isDistrictClick)  onDistrictClick?.(event.districtId);
                            if (isEventTypeClick) onEventTypeClick?.(event.eventType);
                            if (isAnalysisClick)  onAnalysisClick?.(event.analysisIdentifier);
                          }}
                          className={`px-4 py-2.5 text-sm whitespace-nowrap ${isClickable ? 'cursor-pointer hover:text-teal-600 hover:bg-slate-100' : ''}`}
                        >
                          {col.key === 'timestamp' && (
                            <span className="text-slate-400">{fmtDateTime(event.timestamp)}</span>
                          )}
                          {col.key === 'userName' && (
                            <span className="font-medium text-slate-700">
                              {SCHOOLIE_USER_NAMES[event.userId] ?? event.userId}
                            </span>
                          )}
                          {col.key === 'districtName' && (
                            <span className="text-slate-500">
                              {SCHOOLIE_DISTRICT_NAMES[event.districtId] ?? event.districtId}
                            </span>
                          )}
                          {col.key === 'eventType' && (
                            <span className="inline-flex items-center gap-1.5">
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: EVENT_TYPE_COLORS[event.eventType] ?? '#94a3b8' }}
                              />
                              <span className="text-slate-600">
                                {EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}
                              </span>
                            </span>
                          )}
                          {col.key === 'analysisIdentifier' && (
                            <span className="text-slate-500">{event.analysisIdentifier}</span>
                          )}
                          {col.key === 'sourceEntryPoint' && (
                            <span className="text-slate-500">{event.sourceEntryPoint}</span>
                          )}
                          {col.key === 'responseTimeMs' && (
                            event.responseTimeMs != null
                              ? (
                                <span className={`tabular-nums font-medium ${
                                  event.responseTimeMs > 10000
                                    ? 'text-red-600'
                                    : event.responseTimeMs > 4000
                                    ? 'text-amber-600'
                                    : 'text-slate-500'
                                }`}>
                                  {event.responseTimeMs.toLocaleString()}ms
                                </span>
                              )
                              : <span className="text-gray-300">—</span>
                          )}
                          {col.key === 'status' && (
                            event.status === 'success'
                              ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-full"><CheckCircle size={10} /> Success</span>
                              : event.status === 'error'
                              ? <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 text-[11px] font-semibold rounded-full"><XCircle size={10} /> Error</span>
                              : <span className="text-gray-300">—</span>
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
                <p className="text-sm">No events found{search ? ' matching your search' : ''}.</p>
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

export default SchoolieEventGrid;
