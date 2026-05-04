import React, { useEffect, useMemo, useState } from 'react';
import { X, ThumbsUp, Database } from 'lucide-react';
import SchoolieFeedbackDashboard from './feedback/SchoolieFeedbackDashboard';
import SchoolieFeedbackChatDrawer from './feedback/SchoolieFeedbackChatDrawer';
import { FeedbackRecord } from '../../types/schoolieFeedbackTypes';
import { getAllFeedback } from '../../services/schoolieFeedbackService';
import { DashboardFilters, DEFAULT_FILTERS, applyFilters } from './feedback/feedbackHelpers';
import { SchoolieIcon } from '../Common/Icons';
import { ExportMenu } from '../Downloading/ExportMenu/ExportMenu';
import { PDFDashExpButton } from '../Downloading/PDFGen/PDFDashExpButton';
import { prepareFeedbackDashPDFData } from '../Downloading/PDFGen/adapters/PDFFeedbackDashAdapter';
import { CSVFeedbackDashAdapter } from '../Downloading/CSVGen/adapters/csvFeedbackDashAdapter';
import { CSVRenderer } from '../Downloading/CSVGen/CSVRenderer';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  showAIAssistant?: boolean;
}

const SchoolieFeedbackUsageDrawer: React.FC<Props> = ({ isOpen, onClose, showAIAssistant = true }) => {
  const [allData, setAllData] = useState<FeedbackRecord[]>([]);
  const [filters, setFilters] = useState<DashboardFilters>({ ...DEFAULT_FILTERS });
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Outer drawer Escape — only fires when chat is NOT open (chat Escape intercepts first)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isChatOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isChatOpen, onClose]);

  useEffect(() => {
    if (isOpen) getAllFeedback().then(setAllData);
  }, [isOpen]);

  // Close chat and reset filter state when outer drawer closes
  useEffect(() => {
    if (!isOpen) {
      setIsChatOpen(false);
      setFilters({ ...DEFAULT_FILTERS });
    }
  }, [isOpen]);

  const filteredData = useMemo(() => applyFilters(allData, filters), [allData, filters]);

  const pdfData = useMemo(() => prepareFeedbackDashPDFData(allData), [allData]);

  const handleCsvDownload = () => {
    CSVRenderer(CSVFeedbackDashAdapter(allData));
  };

  return (
    <>
      <div className={`fixed inset-0 bg-white z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="px-8 py-5 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <ThumbsUp size={20} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Schoolie Feedback Dashboard</h2>
              <p className="text-xs text-gray-500">AI feedback ratings, response quality, and prompt performance</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <ExportMenu>
              <div className="px-4 py-1.5 bg-slate-50 border-b border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Visual Report</p>
              </div>
              <PDFDashExpButton data={pdfData} />
              <div className="px-4 py-1.5 bg-slate-50 border-y border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Data Exports</p>
              </div>
              <div
                onClick={handleCsvDownload}
                className="flex items-center px-4 py-3 text-sm transition-colors cursor-pointer hover:bg-slate-50 group border-t border-slate-100 bg-slate-50/50"
              >
                <Database size={18} className="mr-3 text-slate-400 group-hover:text-blue-500 flex-shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="font-bold text-slate-700">Full Raw Data (.csv)</span>
                  <span className="text-[10px] text-slate-400 italic">Download all underlying data</span>
                </div>
              </div>
            </ExportMenu>

            {showAIAssistant && (
              <button
                onClick={() => setIsChatOpen(true)}
                className="flex items-center px-3 py-1.5 text-gray-700 hover:text-indigo-600 transition-all group"
                title="Open Schoolie Analysis"
              >
                <SchoolieIcon size={52} />
              </button>
            )}

            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6">
          {isOpen && (
            <SchoolieFeedbackDashboard
              allData={allData}
              filters={filters}
              onFiltersChange={setFilters}
            />
          )}
        </div>
      </div>

      {/* Schoolie chat — renders above the main drawer */}
      <SchoolieFeedbackChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        filteredData={filteredData}
        filters={filters}
      />
    </>
  );
};

export default SchoolieFeedbackUsageDrawer;
