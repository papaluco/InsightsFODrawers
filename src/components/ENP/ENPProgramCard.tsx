import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ProgramByEligibility } from '../../data/ENPDataTypes';
import { programByEligibilityData } from '../../data/mockENPProgramData';
import { MEAL_TYPES } from '../../data/ENPDataTypes';

const DataCell = ({ 
  count, 
  pct, 
  isBold = false, 
  isRed = false 
}: { 
  count: number; 
  pct: number; 
  isBold?: boolean; 
  isRed?: boolean;
}) => (
  <div className="flex flex-col py-1">
    <span className={`text-sm ${isBold ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
      {count.toLocaleString()}
    </span>
    <span className={`text-[11px] font-semibold ${isRed ? 'text-red-600' : 'text-emerald-600'}`}>
      {pct.toFixed(2)}%
    </span>
  </div>
);

export function ENPProgramCard({ benchmarkENP }: { benchmarkENP: number }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const mealTypes = MEAL_TYPES.filter(m => m.key !== 'total');

  const getVal = (eligibility: string, mealKey: string) => {
    const row = programByEligibilityData.find(r => r.eligibility === eligibility);
    return row ? (row[mealKey as keyof ProgramByEligibility] as { count: number; percentage: number }) : { count: 0, percentage: 0 };
  };

  return (
    <div className="space-y-4">
      {/* Header with Chevron next to Name */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-lg transition-colors group"
      >
        <h3 className="text-lg font-semibold text-gray-900">ENP by Meal Type</h3>
        <ChevronDown 
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`} 
        />
      </button>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {mealTypes.map((meal) => {
            const freePart = getVal('Free Participating', meal.key);
            const redPart = getVal('Reduced Participating', meal.key);
            const totalPart = getVal('Total Participating', meal.key);
            const freeNP = getVal('Free NP', meal.key);
            const redNP = getVal('Reduced NP', meal.key);
            const totalENP = getVal('ENP', meal.key);
            const freeElig = getVal('Free Eligible', meal.key);
            const redElig = getVal('Reduced Eligible', meal.key);
            const totalElig = getVal('Eligible', meal.key);

            return (
              <div key={meal.key} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-left">
                {/* Header Row */}
                <div className="grid grid-cols-4 gap-x-2 items-center border-b border-gray-50 pb-1 mb-1">
                  <h4 className="text-sm font-medium text-gray-900">{meal.label}</h4>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Free</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Reduced</div>
                  <div className="text-[10px] font-bold text-gray-900 uppercase tracking-wider text-center">Total</div>
                </div>

                <div className="grid grid-cols-4 gap-x-2 text-center items-center">
                  {/* Participation Row */}
                  <div className="text-xs font-bold text-gray-500 text-left border-r border-gray-50 pr-1 leading-tight py-2">
                    Participation
                  </div>
                  <DataCell count={freePart.count} pct={freePart.percentage} />
                  <DataCell count={redPart.count} pct={redPart.percentage} />
                  <DataCell count={totalPart.count} pct={totalPart.percentage} isBold />

                  {/* Non-Participation Row */}
                  <div className="text-xs font-bold text-gray-500 text-left border-r border-gray-50 pr-1 leading-tight py-2">
                    Non-Participation
                  </div>
                  <DataCell count={freeNP.count} pct={freeNP.percentage} />
                  <DataCell count={redNP.count} pct={redNP.percentage} />
                  <DataCell 
                    count={totalENP.count} 
                    pct={totalENP.percentage} 
                    isBold 
                    isRed={totalENP.percentage > benchmarkENP} 
                  />

                  {/* Total Eligible Row */}
                  <div className="text-xs font-bold text-gray-900 text-left border-r border-gray-50 pr-1 leading-tight py-2">
                    Eligible
                  </div>
                  <DataCell count={freeElig.count} pct={freeElig.percentage} isBold />
                  <DataCell count={redElig.count} pct={redElig.percentage} isBold />
                  
                  {/* Total Eligible Grand Total Cell - Updated to use dynamic color logic */}
                  <div className="bg-blue-50/30 rounded py-1 border border-blue-100/30">
                    <div className="text-sm font-black text-gray-900">{totalElig.count.toLocaleString()}</div>
                    <div className={`text-[10px] font-bold ${totalElig.percentage > benchmarkENP ? 'text-red-600' : 'text-emerald-600'}`}>
                      {totalElig.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}