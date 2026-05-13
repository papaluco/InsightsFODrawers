import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { AppSessionStatRow } from '../../../types/appUsageTypes';
import { ChevronLeftIcon } from '../../Common/Icons';
import AppSessionGrid from './AppSessionGrid';
import { TAB_COLORS, USAGE_ICONS } from '../common/usageHelpers';

interface Props {
  sessions: AppSessionStatRow[];
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSessionClick?: (session: AppSessionStatRow) => void;
  onEventsClick?: (session: AppSessionStatRow) => void;
  onUserClick?: (session: AppSessionStatRow) => void;
  onDistrictClick?: (session: AppSessionStatRow) => void;
  isChildDrawerOpen?: boolean;
}

const AppSessionListDrawer: React.FC<Props> = ({
  sessions,
  title,
  isOpen,
  onClose,
  onSessionClick,
  onEventsClick,
  onUserClick,
  onDistrictClick,
  isChildDrawerOpen = false,
}) => {
  useEffect(() => {
  const h = (e: KeyboardEvent) => {
    if (e.key !== 'Escape' || !isOpen) return;
    if (isChildDrawerOpen) return;

    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  window.addEventListener('keydown', h, true);
  return () => window.removeEventListener('keydown', h, true);
}, [isOpen, isChildDrawerOpen, onClose]);

  return (
    <div className={`fixed inset-0 bg-white z-[52] flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="px-8 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors" title="Back">
            <ChevronLeftIcon size={20} />
          </button>

          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${TAB_COLORS.Sessions}1A` }}>
            <USAGE_ICONS.Sessions size={20} style={{ color: TAB_COLORS.Sessions }} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500">App usage sessions</p>
          </div>
        </div>

        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6">
        <div className="mb-4">
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest">
            {sessions.length.toLocaleString()} session{sessions.length !== 1 ? 's' : ''}
          </p>
        </div>

        <AppSessionGrid
          data={sessions}
          onRowClick={onSessionClick}
          onEventsClick={onEventsClick}
          onUserClick={onUserClick}
          onDistrictClick={onDistrictClick}
        />
      </div>
    </div>
  );
};

export default AppSessionListDrawer;