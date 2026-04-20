import React from 'react';

export const PhysicalInventoryCard: React.FC = () => {
  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm text-left overflow-hidden">
      <div className="h-1 bg-gray-200" />
      <div className="p-6">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-base font-semibold text-gray-900">Physical Inventory Discrepancy</h3>
        </div>
        <div className="mb-6">
          <div className="text-4xl font-bold text-gray-900">$0.00</div>
          <div className="text-xs text-gray-500 mt-1">(0% of Total Inventory)</div>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Expected</span>
            <span className="text-gray-900 font-medium">≤ $0.00</span>
          </div>
          <div className="text-[10px] text-right text-gray-400">
            ≤ 0% of Total Inventory Value
          </div>
        </div>
      </div>
    </div>
  );
};