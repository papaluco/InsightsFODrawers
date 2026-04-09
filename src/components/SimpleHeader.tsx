import React from 'react';
import { BarChart2, Calendar, Building2 } from 'lucide-react';

export const SimpleHeader: React.FC = () => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center space-x-3">
        <BarChart2 className="w-8 h-8 text-indigo-600" />
        <h1 className="text-2xl font-semibold text-gray-900">
          Insights
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <button className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">Date Range</span>
        </button>
        <button className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50">
          <Building2 className="w-4 h-4" />
          <span className="text-sm">All Schools</span>
        </button>
      </div>
    </div>
  );
};
