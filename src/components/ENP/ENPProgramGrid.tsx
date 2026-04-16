import { useState, useMemo } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { MEAL_TYPES, ProgramByEligibility } from '../../data/ENPDataTypes';
import { programByEligibilityData } from '../../data/mockENPProgramData';

interface ENPProgramGridProps {
  isExpanded: boolean;
  onToggle: () => void;
  benchmarkENP: number;
  onSort: (key: string) => void;
  programSortConfig: { key: string; direction: 'asc' | 'desc' } | null;
}

export function ENPProgramGrid({ 
  isExpanded, 
  onToggle, 
  benchmarkENP = 5,
  onSort,
  programSortConfig
}: ENPProgramGridProps) {
  
  const [localPage, setLocalPage] = useState(1);
  const [localRowsPerPage, setLocalRowsPerPage] = useState<number | 'All'>(5);

  const eligibilityTypes: ProgramByEligibility['eligibility'][] = [
    'Free Participating', 
    'Reduced Participating', 
    'Total Participating', 
    'Free Eligible', 
    'Reduced Eligible',
    'Eligible', 
    'Free NP', 
    'Reduced NP', 
    'ENP'
  ];

  const labelMap: Record<string, string> = {
    'Free Participating': 'Free Part.',
    'Reduced Participating': 'Reduced Part.',
    'Total Participating': 'Total Part.',
    'Free Eligible': 'Free Elig.',
    'Reduced Eligible': 'Red. Elig.',
    'Eligible': 'Total Eligible',
    'Free NP': 'Free NP',
    'Reduced NP': 'Reduced NP',
    'ENP': 'Total ENP'
  };

  const regularMeals = useMemo(() => MEAL_TYPES.filter(m => m.key !== 'total'), []);
  const totalRowDef = useMemo(() => MEAL_TYPES.find(m => m.key === 'total'), []);

  const sortedVisibleMeals = useMemo(() => {
    if (!programSortConfig) return regularMeals;

    return [...regularMeals].sort((a, b) => {
      const { key, direction } = programSortConfig;
      let valA: number | string = 0;
      let valB: number | string = 0;

      if (key === 'label') {
        valA = a.label;
        valB = b.label;
      } else {
        const row = programByEligibilityData.find(r => r.eligibility === key);
        const dataA = row ? (row[a.key as keyof ProgramByEligibility] as any) : null;
        const dataB = row ? (row[b.key as keyof ProgramByEligibility] as any) : null;

        valA = dataA?.count ?? 0;
        valB = dataB?.count ?? 0;
      }

      if (valA < valB) return direction === 'asc' ? -1 : 1;
      if (valA > valB) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [regularMeals, programSortConfig]);

  const totalRegularItems = sortedVisibleMeals.length;
  const itemsPerPage = localRowsPerPage === 'All' ? totalRegularItems : Number(localRowsPerPage);
  const totalPages = Math.ceil(totalRegularItems / itemsPerPage);
  const startIndex = (localPage - 1) * itemsPerPage;

  const visibleRegularMeals = useMemo(() => {
    if (localRowsPerPage === 'All') return sortedVisibleMeals;
    return sortedVisibleMeals.slice(startIndex, startIndex + itemsPerPage);
  }, [startIndex, itemsPerPage, localRowsPerPage, sortedVisibleMeals]);

  const getCellData = (eligibility: string, mealKey: string) => {
    const row = programByEligibilityData.find(r => r.eligibility === eligibility);
    return row ? row[mealKey as keyof ProgramByEligibility] : { count: 0, percentage: 0 };
  };

  const renderSortIcon = (key: string) => {
    if (programSortConfig?.key.toLowerCase() !== key.toLowerCase()) 
      return <ChevronUp className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />;
    return programSortConfig.direction === 'asc' 
      ? <ChevronUp className="w-4 h-4 ml-1 text-blue-600" /> 
      : <ChevronDown className="w-4 h-4 ml-1 text-blue-600" />;
  };

  const displayStart = totalRegularItems > 0 ? startIndex + 1 : 0;
  const displayEnd = Math.min(startIndex + itemsPerPage, totalRegularItems);

  return (
    <div className="mb-8">
      <button onClick={onToggle} className="flex items-center gap-2 mb-4 group outline-none">
        <h3 className="text-lg font-semibold text-gray-900">ENP by Meal Type</h3>
        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
      </button>

      {isExpanded && (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    onClick={() => onSort('label')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 group sticky left-0 bg-gray-50 z-10"
                  >
                    <div className="flex items-center">
                      Meal Type {renderSortIcon('label')}
                    </div>
                  </th>
                  {eligibilityTypes.map((type) => {
                    const isSummaryCol = ['Total Participating', 'Free Eligible', 'Reduced Eligible', 'Eligible', 'ENP'].includes(type);
                    // This is our specific tinted grouping
                    const isEligGroup = ['Free Eligible', 'Reduced Eligible', 'Eligible'].includes(type);
                    
                    return (
                      <th 
                        key={type} 
                        onClick={() => onSort(type)}
                        className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider cursor-pointer hover:bg-gray-100 group leading-tight ${
                          isSummaryCol ? 'text-gray-700 font-bold' : 'text-gray-500'
                        } ${isEligGroup ? 'bg-slate-100' : ''}`}
                        style={{ width: '100px', minWidth: '100px' }}
                      >
                        <div className="flex items-center justify-center whitespace-normal">
                          {labelMap[type]} {renderSortIcon(type)}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {visibleRegularMeals.map((meal) => (
                  <tr key={meal.key} className="hover:bg-gray-50 text-left">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap sticky left-0 bg-white">
                      {meal.label}
                    </td>
                    {eligibilityTypes.map((type) => {
                      const data = getCellData(type, meal.key) as { count: number; percentage: number };
                      const isEligGroup = ['Free Eligible', 'Reduced Eligible', 'Eligible'].includes(type);

                      return (
                        <td 
                          key={`${meal.key}-${type}`} 
                          className={`px-6 py-4 text-sm text-center ${
                            isEligGroup ? 'bg-slate-50/80' : 'bg-white'
                          }`}
                        >
                          <div className="font-bold text-gray-900">
                            {data.count.toLocaleString()}
                          </div>
                          <div className={`text-xs font-semibold ${
                            type === 'ENP' && data.percentage > benchmarkENP ? 'text-red-600' : 'text-emerald-600'
                          }`}>
                            {data.percentage.toFixed(2)}%
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {totalRowDef && (
                  <tr className="bg-gray-100 font-bold border-t-2 border-gray-200 text-left">
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 whitespace-nowrap sticky left-0 bg-gray-100">
                      {totalRowDef.label}
                    </td>
                    {eligibilityTypes.map((type) => {
                      const data = getCellData(type, totalRowDef.key) as { count: number; percentage: number };
                      const isEligGroup = ['Free Eligible', 'Reduced Eligible', 'Eligible'].includes(type);

                      return (
                        <td 
                          key={`${totalRowDef.key}-${type}`} 
                          className={`px-6 py-4 text-sm text-center ${
                             isEligGroup ? 'bg-slate-200/40' : ''
                          }`}
                        >
                          <div className="font-bold text-gray-900">
                            {data.count.toLocaleString()}
                          </div>
                          <div className={`text-xs font-bold ${
                            type === 'ENP' && data.percentage > benchmarkENP ? 'text-red-600' : 'text-emerald-600'
                          }`}>
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