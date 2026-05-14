import React, { useEffect, useState } from 'react';
import { X, Bot } from 'lucide-react';
import SchoolieUsageDashboard from './schoolie/SchoolieUsageDashboard';
import SchoolieUsageFiltersBar from './schoolie/SchoolieUsageFilters';
import SchoolieUsageAnalysisDrawer from './schoolie/SchoolieUsageAnalysisDrawer';
import { SchoolieIcon } from '../Common/Icons';
import { SchoolieUsageFilters, DEFAULT_SCHOOLIE_FILTERS } from '../../types/schoolieUsageTypes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SchoolieUsageDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [filters, setFilters] = useState<SchoolieUsageFilters>({ ...DEFAULT_SCHOOLIE_FILTERS });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isChatOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isChatOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setIsChatOpen(false);
      setActiveTab('overview');
      setFilters({ ...DEFAULT_SCHOOLIE_FILTERS });
    }
  }, [isOpen]);

  return (
    <>
      <div className={`fixed inset-0 bg-white z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="px-8 py-5 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <Bot size={20} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Schoolie Usage</h2>
              <p className="text-xs text-gray-500">AI adoption, engagement, satisfaction, and operational health</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center px-3 py-1.5 text-gray-700 hover:text-purple-600 transition-all"
              title="Open Schoolie Analysis"
            >
              <SchoolieIcon size={52} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6">
          {isOpen && (
            <div className="space-y-5">
              <SchoolieUsageFiltersBar filters={filters} onChange={setFilters} />
              <SchoolieUsageDashboard filters={filters} onTabChange={setActiveTab} />
            </div>
          )}
        </div>
      </div>

      <SchoolieUsageAnalysisDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        filters={filters}
        activeTab={activeTab}
      />
    </>
  );
};

export default SchoolieUsageDrawer;
