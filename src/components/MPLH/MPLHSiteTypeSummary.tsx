import React, { useState, useMemo, useEffect, useRef } from 'react';
// Added ChevronUp to imports
import { ChevronDown, ChevronUp, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { SchoolMPLHData } from '../data/mockMPLHData';
import { MPLHOtherMeals } from './MPLHOtherMeals';

interface SiteTypeData {
  siteType: string;
  breakfast: number;
  lunch: number;
  snack: number;
  aLaCarte: number;
  other: {
    adultMeals: number;
    adultBreakfast: number;
    adultLunch: number;
    adultSnack: number;
  };
  mealEquivalents: number;
  laborHours: number;
  mplh: number;
  mplhTarget: number;
  mplhDelta: number;
}

interface MPLHSiteTypeSummaryProps {
  schoolData: SchoolMPLHData[];
}

// Added SortIcon Helper
const SortIcon = ({ column, config }: { column: string, config: any }) => {
  if (config?.key !== column) return <div className="w-4 h-4 opacity-0" />;
  return config.direction === 'asc' 
    ? <ChevronUp className="w-4 h-4 text-blue-600" /> 
    : <ChevronDown className="w-4 h-4 text-blue-600" />;
};

export const MPLHSiteTypeSummary: React.FC<MPLHSiteTypeSummaryProps> = ({ schoolData }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number | 'All'>(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNeedsAttention, setShowNeedsAttention] = useState(false);
  
  const [sortConfig, setSortConfig] = useState<{ key: keyof SiteTypeData; direction: 'asc' | 'desc' } | null>({
    key: 'siteType',
    direction: 'asc'
  });
  
  const [isExpanded, setIsExpanded] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isExpanded]);

  const siteTypeData = useMemo(() => {
    const siteTypes = ['Elementary School', 'Middle School', 'High School'];

    return siteTypes.map(siteType => {
      const schoolsOfType = schoolData.filter(school => school.siteType === siteType);

      const totals = schoolsOfType.reduce((acc, school) => ({
        breakfast: acc.breakfast + school.breakfast,
        lunch: acc.lunch + school.lunch,
        snack: acc.snack + school.snack,
        aLaCarte: acc.aLaCarte + school.aLaCarte,
        other: {
          adultMeals: acc.other.adultMeals + school.other.adultMeals,
          adultBreakfast: acc.other.adultBreakfast + school.other.adultBreakfast,
          adultLunch: acc.other.adultLunch + school.other.adultLunch,
          adultSnack: acc.other.adultSnack + school.other.adultSnack,
        },
        mealEquivalents: acc.mealEquivalents + school.mealEquivalents,
        laborHours: acc.laborHours + school.laborHours,
      }), {
        breakfast: 0, lunch: 0, snack: 0, aLaCarte: 0,
        other: { adultMeals: 0, adultBreakfast: 0, adultLunch: 0, adultSnack: 0 },
        mealEquivalents: 0, laborHours: 0,
      });

      const mplh = totals.laborHours > 0 ? totals.mealEquivalents / totals.laborHours : 0;
      const mplhTarget = 18.5;
      const mplhDelta = mplh - mplhTarget;

      return { siteType, ...totals, mplh, mplhTarget, mplhDelta };
    }).filter(site => site.laborHours > 0);
  }, [schoolData]);

  const totals = useMemo(() => {
    return siteTypeData.reduce((acc, site) => ({
      breakfast: acc.breakfast + site.breakfast,
      lunch: acc.lunch + site.lunch,
      snack: acc.snack + site.snack,
      aLaCarte: acc.aLaCarte + site.aLaCarte,
      other: acc.other + (site.other.adultMeals + site.other.adultBreakfast + site.other.adultLunch + site.other.adultSnack),
      mealEquivalents: acc.mealEquivalents + site.mealEquivalents,
      laborHours: acc.laborHours + site.laborHours,
    }), { breakfast: 0, lunch: 0, snack: 0, aLaCarte: 0, other: 0, mealEquivalents: 0, laborHours: 0 });
  }, [siteTypeData]);

  const districtMPLH = totals.laborHours > 0 ? totals.mealEquivalents / totals.laborHours : 0;
  const districtTarget = 18.5;

  const filteredSites = useMemo(() => {
    return siteTypeData.filter(site => {
      const matchesSearch = site.siteType.toLowerCase().includes(searchTerm.toLowerCase());
      const needsAttention = site.mplh < site.mplhTarget;
      return showNeedsAttention ? matchesSearch && needsAttention : matchesSearch;
    });
  }, [siteTypeData, searchTerm, showNeedsAttention]);

  const sortedSites = useMemo(() => {
    const sortableItems = [...filteredSites];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredSites, sortConfig]);

  const itemsPerPage = rowsPerPage === 'All' ? sortedSites.length : rowsPerPage;
  const totalPages = Math.ceil(sortedSites.length / (itemsPerPage || 1));
  const startIndex = (currentPage - 1) * (itemsPerPage as number);
  const currentSites = sortedSites.slice(startIndex, startIndex + (itemsPerPage as number));

  const handleSort = (key: keyof SiteTypeData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  return (
    <div className="mb-4 pb-4 border-b border-gray-100 text-left">
      <div className="flex items-center justify-between w-full mb-4">
        <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-2 group">
          <h3 className="text-lg font-semibold text-gray-900">Summary by Site Type</h3>
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
                placeholder="Search site type..."
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
                    <th onClick={() => handleSort('siteType')} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                      <div className="flex items-center gap-1">
                        <span>Site Type</span>
                        <SortIcon column="siteType" config={sortConfig} />
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
                  {currentSites.length > 0 ? (
                    currentSites.map((site, index) => (
                      <tr key={site.siteType} className="hover:bg-blue-50/50 transition-colors group relative hover:z-20">
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{site.siteType}</td>
                        <td className="px-2 py-4 text-sm text-center text-gray-600">{site.breakfast.toLocaleString()}</td>
                        <td className="px-2 py-4 text-sm text-center text-gray-600">{site.lunch.toLocaleString()}</td>
                        <td className="px-2 py-4 text-sm text-center text-gray-600">{site.snack.toLocaleString()}</td>
                        <td className="px-2 py-4 text-sm text-center text-gray-600">{site.aLaCarte.toLocaleString()}</td>
                        <td className="px-2 py-4 text-sm text-center text-gray-600">
                          <MPLHOtherMeals other={site.other} isFirstRow={index === 0} />
                        </td>
                        <td className="px-2 py-4 text-sm text-center text-gray-600 font-medium">{site.mealEquivalents.toLocaleString()}</td>
                        <td className="px-2 py-4 text-sm text-center text-gray-600 font-medium">{site.laborHours.toLocaleString()}</td>
                        <td className={`px-4 py-4 text-sm text-center font-bold ${site.mplh >= site.mplhTarget ? 'text-emerald-600' : 'text-red-600'}`}>
                          {site.mplh.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 text-sm text-center text-gray-600 font-medium">{site.mplhTarget.toFixed(2)}</td>
                        <td className={`px-4 py-4 text-sm text-center font-bold ${site.mplhDelta >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {site.mplhDelta >= 0 ? '+' : ''}{site.mplhDelta.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={11} className="px-6 py-10 text-center text-sm text-gray-500">
                        {showNeedsAttention ? 'All site types are currently meeting their MPLH targets!' : `No site types found matching "${searchTerm}"`}
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-200 font-bold relative z-10">
                  <tr>
                    <td className="px-4 py-4 text-sm text-gray-900">Total District</td>
                    <td className="px-2 py-4 text-sm text-center text-gray-900">{totals.breakfast.toLocaleString()}</td>
                    <td className="px-2 py-4 text-sm text-center text-gray-900">{totals.lunch.toLocaleString()}</td>
                    <td className="px-2 py-4 text-sm text-center text-gray-900">{totals.snack.toLocaleString()}</td>
                    <td className="px-2 py-4 text-sm text-center text-gray-900">{totals.aLaCarte.toLocaleString()}</td>
                    <td className="px-2 py-4 text-sm text-center text-gray-900">{totals.other.toLocaleString()}</td>
                    <td className="px-2 py-4 text-sm text-center text-gray-900">{totals.mealEquivalents.toLocaleString()}</td>
                    <td className="px-2 py-4 text-sm text-center text-gray-900">{totals.laborHours.toLocaleString()}</td>
                    <td className={`px-4 py-4 text-sm text-center font-extrabold ${districtMPLH >= districtTarget ? 'text-emerald-600' : 'text-red-600'}`}>{districtMPLH.toFixed(2)}</td>
                    <td className="px-4 py-4 text-sm text-center text-gray-900">{districtTarget.toFixed(2)}</td>
                    <td className={`px-4 py-4 text-sm text-center font-extrabold ${(districtMPLH - districtTarget) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {(districtMPLH - districtTarget) >= 0 ? '+' : ''}{(districtMPLH - districtTarget).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 px-2">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Showing {startIndex + 1}-{Math.min(startIndex + (itemsPerPage as number), sortedSites.length)} of {sortedSites.length}</span>
              <select className="border border-gray-200 rounded-lg text-xs p-1 outline-none bg-white cursor-pointer" value={rowsPerPage} onChange={(e) => {
                  const val = e.target.value;
                  setRowsPerPage(val === 'All' ? 'All' : parseInt(val));
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
                <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors">
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <span className="text-sm text-gray-700 font-medium whitespace-nowrap">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};