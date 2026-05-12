import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { ErrorTelemetryEvent } from '../../../telemetry/types';
import { CAT_LABEL } from './errorHelpers';

interface Props {
  events: ErrorTelemetryEvent[];
}

const BAR_COLORS = [
  '#e11d48', '#f43f5e', '#fb7185', '#fda4af',
  '#fecdd3', '#ffe4e6', '#fff1f2', '#fef2f2',
];

const ErrorCategoryChart: React.FC<Props> = ({ events }) => {
  const counts: Record<string, number> = {};
  for (const e of events) {
    counts[e.errorCategory] = (counts[e.errorCategory] ?? 0) + 1;
  }

  const data = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, count]) => ({ name: CAT_LABEL[cat] ?? cat, value: count, cat }));

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex items-center justify-center h-64">
        <p className="text-sm text-gray-400">No errors in current filter</p>
      </div>
    );
  }

  const barHeight = Math.max(200, data.length * 36);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">By Category</h3>
      <ResponsiveContainer width="100%" height={barHeight}>
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 0, right: 24, bottom: 0, left: 140 }}
        >
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            width={135}
            tickLine={false}
            axisLine={false}
          />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            formatter={(v: number) => [v, 'Errors']}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={22}>
            {data.map((_, i) => (
              <Cell key={i} fill={BAR_COLORS[Math.min(i, BAR_COLORS.length - 1)]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ErrorCategoryChart;
