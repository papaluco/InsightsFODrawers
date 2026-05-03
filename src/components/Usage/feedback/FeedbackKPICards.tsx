import React from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import { FeedbackRecord } from '../../../types/schoolieFeedbackTypes';
import FeedbackKPICard from './FeedbackKPICard';
import { pct } from './feedbackHelpers';

interface Props {
  data: FeedbackRecord[];
  onDrillAll: () => void;
  onDrillHelpful: () => void;
  onDrillNotHelpful: () => void;
}

const FeedbackKPICards: React.FC<Props> = ({ data, onDrillAll, onDrillHelpful, onDrillNotHelpful }) => {
  const total = data.length;
  const helpful = data.filter(r => r.feedbackValue === 'thumbs_up').length;
  const notHelpful = total - helpful;

  return (
    <div className="flex justify-center gap-4 mb-6">
      <div className="w-52">
        <FeedbackKPICard
          label="Total Feedback"
          value={total}
          icon={<MessageSquare size={22} />}
          colorClass="bg-indigo-50 text-indigo-600"
          onClick={onDrillAll}
        />
      </div>
      <div className="w-52">
        <FeedbackKPICard
          label="Helpful"
          value={helpful}
          subtitle={pct(helpful, total)}
          icon={<ThumbsUp size={22} />}
          colorClass="bg-green-50 text-green-600"
          onClick={onDrillHelpful}
        />
      </div>
      <div className="w-52">
        <FeedbackKPICard
          label="Not Helpful"
          value={notHelpful}
          subtitle={pct(notHelpful, total)}
          icon={<ThumbsDown size={22} />}
          colorClass="bg-red-50 text-red-500"
          onClick={onDrillNotHelpful}
        />
      </div>
    </div>
  );
};

export default FeedbackKPICards;
