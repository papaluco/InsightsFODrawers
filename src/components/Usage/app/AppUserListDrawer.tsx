import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { AppUserStatRow } from '../../../types/appUsageTypes';
import { ChevronLeftIcon } from '../../Common/Icons';
import AppUserGrid from './AppUserGrid';
import { APP_ICONS, TAB_COLORS } from './appUsageHelpers';

interface Props {
  users: AppUserStatRow[];
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onUserClick?: (user: AppUserStatRow) => void;
  onSessionsClick?: (user: AppUserStatRow) => void;
  onEventsClick?: (user: AppUserStatRow) => void;
  isChildDrawerOpen?: boolean;
}

const AppUserListDrawer: React.FC<Props> = ({
  users,
  title,
  isOpen,
  onClose,
  onUserClick,
  onSessionsClick,
  onEventsClick,
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
      <div className="px-2 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors" title="Back">
            <ChevronLeftIcon size={20} />
          </button>

          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${TAB_COLORS.Users}1A` }}>
            <APP_ICONS.USER size={20} style={{ color: TAB_COLORS.Users }} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500">App usage users</p>
          </div>
        </div>

        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6">
        <div className="mb-4">
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest">
            {users.length.toLocaleString()} user{users.length !== 1 ? 's' : ''}
          </p>
        </div>

        <AppUserGrid
          data={users}
          onUserClick={onUserClick}
          onSessionsClick={onSessionsClick}
          onRowClick={onEventsClick}
        />
      </div>
    </div>
  );
};

export default AppUserListDrawer;