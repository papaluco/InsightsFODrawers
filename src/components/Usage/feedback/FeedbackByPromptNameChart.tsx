import React, { useMemo } from 'react';
import { FeedbackRecord } from '../../../types/feedbackTypes';
import FeedbackPieChart, { PieDataItem } from './FeedbackPieChart';
import { getPromptName } from './feedbackHelpers';

interface Props {
  data: FeedbackRecord[];
  onSegmentClick?: (promptName: string) => void;
}

const FeedbackByPromptNameChart: React.FC<Props> = ({ data, onSegmentClick }) => {
  const chartData = useMemo<PieDataItem[]>(() => {
    const map = new Map<string, { helpful: number; notHelpful: number }>();
    data.forEach(r => {
      const key = getPromptName(r);
      const cur = map.get(key) ?? { helpful: 0, notHelpful: 0 };
      if (r.feedbackValue === 'thumbs_up') cur.helpful++;
      else cur.notHelpful++;
      map.set(key, cur);
    });
    const sorted = [...map.entries()]
      .map(([name, counts]) => ({
        name,
        value: counts.helpful + counts.notHelpful,
        helpful: counts.helpful,
        notHelpful: counts.notHelpful,
      }))
      .sort((a, b) => b.value - a.value);

    const top5 = sorted.slice(0, 5);
    const rest = sorted.slice(5);
    if (rest.length > 0) {
      top5.push({
        name: 'Other',
        value: rest.reduce((s, r) => s + r.value, 0),
        helpful: rest.reduce((s, r) => s + r.helpful, 0),
        notHelpful: rest.reduce((s, r) => s + r.notHelpful, 0),
      });
    }
    return top5;
  }, [data]);

  const handleClick = onSegmentClick
    ? (name: string) => { if (name !== 'Other') onSegmentClick(name); }
    : undefined;

  return (
    <FeedbackPieChart
      data={chartData}
      title="Feedback by Prompt Name"
      onSegmentClick={handleClick}
    />
  );
};

export default FeedbackByPromptNameChart;
