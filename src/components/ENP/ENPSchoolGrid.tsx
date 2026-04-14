import React from 'react';
import { ChevronDown, Search, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';

interface ENPSchoolGridProps {
  isExpanded: boolean;
  onToggle: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
  currentSchools: any[];
  schoolSortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  onSort: (key: string) => void;
  onOpenSingleSchool: (schoolName: string) => void;
  benchmarkENP: number;
  startIndex: number;
  totalSchools: number;
  rowsPerPage: number | 'All';
  onRowsPerPageChange: (val: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (direction: 'next' | 'prev') => void;
}

export function ENPSchoolGrid({
  isExpanded, onToggle, searchTerm, onSearchChange, searchInputRef,
  currentSchools, schoolSortConfig, onSort, onOpenSingleSchool,
  benchmarkENP, startIndex, totalSchools, rowsPerPage,
  onRowsPerPageChange, currentPage, totalPages, onPageChange
}: ENPSchoolGridProps) {
  const itemsPerPage = rowsPerPage === 'All' ? totalSchools : rowsPerPage;

  // Helper to render Chevrons instead of arrows
  const renderSortIcon = (key: string) => {
    if (schoolSortConfig?.key !== key) {
      return <ChevronUp className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />;
    }
    return schoolSortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 ml-1 text-blue-600" /> 
      : <ChevronDown className="w-4 h-4 ml-1 text-blue-600" />;
  };

  return (
    <div className="space-y-4" >
      <div className="flex items-center justify-between w-full mb-4">
        <button onClick={onToggle} className="flex items-center gap-2 group outline-none">
          <h3 className="text-lg font-semibold text-gray-900">Details by School</h3>
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
        </button>

        {isExpanded && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search school..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}
      </div>

      {isExpanded && (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    onClick={() => onSort('schoolName')} 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
                  >
                    <div className="flex items-center">
                      School {renderSortIcon('schoolName')}
                    </div>
                  </th>
                  <th 
                    onClick={() => onSort('totalEnrollment')} 
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
                  >
                    <div className="flex items-center justify-center">
                      Enrollment {renderSortIcon('totalEnrollment')}
                    </div>
                  </th>
                  <th 
                    onClick={() => onSort('snp.percentage')} 
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
                  >
                    <div className="flex items-center justify-center uppercase">
                      ENP {renderSortIcon('snp.percentage')}
                    </div>
                  </th>
                  <th 
                    onClick={() => onSort('snpTarget')} 
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
                  >
                    <div className="flex items-center justify-center uppercase">
                      ENP Target {renderSortIcon('snpTarget')}
                    </div>
                  </th>
                  <th 
                    onClick={() => onSort('snpDelta')} 
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group"
                  >
                    <div className="flex items-center justify-center uppercase">
                      Diff {renderSortIcon('snpDelta')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-left">
                {currentSchools.length > 0 ? (
                  currentSchools.map((school) => (
                    <tr 
                      key={school.schoolName} 
                      className="hover:bg-blue-50/50 cursor-pointer group transition-colors" 
                      onClick={() => onOpenSingleSchool(school.schoolName)}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-blue-600 group-hover:text-blue-800 underline-offset-2 decoration-blue-300">
                        {school.schoolName}
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-600">
                        {school.totalEnrollment.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <div className="font-bold text-gray-900">{school.snp.count.toLocaleString()}</div>
                        <div className={`text-xs font-semibold ${school.snp.percentage > benchmarkENP ? 'text-red-600' : 'text-emerald-600'}`}>
                          {school.snp.percentage.toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-center text-gray-500">
                        {school.snpTarget.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <span className={`font-semibold ${school.snpDelta > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {school.snpDelta >= 0 ? '+' : ''}{school.snpDelta.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">No schools found matching "{searchTerm}"</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 px-2">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Showing {startIndex + 1}-{Math.min(startIndex + (itemsPerPage as number), totalSchools)} of {totalSchools}</span>
              <select 
                className="border border-gray-200 rounded-lg text-xs p-1 outline-none bg-white cursor-pointer"
                value={rowsPerPage}
                onChange={(e) => onRowsPerPageChange(e.target.value)}
              >
                <option value={5}>Show 5</option>
                <option value={10}>Show 10</option>
                <option value={25}>Show 25</option>
                <option value="All">Show All</option>
              </select>
            </div>

            {rowsPerPage !== 'All' && (
              <div className="flex items-center gap-2">
                <button onClick={() => onPageChange('prev')} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors">
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <span className="text-sm text-gray-700 font-medium">Page {currentPage} of {totalPages}</span>
                <button onClick={() => onPageChange('next')} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}