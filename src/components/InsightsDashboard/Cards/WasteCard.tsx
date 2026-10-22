import React from 'react';
import TrendIndicator from '../../Common/TrendIndicator';

// DEMO ONLY: hardcoded dummy values. Waste always shows both % and $.
interface WasteCardProps {
  onClick: () => void;
}

export const WasteCard: React.FC<WasteCardProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer text-left overflow-hidden"
    >
      <div className="h-1 bg-insightsFavorable" />
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-base font-semibold text-gray-900">Waste</h3>
          <TrendIndicator direction="down" status="favorable" />
        </div>
        <div className="mb-6">
          <div className="text-4xl font-bold text-gray-900">13.47%</div>
          <div className="text-sm text-gray-500 mt-1">
            Waste Value: <span className="font-medium text-gray-900">$5,286.21</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Expected</span>
          <span className="text-gray-900 font-medium">15.00% · $29,172.00</span>
        </div>
      </div>
    </button>
  );
};
