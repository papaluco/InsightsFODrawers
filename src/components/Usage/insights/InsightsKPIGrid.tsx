import React, { useMemo, useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, AlertTriangle, MessageSquare, GripVertical } from 'lucide-react';
import { KPIStatRow } from '../../../types/insightsUsageTypes';
import { KPI_COLORS } from '../../Usage/common/usageHelpers';
import { AlertIcon, SettingsIcon } from '../../Common/Icons';
import { ExportMenu } from '../../Downloading/ExportMenu/ExportMenu';
import { CSVExpButton } from '../../Downloading/CSVGen/CSVExpButton';
import type { ICSVReportData } from '../../Downloading/CSVGen/CSVContract';

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

type ColKey =
  | 'kpi' | 'drawerOpens' | 'schoolieOpens' | 'downloads' | 'trendSelections'
  | 'uniqueUsers' | 'available' | 'visibleSessions' | 'hidden' | 'neverOpened'
  | 'visibilityPct' | 'hiddenPct' | 'neverOpenedPct' | 'normalizedUsage'
  | 'avgOpensPerSession' | 'avgOpensPerUser' | 'needsAttention';

interface ColDef {
  key: ColKey;
  label: string;
  defaultVisible: boolean;
  sortValue: (r: KPIStatRow) => string | number;
  getValue: (r: KPIStatRow) => string | number;
  render: (r: KPIStatRow) => React.ReactNode;
}

function fmtPct(n: number, denom: number): string {
  if (denom === 0) return '—';
  return `${((n / denom) * 100).toFixed(1)}%`;
}

const COLUMNS: ColDef[] = [
  {
    key: 'kpi', label: 'KPI', defaultVisible: true,
    sortValue: r => r.kpi, getValue: r => r.kpi,
    render: r => (
      <div className="flex items-center gap-1.5">
        <span
          className="text-sm font-bold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: `${KPI_COLORS[r.kpi] ?? '#6366f1'}20`, color: KPI_COLORS[r.kpi] ?? '#6366f1' }}
        >
          {r.kpi}
        </span>
        {r.needsAttention && (
          <span title="Needs attention: high hidden or never-opened rate">
            <AlertTriangle size={13} className="text-amber-400 flex-shrink-0" />
          </span>
        )}
      </div>
    ),
  },
  {
    key: 'drawerOpens', label: 'Drawer Opens', defaultVisible: true,
    sortValue: r => r.drawerOpens, getValue: r => r.drawerOpens,
    render: r => (
      <div className="tabular-nums">
        <span className="text-sm font-semibold text-indigo-600">{r.drawerOpens}</span>
        {r.visibleSessions > 0 && (
          <span className="text-[11px] text-gray-400 ml-1">({fmtPct(r.drawerOpens, r.visibleSessions)})</span>
        )}
      </div>
    ),
  },
  {
    key: 'schoolieOpens', label: 'Schoolie', defaultVisible: true,
    sortValue: r => r.schoolieOpens, getValue: r => r.schoolieOpens,
    render: r => (
      <div className="tabular-nums">
        <span className="text-sm font-semibold text-purple-600">{r.schoolieOpens}</span>
        {r.visibleSessions > 0 && (
          <span className="text-[11px] text-gray-400 ml-1">({fmtPct(r.schoolieOpens, r.visibleSessions)})</span>
        )}
      </div>
    ),
  },
  {
    key: 'downloads', label: 'Downloads', defaultVisible: true,
    sortValue: r => r.downloads, getValue: r => r.downloads,
    render: r => (
      <div className="tabular-nums">
        <span className="text-sm font-semibold text-amber-600">{r.downloads}</span>
        {r.visibleSessions > 0 && (
          <span className="text-[11px] text-gray-400 ml-1">({fmtPct(r.downloads, r.visibleSessions)})</span>
        )}
      </div>
    ),
  },
  {
    key: 'trendSelections', label: 'Trend Sel.', defaultVisible: false,
    sortValue: r => r.trendSelections, getValue: r => r.trendSelections,
    render: r => (
      <div className="tabular-nums">
        <span className="text-sm text-slate-500">{r.trendSelections}</span>
        {r.visibleSessions > 0 && (
          <span className="text-[11px] text-gray-400 ml-1">({fmtPct(r.trendSelections, r.visibleSessions)})</span>
        )}
      </div>
    ),
  },
  {
    key: 'uniqueUsers', label: 'Unique Users', defaultVisible: true,
    sortValue: r => r.uniqueUsers, getValue: r => r.uniqueUsers,
    render: r => <span className="text-sm text-slate-500 tabular-nums">{r.uniqueUsers}</span>,
  },
  {
    key: 'available', label: 'Available', defaultVisible: false,
    sortValue: r => r.available, getValue: r => r.available,
    render: r => <span className="text-sm text-slate-400 tabular-nums">{r.available}</span>,
  },
  {
    key: 'visibleSessions', label: 'Visible', defaultVisible: true,
    sortValue: r => r.visibleSessions, getValue: r => r.visibleSessions,
    render: r => <span className="text-sm text-emerald-600 font-semibold tabular-nums">{r.visibleSessions}</span>,
  },
  {
    key: 'hidden', label: 'Hidden', defaultVisible: true,
    sortValue: r => r.hidden, getValue: r => r.hidden,
    render: r => (
      <div className="tabular-nums">
        <span className="text-sm text-slate-500">{r.hidden}</span>
        {r.available > 0 && (
          <span className="text-[11px] text-gray-400 ml-1">({(r.hiddenPct * 100).toFixed(1)}%)</span>
        )}
      </div>
    ),
  },
  {
    key: 'neverOpened', label: 'Never Opened', defaultVisible: true,
    sortValue: r => r.neverOpened, getValue: r => r.neverOpened,
    render: r => (
      <div className="tabular-nums">
        <span className={`text-sm ${r.neverOpenedPct > 0.8 ? 'text-red-500 font-semibold' : 'text-slate-500'}`}>{r.neverOpened}</span>
        {r.visibleSessions > 0 && (
          <span className="text-[11px] text-gray-400 ml-1">({(r.neverOpenedPct * 100).toFixed(1)}%)</span>
        )}
      </div>
    ),
  },
  {
    key: 'visibilityPct', label: 'Visibility %', defaultVisible: false,
    sortValue: r => r.visibilityPct, getValue: r => `${(r.visibilityPct * 100).toFixed(1)}%`,
    render: r => <span className="text-sm text-slate-500 tabular-nums">{(r.visibilityPct * 100).toFixed(1)}%</span>,
  },
  {
    key: 'hiddenPct', label: 'Hidden %', defaultVisible: false,
    sortValue: r => r.hiddenPct, getValue: r => `${(r.hiddenPct * 100).toFixed(1)}%`,
    render: r => (
      <span className={`text-sm tabular-nums ${r.hiddenPct > 0.3 ? 'text-amber-500 font-semibold' : 'text-slate-500'}`}>
        {(r.hiddenPct * 100).toFixed(1)}%
      </span>
    ),
  },
  {
    key: 'neverOpenedPct', label: 'Never Opened %', defaultVisible: false,
    sortValue: r => r.neverOpenedPct, getValue: r => `${(r.neverOpenedPct * 100).toFixed(1)}%`,
    render: r => (
      <span className={`text-sm tabular-nums ${r.neverOpenedPct > 0.8 ? 'text-red-500 font-semibold' : 'text-slate-500'}`}>
        {(r.neverOpenedPct * 100).toFixed(1)}%
      </span>
    ),
  },
  {
    key: 'normalizedUsage', label: 'Usage %', defaultVisible: true,
    sortValue: r => r.normalizedUsage, getValue: r => `${(r.normalizedUsage * 100).toFixed(1)}%`,
    render: r => <span className="text-sm font-semibold text-teal-600 tabular-nums">{(r.normalizedUsage * 100).toFixed(1)}%</span>,
  },
  {
    key: 'avgOpensPerSession', label: 'Avg/Session', defaultVisible: false,
    sortValue: r => r.avgOpensPerSession, getValue: r => r.avgOpensPerSession.toFixed(2),
    render: r => <span className="text-sm text-slate-500 tabular-nums">{r.avgOpensPerSession.toFixed(2)}</span>,
  },
  {
    key: 'avgOpensPerUser', label: 'Avg/User', defaultVisible: false,
    sortValue: r => r.avgOpensPerUser, getValue: r => r.avgOpensPerUser.toFixed(2),
    render: r => <span className="text-sm text-slate-500 tabular-nums">{r.avgOpensPerUser.toFixed(2)}</span>,
  },
  {
    key: 'needsAttention', label: 'Attention', defaultVisible: true,
    sortValue: r => r.needsAttention ? 1 : 0, getValue: r => r.needsAttention ? 'Yes' : 'No',
    render: r => r.needsAttention
      ? <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full"><AlertTriangle size={11} /> Attention</span>
      : <span className="text-[11px] text-gray-300">—</span>,
  },
];

const ALL_COL_KEYS = COLUMNS.map(c => c.key);
const COL_BY_KEY = new Map(COLUMNS.map(c => [c.key, c]));
const DEFAULT_VISIBLE = COLUMNS.filter(c => c.defaultVisible).map(c => c.key);

interface Props {
  data: KPIStatRow[];
}

const InsightsKPIGrid: React.FC<Props> = ({ data }) => {
  const [expanded, setExpanded] = useState(true);
  const [sort, setSort] = useState<{ key: ColKey; dir: 'asc' | 'desc' }>({ key: 'drawerOpens', dir: 'desc' });

  const [visibleCols, setVisibleCols] = useState<ColKey[]>(DEFAULT_VISIBLE);
  const [colOrder, setColOrder] = useState<ColKey[]>(ALL_COL_KEYS);
  const [showColPicker, setShowColPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const [draggedKey, setDraggedKey] = useState<ColKey | null>(null);
  const [dragOverKey, setDragOverKey] = useState<ColKey | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node))
        setShowColPicker(false);
    };
    if (showColPicker) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showColPicker]);

  const orderedVisibleCols = useMemo(
    () => colOrder.filter(k => visibleCols.includes(k)).map(k => COL_BY_KEY.get(k)!),
    [colOrder, visibleCols]
  );

  const sorted = useMemo(() => {
    const col = COL_BY_KEY.get(sort.key);
    if (!col) return data;
    return [...data].sort((a, b) => {
      const av = col.sortValue(a), bv = col.sortValue(b);
      const cmp = typeof av === 'string' ? (av as string).localeCompare(bv as string) : (av as number) - (bv as number);
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [data, sort]);

  const requestSort = (key: ColKey) =>
    setSort(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));

  const hiddenCount = ALL_COL_KEYS.length - visibleCols.length;

  const csvData = useMemo((): ICSVReportData => ({
    fileName: `Insights_KPIs_${new Date().toISOString().slice(0, 10)}`,
    headers: orderedVisibleCols.map(c => c.label),
    rows: sorted.map(r => orderedVisibleCols.map(c => c.getValue(r))),
  }), [sorted, orderedVisibleCols]);

  const handleDragStart = (e: React.DragEvent, key: ColKey) => { setDraggedKey(key); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e: React.DragEvent, key: ColKey) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (key !== draggedKey) setDragOverKey(key); };
  const handleDrop = (e: React.DragEvent, targetKey: ColKey) => {
    e.preventDefault();
    if (!draggedKey || draggedKey === targetKey) return;
    setColOrder(prev => {
      const next = [...prev];
      const from = next.indexOf(draggedKey), to = next.indexOf(targetKey);
      next.splice(from, 1); next.splice(to, 0, draggedKey);
      return next;
    });
    setDraggedKey(null); setDragOverKey(null);
  };
  const handleDragEnd = () => { setDraggedKey(null); setDragOverKey(null); };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5">
        <button onClick={() => setExpanded(e => !e)} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <span className="text-sm font-semibold text-slate-700">KPI Detail</span>
          <span className="text-[11px] text-gray-400">{data.length} KPIs</span>
        </button>
        <button onClick={() => setExpanded(e => !e)}>
          <CollapseChevron expanded={expanded} />
        </button>
      </div>

      {expanded && (
        <>
          {/* Toolbar */}
          <div className="border-t border-gray-100 px-5 py-3 flex justify-between items-center gap-3">
            {hiddenCount > 0 ? (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertIcon size={14} className="text-amber-500" />
                <span className="text-[11px] font-semibold italic">
                  Showing {visibleCols.length} of {ALL_COL_KEYS.length} columns.
                </span>
              </div>
            ) : <div />}

            <div className="flex items-center gap-3">
              <ExportMenu>
                <div className="px-4 py-1.5 bg-slate-50 border-y border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Data Exports</p>
                </div>
                <CSVExpButton title="KPIs (.csv)" subtext="Download visible columns as seen" csvData={csvData} />
              </ExportMenu>

              <div className="relative" ref={pickerRef}>
                <button
                  onClick={() => setShowColPicker(p => !p)}
                  className={`p-2 rounded-lg border transition-all ${showColPicker ? 'bg-indigo-50 border-indigo-400 text-indigo-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                >
                  <SettingsIcon size={18} />
                </button>
                {showColPicker && (
                  <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 shadow-xl rounded-xl z-50 p-4">
                    <div className="flex justify-between items-center mb-1 px-1">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Columns</h3>
                      <button
                        onClick={() => setVisibleCols(visibleCols.length === ALL_COL_KEYS.length ? [] : [...ALL_COL_KEYS])}
                        className="text-[10px] font-bold text-indigo-600 uppercase hover:underline"
                      >
                        {visibleCols.length === ALL_COL_KEYS.length ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 px-1 mb-3">Drag to reorder</p>
                    <div className="space-y-0.5 max-h-64 overflow-y-auto pr-1">
                      {colOrder.map(key => {
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
                              ${isOver ? 'border-t-2 border-indigo-400' : 'border-t-2 border-transparent'}`}
                          >
                            <GripVertical size={14} className="text-gray-300 cursor-grab flex-shrink-0" />
                            <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                              <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 flex-shrink-0"
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
            </div>
          </div>

          {/* Table */}
          <div className="border-t border-gray-100 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-gray-200">
                <tr>
                  {orderedVisibleCols.map(col => (
                    <th
                      key={col.key}
                      onClick={() => requestSort(col.key)}
                      className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap select-none"
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        {sort.key === col.key && (sort.dir === 'asc'
                          ? <ChevronUp size={12} className="text-indigo-500" />
                          : <ChevronDown size={12} className="text-indigo-500" />)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sorted.map(row => (
                  <tr key={row.kpi} className="hover:bg-slate-50 transition-colors">
                    {orderedVisibleCols.map(col => (
                      <td key={col.key} className="px-4 py-2.5">{col.render(row)}</td>
                    ))}
                  </tr>
                ))}
                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={orderedVisibleCols.length} className="py-16 text-center">
                      <div className="flex flex-col items-center text-gray-400">
                        <MessageSquare size={32} className="mb-2 opacity-20" />
                        <p className="text-sm">No KPI data available.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(InsightsKPIGrid);
