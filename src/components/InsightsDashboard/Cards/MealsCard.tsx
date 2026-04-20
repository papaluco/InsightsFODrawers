import React from 'react';
import { TrendingDown } from 'lucide-react';

export const MealsCard: React.FC = () => {
  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm text-left overflow-hidden">
      <div className="h-1 bg-green-500" />
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-base font-semibold text-gray-900">Meals</h3>
          <TrendingDown className="w-5 h-5 text-green-500" />
        </div>
        <div className="text-4xl font-bold text-gray-900 mb-6">27,875</div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Expected</span>
          <span className="text-gray-900 font-medium">49,530</span>
        </div>
      </div>
    </div>
  );
};