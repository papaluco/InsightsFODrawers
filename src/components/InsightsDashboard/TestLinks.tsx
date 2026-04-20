import React from 'react';
import { ChevronRight } from 'lucide-react';

interface TestLinksProps {
  onOpenSingle: (metric: 'MPLH' | 'PNA' | 'ENP') => void;
  onOpenAI: () => void;
}

export const TestLinks: React.FC<TestLinksProps> = ({ onOpenSingle, onOpenAI }) => {
  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
        School Detail Views
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Single School MPLH */}
        <button 
          onClick={() => onOpenSingle('MPLH')} 
          className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center group hover:shadow-md transition-all"
        >
          <span className="text-sm font-semibold text-gray-900">Single School MPLH</span>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Single School PNA */}
        <button 
          onClick={() => onOpenSingle('PNA')} 
          className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center group hover:shadow-md transition-all"
        >
          <span className="text-sm font-semibold text-gray-900">Single School PNA</span>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Single School ENP */}
        <button 
          onClick={() => onOpenSingle('ENP')} 
          className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center group hover:shadow-md transition-all"
        >
          <span className="text-sm font-semibold text-gray-900">Single School ENP</span>
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* AI Button */}
        <button 
          onClick={onOpenAI} 
          className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-center group hover:shadow-md transition-all"
        >
          <span className="text-sm font-semibold text-indigo-600">MPLH with Schoolie</span>
          <ChevronRight className="w-4 h-4 text-indigo-300 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};