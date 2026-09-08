import React from 'react';
import TrendIndicator from '../../Common/TrendIndicator';

interface ENPCardProps {
  actualENP: number;
  benchmarkENP: number;
  onClick: () => void;
}

export const ENPCard: React.FC<ENPCardProps> = ({
  actualENP,
  benchmarkENP,
  onClick,
}) => {
  const isNegative = actualENP > benchmarkENP;
  const status = isNegative ? 'unfavorable' : 'favorable';

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer text-left overflow-hidden"
    >
      <div className={`h-1 ${isNegative ? 'bg-insightsUnfavorable' : 'bg-insightsFavorable'}`} />

      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-base font-semibold text-gray-900">
            ENP
          </h3>
          <TrendIndicator direction={isNegative ? 'down' : 'up'} status={status} />
        </div>

        <div className="text-5xl font-bold text-gray-900 mb-6">
          {actualENP.toFixed(2)}%
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Expected</span>
          <span className="text-gray-900 font-medium">
            {benchmarkENP.toFixed(2)}%
          </span>
        </div>
      </div>
    </button>
  );
};
