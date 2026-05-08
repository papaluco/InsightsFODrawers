import React, { useEffect } from 'react';
import { X, Building2 } from 'lucide-react';
import { AppDistrictStatRow } from '../../../types/appUsageTypes';
import { ChevronLeftIcon } from '../../Common/Icons';
import AppDistrictGrid from './AppDistrictGrid';

interface Props {
  districts: AppDistrictStatRow[];
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onDistrictClick?: (district: AppDistrictStatRow) => void;
  onUsersClick?: (district: AppDistrictStatRow) => void;
  onSessionsClick?: (district: AppDistrictStatRow) => void;
}

const AppDistrictListDrawer: React.FC<Props> = ({
  districts,
  title,
  isOpen,
  onClose,
  onDistrictClick,
  onUsersClick,
  onSessionsClick,
}) => {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !isOpen) return;

      e.preventDefault();
      e.stopPropagation();
      onClose();
    };

    window.addEventListener('keydown', h, true);
    return () => window.removeEventListener('keydown', h, true);
  }, [isOpen, onClose]);

  return (
    <div className={`fixed inset-0 bg-white z-[52] flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="px-8 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors" title="Back">
            <ChevronLeftIcon size={20} />
          </button>

          <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
            <Building2 size={20} className="text-teal-600" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500">App usage districts</p>
          </div>
        </div>

        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6">
        <div className="mb-4">
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest">
            {districts.length.toLocaleString()} district{districts.length !== 1 ? 's' : ''}
          </p>
        </div>

        <AppDistrictGrid
          data={districts}
          onRowClick={onDistrictClick}
          onUsersClick={onUsersClick}
          onSessionsClick={onSessionsClick}
        />
      </div>
    </div>
  );
};

export default AppDistrictListDrawer;