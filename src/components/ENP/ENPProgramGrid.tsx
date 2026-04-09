import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { MEAL_TYPES, ProgramByEligibility } from '../../data/mockENPData';

interface ENPProgramGridProps {
  isExpanded: boolean;
  onToggle: () => void;
  sortedProgramData: ProgramByEligibility[];
  benchmarkENP: number;
  programSortConfig?: { key: string; direction: 'asc' | 'desc' } | null;
  onSort?: (key: string) => void;
}

export function ENPProgramGrid({ 
  isExpanded, 
  onToggle, 
  sortedProgramData = [], 
  benchmarkENP = 5 
}: ENPProgramGridProps) {
  
  const [localPage, setLocalPage] = useState(1);
  const [localRowsPerPage, setLocalRowsPerPage] = useState<number | 'All'>(5);

  const eligibilityTypes = ['Free', 'Reduced', 'Paid', 'Total'];

  // 1. SEPARATE THE TOTAL ROW
  // We identify the total row so it can be pinned to the bottom
  const regularMeals = useMemo(() => MEAL_TYPES.filter(m => m.key !== 'total'), []);
  const totalRowDef = useMemo(() => MEAL_TYPES.find(m => m.key === 'total'), []);

  // 2. INTERNAL MATH (Excluding the total row from the count)
  const totalRegularItems = regularMeals.length;
  const itemsPerPage = localRowsPerPage === 'All' ? totalRegularItems : Number(localRowsPerPage);
  const totalPages = Math.ceil(totalRegularItems / itemsPerPage);
  const startIndex = (localPage - 1) * itemsPerPage;

  // 3. SLICE ONLY REGULAR MEALS
  const visibleRegularMeals = useMemo(() => {
    if (localRowsPerPage === 'All') return regularMeals;
    return regularMeals.slice(startIndex, startIndex + itemsPerPage);
  }, [startIndex, itemsPerPage, localRowsPerPage, regularMeals]);

  const getCellData = (eligibility: string, mealKey: string) => {
    const row = sortedProgramData.find(r => r.eligibility === eligibility);
    return row ? row[mealKey as keyof ProgramByEligibility] : { count: 0, percentage: 0 };
  };

  const displayStart = totalRegularItems > 0 ? startIndex + 1 : 0;
  const displayEnd = Math.min(startIndex + itemsPerPage, totalRegularItems);

  return (
    <div className="mb-8">
      <button onClick={onToggle} className="flex items-center gap-2 mb-4 group outline-none">
        <h3 className="text-lg font-semibold text-gray-900">Eligibility by Meal Type</h3>
        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
      </button>

      {isExpanded && (
        <>
          {/* Added border-b to create that gray line at the bottom of the table area */}
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm border-b-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meal Type
                  </th>
                  {eligibilityTypes.map((type) => (
                    <th key={type} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {type}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* PAGEABLE ROWS */}
                {visibleRegularMeals.map((meal) => (
                  <tr key={meal.key} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap text-left">
                      {meal.label}
                    </td>
                    {eligibilityTypes.map((type) => {
                      const data = getCellData(type, meal.key);
                      return (
                        <td key={`${meal.key}-${type}`} className="px-6 py-4 text-sm text-center">
                          <div className="text-gray-900 font-bold">{data.count.toLocaleString()}</div>
                          <div className={`text-xs font-semibold ${data.percentage > benchmarkENP ? 'text-red-600' : 'text-emerald-600'}`}>
                            {data.percentage.toFixed(2)}%
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* PINNED TOTAL ROW (Always shows at the bottom) */}
                {totalRowDef && (
                  <tr className="bg-blue-50/30 font-bold border-t-2 border-gray-100">
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 whitespace-nowrap text-left">
                      {totalRowDef.label}
                    </td>
                    {eligibilityTypes.map((type) => {
                      const data = getCellData(type, totalRowDef.key);
                      return (
                        <td key={`${totalRowDef.key}-${type}`} className="px-6 py-4 text-sm text-center">
                          <div className="text-gray-900 font-bold">{data.count.toLocaleString()}</div>
                          <div className={`text-xs font-bold ${data.percentage > benchmarkENP ? 'text-red-600' : 'text-emerald-600'}`}>
                            {data.percentage.toFixed(2)}%
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 px-2">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Showing {displayStart}-{displayEnd} of {totalRegularItems}</span>
              <select 
                className="border border-gray-200 rounded-lg text-xs p-1 outline-none bg-white cursor-pointer"
                value={localRowsPerPage}
                onChange={(e) => {
                  setLocalRowsPerPage(e.target.value === 'All' ? 'All' : Number(e.target.value));
                  setLocalPage(1);
                }}
              >
                <option value={5}>Show 5</option>
                <option value={10}>Show 10</option>
                <option value="All">Show All</option>
              </select>
            </div>

            {localRowsPerPage !== 'All' && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setLocalPage(p => Math.max(1, p - 1))} 
                  disabled={localPage === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <span className="text-sm text-gray-700 font-medium">Page {localPage} of {totalPages}</span>
                <button 
                  onClick={() => setLocalPage(p => Math.min(totalPages, p + 1))} 
                  disabled={localPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                >
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