import React, { useEffect } from 'react';
import { X, BarChart3, Wrench } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const InsightsUsageDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      )}
      <div className={`fixed inset-0 bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="px-6 py-5 bg-white border-b border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <BarChart3 size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Insights Usage</h2>
              <p className="text-xs text-gray-500">KPI drawer engagement and adoption metrics</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gray-50">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-5">
            <Wrench size={28} className="text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-700 mb-2">Coming Soon</h3>
          <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
            Insights usage analytics — including drawer opens, KPI views, and user adoption trends — will appear here.
          </p>
        </div>
      </div>
    </>
  );
};

export default InsightsUsageDrawer;
