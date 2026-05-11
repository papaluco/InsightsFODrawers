import React, { useCallback, useEffect, useState } from 'react';
import { X, UtensilsCrossed } from 'lucide-react';
import MenuUsageDashboard from './menu/MenuUsageDashboard';
import SchoolieUsageChatDrawer from './common/SchoolieUsageChatDrawer';
import { SchoolieIcon } from '../Common/Icons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const MENU_SYSTEM_PROMPT = `You are an expert product analyst reviewing usage data for the Menu Analysis feature.
Your goal is to identify how users are engaging with Menu Analysis, including whether they are simply viewing the page or actively exploring menu item and school performance data.
Analyze: Overall adoption and engagement, Drawer usage between Menu Items and School Performance, Metric selection behavior, Filter usage behavior, User and district usage patterns, Signs of shallow usage versus meaningful exploration.
Focus on interpreting patterns, not just restating counts. Be concise, clear, and actionable.`;

const MENU_SUGGESTED_PROMPTS = [
  'Are users engaging with Menu Analysis or just viewing it?',
  'Which drawer is used most?',
  'Which filters are users actually using?',
  'Which metrics are users analyzing most?',
  'Are users exploring menu items or school performance more?',
  'What improvements should we consider?',
];

const MenuAnalysisUsageDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
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
  const dataLabel = totalEvents > 0 ? `${totalEvents.toLocaleString()} events in current filter` : 'Menu Analysis usage data';

  return (
    <>
      <div
        className={`fixed inset-0 bg-white z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="px-8 py-5 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <UtensilsCrossed size={20} className="text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Menu Analysis Usage Dashboard</h2>
              <p className="text-xs text-gray-500">Drawer engagement, metric selection, filter usage, and adoption metrics</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center px-3 py-1.5 text-gray-700 hover:text-orange-600 transition-all"
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
          {isOpen && <MenuUsageDashboard onDataUpdate={handleDataUpdate} />}
        </div>
      </div>

      <SchoolieUsageChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        systemPrompt={MENU_SYSTEM_PROMPT}
        suggestedPrompts={MENU_SUGGESTED_PROMPTS}
        dataLabel={dataLabel}
        payload={usagePayload}
      />
    </>
  );
};

export default MenuAnalysisUsageDrawer;
