import React, { useMemo } from 'react';
import ReportsPieChart from './ReportsPieChart';
import { ReportUsageEvent } from '../../../types/reportUsageTypes';

const ENTRY_COLORS = ['#6366f1', '#f59e0b', '#10b981'];

interface Props {
  events: ReportUsageEvent[];
  onSegmentClick?: (entryPoint: string) => void;
}

const ReportsEntryPointChart: React.FC<Props> = ({ events, onSegmentClick }) => {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of events) {
      const ep = e.context.entryPoint || 'Unknown';
      counts[ep] = (counts[ep] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [events]);

  return (
    <ReportsPieChart
      data={data}
      title="By Entry Point"
      colors={ENTRY_COLORS}
      onSegmentClick={onSegmentClick}
      emptyMessage="No entry point data available"
    />
  );
};

export default ReportsEntryPointChart;
