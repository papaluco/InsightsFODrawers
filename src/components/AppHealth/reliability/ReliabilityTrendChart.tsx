import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { SeverityTrend } from '../../../services/reliabilityService';

interface Props {
  data: SeverityTrend[];
}

const COLORS = {
  critical: '#e11d48',
  high:     '#f97316',
  medium:   '#fbbf24',
  low:      '#d1d5db',
};

const ReliabilityTrendChart: React.FC<Props> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center justify-center h-48">
        <p className="text-sm text-gray-400">No data</p>
      </div>
    );
  }

  const displayed = data.slice(-30);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Error Severity Trend (Last 30 days)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={displayed} margin={{ left: 0, right: 8, top: 4, bottom: 4 }}>
          <defs>
            {(['critical', 'high', 'medium', 'low'] as const).map(sev => (
              <linearGradient key={sev} id={`grad-${sev}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={COLORS[sev]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS[sev]} stopOpacity={0.0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            tickFormatter={d => {
              const [, m, day] = d.split('-');
              return `${parseInt(m)}/${parseInt(day)}`;
            }}
          />
          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} width={24} />
          <Tooltip
            labelFormatter={label => `Date: ${label}`}
            contentStyle={{ fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {(['critical', 'high', 'medium', 'low'] as const).map(sev => (
            <Area
              key={sev}
              type="monotone"
              dataKey={sev}
              stroke={COLORS[sev]}
              fill={`url(#grad-${sev})`}
              strokeWidth={sev === 'critical' ? 2 : 1.5}
              dot={false}
              name={sev.charAt(0).toUpperCase() + sev.slice(1)}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ReliabilityTrendChart;
