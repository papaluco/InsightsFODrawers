import React, { useCallback, useEffect, useState } from 'react';
import { X, BarChart3 } from 'lucide-react';
import ReportsUsageDashboard from './reports/ReportsUsageDashboard';
import SchoolieUsageChatDrawer from './common/SchoolieUsageChatDrawer';
import { SchoolieIcon } from '../Common/Icons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const REPORTS_SYSTEM_PROMPT = `You are an expert product analyst reviewing report usage data for a K-12 school nutrition software platform. Your job is to help the team understand how reports are being used across districts — which reports are most popular, what patterns exist across modules and data sources, whether users are primarily consumers (viewers) or operators (runners/distributors), and where opportunities exist to improve adoption, efficiency, or report quality.`;

const REPORTS_SUGGESTED_PROMPTS = [
  'Which reports are most used?',
  'Are users running reports or just viewing them?',
  'Which modules are most active?',
  'Are users downloading reports?',
  'What opportunities exist to improve adoption?',
];

const ReportsUsageDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [usagePayload, setUsagePayload] = useState<Record<string, unknown>>({});

  // Outer drawer Escape — only fires when chat is NOT open (chat Escape intercepts first)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isChatOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isChatOpen, onClose]);

  // Close chat when outer drawer closes
  useEffect(() => {
    if (!isOpen) setIsChatOpen(false);
  }, [isOpen]);

  const handleDataUpdate = useCallback((payload: Record<string, unknown>) => {
    setUsagePayload(payload);
  }, []);

  const totalEvents = typeof usagePayload.totalEvents === 'number' ? usagePayload.totalEvents : 0;
  const dataLabel = totalEvents > 0 ? `${totalEvents.toLocaleString()} events in current filter` : 'Report analytics';

  return (
    <>
      <div className={`fixed inset-0 bg-white z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="px-8 py-5 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <BarChart3 size={20} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Reports Usage Dashboard</h2>
              <p className="text-xs text-gray-500">Report views, runs, downloads, and distribution activity</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center px-3 py-1.5 text-gray-700 hover:text-indigo-600 transition-all group"
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
          {isOpen && <ReportsUsageDashboard onDataUpdate={handleDataUpdate} />}
        </div>
      </div>

      <SchoolieUsageChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        systemPrompt={REPORTS_SYSTEM_PROMPT}
        suggestedPrompts={REPORTS_SUGGESTED_PROMPTS}
        dataLabel={dataLabel}
        payload={usagePayload}
      />
    </>
  );
};

export default ReportsUsageDrawer;
