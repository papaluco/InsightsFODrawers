import React from 'react';

export const InventoryValueCard: React.FC = () => {
  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 shadow-sm text-left overflow-hidden">
      <div className="h-1 bg-gray-200" />
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-base font-semibold text-gray-900">Inventory Value</h3>
        </div>
        <div className="text-4xl font-bold text-gray-900 mb-6">$0.00</div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Expected</span>
          <span className="text-gray-900 font-medium">—</span>
        </div>
      </div>
    </div>
  );
};