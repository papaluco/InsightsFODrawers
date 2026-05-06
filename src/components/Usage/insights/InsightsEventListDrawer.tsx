import React, { useMemo, useState, useRef, useEffect } from 'react';
import { X, MessageSquare, GripVertical, ChevronUp, ChevronDown, BarChart3 } from 'lucide-react';
import { InsightsUsageEvent, INSIGHTS_EVENT_FRIENDLY } from '../../../types/insightsUsageTypes';
import { INSIGHTS_USER_NAMES, INSIGHTS_DISTRICT_NAMES } from '../../../data/mockInsightsUsageData';
import { fmtDate } from './insightsUsageHelpers';
import { ReportPaging } from '../../InsightsReports/ReportPaging';
import { FilterIcon, SettingsIcon, ChevronLeftIcon } from '../../Common/Icons';
import { ExportMenu } from '../../Downloading/ExportMenu/ExportMenu';
import { CSVExpButton } from '../../Downloading/CSVGen/CSVExpButton';
import type { ICSVReportData } from '../../Downloading/CSVGen/CSVContract';
import InsightsEventDetailDrawer from './InsightsEventDetailDrawer';

type ColKey = 'eventType' | 'kpi' | 'userName' | 'districtName' | 'platform' | 'sessionId' | 'timestamp';

interface ColDef { key: ColKey; label: string; defaultVisible: boolean; }

const COLUMNS: ColDef[] = [
  { key: 'eventType',    label: 'Event',    defaultVisible: true },
  { key: 'kpi',         label: 'KPI',      defaultVisible: true },
  { key: 'userName',    label: 'User',     defaultVisible: true },
  { key: 'districtName',label: 'District', defaultVisible: true },
  { key: 'platform',    label: 'Platform', defaultVisible: false },
  { key: 'sessionId',   label: 'Session',  defaultVisible: false },
  { key: 'timestamp',   label: 'Date',     defaultVisible: true },
];

const ALL_COL_KEYS: ColKey[] = COLUMNS.map(c => c.key);
const COL_BY_KEY = new Map(COLUMNS.map(c => [c.key, c]));
const DEFAULT_VISIBLE: ColKey[] = COLUMNS.filter(c => c.defaultVisible).map(c => c.key);

function getCellValue(e: InsightsUsageEvent, key: ColKey): string {
  switch (key) {
    case 'eventType':    return INSIGHTS_EVENT_FRIENDLY[e.eventType] ?? e.eventType;
    case 'kpi':         return e.context.kpi ?? '—';
    case 'userName':    return INSIGHTS_USER_NAMES[e.userId] ?? e.userId;
    case 'districtName':return INSIGHTS_DISTRICT_NAMES[e.districtId] ?? e.districtId;
    case 'platform':    return e.platform;
    case 'sessionId':   return e.sessionId;
    case 'timestamp':   return e.timestamp;
    default:            return '';
  }
}

interface Props {
  events: InsightsUsageEvent[];
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

const InsightsEventListDrawer: React.FC<Props> = ({ events, title, isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [selectedEvent, setSelectedEvent] = useState<InsightsUsageEvent | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [visibleCols, setVisibleCols] = useState<ColKey[]>(DEFAULT_VISIBLE);
  const [colOrder, setColOrder] = useState<ColKey[]>(ALL_COL_KEYS);
  const [showColPicker, setShowColPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const [sortConfig, setSortConfig] = useState<{ key: ColKey; dir: 'asc' | 'desc' } | null>(null);
  const [draggedKey, setDraggedKey] = useState<ColKey | null>(null);
  const [dragOverKey, setDragOverKey] = useState<ColKey | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowColPicker(false);
    };
    if (showColPicker) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showColPicker]);

  useEffect(() => {
    if (!isOpen || isDetailOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [isOpen, isDetailOpen, onClose]);

  const orderedVisibleCols = useMemo(
    () => colOrder.filter(k => visibleCols.includes(k)).map(k => COL_BY_KEY.get(k)!),
    [colOrder, visibleCols]
  );

  const filtered = useMemo(() => {
    let rows = [...events];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(e =>
        getCellValue(e, 'eventType').toLowerCase().includes(q) ||
        getCellValue(e, 'userName').toLowerCase().includes(q) ||
        getCellValue(e, 'districtName').toLowerCase().includes(q) ||
        (e.context.kpi ?? '').toLowerCase().includes(q)
      );
    }
    if (sortConfig) {
      rows.sort((a, b) => {
        const av = getCellValue(a, sortConfig.key);
        const bv = getCellValue(b, sortConfig.key);
        return sortConfig.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }
    return rows;
  }, [events, search, sortConfig]);

  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const csvData = useMemo((): ICSVReportData => ({
    fileName: `insights_events_${new Date().toISOString().slice(0, 10)}`,
    headers: orderedVisibleCols.map(c => c.label),
    rows: filtered.map(e => orderedVisibleCols.map(c => getCellValue(e, c.key))),
  }), [filtered, orderedVisibleCols]);

  const handleSort = (key: ColKey) => {
    setSortConfig(prev =>
      prev?.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );
  };

  const handleDragStart = (key: ColKey) => setDraggedKey(key);
  const handleDragOver = (e: React.DragEvent, key: ColKey) => { e.preventDefault(); setDragOverKey(key); };
  const handleDrop = (targetKey: ColKey) => {
    if (!draggedKey || draggedKey === targetKey) { setDraggedKey(null); setDragOverKey(null); return; }
    setColOrder(prev => {
      const next = [...prev];
      const fromIdx = next.indexOf(draggedKey);
      const toIdx = next.indexOf(targetKey);
      next.splice(fromIdx, 1);
      next.splice(toIdx, 0, draggedKey);
      return next;
    });
    setDraggedKey(null);
    setDragOverKey(null);
  };

  return (
    <>
      <div className={`fixed inset-0 bg-white z-[51] flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="px-8 py-5 bg-white border-b border-gray-200 flex items-center gap-4 shrink-0 shadow-sm">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-slate-600 transition-colors">
            <ChevronLeftIcon size={20} />
          </button>
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
            <BarChart3 size={20} className="text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-800 truncate">{title || 'Insights Events'}</h2>
            <p className="text-xs text-gray-500">Insights usage events</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-slate-600 transition-colors ml-auto">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6">
          {/* Record count */}
          <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-3">
            {filtered.length.toLocaleString()} record{filtered.length !== 1 ? 's' : ''}
          </p>

          {/* Toolbar card (rounded-t) */}
          <div className="bg-white rounded-t-xl border border-b-0 border-gray-200 shadow-sm px-5 py-3 flex items-center gap-3">
            {/* Export */}
            <ExportMenu>
              <CSVExpButton data={csvData} />
            </ExportMenu>

            {/* Column picker */}
            <div className="relative" ref={pickerRef}>
              <button
                onClick={() => setShowColPicker(p => !p)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <SettingsIcon size={13} />
                Columns
              </button>
              {showColPicker && (
                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-10 w-56 p-2">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider px-2 pb-1">Drag to reorder</p>
                  {colOrder.map(key => {
                    const col = COL_BY_KEY.get(key)!;
                    return (
                      <div
                        key={key}
                        draggable
                        onDragStart={() => handleDragStart(key)}
                        onDragOver={e => handleDragOver(e, key)}
                        onDrop={() => handleDrop(key)}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-grab hover:bg-gray-50 transition-colors ${dragOverKey === key ? 'bg-indigo-50' : ''}`}
                      >
                        <GripVertical size={13} className="text-gray-300" />
                        <input
                          type="checkbox"
                          checked={visibleCols.includes(key)}
                          onChange={e => setVisibleCols(prev =>
                            e.target.checked ? [...prev, key] : prev.filter(k => k !== key)
                          )}
                          className="accent-indigo-600"
                        />
                        <span className="text-sm text-slate-600">{col.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Search */}
            <div className="relative w-64 ml-auto">
              <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
              />
            </div>
          </div>

          {/* Table card (rounded-b) */}
          <div className="bg-white rounded-b-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    {orderedVisibleCols.map(col => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap select-none"
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          {sortConfig?.key === col.key && (
                            sortConfig.dir === 'asc'
                              ? <ChevronUp size={12} className="text-indigo-500" />
                              : <ChevronDown size={12} className="text-indigo-500" />
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap text-right">Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paged.map((e, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      {orderedVisibleCols.map(col => (
                        <td key={col.key} className="px-4 py-2.5 text-sm text-slate-600 whitespace-nowrap">
                          {col.key === 'timestamp'
                            ? fmtDate(e.timestamp)
                            : getCellValue(e, col.key)
                          }
                        </td>
                      ))}
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => { setSelectedEvent(e); setIsDetailOpen(true); }}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="View detail"
                        >
                          <SettingsIcon size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {paged.length === 0 && (
                    <tr>
                      <td colSpan={orderedVisibleCols.length + 1} className="py-20 text-center">
                        <div className="flex flex-col items-center text-gray-400">
                          <MessageSquare size={32} className="mb-2 opacity-20" />
                          <p className="text-sm italic">No events found{search ? ' matching your search' : ''}.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <ReportPaging
              currentPage={page}
              totalItems={filtered.length}
              itemsPerPage={perPage}
              onPageChange={setPage}
              onItemsPerPageChange={v => { setPerPage(v); setPage(1); }}
              showAllOption={false}
            />
          </div>
        </div>
      </div>

      <InsightsEventDetailDrawer
        event={selectedEvent}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </>
  );
};

export default InsightsEventListDrawer;
