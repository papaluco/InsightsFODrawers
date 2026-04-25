import React, { useState } from 'react';
import { EmailIcon } from '../Common/Icons';
import { EmailModal } from './EmailModal';
import { ReportSource } from '../../data/ReportTypes';

interface EmailReportActionProps {
  variant?: 'card' | 'list'; // Aligned with your Distribute logic
  reportInfo: {
    name: string;
    reportType?: ReportSource;
  };
}

export const EmailReportAction: React.FC<EmailReportActionProps> = ({ variant = 'card', reportInfo }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection/navigation
    setIsModalOpen(true);
  };

  return (
    <>
      {/* 1. CONDITIONAL TRIGGER UI - Matching Distribute Style */}
      {variant === 'card' ? (
        <button 
          onClick={handleOpen}
          className="flex items-center gap-1.5 text-slate-600 hover:text-indigo-600 transition-colors group"
        >
          <EmailIcon size={14} className="group-hover:stroke-[3px]" />
          <span className="text-[10px] font-bold uppercase tracking-tight">Email</span>
        </button>
      ) : (
        <button
          onClick={handleOpen}
          className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          role="menuitem"
        >
          <EmailIcon className="mr-3 text-gray-400 group-hover:text-blue-600" size={16} />
          Email Report
        </button>
      )}

      {/* 2. MODAL COMPONENT */}
      <EmailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        reportInfo={reportInfo}
      />
    </>
  );
};