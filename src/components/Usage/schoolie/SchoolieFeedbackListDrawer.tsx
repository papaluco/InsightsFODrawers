import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { FeedbackRecord } from '../../../types/feedbackTypes';
import { TAB_COLORS, USAGE_ICONS } from '../common/usageHelpers';
import { ChevronLeftIcon } from '../../Common/Icons';
import SchoolieFeedbackGrid from './SchoolieFeedbackGrid';
import SchoolieFeedbackDetail from './SchoolieFeedbackDetail';

interface Props {
  records: FeedbackRecord[];
  title: string;
  isOpen: boolean;
  onClose: () => void;
  zIndex?: number;
  isTopmost?: boolean;
  onUserClick?: (userId: string) => void;
  onDistrictClick?: (districtId: string) => void;
}

const SchoolieFeedbackListDrawer: React.FC<Props> = ({
  records,
  title,
  isOpen,
  onClose,
  zIndex = 52,
  isTopmost = true,
  onUserClick,
  onDistrictClick,
}) => {
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || !isOpen || !isTopmost) return;
      e.preventDefault();
      e.stopPropagation();
      onClose();
    };
    window.addEventListener('keydown', h, true);
    return () => window.removeEventListener('keydown', h, true);
  }, [isOpen, isTopmost, onClose]);

  return (
    <div
      className={`fixed inset-0 bg-white flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      style={{ zIndex }}
    >
      <div className="px-8 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors" title="Back">
            <ChevronLeftIcon size={20} />
          </button>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${TAB_COLORS.SchoolieFeedback}1A` }}>
            <USAGE_ICONS.SchoolieFeedback size={20} style={{ color: TAB_COLORS.SchoolieFeedback }} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500">Schoolie AI feedback</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 px-8 py-6">
        <SchoolieFeedbackGrid
          records={records}
          onUserClick={onUserClick}
          onDistrictClick={onDistrictClick}
          onFeedbackDetailClick={r => { setSelectedFeedback(r); setIsDetailOpen(true); }}
        />
      </div>

      <SchoolieFeedbackDetail
        record={selectedFeedback}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </div>
  );
};

export default SchoolieFeedbackListDrawer;
