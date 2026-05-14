import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { SchoolieSessionStatRow } from '../../../types/schoolieUsageTypes';
import { ChevronLeftIcon } from '../../Common/Icons';
import SchoolieSessionGrid from './SchoolieSessionGrid';
import SchoolieSessionDetailDrawer from './SchoolieSessionDetailDrawer';
import { TAB_COLORS, USAGE_ICONS } from '../common/usageHelpers';

interface Props {
  sessions: SchoolieSessionStatRow[];
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSessionClick?: (session: SchoolieSessionStatRow) => void;
  onUserClick?: (session: SchoolieSessionStatRow) => void;
  onDistrictClick?: (session: SchoolieSessionStatRow) => void;
  isChildDrawerOpen?: boolean;
}

const SchoolieSessionListDrawer: React.FC<Props> = ({
  sessions,
  title,
  isOpen,
  onClose,
  onSessionClick,
  onUserClick,
  onDistrictClick,
  isChildDrawerOpen = false,
}) => {
  const [selectedSession, setSelectedSession] = useState<SchoolieSessionStatRow | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const isAnyChildOpen = isChildDrawerOpen || isDetailOpen;

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !isOpen) return;
      if (isAnyChildOpen) return;
      e.preventDefault();
      e.stopPropagation();
      onClose();
    };
    window.addEventListener('keydown', h, true);
    return () => window.removeEventListener('keydown', h, true);
  }, [isOpen, isAnyChildOpen, onClose]);

  const handleSessionClick = (session: SchoolieSessionStatRow) => {
    if (onSessionClick) {
      onSessionClick(session);
    } else {
      setSelectedSession(session);
      setIsDetailOpen(true);
    }
  };

  return (
    <>
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
              <p className="text-xs text-gray-500">Schoolie AI sessions</p>
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
          <SchoolieSessionGrid
            data={sessions}
            onRowClick={handleSessionClick}
            onUserClick={onUserClick}
            onDistrictClick={onDistrictClick}
          />
        </div>
      </div>

      <SchoolieSessionDetailDrawer
        session={selectedSession}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        zIndex={62}
        isTopmost={isDetailOpen}
      />
    </>
  );
};

export default SchoolieSessionListDrawer;
