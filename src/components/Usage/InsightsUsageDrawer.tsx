import React, { useCallback, useEffect, useState } from 'react';
import { X, BarChart3 } from 'lucide-react';
import InsightsUsageDashboard from './insights/InsightsUsageDashboard';
import SchoolieUsageChatDrawer from './common/SchoolieUsageChatDrawer';
import { SchoolieIcon } from '../Common/Icons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const INSIGHTS_SYSTEM_PROMPT = `You are an expert product analyst reviewing Insights usage data for a K-12 school nutrition software platform. Your job is to help the team understand how the Insights dashboard is being used across districts — which KPIs users are engaging with most, whether users are exploring deeper (opening drawers, using Schoolie, downloading data), how interaction rates compare across users and districts, and where opportunities exist to improve KPI adoption and feature engagement.`;

const INSIGHTS_SUGGESTED_PROMPTS = [
  'Which KPI is opened most often?',
  'Are users engaging beyond page views?',
  'Which districts are most active?',
  'Who are the power users?',
  'Where is engagement dropping off in the funnel?',
];

const InsightsUsageDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [usagePayload, setUsagePayload] = useState<Record<string, unknown>>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isChatOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isChatOpen, onClose]);

  useEffect(() => {
    if (!isOpen) setIsChatOpen(false);
  }, [isOpen]);

  const handleDataUpdate = useCallback((payload: Record<string, unknown>) => {
    setUsagePayload(payload);
  }, []);

  const totalEvents = typeof usagePayload.totalEvents === 'number' ? usagePayload.totalEvents : 0;
  const dataLabel = totalEvents > 0 ? `${totalEvents.toLocaleString()} events in current filter` : 'Insights analytics';

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
              <h2 className="text-xl font-bold text-gray-900">Insights Usage Dashboard</h2>
              <p className="text-xs text-gray-500">KPI drawer engagement, interaction rates, and adoption metrics</p>
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
          {isOpen && <InsightsUsageDashboard onDataUpdate={handleDataUpdate} />}
        </div>
      </div>

      <SchoolieUsageChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        systemPrompt={INSIGHTS_SYSTEM_PROMPT}
        suggestedPrompts={INSIGHTS_SUGGESTED_PROMPTS}
        dataLabel={dataLabel}
        payload={usagePayload}
      />
    </>
  );
};

export default InsightsUsageDrawer;
