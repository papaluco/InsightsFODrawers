import React, { useCallback, useEffect, useState } from 'react';
import { X, Globe } from 'lucide-react';
import AppUsageDashboard from './app/AppUsageDashboard';
import SchoolieUsageChatDrawer from './common/SchoolieUsageChatDrawer';
import { SchoolieIcon } from '../Common/Icons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const APP_SYSTEM_PROMPT = `You are an expert product analyst reviewing App usage data for a K-12 school nutrition software platform. Your job is to help the product team understand how users and districts are engaging with the application — which pages and features see the most adoption, what session patterns reveal about user workflows, which users are power users, where drop-off or low engagement is occurring, and what opportunities exist to improve retention and feature adoption across Insights, Reports, Menu Analysis, and the Workspace.`;

const APP_SUGGESTED_PROMPTS = [
  'Which districts are most engaged and why?',
  'Who are the power users and what are they doing?',
  'What patterns do you see in usage frequency?',
  'Are users returning regularly or dropping off?',
  'What is the most common navigation path?',
  'When are users most active during the day?',
];

const AppUsageDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [usagePayload, setUsagePayload] = useState<Record<string, unknown>>({});

  // Outer drawer Escape — only fires when chat is NOT open
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
  const dataLabel = totalEvents > 0 ? `${totalEvents.toLocaleString()} events in current filter` : 'App analytics';

  return (
    <>
      <div className={`fixed inset-0 bg-white z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="px-8 py-5 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
              <Globe size={20} className="text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">App Usage Dashboard</h2>
              <p className="text-xs text-gray-500">Session tracking, page views, and engagement across all features</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center px-3 py-1.5 text-gray-700 hover:text-teal-600 transition-all group"
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
          {isOpen && <AppUsageDashboard onDataUpdate={handleDataUpdate} />}
        </div>
      </div>

      <SchoolieUsageChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        systemPrompt={APP_SYSTEM_PROMPT}
        suggestedPrompts={APP_SUGGESTED_PROMPTS}
        dataLabel={dataLabel}
        payload={usagePayload}
      />
    </>
  );
};

export default AppUsageDrawer;
