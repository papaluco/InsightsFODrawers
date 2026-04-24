import React, { useState, useRef, useEffect } from 'react';
import { UnifiedReport } from '../../data/ReportTypes';
import { DistributeNowButton } from './DistributeNowButton';
import { 
  ViewIcon, 
  ReportIcon, 
  EmailIcon,
  MoreVerticalIcon 
} from '../Common/Icons';

interface Props {
  report: UnifiedReport;
  onViewHistory: (id: string, name: string) => void;
  // New prop to trigger the Config Drawer
  onViewConfig: (report: UnifiedReport) => void;
  onDistributeReport: (report: UnifiedReport) => void; // Add this line
}

const ReportActionMenu: React.FC<Props> = ({ report, onViewHistory, onViewConfig, onDistributeReport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper to handle History click and close menu
  const handleHistoryClick = () => {
    onViewHistory(report.id, report.name);
    setIsOpen(false);
  };

  // Helper to handle Config click and close menu
  const handleConfigClick = () => {
    onViewConfig(report);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={`Actions for ${report.name}`}
      >
        <MoreVerticalIcon size={16} />
      </button>

      {isOpen && (
        <div 
          className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 focus:outline-none"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1" role="none">
            
            {/* 1. Configuration View - UPDATED ONCLICK */}
            <button
              onClick={handleConfigClick}
              className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              role="menuitem"
            >
              <ViewIcon className="mr-3 text-gray-400 group-hover:text-blue-600" size={16} />
              View Configuration
            </button>

            {/* 2. Recent Reports (History) */}
            <button
              onClick={handleHistoryClick}
              className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              role="menuitem"
            >
              <ReportIcon className="mr-3 text-gray-400 group-hover:text-blue-600" size={16} />
              View Recent Reports
            </button>

            {/* 3. Email Now */}
            <button
              className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              role="menuitem"
            >
              <EmailIcon className="mr-3 text-gray-400 group-hover:text-blue-600" size={16} />
              Email Now
            </button>

            {/* 4. Distribute Now */}
            <DistributeNowButton onClick={() => onDistributeReport(report)} reportName={report.name} variant="menu" />

          </div>
        </div>
      )}
    </div>
  );
};

export default ReportActionMenu;