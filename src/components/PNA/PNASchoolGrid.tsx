import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { mockPNAData } from '../../data/mockPNAData';

interface PNASchoolGridProps {
  onOpenSingleSchool: (schoolName: string) => void;
  targetPNA: number;
  actualPNA: number;
  isSingleSchoolMode?: boolean;
  singleSchoolName?: string;
  hideControls?: boolean;
}

type SortConfig = {
  key: 'school' | 'students' | 'paid' | 'pna' | 'pnaTarget' | 'pnaDelta';
  direction: 'asc' | 'desc';
} | null;

export const PNASchoolGrid: React.FC<PNASchoolGridProps> = ({ 
  onOpenSingleSchool, 
  targetPNA, 
  actualPNA,
  isSingleSchoolMode = false,
  singleSchoolName,
  hideControls = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number | 'All'>(10);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'school', direction: 'asc' });
  const [showNeedsAttention, setShowNeedsAttention] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && searchInputRef.current && !hideControls) {
      searchInputRef.current.focus();
    }
  }, [isExpanded, hideControls]);

  const totals = useMemo(() => {
    return mockPNAData.reduce((acc, curr) => ({
      students: acc.students + curr.students,
      paid: acc.paid + curr.paid,
    }), { students: 0, paid: 0 });
  }, []);

  const filteredData = useMemo(() => {
    if (isSingleSchoolMode && singleSchoolName) {
      return mockPNAData.filter(item => item.school === singleSchoolName);
    }
    return mockPNAData.filter(item => {
      const matchesSearch = item.school.toLowerCase().includes(searchTerm.toLowerCase());
      const needsAttention = item.pna > item.pnaTarget;
      return showNeedsAttention ? matchesSearch && needsAttention : matchesSearch;
    });
  }, [searchTerm, showNeedsAttention, isSingleSchoolMode, singleSchoolName]);

  const sortedData = useMemo(() => {
    let sortableData = [...filteredData];
    if (sortConfig !== null) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableData;
  }, [filteredData, sortConfig]);

  const itemsPerPage = rowsPerPage === 'All' ? sortedData.length : rowsPerPage;
  const totalPages = Math.ceil(sortedData.length / (itemsPerPage || 1));
  const startIndex = (currentPage - 1) * (itemsPerPage as number);
  const currentSchools = sortedData.slice(startIndex, startIndex + (itemsPerPage as number));

  const requestSort = (key: 'school' | 'students' | 'paid' | 'pna' | 'pnaTarget' | 'pnaDelta') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig?.key !== column) return <div className="w-4 h-4 opacity-0" />;
    return sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between w-full mb-4">
        <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-2 group outline-none">
          <h3 className="text-lg font-semibold text-gray-900 text-left">Details by School</h3>
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
        </button>

        {isExpanded && !hideControls && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setShowNeedsAttention(!showNeedsAttention);
                setCurrentPage(1);
              }}
              className={`px-4 py-1.5 rounded-full border text-xs font-bold tracking-wide uppercase transition-all duration-200 ${
                showNeedsAttention
                  ? 'bg-red-600 border-red-600 text-white shadow-md ring-2 ring-red-100'
                  : 'bg-white border-gray-300 text-gray-500 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              Needs Attention
            </button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search school..."
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {isExpanded && (
        <>
          <div className="overflow-hidden border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-50">
  <tr>
    <th onClick={() => requestSort('school')} className="w-[30%] px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
      <div className="flex items-left justify-left space-x-1">
        <span>School</span>
        <SortIcon column="school" />
      </div>
    </th>
    <th onClick={() => requestSort('students')} className="w-[14%] px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
      <div className="flex items-center justify-center space-x-1">
        <span>Enrolled</span>
        <SortIcon column="students" />
      </div>
    </th>
    <th onClick={() => requestSort('paid')} className="w-[14%] px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
      <div className="flex items-center justify-center space-x-1">
        <span>PNA</span>
        <SortIcon column="paid" />
      </div>
    </th>
    <th onClick={() => requestSort('pna')} className="w-[14%] px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
      <div className="flex items-center justify-center space-x-1">
        <span>PNA %</span>
        <SortIcon column="pna" />
      </div>
    </th>
    <th onClick={() => requestSort('pnaTarget')} className="w-[14%] px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
      <div className="flex items-center justify-center space-x-1">
        <span>Bench</span>
        <SortIcon column="pnaTarget" />
      </div>
    </th>
    <th onClick={() => requestSort('pnaDelta')} className="w-[14%] px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
      <div className="flex items-center justify-center space-x-1">
        <span>Diff</span>
        <SortIcon column="pnaDelta" />
      </div>
    </th>
  </tr>
</thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentSchools.map((school) => {
                    const isLinkable = !isSingleSchoolMode;
                    return (
                      <tr 
                        key={school.school} 
                        className={`${isLinkable ? 'hover:bg-blue-50/50 cursor-pointer' : 'cursor-default'} transition-colors group`}
                        onClick={() => isLinkable && onOpenSingleSchool(school.school)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-left truncate">
                          {isLinkable ? (
                            <span className="text-blue-600 group-hover:underline">{school.school}</span>
                          ) : (
                            <span className="text-gray-900">{school.school}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">{school.students.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">{school.paid.toLocaleString()}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-center ${school.pna > targetPNA ? 'text-red-600' : 'text-emerald-600'}`}>{school.pna.toFixed(2)}%</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">{school.pnaTarget.toFixed(2)}%</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-center ${school.pnaDelta > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {school.pnaDelta >= 0 ? '+' : ''}{school.pnaDelta.toFixed(2)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {!isSingleSchoolMode && (
                  <tfoot className="bg-gray-50 border-t-2 border-gray-200 font-bold">
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900 text-left">Total District</td>
                      <td className="px-6 py-4 text-sm text-center text-gray-900">{totals.students.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-center text-gray-900">{totals.paid.toLocaleString()}</td>
                      <td className={`px-6 py-4 text-sm text-center font-extrabold ${actualPNA > targetPNA ? 'text-red-600' : 'text-emerald-600'}`}>{actualPNA.toFixed(2)}%</td>
                      <td className="px-6 py-4 text-sm text-center text-gray-900">{targetPNA.toFixed(2)}%</td>
                      <td className={`px-6 py-4 text-sm text-center font-extrabold ${(actualPNA - targetPNA) > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {(actualPNA - targetPNA) >= 0 ? '+' : ''}{(actualPNA - targetPNA).toFixed(2)}%
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {!isSingleSchoolMode && (
            <div className="flex items-center justify-between mt-4 px-2">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>
                  Showing {startIndex + 1}-{Math.min(startIndex + (itemsPerPage as number), sortedData.length)} of {sortedData.length}
                </span>
                <select className="border border-gray-200 rounded-lg text-xs p-1 outline-none bg-white ml-2 cursor-pointer" value={rowsPerPage} onChange={(e) => {
                  setRowsPerPage(e.target.value === 'All' ? 'All' : parseInt(e.target.value));
                  setCurrentPage(1);
                }}>
                  <option value={5}>Show 5</option>
                  <option value={10}>Show 10</option>
                  <option value={25}>Show 25</option>
                  <option value="All">Show All</option>
                </select>
              </div>

              {rowsPerPage !== 'All' && totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"><ChevronLeft className="w-5 h-5"/></button>
                  <span className="text-sm text-gray-700 font-medium">Page {currentPage} of {totalPages}</span>
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"><ChevronRight className="w-5 h-5"/></button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};