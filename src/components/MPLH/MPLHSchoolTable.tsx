import React, { useState, useMemo, useEffect, useRef } from 'react';
// Added ChevronUp to the imports below
import { ChevronDown, ChevronUp, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { SchoolMPLHData } from '../../data/mockMPLHData';
import { MPLHOtherMeals } from './MPLHOtherMeals';

interface MPLHSchoolTableProps {
  schoolData: SchoolMPLHData[];
  onOpenSingleSchool: (schoolName: string) => void;
  districtTotals: any;
  actualMPLH: number;
  targetMPLH: number;
}

// Helper component moved outside for better performance/cleanliness
const SortIcon = ({ column, config }: { column: string, config: any }) => {
  if (config?.key !== column) return <div className="w-4 h-4 opacity-0" />;
  return config.direction === 'asc' 
    ? <ChevronUp className="w-4 h-4 text-blue-600" /> 
    : <ChevronDown className="w-4 h-4 text-blue-600" />;
};

export const MPLHSchoolTable: React.FC<MPLHSchoolTableProps> = ({
  schoolData,
  onOpenSingleSchool,
  districtTotals,
  actualMPLH,
  targetMPLH,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number | 'All'>(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNeedsAttention, setShowNeedsAttention] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [sortConfig, setSortConfig] = useState<{ key: keyof SchoolMPLHData; direction: 'asc' | 'desc' } | null>({
    key: 'schoolName',
    direction: 'asc',
  });

  useEffect(() => {
    if (isExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isExpanded]);

  const filteredSchools = useMemo(() => {
    return schoolData.filter((school) => {
      const matchesSearch = school.schoolName.toLowerCase().includes(searchTerm.toLowerCase());
      const needsAttention = school.mplh < school.mplhTarget;
      return showNeedsAttention ? matchesSearch && needsAttention : matchesSearch;
    });
  }, [schoolData, searchTerm, showNeedsAttention]);

  const sortedSchools = useMemo(() => {
    const sortableItems = [...filteredSchools];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredSchools, sortConfig]);

  const itemsPerPage = rowsPerPage === 'All' ? sortedSchools.length : rowsPerPage;
  const totalPages = Math.ceil(sortedSchools.length / (itemsPerPage || 1));
  const startIndex = (currentPage - 1) * (itemsPerPage as number);
  const currentSchools = sortedSchools.slice(startIndex, startIndex + (itemsPerPage as number));

  const handleSort = (key: keyof SchoolMPLHData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between w-full mb-4">
        <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-2 group outline-none">
          <h3 className="text-lg font-semibold text-gray-900">Details by School</h3>
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
        </button>

        {isExpanded && (
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
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-visible">
            <div className="overflow-x-auto overflow-y-visible">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th onClick={() => handleSort('schoolName')} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                      <div className="flex items-center gap-1">
                        <span>School</span>
                        <SortIcon column="schoolName" config={sortConfig} />
                      </div>
                    </th>
                    <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Breakfast</th>
                    <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Lunch</th>
                    <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Snack</th>
                    <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">A La Carte</th>
                    <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Other</th>
                    <th onClick={() => handleSort('mealEquivalents')} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                      <div className="flex items-center justify-center gap-1">
                        <span>MEQs</span>
                        <SortIcon column="mealEquivalents" config={sortConfig} />
                      </div>
                    </th>
                    <th onClick={() => handleSort('laborHours')} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                      <div className="flex items-center justify-center gap-1">
                        <span>Hours</span>
                        <SortIcon column="laborHours" config={sortConfig} />
                      </div>
                    </th>
                    <th onClick={() => handleSort('mplh')} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                      <div className="flex items-center justify-center gap-1">
                        <span>MPLH</span>
                        <SortIcon column="mplh" config={sortConfig} />
                      </div>
                    </th>
                    <th onClick={() => handleSort('mplhTarget')} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                      <div className="flex items-center justify-center gap-1">
                        <span>Bench</span>
                        <SortIcon column="mplhTarget" config={sortConfig} />
                      </div>
                    </th>
                    <th onClick={() => handleSort('mplhDelta')} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                      <div className="flex items-center justify-center gap-1">
                        <span>Diff</span>
                        <SortIcon column="mplhDelta" config={sortConfig} />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentSchools.length > 0 ? (
                    currentSchools.map((school, index) => (
                      <tr
                        key={school.schoolName}
                        className="hover:bg-blue-50/50 cursor-pointer transition-colors group relative hover:z-20"
                        onClick={() => onOpenSingleSchool(school.schoolName)}
                      >
                        <td className="px-4 py-4 text-sm font-medium text-blue-600 group-hover:text-blue-700">{school.schoolName}</td>
                        <td className="px-2 py-4 text-sm text-center text-gray-600">{school.breakfast.toLocaleString()}</td>
                        <td className="px-2 py-4 text-sm text-center text-gray-600">{school.lunch.toLocaleString()}</td>
                        <td className="px-2 py-4 text-sm text-center text-gray-600">{school.snack.toLocaleString()}</td>
                        <td className="px-2 py-4 text-sm text-center text-gray-600">{school.aLaCarte.toLocaleString()}</td>
                        <td className="px-2 py-4 text-sm text-center text-gray-600">
                          <MPLHOtherMeals other={school.other} isFirstRow={index === 0} />
                        </td>
                        <td className="px-2 py-4 text-sm text-center text-gray-600 font-medium">{school.mealEquivalents.toLocaleString()}</td>
                        <td className="px-2 py-4 text-sm text-center text-gray-600 font-medium">{school.laborHours.toLocaleString()}</td>
                        <td className={`px-4 py-4 text-sm text-center font-bold ${school.mplh >= school.mplhTarget ? 'text-emerald-600' : 'text-red-600'}`}>
                          {school.mplh.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 text-sm text-center text-gray-600 font-medium">{school.mplhTarget.toFixed(2)}</td>
                        <td className={`px-4 py-4 text-sm text-center font-bold ${school.mplhDelta >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {school.mplhDelta >= 0 ? '+' : ''}{school.mplhDelta.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={11} className="px-6 py-10 text-center text-sm text-gray-500">
                        {showNeedsAttention ? 'All schools are currently meeting their MPLH targets!' : `No schools found matching "${searchTerm}"`}
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200 font-bold relative z-10">
                  <tr>
                    <td className="px-4 py-4 text-sm text-gray-900">Total District</td>
                    <td className="px-2 py-4 text-sm text-center text-gray-900">{districtTotals.breakfast.toLocaleString()}</td>
                    <td className="px-2 py-4 text-sm text-center text-gray-900">{districtTotals.lunch.toLocaleString()}</td>
                    <td className="px-2 py-4 text-sm text-center text-gray-900">{districtTotals.snack.toLocaleString()}</td>
                    <td className="px-2 py-4 text-sm text-center text-gray-900">{districtTotals.aLaCarte.toLocaleString()}</td>
                    <td className="px-2 py-4 text-sm text-center text-gray-900">{districtTotals.other.toLocaleString()}</td>
                    <td className="px-2 py-4 text-sm text-center text-gray-900">{districtTotals.mealEquivalents.toLocaleString()}</td>
                    <td className="px-2 py-4 text-sm text-center text-gray-900">{districtTotals.laborHours.toLocaleString()}</td>
                    <td className={`px-4 py-4 text-sm text-center font-extrabold ${actualMPLH >= targetMPLH ? 'text-emerald-600' : 'text-red-600'}`}>{actualMPLH.toFixed(2)}</td>
                    <td className="px-4 py-4 text-sm text-center text-gray-900">{targetMPLH.toFixed(2)}</td>
                    <td className={`px-4 py-4 text-sm text-center font-extrabold ${(actualMPLH - targetMPLH) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {(actualMPLH - targetMPLH) >= 0 ? '+' : ''}{(actualMPLH - targetMPLH).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 px-2">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Showing {startIndex + 1}-{Math.min(startIndex + (itemsPerPage as number), sortedSchools.length)} of {sortedSchools.length}</span>
              <select className="border border-gray-200 rounded-lg text-xs p-1 bg-white" value={rowsPerPage} onChange={(e) => {
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
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border rounded-lg disabled:opacity-50"><ChevronLeft className="w-5 h-5"/></button>
                <span className="text-sm">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border rounded-lg disabled:opacity-50"><ChevronRight className="w-5 h-5"/></button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};