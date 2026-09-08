import React from 'react';
import TrendIndicator from '../../Common/TrendIndicator';

interface MPLHCardProps {
  actualMPLH: number;
  targetMPLH: number;
  onClick: () => void;
}

export const MPLHCard: React.FC<MPLHCardProps> = ({
  actualMPLH,
  targetMPLH,
  onClick,
}) => {
  const isPositive = actualMPLH >= targetMPLH;
  const status = isPositive ? 'favorable' : 'unfavorable';

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer text-left overflow-hidden"
    >
      {/* Top colored border */}
      <div className={`h-1 ${isPositive ? 'bg-insightsFavorable' : 'bg-insightsUnfavorable'}`} />

      <div className="p-6">
        {/* Header with title and trend icon */}
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-base font-semibold text-gray-900">
            MPLH
          </h3>
          <TrendIndicator direction={isPositive ? 'up' : 'down'} status={status} />
        </div>

        {/* Main value */}
        <div className="text-5xl font-bold text-gray-900 mb-6">
          {actualMPLH.toFixed(2)}
        </div>

        {/* Expected section */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Expected</span>
          <span className="text-gray-900 font-medium">
            {targetMPLH.toFixed(2)}
          </span>
        </div>
      </div>
    </button>
  );
};
