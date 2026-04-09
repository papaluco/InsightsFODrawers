import React, { useState } from 'react';
import { Info, ChevronDown } from 'lucide-react';

export const MPLHAbout: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      {/* Collapsible Header Panel */}
      <div className="flex items-center justify-between w-full mb-4">
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="flex items-center gap-2 group transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900">About this Metric</h3>
          <ChevronDown 
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
              isExpanded ? '' : '-rotate-90'
            }`} 
          />
        </button>
      </div>

      {/* About Content */}
      {isExpanded && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex gap-3 items-start text-left animate-in fade-in slide-in-from-top-1 duration-200">
          <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm text-gray-600 leading-relaxed">
              <span className="font-bold text-gray-800">Meals per Labor Hour:</span> MPLH measures operational efficiency by comparing meal equivalents (MEQs) to actual labor hours.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              <span className="font-bold text-gray-800">Standard Factors:</span> Breakfast (0.67), Lunch (1.00), Snack (0.33), Adult Breakfast (0.67), Adult Lunch (1.00), Adult Snack (0.67), A La Carte ($4.93).
            </p>
          </div>
        </div>
      )}
    </div>
  );
};