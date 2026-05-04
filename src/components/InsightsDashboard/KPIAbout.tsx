import React, { useState } from 'react';
import { Info, ChevronDown } from 'lucide-react';

interface KPIAboutProps {
  content: React.ReactNode;
}

export const KPIAbout: React.FC<KPIAboutProps> = ({ content }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 group mb-4 outline-none"
      >
        <h3 className="text-lg font-semibold text-gray-900">About this Metric</h3>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
            isExpanded ? '' : '-rotate-90'
          }`}
        />
      </button>

      {isExpanded && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex gap-3 items-start text-left animate-in fade-in slide-in-from-top-1 duration-200">
          <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-600 leading-relaxed">{content}</div>
        </div>
      )}
    </div>
  );
};
