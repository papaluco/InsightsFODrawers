import React, { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown, MessageSquare, Zap } from 'lucide-react';
import { AppUserStatRow } from '../../../types/appUsageTypes';
import { fmtDate, fmtDuration } from './appUsageHelpers';
import { ReportPaging } from '../../InsightsReports/ReportPaging';
import { FilterIcon } from '../../Common/Icons';

interface Props {
  data: AppUserStatRow[];
  onRowClick?: (row: AppUserStatRow) => void;
  onUserClick?: (row: AppUserStatRow) => void;
  onSessionsClick?: (row: AppUserStatRow) => void;
  onDistrictClick?: (row: AppUserStatRow) => void;
}

type SortKey = keyof AppUserStatRow;

const COLS: { key: SortKey; label: string }[] = [
  { key: 'userName', label: 'User' },
  { key: 'districtName', label: 'District' },
  { key: 'platform', label: 'Platform' },
  { key: 'sessions', label: 'Sessions' },
  { key: 'eventCount', label: 'Events' },
  { key: 'lastActive', label: 'Last Active' },
  { key: 'avgSessionDuration', label: 'Avg Duration' },
];

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  );
}

const AppUserGrid: React.FC<Props> = ({ data, onRowClick, onUserClick, onSessionsClick, onDistrictClick }) => {
  const [expanded, setExpanded] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'sessions', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const filtered = useMemo(() => {
    let rows = search
      ? data.filter(r =>
          r.userName.toLowerCase().includes(search.toLowerCase()) ||
          r.districtName.toLowerCase().includes(search.toLowerCase())
        )
      : data;

    rows = [...rows].sort((a, b) => {
      const av = a[sort.key], bv = b[sort.key];
      const cmp = typeof av === 'string' ? (av as string).localeCompare(bv as string) : (av as number) - (bv as number);
      return sort.dir === 'asc' ? cmp : -cmp;
    });

    return rows;
  }, [data, search, sort]);

  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const requestSort = (key: SortKey) => {
    setSort(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
  };

  const isEventClickable = !!onRowClick;
const isDistrictClickable = !!onDistrictClick;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5">
        <button onClick={() => setExpanded(e => !e)} className="flex items-center gap-2.5 hover:opacity-80">
          <span className="text-sm font-semibold text-slate-700">Users</span>
          <span className="text-[11px] text-gray-400">{data.length} users</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="relative w-56">
            <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-200 focus:border-teal-400 outline-none"
            />
          </div>

          <button onClick={() => setExpanded(e => !e)}>
            <CollapseChevron expanded={expanded} />
          </button>
        </div>
      </div>

      {expanded && (
        <>
          <div className="border-t border-gray-100 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-gray-200">
                <tr>
                  {COLS.map(col => (
                    <th
                      key={col.key}
                      onClick={() => requestSort(col.key)}
                      className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 whitespace-nowrap select-none"
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        {sort.key === col.key && (
                          sort.dir === 'asc'
                            ? <ChevronUp size={12} className="text-teal-500" />
                            : <ChevronDown size={12} className="text-teal-500" />
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Power User</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {paged.map(row => (
                  <tr key={row.userId} className="transition-colors hover:bg-slate-50">
                    <td
                      onClick={() => onUserClick?.(row)}
                      className={`px-4 py-2.5 text-sm font-medium text-slate-700 ${
                        onUserClick ? 'cursor-pointer hover:text-teal-600 hover:bg-slate-100' : ''
                      }`}
                    >
                      {row.userName}
                    </td>

                    <td
  onClick={() => onDistrictClick?.(row)}
  className={`px-4 py-2.5 text-sm text-slate-500 ${
    isDistrictClickable ? 'cursor-pointer hover:text-teal-600 hover:bg-slate-100' : ''
  }`}
>
  {row.districtName}
</td>

                    <td
                      onClick={() => onRowClick?.(row)}
                      className={`px-4 py-2.5 text-sm text-slate-500 ${
                        isEventClickable ? 'cursor-pointer hover:text-teal-600 hover:bg-slate-100' : ''
                      }`}
                    >
                      {row.platform}
                    </td>

                    <td className="px-4 py-2.5 text-sm">
                      <button
                        onClick={() => onSessionsClick?.(row)}
                        disabled={row.sessions === 0 || !onSessionsClick}
                        className="font-semibold text-teal-600 tabular-nums hover:underline hover:text-teal-700 disabled:text-slate-300 disabled:hover:no-underline disabled:cursor-not-allowed"
                      >
                        {row.sessions}
                      </button>
                    </td>

                    <td
                      onClick={() => onRowClick?.(row)}
                      className={`px-4 py-2.5 text-sm text-slate-500 tabular-nums ${
                        isEventClickable ? 'cursor-pointer hover:text-teal-600 hover:bg-slate-100' : ''
                      }`}
                    >
                      {row.eventCount}
                    </td>

                    <td
                      onClick={() => onRowClick?.(row)}
                      className={`px-4 py-2.5 text-sm text-slate-400 whitespace-nowrap ${
                        isEventClickable ? 'cursor-pointer hover:text-teal-600 hover:bg-slate-100' : ''
                      }`}
                    >
                      {fmtDate(row.lastActive)}
                    </td>

                    <td
                      onClick={() => onRowClick?.(row)}
                      className={`px-4 py-2.5 text-sm text-slate-500 ${
                        isEventClickable ? 'cursor-pointer hover:text-teal-600 hover:bg-slate-100' : ''
                      }`}
                    >
                      {fmtDuration(row.avgSessionDuration)}
                    </td>

                    <td
                      onClick={() => onRowClick?.(row)}
                      className={`px-4 py-2.5 ${
                        isEventClickable ? 'cursor-pointer hover:bg-slate-100' : ''
                      }`}
                    >
                      {row.isPowerUser && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[11px] font-semibold rounded-full">
                          <Zap size={10} /> Power
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {paged.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <MessageSquare size={32} className="mb-2 opacity-20" />
                <p className="text-sm">No users found{search ? ' matching your search' : ''}.</p>
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

export default AppUserGrid;