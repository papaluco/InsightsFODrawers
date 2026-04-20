import React from 'react';
import { TrendingUp } from 'lucide-react';

interface PNACardProps {
  actualPNA: number;
  targetPNA: number;
  onClick: () => void;
}

export const PNACard: React.FC<PNACardProps> = ({
  actualPNA,
  targetPNA,
  onClick,
}) => {
  const isNegative = actualPNA > targetPNA;

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer text-left overflow-hidden"
    >
      {/* Top colored border */}
      <div className={`h-1 ${isNegative ? 'bg-red-500' : 'bg-emerald-500'}`} />

      <div className="p-6">
        {/* Header with title and trend icon */}
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-base font-semibold text-gray-900">
            PNA
          </h3>
          <TrendingUp className={`w-5 h-5 ${isNegative ? 'text-red-500' : 'text-emerald-500'}`} />
        </div>

        {/* Main value */}
        <div className="text-5xl font-bold text-gray-900 mb-6">
          {actualPNA.toFixed(2)}%
        </div>

        {/* Expected section */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Expected</span>
          <span className="text-gray-900 font-medium">
            {targetPNA.toFixed(2)}%
          </span>
        </div>
      </div>
    </button>
  );
};
