import React, { useMemo, useState, useRef, useEffect } from 'react';
import { X, MessageSquare, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { AppUsageEvent, AppUserStatRow, AppSessionStatRow, APP_EVENT_FRIENDLY } from '../../../types/appUsageTypes';
import { fmtDateTime, APP_ICONS, TAB_COLORS  } from './appUsageHelpers';
import { APP_USER_NAMES, APP_DISTRICT_NAMES } from '../../../data/mockAppUsageData';
import { ReportPaging } from '../../InsightsReports/ReportPaging';
import { FilterIcon, SettingsIcon, AlertIcon, ChevronLeftIcon } from '../../Common/Icons';
import { ExportMenu } from '../../Downloading/ExportMenu/ExportMenu';
import { CSVExpButton } from '../../Downloading/CSVGen/CSVExpButton';
import type { ICSVReportData } from '../../Downloading/CSVGen/CSVContract';
import AppEventDetailDrawer from './AppEventDetailDrawer';

type ColKey = 'eventType' | 'page' | 'userName' | 'districtName' | 'platform' | 'timestamp' | 'sessionId';

interface ColDef { key: ColKey; label: string; defaultVisible: boolean; }

const COLUMNS: ColDef[] = [
  { key: 'eventType',    label: 'Event',    defaultVisible: true  },
  { key: 'page',         label: 'Page',     defaultVisible: true  },
  { key: 'userName',     label: 'User',     defaultVisible: true  },
  { key: 'districtName', label: 'District', defaultVisible: true  },
  { key: 'platform',     label: 'Platform', defaultVisible: true },
  { key: 'timestamp',    label: 'Date',     defaultVisible: true  },
  { key: 'sessionId',    label: 'Session',  defaultVisible: true },
];

const ALL_COL_KEYS: ColKey[] = COLUMNS.map(c => c.key);
const COL_BY_KEY = new Map(COLUMNS.map(c => [c.key, c]));
const DEFAULT_VISIBLE: ColKey[] = COLUMNS.filter(c => c.defaultVisible).map(c => c.key);

function getCellValue(e: AppUsageEvent, key: ColKey): string {
  switch (key) {
    case 'eventType':    return APP_EVENT_FRIENDLY[e.eventType as keyof typeof APP_EVENT_FRIENDLY] ?? e.eventType;
    case 'page':         return e.page;
    case 'userName':     return APP_USER_NAMES[e.userId] ?? e.userId;
    case 'districtName': return APP_DISTRICT_NAMES[e.districtId] ?? e.districtId;
    case 'platform':     return e.platform;
    case 'timestamp':    return e.timestamp;
    case 'sessionId':    return e.sessionId;
    default:             return '';
  }
}

interface Props {
  events: AppUsageEvent[];
  title: string;
  isOpen: boolean;
  onClose: () => void;
  users?: AppUserStatRow[];
  sessions?: AppSessionStatRow[];
  onUserClick?: (user: AppUserStatRow) => void;
  onSessionClick?: (session: AppSessionStatRow) => void;
}

const AppEventListDrawer: React.FC<Props> = ({ events, title, isOpen, onClose, users = [], sessions = [], onUserClick, onSessionClick }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selectedEvent, setSelectedEvent] = useState<AppUsageEvent | null>(null);
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

  // Escape: only close if detail is NOT open
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !isOpen) return;

      if (isDetailOpen) {
        e.preventDefault();
        e.stopPropagation();
        setIsDetailOpen(false);
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      onClose();
    };

    window.addEventListener('keydown', h, true);
    return () => window.removeEventListener('keydown', h, true);
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
        getCellValue(e, 'userName').toLowerCase().includes(q) ||
        getCellValue(e, 'districtName').toLowerCase().includes(q) ||
        getCellValue(e, 'eventType').toLowerCase().includes(q) ||
        getCellValue(e, 'page').toLowerCase().includes(q)
      );
    }
    if (sortConfig) {
      rows.sort((a, b) => {
        const cmp = getCellValue(a, sortConfig.key).localeCompare(getCellValue(b, sortConfig.key));
        return sortConfig.dir === 'asc' ? cmp : -cmp;
      });
    }
    return rows;
  }, [events, search, sortConfig]);

  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const requestSort = (key: ColKey) => {
    setSortConfig(prev => prev?.key === key && prev.dir === 'asc' ? { key, dir: 'desc' } : { key, dir: 'asc' });
    setPage(1);
  };

  const handleCellClick = (e: AppUsageEvent, key: ColKey) => {
  if (key === 'eventType') {
    setSelectedEvent(e);
    setIsDetailOpen(true);
    return;
  }

  if (key === 'userName') {
    const user = users.find(u => u.userId === e.userId);
    if (user) onUserClick?.(user);
    return;
  }

  if (key === 'sessionId') {
    const session = sessions.find(s => s.sessionId === e.sessionId);
    if (session) onSessionClick?.(session);
    return;
  }
};

  const csvData = useMemo((): ICSVReportData => ({
    fileName: `app_events_${new Date().toISOString().slice(0, 10)}`,
    headers: orderedVisibleCols.map(c => c.label),
    rows: filtered.map(e => orderedVisibleCols.map(c => getCellValue(e, c.key))),
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

  const renderCell = (e: AppUsageEvent, key: ColKey): React.ReactNode => {
    if (key === 'eventType') return (
      <span className="text-xs text-slate-600 whitespace-nowrap">
        {APP_EVENT_FRIENDLY[e.eventType as keyof typeof APP_EVENT_FRIENDLY] ?? e.eventType}
      </span>
    );
    if (key === 'timestamp') return <span className="text-slate-400 whitespace-nowrap">{fmtDateTime(e.timestamp)}</span>;
    if (key === 'page') return <span className="font-medium text-slate-700">{e.page}</span>;
    return <span>{getCellValue(e, key)}</span>;
  };

  return (
    <>
      <div className={`fixed inset-0 bg-white z-[52] flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="px-8 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors" title="Back">
              <ChevronLeftIcon size={20} />
            </button>
            <div
  className="w-10 h-10 rounded-xl flex items-center justify-center"
  style={{ backgroundColor: `${TAB_COLORS.Event}1A` }}
>
  <APP_ICONS.EVENT size={20} style={{ color: TAB_COLORS.Event }} />
</div>

<div>
  <h2 className="text-xl font-bold text-gray-900">{title}</h2>
  <p className="text-xs text-gray-500">App usage events</p>
</div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6">
          <div className="mb-4">
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest">
              {filtered.length.toLocaleString()} record{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-t-xl px-5 py-3 flex justify-between items-center gap-3">
            {hiddenCount > 0 ? (
              <div className="flex items-center gap-2 text-amber-600 animate-in fade-in duration-300">
                <AlertIcon size={14} className="text-amber-500" />
                <span className="text-[11px] font-semibold italic">Showing {visibleCols.length} of {ALL_COL_KEYS.length} columns.</span>
              </div>
            ) : <div />}

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

              <div className="relative w-64">
                <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none transition-all placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border-x border-b border-gray-200 rounded-b-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    {orderedVisibleCols.map(col => (
                      <th
                        key={col.key}
                        onClick={() => requestSort(col.key)}
                        className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-slate-50 transition-colors select-none whitespace-nowrap"
                      >
                        <div className="flex items-center gap-1.5">
                          {col.label}
                          <div className="w-4 flex items-center">
                            {sortConfig?.key === col.key && (
                              sortConfig.dir === 'asc'
                                ? <ChevronUp size={12} className="text-teal-500" />
                                : <ChevronDown size={12} className="text-teal-500" />
                            )}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paged.map((e, i) => (
                    <tr
                      key={`${e.sessionId}-${i}`}
                      
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {orderedVisibleCols.map(col => (
                        <td
                          key={col.key}
                          onClick={() => handleCellClick(e, col.key)}
                          className={`px-4 py-2.5 text-sm text-slate-600 ${
                            ['eventType', 'userName', 'sessionId'].includes(col.key)
                              ? 'cursor-pointer hover:text-teal-600 font-medium hover:bg-slate-100'
                              : ''
                            }`}
                        >
                          {renderCell(e, col.key)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {paged.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <MessageSquare size={36} className="mb-3 opacity-20" />
                  <p className="text-sm font-medium">No events found{search ? ' matching your search' : ''}.</p>
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
        </div>
      </div>

      <AppEventDetailDrawer
        event={selectedEvent}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </>
  );
};

export default AppEventListDrawer;
