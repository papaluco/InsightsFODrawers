import React, { useMemo } from 'react';
import { FeedbackRecord } from '../../../types/schoolieFeedbackTypes';
import FeedbackPieChart, { PieDataItem } from './FeedbackPieChart';
import { getReasonDisplay } from './feedbackHelpers';

const REASON_COLORS = ['#ef4444', '#f59e0b', '#6366f1', '#8b5cf6', '#3b82f6', '#6b7280'];

interface Props {
  data: FeedbackRecord[];
  onSegmentClick?: (reasonCode: string) => void;
}

const FeedbackReasonsChart: React.FC<Props> = ({ data, onSegmentClick }) => {
  const chartData = useMemo<(PieDataItem & { _code: string })[]>(() => {
    const map = new Map<string, number>();
    data
      .filter(r => r.feedbackValue === 'thumbs_down')
      .forEach(r => {
        (r.reasonCodes ?? []).forEach(code => {
          map.set(code, (map.get(code) ?? 0) + 1);
        });
      });
    const entries = [...map.entries()].sort((a, b) => b[1] - a[1]);
    const totalReasons = entries.reduce((sum, [, c]) => sum + c, 0);
    return entries.map(([code, count]) => ({
      name: getReasonDisplay(code),
      value: count,
      helpful: 0,
      notHelpful: count,
      pctLabel: totalReasons > 0 ? `${Math.round((count / totalReasons) * 100)}% neg` : '—',
      _code: code,
    }));
  }, [data]);

  const handleClick = onSegmentClick
    ? (displayName: string) => {
        const entry = chartData.find(d => d.name === displayName);
        if (entry) onSegmentClick(entry._code);
      }
    : undefined;

  return (
    <FeedbackPieChart
      data={chartData}
      title="Negative Feedback Reasons"
      colors={REASON_COLORS}
      onSegmentClick={handleClick}
      emptyMessage="No negative feedback reasons recorded"
    />
  );
};

export default FeedbackReasonsChart;
