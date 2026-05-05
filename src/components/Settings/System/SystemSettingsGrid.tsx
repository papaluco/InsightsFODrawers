import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Edit2, Info, History, GripVertical } from 'lucide-react';
import { SystemSetting } from '../../../data/mockSystemSettingsData';
import { SystemSettingsFilterState } from './SystemSettingsFilters';
import {
  SettingsIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  AlertIcon,
} from '../../Common/Icons';
import { ExportMenu } from '../../Downloading/ExportMenu/ExportMenu';
import { CSVExpButton } from '../../Downloading/CSVGen/CSVExpButton';
import { ReportPaging } from '../../InsightsReports/ReportPaging';

// --- Column definition ---

interface ColDef {
  key: string;
  label: string;
  getValue: (s: SystemSetting) => string;
  defaultVisible: boolean;
}

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'object') return JSON.stringify(val);
  if (typeof val === 'boolean') return val ? 'true' : 'false';
  return String(val);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export const SYSTEM_SETTING_COLUMNS: ColDef[] = [
  { key: 'settingName',   label: 'Setting Name',  getValue: s => s.settingName,                defaultVisible: true  },
  { key: 'settingCode',   label: 'Code',           getValue: s => s.settingCode,                defaultVisible: true  },
  { key: 'module',        label: 'Module',         getValue: s => s.module,                     defaultVisible: true  },
  { key: 'scope',         label: 'Scope',          getValue: s => s.scope,                      defaultVisible: true  },
  { key: 'valueType',     label: 'Type',           getValue: s => s.valueType,                  defaultVisible: true  },
  { key: 'defaultValue',  label: 'Default Value',  getValue: s => formatValue(s.defaultValue),  defaultVisible: true  },
  { key: 'currentValue',  label: 'Current Value',  getValue: s => formatValue(s.currentValue),  defaultVisible: true  },
  { key: 'lastUpdatedBy', label: 'Updated By',     getValue: s => s.lastUpdatedBy,              defaultVisible: false },
  { key: 'lastUpdatedAt', label: 'Updated',        getValue: s => formatDate(s.lastUpdatedAt),  defaultVisible: false },
];

const DEFAULT_VISIBLE = SYSTEM_SETTING_COLUMNS.filter(c => c.defaultVisible).map(c => c.key);
const ALL_KEYS = SYSTEM_SETTING_COLUMNS.map(c => c.key);
const COL_BY_KEY = new Map(SYSTEM_SETTING_COLUMNS.map(c => [c.key, c]));

// --- Filter helper ---

function matchesFilter(s: SystemSetting, f: SystemSettingsFilterState): boolean {
  if (f.module && s.module !== f.module) return false;
  if (f.scope && s.scope !== f.scope) return false;
  if (f.valueType && s.valueType !== f.valueType) return false;
  if (f.search) {
    const q = f.search.toLowerCase();
    const text = SYSTEM_SETTING_COLUMNS.map(c => c.getValue(s)).join(' ').toLowerCase();
    if (!text.includes(q)) return false;
  }
  return true;
}

// --- CSV adapter ---

function buildCSV(data: SystemSetting[], visibleKeys: string[]) {
  const cols = visibleKeys.filter(k => COL_BY_KEY.has(k));
  const headers = cols.map(k => COL_BY_KEY.get(k)!.label);
  const rows = data.map(s =>
    cols.map(k => {
      const val = COL_BY_KEY.get(k)!.getValue(s);
      return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
    })
  );
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return { fileName: `System_Settings_${ts}.csv`, headers, rows };
}

// --- Component ---

interface SystemSettingsGridProps {
  settings: SystemSetting[];
  filters: SystemSettingsFilterState;
  onEdit: (setting: SystemSetting) => void;
  onViewDetails: (setting: SystemSetting) => void;
}

const ValueTypeBadge = ({ type }: { type: string }) => {
  const colors: Record<string, string> = {
    Boolean: 'bg-green-100 text-green-700',
    String:  'bg-blue-100 text-blue-700',
    Number:  'bg-purple-100 text-purple-700',
    Date:    'bg-amber-100 text-amber-700',
    JSON:    'bg-gray-100 text-gray-700',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[type] ?? 'bg-gray-100 text-gray-600'}`}>
      {type}
    </span>
  );
};

const ScopeBadge = ({ scope }: { scope: string }) => (
  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${scope === 'Global' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'}`}>
    {scope}
  </span>
);

export const SystemSettingsGrid: React.FC<SystemSettingsGridProps> = ({ settings, filters, onEdit, onViewDetails }) => {
  const [visibleColumns, setVisibleColumns] = useState<string[]>(DEFAULT_VISIBLE);
  const [columnOrder, setColumnOrder] = useState<string[]>(ALL_KEYS);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [draggedKey, setDraggedKey] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowColumnPicker(false);
    };
    if (showColumnPicker) document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [showColumnPicker]);

  const orderedVisibleCols = useMemo(
    () => columnOrder.filter(k => visibleColumns.includes(k)).map(k => COL_BY_KEY.get(k)!),
    [columnOrder, visibleColumns]
  );

  const filteredAndSorted = useMemo(() => {
    let rows = settings.filter(s => matchesFilter(s, filters));
    if (sortConfig) {
      const col = COL_BY_KEY.get(sortConfig.key);
      if (col) {
        rows = [...rows].sort((a, b) => {
          const av = col.getValue(a);
          const bv = col.getValue(b);
          if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
          if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }
    return rows;
  }, [settings, filters, sortConfig]);

  const paged = useMemo(() => {
    if (itemsPerPage <= 0) return filteredAndSorted;
    return filteredAndSorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredAndSorted, currentPage, itemsPerPage]);

  const requestSort = (key: string) => {
    setSortConfig(prev =>
      prev?.key === key && prev.direction === 'asc' ? { key, direction: 'desc' } : { key, direction: 'asc' }
    );
    setCurrentPage(1);
  };

  const csvData = useMemo(
    () => buildCSV(filteredAndSorted, orderedVisibleCols.map(c => c.key)),
    [filteredAndSorted, orderedVisibleCols]
  );

  const handleDragStart = (e: React.DragEvent, key: string) => { setDraggedKey(key); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver  = (e: React.DragEvent, key: string) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (key !== draggedKey) setDragOverKey(key); };
  const handleDrop = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    if (!draggedKey || draggedKey === targetKey) return;
    setColumnOrder(prev => {
      const next = [...prev];
      const from = next.indexOf(draggedKey);
      const to = next.indexOf(targetKey);
      next.splice(from, 1);
      next.splice(to, 0, draggedKey);
      return next;
    });
    setDraggedKey(null);
    setDragOverKey(null);
  };
  const handleDragEnd = () => { setDraggedKey(null); setDragOverKey(null); };

  const hiddenCount = ALL_KEYS.length - visibleColumns.length;

  const renderCell = (s: SystemSetting, key: string): React.ReactNode => {
    if (key === 'valueType') return <ValueTypeBadge type={s.valueType} />;
    if (key === 'scope') return <ScopeBadge scope={s.scope} />;
    const col = COL_BY_KEY.get(key);
    return col ? col.getValue(s) : '—';
  };

  return (
    <div className="flex flex-col gap-0">
      {/* Toolbar */}
      <div className="bg-white border border-gray-200 rounded-t-xl px-5 py-3 flex justify-between items-center gap-3">
        {hiddenCount > 0 ? (
          <div className="flex items-center gap-2 text-amber-600 animate-in fade-in duration-300">
            <AlertIcon size={14} className="text-amber-500" />
            <span className="text-[11px] font-semibold italic">
              Showing {visibleColumns.length} of {ALL_KEYS.length} columns.
            </span>
          </div>
        ) : <div />}

        <div className="flex items-center gap-3">
          {/* Export */}
          <ExportMenu>
            <div className="px-4 py-1.5 bg-slate-50 border-y border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Data Exports</p>
            </div>
            <CSVExpButton
              title="System Settings (.csv)"
              subtext="Download visible columns as seen"
              csvData={csvData}
            />
          </ExportMenu>

          {/* Column picker */}
          <div className="relative" ref={pickerRef}>
            <button
              onClick={() => setShowColumnPicker(p => !p)}
              className={`p-2 rounded-lg border transition-all ${showColumnPicker ? 'bg-indigo-50 border-indigo-400 text-indigo-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              <SettingsIcon size={18} />
            </button>

            {showColumnPicker && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 shadow-xl rounded-xl z-50 p-4 animate-in zoom-in-95 duration-100">
                <div className="flex justify-between items-center mb-1 px-1">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Columns</h3>
                  <button
                    onClick={() => setVisibleColumns(visibleColumns.length === ALL_KEYS.length ? [] : [...ALL_KEYS])}
                    className="text-[10px] font-bold text-indigo-600 uppercase hover:underline"
                  >
                    {visibleColumns.length === ALL_KEYS.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 px-1 mb-3">Drag to reorder</p>
                <div className="space-y-0.5 max-h-64 overflow-y-auto pr-1">
                  {columnOrder.map(key => {
                    const col = COL_BY_KEY.get(key)!;
                    const isDragging = draggedKey === key;
                    const isOver = dragOverKey === key && draggedKey !== key;
                    return (
                      <div
                        key={key}
                        draggable
                        onDragStart={e => handleDragStart(e, key)}
                        onDragOver={e => handleDragOver(e, key)}
                        onDrop={e => handleDrop(e, key)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-colors select-none
                          ${isDragging ? 'opacity-40 bg-indigo-50' : 'hover:bg-slate-50'}
                          ${isOver ? 'border-t-2 border-indigo-400' : 'border-t-2 border-transparent'}
                        `}
                      >
                        <GripVertical size={14} className="text-gray-300 cursor-grab flex-shrink-0" />
                        <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 flex-shrink-0"
                            checked={visibleColumns.includes(key)}
                            onChange={() =>
                              setVisibleColumns(prev =>
                                prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
                              )
                            }
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
        </div>
      </div>

      {/* Table */}
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
                          sortConfig.direction === 'asc'
                            ? <ChevronUpIcon size={13} className="text-indigo-500" />
                            : <ChevronDownIcon size={13} className="text-indigo-500" />
                        )}
                      </div>
                    </div>
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={orderedVisibleCols.length + 1} className="px-4 py-16 text-center text-sm text-gray-400">
                    No settings match your filters.
                  </td>
                </tr>
              ) : paged.map(s => {
                const valueOverridden = JSON.stringify(s.currentValue) !== JSON.stringify(s.defaultValue);
                return (
                <tr key={s.settingId} className="hover:bg-slate-50 transition-colors">
                  {orderedVisibleCols.map(col => {
                    const isCurrentValueCell = col.key === 'currentValue' && valueOverridden;
                    return (
                    <td
                      key={col.key}
                      className="px-4 py-2.5 text-sm text-slate-600"
                    >
                      <div className="truncate max-w-[200px] flex items-center gap-1.5">
                        {isCurrentValueCell && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        )}
                        {renderCell(s, col.key)}
                      </div>
                    </td>
                    );
                  })}
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(s)}
                        title="Edit"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onViewDetails(s)}
                        title="Details"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Info size={14} />
                      </button>
                      <button
                        onClick={() => {}}
                        title="History"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                      >
                        <History size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <ReportPaging
          currentPage={currentPage}
          totalItems={filteredAndSorted.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={val => { setItemsPerPage(val); setCurrentPage(1); }}
          showAllOption
        />
      </div>
    </div>
  );
};
