import React, { useMemo, useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, MessageSquare, GripVertical } from 'lucide-react';
import { InsightsDistrictStatRow } from '../../../types/insightsUsageTypes';
import { fmtDate } from './insightsUsageHelpers';
import { ReportPaging } from '../../InsightsReports/ReportPaging';
import { FilterIcon, SettingsIcon, AlertIcon } from '../../Common/Icons';
import EngagementTierBadge from '../../Common/EngagementTierBadge';
import { getEngagementTier, calcInsightsDistrictScore, EngagementTier } from '../../../utils/engagementTiers';
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

type ScoredRow = InsightsDistrictStatRow & { _score: number; _tier: EngagementTier };

type ColKey = 'districtName' | 'platform' | 'activeUsers' | 'sessions' | 'pageViews' |
  'interactions' | 'drawerOpens' | 'schoolieUsage' | 'downloads' | 'lastActivity' | 'engagement';

interface ColDef {
  key: ColKey;
  label: string;
  defaultVisible: boolean;
  sortValue: (r: ScoredRow) => string | number;
  getValue: (r: ScoredRow) => string | number;
  render: (r: ScoredRow) => React.ReactNode;
}

const COLUMNS: ColDef[] = [
  {
    key: 'districtName', label: 'District', defaultVisible: true,
    sortValue: r => r.districtName, getValue: r => r.districtName,
    render: r => <span className="text-sm font-medium text-slate-700">{r.districtName}</span>,
  },
  {
    key: 'platform', label: 'Platform', defaultVisible: true,
    sortValue: r => r.platform, getValue: r => r.platform,
    render: r => <span className="text-sm text-slate-500">{r.platform}</span>,
  },
  {
    key: 'activeUsers', label: 'Active Users', defaultVisible: true,
    sortValue: r => r.activeUsers, getValue: r => r.activeUsers,
    render: r => <span className="text-sm text-slate-500 tabular-nums">{r.activeUsers}</span>,
  },
  {
    key: 'sessions', label: 'Sessions', defaultVisible: true,
    sortValue: r => r.sessions, getValue: r => r.sessions,
    render: r => <span className="text-sm font-semibold text-indigo-600 tabular-nums">{r.sessions}</span>,
  },
  {
    key: 'pageViews', label: 'Page Views', defaultVisible: true,
    sortValue: r => r.pageViews, getValue: r => r.pageViews,
    render: r => <span className="text-sm text-slate-500 tabular-nums">{r.pageViews}</span>,
  },
  {
    key: 'interactions', label: 'Interactions', defaultVisible: true,
    sortValue: r => r.interactions, getValue: r => r.interactions,
    render: r => <span className="text-sm font-semibold text-emerald-600 tabular-nums">{r.interactions}</span>,
  },
  {
    key: 'drawerOpens', label: 'Drawer Opens', defaultVisible: true,
    sortValue: r => r.drawerOpens, getValue: r => r.drawerOpens,
    render: r => <span className="text-sm font-semibold text-teal-600 tabular-nums">{r.drawerOpens}</span>,
  },
  {
    key: 'schoolieUsage', label: 'Schoolie', defaultVisible: true,
    sortValue: r => r.schoolieUsage, getValue: r => r.schoolieUsage,
    render: r => <span className="text-sm font-semibold text-purple-600 tabular-nums">{r.schoolieUsage}</span>,
  },
  {
    key: 'downloads', label: 'Downloads', defaultVisible: true,
    sortValue: r => r.downloads, getValue: r => r.downloads,
    render: r => <span className="text-sm font-semibold text-amber-600 tabular-nums">{r.downloads}</span>,
  },
  {
    key: 'lastActivity', label: 'Last Activity', defaultVisible: true,
    sortValue: r => r.lastActivity, getValue: r => fmtDate(r.lastActivity),
    render: r => <span className="text-sm text-slate-400 whitespace-nowrap">{fmtDate(r.lastActivity)}</span>,
  },
  {
    key: 'engagement', label: 'Engagement', defaultVisible: true,
    sortValue: r => r._score, getValue: r => r._tier.label,
    render: r => <EngagementTierBadge tier={r._tier} />,
  },
];

const ALL_COL_KEYS = COLUMNS.map(c => c.key);
const COL_BY_KEY = new Map(COLUMNS.map(c => [c.key, c]));
const DEFAULT_VISIBLE = COLUMNS.filter(c => c.defaultVisible).map(c => c.key);

interface Props {
  data: InsightsDistrictStatRow[];
}

const InsightsDistrictGrid: React.FC<Props> = ({ data }) => {
  const [expanded, setExpanded] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ key: ColKey; dir: 'asc' | 'desc' }>({ key: 'interactions', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

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

  const scored = useMemo<ScoredRow[]>(() => {
    const allScores = data.map(r => calcInsightsDistrictScore(r));
    return data.map((r, i) => ({ ...r, _score: allScores[i], _tier: getEngagementTier(allScores[i], allScores) }));
  }, [data]);

  const orderedVisibleCols = useMemo(
    () => colOrder.filter(k => visibleCols.includes(k)).map(k => COL_BY_KEY.get(k)!),
    [colOrder, visibleCols]
  );

  const filtered = useMemo(() => {
    let rows = search
      ? scored.filter(r => r.districtName.toLowerCase().includes(search.toLowerCase()))
      : scored;
    const col = COL_BY_KEY.get(sort.key);
    if (col) {
      rows = [...rows].sort((a, b) => {
        const av = col.sortValue(a), bv = col.sortValue(b);
        const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number);
        return sort.dir === 'asc' ? cmp : -cmp;
      });
    }
    return rows;
  }, [scored, search, sort]);

  const paged = filtered.slice((page - 1) * perPage, page * perPage);
  const requestSort = (key: ColKey) =>
    setSort(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));

  const hiddenCount = ALL_COL_KEYS.length - visibleCols.length;

  const csvData = useMemo((): ICSVReportData => ({
    fileName: `Insights_Districts_${new Date().toISOString().slice(0, 10)}`,
    headers: orderedVisibleCols.map(c => c.label),
    rows: filtered.map(r => orderedVisibleCols.map(c => c.getValue(r))),
  }), [filtered, orderedVisibleCols]);

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
    <div className="rounded-xl border border-gray-200 shadow-sm bg-white">
      {/* Title row */}
      <div className="flex items-center justify-between px-5 py-3.5">
        <button onClick={() => setExpanded(e => !e)} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <span className="text-sm font-semibold text-slate-700">Districts Detail</span>
          <span className="text-[11px] text-gray-400">{data.length} districts</span>
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
                <CSVExpButton title="Districts (.csv)" subtext="Download visible columns as seen" csvData={csvData} />
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

              <div className="relative w-56">
                <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Search districts..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
                />
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
                      <div className="flex items-center gap-1.5">
                        {col.label}
                        <div className="w-4 flex items-center">
                          {sort.key === col.key && (sort.dir === 'asc'
                            ? <ChevronUp size={12} className="text-indigo-500" />
                            : <ChevronDown size={12} className="text-indigo-500" />)}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paged.map(row => (
                  <tr key={row.districtId} className="hover:bg-slate-50 transition-colors">
                    {orderedVisibleCols.map(col => (
                      <td key={col.key} className="px-4 py-2.5 text-sm text-slate-600">
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {paged.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <MessageSquare size={32} className="mb-2 opacity-20" />
                <p className="text-sm">No districts found{search ? ' matching your search' : ''}.</p>
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

export default React.memo(InsightsDistrictGrid);
