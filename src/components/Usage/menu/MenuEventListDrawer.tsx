import React, { useMemo, useState, useRef, useEffect } from 'react';
import { X, MessageSquare, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { MenuUsageEvent, MENU_EVENT_FRIENDLY } from '../../../types/menuUsageTypes';
import { getMenuEventFriendlyLabel } from './menuUsageHelpers';
import { fmtDateTime, EVENT_COLORS } from '../common/usageHelpers';
import { MENU_USER_NAMES, MENU_DISTRICT_NAMES } from '../../../data/mockMenuUsageData';
import { ReportPaging } from '../../InsightsReports/ReportPaging';
import { FilterIcon, SettingsIcon, AlertIcon, ChevronLeftIcon } from '../../Common/Icons';
import { ExportMenu } from '../../Downloading/ExportMenu/ExportMenu';
import { CSVExpButton } from '../../Downloading/CSVGen/CSVExpButton';
import type { ICSVReportData } from '../../Downloading/CSVGen/CSVContract';
import MenuEventDetailDrawer from './MenuEventDetailDrawer';

type ColKey = 'eventType' | 'userName' | 'districtName' | 'platform' | 'timestamp' | 'sessionId' | 'context';

interface ColDef { key: ColKey; label: string; defaultVisible: boolean; }

const COLUMNS: ColDef[] = [
  { key: 'eventType',    label: 'Event',    defaultVisible: true  },
  { key: 'userName',     label: 'User',     defaultVisible: true  },
  { key: 'districtName', label: 'District', defaultVisible: true  },
  { key: 'platform',     label: 'Platform', defaultVisible: false },
  { key: 'timestamp',    label: 'Date',     defaultVisible: true  },
  { key: 'sessionId',    label: 'Session',  defaultVisible: false },
  { key: 'context',      label: 'Context',  defaultVisible: true  },
];

const ALL_COL_KEYS: ColKey[] = COLUMNS.map(c => c.key);
const COL_BY_KEY = new Map(COLUMNS.map(c => [c.key, c]));
const DEFAULT_VISIBLE: ColKey[] = COLUMNS.filter(c => c.defaultVisible).map(c => c.key);

function getCsvValue(e: MenuUsageEvent, key: ColKey): string {
  switch (key) {
    case 'eventType':    return MENU_EVENT_FRIENDLY[e.eventType] ?? e.eventType;
    case 'userName':     return MENU_USER_NAMES[e.userId] ?? e.userId;
    case 'districtName': return MENU_DISTRICT_NAMES[e.districtId] ?? e.districtId;
    case 'platform':     return e.platform;
    case 'timestamp':    return e.timestamp;
    case 'sessionId':    return e.sessionId;
    case 'context':      return JSON.stringify(e.context);
    default:             return '';
  }
}

interface Props {
  events: MenuUsageEvent[];
  title: string;
  isOpen: boolean;
  onClose: () => void;
  zIndex?: number;
  isTopmost?: boolean;
}

const MenuEventListDrawer: React.FC<Props> = ({
  events, title, isOpen, onClose, zIndex = 65, isTopmost = true,
}) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [selectedEvent, setSelectedEvent] = useState<MenuUsageEvent | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [visibleCols, setVisibleCols] = useState<ColKey[]>(DEFAULT_VISIBLE);
  const [colOrder, setColOrder] = useState<ColKey[]>(ALL_COL_KEYS);
  const [showColPicker, setShowColPicker] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: ColKey; dir: 'asc' | 'desc' } | null>(null);
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

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !isOpen) return;
      if (isDetailOpen) return;
      if (!isTopmost) return;
      e.preventDefault();
      e.stopPropagation();
      onClose();
    };
    window.addEventListener('keydown', h, true);
    return () => window.removeEventListener('keydown', h, true);
  }, [isOpen, isDetailOpen, isTopmost, onClose]);

  const orderedVisibleCols = useMemo(
    () => colOrder.filter(k => visibleCols.includes(k)).map(k => COL_BY_KEY.get(k)!),
    [colOrder, visibleCols]
  );

  const filtered = useMemo(() => {
    let rows = [...events].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter(e => {
        const userName = MENU_USER_NAMES[e.userId] ?? e.userId;
        const districtName = MENU_DISTRICT_NAMES[e.districtId] ?? e.districtId;
        const friendly = MENU_EVENT_FRIENDLY[e.eventType] ?? e.eventType;
        return (
          userName.toLowerCase().includes(q) ||
          districtName.toLowerCase().includes(q) ||
          friendly.toLowerCase().includes(q) ||
          e.sessionId.toLowerCase().includes(q)
        );
      });
    }

    if (sortConfig) {
      rows = [...rows].sort((a, b) => {
        const av = getCsvValue(a, sortConfig.key);
        const bv = getCsvValue(b, sortConfig.key);
        const cmp = av.localeCompare(bv);
        return sortConfig.dir === 'asc' ? cmp : -cmp;
      });
    }

    return rows;
  }, [events, search, sortConfig]);

  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const csvData = useMemo((): ICSVReportData => ({
    fileName: `menu_events_${new Date().toISOString().slice(0, 10)}`,
    headers: orderedVisibleCols.map(c => c.label),
    rows: filtered.map(e => orderedVisibleCols.map(c => getCsvValue(e, c.key))),
  }), [filtered, orderedVisibleCols]);

  const requestSort = (key: ColKey) => {
    setSortConfig(prev =>
      prev?.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'desc' }
    );
  };

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

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        style={{ zIndex: zIndex - 5 }}
        onClick={onClose}
      />
      <div
        className="fixed inset-y-0 right-0 w-full max-w-5xl bg-white shadow-2xl flex flex-col"
        style={{ zIndex }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400">
              <ChevronLeftIcon size={18} />
            </button>
            <div>
              <h2 className="text-base font-bold text-slate-800">{title}</h2>
              <p className="text-xs text-gray-400">{filtered.length.toLocaleString()} events</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ExportMenu>
              <div className="px-4 py-1.5 bg-slate-50 border-y border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Data Exports</p>
              </div>
              <CSVExpButton title="Events (.csv)" subtext="All events matching current filters" csvData={csvData} />
            </ExportMenu>

            <div className="relative" ref={pickerRef}>
              <button
                onClick={() => setShowColPicker(p => !p)}
                className={`p-2 rounded-lg border transition-all ${showColPicker ? 'bg-orange-50 border-orange-400 text-orange-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                <SettingsIcon size={18} />
              </button>
              {showColPicker && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 shadow-xl rounded-xl z-50 p-4">
                  <div className="flex justify-between items-center mb-1 px-1">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Columns</h3>
                    <button
                      onClick={() => setVisibleCols(visibleCols.length === ALL_COL_KEYS.length ? [] : [...ALL_COL_KEYS])}
                      className="text-[10px] font-bold text-orange-600 uppercase hover:underline"
                    >
                      {visibleCols.length === ALL_COL_KEYS.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 px-1 mb-3">Drag to reorder</p>
                  <div className="space-y-0.5">
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
                            ${draggedKey === key ? 'opacity-40 bg-orange-50' : 'hover:bg-slate-50'}
                            ${dragOverKey === key && draggedKey !== key ? 'border-t-2 border-orange-400' : 'border-t-2 border-transparent'}
                          `}
                        >
                          <GripVertical size={14} className="text-gray-300 cursor-grab flex-shrink-0" />
                          <label className="flex items-center gap-2 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                              checked={visibleCols.includes(key)}
                              onChange={() => setVisibleCols(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])}
                            />
                            <span className="text-sm text-slate-600 font-medium">{col.label}</span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="relative w-60">
              <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search events..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none"
              />
            </div>

            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Hidden columns banner */}
        {hiddenCount > 0 && (
          <div className="px-6 py-2 border-b border-gray-100 flex items-center gap-2 text-amber-600 bg-amber-50">
            <AlertIcon size={14} className="text-amber-500" />
            <span className="text-[11px] font-semibold italic">Showing {visibleCols.length} of {ALL_COL_KEYS.length} columns.</span>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                {orderedVisibleCols.map(col => (
                  <th
                    key={col.key}
                    onClick={() => requestSort(col.key)}
                    className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap select-none cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {sortConfig?.key === col.key && (
                        sortConfig.dir === 'asc'
                          ? <ChevronUp size={12} className="text-orange-500" />
                          : <ChevronDown size={12} className="text-orange-500" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {paged.map((e, i) => (
                <tr
                  key={`${e.sessionId}-${e.timestamp}-${i}`}
                  onClick={() => { setSelectedEvent(e); setIsDetailOpen(true); }}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  {orderedVisibleCols.map(col => (
                    <td key={col.key} className="px-4 py-2.5 text-sm text-slate-500 whitespace-nowrap">
                      {col.key === 'eventType' && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: EVENT_COLORS[e.eventType] ?? '#64748b' }} />
                          <span className="text-slate-700 font-medium">{getMenuEventFriendlyLabel(e.eventType, e.context)}</span>
                        </div>
                      )}
                      {col.key === 'userName' && (MENU_USER_NAMES[e.userId] ?? e.userId)}
                      {col.key === 'districtName' && (MENU_DISTRICT_NAMES[e.districtId] ?? e.districtId)}
                      {col.key === 'platform' && e.platform}
                      {col.key === 'timestamp' && fmtDateTime(e.timestamp)}
                      {col.key === 'sessionId' && <span className="font-mono text-[11px] text-gray-400">{e.sessionId.slice(0, 8)}…</span>}
                      {col.key === 'context' && (
                        <span className="text-[11px] text-gray-400 font-mono">
                          {Object.entries(e.context)
                            .filter(([, v]) => v !== undefined && v !== '')
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(', ') || '—'}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {paged.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
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
      </div>

      <MenuEventDetailDrawer
        event={selectedEvent}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        zIndex={zIndex + 15}
      />
    </>
  );
};

export default MenuEventListDrawer;
