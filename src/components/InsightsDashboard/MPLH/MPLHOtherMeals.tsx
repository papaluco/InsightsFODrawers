import React, { useState } from 'react';

interface OtherBreakdown {
  adultMeals: number;
  adultBreakfast: number;
  adultLunch: number;
  adultSnack: number;
}

interface MPLHOtherMealsProps {
  other: OtherBreakdown;
  isFirstRow?: boolean; // New prop to detect position
}

const calculateOtherTotal = (other: OtherBreakdown): number => {
  return other.adultMeals + other.adultBreakfast + other.adultLunch + other.adultSnack;
};

export const MPLHOtherMeals: React.FC<MPLHOtherMealsProps> = ({ other, isFirstRow }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const total = calculateOtherTotal(other);
  
  const items = [
    { label: 'Adult Meals', value: other.adultMeals },
    { label: 'Adult Breakfast', value: other.adultBreakfast },
    { label: 'Adult Lunch', value: other.adultLunch },
    { label: 'Adult Snack', value: other.adultSnack },
  ].filter(item => item.value > 0);

  return (
    <div 
      className="relative inline-block text-left"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="border-b border-dashed border-gray-400 cursor-help whitespace-nowrap">
        {total.toLocaleString()}
      </span>
      
      {showTooltip && items.length > 0 && (
        <div 
          className={`absolute right-0 w-48 bg-white border border-gray-200 rounded-lg shadow-xl p-3 animate-in fade-in zoom-in duration-150 z-[100] pointer-events-none
            ${isFirstRow ? 'top-full mt-2' : 'bottom-full mb-2'}`} // Dynamic positioning
        >
          <div className="space-y-1.5">
            {items.map((item) => (
              <div key={item.label} className="flex justify-between text-[11px] leading-tight">
                <span className="text-gray-500">{item.label}:</span>
                <span className="font-bold text-gray-900">{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
          
          {/* Dynamic Arrow Placement */}
          <div className={`absolute right-4 ${isFirstRow ? 'bottom-full -mb-1' : 'top-full -mt-1'}`}>
            <div 
              className={`border-4 border-transparent ${isFirstRow ? 'border-b-white' : 'border-t-white'}`} 
              style={{ filter: 'drop-shadow(0 2px 1px rgba(0,0,0,0.1))' }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};