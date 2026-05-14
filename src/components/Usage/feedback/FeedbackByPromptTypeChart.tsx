import React, { useMemo } from 'react';
import { FeedbackRecord } from '../../../types/feedbackTypes';
import FeedbackPieChart, { PieDataItem } from './FeedbackPieChart';
import { getPromptTypeDisplay } from './feedbackHelpers';

interface Props {
  data: FeedbackRecord[];
  onSegmentClick?: (promptType: string) => void;
}

const FeedbackByPromptTypeChart: React.FC<Props> = ({ data, onSegmentClick }) => {
  const chartData = useMemo<PieDataItem[]>(() => {
    const map = new Map<string, { helpful: number; notHelpful: number }>();
    data.forEach(r => {
      const key = r.sourceEntryPoint;
      const cur = map.get(key) ?? { helpful: 0, notHelpful: 0 };
      if (r.feedbackValue === 'thumbs_up') cur.helpful++;
      else cur.notHelpful++;
      map.set(key, cur);
    });
    return [...map.entries()].map(([key, counts]) => ({
      name: getPromptTypeDisplay(key),
      value: counts.helpful + counts.notHelpful,
      helpful: counts.helpful,
      notHelpful: counts.notHelpful,
      _key: key,
    })).sort((a, b) => b.value - a.value);
  }, [data]);

  const handleClick = onSegmentClick
    ? (displayName: string) => {
        const entry = (chartData as (PieDataItem & { _key: string })[]).find(d => d.name === displayName);
        if (entry) onSegmentClick(entry._key);
      }
    : undefined;

  return (
    <FeedbackPieChart
      data={chartData}
      title="Feedback by Prompt Type"
      onSegmentClick={handleClick}
    />
  );
};

export default FeedbackByPromptTypeChart;
