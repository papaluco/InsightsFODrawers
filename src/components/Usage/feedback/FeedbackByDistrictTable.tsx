import React, { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { FeedbackRecord } from '../../../types/feedbackTypes';
import { DISTRICT_DISPLAY_NAMES } from '../../../data/mockFeedbackData';
import { pct } from './feedbackHelpers';
import { ReportPaging } from '../../InsightsReports/ReportPaging';

type SortKey = 'districtName' | 'helpful' | 'notHelpful' | 'total' | 'pctHelpful';

interface Props {
  data: FeedbackRecord[];
  onDistrictClick: (districtId: string, districtName: string) => void;
}

function CollapseChevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${expanded ? 'rotate-180' : 'rotate-0'}`}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const FeedbackByDistrictTable: React.FC<Props> = ({ data, onDistrictClick }) => {
  const [expanded, setExpanded] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({
    key: 'total',
    direction: 'desc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const rows = useMemo(() => {
    const map = new Map<string, { helpful: number; notHelpful: number; name: string }>();
    data.forEach(r => {
      const cur = map.get(r.districtId) ?? {
        helpful: 0,
        notHelpful: 0,
        name: (r.contextJson?.districtName as string) ?? DISTRICT_DISPLAY_NAMES[r.districtId] ?? r.districtId,
      };
      if (r.feedbackValue === 'thumbs_up') cur.helpful++;
      else cur.notHelpful++;
      map.set(r.districtId, cur);
    });
    return [...map.entries()].map(([districtId, d]) => ({
      districtId,
      districtName: d.name,
      helpful: d.helpful,
      notHelpful: d.notHelpful,
      total: d.helpful + d.notHelpful,
      pctHelpfulNum: (d.helpful + d.notHelpful) > 0 ? d.helpful / (d.helpful + d.notHelpful) : 0,
    }));
  }, [data]);

  const sorted = useMemo(() => [...rows].sort((a, b) => {
    const val = (r: typeof rows[0]): string | number =>
      sortConfig.key === 'pctHelpful' ? r.pctHelpfulNum :
      sortConfig.key === 'districtName' ? r.districtName :
      r[sortConfig.key as 'helpful' | 'notHelpful' | 'total'];
    const av = val(a), bv = val(b);
    if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
    if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  }), [rows, sortConfig]);

  const paged = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
    setCurrentPage(1);
  };

  const SortChevron = ({ k }: { k: SortKey }) =>
    sortConfig.key === k
      ? sortConfig.direction === 'asc'
        ? <ChevronUp size={12} />
        : <ChevronDown size={12} />
      : null;

  const Th: React.FC<{ label: string; sortKey: SortKey; center?: boolean }> = ({ label, sortKey, center }) => (
    <th
      onClick={() => handleSort(sortKey)}
      className={`py-2.5 px-3 text-[11px] font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors ${center ? 'text-center' : 'text-left'}`}
    >
      <div className={`flex items-center gap-1 ${center ? 'justify-center' : ''}`}>
        {label}
        <SortChevron k={sortKey} />
      </div>
    </th>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="flex w-full items-center justify-between px-5 py-4 hover:bg-gray-50 rounded-xl">
        <button
          type="button"
          onClick={() => setExpanded(prev => !prev)}
          className="min-w-0 flex-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-expanded={expanded}
        >
          <h4 className="text-sm font-semibold text-gray-900">Feedback by District</h4>
        </button>
        <button
          type="button"
          onClick={() => setExpanded(prev => !prev)}
          className="ml-4 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          <CollapseChevron expanded={expanded} />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-gray-100">
          <div className="px-5 pt-4 pb-2">
            {!rows.length ? (
              <p className="text-sm text-gray-400 italic py-4">No data</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <Th label="District" sortKey="districtName" />
                      <Th label="👍" sortKey="helpful" center />
                      <Th label="👎" sortKey="notHelpful" center />
                      <Th label="Total" sortKey="total" center />
                      <Th label="% Helpful" sortKey="pctHelpful" center />
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map(row => (
                      <tr
                        key={row.districtId}
                        onClick={() => onDistrictClick(row.districtId, row.districtName)}
                        className="border-b border-gray-50 hover:bg-indigo-50 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-3 font-medium text-gray-800">{row.districtName}</td>
                        <td className="py-2.5 px-3 text-center text-green-600 font-semibold">{row.helpful}</td>
                        <td className="py-2.5 px-3 text-center text-red-500 font-semibold">{row.notHelpful}</td>
                        <td className="py-2.5 px-3 text-center text-gray-700 font-semibold">{row.total}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`font-semibold ${row.pctHelpfulNum >= 0.7 ? 'text-green-600' : row.pctHelpfulNum >= 0.5 ? 'text-amber-600' : 'text-red-500'}`}>
                            {pct(row.helpful, row.total)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {rows.length > 0 && (
            <ReportPaging
              currentPage={currentPage}
              totalItems={sorted.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={val => { setItemsPerPage(val); setCurrentPage(1); }}
              showAllOption={false}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackByDistrictTable;
