import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { MenuUserStatRow } from '../../../types/menuUsageTypes';
import { ChevronLeftIcon } from '../../Common/Icons';
import { TAB_COLORS, USAGE_ICONS } from '../common/usageHelpers';
import MenuUsersGrid from './MenuUsersGrid';

interface Props {
  users: MenuUserStatRow[];
  title: string;
  isOpen: boolean;
  onClose: () => void;
  isChildDrawerOpen?: boolean;
  onUserClick?: (user: MenuUserStatRow) => void;
  onSessionsClick?: (user: MenuUserStatRow) => void;
  onPageViewsClick?: (user: MenuUserStatRow) => void;
  onInteractionsClick?: (user: MenuUserStatRow) => void;
  onMenuItemsClick?: (user: MenuUserStatRow) => void;
  onSchoolPerfClick?: (user: MenuUserStatRow) => void;
}

const MenuUserListDrawer: React.FC<Props> = ({
  users,
  title,
  isOpen,
  onClose,
  isChildDrawerOpen = false,
  onUserClick,
  onSessionsClick,
  onPageViewsClick,
  onInteractionsClick,
  onMenuItemsClick,
  onSchoolPerfClick,
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
    <div
      className={`fixed inset-0 bg-white z-[52] flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="px-8 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
            title="Back"
          >
            <ChevronLeftIcon size={20} />
          </button>

          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${TAB_COLORS.Users}1A` }}
          >
            <USAGE_ICONS.User size={20} style={{ color: TAB_COLORS.Users }} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500">Menu Analysis users</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6">
        <div className="mb-4">
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest">
            {users.length.toLocaleString()} user{users.length !== 1 ? 's' : ''}
          </p>
        </div>

        <MenuUsersGrid
          data={users}
          onUserClick={onUserClick}
          onSessionsClick={onSessionsClick}
          onPageViewsClick={onPageViewsClick}
          onInteractionsClick={onInteractionsClick}
          onMenuItemsClick={onMenuItemsClick}
          onSchoolPerfClick={onSchoolPerfClick}
        />
      </div>
    </div>
  );
};

export default MenuUserListDrawer;
