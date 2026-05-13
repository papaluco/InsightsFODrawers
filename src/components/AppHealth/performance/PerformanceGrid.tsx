import { useMemo, useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, GripVertical, Activity } from 'lucide-react';
import type { PerformanceTelemetryEvent } from '../../../telemetry/types';
import type { ICSVReportData } from '../../Downloading/CSVGen/CSVContract';
import { ReportPaging } from '../../InsightsReports/ReportPaging';
import { FilterIcon, SettingsIcon, AlertIcon } from '../../Common/Icons';
import { ExportMenu } from '../../Downloading/ExportMenu/ExportMenu';
import { CSVExpButton } from '../../Downloading/CSVGen/CSVExpButton';
import { CAT_LABEL, fmtMs, fmtTs, durationColor } from './perfHelpers';

interface Props {
  events: PerformanceTelemetryEvent[];
  onRowClick?: (e: PerformanceTelemetryEvent) => void;
}

type ColKey =
  | 'timestamp' | 'eventName' | 'performanceCategory' | 'durationMs'
  | 'isSlow' | 'success' | 'module' | 'component' | 'userId' | 'districtId'
  | 'thresholdMs' | 'sessionId' | 'page';

interface ColDef { key: ColKey; label: string; defaultVisible: boolean; sortable: boolean; }

const COLUMNS: ColDef[] = [
  { key: 'timestamp',           label: 'Time',       defaultVisible: true,  sortable: true  },
  { key: 'eventName',           label: 'Event',      defaultVisible: true,  sortable: true  },
  { key: 'performanceCategory', label: 'Category',   defaultVisible: true,  sortable: true  },
  { key: 'durationMs',          label: 'Duration',   defaultVisible: true,  sortable: true  },
  { key: 'isSlow',              label: 'Slow',       defaultVisible: true,  sortable: true  },
  { key: 'success',             label: 'Status',     defaultVisible: true,  sortable: true  },
  { key: 'module',              label: 'Module',     defaultVisible: true,  sortable: true  },
  { key: 'component',           label: 'Component',  defaultVisible: true,  sortable: true  },
  { key: 'userId',              label: 'User',       defaultVisible: true,  sortable: true  },
  { key: 'districtId',          label: 'District',   defaultVisible: true,  sortable: true  },
  { key: 'thresholdMs',         label: 'Threshold',  defaultVisible: false, sortable: true  },
  { key: 'sessionId',           label: 'Session',    defaultVisible: false, sortable: false },
  { key: 'page',                label: 'Page',       defaultVisible: false, sortable: true  },
];

const ALL_KEYS        = COLUMNS.map(c => c.key);
const COL_MAP         = new Map(COLUMNS.map(c => [c.key, c]));
const DEFAULT_VISIBLE = COLUMNS.filter(c => c.defaultVisible).map(c => c.key);

function getCsvValue(e: PerformanceTelemetryEvent, key: ColKey): string {
  switch (key) {
    case 'timestamp':           return fmtTs(e.timestamp);
    case 'eventName':           return e.eventName;
    case 'performanceCategory': return CAT_LABEL[e.performanceCategory] ?? e.performanceCategory;
    case 'durationMs':          return String(e.durationMs);
    case 'isSlow':              return e.isSlow ? 'Yes' : 'No';
    case 'success':             return e.success ? 'Success' : 'Failed';
    case 'module':              return e.module;
    case 'component':           return e.component ?? '';
    case 'userId':              return e.userId ?? '';
    case 'districtId':          return e.districtId ?? '';
    case 'thresholdMs':         return e.thresholdMs != null ? String(e.thresholdMs) : '';
    case 'sessionId':           return e.sessionId;
    case 'page':                return e.page ?? '';
    default:                    return '';
  }
}

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

const PerformanceGrid: React.FC<Props> = ({ events, onRowClick }) => {
  const [expanded,      setExpanded]      = useState(true);
  const [search,        setSearch]        = useState('');
  const [sort,          setSort]          = useState<{ key: ColKey; dir: 'asc' | 'desc' }>({ key: 'timestamp', dir: 'desc' });
  const [page,          setPage]          = useState(1);
  const [perPage,       setPerPage]       = useState(10);
  const [visibleCols,   setVisibleCols]   = useState<ColKey[]>(DEFAULT_VISIBLE);
  const [colOrder,      setColOrder]      = useState<ColKey[]>(ALL_KEYS);
  const [showColPicker, setShowColPicker] = useState(false);
  const [draggedKey,    setDraggedKey]    = useState<ColKey | null>(null);
  const [dragOverKey,   setDragOverKey]   = useState<ColKey | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowColPicker(false);
    };
    if (showColPicker) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showColPicker]);

  useEffect(() => { setPage(1); }, [events]);

  const orderedVisible = useMemo(
    () => colOrder.filter(k => visibleCols.includes(k)).map(k => COL_MAP.get(k)!),
    [colOrder, visibleCols],
  );

  const filtered = useMemo(() => {
    let rows = search
      ? events.filter(e =>
          e.eventName.toLowerCase().includes(search.toLowerCase()) ||
          (e.component ?? '').toLowerCase().includes(search.toLowerCase()),
        )
      : events;

    rows = [...rows].sort((a, b) => {
      let cmp = 0;
      switch (sort.key) {
        case 'timestamp':           cmp = a.timestamp.localeCompare(b.timestamp); break;
        case 'eventName':           cmp = a.eventName.localeCompare(b.eventName); break;
        case 'performanceCategory': cmp = a.performanceCategory.localeCompare(b.performanceCategory); break;
        case 'durationMs':          cmp = a.durationMs - b.durationMs; break;
        case 'isSlow':              cmp = Number(a.isSlow) - Number(b.isSlow); break;
        case 'success':             cmp = Number(a.success) - Number(b.success); break;
        case 'module':              cmp = a.module.localeCompare(b.module); break;
        case 'component':           cmp = (a.component ?? '').localeCompare(b.component ?? ''); break;
        case 'userId':              cmp = (a.userId ?? '').localeCompare(b.userId ?? ''); break;
        case 'districtId':          cmp = (a.districtId ?? '').localeCompare(b.districtId ?? ''); break;
        case 'thresholdMs':         cmp = (a.thresholdMs ?? 0) - (b.thresholdMs ?? 0); break;
        case 'page':                cmp = (a.page ?? '').localeCompare(b.page ?? ''); break;
      }
      return sort.dir === 'asc' ? cmp : -cmp;
    });

    return rows;
  }, [events, search, sort]);

  const paged = perPage === 0 ? filtered : filtered.slice((page - 1) * perPage, page * perPage);

  const requestSort = (col: ColDef) => {
    if (!col.sortable) return;
    setSort(prev => ({ key: col.key, dir: prev.key === col.key && prev.dir === 'asc' ? 'desc' : 'asc' }));
  };

  const csvData = useMemo((): ICSVReportData => ({
    fileName: `performance_${new Date().toISOString().slice(0, 10)}`,
    headers:  orderedVisible.map(c => c.label),
    rows:     filtered.map(e => orderedVisible.map(c => getCsvValue(e, c.key))),
  }), [filtered, orderedVisible]);

  const handleDragStart = (ev: React.DragEvent, key: ColKey) => { setDraggedKey(key); ev.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver  = (ev: React.DragEvent, key: ColKey) => { ev.preventDefault(); if (key !== draggedKey) setDragOverKey(key); };
  const handleDrop      = (ev: React.DragEvent, target: ColKey) => {
    ev.preventDefault();
    if (!draggedKey || draggedKey === target) return;
    setColOrder(prev => {
      const next = [...prev];
      const from = next.indexOf(draggedKey), to = next.indexOf(target);
      next.splice(from, 1); next.splice(to, 0, draggedKey);
      return next;
    });
    setDraggedKey(null); setDragOverKey(null);
  };
  const handleDragEnd = () => { setDraggedKey(null); setDragOverKey(null); };

  const hiddenCount = ALL_KEYS.length - visibleCols.length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3.5">
        <button onClick={() => setExpanded(e => !e)} className="flex items-center gap-2.5 hover:opacity-80">
          <span className="text-sm font-semibold text-slate-700">Performance Events</span>
          <span className="text-[11px] text-gray-400">{filtered.length} events</span>
        </button>

        <div className="flex items-center gap-3">
          <ExportMenu>
            <div className="px-4 py-1.5 bg-slate-50 border-y border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Data Exports</p>
            </div>
            <CSVExpButton title="Performance (.csv)" subtext="Download visible columns as seen" csvData={csvData} />
          </ExportMenu>

          {/* Column picker */}
          <div className="relative" ref={pickerRef}>
            <button
              onClick={() => setShowColPicker(p => !p)}
              className={`p-2 rounded-lg border transition-all ${showColPicker ? 'bg-amber-50 border-amber-400 text-amber-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              <SettingsIcon size={18} />
            </button>
            {showColPicker && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 shadow-xl rounded-xl z-50 p-4">
                <div className="flex justify-between items-center mb-1 px-1">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Columns</h3>
                  <button
                    onClick={() => setVisibleCols(visibleCols.length === ALL_KEYS.length ? [] : [...ALL_KEYS])}
                    className="text-[10px] font-bold text-amber-600 uppercase hover:underline"
                  >
                    {visibleCols.length === ALL_KEYS.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 px-1 mb-3">Drag to reorder</p>
                <div className="space-y-0.5 max-h-64 overflow-y-auto pr-1">
                  {colOrder.map(key => {
                    const col = COL_MAP.get(key)!;
                    return (
                      <div
                        key={key}
                        draggable
                        onDragStart={e => handleDragStart(e, key)}
                        onDragOver={e => handleDragOver(e, key)}
                        onDrop={e => handleDrop(e, key)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-colors select-none
                          ${draggedKey === key ? 'opacity-40 bg-amber-50' : 'hover:bg-slate-50'}
                          ${dragOverKey === key && draggedKey !== key ? 'border-t-2 border-amber-400' : 'border-t-2 border-transparent'}`}
                      >
                        <GripVertical size={14} className="text-gray-300 cursor-grab shrink-0" />
                        <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400 shrink-0"
                            checked={visibleCols.includes(key)}
                            onChange={() => setVisibleCols(prev =>
                              prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
                            )}
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

          {/* Search */}
          <div className="relative w-56">
            <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search events..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none"
            />
          </div>

          <button onClick={() => setExpanded(e => !e)}><CollapseChevron expanded={expanded} /></button>
        </div>
      </div>

      {expanded && (
        <>
          {hiddenCount > 0 && (
            <div className="px-5 py-2 border-t border-gray-100 flex items-center gap-2 text-amber-600">
              <AlertIcon size={14} className="text-amber-500" />
              <span className="text-[11px] font-semibold italic">
                Showing {visibleCols.length} of {ALL_KEYS.length} columns.
              </span>
            </div>
          )}

          <div className={`${hiddenCount > 0 ? '' : 'border-t border-gray-100'} overflow-x-auto`}>
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-gray-200">
                <tr>
                  {orderedVisible.map(col => (
                    <th
                      key={col.key}
                      onClick={() => requestSort(col)}
                      className={`px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap select-none ${col.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        {col.sortable && sort.key === col.key && (
                          sort.dir === 'asc'
                            ? <ChevronUp size={12} className="text-amber-500" />
                            : <ChevronDown size={12} className="text-amber-500" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {paged.map(e => (
                  <tr
                    key={e.eventId}
                    onClick={() => onRowClick?.(e)}
                    className={`transition-colors hover:bg-amber-50/40 ${onRowClick ? 'cursor-pointer' : ''}`}
                  >
                    {orderedVisible.map(col => (
                      <td key={col.key} className="px-4 py-2.5 text-sm text-slate-500 whitespace-nowrap max-w-[200px]">
                        {col.key === 'timestamp'           && <span className="text-xs text-gray-400">{fmtTs(e.timestamp)}</span>}
                        {col.key === 'eventName'           && <span className="font-mono text-xs text-gray-700 truncate block">{e.eventName}</span>}
                        {col.key === 'performanceCategory' && <span className="text-xs">{CAT_LABEL[e.performanceCategory] ?? e.performanceCategory}</span>}
                        {col.key === 'durationMs'          && (
                          <span className={`text-xs font-semibold ${durationColor(e.durationMs)}`}>
                            {fmtMs(e.durationMs)}
                          </span>
                        )}
                        {col.key === 'isSlow'   && (
                          e.isSlow
                            ? <span className="text-xs font-semibold text-orange-500">Slow</span>
                            : <span className="text-xs text-gray-300">Fast</span>
                        )}
                        {col.key === 'success'  && (
                          e.success
                            ? <span className="text-xs font-semibold text-emerald-600">OK</span>
                            : <span className="text-xs font-semibold text-rose-600">Failed</span>
                        )}
                        {col.key === 'module'      && <span className="text-xs">{e.module}</span>}
                        {col.key === 'component'   && <span className="text-xs text-gray-600">{e.component ?? <span className="text-gray-300">—</span>}</span>}
                        {col.key === 'userId'      && <span className="text-xs text-gray-600">{e.userId ?? <span className="text-gray-300">—</span>}</span>}
                        {col.key === 'districtId'  && <span className="text-xs text-gray-600">{e.districtId ?? <span className="text-gray-300">—</span>}</span>}
                        {col.key === 'thresholdMs' && <span className="text-xs text-gray-400">{e.thresholdMs != null ? fmtMs(e.thresholdMs) : <span className="text-gray-300">—</span>}</span>}
                        {col.key === 'sessionId'   && <span className="font-mono text-xs text-gray-400">{e.sessionId}</span>}
                        {col.key === 'page'        && <span className="text-xs">{e.page ?? <span className="text-gray-300">—</span>}</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {paged.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Activity size={32} className="mb-2 opacity-20" />
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

export default PerformanceGrid;
