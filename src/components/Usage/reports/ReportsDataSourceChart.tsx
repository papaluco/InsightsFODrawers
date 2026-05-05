import React, { useMemo } from 'react';
import ReportsPieChart from './ReportsPieChart';
import { ReportUsageEvent } from '../../../types/reportUsageTypes';

const DATA_SOURCE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

interface Props {
  events: ReportUsageEvent[];
  onSegmentClick?: (dataSource: string) => void;
}

const ReportsDataSourceChart: React.FC<Props> = ({ events, onSegmentClick }) => {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of events) {
      const ds = e.context.dataSource || 'Unknown';
      counts[ds] = (counts[ds] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [events]);

  return (
    <ReportsPieChart
      data={data}
      title="By Data Source"
      colors={DATA_SOURCE_COLORS}
      onSegmentClick={onSegmentClick}
      emptyMessage="No data source information available"
    />
  );
};

export default ReportsDataSourceChart;
