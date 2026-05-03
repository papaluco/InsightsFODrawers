import React, { useEffect, useMemo, useState } from 'react';
import { X, ThumbsUp, Database } from 'lucide-react';
import SchoolieFeedbackDashboard from './feedback/SchoolieFeedbackDashboard';
import { FeedbackRecord } from '../../types/schoolieFeedbackTypes';
import { getAllFeedback } from '../../services/schoolieFeedbackService';
import { ExportMenu } from '../Common/ExportMenu/ExportMenu';
import { PDFDashExpButton } from '../PDFGen/PDFDashExpButton';
import { prepareFeedbackDashPDFData } from '../PDFGen/adapters/PDFFeedbackDashAdapter';
import { CSVFeedbackDashAdapter } from '../CSVGen/adapters/csvFeedbackDashAdapter';
import { CSVRenderer } from '../CSVGen/CSVRenderer';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SchoolieFeedbackUsageDrawer: React.FC<Props> = ({ isOpen, onClose }) => {
  const [allData, setAllData] = useState<FeedbackRecord[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) getAllFeedback().then(setAllData);
  }, [isOpen]);

  const pdfData = useMemo(() => prepareFeedbackDashPDFData(allData), [allData]);

  const handleCsvDownload = () => {
    CSVRenderer(CSVFeedbackDashAdapter(allData));
  };

  return (
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

          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6">
        {isOpen && <SchoolieFeedbackDashboard allData={allData} />}
      </div>
    </div>
  );
};

export default SchoolieFeedbackUsageDrawer;
